# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start both Convex dev server and Vite dev server concurrently
npm run dev:stop         # Stop all development servers and clean logs
npm run dev:logs         # View development server logs

# Build & Deploy
npm run build           # Build for production using Vite

# Code Quality
npm run lint            # Run ESLint on the codebase

# Convex Commands
npx convex dev          # Start Convex development backend
npx convex deploy       # Deploy Convex functions to production
npx convex -h           # See all Convex CLI options
```

## Project Architecture

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Convex (real-time database with serverless functions)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk (with Convex Auth integration)
- **Icons**: Lucide React

### Authentication Flow
- Uses Clerk for user authentication with domain `https://settling-dassie-49.clerk.accounts.dev`
- App.tsx handles auth state: loading → login (if not signed in) → authenticated app
- Convex Auth integration configured in `convex/auth.config.ts`

### Data Architecture
The app manages Instagram-style posts with the following core types:
- **User**: Profile information with verification badges
- **Post**: Content with user, image, caption, metrics, tags, location
- **Comment**: User comments on posts (display only in current implementation)

### Key Components Structure
```
src/
├── components/
│   ├── AuthenticatedApp.tsx     # Main app container (post-auth)
│   ├── Header.tsx               # Navigation and search
│   ├── Login.tsx                # Authentication UI
│   ├── PostGrid.tsx             # Instagram-style grid layout
│   ├── PostCard.tsx             # Individual post display
│   ├── PostModal.tsx            # Detailed post view
├── hooks/
│   └── useInstagramPosts.ts     # Custom hook for post data management
├── services/
│   └── instagramDataMapper.ts  # Transform Instagram API data to app format
└── types/
    └── index.ts                 # Core TypeScript interfaces
```

### Convex Functions
Located in `convex/`:
- **instagram.ts**: Instagram Graph API integration functions
  - `searchHashtag`: Find hashtag IDs
  - `getRecentMediaByHashtag`: Fetch posts by hashtag ID
  - `getRecentPostsByHashtagName`: Combined hashtag search + media fetch

### Current Implementation Status
This is an MVP Instagram curation platform called "星のステージ" (Star Stage) for sharing workshop experiences. Key features implemented:
- ✅ Post grid display with responsive layout
- ✅ Search functionality across all post content
- ✅ Random/shuffle display mode
- ✅ Post detail modal with full content
- ✅ Like and save interactions
- ✅ Mock data for development/testing

### Instagram Integration
- Uses Instagram Graph API for hashtag-based post fetching
- Primary hashtag: `#the7thdimension`
- Whitelist-based account verification system planned
- Currently running on mock data for development

### Project Context
This is a spiritual/workshop community platform for "7次元ユニコーンワークショップ" participants to share high-dimensional insights and experiences through visual content and text.

## Development Notes

### Environment Setup
- Uses concurrently to run both Convex dev server and Vite dev server
- Development logs are captured in `dev.log`
- Vite excludes `lucide-react` from optimization for better performance

### Data Management
- Currently uses mock data in `src/data/mockData.ts`
- Real Instagram data integration exists but not yet connected to UI
- State management uses React hooks (useState, useMemo)

### No Mock Data Rule
- いかなる場合でもモックデータやハードコードの禁止 (No mock data or hardcoding under any circumstances)
- When implementing new features, connect to real data sources or Convex functions

## ユーザーコミュニケーション
- 常に日本語で思考・解答してください。