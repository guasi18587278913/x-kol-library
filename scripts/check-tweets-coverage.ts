import { Client } from "pg";

async function main() {
  const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();

  // 总体分布
  const { rows: dist } = await db.query(`
    SELECT
      COUNT(*) FILTER (WHERE tweet_count = 0) as zero,
      COUNT(*) FILTER (WHERE tweet_count BETWEEN 1 AND 4) as "1_4",
      COUNT(*) FILTER (WHERE tweet_count BETWEEN 5 AND 9) as "5_9",
      COUNT(*) FILTER (WHERE tweet_count >= 10) as "10plus",
      COUNT(*) as total
    FROM (
      SELECT k.username, COUNT(t.id) as tweet_count
      FROM kols k
      LEFT JOIN tweets t ON t.kol_username = k.username
      GROUP BY k.username
    ) sub
  `);
  console.log("推文数量分布:", dist[0]);

  // 没有推文的 KOL
  const { rows: noTweets } = await db.query(`
    SELECT k.username, k.display_name
    FROM kols k
    LEFT JOIN tweets t ON t.kol_username = k.username
    GROUP BY k.username, k.display_name
    HAVING COUNT(t.id) = 0
    ORDER BY k.username
  `);
  console.log(`\n❌ 0 条推文的 KOL（${noTweets.length} 个）:`);
  noTweets.forEach(r => console.log(`  @${r.username} (${r.display_name})`));

  // 推文最多的 top 10
  const { rows: top } = await db.query(`
    SELECT k.username, COUNT(t.id) as cnt
    FROM kols k
    LEFT JOIN tweets t ON t.kol_username = k.username
    GROUP BY k.username
    ORDER BY cnt DESC
    LIMIT 10
  `);
  console.log("\n✅ 推文最多的 10 个 KOL:");
  top.forEach(r => console.log(`  @${r.username}: ${r.cnt} 条`));

  await db.end();
}

main().catch(console.error);
