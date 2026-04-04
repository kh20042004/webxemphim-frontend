const API_URL = 'http://localhost:5000/api/movies';
let currentPage = 1;
let totalPagesCount = 1;
const limit = 8; // Hiển thị 8 phim mỗi trang (dạng Grid 4 cột x 2 hàng)

function getSearchParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('search'); // Trả về giá trị của ?search=...
}

async function loadMovies() {
    const search = document.getElementById('search-input').value.trim();
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;

    const params = new URLSearchParams({
        page: currentPage,
        limit: limit
    });

    // Chỉ thêm vào params nếu người dùng thực sự chọn/nhập
    if (search) params.append('search', search);
    if (type && type !== "Tất cả") params.append('type', type);
    if (category && category !== "Tất cả") params.append('category', category);

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
            renderMovies(result.data);

            // Cập nhật số liệu phân trang thực tế từ Backend
            totalPagesCount = result.pagination.totalPages || 1;
            currentPage = result.pagination.currentPage || 1;

            updatePaginationUI();
        }
    } catch (error) {
        console.error("Lỗi kết nối:", error);
        document.getElementById('movie-grid').innerHTML = '<p style="text-align:center; width:100%">❌ Không thể kết nối server.</p>';
    }
}

// 1. Hiển thị Grid Phim
function renderMovies(movies) {
    const grid = document.getElementById('movie-grid');
    if (!movies || movies.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color: #ccc; padding: 50px;">Không tìm thấy phim phù hợp.</p>';
        return;
    }

    grid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <span class="badge">${movie.type === 'phim_le' ? 'Phim Lẻ' : 'Phim Bộ'}</span>
            <img src="${movie.thumbnail}" alt="${movie.title}" onerror="this.src='https://picsum.photos/seed/movie/300/450'">
            <div class="movie-info">
                <h3 title="${movie.title}">${movie.title}</h3>
                <div class="movie-meta">
                    <span>📅 ${movie.year} | 📂 ${movie.category}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 2. Cập nhật trạng thái Phân trang
function updatePaginationUI() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    pageInfo.innerText = `Trang ${currentPage} / ${totalPagesCount}`;

    // Khóa/Mở nút dựa trên logic thực tế
    prevBtn.disabled = (currentPage <= 1);
    nextBtn.disabled = (currentPage >= totalPagesCount);

    // Hiệu ứng nút
    [prevBtn, nextBtn].forEach(btn => {
        btn.style.opacity = btn.disabled ? "0.3" : "1";
        btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
    });
}

// --- Xử lý sự kiện ---

// Nút trang trước/sau
document.getElementById('prev-btn').onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        loadMovies();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

document.getElementById('next-btn').onclick = () => {
    if (currentPage < totalPagesCount) {
        currentPage++;
        loadMovies();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// 3. Dropdown Filter: Tự động load khi chọn
document.getElementById('filter-type').onchange = () => {
    currentPage = 1; // Reset về trang 1 khi lọc
    loadMovies();
};

document.getElementById('filter-category').onchange = () => {
    currentPage = 1;
    loadMovies();
};

// Search: Nút Lọc phim
document.getElementById('search-btn').onclick = (e) => {
    e.preventDefault();
    currentPage = 1;
    loadMovies();
};

// Nút Xóa hết
document.getElementById('clear-btn').onclick = () => {
    document.getElementById('search-input').value = "";
    document.getElementById('filter-type').value = "Tất cả";
    document.getElementById('filter-category').value = "Tất cả";
    currentPage = 1;
    loadMovies();
};

// Khởi tạo lần đầu
loadMovies();