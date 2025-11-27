/**
 * Simple test endpoint for Vercel debugging
 * Web 2.0 compliant, enterprise-grade test handler!
 */

module.exports = function handler(req, res) {
  // Enable CORS - critical for AJAX!
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    message: 'Vercel serverless function is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    demoMode: process.env.DEMO_MODE === 'true'
  });
};
