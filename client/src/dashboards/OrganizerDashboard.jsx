import React, { useState, useEffect } from 'react';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showRegModal, setShowRegModal] = useState(false);
    const [selectedEventRegs, setSelectedEventRegs] = useState([]);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');
    const [userBranch, setUserBranch] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editEventId, setEditEventId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        branch: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.branch) {
            setUserBranch(user.branch);
            setFormData(prev => ({ ...prev, branch: user.branch }));
        }
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch events');

            const data = await response.json();
            setEvents(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchRegistrations = async (eventId, eventTitle) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/registrations/event/${eventId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch registrations');

            const data = await response.json();
            setSelectedEventRegs(data);
            setSelectedEventTitle(eventTitle);
            setShowRegModal(true);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const url = isEditing ? `/api/events/${editEventId}` : '/api/events';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            alert(isEditing ? 'Event updated successfully!' : 'Event created successfully! Waiting for admin approval.');
            setShowModal(false);
            setIsEditing(false);
            setEditEventId(null);
            setFormData({
                title: '',
                description: '',
                date: '',
                location: '',
                category: '',
                branch: userBranch
            });
            fetchEvents();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEdit = (event) => {
        setEditEventId(event._id);
        setIsEditing(true);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date.split('T')[0],
            location: event.location,
            category: event.category,
            branch: event.branch
        });
        setShowModal(true);
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete event');

            alert('Event deleted successfully');
            fetchEvents();
        } catch (err) {
            alert(err.message);
        }
    };

    const pendingEvents = events.filter(e => e.status === 'pending');
    const approvedEvents = events.filter(e => e.status === 'approved');

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                Loading events...
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Organizer Dashboard</h1>
                <p className="dashboard-subtitle">Manage your campus events</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{events.length}</div>
                    <div className="stat-label">Total Events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{pendingEvents.length}</div>
                    <div className="stat-label">Pending Approval</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{approvedEvents.length}</div>
                    <div className="stat-label">Approved Events</div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Create New Event
                </button>
            </div>

            <h2 style={{ marginBottom: '1.5rem', color: '#4facfe' }}>My Events</h2>

            {events.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <p>You haven't created any events yet</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Create Your First Event
                    </button>
                </div>
            ) : (
                events.map(event => {
                    const formattedDate = formatDate(event.date);
                    return (
                        <div key={event._id} className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{event.title}</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <span className="card-badge badge-approved">{event.category}</span>
                                        <span className="card-badge badge-approved">{event.branch}</span>
                                    </div>
                                </div>
                                <span className={`card-badge badge-${event.status}`}>
                                    {event.status.toUpperCase()}
                                </span>
                            </div>
                            <p className="card-description">{event.description}</p>
                            <div className="card-info">
                                📅 {formattedDate}
                            </div>
                            <div className="card-info">
                                📍 {event.location}
                            </div>
                            <div className="card-actions">
                                {event.status === 'approved' && (
                                    <button
                                        className="btn btn-success"
                                        onClick={() => fetchRegistrations(event._id, event.title)}
                                    >
                                        View Registrations
                                    </button>
                                )}
                                <button
                                    className="btn btn-outline"
                                    onClick={() => handleEdit(event)}
                                    disabled={new Date(event.date) < new Date().setHours(0, 0, 0, 0)}
                                >
                                    Edit Event
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(event._id)}
                                >
                                    Delete Event
                                </button>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Event Creation Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                    setEditEventId(null);
                    setFormData({
                        title: '',
                        description: '',
                        date: '',
                        location: '',
                        category: '',
                        branch: userBranch
                    });
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
                            <button className="modal-close" onClick={() => {
                                setShowModal(false);
                                setIsEditing(false);
                                setEditEventId(null);
                                setFormData({
                                    title: '',
                                    description: '',
                                    date: '',
                                    location: '',
                                    category: '',
                                    branch: userBranch
                                });
                            }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Event Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter event title"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    placeholder="Describe your event"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Event Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="Event location"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Organizing Branch</label>
                                <select
                                    name="branch"
                                    className="form-select"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Branch</option>
                                    <option value="CS">CS</option>
                                    <option value="CS-AIML">CS-AIML</option>
                                    <option value="CSBS">CSBS</option>
                                    <option value="CSDS">CSDS</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                    <option value="All Branches">All Branches</option>
                                </select>
                            </div>



                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                    {isEditing ? 'Update Event' : 'Create Event'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsEditing(false);
                                        setEditEventId(null);
                                        setFormData({
                                            title: '',
                                            description: '',
                                            date: '',
                                            location: '',
                                            category: '',
                                            branch: userBranch
                                        });
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Registration Viewing Modal */}
            {showRegModal && (
                <div className="modal-overlay" onClick={() => setShowRegModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Registrations</h2>
                                <p style={{ color: '#888', margin: 0 }}>{selectedEventTitle}</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowRegModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="registration-list" style={{ marginTop: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                            {selectedEventRegs.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem' }}>No registrations yet.</p>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Branch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedEventRegs.map(reg => (
                                            <tr key={reg._id}>
                                                <td>{reg.student?.name || 'Unknown Student'}</td>
                                                <td>{reg.student?.email || 'N/A'}</td>
                                                <td>{reg.student?.branch || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <button
                            className="btn btn-outline"
                            onClick={() => setShowRegModal(false)}
                            style={{ width: '100%', marginTop: '1.5rem' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizerDashboard;
