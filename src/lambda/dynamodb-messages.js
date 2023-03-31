// messages.js
import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const messageTableName = process.env.MESSAGE_TABLE_NAME;
const phrasesTableName = process.env.PHRASES_TABLE_NAME;

export const savePhraseToDynamoDB = async (userId, phrase, note) => {
    const timestamp = Date.now();
    const params = {
        TableName: phrasesTableName,
        Item: {
            userId,
            phrase,
            note,
        },
    };
    await dynamoDB.put(params).promise();
}

export const saveMessageToDynamoDB = async (userId, message) => {
    const timestamp = Date.now();
    const params = {
        TableName: messageTableName,
        Item: {
            userId,
            timestamp,
            message,
        },
    };
    await dynamoDB.put(params).promise();
};

export const getPreviousMessages = async (userId) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    const params = {
        TableName: messageTableName,
        KeyConditionExpression: 'userId = :userId AND #ts >= :timestamp',
        ExpressionAttributeValues: {
            ':userId': userId,
            ':timestamp': oneHourAgo,
        },
        ExpressionAttributeNames: {
            '#ts': 'timestamp',
        },
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items.sort((a, b) => a.timestamp - b.timestamp);
};
