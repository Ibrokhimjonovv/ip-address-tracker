// App.jsx yoki main.jsx ga qo'shimcha
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Home from './(pages)/home/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './(pages)/404/404';

function App() {
  useEffect(() => {
    // Dynamic title update based on user's IP
    const updateTitle = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        if (data.ip) {
          document.title = `IP: ${data.ip} - IP Checker Tool`;
        }
      } catch (error) {
        console.log('Could not update title');
      }
    };
    updateTitle();
  }, []);

  return (
    <>
      <Helmet>
        <html lang="uz" />
        <title>IP Checker - Find My IP Address Location & ISP Information</title>
        <meta name="description" content="Free IP address lookup tool. Check your public IPv4 and IPv6 address, location on map, ISP details, timezone, and security score instantly." />
        <meta name="keywords" content="ip checker, my ip address, ip location, whats my ip, ip address lookup, find my ip, public ip, ip tracker, geolocation, ip detection" />

        {/* Open Graph */}
        <meta property="og:title" content="IP Checker - Find Your Public IP Address" />
        <meta property="og:description" content="Check your IP address instantly. Get detailed location, ISP, and security information for free." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />

        {/* Twitter Card */}
        <meta name="twitter:title" content="IP Checker - Find Your Public IP Address" />
        <meta name="twitter:description" content="Check your IP address instantly. Get detailed location, ISP, and security information for free." />

        {/* Canonical URL */}
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;