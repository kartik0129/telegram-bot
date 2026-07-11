import express from 'express'
import { Telegraf } from 'telegraf'
import { config } from './config.js'
import { startHandler } from './handlers/start.js'
import { helpHandler } from './handlers/help.js'

const bot = new Telegraf(config.botToken)

bot.start(startHandler)
bot.help(helpHandler)
bot.command('info', (ctx) => ctx.reply('A simple Node.js Telegram bot using Telegraf.'))

bot.on('text', (ctx) => ctx.reply(`You said: ${ctx.message.text}`))
bot.on('sticker', (ctx) => ctx.reply('Nice sticker!'))

if (config.isWebhook) {
  const app = express()
  app.use(await bot.createWebhook({ domain: config.domain }))
  app.get('/', (_, res) => res.send('Bot is running'))
  app.listen(config.port, () => console.log(`Bot running via webhook on port ${config.port}`))
} else {
  bot.launch()
  console.log('Bot running via polling...')
}

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
