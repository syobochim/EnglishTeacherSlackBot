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
        content: "日本語を英語に翻訳し、例文も教えてください。英語と例文は英語で、解説は日本語で教えてください。\
        英語はアメリカ英語を優先してください。 \
        回答は次のフォーマットで返してください。\
        【英語】 XXXXX \
        【解説】 XXXXX \
        【例文】 XXXXX "
    }
]