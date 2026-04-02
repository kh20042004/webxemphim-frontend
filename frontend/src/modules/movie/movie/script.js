const API_URL = 'http://localhost:5000/api/movies';
let currentPage = 1;
let totalPagesCount = 1;
const limit = 2; // Sửa thành 2 để 5 phim sẽ chia thành 3 trang, dễ test nút bấm

async function loadMovies() {
    const search = document.getElementById('search-input').value.trim();
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;

    const params = new URLSearchParams({
        page: currentPage,
        limit: limit
    });

    if (search) params.append('search', search);
    if (type && type !== "Tất cả") params.append('type', type);
    if (category && category !== "Tất cả") params.append('category', category);

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);
        const result = await response.json();

        if (result.success) {
            renderMovies(result.data);

            // Cập nhật thông tin phân trang từ server
            totalPagesCount = result.pagination.totalPages || 1;
            currentPage = result.pagination.currentPage || 1;

            updatePaginationUI();
        }
    } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
        document.getElementById('movie-grid').innerHTML = '<p style="text-align:center; width:100%">❌ Lỗi kết nối Server.</p>';
    }
}

function renderMovies(movies) {
    const grid = document.getElementById('movie-grid');
    if (!movies || movies.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; color: #ccc; padding: 20px;">Không tìm thấy phim nào phù hợp với bộ lọc.</p>';
        return;
    }

    grid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <span class="badge">${movie.type === 'phim_le' ? 'Phim Lẻ' : 'Phim Bộ'}</span>
            <img src="${movie.thumbnail}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
            <div class="movie-info">
                <h3 title="${movie.title}">${movie.title}</h3>
                <div class="movie-meta">
                    <span>📅 Năm: ${movie.year}</span><br>
                    <span>📂 Thể loại: ${movie.category}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function updatePaginationUI() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    pageInfo.innerText = `Trang ${currentPage} / ${totalPagesCount}`;

    // Điều khiển trạng thái nút
    prevBtn.disabled = (currentPage <= 1);
    nextBtn.disabled = (currentPage >= totalPagesCount);

    // Style cho nút
    [prevBtn, nextBtn].forEach(btn => {
        btn.style.opacity = btn.disabled ? "0.3" : "1";
        btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
        btn.style.backgroundColor = btn.disabled ? "#555" : "#ff0000"; // Giữ màu đỏ khi dùng được
    });
}

// Sự kiện nút bấm chuyển trang
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

// Sự kiện Lọc phim
document.getElementById('search-btn').onclick = (e) => {
    e.preventDefault();
    currentPage = 1;
    loadMovies();
};

document.getElementById('clear-btn').onclick = () => {
    document.getElementById('search-input').value = "";
    document.getElementById('filter-type').value = "Tất cả";
    document.getElementById('filter-category').value = "Tất cả";
    currentPage = 1;
    loadMovies();
};

// Tự động load khi thay đổi select
document.getElementById('filter-type').onchange = () => {
    currentPage = 1;
    loadMovies();
};
document.getElementById('filter-category').onchange = () => {
    currentPage = 1;
    loadMovies();
};

loadMovies();


window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchKeyword = urlParams.get('search'); // Lấy ?search=... từ URL

    if (searchKeyword) {
        // Điền từ khóa vào ô tìm kiếm và gọi API ngay lập tức
        document.getElementById('search-input').value = decodeURIComponent(searchKeyword);
    }

    // Luôn gọi loadMovies lần đầu khi trang mở ra
    loadMovies();
};

// Xử lý sự kiện Enter trên ô tìm kiếm Navbar (nếu Navbar nằm cùng trang)
const navSearch = document.querySelector('.nav-search-input');
if (navSearch) {
    navSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            window.location.href = `movies.html?search=${encodeURIComponent(e.target.value)}`;
        }
    });
}