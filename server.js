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

// Direct access to index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/index.html'));
});

// Direct access to movies.html - QUAN TRỌNG: thiếu route này → 404 → redirect login
app.get('/movies.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/movies.html'));
});

// Direct access to detail.html (trang xem chi tiết phim)
app.get('/detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/detail.html'));
});

// Direct access to admin.html (trang quản trị)
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/admin.html'));
});

// Direct access to search.html (trang tìm kiếm)
app.get('/search.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/src/pages/search.html'));
});

// ==================== 404 HANDLER ====================
// Với các route không khớp, trả về 404 thay vì login.html
// Việc redirect sang login phải do JavaScript phía client xử lý (kiểm tra token)
// KHÔNG dùng server để redirect — server không biết user đã đăng nhập hay chưa
app.use((req, res) => {
  // Trả về 404 nếu không tìm thấy trang - không redirect về login
  res.status(404).sendFile(path.join(__dirname, 'frontend/src/pages/login.html'));
});


// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`\n✨ Frontend Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📁 Static files từ: ${path.join(__dirname, 'frontend/src')}`);
  console.log(`📄 Pages: http://localhost:${PORT}/login.html`);
  console.log(`📄 Pages: http://localhost:${PORT}/register.html\n`);
});
