/**
 * PROFILE MODULE (Optimized for Dashboard UI)
 * Logic for user profile management & stats
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial data fetch
    loadUserProfile();

    // Event Listeners for Update Actions
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', handleUpdateProfile);
    }

    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', handleChangePassword);
    }

    // Avatar Input listener
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarChange);
    }

    // Logout Button Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

/**
 * Load User Profile Data
 */
async function loadUserProfile() {
    try {
        const response = await API.getUserProfile();
        if (response.success) {
            const user = response.data;
            updateProfileUI(user);
            // Save to local storage for other pages
            localStorage.setItem('user', JSON.stringify(user));
            
            // Stats logic
            updateStatsUI(user);
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        showToast('Không thể tải thông tin hồ sơ', 'error');
    }
}

/**
 * Update UI with User Data
 */
function updateProfileUI(user) {
    // Text Displays
    const elementsSelectors = {
        'fullNameDisplay': user.fullName || 'Người dùng',
        'fullName': user.fullName || '',
        'email': user.email || '',
        'welcomeUser': `Xin chào, ${(user.fullName || 'Thành viên').split(' ')[0]}!`,
        'planBadge': (user.subscription?.plan || 'Free Member').toUpperCase(),
    };

    for (const [id, value] of Object.entries(elementsSelectors)) {
        const el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'INPUT') el.value = value;
            else el.textContent = value;
        }
    }

    // Xử lý hiển thị avatar (nếu avatar là relative path thì thêm backend URL)
    const avatarSrc = user.avatar 
        ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000/${user.avatar}`)
        : 'https://images.unsplash.com/photo-1540612633322-62cb3e24de81?q=80';

    const avatarEls = ['avatarPreview', 'headerAvatar', 'sidebarAvatar', 'mobileAvatar'];
    avatarEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = avatarSrc;
    });
}

/**
 * Update Stats (History count, Favorites count, etc.)
 */
async function updateStatsUI(user) {
    const statHistory = document.getElementById('statHistory');
    const statFavorites = document.getElementById('statFavorites');
    const statPlan = document.getElementById('statPlan');

    function getLocalWatchHistoryCount() {
        try {
            const history = JSON.parse(localStorage.getItem('watchHistoryCache') || '[]');
            return Array.isArray(history) ? history.length : 0;
        } catch (error) {
            console.warn('Failed to read local history cache', error);
            return 0;
        }
    }

    if (statFavorites) statFavorites.textContent = user.favorites?.length || 0;
    if (statPlan) statPlan.textContent = (user.subscription?.plan || 'Free').toUpperCase();

    if (statHistory) {
        try {
            const historyRes = await API.getWatchHistory();
            if (historyRes.success) {
                const apiCount = Array.isArray(historyRes.data) ? historyRes.data.length : 0;
                statHistory.textContent = apiCount > 0 ? apiCount : getLocalWatchHistoryCount();
            }
        } catch (e) {
            statHistory.textContent = getLocalWatchHistoryCount();
            console.warn('Failed to load history stats');
        }
    }
}

/**
 * Handle Avatar File Change (Preview)
 */
function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('avatarPreview');
            if (preview) preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Handle Profile Update (Name + Avatar)
 */
async function handleUpdateProfile() {
    const fullName = document.getElementById('fullName').value;
    const avatarInput = document.getElementById('avatarInput');
    const updateBtn = document.getElementById('updateProfileBtn');
    
    try {
        updateBtn.disabled = true;
        updateBtn.textContent = 'Đang lưu...';

        // 1. Check if avatar changed
        if (avatarInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', avatarInput.files[0]);
            const uploadRes = await API.uploadAvatar(formData);
            if (!uploadRes.success) throw new Error('Upload ảnh không thành công');
        }

        // 2. Update Name
        const res = await API.updateProfile({ fullName });
        if (res.success) {
            showToast('Đã lưu thay đổi hồ sơ!');
            loadUserProfile(); // Refresh
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        showToast(error.message || 'Lỗi khi cập nhật', 'error');
    } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Lưu thay đổi';
    }
}

/**
 * Handle Password Change
 */
async function handleChangePassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const changeBtn = document.getElementById('changePasswordBtn');

    if (!oldPassword || !newPassword || !passwordConfirm) {
        showToast('Vui lòng nhập đầy đủ các trường mật khẩu', 'error');
        return;
    }

    if (newPassword !== passwordConfirm) {
        showToast('Mật khẩu mới không khớp!', 'error');
        return;
    }

    try {
        changeBtn.disabled = true;
        changeBtn.textContent = 'Đang xử lý...';

        const res = await API.changePassword({ oldPassword, newPassword, passwordConfirm });
        if (res.success) {
            showToast('Đổi mật khẩu thành công!');
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('passwordConfirm').value = '';
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        showToast(error.message || 'Đổi mật khẩu thất bại', 'error');
    } finally {
        changeBtn.disabled = false;
        changeBtn.textContent = 'Cập nhật mật khẩu';
    }
}

// toast.js đã cung cấp window.showToast(), không cần định nghĩa lại tại đây

/**
 * Handle Logout
 */
async function handleLogout() {
    try {
        // Hiển thị xác nhận trước
        const confirmed = confirm('Bạn chắc chắn muốn đăng xuất?');
        if (!confirmed) return;

        console.log('🔐 Đang đăng xuất...');
        
        // Gọi API logout
        await API.logout();
        
        console.log('✅ Đăng xuất thành công');

        // Xóa dữ liệu lưu trữ
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('redirectAfterLogin');

        // Hiển thị thông báo
        if (typeof window.showToast === 'function') {
            window.showToast('Đã đăng xuất thành công', 'success');
        } else {
            alert('Đã đăng xuất thành công');
        }

        // Chuyển về trang index
        setTimeout(() => {
            window.location.href = './index.html';
        }, 1500);

    } catch (error) {
        console.error('❌ Lỗi khi đăng xuất:', error);
        
        // Dù có lỗi, vẫn xóa token và redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (typeof window.showToast === 'function') {
            window.showToast('Đã đăng xuất (có lỗi kết nối)', 'warning');
        } else {
            alert('Đã đăng xuất');
        }

        // Redirect về index
        setTimeout(() => {
            window.location.href = './index.html';
        }, 1000);
    }
}
