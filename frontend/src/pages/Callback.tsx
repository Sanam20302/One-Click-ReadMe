import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../services/api';

const Callback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const codeProcessed = useRef(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token && !codeProcessed.current) {
            codeProcessed.current = true;
            localStorage.setItem('token', token);
            navigate('/dashboard');
        } else if (!token) {
            navigate('/');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );
};

export default Callback;
