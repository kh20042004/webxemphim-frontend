// ==================== FRONTEND SERVER ====================
// Simple Express server to serve static frontend files

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// ==================== MIDDLEWARE ====================
// Serve static files từ frontend/src folder
app.use(express.static(path.join(__dirname, 'frontend/src')));
app.use(express.static(path.join(__dirname, 'frontend/public')));

// ==================== SPECIFIC ROUTES FOR HTML PAGES ====================
// Direct access to login.html
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/login.html'));
});

// Direct access to register.html
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/register.html'));
});

// ==================== ROOT & FALLBACK ROUTES ====================
// Serve login page cho root /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/login.html'));
});

// 404 handler - serve login.html for unmatched routes (SPA fallback)
// Nhưng chỉ cho các route không phải là files tĩnh
app.use((req, res) => {
  // Nếu request không phải là file tĩnh, serve login.html
  res.sendFile(path.join(__dirname, 'frontend/src/pages/login.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`\n✨ Frontend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📁 Static files từ: ${path.join(__dirname, 'frontend/src')}`);
  console.log(`📄 Pages: http://localhost:${PORT}/login.html`);
  console.log(`📄 Pages: http://localhost:${PORT}/register.html\n`);
});
