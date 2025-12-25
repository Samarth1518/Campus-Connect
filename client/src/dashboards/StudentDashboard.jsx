import React, { useState, useEffect } from 'react';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const StudentDashboard = () => {
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('available');
    const [branchFilter, setBranchFilter] = useState('all');

    useEffect(() => {
        fetchEvents();
        fetchRegistrations();
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

    const fetchRegistrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/registrations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch registrations');

            const data = await response.json();
            // Filter out registrations where the event might have been deleted
            const validRegistrations = data.filter(reg => reg.event !== null);
            setRegistrations(validRegistrations);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ eventId })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            alert('Successfully registered for the event!');
            fetchRegistrations();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCancelRegistration = async (registrationId) => {
        if (!window.confirm('Are you sure you want to cancel this registration?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/registrations/${registrationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to cancel registration');

            alert('Registration cancelled successfully');
            fetchRegistrations();
        } catch (err) {
            alert(err.message);
        }
    };

    const isRegistered = (eventId) => {
        return registrations.some(reg => reg.event && reg.event._id === eventId);
    };

    // Filter events by branch
    const filteredEvents = branchFilter === 'all'
        ? events
        : events.filter(event => event.branch === branchFilter || event.branch === 'All Branches');

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
                <h1 className="dashboard-title">Student Dashboard</h1>
                <p className="dashboard-subtitle">Discover and register for campus events</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{events.length}</div>
                    <div className="stat-label">Available Events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{registrations.length}</div>
                    <div className="stat-label">My Registrations</div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('available')}
                >
                    Available Events
                </button>
                <button
                    className={`btn ${activeTab === 'registered' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('registered')}
                >
                    My Registrations
                </button>
            </div>

            {activeTab === 'available' && (
                <div>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <h2 style={{ color: '#4facfe', margin: 0 }}>Available Events</h2>
                        <select
                            className="form-select"
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="all">All Branches</option>
                            <option value="CS">CS</option>
                            <option value="CS-AIML">CS-AIML</option>
                            <option value="CSBS">CSBS</option>
                            <option value="CSDS">CSDS</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                        </select>
                    </div>

                    {filteredEvents.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📅</div>
                            <p>No events available for selected branch</p>
                        </div>
                    ) : (
                        filteredEvents.map(event => {
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
                                    </div>
                                    <p className="card-description">{event.description}</p>
                                    <div className="card-info">
                                        📅 {formattedDate}
                                    </div>
                                    <div className="card-info">
                                        📍 {event.location}
                                    </div>
                                    <div className="card-info">
                                        👤 Organized by: {event.organizer?.name}
                                    </div>
                                    <div className="card-actions">
                                        {isRegistered(event._id) ? (
                                            <button className="btn btn-secondary" disabled>
                                                Already Registered
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleRegister(event._id)}
                                            >
                                                Register Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {activeTab === 'registered' && (
                <div>
                    <h2 style={{ marginBottom: '1.5rem', color: '#4facfe' }}>My Registrations</h2>
                    {registrations.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📝</div>
                            <p>You haven't registered for any events yet</p>
                        </div>
                    ) : (
                        registrations.map(registration => {
                            if (!registration.event) return null;
                            const formattedDate = formatDate(registration.event.date);
                            return (
                                <div key={registration._id} className="card">
                                    <div className="card-header">
                                        <div>
                                            <h3 className="card-title">{registration.event?.title || 'Unknown Event'}</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <span className="card-badge badge-approved">{registration.event?.category || 'N/A'}</span>
                                                <span className="card-badge badge-approved">{registration.event?.branch || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="card-description">{registration.event?.description}</p>
                                    <div className="card-info">
                                        📅 {formattedDate}
                                    </div>
                                    <div className="card-info">
                                        📍 {registration.event?.location || 'Unknown Location'}
                                    </div>
                                    <div className="card-info">
                                        ✅ Registered on: {new Date(registration.registeredAt).toLocaleDateString()}
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleCancelRegistration(registration._id)}
                                        >
                                            Cancel Registration
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
