// import React from 'react'; removed
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
