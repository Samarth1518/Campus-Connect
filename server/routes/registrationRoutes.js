const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect, isApproved, isStudent } = require('../middleware/authMiddleware');

// @route   POST /api/registrations
// @desc    Register for an event (student only)
// @access  Private (Student)
router.post('/', protect, isApproved, isStudent, async (req, res) => {
    try {
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: 'Please provide event ID' });
        }

        // Check if event exists and is approved
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'approved') {
            return res.status(400).json({ message: 'Cannot register for unapproved events' });
        }

        // Check if already registered
        const existingRegistration = await Registration.findOne({
            student: req.user._id,
            event: eventId
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        // Check if event is full
        const registrationCount = await Registration.countDocuments({ event: eventId });
        if (registrationCount >= event.maxParticipants) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Create registration
        const registration = await Registration.create({
            student: req.user._id,
            event: eventId
        });

        const populatedRegistration = await Registration.findById(registration._id)
            .populate('event')
            .populate('student', 'name email');

        res.status(201).json(populatedRegistration);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/registrations
// @desc    Get all registrations for current student
// @access  Private (Student)
router.get('/', protect, isApproved, isStudent, async (req, res) => {
    try {
        const registrations = await Registration.find({ student: req.user._id })
            .populate({
                path: 'event',
                populate: { path: 'organizer', select: 'name email branch' }
            })
            .sort({ registeredAt: -1 });

        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/registrations/:id
// @desc    Cancel registration
// @access  Private (Student)
router.delete('/:id', protect, isApproved, isStudent, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check if registration belongs to current user
        if (registration.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this registration' });
        }

        await Registration.findByIdAndDelete(req.params.id);
        res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get all registrations for a specific event (for organizers/admin)
// @access  Private
router.get('/event/:eventId', protect, isApproved, async (req, res) => {
    try {
        const registrations = await Registration.find({ event: req.params.eventId })
            .populate('student', 'name email branch')
            .sort({ registeredAt: -1 });

        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
