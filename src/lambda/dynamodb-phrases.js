import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.PHRASES_TABLE_NAME;

export const savePhraseToDynamoDB = async (userId, phrase, note) => {
    const timestamp = Date.now();
    const params = {
        TableName: tableName,
        Item: {
            userId,
            phrase,
            note,
            timestamp,
        },
    };
    await dynamoDB.put(params).promise();
};