/* ============================================
   JAVASCRIPT CHO TRANG CHỦ (INDEX)
   ============================================ */

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
// TẢI DANH SÁCH PHIM
// ============================================

// Biến lưu danh sách phim hiện tại (để sử dụng khi click modal)
let currentMoviesList = [];

/**
 * Hàm tải danh sách phim từ backend
 * - Tải 12 phim từ trang 1
 * - Cập nhật section hero với phim đầu tiên
 * - Hiển thị grid danh sách phim
 */
async function loadMovies() {
  // Gọi API lấy danh sách phim (trang 1, 12 items) - dùng window.API từ api.js
  const result = await window.API.getMovies({ page: 1, limit: 12 });
  
  // Nếu lỗi hoặc không có dữ liệu, thoát hàm
  if (!result || !result.data) return;

  const movies = result.data;
  
  // Lưu danh sách phim vào biến global (để sử dụng trong modal)
  currentMoviesList = movies;
  
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
      <!-- Ảnh phim - Click để mở modal -->
      <img src="${movie.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22270%22%3E%3Crect width=%22180%22 height=%22270%22 fill=%22%23333%22/%3E%3C/svg%3E'}" 
           alt="${movie.title}"
           style="cursor: pointer;">
      
      <!-- Icon yêu thích (góc trên bên phải) -->
      <button class="favorite-btn" 
              data-movie-id="${movie._id || movie.id}"
              title="Thêm vào yêu thích"
              onclick="event.stopPropagation(); toggleFavorite('${movie._id || movie.id}', this)">
        <i class="heart-icon">🤍</i>
      </button>
      
      <!-- Thông tin phim (overlay) - Click để mở modal -->
      <div class="movie-info" style="cursor: pointer;">
        <p class="movie-title">${movie.title}</p>
      </div>
    </div>
  `).join('');
  
  // ========== Attach event listeners cho nút yêu thích ==========
  // Sau khi render HTML, attach click handler cho từng nút favorite
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Ngăn click bubble lên parent
      const movieId = this.getAttribute('data-movie-id');
      toggleFavorite(movieId, this);
    });
  });
  
  // ========== Load trạng thái yêu thích ==========
  // Nếu user đã đăng nhập, load các phim đã yêu thích
  if (token) {
    loadFavoriteStatus();
  }
}

// ============================================
// XỬ LÝ YÊU THÍCH (FAVORITES)
// ============================================

/**
 * Toggle trạng thái yêu thích của phim
 * @param {string} movieId - ID phim
 * @param {HTMLElement} button - Nút yêu thích được click
 */
async function toggleFavorite(movieId, button) {
  // Kiểm tra đăng nhập
  const currentToken = localStorage.getItem('token');
  if (!currentToken) {
    window.showToast('Vui lòng đăng nhập để thêm phim vào yêu thích', 'warning', 2500);
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    return;
  }
  
  // Kiểm tra movieId có hợp lệ không
  if (!movieId) {
    console.error('Movie ID không hợp lệ:', movieId);
    window.showToast('Lỗi: Không xác định được phim. Vui lòng thử lại.', 'error');
    return;
  }
  
  try {
    const icon = button.querySelector('.heart-icon');
    const isFavorited = icon.textContent === '❤️';
    
    console.log('Đang toggle favorite cho movie:', movieId);
    
    // Gọi API toggle favorite
    const response = await window.API.toggleFavorite(movieId);
    console.log('Response từ API:', response);
    
    // Cập nhật UI dựa vào response từ server
    if (response.data && typeof response.data.isFavorite === 'boolean') {
      if (response.data.isFavorite) {
        icon.textContent = '❤️';
        button.classList.add('favorited');
        window.showToast('Đã thêm vào danh sách yêu thích ❤️', 'success');
      } else {
        icon.textContent = '🤍';
        button.classList.remove('favorited');
        window.showToast('Đã bỏ khỏi danh sách yêu thích', 'info');
      }
    } else {
      // Fallback: toggle dựa vào UI cũ
      if (isFavorited) {
        icon.textContent = '🤍';
        button.classList.remove('favorited');
        window.showToast('Đã bỏ khỏi danh sách yêu thích', 'info');
      } else {
        icon.textContent = '❤️';
        button.classList.add('favorited');
        window.showToast('Đã thêm vào danh sách yêu thích ❤️', 'success');
      }
    }
    
  } catch (error) {
    console.error('Lỗi chi tiết khi toggle favorite:', error);
    console.error('Movie ID:', movieId);
    console.error('Token có trong localStorage:', !!currentToken);
    
    // Hiển thị lỗi chi tiết hơn
    let errorMessage = 'Không thể cập nhật yêu thích';
    if (error.message) {
      errorMessage = error.message;
    }
    window.showToast(errorMessage, 'error');
  }
}

/**
 * Load trạng thái yêu thích của các phim đang hiển thị
 */
async function loadFavoriteStatus() {
  try {
    // Gọi API lấy danh sách phim yêu thích
    const response = await window.API.getFavorites();
    console.log('Response từ getFavorites:', response);
    
    // Backend trả về: { success, data: { count, data: [movies] }, message }
    // Vậy array phim nằm ở response.data.data
    if (!response || !response.data) {
      console.log('Không có dữ liệu favorite');
      return;
    }
    
    // Lấy array movies từ response.data.data hoặc response.data
    const favoriteMovies = response.data.data || response.data;
    
    // Kiểm tra favoriteMovies có phải array không
    if (!Array.isArray(favoriteMovies)) {
      console.error('favoriteMovies không phải array:', favoriteMovies);
      return;
    }
    
    console.log('Danh sách phim yêu thích:', favoriteMovies);
    const favoriteIds = favoriteMovies.map(m => m._id || m.id);
    
    // Cập nhật UI cho các phim đã yêu thích
    favoriteIds.forEach(movieId => {
      const button = document.querySelector(`[data-movie-id="${movieId}"]`);
      if (button) {
        const icon = button.querySelector('.heart-icon');
        icon.textContent = '❤️';
        button.classList.add('favorited');
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi load favorite status:', error);
  }
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
 * Hàm mở modal chi tiết phim thay vì chuyển hướng trực tiếp
 * @param {string} id - ID phim
 */
function viewMovie(id) {
  // Tìm phim trong danh sách phim hiện tại
  const selectedMovie = currentMoviesList.find(m => m._id === id || m.id === id);
  
  if (selectedMovie) {
    // Mở modal với thông tin phim
    openMovieModal(selectedMovie);
  } else {
    // Fallback: nếu không tìm được trong danh sách, chuyển hướng trực tiếp
    console.warn('Không tìm thấy phim trong danh sách, chuyển hướng trực tiếp');
    window.location.href = `detail.html?id=${id}`;
  }
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
