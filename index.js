import { Bot, webhookCallback } from 'grammy';
import express from 'express';
import { tiktokdl, facebookdlv2 } from '@bochilteam/scraper-sosmed';
import dotenv from 'dotenv';
dotenv.config();

const bot = new Bot(process.env.TELEGRAM_TOKEN || '');

bot.command('ping', (ctx) => ctx.reply('server uptime: ' + Math.round(process.uptime()) + 'ms'));

bot.command('download', async (ctx) => {
  try {
    const url = ctx.msg?.text?.split(' ')[1];
    if (url.startsWith('https://vt.tiktok.com/')) {
      const result = await tiktokdl(url);
      return ctx.replyWithVideo(result.video.no_watermark_hd);
    }

    if (url.startsWith('https://www.facebook.com/')) {
      const result = await facebookdlv2(url);
      return ctx.replyWithVideo(result.result[0].url);
    }
  } catch (error) {
    console.log(error.message);
  }
});

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: 'ping', description: 'Check server uptime' },
  {
    command: 'download',
    description: 'download tiktok video or anything',
  },
]);

// Handle all other messages and the /start command
const introductionMessage = `Hello! I'm a Telegram bot.
I'm powered by Cyclic, the next-generation serverless computing platform.

<b>Commands</b>
/ping - test server uptime
/download - download tiktok video or anything`;

const replyWithIntro = (ctx) =>
  ctx.reply(introductionMessage, {
    reply_markup: 'mbuh',
    parse_mode: 'HTML',
  });

bot.command('start', replyWithIntro);
bot.on('message', replyWithIntro);

// Start the server
if (process.env.NODE_ENV === 'production') {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, 'express'));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
