const API_BASE = "http://localhost:5000/api";
let currentPage = 1;

// 1. Hàm gọi API và hiển thị phim
async function fetchMovies() {
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;
    const year = document.getElementById('filter-year').value;

    try {
        // Gửi các tham số lọc lên Backend
        const url = `${API_BASE}/movies?type=${type}&category=${category}&year=${year}&page=${currentPage}&limit=12`;
        const response = await fetch(url);
        const data = await response.json();

        renderMovies(data.movies); // Giả sử Backend trả về object { movies: [...] }
        document.getElementById('current-page').innerText = `Trang ${currentPage}`;
    } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
    }
}

// 2. Hàm vẽ HTML cho danh sách phim
function renderMovies(movies) {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = ''; // Xóa trắng danh sách cũ

    if (!movies || movies.length === 0) {
        grid.innerHTML = '<p class="text-center text-white w-100">Không tìm thấy phim nào phù hợp.</p>';
        return;
    }

    movies.forEach(movie => {
        grid.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="card bg-dark text-white h-100 border-secondary">
                    <img src="${movie.poster}" class="card-img" style="height: 300px; object-fit: cover;">
                    <div class="card-body">
                        <h6 class="card-title text-truncate">${movie.title}</h6>
                        <p class="small text-muted">${movie.year} | ${movie.type}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// 3. Lắng nghe sự kiện thay đổi bộ lọc
document.getElementById('filter-type').addEventListener('change', () => { currentPage = 1;
    fetchMovies(); });
document.getElementById('filter-category').addEventListener('change', () => { currentPage = 1;
    fetchMovies(); });
document.getElementById('filter-year').addEventListener('input', () => { currentPage = 1;
    fetchMovies(); });

// 4. Xử lý phân trang
document.getElementById('prev-page').onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        fetchMovies();
    }
};
document.getElementById('next-page').onclick = () => {
    currentPage++;
    fetchMovies();
};

// 5. Chạy lần đầu khi load trang
fetchMovies();