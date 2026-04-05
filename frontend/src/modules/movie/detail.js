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

    // Lưu progress xem phim lên server
    async function saveWatchProgress(currentTimeSeconds) {
        if (!currentMovieData || !currentMovieData._id) return;
        
        const historyData = {
            movieId: currentMovieData._id,
            timestamp: Math.floor(currentTimeSeconds) // Lưu theo giây
        };
        
        try {
            if (typeof window.API?.saveWatchHistory === 'function') {
                await window.API.saveWatchHistory(historyData);
                console.log(`✅ Đã lưu progress: ${currentTimeSeconds}s`);
            }
        } catch (error) {
            console.warn('⚠️ Lỗi lưu progress:', error);
        }
    }

    // Xử lý khi video kết thúc
    function onVideoEnded() {
        console.log('🎬 Video đã kết thúc');
        
        // Save final progress
        if (currentMovieData) {
            const videoElement = document.getElementById('moviePlayer');
            const finalTime = Math.floor(videoElement.duration || 0);
            saveWatchProgress(finalTime);
        }
        
        // Auto next episode nếu có
        if (currentMovieData && currentMovieData.episodes) {
            const nextIndex = currentEpisodeIndex + 1;
            if (nextIndex < currentMovieData.episodes.length) {
                console.log(`🎬 Tự động chuyển tập ${nextIndex + 1}`);
                setTimeout(() => playEpisode(nextIndex), 2000);
            }
        }
    }

    async function trackWatchHistory(movieData) {
        if (!movieData || !movieData._id) return;

        const historyEntry = {
            movieId: movieData._id,
            movieTitle: movieData.title || '',
            moviePoster: movieData.poster || movieData.thumbnail || '',
            movieCategory: movieData.category || '',
            movieType: movieData.type || '',
            movieYear: movieData.year || '',
            timestamp: 0,
            episodeIndex: currentEpisodeIndex,
            updatedAt: new Date().toISOString(),
        };

        try {
            if (typeof window.API?.saveWatchHistory === 'function') {
                await window.API.saveWatchHistory(historyEntry);
            }
        } catch (error) {
            console.warn('⚠️ Không thể lưu lịch sử lên API, sẽ dùng cache cục bộ:', error);
        }

        try {
            const cachedHistory = JSON.parse(localStorage.getItem('watchHistoryCache') || '[]');
            const nextHistory = cachedHistory.filter((item) => item.movieId !== movieData._id);
            nextHistory.unshift(historyEntry);
            localStorage.setItem('watchHistoryCache', JSON.stringify(nextHistory.slice(0, 50)));
        } catch (error) {
            console.warn('⚠️ Không thể lưu cache lịch sử cục bộ:', error);
        }
    }

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

        // 6. Lưu lịch sử xem phim để trang history.html hiển thị được dữ liệu
        await trackWatchHistory(currentMovieData);

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
        const videoUrl = episode.videoUrl;

        console.log('🎬 Phát video:', videoUrl);

        // Detect loại video để chọn player phù hợp
        if (isYouTubeUrl(videoUrl)) {
            // YouTube - dùng iframe
            playYouTubeVideo(videoUrl);
        } else {
            // Direct video file - dùng HTML5 video
            playDirectVideo(videoUrl);
        }

        // Cập nhật CSS cho nút (Tô màu nút đang chiếu)
        const allBtns = document.querySelectorAll('.episode-btn');
        allBtns.forEach(btn => btn.classList.remove('active'));
        if(allBtns[index]) {
            allBtns[index].classList.add('active');
        }
    }

    // Kiểm tra có phải YouTube URL không
    function isYouTubeUrl(url) {
        return url.includes('youtube.com') || url.includes('youtu.be');
    }

    // Phát YouTube video qua iframe
    function playYouTubeVideo(url) {
        const moviePlayer = document.getElementById('moviePlayer');
        const youtubePlayer = document.getElementById('youtubePlayer');
        
        // Ẩn HTML5 player, hiện YouTube iframe
        moviePlayer.style.display = 'none';
        youtubePlayer.style.display = 'block';
        
        // Convert YouTube watch URL sang embed URL
        const embedUrl = convertToYouTubeEmbed(url);
        youtubePlayer.src = embedUrl;
        
        // Setup tracking cho YouTube (periodic save vì iframe không thể track progress)
        setupYouTubeTracking();
        
        console.log('📺 YouTube embed URL:', embedUrl);
    }

    // Setup tracking cho YouTube iframe (periodic save)
    function setupYouTubeTracking() {
        // Clear previous interval
        if (window.youtubeTrackingInterval) {
            clearInterval(window.youtubeTrackingInterval);
        }
        
        // Save progress mỗi 30s khi đang xem YouTube
        let progressSeconds = 0;
        window.youtubeTrackingInterval = setInterval(() => {
            if (document.getElementById('youtubePlayer').style.display !== 'none') {
                progressSeconds += 30; // Tăng 30s mỗi interval
                saveWatchProgress(progressSeconds);
                console.log(`💾 Lưu progress YouTube: ${progressSeconds}s (ước tính)`);
            }
        }, 30000); // Mỗi 30s
        
        console.log('✅ Đã setup tracking cho YouTube video');
    }

    // Phát direct video qua HTML5
    function playDirectVideo(url) {
        const moviePlayer = document.getElementById('moviePlayer');
        const youtubePlayer = document.getElementById('youtubePlayer');
        
        // Ẩn YouTube iframe, hiện HTML5 player
        youtubePlayer.style.display = 'none';
        moviePlayer.style.display = 'block';
        
        // Set video source
        moviePlayer.src = url;
        
        // Thêm event listeners cho HTML5 video
        setupHTML5VideoTracking(moviePlayer);
        
        // Thử phát video - nhưng catch error nếu user chưa interact với page
        const playPromise = moviePlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('⚠️ Play bị chặn:', error);
                // Không cần handle - video player có nút play manual
            });
        }
    }

    // Setup tracking cho HTML5 video
    function setupHTML5VideoTracking(videoElement) {
        // Xóa listeners cũ nếu có
        videoElement.removeEventListener('timeupdate', saveProgressHTML5);
        videoElement.removeEventListener('ended', onVideoEnded);
        
        // Thêm listeners mới
        videoElement.addEventListener('timeupdate', saveProgressHTML5);
        videoElement.addEventListener('ended', onVideoEnded);
        
        console.log('✅ Đã setup tracking cho HTML5 video');
    }

    // Lưu progress cho HTML5 video
    function saveProgressHTML5() {
        if (!currentMovieData) return;
        
        const videoElement = document.getElementById('moviePlayer');
        const currentTime = Math.floor(videoElement.currentTime || 0);
        const duration = Math.floor(videoElement.duration || 0);
        
        // Chỉ save khi video đã load và có progress
        if (currentTime > 0 && duration > 30) {
            saveWatchProgress(currentTime);
            console.log(`💾 Lưu progress HTML5: ${currentTime}/${duration}s`);
        }
    }

    // Convert YouTube watch URL sang embed URL
    function convertToYouTubeEmbed(url) {
        // Regex để extract video ID từ nhiều format YouTube URLs
        const regexPatterns = [
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
        ];
        
        for (const regex of regexPatterns) {
            const match = url.match(regex);
            if (match && match[1]) {
                return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
            }
        }
        
        // Nếu không match, trả về URL gốc (có thể đã là embed URL)
        return url;
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

    // Cleanup khi rời khỏi trang
    window.addEventListener('beforeunload', () => {
        // Clear YouTube tracking interval
        if (window.youtubeTrackingInterval) {
            clearInterval(window.youtubeTrackingInterval);
        }
        
        // Save final progress nếu đang xem
        if (currentMovieData) {
            const videoElement = document.getElementById('moviePlayer');
            if (videoElement && videoElement.currentTime > 0) {
                // Sync call để đảm bảo save được trước khi trang đóng
                navigator.sendBeacon('/api/history', JSON.stringify({
                    movieId: currentMovieData._id,
                    timestamp: Math.floor(videoElement.currentTime)
                }));
            }
        }
        
        console.log('🧹 Cleanup completed');
    });
});