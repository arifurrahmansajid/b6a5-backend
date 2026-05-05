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

