// responseMessage.js
import {ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi} from 'openai';
import {systemMessagesForCorrection} from "./system-messages-for-correction.js";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const modelVersion = "gpt-3.5-turbo";

export const buildCorrectionResponseMessage = async (userId, previousMessages) => {
    const messages = previousMessages.map((msg) => {
        return { role: msg.message.role, content: msg.message.content };
    });

    const requestMessages = systemMessagesForCorrection.concat(messages);

    const response = await openai.createChatCompletion({
        model: modelVersion,
        messages: requestMessages,
    });

    return response.data.choices[0].message;
};

export const buildPhrasesMessage = async (userId, phrase, systemMessage) => {
    const phraseMessage = [{
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: phrase
    }];
    const requestMessages = systemMessage.concat(phraseMessage);
    const response = await openai.createChatCompletion({
        model: modelVersion,
        messages: requestMessages
    });
    return response.data.choices[0].message;
};