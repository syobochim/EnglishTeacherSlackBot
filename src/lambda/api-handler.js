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
    const params = {
        TableName: tableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId,
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
        messages: messages,
    });

    console.log("response: ", response.data.choices[0].message);
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
