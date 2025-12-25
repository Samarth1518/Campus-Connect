const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, isApproved, isAdmin, isOrganizer } = require('../middleware/authMiddleware');

// @route   GET /api/events
// @desc    Get all approved events (for students) or all events (for admin)
// @access  Private
router.get('/', protect, isApproved, async (req, res) => {
    try {
        let events;

        if (req.user.role === 'admin') {
            // Admin sees all events
            events = await Event.find().populate('organizer', 'name email branch').sort({ createdAt: -1 });
        } else if (req.user.role === 'organizer') {
            // Organizer sees only their own events
            events = await Event.find({ organizer: req.user._id }).populate('organizer', 'name email branch').sort({ createdAt: -1 });
        } else {
            // Students see only approved upcoming events
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            events = await Event.find({
                status: 'approved',
                date: { $gte: today }
            }).populate('organizer', 'name email branch').sort({ date: 1 });
        }

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/events
// @desc    Create a new event (organizer only)
// @access  Private (Organizer)
router.post('/', protect, isApproved, isOrganizer, async (req, res) => {
    try {
        const { title, description, date, location, category, branch } = req.body;

        // Validation
        if (!title || !description || !date || !location || !category || !branch) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            branch,
            organizer: req.user._id,
            status: 'pending'
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private (Admin or Organizer who created it)
router.put('/:id', protect, isApproved, async (req, res) => {
    try {
        const { title, description, date, location, category, branch } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is admin or the organizer who created the event
        if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        // Check if event date has passed
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(event.date) < today) {
            return res.status(400).json({ message: 'Cannot edit an event that has already passed' });
        }

        // Update fields
        if (title) event.title = title;
        if (description) event.description = description;
        if (date) event.date = date;
        if (location) event.location = location;
        if (category) event.category = category;
        if (branch) event.branch = branch;

        // If organizer edits, set status back to pending
        if (req.user.role === 'organizer') {
            event.status = 'pending';
        }

        await event.save();
        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/events/:id/approve
// @desc    Approve or reject an event (admin only)
// @access  Private (Admin)
router.put('/:id/approve', protect, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use approved or rejected.' });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        event.status = status;
        await event.save();

        res.json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private (Admin or Organizer who created it)
router.delete('/:id', protect, isApproved, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is admin or the organizer who created the event
        if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
