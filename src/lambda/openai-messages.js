// responseMessage.js
import {ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi} from 'openai';
import {systemMessagesForCorrection} from "./system-messages-for-correction.js";
import {getSecureString} from "./ssm-paramstore.js";

const modelVersion = "gpt-3.5-turbo";
const secretName = "openAiSecret";

export const buildCorrectionResponseMessage = async (userId, previousMessages) => {
    const openAISecret = await getSecureString(secretName);
    const configuration = new Configuration({
        apiKey: openAISecret,
    });
    const openai = new OpenAIApi(configuration);

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
    const openAISecret = await getSecureString(secretName);
    const configuration = new Configuration({
        apiKey: openAISecret,
    });
    const openai = new OpenAIApi(configuration);

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