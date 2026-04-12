# Re-Forest (Greening Belize)

A tree planting and tracking application for Belize's national reforestation efforts.

## Architecture

This repository contains two independent projects:

```
api/        → Hono API running on Bun
frontend/   → Vite + Vue.js 3 SPA
```

### API (`api/`)

A REST API built with [Hono](https://hono.dev/) on the [Bun](https://bun.sh/) runtime, using the **repository pattern** for clean data access.

- **Database**: Drizzle ORM with Neon PostgreSQL (serverless)
- **Auth**: JWT-based authentication
- **Endpoints**: Auth, Trees (CRUD + batch), Species, Reports (with CSV export), Image Upload, FCM Notifications

```bash
cd api
cp .env.example .env   # configure your database and JWT secret
bun install
bun run dev            # starts on http://localhost:3000
```

### Frontend (`frontend/`)

A single-page application built with [Vue.js 3](https://vuejs.org/) + [Vite](https://vite.dev/), using the **adapter pattern** to communicate with the API.

- **Styling**: Tailwind CSS with the Greening Belize color scheme
- **Routing**: Vue Router (matches all original routes)
- **Features**: Tree planting form (single + batch), species search, geolocation, image upload, Firebase push notifications

```bash
cd frontend
cp .env.example .env   # configure API URL and geocode key
npm install
npm run dev            # starts on http://localhost:5173 (proxies /api → API)
```

### Building for Production

```bash
# API
cd api && bun run start

# Frontend
cd frontend && npm run build   # outputs to frontend/dist/
```

## License

See [LICENSE](./LICENSE).
