# Wish List App

A social wish list application where users can create, share, and manage wish lists with friends and family.

## Features

- 🔐 **Authentication**: Mandatory login to view any content
- 📝 **Wish Lists**: Create personal wish lists with items (text, images, links)
- 🔍 **User Search**: Find users by name, email, or phone number
- 💝 **Gift Tracking**: Mark items as purchased to prevent duplicate gifts
- 🎁 **Secret Items**: Friends can add items hidden from the list owner
- 👥 **Saved Users**: Quick access to friends' and family's wish lists
- 💰 **Affiliate Links**: Automatic affiliate link conversion for monetization

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Run database migrations (see `supabase/migrations/` folder)

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

See `supabase/schema.sql` for the complete database schema.

### Key Tables:
- `users` - User profiles (extends Supabase auth.users)
- `wish_lists` - User wish lists
- `wish_list_items` - Items in wish lists
- `purchases` - Tracks purchased items
- `saved_users` - User-to-user relationships
- `affiliate_links` - Affiliate link mappings

## Project Structure

```
/app
  /auth          # Authentication pages
  /dashboard     # User dashboard
  /lists         # Wish list pages
  /search        # User search
/components      # Reusable components
/lib
  /supabase      # Supabase client setup
/types           # TypeScript types
```

## Development Roadmap

- [x] Project setup
- [ ] Supabase integration
- [ ] Authentication
- [ ] User profiles & search
- [ ] Wish list CRUD
- [ ] Purchase tracking
- [ ] Secret items
- [ ] Saved users
- [ ] Image uploads
- [ ] Affiliate links

## License

MIT


