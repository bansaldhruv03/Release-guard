# Step 1: Use the full Node 20 image for maximum capability
FROM node:20

WORKDIR /app

# Step 2: Install system tools
RUN apt-get update && apt-get install -y libsqlite3-dev && rm -rf /var/lib/apt/lists/*

# Step 3: Clean install
COPY package*.json ./
RUN npm install

# Step 4: Build
COPY . .
RUN npm run build

# Step 5: VERIFICATION (This will appear in your Cloud Build logs)
RUN echo "--- VERIFYING DIST FOLDER ---" && ls -R dist

EXPOSE 8080
ENV NODE_ENV=production

# Step 6: Direct, absolute path execution
CMD ["node", "/app/dist/main.js"]
