// responseMessage.js
import {Configuration, OpenAIApi} from 'openai';
import {systemMessages} from "./system-messages.js";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const buildResponseMessage = async (userId, previousMessages) => {
    const messages = previousMessages.map((msg) => {
        return { role: msg.message.role, content: msg.message.content };
    });

    const requestMessages = systemMessages.concat(messages);
    console.log("requestMessages: ", requestMessages);

    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: requestMessages,
    });

    return response.data.choices[0].message;
};
