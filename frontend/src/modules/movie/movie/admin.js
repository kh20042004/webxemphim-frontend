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
            // Tạm dùng fetch gọi trực tiếp API bạn vừa làm
            const response = await fetch('http://localhost:5000/api/admin/movies');
            const result = await response.json();
            
            if (result.success) {
                renderTable(result.data);
            }
        } catch (error) {
            console.error('Lỗi tải danh sách phim:', error);
            movieTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-secondary">Lỗi kết nối server!</td></tr>`;
        }
    }

    // Vẽ từng dòng HTML cho Bảng
    function renderTable(movies) {
        movieTableBody.innerHTML = ''; // Xóa rỗng
        
        if (movies.length === 0) {
            movieTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Chưa có phim nào. Hãy thêm mới!</td></tr>`;
            return;
        }

        movies.forEach(movie => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${movie.poster || '../assets/images/login-bg.jpg'}" class="poster-thumbnail" alt="poster">
                </td>
                <td><strong>${movie.title}</strong></td>
                <td>${movie.category}</td>
                <td><span class="btn btn-outline" style="padding: 2px 8px; font-size: 12px;">${movie.type}</span></td>
                <td>${movie.views} 👁️</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteMovie('${movie._id}')">🗑️ Xóa</button>
                </td>
            `;
            movieTableBody.appendChild(tr);
        });
    }

    // 2. XỬ LÝ FORM THÊM PHIM
    movieForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Chặn tải lại trang
        
        const btnSubmit = document.getElementById('btnSubmitForm');
        btnSubmit.textContent = 'Đang xử lý...';
        btnSubmit.disabled = true;

        try {
            let finalPosterUrl = null;
            const fileInput = document.getElementById('moviePosterFile');

            // BƯỚC A: Nếu Admin có chọn ảnh, gọi API Upload trước!
            if (fileInput.files.length > 0) {
                uploadStatus.textContent = 'Đang tải ảnh lên hệ thống...';
                
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);

                // Gọi hàm uploadFileAPI trong api.js của Leader (Chỉ đổi URL qua Cloudinary)
                const uploadResponse = await fetch('http://localhost:5000/api/upload/poster', {
                    method: 'POST',
                    body: formData // multer tự hiểu FormData
                });
                const uploadResult = await uploadResponse.json();

                if (uploadResult.success) {
                    finalPosterUrl = uploadResult.data.url;
                    uploadStatus.textContent = 'Tải ảnh thành công!';
                } else {
                    throw new Error('Lỗi upload ảnh');
                }
            }

            // BƯỚC B: Gom dữ liệu chữ + Link ảnh vừa lấy để tạo Phim
            const movieData = {
                title: document.getElementById('movieTitle').value,
                description: document.getElementById('movieDesc').value,
                category: document.getElementById('movieCategory').value,
                type: document.getElementById('movieType').value,
                poster: finalPosterUrl
            };

            // Gọi API Thêm Phim của Leader Khanh
            await window.API.createMovie(movieData);
            
            alert('Thêm phim thành công rực rỡ!');
            closeModal();
            loadMovies(); // Tải lại bảng ngay lập tức

        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra, vui lòng xem Console!');
        } finally {
            btnSubmit.textContent = 'Lưu Phim';
            btnSubmit.disabled = false;
        }
    });

    // 3. HÀM XÓA PHIM (Gắn thẳng vào window để gọi từ HTML string được)
    window.deleteMovie = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa bộ phim này vĩnh viễn không?')) {
            try {
                await window.API.deleteMovie(id);
                loadMovies(); // Xóa xong tải lại bảng
            } catch (error) {
                alert('Lỗi khi xóa phim!');
            }
        }
    };

    // --- ĐÓNG/MỞ MODAL ---
    document.getElementById('btnOpenAddModal').addEventListener('click', () => {
        movieForm.reset();
        uploadStatus.textContent = '';
        modal.classList.remove('hidden');
    });

    document.getElementById('btnCloseModal').addEventListener('click', closeModal);

    function closeModal() {
        modal.classList.add('hidden');
    }
});