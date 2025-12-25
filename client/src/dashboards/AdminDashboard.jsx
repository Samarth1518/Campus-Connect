import React, { useState, useEffect } from 'react';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('stats');
    const [showRegModal, setShowRegModal] = useState(false);
    const [selectedEventRegs, setSelectedEventRegs] = useState([]);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        branch: ''
    });
    const [editEventId, setEditEventId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch stats
            const statsRes = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fetch users
            const usersRes = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const usersData = await usersRes.json();
            setUsers(usersData);

            // Fetch events
            const eventsRes = await fetch('/api/events', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const eventsData = await eventsRes.json();
            setEvents(eventsData);

            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleApproveUser = async (userId, isApproved) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${userId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isApproved })
            });

            if (!response.ok) throw new Error('Failed to update user');

            alert(`User ${isApproved ? 'approved' : 'rejected'} successfully`);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleApproveEvent = async (eventId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/events/${eventId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update event');

            alert(`Event ${status} successfully`);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete user');

            alert('User deleted successfully');
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete event');

            alert('Event deleted successfully');
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditEvent = (event) => {
        setEditEventId(event._id);
        setEditFormData({
            title: event.title,
            description: event.description,
            date: event.date.split('T')[0],
            location: event.location,
            category: event.category,
            branch: event.branch
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/events/${editEventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }

            alert('Event updated successfully');
            setShowEditModal(false);
            fetchData();
        } catch (err) {
            alert(err.message);
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

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
                Loading dashboard...
            </div>
        );
    }

    const pendingOrganizers = users.filter(u => u.role === 'organizer' && !u.isApproved);
    const pendingEvents = events.filter(e => e.status === 'pending');

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Admin Dashboard</h1>
                <p className="dashboard-subtitle">Manage users, events, and registrations</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalStudents || 0}</div>
                    <div className="stat-label">Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalOrganizers || 0}</div>
                    <div className="stat-label">Organizers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalEvents || 0}</div>
                    <div className="stat-label">Total Events</div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users ({users.length})
                </button>
                <button
                    className={`btn ${activeTab === 'pending-organizers' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('pending-organizers')}
                >
                    Pending Organizers ({pendingOrganizers.length})
                </button>
                <button
                    className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('events')}
                >
                    Events ({events.length})
                </button>
                <button
                    className={`btn ${activeTab === 'pending-events' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('pending-events')}
                >
                    Pending Events ({pendingEvents.length})
                </button>
            </div>

            {
                activeTab === 'users' && (
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', color: '#4facfe' }}>All Users</h2>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Branch</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.branch || 'Admin'}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                                            <td>
                                                <span className={`card-badge ${user.isApproved ? 'badge-approved' : 'badge-pending'}`}>
                                                    {user.isApproved ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'pending-organizers' && (
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', color: '#4facfe' }}>Pending Organizers</h2>
                        {pendingOrganizers.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">✅</div>
                                <p>No pending organizer approvals</p>
                            </div>
                        ) : (
                            pendingOrganizers.map(user => (
                                <div key={user._id} className="card">
                                    <div className="card-header">
                                        <div>
                                            <h3 className="card-title">{user.name}</h3>
                                            <span className="card-badge badge-pending">Branch: {user.branch}</span>
                                        </div>
                                    </div>
                                    <div className="card-info">📧 {user.email}</div>
                                    <div className="card-info">📅 Registered: {new Date(user.createdAt).toLocaleDateString()}</div>
                                    <div className="card-actions">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleApproveUser(user._id, true)}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleApproveUser(user._id, false)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )
            }

            {
                activeTab === 'events' && (
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', color: '#4facfe' }}>All Events</h2>
                        {events.map(event => {
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
                                    <div className="card-info">📅 {formattedDate}</div>
                                    <div className="card-info">📍 {event.location}</div>
                                    <div className="card-info">👤 Organizer: {event.organizer?.name}</div>
                                    <div className="card-actions">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => fetchRegistrations(event._id, event.title)}
                                        >
                                            View Registrations
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => handleEditEvent(event)}
                                            disabled={new Date(event.date) < new Date().setHours(0, 0, 0, 0)}
                                        >
                                            Edit Event
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteEvent(event._id)}
                                        >
                                            Delete Event
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }

            {
                activeTab === 'pending-events' && (
                    <div>
                        <h2 style={{ marginBottom: '1.5rem', color: '#4facfe' }}>Pending Events</h2>
                        {pendingEvents.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">✅</div>
                                <p>No pending event approvals</p>
                            </div>
                        ) : (
                            pendingEvents.map(event => {
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
                                            <span className="card-badge badge-pending">PENDING</span>
                                        </div>
                                        <p className="card-description">{event.description}</p>
                                        <div className="card-info">📅 {formattedDate}</div>
                                        <div className="card-info">📍 {event.location}</div>
                                        <div className="card-info">👤 Organizer: {event.organizer?.name}</div>
                                        <div className="card-actions">
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleApproveEvent(event._id, 'approved')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleApproveEvent(event._id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )
            }

            {/* Event Edit Modal */}
            {
                showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Edit Event</h2>
                                <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
                            </div>

                            <form onSubmit={handleUpdateEvent}>
                                <div className="form-group">
                                    <label className="form-label">Event Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        value={editFormData.title}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        value={editFormData.description}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Event Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-input"
                                        value={editFormData.date}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        className="form-input"
                                        value={editFormData.location}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={editFormData.category}
                                        onChange={handleEditChange}
                                        required
                                    >
                                        <option value="Technical">Technical</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Seminar">Seminar</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Branch</label>
                                    <select
                                        name="branch"
                                        className="form-select"
                                        value={editFormData.branch}
                                        onChange={handleEditChange}
                                        required
                                    >
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
                                        Update Event
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowEditModal(false)}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Registration Viewing Modal */}
            {
                showRegModal && (
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
                )
            }
        </div >
    );
};

export default AdminDashboard;
