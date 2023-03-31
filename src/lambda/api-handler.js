// handler.js
import {saveMessageToDynamoDB, getPreviousMessages, savePhraseToDynamoDB} from './dynamodb-messages';
import {buildCorrectionResponseMessage, buildPhrasesMessage} from './openai-messages';
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

    // 単語メモの場合
    if (message.includes("Memo:")) {
        const phrase = message.replace("Memo:", "").trim();
        const openApiMessage = await buildPhrasesMessage(userId, phrase);
        const phraseNote = openApiMessage.content;
        await savePhraseToDynamoDB(userId, phrase, phraseNote);
        await sendMessageToSlack(body, phraseNote);
        return {
            statusCode: 200,
            body: "Success"
        }
    }

    await saveMessageToDynamoDB(userId, {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message
    });

    const previousMessages = await getPreviousMessages(userId);
    const chatAPIResponse = await buildCorrectionResponseMessage(userId, previousMessages);

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
