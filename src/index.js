import express from 'express'
import { Telegraf } from 'telegraf'
import { config } from './config.js'
import { startHandler } from './handlers/start.js'
import { helpHandler } from './handlers/help.js'
import { etfHandler, getEtfData } from './handlers/etf.js'
import { dailydevHandler, fetchDailyDev } from './handlers/dailydev.js'

const bot = new Telegraf(config.botToken)

bot.start(startHandler)
bot.help(helpHandler)
bot.command('info', (ctx) => ctx.reply('A simple Node.js Telegram bot using Telegraf.'))
bot.command('etf', etfHandler)
bot.command('dailydev', dailydevHandler)

bot.command('morning', async (ctx) => {
  await ctx.reply('☀️ Preparing your morning briefing...')

  const etfText = await formatEtfBrief()
  await ctx.reply(etfText, { parse_mode: 'Markdown' })

  try {
    const headlines = await fetchDailyDev(5)
    const lines = headlines.map((h, i) =>
      `${i + 1}. *${h.title}* — ${h.source}`
    )
    await ctx.reply(
      `🔥 *Tech Headlines*\n${lines.join('\n')}`,
      { parse_mode: 'Markdown' }
    )
  } catch {
    await ctx.reply('⚠️ Could not fetch tech headlines.')
  }
})

bot.on('text', (ctx) => ctx.reply(`You said: ${ctx.message.text}`))
bot.on('sticker', (ctx) => ctx.reply('Nice sticker!'))

async function formatEtfBrief() {
  try {
    const { etfList, quotes } = await getEtfData()
    const now = new Date().toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
    const lines = [`📊 *ETF Snapshot — ${now}*\n`]
    for (let i = 0; i < etfList.length; i++) {
      const q = quotes[i]
      const change = q.regularMarketChangePercent
      const sign = change >= 0 ? '+' : ''
      lines.push(
        `${etfList[i].name}: ₹${q.regularMarketPrice.toFixed(2)} (${sign}${change.toFixed(2)}%)`
      )
    }
    return lines.join('\n')
  } catch {
    return '⚠️ Could not fetch ETF data.'
  }
}

async function sendDailyBriefing() {
  const etfText = await formatEtfBrief()
  const headlines = await fetchDailyDev(5)
  const newsLines = headlines.map((h, i) =>
    `${i + 1}. ${h.title} — ${h.source}\n   ${h.url}`
  )
  const fullText = `☀️ *Good Morning!*\n\n${etfText}\n\n🔥 *Tech Headlines*\n${newsLines.join('\n')}`
  return fullText
}

if (config.isWebhook) {
  const app = express()
  app.use(await bot.createWebhook({ domain: config.domain }))

  app.get('/', (_, res) => res.send('Bot is running'))

  app.get('/cron/daily', async (req, res) => {
    try {
      const message = await sendDailyBriefing()
      if (config.chatId) {
        await bot.telegram.sendMessage(config.chatId, message, { parse_mode: 'Markdown' })
        res.send('Daily briefing sent')
      } else {
        res.send('CHAT_ID not configured — set it to receive daily briefings')
      }
    } catch (err) {
      console.error('Cron error:', err)
      res.status(500).send('Failed to send briefing')
    }
  })

  app.listen(config.port, () => console.log(`Bot running via webhook on port ${config.port}`))
} else {
  bot.launch()
  console.log('Bot running via polling...')
}

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
