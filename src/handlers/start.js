export function startHandler(ctx) {
  ctx.reply(
    `Welcome! I'm your Telegram bot running on Node.js.\n\nCommands:\n/start — This message\n/help — Show help\n/info — Bot info\n/etf — Indian ETF prices\n/dailydev — Latest tech headlines\n/morning — ETF prices + tech headlines\n/subscribe — Get daily morning briefing\n/unsubscribe — Stop daily briefing`
  )
}
