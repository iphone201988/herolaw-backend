# HeroLaw Backend

A TypeScript-based Express.js backend application with user authentication system.

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Joi** - Request validation
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending

## Project Structure

```
herolaw-backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   └── user.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── model/            # Mongoose models
│   │   └── user.model.ts
│   ├── routes/           # Route definitions
│   │   ├── index.ts
│   │   └── user.routes.ts
│   ├── schema/           # Joi validation schemas
│   │   ├── index.ts
│   │   └── user.schema.ts
│   ├── services/         # Business logic
│   │   └── user.services.ts
│   ├── type/             # TypeScript type definitions
│   │   ├── API/
│   │   │   └── User/
│   │   │       └── types.ts
│   │   ├── Database/
│   │   │   └── types.ts
│   │   └── global.d.ts
│   ├── utils/            # Helper functions
│   │   ├── ErrorHandler.ts
│   │   ├── enums.ts
│   │   ├── helper.ts
│   │   └── sendEmail.ts
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/herolaw
JWT_SECRET=your-secret-key-here
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

3. Build the project:
```bash
npm run build
```

## Development

Run the development server with hot reload:
```bash
npm run dev
```

This will:
- Watch for TypeScript changes and compile them
- Restart the server automatically using nodemon

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for TypeScript changes and compile
- `npm run dev` - Run development server with hot reload
- `npm start` - Build and run production server

## API Endpoints

### User Authentication

- `POST /api/v1/user` - Register a new user
- `PUT /api/v1/user/verifyOtp` - Verify OTP
- `PUT /api/v1/user/sendOtp` - Send OTP
- `POST /api/v1/user/login` - Login user
- `POST /api/v1/user/socialLogin` - Social login
- `PUT /api/v1/user/changePassword` - Change password (forgot password flow)
- `GET /api/v1/user` - Get current user (requires authentication)
- `GET /api/v1/user/logout` - Logout user (requires authentication)

### Health Check

- `GET /health` - Server health check

## Features

- ✅ User registration with email verification
- ✅ OTP-based email verification
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Social login support
- ✅ Request validation with Joi
- ✅ Error handling middleware
- ✅ TypeScript type safety
- ✅ MongoDB integration

## Environment Variables

Required environment variables:

- `PORT` - Server port number
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `SMTP_EMAIL` - Email address for sending emails
- `SMTP_PASSWORD` - Email password or app password

Optional environment variables:

- `AWS_ACCESS_KEY` - AWS S3 access key
- `AWS_SECRET_KEY` - AWS S3 secret key
- `AWS_BUCKET_REGION` - AWS S3 bucket region
- `AWS_S3_BUCKET` - AWS S3 bucket name
- `AWS_S3_URI` - AWS S3 bucket URI

