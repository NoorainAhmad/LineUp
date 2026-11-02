# LineUp

LineUp is a full-stack, real-time communication and team management platform inspired by modern chat applications. It combines direct and group messaging with status updates, media sharing, role-based administration, presence tracking, and analytics in a responsive web interface.

## Overview

LineUp supports hierarchical organizations, allowing developers and administrators to manage teams while users communicate through private and group conversations. The platform uses Socket.IO for live updates and background services for caching, messaging, and event processing.

## Key Features

### Messaging

- One-to-one and group conversations
- Text, image, audio, video, file, sticker, and multi-media messages
- Message replies and forwarding
- Message editing and deletion
- Emoji reactions
- Typing indicators
- Delivery and read receipts
- Unread message counts
- Pinned, muted, and archived chats
- Real-time inbox updates

### Status Updates

- Create text, image, and video statuses
- Automatic status expiration after 24 hours
- Status feed and viewer tracking
- Replies to statuses
- Sharing statuses between users

### User Presence

- Online, busy, and offline states
- Last-seen information
- Live presence updates through Socket.IO
- Session-aware disconnect handling

### User and Team Management

- Hierarchical roles: Developer, Master, Admin, Branch, and User
- Permission-based access control
- Team and subordinate discovery
- User creation, activation, search, and deletion
- Dashboard statistics and user analytics
- Branch information and organizational relationships

### Media and Storage

- Pre-signed AWS S3 uploads
- Single and bulk media uploads
- Upload finalization and media galleries
- Multiple media attachments per message
- Media status tracking

### Productivity

- Saved canned responses and reusable commands
- Light and dark themes
- Responsive desktop and mobile layouts
- Profile and account management
- Password changes and password recovery using OTP

### Security and Reliability

- JWT authentication with refresh-token rotation
- Secure session tracking and logout-all-device support
- Password hashing with bcrypt
- Helmet security headers
- CORS configuration and request body limits
- Redis-backed API and authentication rate limiting
- Role and permission middleware
- Input validation with Zod

## Architecture

```text
Browser Client
  │ HTTPS / REST / WebSocket
  ▼
Express API + Socket.IO Server
  │
  ├── PostgreSQL / Prisma
  ├── Redis cache and rate limiting
  ├── Kafka event processing
  └── AWS S3 media storage
```

### Backend Modules

| Module | Responsibilities |
|---|---|
| Authentication | Registration, OTP verification, login, refresh, logout, password reset |
| Users | Profiles, hierarchy, team search, dashboard statistics, permissions |
| Chats | Inbox, groups, messages, replies, forwarding, reactions, read state |
| Media | Pre-signed uploads, bulk uploads, galleries, upload finalization |
| Status | Text/image/video statuses, views, replies, sharing, expiration |
| Canned responses | Create, search, retrieve, and manage reusable messages |
| System | Centralized system configuration for privileged roles |

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Socket.IO Client
- Axios
- Zod
- Tailwind CSS
- Lucide React

### Backend

- Node.js and Express
- TypeScript
- Socket.IO
- Prisma ORM
- PostgreSQL
- Redis and ioredis
- KafkaJS
- AWS SDK for S3
- JWT and bcrypt
- Zod

### Infrastructure

- Docker and Docker Compose
- PostgreSQL 15
- Redis 7
- Apache Kafka in KRaft mode

## Project Structure

```text
lineup-v0/
├── client/
│   ├── api/                 # API client configuration
│   ├── components/          # Shared UI and modal components
│   ├── contexts/            # Authentication and theme providers
│   ├── pages/               # Public and application pages
│   ├── services/            # Frontend API services
│   └── utils/               # Socket, presence, media, and formatting helpers
├── server/
│   ├── prisma/              # Database schema and migrations
│   └── src/
│       ├── controllers/     # Request handlers
│       ├── middlewares/     # Authentication and authorization
│       ├── routes/          # REST API routes
│       ├── services/        # Business logic
│       ├── socket/          # Real-time Socket.IO events
│       ├── validators/      # Request validation schemas
│       └── workers/         # Kafka consumers and background processing
└── docker-compose.yml       # Local infrastructure services
```

## Prerequisites

Install the following tools before running LineUp:

- Node.js 20 or newer
- pnpm
- Docker Desktop
- Docker Compose
- An AWS S3 bucket for production media uploads

## Local Development

### 1. Start infrastructure services

From the project root:

```bash
docker compose up -d
```

This starts:

| Service | Port |
|---|---:|
| PostgreSQL | 5433 |
| Redis | 6380 |
| Kafka | 9092 |

### 2. Configure the backend

```bash
cd server
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

Update `server/.env` with the database, JWT, Redis, AWS, and optional Kafka values for your environment.

### 3. Configure the frontend

```bash
cd client
cp .env.example .env
pnpm install
pnpm dev
```

The frontend development server runs at `http://localhost:5173` by default.

### 4. Open LineUp

Visit `http://localhost:5173` and create or verify an account to begin.

## Environment Configuration

### Backend variables

```env
DATABASE_URL=postgresql://postgresql_admin:postgresql_password_123@127.0.0.1:5433/lineup
REDIS_URL=redis://127.0.0.1:6380
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-media-bucket
S3_STORAGE_CLASS=STANDARD
```

### Frontend variables

```env
API_BASE_URL=/api/
API_VERSION=v1
API_PORT=5000
VITE_SOCKET_URL=http://localhost:5000
VITE_S3_BUCKET=your-media-bucket
VITE_AWS_REGION=us-east-1
```

Never commit real passwords, access keys, JWT secrets, or production credentials. Use environment-specific secret management in deployed environments.

## API Base URL

The REST API is exposed under:

```text
/api/v1
```

Main route groups include authentication, users, chats, media, statuses, canned responses, and system settings.

## Role-Based Access

| Role | Typical capabilities |
|---|---|
| Developer | System-level access and full user administration |
| Master | High-level administration, user management, and settings |
| Admin | Administrative operations within assigned scope |
| Branch | Team management and operational communication features |
| User | Messaging, statuses, profile, and permitted collaboration features |

## Database

The Prisma schema models users, sessions, organizational hierarchy, chats, chat members, messages, media attachments, statuses, status views, canned responses, and system configuration. Sequential message IDs support ordered delivery and read-pointers.

To inspect the database locally:

```bash
cd server
pnpm prisma:studio
```

## Production Build

### Frontend

```bash
cd client
pnpm build
```

### Backend

```bash
cd server
pnpm build
pnpm start
```

Ensure PostgreSQL migrations have been applied and all production environment variables, object storage settings, Redis, and Kafka services are available.

## Docker Services

Stop the local infrastructure services with:

```bash
docker compose down
```

Add `-v` only when you also want to remove the local PostgreSQL, Redis, and Kafka volumes:

```bash
docker compose down -v
```

## Troubleshooting

- If PostgreSQL is unavailable, verify port `5433` and the `DATABASE_URL`.
- If Redis does not connect, verify port `6380` and `REDIS_URL`.
- If real-time events are missing, confirm the backend and `VITE_SOCKET_URL` use matching host and port values.
- If uploads fail, verify AWS credentials, bucket permissions, region, and CORS configuration.
- Run `pnpm prisma:generate` after schema changes.

## Repository

GitHub: https://github.com/NoorainAhmad/LineUp
