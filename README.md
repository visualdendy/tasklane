# TaskLane - Modern Kanban Management

A premium, full-stack Kanban-style task management platform inspired by Trello, built with Next.js 16 and Supabase.

## 🚀 Features

- **Dynamic Boards**: Create and manage multiple boards with custom backgrounds.
- **Advanced Drag & Drop**: Seamlessly reorder lists and move cards using `@dnd-kit`.
- **Rich Card Details**: Labels, checklists with progress, attachments, and comments.
- **Real-time Persistence**: All changes are instantly saved to Supabase.
- **Premium UI**: Glassmorphic design, smooth animations, and dark mode support.
- **Secure Auth**: Custom JWT-based authentication with Supabase backend.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Authentication**: JWT & Jose

## 🏁 Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase Project

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# JWT
JWT_SECRET="your-secret-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

1. Go to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Copy the contents of `supabase_schema.sql` from this project and run it.

### 4. Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to start managing your tasks!

## 📂 Project Structure

- `/app`: Next.js App Router (Pages & API)
- `/components`: Reusable UI components
- `/lib`: Library utilities (Auth, Supabase)
- `/store`: Zustand global state management
- `/public`: Static assets

## 📄 License

MIT
