'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const grammy_1 = require('grammy');
const express_1 = __importDefault(require('express'));
const scraper_sosmed_1 = require('@bochilteam/scraper-sosmed');
const cors_1 = __importDefault(require('cors'));
require('dotenv').config();
// Create a bot using the Telegram token
const bot = new grammy_1.Bot('6378892627:AAE2DeUeKNVs-NF0TyYg5iHhhRbySSJmuKk');
// when command is ping reply this servers ping ms
bot.command('ping', (ctx) => ctx.reply('server uptime: ' + Math.round(process.uptime()) + 'ms'));
bot.command('download', async (ctx) => {
  var _a, _b;
  try {
    const url = (_b = (_a = ctx.msg) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
    if (url.startsWith('https://vt.tiktok.com/')) {
      ctx.reply('Please wait...');
      const result = await (0, scraper_sosmed_1.tiktokdl)(url);
      return await ctx.reply(result.video.no_watermark_hd);
    }
    if (url.startsWith('https://www.facebook.com/')) {
      ctx.reply('Please wait...');
      const result = await (0, scraper_sosmed_1.facebookdlv2)(url);
      return await ctx.reply(result.result[0].url);
    }
  } catch (error) {
    console.log(error);
    return ctx.reply(error);
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
  const app = (0, express_1.default)();
  app.use(express_1.default.json());
  app.use((0, cors_1.default)());
  app.use((0, grammy_1.webhookCallback)(bot, 'express'));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
