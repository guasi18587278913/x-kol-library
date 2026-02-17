/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'abs.twimg.com' },
      { protocol: 'https', hostname: 'xkol-media-1371032577.cos.ap-hongkong.myqcloud.com' },
    ],
  },
}

module.exports = nextConfig
