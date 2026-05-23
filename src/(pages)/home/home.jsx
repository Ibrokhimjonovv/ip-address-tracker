// ip-checker.jsx
'use client'
import React, { useState, useEffect } from 'react'
import "./home.scss"

// Leaflet CSS fayllarini import qilish
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// React Leaflet importlari
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

// Qo'shimcha ikonkalar uchun
import { FaMapMarkerAlt, FaGlobe, FaNetworkWired, FaClock, FaCity, FaFlag, FaCopy, FaCheck, FaShieldAlt, FaChartLine, FaDownload, FaShareAlt, FaSyncAlt, FaInfoCircle } from 'react-icons/fa'
import { MdLocationOn, MdSpeed, MdSecurity, MdDarkMode, MdLightMode, MdWbSunny, MdCloud } from 'react-icons/md'
import { WiHumidity, WiStrongWind } from 'react-icons/wi'

// Leaflet ikonlarini sozlash
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Home = () => {
    const [ipData, setIpData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ipv6, setIpv6] = useState(null);
    const [copied, setCopied] = useState({ ipv4: false, ipv6: false });
    const [darkMode, setDarkMode] = useState(true);
    const [connectionSpeed, setConnectionSpeed] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [locationHistory, setLocationHistory] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchIpData();
        checkDarkModePreference();
        
        // Load location history from localStorage
        const savedHistory = localStorage.getItem('ipLocationHistory');
        if (savedHistory) {
            setLocationHistory(JSON.parse(savedHistory));
        }
    }, []);

    const showNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const checkDarkModePreference = () => {
        const savedTheme = localStorage.getItem('ipCheckerTheme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.body.classList.add('dark-mode');
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('ipCheckerTheme', 'dark');
            showNotification('Dark mode enabled', 'info');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('ipCheckerTheme', 'light');
            showNotification('Light mode enabled', 'info');
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(prev => ({ ...prev, [type]: true }));
        showNotification(`${type.toUpperCase()} address copied!`, 'success');
        setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000);
    };

    const measureConnectionSpeed = async () => {
        const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
        const startTime = Date.now();
        try {
            await fetch(imageUrl, { cache: 'no-store', mode: 'no-cors' });
            const endTime = Date.now();
            const duration = endTime - startTime;
            // Estimate speed (very basic)
            const estimatedSpeed = (1.5 / (duration / 1000)).toFixed(1);
            setConnectionSpeed(estimatedSpeed);
        } catch (error) {
            setConnectionSpeed('N/A');
        }
    };

    const getWeatherCondition = (condition) => {
        const conditions = {
            'clear': <MdWbSunny />,
            'clouds': <MdCloud />,
            'rain': '🌧️',
            'snow': '❄️',
            'thunderstorm': '⛈️'
        };
        return conditions[condition] || <MdWbSunny />;
    };

    const fetchIpData = async () => {
        try {
            setError(null);
            setLoading(true);
            setIsRefreshing(true);

            const ipv4Response = await fetch('https://api.ipify.org?format=json');
            const ipv4Result = await ipv4Response.json();
            const userIpv4 = ipv4Result.ip;

            let userIpv6 = null;
            try {
                const ipv6Response = await fetch('https://api64.ipify.org?format=json');
                const ipv6Result = await ipv6Response.json();
                if (ipv6Result.ip !== userIpv4) {
                    userIpv6 = ipv6Result.ip;
                }
            } catch (ipv6Error) {
                console.log('IPv6 not available');
            }

            const ipInfoResponse = await fetch(`https://ipapi.co/${userIpv4}/json/`);
            const ipInfoResult = await ipInfoResponse.json();

            if (ipInfoResult.ip) {
                const newIpData = {
                    userIp: userIpv4,
                    isp: ipInfoResult.org || 'Unknown',
                    country: ipInfoResult.country_name || 'Unknown',
                    countryCode: ipInfoResult.country_code || 'N/A',
                    city: ipInfoResult.city || 'Unknown',
                    regionName: ipInfoResult.region || 'Unknown',
                    timezone: ipInfoResult.timezone || 'Unknown',
                    lat: ipInfoResult.latitude || 0,
                    lon: ipInfoResult.longitude || 0,
                    postal: ipInfoResult.postal || 'N/A',
                    asn: ipInfoResult.asn || 'N/A',
                    currency: ipInfoResult.currency || 'N/A',
                    callingCode: ipInfoResult.country_calling_code || 'N/A'
                };
                
                setIpData(newIpData);
                setIpv6(userIpv6);
                measureConnectionSpeed();
                
                // Save to history
                const historyItem = {
                    ip: userIpv4,
                    city: newIpData.city,
                    country: newIpData.country,
                    timestamp: new Date().toISOString(),
                    lat: newIpData.lat,
                    lon: newIpData.lon
                };
                
                const updatedHistory = [historyItem, ...locationHistory.slice(0, 4)];
                setLocationHistory(updatedHistory);
                localStorage.setItem('ipLocationHistory', JSON.stringify(updatedHistory));
                
                showNotification('IP information updated!', 'success');
            } else {
                throw new Error('Failed to fetch IP information');
            }
        } catch (err) {
            setError('Error loading data. Please check your connection.');
            showNotification('Failed to load IP data', 'error');
            console.error('Error:', err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const downloadData = () => {
        const dataStr = JSON.stringify({ ipData, ipv6, timestamp: new Date().toISOString() }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ip-data-${ipData?.userIp || 'unknown'}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showNotification('Data downloaded successfully!', 'success');
    };

    const shareData = async () => {
        const shareText = `My IP Address: ${ipData?.userIp}\nLocation: ${ipData?.city}, ${ipData?.country}\nISP: ${ipData?.isp}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My IP Information',
                    text: shareText,
                    url: window.location.href,
                });
                showNotification('Shared successfully!', 'success');
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            copyToClipboard(shareText, 'info');
            showNotification('Information copied to clipboard!', 'success');
        }
    };

    const getSecurityScore = () => {
        let score = 85;
        if (ipv6) score += 5;
        if (connectionSpeed && parseFloat(connectionSpeed) > 10) score += 5;
        if (ipData?.isp?.includes('VPN')) score -= 10;
        return Math.min(score, 100);
    };

    if (loading) {
        return (
            <div id='ip-checker'>
                <div className="loading-screen">
                    <div className="loading-animation">
                        <div className="loading-ring"></div>
                        <div className="loading-ring"></div>
                        <div className="loading-ring"></div>
                    </div>
                    <h3>Analyzing your connection...</h3>
                    <p>Please wait while we gather your IP details</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div id='ip-checker'>
                <div className="error-screen">
                    <div className="error-illustration">⚠️</div>
                    <h3>Something went wrong</h3>
                    <div className="error-message">{error}</div>
                    <button onClick={fetchIpData} className="retry-btn">
                        <FaSyncAlt /> Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div id='ip-checker' className={darkMode ? 'dark-theme' : ''}>
            {/* Notifications */}
            <div className="notification-container">
                {notifications.map(notif => (
                    <div key={notif.id} className={`notification notification-${notif.type}`}>
                        {notif.message}
                    </div>
                ))}
            </div>

            {/* Theme Toggle Button */}
            <button className="theme-toggle" onClick={toggleDarkMode}>
                {darkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>

            {/* Header Section */}
            <div className="header-section">
                <h1 className="main-title">
                    <FaGlobe className="title-icon" />
                    IP Address Tracker
                </h1>
                <p className="subtitle">Discover your digital footprint with advanced analytics</p>
            </div>

            {ipData && (
                <div className="content-wrapper">
                    {/* Quick Actions Bar */}
                    <div className="quick-actions">
                        <button onClick={fetchIpData} className="action-btn" disabled={isRefreshing}>
                            <FaSyncAlt className={isRefreshing ? 'spinning' : ''} />
                            Refresh
                        </button>
                        <button onClick={shareData} className="action-btn">
                            <FaShareAlt /> Share
                        </button>
                        <button onClick={downloadData} className="action-btn">
                            <FaDownload /> Export
                        </button>
                    </div>

                    {/* Main IP Display Card */}
                    <div className="main-ip-card glass-card">
                        <div className="ip-display">
                            <div className="ip-label">Your Public IP Address</div>
                            <div className="ip-value-group">
                                <span className="ip-value">{ipData.userIp}</span>
                                <button onClick={() => copyToClipboard(ipData.userIp, 'ipv4')} className="copy-icon">
                                    {copied.ipv4 ? <FaCheck /> : <FaCopy />}
                                </button>
                            </div>
                            {ipv6 && (
                                <div className="ipv6-group">
                                    <div className="ip-label-small">IPv6 (if available)</div>
                                    <div className="ip-value-group">
                                        <span className="ip-value ipv6-value">{ipv6}</span>
                                        <button onClick={() => copyToClipboard(ipv6, 'ipv6')} className="copy-icon">
                                            {copied.ipv6 ? <FaCheck /> : <FaCopy />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="stats-overview">
                        <div className="stat-item">
                            <div className="stat-value">{getSecurityScore()}%</div>
                            <div className="stat-label">Security Score</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{connectionSpeed || '--'} Mbps</div>
                            <div className="stat-label">Est. Speed</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{ipv6 ? '✓' : '✗'}</div>
                            <div className="stat-label">IPv6 Support</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{ipData.countryCode}</div>
                            <div className="stat-label">Country Code</div>
                        </div>
                    </div>

                    {/* Tabs Section */}
                    <div className="tabs-container">
                        <div className="tabs">
                            <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
                                <FaInfoCircle /> Details
                            </button>
                            <button className={`tab ${activeTab === 'location' ? 'active' : ''}`} onClick={() => setActiveTab('location')}>
                                <MdLocationOn /> Location
                            </button>
                            <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                                <FaClock /> History
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'info' && (
                                <div className="info-tab">
                                    <div className="info-grid">
                                        <div className="info-row">
                                            <span className="info-label"><FaNetworkWired /> ISP:</span>
                                            <span className="info-value">{ipData.isp}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label"><FaFlag /> Country:</span>
                                            <span className="info-value">{ipData.country}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label"><FaCity /> City:</span>
                                            <span className="info-value">{ipData.city}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label"><MdLocationOn /> Region:</span>
                                            <span className="info-value">{ipData.regionName}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label"><FaClock /> Timezone:</span>
                                            <span className="info-value">{ipData.timezone}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">📮 Postal Code:</span>
                                            <span className="info-value">{ipData.postal}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">💰 Currency:</span>
                                            <span className="info-value">{ipData.currency}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">📞 Calling Code:</span>
                                            <span className="info-value">{ipData.callingCode}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'location' && (
                                <div className="location-tab">
                                    <div className="map-wrapper">
                                        {ipData.lat && ipData.lon && (
                                            <MapContainer
                                                center={[ipData.lat, ipData.lon]}
                                                zoom={8}
                                                className="location-map"
                                                scrollWheelZoom={true}
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution='© OpenStreetMap'
                                                />
                                                <Marker position={[ipData.lat, ipData.lon]}>
                                                    <Popup>
                                                        <div className="map-popup">
                                                            <strong>{ipData.country}</strong><br />
                                                            📍 {ipData.city}<br />
                                                            🌐 {ipData.isp}
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            </MapContainer>
                                        )}
                                    </div>
                                    <div className="location-coords">
                                        <p>📍 Latitude: {ipData.lat}</p>
                                        <p>📍 Longitude: {ipData.lon}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="history-tab">
                                    {locationHistory.length > 0 ? (
                                        locationHistory.map((item, index) => (
                                            <div key={index} className="history-item">
                                                <div className="history-ip">{item.ip}</div>
                                                <div className="history-location">{item.city}, {item.country}</div>
                                                <div className="history-time">{new Date(item.timestamp).toLocaleString()}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-history">No history yet</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            <div className="faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="faq-grid">
                    <div className="faq-card">
                        <h3>What is an IP address?</h3>
                        <p>An IP address is a unique identifier assigned to each device connected to the internet, allowing devices to communicate with each other.</p>
                    </div>
                    <div className="faq-card">
                        <h3>Is my IP address permanent?</h3>
                        <p>Most home IP addresses are dynamic and can change periodically. Static IPs are usually reserved for businesses or special services.</p>
                    </div>
                    <div className="faq-card">
                        <h3>Can someone track me with my IP?</h3>
                        <p>Your IP can reveal your general location (city level), but not your exact physical address. Using a VPN can help protect your privacy.</p>
                    </div>
                    <div className="faq-card">
                        <h3>What's the difference between IPv4 and IPv6?</h3>
                        <p>IPv4 uses 32-bit addresses (limited to ~4 billion), while IPv6 uses 128-bit addresses, providing virtually unlimited unique addresses.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home