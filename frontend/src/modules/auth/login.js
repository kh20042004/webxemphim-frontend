/* ============================================
   LOGIN PAGE LOGIC
   ============================================ */

// ============================================
// HANDLE GOOGLE OAUTH CALLBACK - EXTRACT TOKEN FROM URL
// ============================================
function handleGoogleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    // Backend Google OAuth callback gửi về 'accessToken' và 'refreshToken' (không phải 'token')
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    
    if (accessToken) {
        console.log('✅ AccessToken từ Google callback nhận được');
        
        // Lưu cả 2 token vào localStorage
        localStorage.setItem('token', accessToken);           // Lưu accessToken dưới tên 'token' để các api.js dùng
        localStorage.setItem('accessToken', accessToken);     // Lưu thêm tên chuẩn
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken); // Lưu refreshToken để tự động gia hạn sau
        }
        
        // Bỏ các params khỏi URL cho gọn (clean up)
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Fetch thông tin user từ backend bằng accessToken vừa nhận
        fetchUserData(accessToken);
    }
}

// Hàm fetch user data từ token (gọi tới Backend port 5000)
async function fetchUserData(token) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                localStorage.setItem('user', JSON.stringify(data.data));
                console.log('✅ User data saved:', data.data);
                
                // Redirect to home page
                alert('Đăng nhập với Google thành công!');
                window.location.href = './index.html';
            }
        } else {
            console.error('❌ Failed to fetch user data:', response.statusText);
            alert('Lỗi khi lấy dữ liệu người dùng');
        }
    } catch (error) {
        console.error('❌ Fetch user error:', error);
        alert('Lỗi kết nối. Vui lòng thử lại.');
    }
}

// Gọi hàm khi page load
document.addEventListener('DOMContentLoaded', () => {
    handleGoogleCallback();
    loadRememberedEmail();
});

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const loadingSpinner = document.getElementById('loadingSpinner');
const googleLoginBtn = document.getElementById('googleLoginBtn');

// ============================================
// LOAD REMEMBERED EMAIL
// ============================================
function loadRememberedEmail() {
    const savedEmail = localStorage.getItem('rememberEmail');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    if (savedEmail) {
        emailInput.value = savedEmail;
        if (rememberMeCheckbox) {
            rememberMeCheckbox.checked = true;
        }
    }
}

// ============================================
// FORM VALIDATION
// ============================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function clearErrors() {
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
}

function showError(inputElement, errorElement, message) {
    errorElement.textContent = message;
    inputElement.classList.add('error');
}

// ============================================
// FORM SUBMISSION
// ============================================

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validation
    let hasError = false;

    if (!email) {
        showError(emailInput, emailError, 'Email không được để trống');
        hasError = true;
    } else if (!validateEmail(email)) {
        showError(emailInput, emailError, 'Email không hợp lệ');
        hasError = true;
    }

    if (!password) {
        showError(passwordInput, passwordError, 'Mật khẩu không được để trống');
        hasError = true;
    } else if (!validatePassword(password)) {
        showError(passwordInput, passwordError, 'Mật khẩu phải có ít nhất 6 ký tự');
        hasError = true;
    }

    if (hasError) return;

    // Show loading spinner
    loadingSpinner.classList.add('active');
    loginForm.querySelector('.btn-login').disabled = true;

    try {
        // Gọi API đăng nhập
        const response = await loginAPI({ email, password });

        // Backend trả về: { success, data: { accessToken, refreshToken, user } }
        // Phải kiểm tra 'accessToken' (KHÔNG phải 'token')
        if (response && response.data && response.data.accessToken) {
            const { accessToken, refreshToken, user } = response.data;

            // Lưu accessToken vào localStorage dưới tên 'token' để api.js dùng
            localStorage.setItem('token', accessToken);
            localStorage.setItem('accessToken', accessToken);     // Lưu thêm tên chuẩn
            localStorage.setItem('user', JSON.stringify(user || {}));

            // Lưu refreshToken để sau này tự động gia hạn token khi hết hạn
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            // Ghi nhớ email nếu user chọn "Ghi nhớ tôi"
            if (rememberMe) {
                localStorage.setItem('rememberEmail', email);
            } else {
                // Nếu không chọn ghi nhớ, xóa email đã lưu trước đó
                localStorage.removeItem('rememberEmail');
            }

            // Hiển thị thông báo thành công và chuyển sang trang chủ
            alert('Đăng nhập thành công!');
            window.location.href = './index.html';
        } else {
            // API trả về nhưng không có token → hiển thị thông báo lỗi
            showError(emailInput, emailError, response?.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        showError(emailInput, emailError, error.message || 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
        // Ẩn loading spinner và bật lại nút đăng nhập
        loadingSpinner.classList.remove('active');
        loginForm.querySelector('.btn-login').disabled = false;
    }
});

// ============================================
// GOOGLE LOGIN
// ============================================

googleLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Redirect tới backend Google OAuth endpoint (Backend chạy ở port 5000)
    window.location.href = 'http://localhost:5000/api/auth/google';
});

// ============================================
// HANDLE OAUTH CALLBACK & LOAD SAVED EMAIL
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    // ============ KIỂM TRA GOOGLE OAUTH CALLBACK ============
    // Backend Google redirect về: ?accessToken=xxx&refreshToken=yyy
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken) {
        try {
            // Lưu token và set header cho các request tiếp theo
            localStorage.setItem('token', accessToken);           // Tên 'token' để api.js compatible
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            
            console.log('✅ Google OAuth thành công - Token đã lưu');
            
            // Lấy thông tin user từ backend
            getCurrentUserAPI()
                .then(response => {
                    if (response && response.data) {
                        localStorage.setItem('user', JSON.stringify(response.data));
                        alert('Đăng nhập Google thành công!');
                        window.location.href = './index.html';
                    }
                })
                .catch(error => {
                    console.error('Lỗi lấy dữ liệu user:', error);
                    alert('Lỗi khi tải dữ liệu người dùng');
                    localStorage.removeItem('token');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                });
        } catch (error) {
            console.error('Lỗi xử lý Google OAuth:', error);
            alert('Lỗi xử lý kết quả đăng nhập. Vui lòng thử lại.');
            localStorage.removeItem('token');
        }
        return; // Dừng lại, không chạy code phía dưới
    }

    // ============ LOAD SAVED EMAIL (IF "REMEMBER ME" WAS CHECKED) ============
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// ============================================
// REAL-TIME VALIDATION
// ============================================

emailInput.addEventListener('blur', () => {
    if (emailInput.value.trim()) {
        emailInput.classList.remove('error');
        emailError.textContent = '';
    }
});

passwordInput.addEventListener('blur', () => {
    if (passwordInput.value) {
        passwordInput.classList.remove('error');
        passwordError.textContent = '';
    }
});

// ============================================
// FORGOT PASSWORD MODAL - 2 STEPS
// ============================================

const forgotPasswordLink = document.querySelector('.forgot-password');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const modalOverlay = document.getElementById('modalOverlay');
const closeForgotModal = document.getElementById('closeForgotModal');

// Step 1: Send Code
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotEmail = document.getElementById('forgotEmail');
const forgotEmailError = document.getElementById('forgotEmailError');
const sendCodeBtn = document.getElementById('sendCodeBtn');

// Step 2: Reset Password
const resetPasswordForm = document.getElementById('resetPasswordForm');
const resetCode = document.getElementById('resetCode');
const resetCodeError = document.getElementById('resetCodeError');
const newPassword = document.getElementById('newPassword');
const newPasswordError = document.getElementById('newPasswordError');
const confirmNewPassword = document.getElementById('confirmNewPassword');
const confirmNewPasswordError = document.getElementById('confirmNewPasswordError');
const resetBtn = document.getElementById('resetBtn');
const backBtn = document.getElementById('backBtn');

// Step Container
const step1SendCode = document.getElementById('step1-send-code');
const step2ResetPassword = document.getElementById('step2-reset-password');

let currentForgotEmail = '';

// Helper: Switch Steps
function showStep(stepElement, hideElement) {
    hideElement.classList.remove('active');
    stepElement.classList.add('active');
}

// Open Modal
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordModal.classList.add('active');
    modalOverlay.classList.add('active');
    showStep(step1SendCode, step2ResetPassword);
    forgotEmail.focus();
});

// Close Modal
function closeForgotPasswordModal() {
    forgotPasswordModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
    forgotEmailError.textContent = '';
    resetCodeError.textContent = '';
    newPasswordError.textContent = '';
    confirmNewPasswordError.textContent = '';
    showStep(step1SendCode, step2ResetPassword);
}

closeForgotModal.addEventListener('click', closeForgotPasswordModal);
modalOverlay.addEventListener('click', closeForgotPasswordModal);

// Step 1: Send Code Form
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    forgotEmailError.textContent = '';

    const email = forgotEmail.value.trim();

    if (!email) {
        forgotEmailError.textContent = 'Email không được để trống';
        return;
    }

    if (!validateEmail(email)) {
        forgotEmailError.textContent = 'Email không hợp lệ';
        return;
    }

    sendCodeBtn.disabled = true;
    sendCodeBtn.textContent = 'Đang gửi...';

    try {
        // Gửi request tới backend (port 5000) để gửi mã reset password
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentForgotEmail = email;
            showStep(step2ResetPassword, step1SendCode);
            resetCode.focus();
        } else {
            forgotEmailError.textContent = data.message || 'Lỗi gửi email';
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        forgotEmailError.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
    } finally {
        sendCodeBtn.disabled = false;
        sendCodeBtn.textContent = 'Gửi Mã Khôi Phục';
    }
});

// Step 2: Reset Password Form
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetCodeError.textContent = '';
    newPasswordError.textContent = '';
    confirmNewPasswordError.textContent = '';

    const code = resetCode.value.trim();
    const pwNew = newPassword.value;
    const pwConfirm = confirmNewPassword.value;

    if (!code) {
        resetCodeError.textContent = 'Mã khôi phục không được để trống';
        return;
    }

    if (!pwNew) {
        newPasswordError.textContent = 'Mật khẩu mới không được để trống';
        return;
    }

    if (pwNew.length < 6) {
        newPasswordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
        return;
    }

    if (pwNew !== pwConfirm) {
        confirmNewPasswordError.textContent = 'Mật khẩu không khớp';
        return;
    }

    resetBtn.disabled = true;
    resetBtn.textContent = 'Đang đặt lại...';

    try {
        // Gửi request reset password tới backend (port 5000)
        const response = await fetch('http://localhost:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: currentForgotEmail,
                code,
                newPassword: pwNew,
                confirmPassword: pwConfirm
            })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            alert('✅ Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
            closeForgotPasswordModal();
        } else {
            resetCodeError.textContent = data.message || 'Lỗi đặt lại mật khẩu';
        }
    } catch (error) {
        console.error('Reset Password Error:', error);
        resetCodeError.textContent = 'Lỗi kết nối. Vui lòng thử lại.';
    } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = 'Đặt Lại Mật Khẩu';
    }
});

// Back Button
backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showStep(step1SendCode, step2ResetPassword);
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
    resetCodeError.textContent = '';
    newPasswordError.textContent = '';
    confirmNewPasswordError.textContent = '';
    forgotEmail.focus();
});
