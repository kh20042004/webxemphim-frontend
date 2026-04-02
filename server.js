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

// Direct access to profile.html
app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/profile.html'));
});

// Direct access to history.html
app.get('/history.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/history.html'));
});

// Direct access to favorites.html
app.get('/favorites.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/favorites.html'));
});

// Direct access to subscription.html
app.get('/subscription.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/subscription.html'));
});

// Direct access to settings.html
app.get('/settings.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/settings.html'));
});

// Direct access to movies.html
app.get('/movies.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/movies.html'));
});

// Direct access to detail.html
app.get('/detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/detail.html'));
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
