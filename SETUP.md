# Socratic AI - Next.js with Supabase Auth Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the Project URL and anon public key
4. Add them to your `.env.local` file

## Features

- ✅ Next.js 14+ with TypeScript
- ✅ Supabase Authentication
- ✅ Email/Password login and signup
- ✅ Protected routes with middleware
- ✅ Dark theme with black background and green accents
- ✅ Tailwind CSS styling
- ✅ Responsive design

## Pages

- `/auth` - Login and signup page
- `/dashboard` - Protected dashboard page (requires authentication)

## Running the Project

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Authentication Flow

1. Users visit `/auth` to sign up or sign in
2. After successful authentication, they're redirected to `/dashboard`
3. The middleware protects `/dashboard` routes
4. Users can sign out from the dashboard

## Styling

- Black background (`bg-black`)
- Green accent colors (`text-green-500`, `bg-green-500`)
- Gray variants for secondary elements
- Consistent dark theme throughout
