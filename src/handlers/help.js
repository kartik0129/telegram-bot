export function helpHandler(ctx) {
  ctx.reply(
    `Available commands:\n` +
    `/start — Start the bot\n` +
    `/help — Show this help\n` +
    `/info — About this bot\n` +
    `/etf — Indian ETF prices (Nifty 50, Bank Nifty, Gold, etc.)\n` +
    `/dailydev — Latest tech headlines from daily.dev\n` +
    `/morning — ETF snapshot + tech headlines combo\n` +
    `/subscribe — Get daily morning briefing (ETF + news)\n` +
    `/unsubscribe — Stop receiving daily briefing\n\n` +
    `Just send any text and I'll echo it back.`
  )
}
