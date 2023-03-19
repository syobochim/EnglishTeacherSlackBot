import { WebClient } from '@slack/web-api';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const web = new WebClient(SLACK_BOT_TOKEN);

export const removeMentions = (message) => {
    return message.replace(/<@[A-Za-z0-9]+>/g, "").trim();
};

export const sendMessageToSlack = async (body, chatResponse) => {
    const slackEvent = body.event;
    const channelId = slackEvent.channel;

    // メッセージ内容に基づいて処理を実行
    // 例: Chat APIを呼び出し、結果をチャンネルに送信
    await web.chat.postMessage({
        channel: channelId,
        text: chatResponse,
    });
};