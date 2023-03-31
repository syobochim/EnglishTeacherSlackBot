import {ChatCompletionRequestMessageRoleEnum} from "openai";

export const SystemMessagesForPhrase = [
    {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: "英語を日本語に翻訳し、解説をしてください。解説は次のフォーマットで返してください。\
        【意味】 XXXXX \
        【解説】 \
        XXXXX "
    }
]