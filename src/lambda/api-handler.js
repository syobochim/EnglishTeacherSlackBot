// handler.js
import {saveMessageToDynamoDB, getPreviousMessages, savePhraseToDynamoDB} from './dynamodb-messages';
import {buildCorrectionResponseMessage, buildPhrasesMessage} from './openai-messages';
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {sendMessageToSlack, removeMentions} from "./send-slack.js";
import {SystemMessagesForPhrase, SystemMessagesForTranslate} from "./system-messages-for-phrase.js";

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
    const message = removeMentions(body.event.text).trim();

    let responseMessage;

    if (message.includes("Memo:")) {
        // 単語メモ
        const phrase = message.replace("Memo:", "").trim();
        const openApiMessage = await buildPhrasesMessage(userId, phrase, SystemMessagesForPhrase);
        responseMessage = openApiMessage.content;
        await savePhraseToDynamoDB(userId, phrase, responseMessage);
    } else if (message.startsWith("？")) {
        // 日本語訳
        const phrase = message.substring(1).trim();
        const openApiMessage = await buildPhrasesMessage(userId, phrase, SystemMessagesForTranslate);
        responseMessage = openApiMessage.content;
    } else {
        await saveMessageToDynamoDB(userId, {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: message
        });

        const previousMessages = await getPreviousMessages(userId);
        const chatAPIResponse = await buildCorrectionResponseMessage(userId, previousMessages);

        responseMessage =  chatAPIResponse.content
        await saveMessageToDynamoDB(userId, {
            role: ChatCompletionRequestMessageRoleEnum.Assistant,
            content:responseMessage,
        });
    }

    await sendMessageToSlack(body, responseMessage);

    return {
        statusCode: 200,
        body: "Success",
    };
};
