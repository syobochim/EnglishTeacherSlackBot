import {ChatCompletionRequestMessageRoleEnum} from "openai";

export const systemMessagesForCorrection = [
    {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: "英語の文章に対して英語の添削をしてください。改善した文章と、添削のポイントを教えてください。"
    },
    {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: "単語の意味を聞かれたらそれに回答してください。"
    },
]