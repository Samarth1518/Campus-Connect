# 🚀 QUICK START GUIDE - Campus Connect

## ⚡ Fast Setup (5 Minutes)

### Step 1: Extract & Navigate
```bash
# Extract Campus-Connect.zip
# Open two terminals in the Campus-Connect folder
```

### Step 2: Start Backend (Terminal 1)
```bash
cd server
npm install
npm start
```
✅ Backend running on http://localhost:5000

### Step 3: Start Frontend (Terminal 2)
```bash
cd client
npm install
npm start
```
✅ Frontend opens automatically on http://localhost:3000

## 🔑 Login Credentials

### Admin Account (Pre-configured)
- **Email:** ngsamarth2004@gmail.com
- **Password:** Sam@15082004

### Test Accounts (Create yourself)
1. **Student:** Register with role "Student" - instant access
2. **Organizer:** Register with role "Organizer" - needs admin approval

## 📝 Quick Test Flow

### 1️⃣ Test Admin (2 minutes)
1. Login as admin
2. View dashboard statistics
3. Keep this tab open for approvals

### 2️⃣ Test Organizer (3 minutes)
1. Register new account as "Event Organizer"
2. Go back to admin tab
3. Approve the organizer in "Pending Organizers"
4. Login as organizer
5. Create a new event
6. Go back to admin tab
7. Approve the event in "Pending Events"

### 3️⃣ Test Student (2 minutes)
1. Register new account as "Student"
2. View approved events
3. Register for an event
4. View "My Registrations"
5. Cancel registration (optional)

## 🎯 Key Features to Test

✅ **Authentication**
- Student registration (auto-approved)
- Organizer registration (needs approval)
- Admin login with fixed credentials

✅ **Student Features**
- Browse approved events
- Register for events
- View and cancel registrations

✅ **Organizer Features**
- Create events (goes to pending)
- View own events with status
- Delete events

✅ **Admin Features**
- Approve/reject organizers
- Approve/reject events
- View all users and events
- Dashboard statistics
- Delete users/events

## 🎨 UI Highlights

- **Dark Gradient Theme** - Beautiful blue/black gradients
- **Glassmorphism Cards** - Modern frosted glass effects
- **Smooth Animations** - Hover effects and transitions
- **Responsive Design** - Works on all screen sizes
- **Role-based Dashboards** - Different UI for each role

## ⚠️ Common Issues

**Backend won't start?**
- Check if port 5000 is free
- Verify MongoDB connection in server/.env

**Frontend won't start?**
- Check if port 3000 is free
- Clear npm cache: `npm cache clean --force`

**Can't login?**
- Use exact admin credentials
- For organizers, ensure admin approval first

**Database errors?**
- Check internet connection
- Verify MongoDB Atlas credentials
- Database "CampusConnect" will be created automatically

## 📊 MongoDB Setup

The project is configured to use MongoDB Atlas with:
- **Username:** Samarth1518
- **Password:** Samarth1518
- **Database:** CampusConnect (auto-created)

If you need to change this, edit `server/.env`

## 🎓 Project Structure

```
Campus-Connect/
├── server/          → Backend (Port 5000)
│   ├── models/      → MongoDB schemas
│   ├── routes/      → API endpoints
│   └── middleware/  → Auth & validation
│
└── client/          → Frontend (Port 3000)
    ├── src/
    │   ├── dashboards/  → Role-based UIs
    │   ├── components/  → Reusable components
    │   └── pages.jsx    → Auth pages
    └── public/
```

## 💡 Pro Tips

1. **Keep both terminals running** - Backend and Frontend
2. **Test in order** - Admin → Organizer → Student
3. **Use Chrome DevTools** - Check Network tab for API calls
4. **Check Console** - Look for any errors
5. **MongoDB Atlas** - Ensure IP is whitelisted (0.0.0.0/0 for testing)

## 🎉 Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Admin can login
- [ ] Can register new users
- [ ] Organizer approval works
- [ ] Event creation works
- [ ] Event approval works
- [ ] Student can register for events
- [ ] All dashboards load correctly

---

**Need Help?** Check README.md for detailed documentation.

**Ready to Start?** Run the commands above and enjoy! 🚀
