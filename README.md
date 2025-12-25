# Campus Connect - Local Setup Guide

This guide will help you get Campus Connect running on your local machine.

## Prerequisites
- **Node.js**: (v16 or higher recommended)
- **MongoDB**: A local instance or a MongoDB Atlas URI.

## Getting Started

### 1. Server Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your details (especially `MONGO_URI` and `JWT_SECRET`).
4. Start the server:
   ```bash
   npm start
   ```

### 2. Client Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

## Deployment

### GitHub & Vercel
1. Create a new repository on GitHub.
2. Initialize git in the root folder, add your files, and push to GitHub.
   ```bash
   git init
   ```
3. On Vercel:
   - Connect your GitHub repository.
   - For the **Frontend**, use the `client` directory as the root.
   - For the **Backend**, you may need to deploy the `server` to a platform like Render, Railway, or Vercel (using serverless functions).

### Note on Vercel Full Stack
If you deploy everything to Vercel, ensure you configure the `vercel.json` appropriately to handle both the React app and the Node.js API routes.
