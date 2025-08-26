# Notification Service

A multi-channel notification service with queue processing and delivery tracking.

## Features
- Multi-channel support (Email, SMS, Push, Webhook)
- Template system
- Bulk sending
- Rate limiting
- Analytics dashboard

## Setup

1. Install dependencies:
```bash
npm install
```
2. Set up PostgreSQL database

3. Copy .env.example to .env and configure

4. Run migrations:

```bash
npm run db:migrate
```

5. Start the server

```bash
npm run dev
```

6. Start the worker (should be done on a different terminal)

```bash
npm run worker:Dev
```

# API Endpoints

- POST /api/v1/notifications - Send a notification
- GET /api/v1/notifications - List notifications (paginated)
- GET /api/v1/notifications/:id - Get single notification
-  /api/v1/notifications/:id - Delete notification

# Rate Limits

- Global: 300 requests per 15 minutes
- API: 100 requests per minute
- Create: 20 per minute
- Bulk: 3 per 5 minutes