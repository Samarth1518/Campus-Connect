import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Login, Register, AdminLogin } from './pages';
import StudentDashboard from './dashboards/StudentDashboard';
import OrganizerDashboard from './dashboards/OrganizerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Protected Route Component
    const ProtectedRoute = ({ children, allowedRoles }) => {
        if (loading) {
            return (
                <div className="loading">
                    <div className="spinner"></div>
                    Loading...
                </div>
            );
        }

        if (!user) {
            return <Navigate to="/login" replace />;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to="/login" replace />;
        }

        if (user.role === 'organizer' && !user.isApproved) {
            return (
                <div className="auth-container">
                    <div className="auth-card">
                        <h1 className="auth-title">Account Pending</h1>
                        <p className="auth-subtitle">
                            Your organizer account is pending admin approval. Please check back later.
                        </p>
                        <button onClick={handleLogout} className="btn btn-primary" style={{ width: '100%' }}>
                            Logout
                        </button>
                    </div>
                </div>
            );
        }

        return children;
    };

    return (
        <BrowserRouter>
            {user && <Navbar user={user} onLogout={handleLogout} />}

            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate
                                to={
                                    user.role === 'admin'
                                        ? '/admin'
                                        : user.role === 'organizer'
                                            ? '/organizer'
                                            : '/student'
                                }
                                replace
                            />
                        ) : (
                            <Login onLogin={handleLogin} />
                        )
                    }
                />
                <Route
                    path="/register"
                    element={user ? <Navigate to="/login" replace /> : <Register />}
                />
                <Route
                    path="/admin-login"
                    element={user ? <Navigate to="/login" replace /> : <AdminLogin onLogin={handleLogin} />}
                />

                {/* Protected Routes */}
                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/organizer"
                    element={
                        <ProtectedRoute allowedRoles={['organizer']}>
                            <OrganizerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                <Route
                    path="/"
                    element={
                        user ? (
                            <Navigate
                                to={
                                    user.role === 'admin'
                                        ? '/admin'
                                        : user.role === 'organizer'
                                            ? '/organizer'
                                            : '/student'
                                }
                                replace
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
