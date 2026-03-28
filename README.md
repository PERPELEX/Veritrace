# VeriTrace Web

VeriTrace Web is a Next.js analytics dashboard for monitoring social trend activity from SQL Server datasets.

It includes:

- Secure login with SQL-backed admin users
- Multi-page analytics dashboard (Overview, Trend, Cluster, Search, Power BI, About, Settings)
- SQL-driven filtering by dates, trend names, keywords, and user screen names
- Visual reporting with charts and ranked user/tweet tables

## Table of Contents

- Project Overview
- Tech Stack
- Project Structure
- Environment Configuration
- Database Setup
- Installation and Run
- Available Scripts
- Authentication Flow
- Dashboard Pages
- API Endpoints
- Data Sources and Query Notes
- Troubleshooting
- Deployment Notes

## Project Overview

This project focuses on misinformation/trend intelligence with a structured dashboard experience:

- Overview page for high-level KPIs and visual summaries
- Trend page for time-window trend analytics and timeline/tree analysis
- Cluster page for cluster distribution analytics
- Search page for user-centric analytics, tweet feed, and most active users ranking
- Power BI page for embedded executive reporting

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- SQL Server via `mssql`
- Validation: `zod`
- Password hashing: `bcryptjs`
- Session/JWT: `jose`

## Project Structure

Key directories:

- `src/app` : App Router pages and API routes
- `src/components/dashboard` : Dashboard UI views
- `src/lib` : SQL/data access, types, auth/session helpers
- `scripts` : Utility scripts (example: admin seeding)
- `sql` : SQL schema/setup scripts
- `public` : Static assets (logo and images)

## Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Update values for your SQL Server and JWT secret

Required variables:

- `DB_SERVER`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_ENCRYPT`
- `DB_TRUST_SERVER_CERTIFICATE`
- `JWT_SECRET`

## Database Setup

### 1) Create Login Table

Run:

- `sql/001_create_admin_login_table.sql`

This creates:

- `dbo.AdminLogin`

### 2) Seed Default Admin Users (Optional)

```bash
npm run seed:admins
```

Default users from script:

- `admin_primary` / `Admin@12345`
- `admin_security` / `Admin@54321`

You can modify values in:

- `scripts/seed-admins.mjs`

## Installation and Run

```bash
npm install
npm run dev
```

App URL:

- `http://localhost:3000`

If port 3000 is occupied, Next.js will automatically use the next available port.

## Available Scripts

- `npm run dev` : Start development server
- `npm run build` : Build production bundle
- `npm run start` : Run production server
- `npm run lint` : Run ESLint
- `npm run seed:admins` : Seed/update admin credentials

## Authentication Flow

- Login form sends credentials to `POST /api/auth/login`
- Credentials are validated against `dbo.AdminLogin`
- Password check uses `bcryptjs`
- On success, a signed session token is issued via HTTP-only cookie
- Protected dashboard pages validate session through server-side logic

Logout:

- `POST /api/auth/logout`

## Dashboard Pages

- `/dashboard` : Overview KPIs, trends, heat map, last scrape date
- `/dashboard/trend` : Trend-focused analytics and activity views
- `/dashboard/cluster` : Cluster distribution and counts
- `/dashboard/search` : User intelligence search, tweet feed, user ranking
- `/dashboard/powerbi` : Embedded Power BI report
- `/dashboard/about` : Platform details
- `/dashboard/settings` : System/data configuration notes

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`

## Data Sources and Query Notes

Main tables used by dashboard queries include:

- `TwitterTrendTweets_All`
- `tweet_clustering_results`
- `TwitterUsers`

Important behavior:

- Date parsing uses resilient SQL conversion with multiple formats
- Filters are applied at SQL layer for performance and consistency
- Search page supports trend/date/keyword filters and user ranking by tweet volume

## Troubleshooting

### Turbopack runtime errors (dev/build)

Common cause: low disk space.

Steps:

1. Ensure sufficient free space on drive (at least several GB recommended)
2. Clear Next cache:

```bash
rm -rf .next
```

For PowerShell:

```powershell
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
```

3. Restart dev server:

```bash
npm run dev
```

### SQL connection errors

- Verify `.env.local` values
- Confirm SQL Server accessibility and credentials
- Check encryption/trust certificate flags for your environment

## Deployment Notes

- Set production environment variables securely
- Run `npm run build` before deployment
- Ensure SQL connectivity from deployment environment
- Keep `JWT_SECRET` strong and private

## License

This repository currently has no explicit open-source license declared.
hmm