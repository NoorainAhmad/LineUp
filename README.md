# LineUp

LineUp is a real-time chat and collaboration platform with messaging, groups, media sharing, user presence, statuses, and administrative features.

## Project Structure

- `client/` - React and Vite web client
- `server/` - Node.js, Express, Socket.IO, Prisma, PostgreSQL backend
- `docker-compose.yml` - Local PostgreSQL, Redis, and Kafka services

## Prerequisites

- Node.js 20 or later
- pnpm
- Docker and Docker Compose

## Local Setup

### 1. Start infrastructure services

```bash
docker compose up -d
```

### 2. Configure and start the backend

```bash
cd server
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

### 3. Configure and start the frontend

```bash
cd client
pnpm install
pnpm dev
```

## Main Technologies

- React 19 and Vite
- TypeScript
- Express and Socket.IO
- Prisma and PostgreSQL
- Redis and Kafka
- Docker

## Repository

https://github.com/NoorainAhmad/LineUp
