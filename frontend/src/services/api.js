/* ============================================
   API SERVICE - Base Configuration
   ============================================ */

// Use hardcoded URL for vanilla JS browser environment
// Backend server runs on port 3000, frontend on port 8000
const API_BASE_URL = 'http://localhost:3000/api';

// ============================================
// HELPER FUNCTION: Make API Requests
// ============================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

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

// POST /api/subscribe
async function subscribeAPI(subscriptionData) {
    return apiRequest('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscriptionData),
    });
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

// GET /api/sports/leagues/:id
async function getLeagueByIdAPI(leagueId) {
    return apiRequest(`/sports/leagues/${leagueId}`);
}

// GET /api/sports/matches
async function getMatchesAPI() {
    return apiRequest('/sports/matches');
}

// GET /api/sports/matches/upcoming
async function getUpcomingMatchesAPI() {
    return apiRequest('/sports/matches/upcoming');
}

// GET /api/sports/matches/live
async function getLiveMatchesAPI() {
    return apiRequest('/sports/matches/live');
}

// GET /api/sports/matches/:id
async function getMatchByIdAPI(matchId) {
    return apiRequest(`/sports/matches/${matchId}`);
}

// GET /api/sports/events
async function getEventsAPI() {
    return apiRequest('/sports/events');
}

// GET /api/sports/events/live
async function getLiveEventsAPI() {
    return apiRequest('/sports/events/live');
}

// GET /api/sports/events/:id
async function getEventByIdAPI(eventId) {
    return apiRequest(`/sports/events/${eventId}`);
}

// GET /api/sports/highlights
async function getHighlightsAPI() {
    return apiRequest('/sports/highlights');
}

// GET /api/sports/highlights/trending
async function getTrendingHighlightsAPI() {
    return apiRequest('/sports/highlights/trending');
}

// GET /api/sports/highlights/:id
async function getHighlightByIdAPI(highlightId) {
    return apiRequest(`/sports/highlights/${highlightId}`);
}

// POST /api/sports/highlights/:id/like (Protected)
async function likeHighlightAPI(highlightId) {
    return apiRequest(`/sports/highlights/${highlightId}/like`, {
        method: 'POST',
    });
}

// POST /api/sports/highlights/:id/unlike (Protected)
async function unlikeHighlightAPI(highlightId) {
    return apiRequest(`/sports/highlights/${highlightId}/unlike`, {
        method: 'POST',
    });
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

    // History
    getWatchHistory: getWatchHistoryAPI,
    saveWatchHistory: saveWatchHistoryAPI,

    // Subscription
    subscribe: subscribeAPI,

    // Admin
    createMovie: createMovieAPI,
    updateMovie: updateMovieAPI,
    deleteMovie: deleteMovieAPI,
    uploadFile: uploadFileAPI,

    // Sports
    getLeagues: getLeaguesAPI,
    getLeagueById: getLeagueByIdAPI,
    getMatches: getMatchesAPI,
    getUpcomingMatches: getUpcomingMatchesAPI,
    getLiveMatches: getLiveMatchesAPI,
    getMatchById: getMatchByIdAPI,
    getEvents: getEventsAPI,
    getLiveEvents: getLiveEventsAPI,
    getEventById: getEventByIdAPI,
    getHighlights: getHighlightsAPI,
    getTrendingHighlights: getTrendingHighlightsAPI,
    getHighlightById: getHighlightByIdAPI,
    likeHighlight: likeHighlightAPI,
    unlikeHighlight: unlikeHighlightAPI,
};

// Make API available globally
window.API = API;
