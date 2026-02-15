🚀 Smart Bookmark App

A full-stack bookmark management application built using Next.js (App Router) and Supabase.

This application allows users to authenticate with Google, manage personal bookmarks, and experience real-time updates — all deployed on Vercel.

🔗 Live Demo

Vercel URL: 
smart-bookmark-app-nw52-git-main-11marys-projects.vercel.app

🛠 Tech Stack

Frontend: Next.js (App Router)

Backend & Database: Supabase

Authentication: Google OAuth (Supabase Auth)

Database: PostgreSQL (Supabase)

Real-time Updates: Supabase Realtime

Styling: Tailwind CSS

Deployment: Vercel

✅ Features Implemented

🔐 Google OAuth login (No email/password)

➕ Add bookmarks (Title + URL)

✏️ Update bookmarks

🗑 Delete bookmarks

🔄 Real-time updates (auto refresh on changes)

🔒 Row Level Security (Users can only access their own bookmarks)

🌐 Production deployment on Vercel

🧱 Database Design

Table: bookmarks

Column	Type
uuid	UUID (PK)
text	Text
url	Text
user_id	UUID

RLS policies ensure:

Users can insert only their own bookmarks

Users can view only their own bookmarks

Users can update only their own bookmarks

Users can delete only their own bookmarks

⚙️ Challenges Faced & How I Solved Them
1️⃣ Supabase RLS Blocking CRUD Operations

Initially, bookmarks were not inserting or fetching due to incorrect Row Level Security policies.

Solution:

Properly configured SELECT, INSERT, UPDATE, DELETE policies

Used auth.uid() = user_id condition

Tested with multiple accounts to verify isolation

2️⃣ Google OAuth Redirect Issues (Production)

After deployment, authentication failed due to incorrect redirect URLs.

Solution:

Added Vercel production URL in:

Supabase → Authentication → URL Configuration

Configured:

Site URL

Redirect URLs

Ensured no localhost redirects were used in production

3️⃣ Vercel Build Failure (Missing Environment Variables)

Deployment initially failed with:

Error: supabaseUrl is required


Solution:

Added required environment variables in Vercel:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

Redeployed successfully

4️⃣ Real-Time Updates Not Working

Real-time updates did not trigger initially.

Solution:

Subscribed to Supabase postgres_changes

Refetched bookmarks on change event

Cleaned up subscription on unmount

🔐 Security Implementation

Row Level Security enabled

All operations restricted to authenticated users

User-based filtering using auth.uid()

No sensitive keys exposed

🚀 How to Run Locally

Clone the repository

Install dependencies:

npm install


Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key


Run:

npm run dev

💡 What I Learned

Proper handling of authentication flows

Importance of secure RLS configuration

Managing production environment variables

Debugging OAuth and deployment issues

Integrating real-time subscriptions with UI

📌 Final Notes

This project focuses on:

Clean architecture

Secure access control

Production-ready deployment

Real-world debugging experience

✨ Thank you for reviewing my submission!
