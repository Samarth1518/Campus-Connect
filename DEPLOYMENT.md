# 🚀 Deployment Guide - Campus Connect

This guide will help you deploy Campus Connect to GitHub, Vercel (Frontend), and Render (Backend).

---

## 📋 Pre-Deployment Checklist

✅ `.gitignore` files are configured (root, client, server)  
✅ `node_modules` will NOT be committed to GitHub  
✅ `.env` files will NOT be committed (use platform environment variables)  
✅ MongoDB Atlas is accessible from anywhere (IP: 0.0.0.0/0)

---

## 1️⃣ Deploy to GitHub

### Step 1: Initialize Git Repository
```bash
cd Campus-Connect

# Initialize git
git init

# Add all files (node_modules will be ignored)
git add .

# Commit
git commit -m "Initial commit: Campus Connect MERN project"
```

### Step 2: Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name: `campus-connect`
4. Don't initialize with README (we already have one)
5. Click "Create repository"

### Step 3: Push to GitHub
```bash
# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/campus-connect.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ **Your code is now on GitHub!** (without node_modules)

---

## 2️⃣ Deploy Backend to Render

### Step 1: Prepare Backend
Your backend is already configured! The `.gitignore` ensures clean deployment.

### Step 2: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### Step 3: Configure Render
1. **Connect Repository**: Select `campus-connect`
2. **Settings**:
   - Name: `campus-connect-backend`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Environment Variables** (Click "Advanced"):
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://Samarth1518:Samarth1518@cluster0.mongodb.net/CampusConnect?retryWrites=true&w=majority
   JWT_SECRET=campus_connect_secret_key_2024_mern_project
   ADMIN_EMAIL=ngsamarth2004@gmail.com
   ADMIN_PASSWORD=Sam@15082004
   NODE_ENV=production
   ```

4. Click "Create Web Service"

### Step 4: Get Backend URL
After deployment completes, you'll get a URL like:
```
https://campus-connect-backend.onrender.com
```
**Save this URL!** You'll need it for frontend.

---

## 3️⃣ Deploy Frontend to Vercel

### Step 1: Update API URL in Frontend
Before deploying, update the client to use your Render backend URL.

**Option A: Using Environment Variable (Recommended)**

Create `client/.env.production`:
```env
REACT_APP_API_URL=https://campus-connect-backend.onrender.com
```

Then update `client/package.json` to use it:
```json
{
  "proxy": "http://localhost:5000"  // Remove this line for production
}
```

Update all fetch calls in client to use:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
fetch(`${API_URL}/api/auth/login`, ...)
```

**Option B: Direct Update (Quick)**

Update `client/package.json`:
```json
{
  "proxy": "https://campus-connect-backend.onrender.com"
}
```

### Step 2: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import `campus-connect` repository
5. **Configure**:
   - Framework Preset: `Create React App`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://campus-connect-backend.onrender.com
   ```
7. Click "Deploy"

### Step 3: Update CORS in Backend
After frontend deploys, update `server/index.js`:

```javascript
// Update CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'  // Add your Vercel URL
  ],
  credentials: true
}));
```

Commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Render will auto-deploy the update!

---

## 4️⃣ Alternative: Deploy Both to Render

If you prefer to deploy both frontend and backend on Render:

### Backend (Same as above)
Follow "Deploy Backend to Render" steps.

### Frontend on Render
1. Create another Web Service
2. **Settings**:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s build -l $PORT`
3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://campus-connect-backend.onrender.com
   ```

---

## 🔧 MongoDB Atlas Configuration

### Allow All IPs (Required for Render/Vercel)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Network Access"
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere"
5. Enter: `0.0.0.0/0`
6. Click "Confirm"

This allows Render and Vercel to connect to your database.

---

## ✅ Post-Deployment Testing

### Test Backend
```bash
# Test API is live
curl https://campus-connect-backend.onrender.com

# Should return: {"message": "Welcome to Campus Connect API", ...}
```

### Test Frontend
1. Open your Vercel URL
2. Try to login as admin
3. Register a new student
4. Create events as organizer

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: Ensure MongoDB Atlas allows IP `0.0.0.0/0`

### Issue: "CORS error"
**Solution**: Add your Vercel URL to CORS origins in `server/index.js`

### Issue: "API calls fail from frontend"
**Solution**: Check `REACT_APP_API_URL` environment variable in Vercel

### Issue: "Render service won't start"
**Solution**: Check environment variables are set correctly

### Issue: "Build fails on Vercel"
**Solution**: Ensure `client` is set as root directory

---

## 📝 Environment Variables Summary

### Backend (Render)
```
PORT=5000
MONGO_URI=mongodb+srv://Samarth1518:Samarth1518@cluster0.mongodb.net/CampusConnect?retryWrites=true&w=majority
JWT_SECRET=campus_connect_secret_key_2024_mern_project
ADMIN_EMAIL=ngsamarth2004@gmail.com
ADMIN_PASSWORD=Sam@15082004
NODE_ENV=production
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://campus-connect-backend.onrender.com
```

---

## 🎉 Success!

Your Campus Connect app is now live:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://campus-connect-backend.onrender.com
- **Database**: MongoDB Atlas (CampusConnect)

Share your live URLs with your professor! 🎓

---

## 📌 Important Notes

1. **Free Tier Limitations**:
   - Render free tier: Service sleeps after 15 min of inactivity
   - First request after sleep takes ~30 seconds
   - Vercel: No sleep, always fast

2. **Security**:
   - Never commit `.env` files
   - Use environment variables on platforms
   - Keep MongoDB credentials secure

3. **Updates**:
   - Push to GitHub → Render/Vercel auto-deploy
   - Changes reflect in ~2-3 minutes

---

**Need Help?** Check platform documentation:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
