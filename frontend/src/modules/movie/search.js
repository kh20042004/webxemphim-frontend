document.addEventListener('DOMContentLoaded', async() => {
    const resultsContainer = document.getElementById('search-results');
    const searchInfo = document.getElementById('search-info');

    // 1. Lấy từ khóa 'q' từ URL (?q=Lật Mặt)
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('q');

    if (!keyword) {
        searchInfo.innerText = "Vui lòng nhập từ khóa để tìm kiếm.";
        resultsContainer.innerHTML = "";
        return;
    }

    searchInfo.innerText = `Kết quả cho: "${keyword}"`;

    try {
        // 2. Gọi API Backend (Nhớ đổi port 5000 nếu bạn dùng port khác)
        // Lưu ý: Nếu Backend dùng tham số 'search' thì đổi q=${keyword} thành search=${keyword}
        const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(keyword)}`);
        const data = await response.json();

        // Xóa spinner loading
        resultsContainer.innerHTML = "";

        // 3. Kiểm tra dữ liệu và Render
        if (!data || data.length === 0) {
            resultsContainer.innerHTML = `<div class="text-center w-100">
                <p class="fs-5 text-secondary">Rất tiếc, không tìm thấy phim nào khớp với từ khóa này.</p>
                <a href="movies.html" class="btn btn-danger">Quay lại trang phim</a>
            </div>`;
            return;
        }

        data.forEach(movie => {
            const cardHtml = `
                <div class="col">
                    <div class="card h-100 movie-card text-white">
                        <img src="${movie.poster || 'https://picsum.photos/seed/movie/300/450'}" class="card-img-top movie-poster" alt="${movie.title}">
                        <div class="card-body">
                            <h6 class="card-title text-truncate">${movie.title}</h6>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-secondary">${movie.year}</small>
                                <span class="badge bg-danger">${movie.type || 'Phim'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        resultsContainer.innerHTML = `<p class="text-danger text-center w-100">Không thể kết nối với máy chủ. Vui lòng kiểm tra Backend!</p>`;
    }
});