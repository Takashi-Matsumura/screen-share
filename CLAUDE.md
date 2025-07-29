# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Creates production build
- **Start production**: `npm run start` - Runs production server
- **Linting**: `npm run lint` - Runs ESLint with Next.js TypeScript rules

## Project Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4.

### Key Structure
- `app/` - Next.js App Router directory containing all routes and components
  - `layout.tsx` - Root layout with Geist font configuration and global styles
  - `page.tsx` - Home page component (currently the default Next.js template)
  - `globals.css` - Global CSS with Tailwind imports and CSS variables for theming
- `public/` - Static assets (SVG icons for Next.js, Vercel, etc.)

### Technology Stack
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with built-in dark mode support
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google`
- **Linting**: ESLint with Next.js and TypeScript configurations

### Configuration
- **TypeScript**: Uses ES2017 target with path mapping (`@/*` → `./`)
- **ESLint**: Extends `next/core-web-vitals` and `next/typescript`
- **Tailwind**: Configured with inline theme using CSS variables for light/dark mode
- **Next.js**: Default configuration (empty next.config.ts)

The application currently displays the default Next.js welcome page and is ready for custom development.