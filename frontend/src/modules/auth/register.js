/* ============================================
   REGISTER PAGE LOGIC
   ============================================ */

const registerForm = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const agreeTermsCheckbox = document.getElementById('agreeTerms');
const fullNameError = document.getElementById('fullNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const termsError = document.getElementById('termsError');
const loadingSpinner = document.getElementById('loadingSpinner');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');

// ============================================
// FORM VALIDATION FUNCTIONS
// ============================================

function validateFullName(fullName) {
    return fullName && fullName.trim().length >= 2;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
}

function validateTerms(isChecked) {
    return isChecked;
}

function clearErrors() {
    fullNameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';
    termsError.textContent = '';
    fullNameInput.classList.remove('error');
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    confirmPasswordInput.classList.remove('error');
}

function showError(inputElement, errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

// ============================================
// FORM SUBMISSION
// ============================================

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const agreeTerms = agreeTermsCheckbox.checked;

    // Validation
    let hasError = false;

    // Full Name Validation
    if (!fullName) {
        showError(fullNameInput, fullNameError, 'Họ và tên không được để trống');
        hasError = true;
    } else if (!validateFullName(fullName)) {
        showError(fullNameInput, fullNameError, 'Họ và tên phải có ít nhất 2 ký tự');
        hasError = true;
    }

    // Email Validation
    if (!email) {
        showError(emailInput, emailError, 'Email không được để trống');
        hasError = true;
    } else if (!validateEmail(email)) {
        showError(emailInput, emailError, 'Email không hợp lệ');
        hasError = true;
    }

    // Password Validation
    if (!password) {
        showError(passwordInput, passwordError, 'Mật khẩu không được để trống');
        hasError = true;
    } else if (!validatePassword(password)) {
        showError(passwordInput, passwordError, 'Mật khẩu phải có ít nhất 6 ký tự');
        hasError = true;
    }

    // Confirm Password Validation
    if (!confirmPassword) {
        showError(confirmPasswordInput, confirmPasswordError, 'Vui lòng nhập lại mật khẩu');
        hasError = true;
    } else if (!validatePasswordMatch(password, confirmPassword)) {
        showError(confirmPasswordInput, confirmPasswordError, 'Mật khẩu không khớp');
        hasError = true;
    }

    // Terms Validation
    if (!validateTerms(agreeTerms)) {
        termsError.textContent = 'Vui lòng đồng ý với Điều khoản dịch vụ';
        hasError = true;
    }

    if (hasError) return;

    // Show loading spinner
    loadingSpinner.classList.add('active');
    registerForm.querySelector('.btn-register').disabled = true;

    try {
        // Call Register API
        const response = await registerAPI({
            fullName,
            email,
            password,
            passwordConfirm: confirmPassword,
        });

        // ✅ Kiểm tra đăng ký thành công (backend trả về accessToken)
        if (response && response.success && response.data && response.data.accessToken) {
            // ✅ Hiển thị thông báo thành công với toast
            window.showToast('Đăng ký thành công! Đang chuyển sang trang đăng nhập...', 'success', 2000);
            
            // ✅ Redirect sang trang login sau 1.5 giây
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1500);
        } else if (response && response.message) {
            // Xử lý lỗi từ backend (email đã tồn tại, v.v.)
            if (response.message.includes('email')) {
                showError(emailInput, emailError, response.message);
            } else {
                showError(fullNameInput, fullNameError, response.message);
            }
        } else {
            // Lỗi không xác định
            showError(fullNameInput, fullNameError, 'Đăng ký thất bại');
        }
    } catch (error) {
        console.error('Register error:', error);
        const errorMsg = error.message || 'Lỗi kết nối. Vui lòng thử lại.';
        
        // Check if it's an email conflict error
        if (errorMsg.toLowerCase().includes('email')) {
            showError(emailInput, emailError, errorMsg);
        } else {
            showError(fullNameInput, fullNameError, errorMsg);
        }
    } finally {
        // Hide loading spinner
        loadingSpinner.classList.remove('active');
        registerForm.querySelector('.btn-register').disabled = false;
    }
});

// ============================================
// GOOGLE REGISTER
// ============================================

googleRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Redirect tới backend Google OAuth endpoint (Backend chạy ở port 5000)
    window.location.href = 'http://localhost:5000/api/auth/google';
});

// ============================================
// HANDLE OAUTH CALLBACK & PAGE LOAD
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    // ============ CHECK FOR OAUTH CALLBACK TOKEN ============
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        try {
            // Save token to localStorage
            localStorage.setItem('token', token);
            
            console.log('OAuth Registration Success - Token saved');
            
            // Fetch current user data using the token
            getCurrentUserAPI()
                .then(response => {
                    if (response && response.data) {
                        localStorage.setItem('user', JSON.stringify(response.data));
                        alert('Đăng ký Google thành công!');
                        window.location.href = '/';
                    }
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                    alert('Lỗi khi tải dữ liệu người dùng');
                    localStorage.removeItem('token');
                });
        } catch (error) {
            console.error('Error processing OAuth token:', error);
            alert('Lỗi xử lý kết quả đăng ký. Vui lòng thử lại.');
            localStorage.removeItem('token');
        }
        return; // Stop further execution
    }
});

// ============================================
// REAL-TIME VALIDATION
// ============================================

fullNameInput.addEventListener('blur', () => {
    if (fullNameInput.value.trim()) {
        fullNameInput.classList.remove('error');
        fullNameError.textContent = '';
    }
});

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

confirmPasswordInput.addEventListener('blur', () => {
    if (confirmPasswordInput.value) {
        confirmPasswordInput.classList.remove('error');
        confirmPasswordError.textContent = '';
    }
});

agreeTermsCheckbox.addEventListener('change', () => {
    if (agreeTermsCheckbox.checked) {
        termsError.textContent = '';
    }
});

// ============================================
// PASSWORD MATCH VALIDATION IN REAL-TIME
// ============================================

confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value && passwordInput.value) {
        if (validatePasswordMatch(passwordInput.value, confirmPasswordInput.value)) {
            confirmPasswordInput.classList.remove('error');
            confirmPasswordError.textContent = '';
        } else {
            confirmPasswordInput.classList.add('error');
            confirmPasswordError.textContent = 'Mật khẩu không khớp';
        }
    }
});
