// handler.js
import { saveMessageToDynamoDB, getPreviousMessages } from './dynamodb-messages';
import { buildResponseMessage } from './openai-messages';
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {sendMessageToSlack, removeMentions} from "./send-slack.js";

export const handler = async (event) => {
    const body = JSON.parse(event.body)

    if (body.type === "url_verification") {
        return {
            statusCode: 200,
            body: body.challenge,
        };
    }
    if (event.headers['X-Slack-Retry-Num']) {
        console.log('Ignoring request with X-Slack-Retry-Num header:', event.headers['X-Slack-Retry-Num']);
        return {
            statusCode: 200,
            body: "Success",
        };
    }

    const userId = body.event.user;
    const message = removeMentions(body.event.text);

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

    await sendMessageToSlack(body, chatAPIResponse.content);

    return {
        statusCode: 200,
        body: "Success",
    };
};
