export function helpHandler(ctx) {
  ctx.reply(
    `Available commands:\n` +
    `/start — Start the bot\n` +
    `/help — Show this help\n` +
    `/info — About this bot\n\n` +
    `Just send any text and I'll echo it back.`
  )
}
