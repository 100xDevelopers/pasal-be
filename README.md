# Backend Server Setup

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker and Docker Compose

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the sample environment file and fill in the required values:

```bash
cp .env.sample .env
```

Edit `.env` file and set:

- `DB_USERNAME` - Your database username
- `DB_PASSWORD` - Your database password
- `PG_PORT` - Database port (default: 5433)
- `BE_PORT` - Backend server port
- `DATABASE_URL` - Will use the values from above variables

### 3. Start the Database

```bash
docker-compose up -d
```

### 4. Run Database Migrations

```bash
pnpm prisma migrate dev
```

### 5. Start the Server

Development mode:

```bash
pnpm dev
```

Production mode:

```bash
pnpm build
pnpm start:prod
```

The server will be running on the port specified in your `.env` file.

## Stopping the Server

To stop the database:

```bash
docker-compose down
```
