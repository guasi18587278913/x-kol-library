/**
 * 快速测试腾讯云 COS 连接是否正常
 * 运行：npx tsx scripts/test-cos.ts
 * 需要先在 .env.local 或环境变量中设置 COS_* 变量
 */

import COS from "cos-nodejs-sdk-v5";

const required = ["COS_SECRET_ID", "COS_SECRET_KEY", "COS_APPID", "COS_BUCKET", "COS_REGION"];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ 缺少环境变量: ${key}`);
    process.exit(1);
  }
}

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

const bucket = process.env.COS_BUCKET!;
const region = process.env.COS_REGION!;

// 上传一个测试文件
const testKey = "test/connection-test.txt";
const testContent = `COS connection test - ${new Date().toISOString()}`;

cos.putObject(
  {
    Bucket: bucket,
    Region: region,
    Key: testKey,
    Body: Buffer.from(testContent),
    ContentType: "text/plain",
  },
  (err, data) => {
    if (err) {
      console.error("❌ COS 连接失败:", err.message);
      process.exit(1);
    }
    const publicUrl = `https://${bucket}.cos.${region}.myqcloud.com/${testKey}`;
    console.log("✅ COS 连接成功！");
    console.log(`📁 测试文件已上传: ${publicUrl}`);
    console.log("\n配置正确，可以开始开发了。");
  }
);
