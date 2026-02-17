import COS from "cos-nodejs-sdk-v5";

// ============================================
// COS Client Initialization
// ============================================

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

const BUCKET = process.env.COS_BUCKET!;
const REGION = process.env.COS_REGION!;

// ============================================
// Key generators
// ============================================

export function getAvatarKey(username: string): string {
  return `avatars/${username}.jpg`;
}

export function getMediaKey(tweetId: string, index: number): string {
  return `tweets/${tweetId}/${index}.jpg`;
}

// ============================================
// Upload
// ============================================

/**
 * Download an image from a URL and upload it to COS.
 * Returns the public URL of the uploaded object.
 */
export async function uploadImageFromUrl(
  sourceUrl: string,
  key: string
): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download image from ${sourceUrl}: ${response.status}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await new Promise<void>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: buffer,
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  return `https://${BUCKET}.cos.${REGION}.myqcloud.com/${key}`;
}
