const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', protect, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/admin/users/:id/approve
// @desc    Approve or reject a user (organizer)
// @access  Private (Admin)
router.put('/users/:id/approve', protect, isAdmin, async (req, res) => {
    try {
        const { isApproved } = req.body;

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({ message: 'Please provide isApproved as boolean' });
        }

        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isApproved = isApproved;
        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', protect, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalOrganizers = await User.countDocuments({ role: 'organizer' });
        const pendingOrganizers = await User.countDocuments({ role: 'organizer', isApproved: false });
        const totalEvents = await Event.countDocuments();
        const pendingEvents = await Event.countDocuments({ status: 'pending' });
        const approvedEvents = await Event.countDocuments({ status: 'approved' });
        const totalRegistrations = await Registration.countDocuments();

        res.json({
            totalUsers,
            totalStudents,
            totalOrganizers,
            pendingOrganizers,
            totalEvents,
            pendingEvents,
            approvedEvents,
            totalRegistrations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin user' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
