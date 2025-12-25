const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user (student or organizer)
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, branch } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if role is valid
        if (!['student', 'organizer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Choose student or organizer.' });
        }

        // Validate branch for non-admin users
        if (role !== 'admin' && !branch) {
            return res.status(400).json({ message: 'Please select your branch' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role,
            branch
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branch: user.branch,
                isApproved: user.isApproved,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check for admin login
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Check if admin user exists in database
            let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

            if (!adminUser) {
                // Create admin user if doesn't exist
                adminUser = await User.create({
                    name: 'Admin',
                    email: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD,
                    role: 'admin',
                    isApproved: true
                });
            }

            return res.json({
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                branch: adminUser.branch,
                isApproved: adminUser.isApproved,
                token: generateToken(adminUser._id)
            });
        }

        // Regular user login
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                branch: user.branch,
                isApproved: user.isApproved,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
