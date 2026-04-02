const BASE_URL = "http://localhost:5000/api/movies";
let currentPage = 1;
const limit = 12;

// --- 1. Hàm gọi API chính ---
async function loadMovies() {
    // Lấy các element lọc
    const searchInput = document.getElementById('search-input');
    const typeSelect = document.getElementById('filter-type');
    const categorySelect = document.getElementById('filter-category');
    const yearSelect = document.getElementById('year-filter');
    const grid = document.getElementById('movie-grid');

    // Hiển thị trạng thái đang tải
    grid.innerHTML = '<div class="loading-spinner">Đang tải phim...</div>';

    // Xử lý tham số từ URL (nếu có tìm kiếm từ Navbar)
    const urlParams = new URLSearchParams(window.location.search);
    const navSearch = urlParams.get('search');

    const params = new URLSearchParams({
        page: currentPage,
        limit: limit
    });

    // Ưu tiên: Nếu có 'search' trên URL thì dùng, không thì lấy từ ô Input
    const searchKeyword = navSearch || searchInput.value.trim();
    if (searchKeyword) params.append('search', searchKeyword);

    // Thêm các bộ lọc khác
    if (typeSelect.value && typeSelect.value !== "Tất cả") params.append('type', typeSelect.value);
    if (categorySelect.value && categorySelect.value !== "Tất cả") params.append('category', categorySelect.value);
    if (yearSelect.value) params.append('year', yearSelect.value);

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
            renderMovies(result.data);
            updatePagination(result.pagination.totalPages);
        } else {
            grid.innerHTML = `<p>${result.message || "Không tìm thấy phim."}</p>`;
        }
    } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
        grid.innerHTML = '<p style="text-align:center; width:100%">❌ Không thể kết nối với Server.</p>';
    }
}

// --- 2. Hàm hiển thị phim ---
function renderMovies(movies) {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = "";

    if (!movies || movies.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color: #ccc; padding: 50px;">🔍 Không tìm thấy phim phù hợp.</p>';
        return;
    }

    grid.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="goToDetail('${movie._id}')">
            <span class="badge">${movie.type === 'phim_le' ? 'Phim Lẻ' : 'Phim Bộ'}</span>
            <img src="${movie.thumbnail || movie.posterUrl}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <div class="movie-meta">
                    <span>📅 ${movie.year}</span> | 📂 ${movie.category}
                </div>
            </div>
        </div>
    `).join('');
}

// --- 3. Xử lý Phân trang ---
function updatePagination(totalPages) {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages || 1}`;

    document.getElementById('prev-btn').disabled = (currentPage <= 1);
    document.getElementById('next-btn').disabled = (currentPage >= totalPages);
}

// --- 4. Gán sự kiện ---
document.getElementById('search-btn').onclick = () => {
    currentPage = 1;
    loadMovies();
};

document.getElementById('clear-btn').onclick = () => {
    document.getElementById('search-input').value = "";
    document.getElementById('filter-type').value = "Tất cả";
    document.getElementById('filter-category').value = "Tất cả";
    document.getElementById('year-filter').value = "";
    window.history.replaceState({}, document.title, window.location.pathname); // Xóa query search trên URL
    currentPage = 1;
    loadMovies();
};

// Tự động load khi thay đổi dropdown
['filter-type', 'filter-category', 'year-filter'].forEach(id => {
    document.getElementById(id).onchange = () => {
        currentPage = 1;
        loadMovies();
    };
});

document.getElementById('prev-btn').onclick = () => {
    if (currentPage > 1) { currentPage--;
        loadMovies();
        window.scrollTo(0, 0); }
};

document.getElementById('next-btn').onclick = () => {
    currentPage++;
    loadMovies();
    window.scrollTo(0, 0);
};

// Hàm giả định chuyển trang chi tiết
function goToDetail(id) {
    console.log("Chuyển đến phim ID:", id);
    // window.location.href = `detail.html?id=${id}`;
}

// Khởi chạy khi load trang
window.onload = loadMovies;