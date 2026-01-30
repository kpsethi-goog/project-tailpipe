FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Cloud Run uses PORT environment variable
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
