# Glitch

Game store web application for the WebBridge demo, featuring video game browsing, shopping cart, checkout with payment processing, and bidirectional communication with an Android banking app via WebViewJavascriptBridge.

## Tech Stack

- **Framework**: Nuxt 4 with App Router
- **UI**: Vue 3 Composition API, Nuxt UI components
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: NuxtHub (Edge deployment, HubKV cache, HubBlob storage)
- **State Management**: Pinia with localStorage persistence
- **Styling**: Tailwind CSS v4
- **Features**: Video game catalog with trailers, reviews, DLC support

## Prerequisites

- Node.js 24+ and pnpm
- Docker (for local PostgreSQL)
- NuxtHub account (for production deployment)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd Glitch

# Install dependencies
pnpm install
```

## Development Setup

### 1. Start PostgreSQL Database (Local Development)

```bash
docker-compose up -d
```

### 2. Start Development Server

```bash
pnpm dev
```

> **Note:** Migrations are automatically applied when starting the dev server.

Open browser at http://localhost:3000

### 3. (Optional) Seed Database with Sample Data

```bash
curl http://localhost:3000/_nitro/tasks/db:seed
```

## Database Commands

```bash
# Migrations
pnpm exec nuxt db generate           # Generate migrations from schema
pnpm exec nuxt db migrate            # Apply migrations to database
pnpm exec nuxt db drop <TABLE>       # Drop a specific table
pnpm exec nuxt db drop-all           # Drop all tables (destructive!)
pnpm exec nuxt db sql "<QUERY>"      # Execute SQL query
```

### Production Build

```bash
pnpm build          # Build for production
pnpm preview        # Preview production build
```

## Project Structure

```
Glitch/
├── app/
│   ├── components/      # Vue components
│   ├── composables/     # Vue composables
│   ├── layouts/         # Layout components
│   ├── middleware/      # Route middleware
│   ├── pages/           # File-based routing
│   ├── stores/          # Pinia stores
│   └── assets/
│       └── css/main.css # Tailwind v4 theme
├── server/
│   ├── api/             # API routes (auth, games, purchases)
│   ├── db/
│   │   └── schema.ts    # Drizzle ORM schema (connection via NuxtHub)
│   ├── tasks/           # Scheduled tasks (seeding, etc.)
│   ├── middleware/      # Server middleware (auth)
│   └── utils/           # Server utilities (auth, response helpers)
└── shared/
    └── types/           # TypeScript type definitions
```

## Database Schema

- **users** - User accounts with balance
- **products** (games) - Video game catalog with pricing, trailers, reviews, DLC, and platform support
- **purchases** - Game purchase transactions with payment status
- **refresh_tokens** - JWT refresh token storage

## API Endpoints

All API responses follow a standardized format:

### Response Structure

```ts
interface Response<T> {
  status: {
    code: ResponseCode; // Response status code (see below)
    message: string; // Human-readable message
    requestId: string; // Unique request identifier for debugging
    requestTime: number; // Request processing time in milliseconds
  };
  data: T; // Response payload (null on error)
  meta?: {
    // Present only for paginated list endpoints
    total: number; // Total number of records
    limit: number; // Records per page
    offset: number; // Current page offset
  };
}
```

### Response Codes

| Code               | Description                                     |
| ------------------ | ----------------------------------------------- |
| `SUCCESS`          | Request completed successfully                  |
| `ERROR`            | Generic error occurred                          |
| `NOT_FOUND`        | Requested resource not found                    |
| `VALIDATION_ERROR` | Invalid request data or missing required fields |
| `UNAUTHORIZED`     | Authentication required or invalid credentials  |
| `FORBIDDEN`        | Authenticated but lacks permission              |
| `INVALID_REQUEST`  | Malformed request syntax                        |
| `INTERNAL_ERROR`   | Server-side error                               |

### Authentication

| Method | Endpoint             | Description                                           | Auth Required |
| ------ | -------------------- | ----------------------------------------------------- | ------------- |
| POST   | `/api/auth/register` | Register a new user                                   | No            |
| POST   | `/api/auth/login`    | User login (returns `accessToken` and `refreshToken`) | No            |
| POST   | `/api/auth/refresh`  | Refresh access token using `refreshToken`             | No            |
| POST   | `/api/auth/logout`   | Logout (revoke specific refresh token)                | No            |
| GET    | `/api/auth/me`       | Get current authenticated user                        | Yes           |

**Login Request Body:**

```json
{ "email": "user@example.com", "password": "your-password" }
```

**Login/Refresh Response:**

```json
{ "accessToken": "jwt-access-token", "refreshToken": "jwt-refresh-token" }
```

**Authorization Header (for protected routes):**

```
Authorization: Bearer <accessToken>
```

### Products (Games)

| Method | Endpoint          | Description                              | Auth Required |
| ------ | ----------------- | ---------------------------------------- | ------------- |
| GET    | `/api/games`      | List games with filtering and pagination | Yes           |
| GET    | `/api/games/[id]` | Get single game details                  | Yes           |

**Query Parameters (GET /api/games):**

- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `category` - Filter by category
- `search` - Search by game name

### Purchases

| Method | Endpoint              | Description                                  | Auth Required |
| ------ | --------------------- | -------------------------------------------- | ------------- |
| GET    | `/api/purchases`      | List purchases with filtering and pagination | Yes           |
| GET    | `/api/purchases/[id]` | Get single purchase details                  | Yes           |

**Query Parameters (GET /api/purchases):**

- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `status` - Filter by status (e.g., "pending", "completed", "failed")
- `userId` - Filter by user ID

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
