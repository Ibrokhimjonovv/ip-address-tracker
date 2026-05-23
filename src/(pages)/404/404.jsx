// src/pages/NotFound.jsx
import React, { useEffect, useState } from 'react';
import { FaHome, FaSearch, FaArrowLeft, FaGlobe, FaQuestionCircle, FaRobot, FaRedoAlt } from 'react-icons/fa';
import { MdLocationOff, MdWifiOff, MdErrorOutline } from 'react-icons/md';
import './404.scss';

const NotFound = () => {
    const [countdown, setCountdown] = useState(10);
    const [suggestedIp, setSuggestedIp] = useState(null);
    const [funFact, setFunFact] = useState('');

    const funFacts = [
        "Did you know? There are only 4.3 billion IPv4 addresses in the world!",
        "Fun fact: Your IP address changes every time you switch networks!",
        "Did you know? IPv6 provides 340 undecillion addresses!",
        "Fun fact: The first IP address was assigned in 1977!",
        "Did you know? Some animals have better internet than some countries!",
        "Fun fact: The average person checks their IP address 3 times per year!",
    ];

    useEffect(() => {
        // Random fun fact
        setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);

        // Auto redirect to home
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.href = '/';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Get user's IP for suggestion
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setSuggestedIp(data.ip))
            .catch(() => setSuggestedIp('Unable to detect'));

        return () => clearInterval(timer);
    }, []);

    const handleGoBack = () => {
        window.history.back();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleRetry = () => {
        window.location.reload();
    };


    return (
        <div className="not-found-container">
            <div className="animated-bg">
                <div className="gradient-sphere"></div>
                <div className="gradient-sphere-2"></div>
            </div>

            <div className="not-found-content">
                <div className="error-animation">
                    <div className="error-code">
                        <span className="digit">4</span>
                        <span className="digit">
                            <MdErrorOutline className="error-icon" />
                        </span>
                        <span className="digit">4</span>
                    </div>
                    <div className="network-signal">
                        <div className="signal-bar"></div>
                        <div className="signal-bar"></div>
                        <div className="signal-bar"></div>
                        <div className="signal-bar"></div>
                        <div className="signal-bar offline"></div>
                    </div>
                </div>

                <h1 className="error-title">
                    <MdWifiOff className="title-icon" />
                    Page Not Found
                </h1>
                
                <p className="error-description">
                    Oops! The IP address you're looking for seems to be lost in cyberspace.
                    The page you requested doesn't exist or has been moved.
                </p>

                <div className="error-stats">
                    <div className="stat-card-404">
                        <FaGlobe className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-label">Your IP</span>
                            <span className="stat-value">{suggestedIp || 'Detecting...'}</span>
                        </div>
                    </div>
                    <div className="stat-card-404">
                        <FaQuestionCircle className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-label">Error Type</span>
                            <span className="stat-value">404 Not Found</span>
                        </div>
                    </div>
                    <div className="stat-card-404">
                        <FaRobot className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-label">Auto Redirect</span>
                            <span className="stat-value">{countdown}s</span>
                        </div>
                    </div>
                </div>

                <div className="action-buttons-404">
                    {/* <button onClick={handleGoHome} className="action-btn-404 primary">
                        <FaHome /> Back to Home
                    </button> */}
                    <button onClick={handleGoBack} className="action-btn-404 secondary">
                        <FaArrowLeft /> Go Back
                    </button>
                    <button onClick={handleRetry} className="action-btn-404 warning">
                        <FaRedoAlt /> Retry
                    </button>
                </div>

                <div className="fun-fact">
                    <div className="fun-fact-icon">💡</div>
                    <div className="fun-fact-text">{funFact}</div>
                </div>

                {/* <div className="suggestions">
                    <h3>You might be looking for:</h3>
                    <div className="suggestion-links">
                        <a href="/">Check My IP</a>
                        <a href="/ip-lookup">IP Lookup Tool</a>
                        <a href="/about">About IP Checker</a>
                        <a href="/faq">FAQ</a>
                    </div>
                </div> */}

            </div>
        </div>
    );
};

export default NotFound;