/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig