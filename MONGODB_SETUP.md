# MongoDB Setup Instructions

## Issue
The MongoDB connection is failing because the cluster URL needs to be configured.

## Quick Fix Options

### Option 1: Use MongoDB Atlas (Recommended)

1. **Go to**: https://cloud.mongodb.com
2. **Login** or create free account
3. **Create Cluster** (if you don't have one):
   - Click "Build a Database"
   - Choose "Free" (M0)
   - Click "Create"

4. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `Samarth1518`
   - Password: `Samarth1518`
   - Click "Add User"

5. **Allow Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - Enter: `0.0.0.0/0`
   - Click "Confirm"

6. **Get Connection String**:
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://Samarth1518:<password>@cluster0.xxxxx.mongodb.net/`

7. **Update `.env` file**:
   - Open: `server\.env`
   - Find line starting with `MONGO_URI=`
   - Replace with your connection string
   - Replace `<password>` with `Samarth1518`
   - Add `/CampusConnect` before the `?`

**Example:**
```
MONGO_URI=mongodb+srv://Samarth1518:Samarth1518@cluster0.abc12.mongodb.net/CampusConnect?retryWrites=true&w=majority
```

### Option 2: Use Local MongoDB (If installed)

If you have MongoDB installed locally:

Update `server\.env`:
```
MONGO_URI=mongodb://localhost:27017/CampusConnect
```

## After Fixing

Run these commands:
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd client
npm start
```

The app will open at http://localhost:3000
