# ==============================================================================
# DOCKERFILE CHO FRONTEND (NODE.JS EXPRESS SERVER)
# ==============================================================================

FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose port 8000 (hoặc 8080 nếu muốn)
EXPOSE 8000

# Start the Express server
CMD ["npm", "start"]
