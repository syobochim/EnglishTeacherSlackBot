// messages.js
import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE_NAME;

export const saveMessageToDynamoDB = async (userId, message) => {
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

export const getPreviousMessages = async (userId) => {
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
