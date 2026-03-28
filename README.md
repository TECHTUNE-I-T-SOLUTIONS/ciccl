# CICCL - Quantity Surveyor Platform

A premium, full-scale professional platform for CICCL's quantity surveying services, featuring project showcase, client management, payments, and comprehensive admin dashboard.

## Features

### Public Website
- **Home Page** - Hero section with animated statistics, services overview
- **Projects Portfolio** - Dynamic project gallery with filtering and detailed project pages
- **Reviews Section** - Client testimonials with review submission form
- **Contact Page** - Inquiry form with automatic WhatsApp integration
- **Hire Services Page** - Service selection, package selection, and Paystack payment integration

### Authentication System
- Admin and Client signup/login/password recovery
- Security question-based password recovery
- JWT-based authentication with httpOnly cookies
- Role-based access control

### Admin Dashboard
- Project management (create, edit, delete, publish)
- Review management (approve/reject submissions)
- Payment tracking and revenue analytics
- Client submissions management
- Image management with drag-drop upload
- Analytics dashboard with visitor tracking

### Client Portal
- Project submission form
- Payment processing via Paystack
- Project status tracking
- Dashboard with submitted projects

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, TailwindCSS
- **Animations**: Framer Motion, GSAP
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt hashing
- **Payments**: Paystack integration
- **Analytics**: Custom middleware for tracking
- **UI Components**: shadcn/ui, Radix UI

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd project-folder
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT (use a strong random string)
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `PAYSTACK_PUBLIC_KEY` - Your Paystack public key
- `WHATSAPP_PHONE_NUMBER` - WhatsApp number for inquiries (format: 2347034356398)

### 3. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with appropriate permissions
4. Get your connection string
5. Update `MONGODB_URI` in `.env.local`

### 4. Paystack Setup

1. Sign up at https://paystack.com
2. Get your API keys from the dashboard
3. Update `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` in `.env.local`

### 5. Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/        # Authentication endpoints
│   ├── projects/    # Project CRUD operations
│   ├── reviews/     # Review management
│   ├── payments/    # Payment processing
│   ├── inquiries/   # Contact form submissions
│   ├── clients/     # Client operations
│   └── analytics/   # Analytics tracking
├── auth/            # Authentication pages
│   ├── admin/       # Admin auth pages
│   └── client/      # Client auth pages
├── admin/           # Admin dashboard
├── client/          # Client portal
├── projects/        # Public projects pages
├── contact/         # Contact page
├── hire/            # Services/hire page
└── reviews/         # Reviews page

components/
├── Navbar.tsx       # Navigation bar
├── Footer.tsx       # Footer component
├── MobileNav.tsx    # Mobile bottom navigation
└── sections/        # Reusable page sections

lib/
├── mongodb.ts       # MongoDB connection
├── auth.ts          # Authentication utilities
├── models/          # Mongoose schemas
│   ├── User.ts
│   ├── Project.ts
│   ├── Review.ts
│   ├── Payment.ts
│   ├── Client.ts
│   ├── Inquiry.ts
│   ├── Analytics.ts
│   └── Image.ts
└── validations.ts   # Zod validation schemas
```

## Database Collections

### Users
- Email, hashed password, name, role (admin/client)
- Security question and answer for password recovery

### Projects
- Title, slug, description, images
- Budget scope, timeline, hashtags
- Featured and published toggles

### Reviews
- Client name, email, project reference
- 1-5 star rating, comment
- Status: pending/approved/rejected

### Payments
- Client ID, service type, package type
- Amount, currency, payment method (paystack/stripe)
- Transaction reference, Paystack/Stripe IDs
- Payment status: pending/success/failed

### Clients
- User ID, company name, project details
- Budget range, location, attachments
- Status: pending/in-review/approved/completed

### Inquiries
- Contact form submissions from website
- Stores all inquiry data for admin review
- WhatsApp integration flag

### Analytics
- IP address, route visited, referrer
- Device type, timestamp
- Unique visitor tracking

### Images
- Filename, original name, MIME type
- Size and upload timestamp
- For image management system

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/recover` - Password recovery

### Projects
- `GET /api/projects` - List published projects with filters
- `GET /api/projects/[slug]` - Get project details
- `POST /api/projects` - Create project (admin only)
- `PATCH /api/projects/[slug]` - Update project (admin only)
- `DELETE /api/projects/[slug]` - Delete project (admin only)

### Reviews
- `GET /api/reviews` - Get approved reviews
- `POST /api/reviews` - Submit new review

### Inquiries
- `POST /api/inquiries` - Submit contact form
- `GET /api/inquiries` - Get all inquiries (admin only)

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get user's payments
- `POST /api/payments/verify` - Verify Paystack payment

### Clients
- `GET /api/clients/projects` - Get client's projects
- `POST /api/clients/projects` - Submit new project

### Analytics
- `POST /api/analytics` - Track page visit
- `GET /api/analytics` - Get analytics data (admin only)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy
```

### Custom Domain

1. Add custom domain in Vercel project settings
2. Update DNS records as instructed
3. Test domain connectivity

## First-Time Admin Setup

1. Go to `/auth/admin/signup`
2. Create your admin account
3. You now have access to `/admin` dashboard
4. Start managing projects, reviews, and payments

## Client Workflow

1. Client visits website and fills contact form → WhatsApp integration
2. Or client creates account at `/auth/client/signup`
3. Client can submit projects at `/hire`
4. Client receives payment link via Paystack
5. After payment, project stored in database
6. Admin reviews and updates project status
7. Client can check status in `/client/dashboard`

## Customization

### Update Surveyor Details
- Update name in `components/Navbar.tsx` and `components/sections/Hero.tsx`
- Update contact info in `components/Footer.tsx`
- Update WhatsApp number in `lib/auth.ts` and API routes

### Styling
- Color scheme is defined in `app/globals.css`
- Primary: #FF6B00 (Orange)
- Background: #0B0B0B (Dark)
- Modify CSS variables to change theme

### Services List
- Update services in `components/sections/Services.tsx`
- Add/remove service options in contact and hire forms

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` - use `.env.example` as template
2. **JWT Secret**: Use a strong, randomly generated secret (min 32 characters)
3. **Password Hashing**: Passwords are hashed with bcrypt (10 salt rounds)
4. **HTTPS**: Always deploy with HTTPS enabled
5. **CORS**: Configure CORS if frontend and backend are on different domains
6. **Rate Limiting**: Consider implementing rate limiting for auth endpoints in production

## Performance Optimizations

- Images are lazy-loaded
- Animations use GPU acceleration (transform, opacity)
- Database queries are indexed
- API responses use pagination
- Analytics don't block main request

## Troubleshooting

### MongoDB Connection Error
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure database user has appropriate permissions

### Payment Issues
- Verify Paystack API keys are correct
- Test with Paystack test keys first
- Check network tab for failed requests

### Auth Issues
- Clear cookies and localStorage
- Verify JWT_SECRET is consistent
- Check email format and constraints

## Support & Maintenance

For issues or updates:
1. Check existing code comments
2. Review API error messages
3. Check browser console for client-side errors
4. Check server logs for backend errors

## License

Professional use only. All rights reserved.
