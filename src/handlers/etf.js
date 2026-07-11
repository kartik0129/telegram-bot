import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance()

const ETF_LIST = [
  { symbol: 'NIFTYBEES.NS', name: 'Nifty 50' },
  { symbol: 'BANKBEES.NS', name: 'Bank Nifty' },
  { symbol: 'JUNIORBEES.NS', name: 'Nifty Next 50' },
  { symbol: 'MON100.NS', name: 'Motilal Oswal S&P 500' },
  { symbol: 'GOLDBEES.NS', name: 'Gold' },
  { symbol: 'SILVERBEES.NS', name: 'Silver' },
]

function formatPrice(price) {
  return `₹${price.toFixed(2)}`
}

function formatChange(change, percent) {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`
}

function getMarketEmoji(marketState) {
  switch (marketState) {
    case 'PRE': return '🕐'
    case 'PREOPEN': return '🔓'
    case 'REGULAR': return '🟢'
    case 'POST': return '🔵'
    case 'CLOSED': return '🔴'
    default: return '⚪'
  }
}

export async function etfHandler(ctx) {
  await ctx.reply('Fetching ETF prices...')

  try {
    const symbols = ETF_LIST.map(e => e.symbol)
    const quotes = await yahooFinance.quote(symbols)

    const lines = quotes.map((q, i) => {
      const etf = ETF_LIST[i]
      const price = q.regularMarketPrice
      const change = q.regularMarketChange
      const changePct = q.regularMarketChangePercent
      const marketState = q.marketState || ''
      const emoji = getMarketEmoji(marketState)
      const low = q.regularMarketDayLow
      const high = q.regularMarketDayHigh
      return (
        `${emoji} *${etf.name}* (${q.symbol.replace('.NS', '')})\n` +
        `   Price: ${formatPrice(price)}\n` +
        `   Change: ${formatChange(change, changePct)}\n` +
        `   Day Range: ${formatPrice(low)} - ${formatPrice(high)}`
      )
    })

    const header = `📊 *Indian ETF Prices*\n${new Date().toLocaleDateString('en-IN')}\n\n`
    await ctx.reply(header + lines.join('\n\n'), { parse_mode: 'Markdown' })
  } catch (err) {
    console.error('ETF fetch error:', err)
    await ctx.reply('Failed to fetch ETF prices. Please try again later.')
  }
}

export async function getEtfData() {
  const symbols = ETF_LIST.map(e => e.symbol)
  const quotes = await yahooFinance.quote(symbols)
  return { etfList: ETF_LIST, quotes }
}
