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

export const SystemMessagesForTranslate = [
    {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: "日本語を英語に翻訳し、例文も教えてください。英語はアメリカ英語を優先してください。\
        カジュアルかフォーマルか、日常で利用するかなど、英語の解説も日本語で教えてください。 \
        回答は次のフォーマットで返してください。\
        【英語】 XXXXX \
        【例文】 XXXXX \
        【解説】 XXXXX "
    }
]