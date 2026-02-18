import { Client } from "pg";

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await db.connect();
  const { rows } = await db.query(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN language = 'en' THEN 1 END) as english,
      COUNT(CASE WHEN language = 'zh' THEN 1 END) as chinese,
      COUNT(CASE WHEN language IS NULL OR language = '' THEN 1 END) as no_lang,
      COUNT(CASE WHEN content_zh IS NULL OR content_zh = '' THEN 1 END) as no_translation
    FROM tweets
  `);
  console.log("推文统计:", rows[0]);

  const { rows: samples } = await db.query(`
    SELECT id, kol_username, language,
      LEFT(content, 50) as content_preview,
      LEFT(content_zh, 30) as content_zh_preview
    FROM tweets LIMIT 5
  `);
  console.log("\n样本数据:");
  samples.forEach(r => console.log(r));
  await db.end();
}

main().catch(console.error);
