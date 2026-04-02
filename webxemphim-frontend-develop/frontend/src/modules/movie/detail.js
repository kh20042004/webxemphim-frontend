document.addEventListener('DOMContentLoaded', async () => {
    // 1. Lấy ID phim từ URL (VD: detail.html?id=65f1a...)
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        alert('Không tìm thấy mã phim!');
        window.location.href = 'index.html';
        return;
    }

    // Các thẻ HTML cần thao tác
    const movieTitle = document.getElementById('movieTitle');
    const movieMeta = document.getElementById('movieMeta');
    const movieDesc = document.getElementById('movieDesc');
    const episodesList = document.getElementById('episodesList');
    const moviePlayer = document.getElementById('moviePlayer');

    let currentMovieData = null;
    let currentEpisodeIndex = 0; // Lưu vết tập đang chiếu

    try {
        // 2. Gọi API lấy dữ liệu (Dùng hàm trong api.js của team)
        const response = await window.API.getMovieDetails(movieId);
        currentMovieData = response.data;

        // 3. Đổ dữ liệu chữ lên giao diện
        movieTitle.textContent = currentMovieData.title;
        movieMeta.innerHTML = `
            <span>Định dạng: <b class="text-light">${currentMovieData.type}</b></span> | 
            <span>Thể loại: <b class="text-light">${currentMovieData.category}</b></span> | 
            <span>👁️ ${currentMovieData.views} lượt xem</span>
        `;
        movieDesc.textContent = currentMovieData.description;

        // 4. Render danh sách tập phim
        if (currentMovieData.episodes && currentMovieData.episodes.length > 0) {
            renderEpisodes(currentMovieData.episodes);
            // Tự động phát tập đầu tiên
            playEpisode(0);
        } else {
            episodesList.innerHTML = '<p class="text-muted">Phim này chưa cập nhật tập nào.</p>';
        }

    } catch (error) {
        console.error('Lỗi khi tải phim:', error);
        movieTitle.textContent = 'Lỗi tải thông tin phim';
        movieTitle.classList.add('text-secondary'); // Màu đỏ lỗi
    }

    // --- CÁC HÀM XỬ LÝ PHỤ TRỢ ---

    // Render các nút tập phim
    function renderEpisodes(episodes) {
        episodesList.innerHTML = ''; // Xóa rỗng
        episodes.forEach((ep, index) => {
            const btn = document.createElement('button');
            btn.className = 'episode-btn';
            btn.textContent = ep.name;
            btn.onclick = () => playEpisode(index);
            episodesList.appendChild(btn);
        });
    }

    // Hàm phát video theo vị trí tập
    function playEpisode(index) {
        if (!currentMovieData || !currentMovieData.episodes[index]) return;
        
        currentEpisodeIndex = index;
        const episode = currentMovieData.episodes[index];

        // Đổi link video
        moviePlayer.src = episode.videoUrl;
        moviePlayer.play();

        // Cập nhật CSS cho nút (Tô màu nút đang chiếu)
        const allBtns = document.querySelectorAll('.episode-btn');
        allBtns.forEach(btn => btn.classList.remove('active'));
        if(allBtns[index]) {
            allBtns[index].classList.add('active');
        }
    }

    // 5. Tính năng xịn: Tự động chuyển tập tiếp theo khi xem hết video
    moviePlayer.addEventListener('ended', () => {
        const nextIndex = currentEpisodeIndex + 1;
        // Nếu còn tập tiếp theo thì tự động phát
        if (currentMovieData.episodes && currentMovieData.episodes[nextIndex]) {
            playEpisode(nextIndex);
        }
    });
});