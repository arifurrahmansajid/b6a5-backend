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

### Prerequisites

- **Node.js**: Version 18.17 or higher
- **PostgreSQL**: Version 15 or higher
- **pnpm**: Version 8.0 or higher
- **Git**: Version control system

