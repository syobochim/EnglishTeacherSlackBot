// AWS Systems Manager サービスオブジェクトの作成
import AWS from "aws-sdk";

const ssm = new AWS.SSM();

export const getSecureString = async (parameterName) => {
    try {
        const response = await ssm.getParameter({
            Name: parameterName,
            WithDecryption: true
        }).promise();

        return  response.Parameter.Value;
    } catch (error) {
        console.error('Error retrieving SecureString:', error);
        throw error;
    }
};