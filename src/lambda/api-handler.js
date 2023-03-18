// handler.js
import { saveMessageToDynamoDB, getPreviousMessages } from './dynamodb-messages';
import { buildResponseMessage } from './openai-messages';
import {ChatCompletionRequestMessageRoleEnum} from "openai";

export const handler = async (event) => {
    const body = JSON.parse(event.body)
    const userId = body.userId;
    const message = body.message;

    await saveMessageToDynamoDB(userId, {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message
    });

    const previousMessages = await getPreviousMessages(userId);
    const chatAPIResponse = await buildResponseMessage(userId, previousMessages);

    await saveMessageToDynamoDB(userId, {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: chatAPIResponse.content,
    });

    return {
        statusCode: 200,
        body: JSON.stringify(chatAPIResponse),
    };
};
