/* ============================================
   JAVASCRIPT CHO TRANG CHỦ (INDEX)
   ============================================ */

// ============================================
// KHỞI TẠO & CẤU HÌNH
// ============================================

// URL API backend (Backend chạy trên port 5000)
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// KIỂM TRA ĐĂNG NHẬP
// ============================================
// Lấy token từ localStorage - đây là accessToken lưu dưới key 'token'
// để tương thích với toàn bộ code cũ dùng localStorage.getItem('token')
const token = localStorage.getItem('token');

// Nếu KHÔNG có token → chưa đăng nhập → chuyển sang trang login
// Lưu ý: Kiểm tra này chạy ngay khi file JS được load
// Sau khi đăng nhập thành công, login.js đã lưu token vào localStorage
// nên lần sau vào trang này sẽ tìm thấy token và không bị redirect nữa
if (!token) {
  // Lưu trang hiện tại để sau khi login có thể quay lại
  localStorage.setItem('redirectAfterLogin', window.location.href);
  window.location.href = './login.html';
}

// ============================================
// HÀM GỌI API
// ============================================

/**
 * Hàm gọi API đến backend
 * @param {string} endpoint - Endpoint API (ví dụ: '/movies?page=1&limit=12')
 * @returns {Promise} - Dữ liệu trả về từ API
 */
async function apiCall(endpoint) {
  try {
    // Gọi fetch tới backend
    const response = await fetch(API_BASE_URL + endpoint, {
      headers: {
        // Thêm token vào header để xác thực
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Nếu lỗi HTTP, ném exception
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    // Parse JSON từ response
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

// ============================================
// TẢI DANH SÁCH PHIM
// ============================================

/**
 * Hàm tải danh sách phim từ backend
 * - Tải 12 phim từ trang 1
 * - Cập nhật section hero với phim đầu tiên
 * - Hiển thị grid danh sách phim
 */
async function loadMovies() {
  // Gọi API lấy danh sách phim (trang 1, 12 items)
  const result = await apiCall('/movies?page=1&limit=12');
  
  // Nếu lỗi hoặc không có dữ liệu, thoát hàm
  if (!result || !result.data) return;

  const movies = result.data;
  
  // Cập nhật section hero nếu có phim
  if (movies.length > 0) {
    updateHero(movies[0]); // Dùng phim đầu tiên làm featured
    
    // ========== Hiển thị thumbnails ở hero (những phim khác) ==========
    if (movies.length > 1) {
      const heroThumbs = document.getElementById('heroThumbs');
      // Chọn từ 1-5 phim (những phim sau phim featured)
      heroThumbs.innerHTML = movies.slice(1, 5).map(movie => `
        <a onclick="event.preventDefault(); viewMovie('${movie._id || movie.id}')">
          <img src="${movie.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%2270%22%3E%3Crect width=%22120%22 height=%2270%22 fill=%22%23333%22/%3E%3C/svg%3E'}" alt="${movie.title}">
        </a>
      `).join('');
    }
  }

  // ========== Hiển thị grid danh sách phim ==========
  const grid = document.getElementById('moviesGrid');
  
  // Tạo HTML cho từng phim
  grid.innerHTML = movies.map(movie => `
    <div class="movie-item" onclick="viewMovie('${movie._id || movie.id}')">
      <!-- Ảnh phim -->
      <img src="${movie.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22270%22%3E%3Crect width=%22180%22 height=%22270%22 fill=%22%23333%22/%3E%3C/svg%3E'}" alt="${movie.title}">
      
      <!-- Thông tin phim (overlay) -->
      <div class="movie-info">
        <p class="movie-title">${movie.title}</p>
      </div>
    </div>
  `).join('');
}

// ============================================
// CẬP NHẬT HERO SECTION
// ============================================

/**
 * Hàm cập nhật section hero với thông tin phim
 * @param {object} movie - Dữ liệu phim
 */
function updateHero(movie) {
  // Cập nhật ảnh nền hero (nếu không có thumbnail, dùng grey placeholder)
  document.getElementById('heroBg').src = movie.thumbnail || '';
  
  // Cập nhật tiêu đề phim
  document.getElementById('heroTitle').textContent = movie.title;
  
  // Cập nhật mô tả phim
  document.getElementById('heroDesc').textContent = movie.description || 'Một bộ phim tuyệt vời';
  
  // Cập nhật link nút "Xem Ngay"
  document.getElementById('playBtn').href = `detail.html?id=${movie._id || movie.id}`;
}

// ============================================
// XEM CHI TIẾT PHIM
// ============================================

/**
 * Hàm dẫn tới trang chi tiết phim
 * @param {string} id - ID phim
 */
function viewMovie(id) {
  // Chuyển hướng tới trang detail dengan ID phim
  window.location.href = `detail.html?id=${id}`;
}

// ============================================
// TÌM KIẾM
// ============================================

// Lấy phần tử nút "Tìm kiếm" và ô input
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

// Hàm xử lý tìm kiếm
function handleSearch() {
  const keyword = searchInput.value.trim();
  if (keyword) {
    window.location.href = `movies.html?search=${encodeURIComponent(keyword)}`;
  }
}

// Click nút search
if (searchBtn) {
  searchBtn.addEventListener('click', handleSearch);
}

// Enter key trong ô search
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });
}

// ============================================
// FILTER PHIM THEO THỂ LOẠI
// ============================================

/**
 * Hàm filter phim theo thể loại
 * @param {string} text - Tên thể loại (ví dụ: 'Hành động')
 */
function filterByText(text) {
  // Chuyển sang trang movies với category filter
  window.location.href = `movies.html?category=${encodeURIComponent(text)}`;
}

// ============================================
// USER ICON - ĐẾN HỒ SƠ HOẶC ĐĂNG NHẬP
// ============================================

// Lấy phần tử user icon
const userIcon = document.getElementById('userIcon');

if (userIcon) {
  userIcon.addEventListener('click', (e) => {
    e.preventDefault();
    // Nếu đã đăng nhập (có token), vào hồ sơ
    if (token) {
      window.location.href = 'profile.html';
    } 
    // Nếu chưa đăng nhập, vào trang đăng nhập
    else {
      window.location.href = 'login.html';
    }
  });
}

// ============================================
// KHỞI TẠO TRANG (KHI PAGE LOAD)
// ============================================

// Chạy hàm loadMovies khi trang load xong
window.addEventListener('load', loadMovies);
