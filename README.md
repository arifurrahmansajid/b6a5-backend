# Ummah Care Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-black)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-22.0-635BFF)](https://stripe.com/)

A robust, scalable REST API backend for the Ummah Care humanitarian platform. Built with Node.js, Express, TypeScript, and Prisma ORM for optimal performance and developer experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**Ummah Care Backend** is the API powerhouse behind the humanitarian platform, providing secure, scalable endpoints for user management, help requests, donations, messaging, and real-time coordination. The backend ensures data integrity, payment processing, and seamless communication between all platform users.

### Core Responsibilities

- User authentication and authorization
- Help request and response management
- Secure payment processing with Stripe
- Real-time messaging and notifications
- Data analytics and reporting
- File upload and processing

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (User, Donor, Volunteer, Organization, Admin)
- Secure password hashing and validation
- Session management and token refresh

### 📋 Request Management System

- CRUD operations for help requests
- Category and priority-based filtering
- Location-based search and matching
- Status tracking and lifecycle management

### 💳 Payment Processing

- Stripe integration for secure donations
- Webhook handling for payment events
- Transaction tracking and reconciliation
- Multi-currency support

### 💬 Real-time Communication

- Secure messaging between users
- Notification system for updates
- Email notifications via Nodemailer
- Real-time status updates

### 📊 Analytics & Reporting

- User activity tracking
- Donation and impact metrics
- Request fulfillment statistics
- Performance analytics and insights

### 🛡️ Security & Compliance

- Input validation with Zod schemas
- CORS configuration for cross-origin requests
- Rate limiting and security middleware
- Data encryption and secure storage

## 🏗️ Architecture

### Backend Architecture

```
Node.js + Express Server
├── RESTful API Endpoints (/api/v1)
├── Authentication Middleware (JWT + Roles)
├── Database Layer (Prisma ORM + PostgreSQL)
├── Payment Integration (Stripe)
├── Email Service (Nodemailer)
├── File Upload (Multer)
└── Real-time Features (WebSocket Support)
```

### API Design Principles

- **RESTful**: Standard HTTP methods and status codes
- **Versioned**: API versioning for backward compatibility
- **Validated**: Input validation with Zod schemas
- **Documented**: Comprehensive API documentation
- **Secure**: Authentication and authorization on all endpoints

## 🛠️ Technology Stack

### Runtime & Framework

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.2
- **Language**: TypeScript 5.9
- **Module System**: ES Modules

### Database & ORM

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 7.5
- **Migration**: Prisma Migrate
- **Connection**: Connection pooling with pg

### Authentication & Security

- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod schemas
- **Security**: CORS, Helmet, Rate limiting
- **Password**: bcrypt for hashing

### Payment & External Services

- **Payments**: Stripe 22.0
- **Email**: Nodemailer
- **File Upload**: Multer (planned)

### Development Tools

- **Build Tool**: ESBuild
- **Development**: tsx (TypeScript execution)
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky + lint-staged

## 📁 Project Structure

```
ummah-care-backend/
├── prisma/                         # Database configuration
│   ├── migrations/                 # Database migrations
│   ├── schema/                     # Prisma schema files
│   │   ├── schema.prisma           # Main schema configuration
│   │   ├── auth.prisma             # Authentication models
│   │   ├── userTypeEntry.prisma    # User role definitions
│   │   ├── request.prisma          # Help request models
│   │   ├── response.prisma         # Response models
│   │   ├── donation.prisma         # Donation models
│   │   ├── message.prisma          # Messaging models
│   │   ├── notification.prisma     # Notification models
│   │   ├── organization.prisma     # Organization models
│   │   ├── campaign.prisma         # Campaign models
│   │   ├── assignment.prisma       # Volunteer assignments
│   │   ├── review.prisma           # Review and rating system
│   │   └── report.prisma           # Reporting models
│   └── seed.ts                     # Database seeding script
├── src/
│   ├── app/                        # Application core
│   │   ├── config/                 # Configuration files
│   │   │   ├── database.ts         # Database configuration
│   │   │   ├── environment.ts      # Environment variables
│   │   │   └── stripe.ts           # Stripe configuration
│   │   ├── constants/              # Application constants
│   │   │   ├── http-status.ts      # HTTP status codes
│   │   │   └── messages.ts         # Response messages
│   │   ├── lib/                    # Core libraries
│   │   │   ├── prisma.ts           # Prisma client instance
│   │   │   ├── logger.ts           # Logging utility
│   │   │   └── validation.ts       # Validation helpers
│   │   ├── middlewares/            # Express middlewares
│   │   │   ├── auth.middleware.ts  # Authentication middleware
│   │   │   ├── cors.middleware.ts  # CORS configuration
│   │   │   ├── error.middleware.ts # Error handling
│   │   │   ├── rate-limit.middleware.ts # Rate limiting
│   │   │   └── validation.middleware.ts # Request validation
│   │   ├── modules/                # Feature modules
│   │   │   ├── auth/               # Authentication module
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── user/               # User management
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── user.validation.ts
│   │   │   ├── request/            # Help requests
│   │   │   │   ├── request.controller.ts
│   │   │   │   ├── request.routes.ts
│   │   │   │   ├── request.service.ts
│   │   │   │   └── request.validation.ts
│   │   │   ├── response/           # Request responses
│   │   │   │   ├── response.controller.ts
│   │   │   │   ├── response.routes.ts
│   │   │   │   ├── response.service.ts
│   │   │   │   └── response.validation.ts
│   │   │   ├── donation/           # Donation management
│   │   │   │   ├── donation.controller.ts
│   │   │   │   ├── donation.routes.ts
│   │   │   │   ├── donation.service.ts
│   │   │   │   └── donation.validation.ts
│   │   │   ├── payment/            # Payment processing
│   │   │   │   ├── payment.controller.ts
│   │   │   │   ├── payment.routes.ts
│   │   │   │   ├── payment.service.ts
│   │   │   │   └── payment.validation.ts
│   │   │   ├── message/            # Messaging system
│   │   │   │   ├── message.controller.ts
│   │   │   │   ├── message.routes.ts
│   │   │   │   ├── message.service.ts
│   │   │   │   └── message.validation.ts
│   │   │   └── stats/              # Analytics and statistics
│   │   │       ├── stats.controller.ts
│   │   │       ├── stats.routes.ts
│   │   │       ├── stats.service.ts
│   │   │       └── stats.validation.ts
│   │   ├── routes/                 # Route aggregators
│   │   │   ├── index.ts            # Main router
│   │   │   └── v1/                 # API v1 routes
│   │   ├── seeds/                  # Database seeds
│   │   ├── templates/              # Email templates
│   │   │   ├── welcome.ejs         # Welcome email
│   │   │   └── donation-receipt.ejs # Donation receipt
│   │   ├── types/                  # TypeScript types
│   │   │   ├── auth.types.ts       # Authentication types
│   │   │   ├── common.types.ts     # Common types
│   │   │   └── api.types.ts        # API response types
│   │   └── utils/                  # Utility functions
│   │       ├── jwt.utils.ts        # JWT utilities
│   │       ├── email.utils.ts      # Email utilities
│   │       ├── pagination.utils.ts # Pagination helpers
│   │       └── response.utils.ts   # Response formatters
│   ├── app.ts                      # Express app configuration
│   ├── generated/                  # Generated files (Prisma client)
│   └── server.ts                   # Server entry point
├── .env.example                    # Environment variables template
├── build.js                        # Build script
├── eslint.config.mjs               # ESLint configuration
├── package.json                    # Dependencies and scripts
├── prisma.config.ts                # Prisma configuration
├── tsconfig.json                   # TypeScript configuration
└── vercel.json                     # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.17 or higher
- **PostgreSQL**: Version 15 or higher
- **pnpm**: Version 8.0 or higher
- **Git**: Version control system

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ummah-care-backend.git
   cd ummah-care-backend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Configure the following environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ummah_care"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-token-secret"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."

   # Email
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"

   # Server
   PORT=5000
   NODE_ENV="development"
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   pnpm db:generate

   # Run migrations
   pnpm db:migrate

   # Seed database (optional)
   pnpm seed
   ```

5. **Start Development Server**

   ```bash
   pnpm dev
   ```

6. **Verify Installation**
   The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

#### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/:id` - Get user by ID

#### Help Requests

- `GET /requests` - List help requests (with filtering)
- `POST /requests` - Create new request
- `GET /requests/:id` - Get request details
- `PUT /requests/:id` - Update request
- `DELETE /requests/:id` - Delete request

#### Responses

- `GET /responses` - List responses
- `POST /responses` - Create response
- `PUT /responses/:id/status` - Update response status

#### Donations

- `POST /donations` - Create donation
- `GET /donations/:id` - Get donation details
- `GET /donations/user/:userId` - Get user donations

#### Payments

- `POST /payments/create-session` - Create Stripe checkout session
- `POST /payments/webhook` - Stripe webhook handler

#### Messages

- `GET /messages/:conversationId` - Get conversation messages
- `POST /messages` - Send message
- `PUT /messages/:id/read` - Mark message as read

#### Statistics

- `GET /stats/dashboard` - Get dashboard statistics
- `GET /stats/impact` - Get impact metrics

## 🗄️ Database Schema

### Core Entities

#### User Management

- **User**: Base user information and authentication
- **UserTypeEntry**: Role definitions (User, Donor, Volunteer, Organization)
- **Auth**: Authentication tokens and sessions

#### Help System

- **Request**: Help requests with categories and priorities
- **Response**: Responses to help requests (donations, volunteering, etc.)
- **Assignment**: Volunteer task assignments

#### Financial System

- **Donation**: Donation records and tracking
- **Payment**: Payment processing and reconciliation

#### Communication

- **Message**: Direct messaging between users
- **Notification**: System notifications and alerts

#### Organization

- **Organization**: Organization profiles and management
- **Campaign**: Large-scale campaigns and initiatives

#### Review System

- **Review**: User reviews and ratings
- **Report**: Issue reporting and moderation

### Database Relationships

```
User (1) ──── (N) Request
User (1) ──── (N) Response
User (1) ──── (N) Donation
User (1) ──── (N) Message
Request (1) ──── (N) Response
Organization (1) ──── (N) Campaign
Campaign (1) ──── (N) Assignment
```

## 💻 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server with hot reload
pnpm start        # Start production server
pnpm build        # Build for production

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:reset     # Reset database (WARNING: destroys data)
pnpm db:studio    # Open Prisma Studio

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Auto-fix linting issues
pnpm format       # Format code with Prettier

# Testing
pnpm test         # Run tests (when implemented)

# Utilities
pnpm seed         # Seed database with sample data
pnpm clean        # Clean build artifacts
```

### Development Workflow

1. **Database Changes**

   ```bash
   # Modify schema files in prisma/schema/
   pnpm db:migrate  # Create and apply migration
   pnpm db:generate # Regenerate Prisma client
   ```

2. **API Development**
   - Create controller, service, and validation files
   - Add routes in the appropriate module
   - Update types and middleware as needed

3. **Testing Stripe Webhooks**

   ```bash
   # Start webhook listener
   pnpm stripe:listen

   # Trigger test events
   pnpm stripe:trigger:succeeded
   ```

### Code Quality Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with TypeScript rules
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit linting and formatting
- **Commit Messages**: Conventional commits format

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

2. **Environment Variables**
   Configure production environment variables in Vercel dashboard.

3. **Build Settings**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Node Version: 18.x

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Development Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- Follow the existing code structure and patterns
- Add TypeScript types for new features
- Update API documentation for endpoint changes
- Ensure all code passes linting and type checking
- Add appropriate error handling and validation

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn and contribute
- Maintain professional communication

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Community**: Thanks to all contributors and supporters
- **Open Source**: Built on amazing open-source technologies
- **Ummah**: Dedicated to serving and strengthening our community

## 📞 Support

For support, questions, or collaboration opportunities:

- **Email**: support@ummahcare.com
- **Issues**: [GitHub Issues](https://github.com/your-username/ummah-care-backend/issues)
- **API Docs**: [Postman Collection](https://documenter.getpostman.com/view/...)

---

**Built with ❤️ for the Ummah**
