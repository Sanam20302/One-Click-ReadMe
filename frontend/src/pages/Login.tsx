import React from 'react';
import { Github } from 'lucide-react';
import { auth } from '../services/api';

const Login: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    README Generator
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Generate production-ready READMEs in seconds.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <button
                        onClick={auth.login}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        <Github className="w-5 h-5 mr-2" />
                        Connect with GitHub
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
