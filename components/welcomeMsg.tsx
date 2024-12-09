"use client";

import { useState, useEffect } from 'react';

export const WelcomeMsg = () => {
    const [username, setUsername] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Retrieve username from localStorage
        const storedUsername = localStorage.getItem('finance-username');
        
        if (storedUsername) {
            setUsername(storedUsername);
        }
        
        // Simulate loading state
        setIsLoaded(true);
    }, []);

    return(
        <div className="space-y-2 mb-4 pb-4">
            <h2 className="text-2xl lg:text-4xl text-white font-medium">
                Welcome Back {isLoaded ? username : ''} 👋🏻
            </h2>
        </div>
    );
};

export default WelcomeMsg;