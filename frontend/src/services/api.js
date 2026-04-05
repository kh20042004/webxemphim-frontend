/* ============================================
   API SERVICE - Base Configuration
   ============================================ */

// URL cơ bản cho API Backend (cổng 5000)
// Frontend chạy trên cổng 8000, Backend chạy trên cổng 5000
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// HELPER FUNCTION: Make API Requests
// ============================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...options.headers };

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Include token if available
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle 401 Unauthorized (Token expired)
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
            throw new Error('Session expired. Please login again.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

// POST /api/auth/register
async function registerAPI(userData) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

// POST /api/auth/login
async function loginAPI(credentials) {
    return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

// POST /api/auth/logout
async function logoutAPI() {
    return apiRequest('/auth/logout', {
        method: 'POST',
    });
}

// GET /api/auth/me
async function getCurrentUserAPI() {
    return apiRequest('/auth/me');
}

// ============================================
// USER ENDPOINTS
// ============================================

// GET /api/user/profile
async function getUserProfileAPI() {
    return apiRequest('/user/profile');
}

// PUT /api/user/profile
async function updateProfileAPI(userData) {
    return apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
}

// PUT /api/user/settings
async function updateSettingsAPI(preferences) {
    return apiRequest('/user/settings', {
        method: 'PUT',
        body: JSON.stringify({ preferences }),
    });
}

// POST /api/user/avatar
async function uploadAvatarAPI(formData) {
    return apiRequest('/user/avatar', {
        method: 'POST',
        body: formData,
    });
}

// PUT /api/user/password
async function changePasswordAPI(passwordData) {
    return apiRequest('/user/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
    });
}

// ============================================
// MOVIE ENDPOINTS
// ============================================

// GET /api/movies/trending
async function getTrendingMoviesAPI() {
    return apiRequest('/movies/trending');
}

// GET /api/movies/new
async function getNewMoviesAPI() {
    return apiRequest('/movies/new');
}

// GET /api/movies/:id
async function getMovieDetailsAPI(movieId) {
    return apiRequest(`/movies/${movieId}`);
}

// GET /api/movies (with filters)
async function getMoviesAPI(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/movies?${queryString}`);
}

// GET /api/search
async function searchMoviesAPI(keyword, limit = 10) {
    return apiRequest(`/search?q=${encodeURIComponent(keyword)}&limit=${limit}`);
}

// ============================================
// CATEGORY ENDPOINTS
// ============================================

// GET /api/categories
async function getCategoriesAPI() {
    return apiRequest('/categories');
}

// ============================================
// COMMENT ENDPOINTS
// ============================================

// GET /api/comments/:movieId
async function getCommentsAPI(movieId) {
    return apiRequest(`/comments?movieId=${movieId}`);
}

// POST /api/comments
async function postCommentAPI(commentData) {
    return apiRequest('/comments', {
        method: 'POST',
        body: JSON.stringify(commentData),
    });
}

// DELETE /api/comments/:id
async function deleteCommentAPI(commentId) {
    return apiRequest(`/comments/${commentId}`, {
        method: 'DELETE',
    });
}

// ============================================
// RATING ENDPOINTS
// ============================================

// POST /api/ratings
async function rateMovieAPI(ratingData) {
    return apiRequest('/ratings', {
        method: 'POST',
        body: JSON.stringify(ratingData),
    });
}

// GET /api/ratings/:movieId - Lấy thống kê đánh giá của phim
async function getRatingStatsAPI(movieId) {
    return apiRequest(`/ratings/${movieId}`);
}

// ============================================
// HISTORY ENDPOINTS
// ============================================

// GET /api/history
async function getWatchHistoryAPI() {
    return apiRequest('/history');
}

// POST /api/history
async function saveWatchHistoryAPI(historyData) {
    return apiRequest('/history', {
        method: 'POST',
        body: JSON.stringify(historyData),
    });
}

// ============================================
// SUBSCRIPTION ENDPOINTS
// ============================================

// POST /api/user/subscribe
async function subscribeAPI(subscriptionData) {
    return apiRequest('/user/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscriptionData),
    });
}

// GET /api/favorites - Lấy danh sách phim yêu thích của user
async function getFavoritesAPI() {
    return apiRequest('/favorites');
}

// POST /api/favorites/:movieId - Thêm phim vào yêu thích
async function addFavoriteAPI(movieId) {
    return apiRequest(`/favorites/${movieId}`, {
        method: 'POST',
    });
}

// DELETE /api/favorites/:movieId - Xóa phim khỏi yêu thích
async function removeFavoriteAPI(movieId) {
    return apiRequest(`/favorites/${movieId}`, {
        method: 'DELETE',
    });
}

// POST /api/favorites/toggle/:movieId - Toggle yêu thích (thêm nếu chưa có, xóa nếu đã có)
async function toggleFavoriteAPI(movieId) {
    return apiRequest(`/favorites/toggle/${movieId}`, {
        method: 'POST',
    });
}

// GET /api/favorites/check/:movieId - Kiểm tra phim có trong yêu thích không
async function checkFavoriteAPI(movieId) {
    return apiRequest(`/favorites/check/${movieId}`);
}

// ============================================
// ADMIN ENDPOINTS
// ============================================

// POST /api/admin/movies (Create)
async function createMovieAPI(movieData) {
    return apiRequest('/admin/movies', {
        method: 'POST',
        body: JSON.stringify(movieData),
    });
}

// PUT /api/admin/movies/:id (Update)
async function updateMovieAPI(movieId, movieData) {
    return apiRequest(`/admin/movies/${movieId}`, {
        method: 'PUT',
        body: JSON.stringify(movieData),
    });
}

// DELETE /api/admin/movies/:id
async function deleteMovieAPI(movieId) {
    return apiRequest(`/admin/movies/${movieId}`, {
        method: 'DELETE',
    });
}

// POST /api/upload
async function uploadFileAPI(formData) {
    const url = `${API_BASE_URL}/upload`;
    const headers = {};

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData, // Don't set Content-Type for FormData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}

// ============================================
// SPORTS ENDPOINTS
// ============================================

// GET /api/sports/leagues
async function getLeaguesAPI() {
    return apiRequest('/sports/leagues');
}

// GET /api/sports/matches/upcoming
async function getUpcomingMatchesAPI() {
    return apiRequest('/sports/matches/upcoming');
}

// GET /api/sports/matches/live
async function getLiveMatchesAPI() {
    return apiRequest('/sports/matches/live');
}

// GET /api/sports/events/live
async function getLiveEventsAPI() {
    return apiRequest('/sports/events/live');
}

// GET /api/sports/highlights
async function getHighlightsAPI() {
    return apiRequest('/sports/highlights');
}

// GET /api/sports/highlights/trending
async function getTrendingHighlightsAPI() {
    return apiRequest('/sports/highlights/trending');
}

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

// You can export individually or create an object
// Option 1: Direct exports (already done with 'async function' above)

// Option 2: Create API object for organized exports
const API = {
    // Auth
    register: registerAPI,
    login: loginAPI,
    logout: logoutAPI,
    getCurrentUser: getCurrentUserAPI,

    // User
    getUserProfile: getUserProfileAPI,
    updateProfile: updateProfileAPI,
    updateSettings: updateSettingsAPI,
    uploadAvatar: uploadAvatarAPI,
    changePassword: changePasswordAPI,

    // Movies
    getTrendingMovies: getTrendingMoviesAPI,
    getNewMovies: getNewMoviesAPI,
    getMovieDetails: getMovieDetailsAPI,
    getMovies: getMoviesAPI,
    searchMovies: searchMoviesAPI,

    // Categories
    getCategories: getCategoriesAPI,

    // Comments
    getComments: getCommentsAPI,
    postComment: postCommentAPI,
    deleteComment: deleteCommentAPI,

    // Ratings
    rateMovie: rateMovieAPI,
    getRatingStats: getRatingStatsAPI,

    // History
    getWatchHistory: getWatchHistoryAPI,
    saveWatchHistory: saveWatchHistoryAPI,

    // Favorites - Phim yêu thích
    getFavorites: getFavoritesAPI,          // Lấy danh sách
    addFavorite: addFavoriteAPI,            // Thêm phim vào yêu thích
    removeFavorite: removeFavoriteAPI,      // Xóa phim khỏi yêu thích
    toggleFavorite: toggleFavoriteAPI,      // Toggle (thêm/xóa tự động)
    checkFavorite: checkFavoriteAPI,        // Kiểm tra trạng thái tim ❤️/🤍

    // Subscription
    subscribe: subscribeAPI,

    // Admin
    createMovie: createMovieAPI,
    updateMovie: updateMovieAPI,
    deleteMovie: deleteMovieAPI,
    uploadFile: uploadFileAPI,

    // Sports - Thể thao
    getLeagues: getLeaguesAPI,
    getUpcomingMatches: getUpcomingMatchesAPI,
    getLiveMatches: getLiveMatchesAPI,
    getLiveEvents: getLiveEventsAPI,
    getHighlights: getHighlightsAPI,
    getTrendingHighlights: getTrendingHighlightsAPI,
};

// Make API available globally
window.API = API;

