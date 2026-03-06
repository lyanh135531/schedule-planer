# TalkFirst Support - Course Pre-Registration System

A Next.js application for managing TalkFirst course pre-registrations with advanced planning features including primary/backup course selection.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Node.js 18+ (for local development)

### 1. Start with Docker (Recommended)

```bash
# Start Docker containers
npm run docker:up

# Wait for database and seed initial data
npm run db:setup

# Start development server
npm run dev
```

Or use the all-in-one command:

```bash
npm run docker:restart
```

Visit [http://localhost:3000](http://localhost:3000)

### 2. Manual Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL with Docker
docker-compose up -d db

# Wait for database and seed data
npm run db:setup

# Start development server
npm run dev
```

## 📦 Available Scripts

| Script                   | Description                       |
| ------------------------ | --------------------------------- |
| `npm run dev`            | Start Next.js development server  |
| `npm run build`          | Build for production              |
| `npm run start`          | Start production server           |
| `npm run docker:up`      | Start Docker containers           |
| `npm run docker:down`    | Stop Docker containers            |
| `npm run docker:restart` | Restart Docker and setup database |
| `npm run db:wait`        | Wait for database to be ready     |
| `npm run db:seed`        | Seed database with initial data   |
| `npm run db:setup`       | Wait + seed (full setup)          |

## 🗄️ Database Schema

The application uses PostgreSQL with 5 main tables:

### 1. `course_types`

Defines course categories (Main Class, Free Talk, Skills & Activities)

### 2. `user_course_settings`

Per-user requirements for each course type (e.g., "I need 3 main classes")

### 3. `courses`

Master course catalog synced from TalkFirst API

### 4. `user_course_plans`

User's primary and backup course selections with priority ordering

### 5. `submission_history`

Audit log of all registration attempts

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login

### Course Management

- `GET /api/courses` - Get all courses (filter by `?type=main|free_talk|skills`)

### User Settings

- `GET /api/settings/course-requirements` - Get user's course requirements
- `PUT /api/settings/course-requirements` - Update requirements

### Course Planning

- `GET /api/plans` - Get user's primary and backup plans
- `POST /api/plans` - Add course to plan (validates time conflicts)
- `DELETE /api/plans` - Clear all plans
- `PUT /api/plans/[id]` - Update backup priority
- `DELETE /api/plans/[id]` - Remove specific plan

## 🎯 Features

### Current Features

- ✅ PostgreSQL database with Drizzle ORM
- ✅ Course type management (Main, Free Talk, Skills)
- ✅ User-specific course requirements
- ✅ Primary/backup course planning
- ✅ Time conflict detection
- ✅ Priority-based backup selection
- ✅ Docker deployment ready

### Upcoming Features

- 🔄 TalkFirst API integration for course sync
- 🔄 Advanced UI for course planning
- 🔄 Automated registration cron job
- 🔄 Backup course validation logic

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL 15
- **ORM**: Drizzle ORM
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Deployment**: Docker Compose

## 📝 Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/talkfirst
CRON_SECRET=your_secret_key
# Docker-only: Change schedule (Default: Sunday 9 AM GMT+7)
# CRON_SCHEDULE=0 2 * * 0
```

## 📅 Cron Job Scheduling

The automated registration job (`/api/cron/register`) can be scheduled:

### 1. Self-Hosted (Docker)

The `docker-compose.yml` includes a `cron` service. You can change the schedule using the `CRON_SCHEDULE` environment variable in your `.env` file (Crontab format, uses UTC).

### 2. Vercel

Standard `vercel.json` is included. You can customize the `schedule` field there.

### 3. Manual Trigger

```bash
npm run cron:trigger
```

## 🐳 Docker Configuration

The `docker-compose.yml` includes:

- **app**: Next.js application (port 3000)
- **db**: PostgreSQL 15 (port 5432)

Database is automatically initialized with schema from `docker/init.sql`

## 📚 Project Structure

```
talkfirst-support/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   └── login/            # Login page
├── components/           # React components
├── lib/
│   ├── db/              # Database schema and utilities
│   │   ├── schema.ts    # Drizzle schema
│   │   ├── index.ts     # Database connection
│   │   └── seed.ts      # Seed data
│   └── types.ts         # TypeScript types
├── docker/
│   └── init.sql         # Database initialization
├── scripts/
│   ├── wait-for-db.ts   # Database readiness check
│   └── setup-db.ts      # Database seeding
└── docker-compose.yml   # Docker configuration
```

## 🔧 Development Workflow

1. **Start Docker**: `npm run docker:up`
2. **Setup Database**: `npm run db:setup`
3. **Start Dev Server**: `npm run dev`
4. **Make Changes**: Edit code, hot reload works automatically
5. **Build**: `npm run build` to verify production build

## 📖 Database Seeding

The seed script (`lib/db/seed.ts`) automatically creates:

- 3 course types (Main, Free Talk, Skills)
- Sample courses from TalkFirst API structure

Run manually: `npm run db:seed`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test with `npm run build`
4. Submit a pull request

## 📄 License

Private project for TalkFirst course management.
