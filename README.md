# AnnaDaan

AnnaDaan is a digital marketplace that connects farmers and farmer producer organisations (FPOs) directly with consumers and bulk buyers. Farmers can list produce, buyers can place orders, and orders can be assigned to nearby collection hubs.

## Features

- Role-based farmer, buyer, and admin accounts
- Farmer produce listings with quantity, pricing, location, and photos
- Buyer browsing and ordering workflow
- Order confirmation and delivery-hub assignment
- Forecast view and forecast API endpoint
- Supabase authentication and PostgreSQL data storage
- Server-rendered pages using Express and EJS

## Requirements

- Node.js 18 or newer
- A Supabase project

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=3000
   ```

   `PORT` is optional and defaults to `3000`. Keep the service-role key private and never expose it in browser-side code.

3. In the Supabase SQL Editor, run [`db/schema.sql`](db/schema.sql) to create the tables, indexes, and default collection hubs.

4. Start the application:

   ```bash
   npm start
   ```

   Open <http://localhost:3000> in a browser.

## Development

Run the server with Node's watch mode:

```bash
npm run dev
```

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/signup` | Create a farmer or buyer account |
| `/login` | Log in |
| `/farmer` | Farmer dashboard |
| `/buyer` | Buyer listings view |
| `/listings` | Browse available produce |
| `/listings/:id` | View listing details |
| `/orders/:id` | View an order confirmation |
| `/forecast` | Forecast page |
| `/admin` | Admin dashboard |
| `/api/forecast` | Forecast data API |

## Project Structure

- `server.js` - Express application entry point
- `routes/` - Authentication, listing, order, dashboard, and API routes
- `views/` - EJS pages and shared partials
- `public/` - CSS and browser-side JavaScript
- `config/supabase.js` - Supabase client configuration
- `utils/` - Shared authentication and geographic helpers
- `db/schema.sql` - Database schema and seed hubs

## Notes

Authentication uses Supabase Auth, while user profiles and marketplace data are stored in the public tables created by `db/schema.sql`. The application uses an HTTP-only `agb_user` cookie for the signed-in profile used by server-rendered routes.
