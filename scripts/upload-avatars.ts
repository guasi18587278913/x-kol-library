/**
 * 从 unavatar.io 下载 KOL 头像并上传到腾讯云 COS
 *
 * 运行前需要设置环境变量：
 *   COS_SECRET_ID, COS_SECRET_KEY, COS_APPID, COS_BUCKET, COS_REGION, DATABASE_URL
 *
 * 运行方法：
 *   DATABASE_URL=xxx COS_SECRET_ID=xxx COS_SECRET_KEY=xxx \
 *   COS_APPID=xxx COS_BUCKET=xxx COS_REGION=xxx \
 *   npx tsx scripts/upload-avatars.ts
 *
 * 或者先 `vercel env pull .env.local` 再：
 *   export $(cat .env.local | grep -v '#' | xargs) && npx tsx scripts/upload-avatars.ts
 */

import { Client } from "pg";
import COS from "cos-nodejs-sdk-v5";

// ── 配置 ──────────────────────────────────────────
const DELAY_MS = 800; // 每个头像之间的间隔（避免频率限制）
const DRY_RUN = process.argv.includes("--dry-run"); // 只打印不上传

// ── COS 客户端 ────────────────────────────────────
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});
const BUCKET = process.env.COS_BUCKET!;
const REGION = process.env.COS_REGION!;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getPublicUrl(key: string): string {
  return `https://${BUCKET}.cos.${REGION}.myqcloud.com/${key}`;
}

async function downloadAvatar(username: string): Promise<Buffer | null> {
  // unavatar.io 代理推特头像，绕过 twimg.com 封锁
  const url = `https://unavatar.io/x/${username}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`  ⚠ 无法下载 @${username} 头像 (${res.status})`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) {
      console.warn(`  ⚠ @${username} 头像文件太小，跳过`);
      return null;
    }
    return buf;
  } catch (err) {
    console.warn(`  ⚠ @${username} 下载失败:`, (err as Error).message);
    return null;
  }
}

async function uploadToCOS(buffer: Buffer, key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      },
      (err) => {
        if (err) reject(err);
        else resolve(getPublicUrl(key));
      }
    );
  });
}

async function main() {
  // 检查环境变量
  const required = ["COS_SECRET_ID", "COS_SECRET_KEY", "COS_BUCKET", "COS_REGION", "DATABASE_URL"];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ 缺少环境变量: ${key}`);
      process.exit(1);
    }
  }

  if (DRY_RUN) console.log("🔍 DRY RUN 模式：只打印，不上传");

  const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();
  console.log("✅ 数据库连接成功");

  // 获取所有 KOL（优先处理没有头像的）
  const { rows } = await db.query<{ id: string; username: string; avatar_url: string }>(
    `SELECT id, username, avatar_url FROM kols ORDER BY avatar_url = '' DESC, username ASC`
  );

  console.log(`\n📋 共 ${rows.length} 个 KOL，开始上传头像...\n`);

  let success = 0;
  let skip = 0;
  let fail = 0;

  for (const kol of rows) {
    const key = `avatars/${kol.username}.jpg`;
    const cosUrl = getPublicUrl(key);

    // 如果已经是 COS URL，跳过
    if (kol.avatar_url && kol.avatar_url.includes("myqcloud.com")) {
      console.log(`  ✓ @${kol.username} 已有 COS 头像，跳过`);
      skip++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  🔍 @${kol.username} → ${cosUrl}`);
      continue;
    }

    process.stdout.write(`  📥 @${kol.username} 下载中...`);
    const buffer = await downloadAvatar(kol.username);

    if (!buffer) {
      fail++;
      continue;
    }

    try {
      const url = await uploadToCOS(buffer, key);
      await db.query(`UPDATE kols SET avatar_url = $1 WHERE id = $2`, [url, kol.id]);
      console.log(`\r  ✅ @${kol.username} → ${url}`);
      success++;
    } catch (err) {
      console.log(`\r  ❌ @${kol.username} 上传失败:`, (err as Error).message);
      fail++;
    }

    await sleep(DELAY_MS);
  }

  await db.end();

  console.log(`\n${"─".repeat(50)}`);
  console.log(`完成！成功: ${success} | 跳过: ${skip} | 失败: ${fail}`);
}

main().catch((err) => {
  console.error("脚本出错:", err);
  process.exit(1);
});
