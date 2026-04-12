# Achievements Microfrontend

A standalone Vue 3 + Vite application for the Greening Belize leaderboard and achievements system. This is a separate project from the main frontend — it has its own build, routing, and deployment.

## Features

- **Leaderboard** — All users ranked by trees planted, with achievement counts. Click any user to view their achievements.
- **Achievements Overview** — Categories displayed with horizontal-scrolling badge rows, showing unlock progress (e.g. "4 of 8 unlocked") with a "View all" link per category.
- **Category Detail** — 2-column grid of achievement badges. Unlocked badges are shown in color with an accent border and unlock date; locked badges are displayed in grayscale.

## Routes

| Path | View |
|------|------|
| `/` | Leaderboard |
| `/user/:userId` | User's achievements (all categories) |
| `/user/:userId/category/:categoryId` | Single category detail |

## Tech Stack

- **Framework**: Vue 3 + TypeScript
- **Build**: Vite (port 5174)
- **Styling**: Tailwind CSS with shadcn CSS variable theme (same color scheme as the main frontend)
- **Icons**: Lucide Vue

## Getting Started

```bash
cp .env.example .env   # configure API URL if needed
npm install
npm run dev            # starts on http://localhost:5174 (proxies /api → API)
```

## Backend Requirements

The API must have the achievement tables and seed data in place:

```bash
cd ../api
npm run db:push              # apply schema (creates Achievement_Categories, Achievements, User_Achievements tables)
npm run seed:achievements    # seed 4 categories and 23 achievement definitions
```

### Achievement Categories

| Category | Threshold Type | Description |
|----------|---------------|-------------|
| Tree Planting | `TREES_PLANTED` | Milestones for total trees planted (1, 5, 10, 25, 50, 100, 250, 500) |
| Species Explorer | `SPECIES_COUNT` | Variety of species planted (2, 5, 10, 15, 20) |
| Community Impact | `AREA_HECTARES` | Total area covered in hectares (1, 5, 10, 25, 50) |
| Dedication | `DAYS_ACTIVE` | Distinct days with planting activity (2, 5, 10, 25, 50) |

### API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/leaderboard` | Users ranked by trees planted |
| `GET` | `/achievements/user/:userId` | User's achievements (all categories) |
| `GET` | `/achievements/user/:userId/category/:categoryId` | Single category for a user |

Achievements are automatically awarded when trees are created via `POST /trees` and `POST /trees/batch`.

## Building for Production

```bash
npm run build   # outputs to dist/
```
