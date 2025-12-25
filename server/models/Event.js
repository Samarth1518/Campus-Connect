const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other']
    },
    branch: {
        type: String,
        required: true,
        enum: ['CS', 'CS-AIML', 'CSBS', 'CSDS', 'ECE', 'EEE', 'Mechanical', 'Civil', 'All Branches']
    },
    maxParticipants: {
        type: Number,
        default: 1000
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', eventSchema);
