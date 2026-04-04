// ==================== TOAST NOTIFICATION SYSTEM ====================
//
// Hệ thống thông báo đẹp thay thế alert() cơ bản
// Sử dụng: window.showToast(message, type, duration)
//
// Ví dụ:
//   showToast('Đăng nhập thành công!', 'success');
//   showToast('Có lỗi xảy ra', 'error');
//   showToast('Đang xử lý...', 'info');
//   showToast('Cảnh báo!', 'warning');

/**
 * Hiển thị toast notification
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Thời gian hiển thị (ms), mặc định 3000ms
 */
function showToast(message, type = 'info', duration = 3000) {
  // Tạo container nếu chưa có
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Tạo toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Icon cho từng loại toast
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  // HTML cho toast
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  // Thêm toast vào container
  container.appendChild(toast);

  // Animation vào
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  // Tự động xóa sau duration
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    
    // Xóa khỏi DOM sau animation
    setTimeout(() => {
      toast.remove();
      
      // Xóa container nếu không còn toast nào
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duration);
}

/**
 * Toast nhanh cho các trường hợp phổ biến
 */
const Toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
  warning: (message, duration) => showToast(message, 'warning', duration),
};

// Export ra window để dùng global
window.showToast = showToast;
window.Toast = Toast;
