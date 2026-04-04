document.addEventListener('DOMContentLoaded', () => {
    const movieTableBody = document.getElementById('movieTableBody');
    const modal = document.getElementById('movieModal');
    const movieForm = document.getElementById('movieForm');
    const uploadStatus = document.getElementById('uploadStatus');

    // Chạy ngay khi mở trang
    loadMovies();

    // 1. HÀM TẢI DANH SÁCH PHIM LÊN BẢNG
    async function loadMovies() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                movieTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">❌ Chưa đăng nhập!</td></tr>`;
                return;
            }

            const response = await fetch('http://localhost:5000/api/admin/movies', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                window.location.href = './login.html';
                return;
            }

            const result = await response.json();

            if (result.success) {
                window.currentMovieList = result.data; // Lưu lại để dùng cho chức năng Sửa
                renderTable(result.data);
            }
        } catch (error) {
            console.error('Lỗi tải danh sách phim:', error);
            movieTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">Lỗi kết nối server!</td></tr>`;
        }
    }

    // Vẽ Bảng
    function renderTable(movies) {
        movieTableBody.innerHTML = '';

        if (movies.length === 0) {
            movieTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Chưa có phim nào. Hãy thêm mới!</td></tr>`;
            return;
        }

        movies.forEach(movie => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${movie.poster || '../assets/images/login-bg.jpg'}" class="poster-thumbnail" alt="poster" style="width: 50px; height: 70px; object-fit: cover;">
                </td>
                <td><strong>${movie.title}</strong></td>
                <td>${movie.category}</td>
                <td><span class="btn btn-outline" style="padding: 2px 8px; font-size: 12px;">${movie.type}</span></td>
                <td>${movie.views} 👁️</td>
                <td>
                    <button class="btn btn-warning" style="margin-right: 5px;" onclick="editMovie('${movie._id}')">✏️ Sửa</button>
                    <button class="btn btn-danger" onclick="deleteMovie('${movie._id}')">🗑️ Xóa</button>
                </td>
            `;
            movieTableBody.appendChild(tr);
        });
    }

    // 2. XỬ LÝ FORM THÊM / SỬA PHIM
    movieForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSubmit = document.getElementById('btnSubmitForm');
        btnSubmit.textContent = 'Đang xử lý...';
        btnSubmit.disabled = true;

        try {
            let finalPosterUrl = null;
            const fileInput = document.getElementById('moviePosterFile');

            // BƯỚC A: Upload ảnh bằng hàm có sẵn trong api.js
            if (fileInput.files.length > 0) {
                uploadStatus.textContent = 'Đang tải ảnh lên hệ thống...';
                const formData = new FormData();
                formData.append('File', fileInput.files[0]); // Đảm bảo backend dùng 'file' trong multer

                // Gọi trực tiếp fetch thay vì dùng hàm trong api.js bị thiếu đường dẫn
                const uploadResponse = await fetch('http://localhost:5000/api/upload/poster', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                        // Không truyền Content-Type để trình duyệt tự xử lý FormData
                    },
                    body: formData
                });

                const uploadResult = await uploadResponse.json();

                // Kiểm tra cả response.ok (status 200) và result.success
                if (uploadResponse.ok && uploadResult.success) {
                    finalPosterUrl = uploadResult.data.url; // Lấy URL từ Cloudinary
                    uploadStatus.textContent = 'Tải ảnh thành công!';
                } else {
                    throw new Error(uploadResult.message || 'Lỗi upload ảnh từ server');
                }
            }

            // BƯỚC B: Gom dữ liệu
            const movieData = {
                title: document.getElementById('movieTitle').value,
                description: document.getElementById('movieDesc').value,
                category: document.getElementById('movieCategory').value,
                type: document.getElementById('movieType').value,
                poster: finalPosterUrl,
                episodes: [
                    {
                        name: "Full",
                        videoUrl: document.getElementById('movieVideoUrl').value
                    }
                ]
            };

            const currentMovieId = document.getElementById('movieId').value;

            // BƯỚC C: Ngã ba Quyết định (Thêm hay Sửa)
            if (currentMovieId) {
                if (!finalPosterUrl) delete movieData.poster; // Giữ ảnh cũ nếu ko up ảnh mới
                await window.API.updateMovie(currentMovieId, movieData);
                alert('Cập nhật phim thành công!');
            } else {
                await window.API.createMovie(movieData);
                alert('Thêm phim thành công rực rỡ!');
            }

            closeModal();
            loadMovies();

        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra, vui lòng xem Console!');
        } finally {
            btnSubmit.textContent = 'Lưu Phim';
            btnSubmit.disabled = false;
        }
    });

    // 3. HÀM SỬA PHIM (Đổ dữ liệu lên Form)
    window.editMovie = (id) => {
        const movie = window.currentMovieList.find(m => m._id === id);
        if (!movie) return;

        document.getElementById('modalTitle').textContent = 'Sửa Phim';
        document.getElementById('movieId').value = movie._id;
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieDesc').value = movie.description;
        document.getElementById('movieCategory').value = movie.category;
        document.getElementById('movieType').value = movie.type;

        if (movie.episodes && movie.episodes.length > 0) {
            document.getElementById('movieVideoUrl').value = movie.episodes[0].videoUrl;
        } else {
            document.getElementById('movieVideoUrl').value = '';
        }

        document.getElementById('uploadStatus').textContent = '(Bỏ trống nếu không đổi ảnh)';
        document.getElementById('btnSubmitForm').textContent = 'Cập Nhật';

        modal.classList.remove('hidden');
    };

    // 4. HÀM XÓA PHIM
    window.deleteMovie = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa bộ phim này vĩnh viễn không?')) {
            try {
                await window.API.deleteMovie(id);
                loadMovies();
            } catch (error) {
                alert('Lỗi khi xóa phim!');
            }
        }
    };

    // --- ĐÓNG/MỞ MODAL ---
    document.getElementById('btnOpenAddModal').addEventListener('click', () => {
        movieForm.reset();
        document.getElementById('modalTitle').textContent = 'Thêm Phim Mới';
        document.getElementById('movieId').value = '';
        document.getElementById('btnSubmitForm').textContent = 'Lưu Phim';
        uploadStatus.textContent = '';
        modal.classList.remove('hidden');
    });

    const closeBtn = document.getElementById('btnCloseModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.classList.add('hidden');
    }
});

// --- LOGIC CHUYỂN TAB ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');

        // Đổi trạng thái nút
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Hiện section tương ứng
        tabContents.forEach(content => {
            content.classList.add('hidden');
            if (content.id === target) content.classList.remove('hidden');
        });

        // Nếu chuyển sang tab User thì load dữ liệu User
        if (target === 'userSection') loadUsers();
    });
});

// --- LOGIC QUẢN LÝ USER ---
async function loadUsers() {
    const userTableBody = document.getElementById('userTableBody');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
            renderUserTable(result.data);
        }
    } catch (error) {
        userTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Lỗi tải người dùng</td></tr>`;
    }
}

function renderUserTable(users) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${user.avatar || '../assets/images/default-avatar.png'}" class="avatar-sm"></td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td><span class="badge">${user.role}</span></td>
            <td>
                <span class="${user.isActive ? 'text-success' : 'text-danger'}">
                    ${user.isActive ? '● Đang hoạt động' : '● Đã bị khóa'}
                </span>
            </td>
            <td>
                <button class="btn ${user.isActive ? 'btn-danger' : 'btn-success'}" 
                        onclick="toggleUserStatus('${user._id}')">
                    ${user.isActive ? '🚫 Khóa' : '🔓 Mở khóa'}
                </button>
            </td>
        `;
        userTableBody.appendChild(tr);
    });
}

// Hàm khóa/mở khóa tài khoản
window.toggleUserStatus = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${id}/toggle-status`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) loadUsers(); // Load lại bảng sau khi đổi trạng thái
    } catch (error) {
        alert('Lỗi thao tác người dùng');
    }
};