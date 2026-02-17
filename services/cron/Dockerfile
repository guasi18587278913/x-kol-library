FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm install --production=false

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build
RUN npx tsc

# Copy data files from parent project
# Note: In production, mount data volume or use a shared storage
COPY ../../data/ /data/

ENV DATA_DIR=/data
ENV NODE_ENV=production

CMD ["node", "dist/index.js", "once"]
