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
    const favoriteBtn = document.getElementById('favoriteBtn');

    let currentMovieData = null;
    let currentEpisodeIndex = 0; // Lưu vết tập đang chiếu

    try {
        // 2. Gọi API lấy dữ liệu
        const response = await window.API.getMovieDetails(movieId);
        currentMovieData = response.data;

        // 3. Đổ dữ liệu chữ lên giao diện
        movieTitle.textContent = currentMovieData.title;
        movieMeta.innerHTML = `
            <span>📂 <b class="text-light">${currentMovieData.category}</b></span> | 
            <span>📅 <b class="text-light">${currentMovieData.year || 'N/A'}</b></span> | 
            <span>🎬 <b class="text-light">${currentMovieData.type}</b></span> | 
            <span>👁️ <b class="text-light">${currentMovieData.views || 0} lượt xem</b></span>
        `;
        movieDesc.textContent = currentMovieData.description;

        // 4. Render danh sách tập phim
        if (currentMovieData.episodes && currentMovieData.episodes.length > 0) {
            renderEpisodes(currentMovieData.episodes);
            // Tự động phát tập đầu tiên - nhưng xử lý autoplay error
            try {
                 playEpisode(0);
             } catch (err) {
                 console.warn('⚠️ Autoplay bị chặn (user interaction required):', err);
                 // Người dùng có thể click play button để bắt đầu video
             }
        } else {
            episodesList.innerHTML = '<p class="text-muted">Phim này chưa cập nhật tập nào.</p>';
        }

        // 5. Load trạng thái yêu thích
        loadFavoriteStatus();

    } catch (error) {
        console.error('Lỗi khi tải phim:', error);
        movieTitle.textContent = 'Lỗi tải thông tin phim';
        movieTitle.classList.add('text-secondary');
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
        
        // Thử phát video - nhưng catch error nếu user chưa interact với page
        const playPromise = moviePlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('⚠️ Play bị chặn:', error);
                // Không cần handle - video player có nút play manual
            });
        }

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

    // --- FAVORITE HANDLING ---
    async function toggleFavorite() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Chưa đăng nhập, showToast available:', typeof window.showToast);
            window.showToast('Vui lòng đăng nhập để thêm phim vào yêu thích', 'warning', 2500);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        try {
            console.log('🔄 Toggle favorite cho:', movieId);
            // Dùng endpoint /toggle/:movieId để tự động thêm/xóa
            const response = await fetch(`http://localhost:5000/api/favorites/toggle/${movieId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('📡 Response:', data);

            if (response.ok && data.data) {
                if (data.data.isFavorite) {
                    favoriteBtn.textContent = '❤️';
                    favoriteBtn.classList.add('favorited');
                    window.showToast('Đã thêm vào danh sách yêu thích ❤️', 'success');
                    console.log('✅ Thêm vào yêu thích thành công');
                } else {
                    favoriteBtn.textContent = '🤍';
                    favoriteBtn.classList.remove('favorited');
                    window.showToast('Đã bỏ khỏi danh sách yêu thích', 'info');
                    console.log('✅ Bỏ yêu thích thành công');
                }
            } else {
                console.error('❌ Response không thành công:', data);
                window.showToast('Lỗi: ' + (data.message || 'Không thể cập nhật yêu thích'), 'error');
            }
        } catch (error) {
            console.error('❌ Lỗi khi toggle favorite:', error);
            window.showToast('Không thể cập nhật yêu thích: ' + error.message, 'error');
        }
    }

    async function loadFavoriteStatus() {
        const token = localStorage.getItem('token');
        if (!token) {
            favoriteBtn.disabled = false;
            return;
        }

        try {
            console.log('🔍 Kiểm tra trạng thái yêu thích cho:', movieId);
            // Dùng endpoint /check/:movieId để kiểm tra trạng thái
            const response = await fetch(`http://localhost:5000/api/favorites/check/${movieId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('❌ Lỗi khi check favorite:', response.status);
                return;
            }

            const data = await response.json();
            console.log('✅ Check favorite response:', data);
            if (data.data && typeof data.data.isFavorite === 'boolean') {
                if (data.data.isFavorite) {
                    favoriteBtn.textContent = '❤️';
                    favoriteBtn.classList.add('favorited');
                    console.log('✅ Phim đã được yêu thích');
                } else {
                    console.log('ℹ️ Phim chưa được yêu thích');
                }
            }
        } catch (error) {
            console.error('❌ Lỗi khi load favorite status:', error);
        }
    }

    // Attach click handler cho nút yêu thích
    favoriteBtn.addEventListener('click', toggleFavorite);

    // 6. Khởi tạo module Comments & Ratings
    if (typeof window.initComments === 'function') {
        await window.initComments(movieId);
        console.log('✅ Đã khởi tạo module Comments & Ratings');
    } else {
        console.warn('⚠️ Module comments.js chưa được load');
    }
});