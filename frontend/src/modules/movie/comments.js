// ==================== MODULE QUẢN LÝ BÌNH LUẬN & ĐÁNH GIÁ ====================
//
// File: comments.js
// Mục đích: Xử lý toàn bộ chức năng bình luận và đánh giá phim
// Tác giả: AI Assistant (thay thế cho Nhất)
// Ngày tạo: 2026-04-03
//

// ==================== BIẾN TOÀN CỤC ====================
let currentMovieId = null;      // ID phim hiện tại
let currentUser = null;         // Thông tin user đang đăng nhập
let currentUserRating = 0;      // Đánh giá hiện tại của user (1-5 sao)

// ==================== HÀM KHỞI TẠO CHÍNH ====================

/**
 * Hàm khởi tạo module comments
 * @param {string} movieId - ID của phim cần load comments
 */
async function initComments(movieId) {
    console.log('🎬 Khởi tạo module comments cho phim:', movieId);
    
    currentMovieId = movieId;
    
    // Lấy thông tin user hiện tại từ localStorage
    await loadCurrentUser();
    
    // Render giao diện HTML cho phần comments
    renderCommentsUI();
    
    // Load danh sách comments từ server
    await loadComments();
    
    // Thiết lập các event listeners
    setupEventListeners();
}

// ==================== XỬ LÝ USER ====================

/**
 * Lấy thông tin user đang đăng nhập
 */
async function loadCurrentUser() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        console.log('⚠️ User chưa đăng nhập');
        currentUser = null;
        return;
    }
    
    try {
        // Gọi API lấy thông tin user
        const response = await window.API.getCurrentUser();
        currentUser = response.data;
        console.log('✅ Đã load thông tin user:', currentUser.fullName);
    } catch (error) {
        console.error('❌ Lỗi khi load user:', error);
        currentUser = null;
        // Có thể token hết hạn, xóa đi
        localStorage.removeItem('accessToken');
    }
}

// ==================== RENDER GIAO DIỆN ====================

/**
 * Render HTML cho phần comments & ratings
 */
function renderCommentsUI() {
    const commentSection = document.getElementById('comment-section');
    
    commentSection.innerHTML = `
        <!-- PHẦN ĐÁNH GIÁ SAO -->
        <div class="rating-container">
            <h3 class="text-primary">⭐ Đánh giá phim</h3>
            
            <!-- Hiển thị đánh giá trung bình -->
            <div class="rating-summary">
                <div class="average-rating">
                    <span class="rating-number" id="averageRating">0.0</span>
                    <div class="stars-display" id="averageStars">
                        ${generateStarsHTML(0, 'star-avg')}
                    </div>
                    <span class="rating-count" id="ratingCount">(0 đánh giá)</span>
                </div>
            </div>
            
            <!-- Form đánh giá của user (chỉ hiện khi đã login) -->
            <div class="user-rating" id="userRatingSection" style="display: none;">
                <p class="text-light">Bạn đánh giá phim này:</p>
                <div class="stars-input" id="starsInput">
                    ${generateStarsHTML(0, 'star-input')}
                </div>
                <p class="text-muted" style="font-size: 0.9em; margin-top: 5px;">
                    Click vào sao để đánh giá
                </p>
            </div>
            
            <!-- Thông báo cần đăng nhập -->
            <div class="login-prompt" id="loginPrompt" style="display: none;">
                <p class="text-muted">
                    Vui lòng <a href="login.html" class="text-primary">đăng nhập</a> để đánh giá và bình luận
                </p>
            </div>
        </div>
        
        <hr class="divider">
        
        <!-- PHẦN BÌNH LUẬN -->
        <div class="comments-container">
            <h3 class="text-primary">💬 Bình luận</h3>
            
            <!-- Form thêm bình luận mới -->
            <div class="comment-form" id="commentForm" style="display: none;">
                <div class="user-avatar">
                    <img src="https://ui-avatars.com/api/?name=User&background=4CAF50&color=fff" 
                         alt="Avatar" id="userAvatar">
                </div>
                <div class="comment-input-wrapper">
                    <textarea 
                        id="commentInput" 
                        class="comment-textarea" 
                        placeholder="Viết bình luận của bạn..."
                        rows="3"
                    ></textarea>
                    <div class="comment-actions">
                        <button class="btn btn-primary" id="submitCommentBtn">
                            Gửi bình luận
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Danh sách bình luận -->
            <div class="comments-list" id="commentsList">
                <div class="loading-comments">
                    <p class="text-muted">Đang tải bình luận...</p>
                </div>
            </div>
        </div>
    `;
    
    // Hiện/ẩn các phần tùy theo user đã login chưa
    if (currentUser) {
        document.getElementById('userRatingSection').style.display = 'block';
        document.getElementById('commentForm').style.display = 'flex';
        document.getElementById('loginPrompt').style.display = 'none';
        
        // Cập nhật avatar user
        const avatarUrl = currentUser.avatar || 
                         `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=4CAF50&color=fff`;
        document.getElementById('userAvatar').src = avatarUrl;
    } else {
        document.getElementById('userRatingSection').style.display = 'none';
        document.getElementById('commentForm').style.display = 'none';
        document.getElementById('loginPrompt').style.display = 'block';
    }
}

/**
 * Tạo HTML cho các ngôi sao đánh giá
 * @param {number} rating - Số sao (0-5)
 * @param {string} className - Class CSS cho các sao
 * @returns {string} HTML string
 */
function generateStarsHTML(rating, className) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating ? 'filled' : '';
        html += `<span class="star ${className} ${filled}" data-value="${i}">★</span>`;
    }
    return html;
}

// ==================== LOAD DỮ LIỆU ====================

/**
 * Load danh sách bình luận từ server
 */
async function loadComments() {
    const commentsList = document.getElementById('commentsList');
    
    try {
        // Gọi API lấy comments
        const response = await window.API.getComments(currentMovieId);
        const comments = response.data || [];
        
        console.log(`✅ Đã load ${comments.length} bình luận`);
        
        // Render danh sách comments
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <p class="text-muted">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                </div>
            `;
        } else {
            commentsList.innerHTML = comments.map(comment => renderCommentHTML(comment)).join('');
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi load comments:', error);
        commentsList.innerHTML = `
            <div class="error-message">
                <p class="text-secondary">Không thể tải bình luận. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

/**
 * Load thống kê đánh giá của phim
 */
async function loadRatingStats() {
    try {
        // Gọi API lấy thống kê rating (cần thêm API endpoint này ở backend)
        // Tạm thời dùng dữ liệu giả
        const averageRating = 4.5;
        const ratingCount = 128;
        
        // Cập nhật UI
        document.getElementById('averageRating').textContent = averageRating.toFixed(1);
        document.getElementById('ratingCount').textContent = `(${ratingCount} đánh giá)`;
        
        // Cập nhật sao trung bình
        updateStarsDisplay('averageStars', averageRating);
        
    } catch (error) {
        console.error('❌ Lỗi khi load rating stats:', error);
    }
}

/**
 * Render HTML cho một comment
 * @param {object} comment - Dữ liệu comment từ API
 * @returns {string} HTML string
 */
function renderCommentHTML(comment) {
    const isOwner = currentUser && currentUser._id === comment.userId?._id;
    const userName = comment.userId?.fullName || 'Người dùng';
    const userAvatar = comment.userId?.avatar || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
    
    // Tính thời gian đã đăng
    const timeAgo = getTimeAgo(comment.createdAt);
    
    return `
        <div class="comment-item" data-comment-id="${comment._id}">
            <div class="comment-avatar">
                <img src="${userAvatar}" alt="${userName}">
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${userName}</span>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <div class="comment-text">
                    ${escapeHtml(comment.content)}
                </div>
                ${isOwner ? `
                    <div class="comment-actions">
                        <button class="btn-delete-comment" data-comment-id="${comment._id}">
                            🗑️ Xóa
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ==================== XỬ LÝ SỰ KIỆN ====================

/**
 * Thiết lập các event listeners
 */
function setupEventListeners() {
    // Sự kiện click vào sao để đánh giá
    const starInputs = document.querySelectorAll('.star-input');
    starInputs.forEach(star => {
        star.addEventListener('click', handleStarClick);
        star.addEventListener('mouseenter', handleStarHover);
    });
    
    // Sự kiện hover out khỏi vùng sao
    const starsInput = document.getElementById('starsInput');
    if (starsInput) {
        starsInput.addEventListener('mouseleave', () => {
            updateStarsDisplay('starsInput', currentUserRating);
        });
    }
    
    // Sự kiện gửi bình luận
    const submitBtn = document.getElementById('submitCommentBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmitComment);
    }
    
    // Sự kiện nhấn Enter trong textarea (Ctrl+Enter để gửi)
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                handleSubmitComment();
            }
        });
    }
    
    // Sự kiện xóa comment (dùng event delegation)
    const commentsList = document.getElementById('commentsList');
    if (commentsList) {
        commentsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-comment')) {
                const commentId = e.target.dataset.commentId;
                handleDeleteComment(commentId);
            }
        });
    }
}

/**
 * Xử lý click vào sao (đánh giá)
 */
async function handleStarClick(e) {
    if (!currentUser) {
        alert('Vui lòng đăng nhập để đánh giá');
        window.location.href = 'login.html';
        return;
    }
    
    const rating = parseInt(e.target.dataset.value);
    console.log(`⭐ User đánh giá ${rating} sao`);
    
    try {
        // Gọi API gửi đánh giá (backend mong đợi 'star' không phải 'rating')
        await window.API.rateMovie({
            movieId: currentMovieId,
            star: rating
        });
        
        currentUserRating = rating;
        updateStarsDisplay('starsInput', rating);
        
        // Reload thống kê rating
        await loadRatingStats();
        
        console.log('✅ Đánh giá thành công!');
        
        // Hiển thị toast thông báo thành công
        if (typeof window.showToast === 'function') {
            window.showToast(`Bạn đã đánh giá phim ${rating} ⭐`, 'success');
        }
        
    } catch (error) {
        console.error('❌ Lỗi khi đánh giá:', error);
        if (typeof window.showToast === 'function') {
            window.showToast('Không thể gửi đánh giá. Vui lòng thử lại.', 'error');
        } else {
            alert('Không thể gửi đánh giá. Vui lòng thử lại.');
        }
    }
}

/**
 * Xử lý hover vào sao (hiệu ứng preview)
 */
function handleStarHover(e) {
    const rating = parseInt(e.target.dataset.value);
    updateStarsDisplay('starsInput', rating);
}

/**
 * Xử lý gửi bình luận
 */
async function handleSubmitComment() {
    if (!currentUser) {
        alert('Vui lòng đăng nhập để bình luận');
        window.location.href = 'login.html';
        return;
    }
    
    const commentInput = document.getElementById('commentInput');
    const content = commentInput.value.trim();
    
    // Validate
    if (!content) {
        alert('Vui lòng nhập nội dung bình luận');
        commentInput.focus();
        return;
    }
    
    if (content.length > 500) {
        alert('Bình luận không được quá 500 ký tự');
        return;
    }
    
    console.log('💬 Đang gửi bình luận...');
    
    // Disable button để tránh spam
    const submitBtn = document.getElementById('submitCommentBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
    
    try {
        // Gọi API gửi comment
        await window.API.postComment({
            movieId: currentMovieId,
            content: content
        });
        
        console.log('✅ Gửi bình luận thành công!');
        
        // Xóa nội dung textarea
        commentInput.value = '';
        
        // Reload danh sách comments
        await loadComments();
        
    } catch (error) {
        console.error('❌ Lỗi khi gửi comment:', error);
        alert('Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
        // Enable lại button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi bình luận';
    }
}

/**
 * Xử lý xóa bình luận
 */
async function handleDeleteComment(commentId) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) {
        return;
    }
    
    console.log('🗑️ Đang xóa comment:', commentId);
    
    try {
        // Gọi API xóa comment
        await window.API.deleteComment(commentId);
        
        console.log('✅ Xóa bình luận thành công!');
        
        // Reload danh sách comments
        await loadComments();
        
    } catch (error) {
        console.error('❌ Lỗi khi xóa comment:', error);
        alert('Không thể xóa bình luận. Vui lòng thử lại.');
    }
}

// ==================== HÀM TIỆ ÍCH ====================

/**
 * Cập nhật hiển thị sao
 * @param {string} containerId - ID của container chứa sao
 * @param {number} rating - Số sao cần hiển thị
 */
function updateStarsDisplay(containerId, rating) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

/**
 * Tính thời gian đã trôi qua
 * @param {string} dateString - Thời gian dạng ISO string
 * @returns {string} VD: "2 giờ trước", "3 ngày trước"
 */
function getTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    
    return past.toLocaleDateString('vi-VN');
}

/**
 * Escape HTML để tránh XSS
 * @param {string} text - Text cần escape
 * @returns {string} Text đã escape
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== EXPORT ====================
// Export hàm initComments để sử dụng trong detail.js
window.initComments = initComments;
