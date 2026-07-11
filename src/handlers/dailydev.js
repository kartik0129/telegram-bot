const DAILY_GRAPHQL = 'https://app.daily.dev/api/graphql'

const query = `
  query AnonymousFeed($first: Int, $ranking: Ranking, $version: Int) {
    page: anonymousFeed(first: $first, ranking: $ranking, version: $version) {
      edges {
        node {
          id
          title
          createdAt
          source { name }
          permalink
          numUpvotes
          tags
        }
      }
    }
  }
`

export async function dailydevHandler(ctx) {
  await ctx.reply('Fetching latest tech headlines...')

  try {
    const headlines = await fetchDailyDev()
    const lines = headlines.map((h, i) => {
      return `${i + 1}. *${h.title}*\n   📰 ${h.source}  |  👍 ${h.upvotes}  |  🏷️ ${h.tags}\n   ${h.url}`
    })

    const header = `🔥 *Latest from daily.dev*\n${new Date().toLocaleDateString('en-IN')}\n\n`
    await ctx.reply(header + lines.join('\n\n'), { parse_mode: 'Markdown' })
  } catch (err) {
    console.error('daily.dev fetch error:', err)
    await ctx.reply('Failed to fetch headlines. Please try again later.')
  }
}

export async function fetchDailyDev(count = 7) {
  const res = await fetch(DAILY_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { first: count, ranking: 'POPULARITY', version: 7 },
    }),
  })

  const { data } = await res.json()
  return data.page.edges.map(edge => {
    const n = edge.node
    return {
      title: n.title,
      source: n.source?.name || 'Unknown',
      upvotes: n.numUpvotes,
      tags: (n.tags || []).slice(0, 3).join(', '),
      url: n.permalink,
    }
  })
}
