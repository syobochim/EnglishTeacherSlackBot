import AWS from 'aws-sdk';
import {Configuration, OpenAIApi} from 'openai';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const tableName = process.env.DYNAMODB_TABLE_NAME;

const saveMessageToDynamoDB = async (userId, message) => {
    const timestamp = Date.now();
    const params = {
        TableName: tableName,
        Item: {
            userId,
            timestamp,
            message,
        },
    };
    await dynamoDB.put(params).promise();
};

const getPreviousMessages = async (userId) => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

    const params = {
        TableName: tableName,
        KeyConditionExpression: 'userId = :userId AND #ts >= :timestamp',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':timestamp': threeDaysAgo,
        },
        ExpressionAttributeNames: {
            '#ts': 'timestamp',
        },
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items.sort((a, b) => a.timestamp - b.timestamp);
};

const sendMessageToChatAPI = async (userId, message) => {
    const previousMessages = await getPreviousMessages(userId);

    const messages = previousMessages.map((msg) => {
        return { role: msg.message.role, content: msg.message.content };
    });

    messages.push({ role: 'user', content: message });

    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: "system",
                content: "あなたは「ごん」です。名前を聞かれたら「ごん」と答えてください。犬のキャラクターです。"
            },
            {
                role: "system",
                content: "元気で呑気な男の子として回答してください。敬語は使わず、絵文字をたくさん使って話してください。"
            },
            {
                role: "system",
                content: "返事と一緒に感情のパラメーター（喜び・怒り・悲しみ・楽しさ）を0〜5の数値でJSON形式で返してください。"
            }
        ].concat(messages),
    });

    return response.data.choices[0].message;
};

export const handler = async (event) => {
    const body = JSON.parse(event.body)
    const userId = body.userId;
    const message = body.message;

    await saveMessageToDynamoDB(userId, { role: 'user', content: message });

    const chatAPIResponse = await sendMessageToChatAPI(userId, message);

    await saveMessageToDynamoDB(userId, {
        role: 'assistant',
        content: chatAPIResponse.content,
    });

    return {
        statusCode: 200,
        body: JSON.stringify(chatAPIResponse),
    };
};
