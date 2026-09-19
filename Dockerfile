# Node 22 for Vite 7+ compatibility
FROM node:22-alpine

WORKDIR /app

# Install dependencies from the lockfile (the project uses npm)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Default Vite dev server port
EXPOSE 5173

# Dev mode, accepting external connections
CMD ["npm", "run", "dev", "--", "--host"]
