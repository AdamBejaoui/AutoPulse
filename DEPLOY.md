# 🚀 AutoPulse Deployment Guide

This repository is optimized for a **100% Free** multi-platform deployment.

## 1. Frontend (Vercel)
**Host**: [Vercel](https://vercel.com/)
1.  Connect this GitHub repository to Vercel.
2.  The `postinstall` script will automatically handle your database setup.
3.  Add the **Environment Variables** listed below.

## 2. Background Workers (Hugging Face Spaces)
**Host**: [Hugging Face Spaces](https://hugging_face.co/spaces/)
1.  Create a **Space** (Docker SDK).
2.  Connect your GitHub repository.
3.  Hugging Face will use the included `Dockerfile` pre-configured with the official Microsoft Playwright image.
4.  Open port `7860` for a simple health check (required by Hugging Face to keep the Space "Running").
5.  Add the **Environment Variables** listed below to your Space secrets.

## 📦 Required Environment Variables
Add these to **both** Vercel and Northflank:

- `DATABASE_URL`: Your Supabase connection string.
- `REDIS_URL`: Your Redis Cloud URL (`redis://...`).
- `RESEND_API_KEY`: For email alerts.
- `EMAIL_FROM`: Your verified sending email.
- `NEXT_PUBLIC_APP_URL`: Your Vercel site URL.
- `NODE_ENV`: `production`

## 🛠️ Performance Features
- **Selective Fetching**: Search results only pull essential card data to keep the site fast.
- **Image Optimization**: Automatic lazy-loading and WebP conversion via `next/image`.
- **Cached Statistics**: Home page counts are cached for 5 minutes.
