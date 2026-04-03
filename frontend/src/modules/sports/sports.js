/* ============================================
   SPORTS PAGE LOGIC - WITH API INTEGRATION
   ============================================ */

// ============================================
// DATA STORAGE
// ============================================

let sportsData = {
    leagues: [],
    matches: { upcoming: [], live: [], all: [] },
    events: { live: [], all: [] },
    highlights: { trending: [], all: [] }
};

// ============================================
// LOAD DATA FROM API
// ============================================

async function loadSportsData() {
    console.log('📡 Loading sports data from API...');
    
    try {
        const [leaguesRes, upcomingRes, liveRes, liveEventsRes, highlightsRes, trendingRes] = await Promise.all([
            API.getLeagues().catch(e => { console.warn('Leagues error:', e); return { data: [] }; }),
            API.getUpcomingMatches().catch(e => { console.warn('Upcoming error:', e); return { data: [] }; }),
            API.getLiveMatches().catch(e => { console.warn('Live error:', e); return { data: [] }; }),
            API.getLiveEvents().catch(e => { console.warn('Events error:', e); return { data: [] }; }),
            API.getHighlights().catch(e => { console.warn('Highlights error:', e); return { data: [] }; }),
            API.getTrendingHighlights().catch(e => { console.warn('Trending error:', e); return { data: [] }; })
        ]);

        sportsData.leagues = leaguesRes.data || [];
        sportsData.matches.upcoming = upcomingRes.data || [];
        sportsData.matches.live = liveRes.data || [];
        sportsData.events.live = liveEventsRes.data || [];
        sportsData.highlights.all = highlightsRes.data || [];
        sportsData.highlights.trending = trendingRes.data || [];

        console.log('✅ Sports data loaded:', sportsData);
        return true;
    } catch (error) {
        console.error('❌ Error loading sports data:', error);
        return false;
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderUpcomingMatches() {
    const container = document.getElementById('upcomingMatchesContainer');
    if (!container) return;

    if (sportsData.matches.upcoming.length === 0) {
        container.innerHTML = '<p class="no-data">Không có trận đấu sắp tới</p>';
        return;
    }

    const matchesHTML = sportsData.matches.upcoming.slice(0, 10).map(match => `
        <div class="match-card" data-match-id="${match._id}">
            <div class="match-header">
                <span class="match-league">GIẢI ĐẤU</span>
                <span class="match-time">${match.scheduleTime || '20:12'}</span>
            </div>
            <div class="match-body">
                <div class="team-vs">
                    <div class="team">
                        <img src="${match.homeTeamLogo || 'https://dummyimage.com/60x60/cccccc/cccccc?text=Team'}" alt="Team" onerror="this.src='https://dummyimage.com/60x60/cccccc/cccccc?text=Team'">
                        <span class="team-name">${match.homeTeamName || 'Team'}</span>
                    </div>
                    <div class="vs-text">VS</div>
                    <div class="team">
                        <img src="${match.awayTeamLogo || 'https://dummyimage.com/60x60/cccccc/cccccc?text=Team'}" alt="Team" onerror="this.src='https://dummyimage.com/60x60/cccccc/cccccc?text=Team'">
                        <span class="team-name">${match.awayTeamName || 'Team'}</span>
                    </div>
                </div>
            </div>
            <button class="btn btn-watch-match">Xem Trực Tiếp</button>
        </div>
    `).join('');

    container.innerHTML = matchesHTML;
    attachMatchCardListeners();
}

function renderLiveMatches() {
    const container = document.getElementById('liveMatchesContainer');
    if (!container) return;

    if (sportsData.matches.live.length === 0) {
        container.innerHTML = '<p class="no-data">Không có trận đấu trực tiếp</p>';
        return;
    }

    const matchesHTML = sportsData.matches.live.slice(0, 10).map(match => `
        <div class="match-card live" data-match-id="${match._id}">
            <div class="match-header">
                <span class="match-league">GIẢI ĐẤU</span>
                <span class="match-status live-badge">🔴 TRỰC TIẾP</span>
            </div>
            <div class="match-body">
                <div class="team-vs">
                    <div class="team">
                        <img src="${match.homeTeamLogo || 'https://dummyimage.com/60x60/cccccc/cccccc?text=Team'}" alt="Team" onerror="this.src='https://dummyimage.com/60x60/cccccc/cccccc?text=Team'">
                        <span class="team-name">${match.homeTeamName || 'Team'}</span>
                        ${match.homeScore !== null ? `<span class="score">${match.homeScore}</span>` : ''}
                    </div>
                    <div class="vs-text">VS</div>
                    <div class="team">
                        <img src="${match.awayTeamLogo || 'https://dummyimage.com/60x60/cccccc/cccccc?text=Team'}" alt="Team" onerror="this.src='https://dummyimage.com/60x60/cccccc/cccccc?text=Team'">
                        <span class="team-name">${match.awayTeamName || 'Team'}</span>
                        ${match.awayScore !== null ? `<span class="score">${match.awayScore}</span>` : ''}
                    </div>
                </div>
                <div class="live-viewers">👁️ ${formatViewers(match.liveViewers)} viewers</div>
            </div>
            <button class="btn btn-watch-match">Xem Ngay</button>
        </div>
    `).join('');

    container.innerHTML = matchesHTML;
    attachMatchCardListeners();
}

function renderLeagues() {
    const container = document.getElementById('leaguesContainer');
    if (!container) return;

    if (sportsData.leagues.length === 0) {
        container.innerHTML = '<p class="no-data">Không có giải đấu</p>';
        return;
    }

    const leaguesHTML = sportsData.leagues.slice(0, 10).map(league => {
        // Assign league logos từ Wikimedia Commons
        let leagueLogo = 'https://dummyimage.com/150x150/cccccc/cccccc?text=' + league.code;
        if (league.code === 'PL') leagueLogo = 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/f2/Premier_League_Logo.svg/960px-Premier_League_Logo.svg.png';
        if (league.code === 'LL') leagueLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/LaLiga_EA_Sports_2023_Vertical_Logo.svg/500px-LaLiga_EA_Sports_2023_Vertical_Logo.svg.png';
        if (league.code === 'SA') leagueLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Serie_A.svg/330px-Serie_A.svg.png';
        if (league.code === 'BL') leagueLogo = 'https://upload.wikimedia.org/wikipedia/vi/f/f9/Bundesliga_logo_%282017%29.png';
        if (league.code === 'L1') leagueLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ligue_1_2024_Logo.png/330px-Ligue_1_2024_Logo.png';

        return `
        <div class="league-card" data-league-id="${league._id}">
            <div class="league-image">
                <img src="${leagueLogo}" alt="${league.name}" onerror="this.src='https://dummyimage.com/150x150/cccccc/cccccc?text=${league.code}'">
            </div>
            <div class="league-header">
                <h3 class="league-name">${league.name}</h3>
                <span class="league-country">${league.country}</span>
            </div>
            <div class="league-stats">
                <div class="stat">
                    <span class="stat-label">Mùa giải</span>
                    <span class="stat-value">${league.season}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Trạng thái</span>
                    <span class="stat-value" style="color: #FF6B35;">${league.status === 'active' ? 'Đang diễn ra' : 'Kết thúc'}</span>
                </div>
            </div>
        </div>
    `;
    }).join('');

    container.innerHTML = leaguesHTML;
    attachLeagueCardListeners();
}

function renderLiveEvents() {
    const container = document.getElementById('liveEventsContainer');
    if (!container) return;

    if (sportsData.events.live.length === 0) {
        container.innerHTML = '<p class="no-data">Không có sự kiện trực tiếp</p>';
        return;
    }

    const eventsHTML = sportsData.events.live.slice(0, 10).map(event => `
        <div class="event-card live-event" data-event-id="${event._id}">
            <div class="event-badge">🔴 LIVE</div>
            <div class="event-header">
                <h3 class="event-title">${event.title}</h3>
            </div>
            <div class="event-info">
                <p class="event-viewers">👁️ ${formatViewers(event.viewers)} đang xem</p>
                <p class="event-status">${event.status === 'live' ? 'Đang phát sóng' : 'Sắp diễn ra'}</p>
            </div>
            <button class="btn btn-watch-match">Xem Ngay</button>
        </div>
    `).join('');

    container.innerHTML = eventsHTML;
    attachEventCardListeners();
}

function renderHighlights() {
    const container = document.getElementById('highlightsContainer');
    if (!container) return;

    const highlights = sportsData.highlights.trending.length > 0 ? sportsData.highlights.trending : sportsData.highlights.all;
    
    if (highlights.length === 0) {
        container.innerHTML = '<p class="no-data">Không có video nổi bật</p>';
        return;
    }

    const highlightsHTML = highlights.slice(0, 10).map((highlight, idx) => `
        <div class="highlight-card" data-highlight-id="${highlight._id}">
            <div class="highlight-thumbnail">
                <img src="https://dummyimage.com/300x200/cccccc/cccccc?text=${highlight.homeTeamName}+vs+${highlight.awayTeamName}" alt="Highlight" onerror="this.src='https://dummyimage.com/300x200/cccccc/cccccc?text=Highlight'">
                <div class="highlight-overlay"><span class="play-icon">▶</span></div>
                <span class="highlight-duration">${formatDuration(highlight.duration)}</span>
                ${highlight.isVip ? '<span class="vip-badge">VIP</span>' : ''}
            </div>
            <div class="highlight-info">
                <h3 class="highlight-title">${highlight.title}</h3>
                <div class="highlight-stats">
                    <span class="views">👁️ ${formatViewers(highlight.viewCount)}</span>
                    <span class="likes">❤️ ${formatViewers(highlight.likes)}</span>
                </div>
            </div>
            <button class="btn btn-play-highlight">Xem Video</button>
        </div>
    `).join('');

    container.innerHTML = highlightsHTML;
    attachHighlightCardListeners();
}

// ============================================
// EVENT LISTENERS
// ============================================

function attachMatchCardListeners() {
    document.querySelectorAll('.match-card').forEach(card => {
        card.addEventListener('click', () => {
            const matchId = card.getAttribute('data-match-id');
            console.log('⚽ Viewing match:', matchId);
        });
    });
}

function attachLeagueCardListeners() {
    document.querySelectorAll('.league-card').forEach(card => {
        card.addEventListener('click', () => {
            const leagueId = card.getAttribute('data-league-id');
            const leagueName = card.querySelector('.league-name')?.textContent || 'Giải Đấu';
            console.log('🏆 Viewing league:', leagueId, leagueName);
            openLeagueModal(leagueId, leagueName);
        });
    });
}

function attachEventCardListeners() {
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.getAttribute('data-event-id');
            console.log('📺 Viewing event:', eventId);
        });
    });
}

function attachHighlightCardListeners() {
    document.querySelectorAll('.highlight-card').forEach(card => {
        card.addEventListener('click', () => {
            const highlightId = card.getAttribute('data-highlight-id');
            console.log('🎬 Playing highlight:', highlightId);
        });
    });
}

// ============================================
// LEAGUE MODAL FUNCTIONALITY
// ============================================

function openLeagueModal(leagueId, leagueName) {
    console.log(`📋 Opening modal for league: ${leagueName}`);
    
    const modal = document.getElementById('leagueModal');
    const modalTitle = document.getElementById('modalLeagueName');
    
    if (!modal) {
        console.error('❌ Modal element not found');
        return;
    }

    modalTitle.textContent = leagueName;
    modal.classList.add('active');

    // Load matches for this league
    loadLeagueMatches(leagueId);
    // Load teams for this league
    loadLeagueTeams(leagueId);

    // Setup tab switching
    setupModalTabs();
}

function closeLeagueModal() {
    console.log('❌ Closing league modal');
    const modal = document.getElementById('leagueModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function loadLeagueMatches(leagueId) {
    const matchesContainer = document.getElementById('leagueMatches');
    if (!matchesContainer) return;

    matchesContainer.innerHTML = '<p class="loading">⏳ Đang tải trận đấu...</p>';

    // Filter matches by league
    const leagueMatches = sportsData.matches.upcoming.filter(m => m.leagueId === leagueId);
    const liveMatches = sportsData.matches.live.filter(m => m.leagueId === leagueId);
    const allMatches = [...liveMatches, ...leagueMatches];

    if (allMatches.length === 0) {
        matchesContainer.innerHTML = '<p class="no-data">Không có trận đấu</p>';
        return;
    }

    const matchesHTML = allMatches.map(match => `
        <div class="modal-match-card">
            <div class="match-info">
                <div class="match-teams">
                    <div class="match-team">
                        <div class="team-logo">
                            <img src="${match.homeTeamLogo || 'https://dummyimage.com/32x32/cccccc/cccccc'}" alt="${match.homeTeamName}" onerror="this.src='https://dummyimage.com/32x32/cccccc/cccccc'">
                        </div>
                        <span class="team-name">${match.homeTeamName}</span>
                    </div>
                    <span class="vs-separator">vs</span>
                    <div class="match-team">
                        <div class="team-logo">
                            <img src="${match.awayTeamLogo || 'https://dummyimage.com/32x32/cccccc/cccccc'}" alt="${match.awayTeamName}" onerror="this.src='https://dummyimage.com/32x32/cccccc/cccccc'">
                        </div>
                        <span class="team-name">${match.awayTeamName}</span>
                    </div>
                </div>
                <div class="match-status">
                    ${match.status === 'live' ? '🔴 LIVE' : (match.scheduleTime || '')}
                </div>
            </div>
            <div class="match-score">
                ${match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : '-'}
            </div>
        </div>
    `).join('');

    matchesContainer.innerHTML = matchesHTML;
}

function loadLeagueTeams(leagueId) {
    const teamsContainer = document.getElementById('leagueTeams');
    if (!teamsContainer) return;

    teamsContainer.innerHTML = '<p class="loading">⏳ Đang tải đội bóng...</p>';

    // Filter teams by league
    const leagueTeams = sportsData.leagues.find(l => l._id === leagueId)?.teams || [];
    
    if (leagueTeams.length === 0) {
        // If no teams array, create mock teams from matches
        teamsContainer.innerHTML = '<p class="no-data">Không có thông tin đội bóng</p>';
        return;
    }

    const teamsHTML = leagueTeams.slice(0, 20).map(team => `
        <div class="modal-team-card">
            <div class="team-logo-large">
                <img src="${team.logo || 'https://dummyimage.com/48x48/cccccc/cccccc'}" alt="${team.name}" onerror="this.src='https://dummyimage.com/48x48/cccccc/cccccc'">
            </div>
            <div class="team-card-name">${team.name}</div>
            <div class="team-card-coach">${team.coach || 'Coach'}</div>
        </div>
    `).join('');

    teamsContainer.innerHTML = teamsHTML || '<p class="no-data">Không có đội bóng</p>';
}

function setupModalTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            // Add active class to clicked tab
            btn.classList.add('active');
            const tabContent = document.getElementById(tabName + 'Tab');
            if (tabContent) {
                tabContent.classList.add('active');
            }

            console.log(`📑 Switched to tab: ${tabName}`);
        });
    });
}

function setupLeagueModalHandlers() {
    console.log('🔧 Setting up league modal handlers...');
    
    const modal = document.getElementById('leagueModal');
    const closeBtn = document.getElementById('modalClose');

    if (!modal || !closeBtn) {
        console.warn('⚠️ Modal or close button not found');
        return;
    }

    // Close button handler
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLeagueModal();
    });

    // Close when clicking outside the modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLeagueModal();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeLeagueModal();
        }
    });

    console.log('✅ League modal handlers setup complete');
}

// ============================================
// HORIZONTAL SCROLL FUNCTIONALITY
// ============================================

function setupHorizontalScroll() {
    console.log('🔧 Setting up horizontal scroll...');
    
    const scrollGroups = [
        { left: '#scrollLeft', right: '#scrollRight', container: '#upcomingMatchesContainer', name: 'Upcoming' },
        { left: '#scrollLeftLive', right: '#scrollRightLive', container: '#liveMatchesContainer', name: 'Live' },
        { left: '#scrollLeft2', right: '#scrollRight2', container: '#leaguesContainer', name: 'Leagues' },
        { left: '#scrollLeft3', right: '#scrollRight3', container: '#liveEventsContainer', name: 'Events' },
        { left: '#scrollLeft4', right: '#scrollRight4', container: '#highlightsContainer', name: 'Highlights' },
    ];

    scrollGroups.forEach((group) => {
        const leftBtn = document.querySelector(group.left);
        const rightBtn = document.querySelector(group.right);
        const container = document.querySelector(group.container);

        if (!leftBtn) console.warn(`⚠️ Left button not found: ${group.left}`);
        if (!rightBtn) console.warn(`⚠️ Right button not found: ${group.right}`);
        if (!container) console.warn(`⚠️ Container not found: ${group.container}`);

        if (leftBtn && rightBtn && container) {
            console.log(`✅ Scroll setup for ${group.name}`);
            
            leftBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`⬅️ Scroll left: ${group.name}`);
                container.scrollBy({ left: -400, behavior: 'smooth' });
            });

            rightBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`➡️ Scroll right: ${group.name}`);
                container.scrollBy({ left: 400, behavior: 'smooth' });
            });

            // Add visual feedback
            leftBtn.style.cursor = 'pointer';
            rightBtn.style.cursor = 'pointer';
        }
    });

    console.log('✅ Horizontal scroll setup complete');
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (query) {
        console.log('🔍 Searching for:', query);
        window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
}

// ============================================
// USER MENU
// ============================================

function setupUserMenu() {
    const userBtn = document.getElementById('userBtn');

    if (userBtn) {
        userBtn.addEventListener('click', () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                console.log('👤 User menu clicked');
            } else {
                window.location.href = '/login.html';
            }
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatViewers(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
}

function formatDuration(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// PAGE INITIALIZATION
// ============================================

async function initializePage() {
    console.log('🏀 Sports page initializing...');
    document.body.style.opacity = '0.7';

    const dataLoaded = await loadSportsData();

    document.body.style.opacity = '1';

    if (dataLoaded) {
        console.log('✅ Rendering sports data...');
        renderUpcomingMatches();
        renderLiveMatches();
        renderLeagues();
        renderLiveEvents();
        renderHighlights();
    } else {
        console.warn('⚠️ Failed to load sports data');
    }

    setupHorizontalScroll();
    setupSearch();
    setupUserMenu();
    setupWatchButtons();
    setupHeroCarousel();
    setupLeagueModalHandlers();

    const token = localStorage.getItem('token');
    if (token) console.log('✅ User is logged in');
}

// ============================================
// WATCH BUTTON HANDLERS
// ============================================

function setupWatchButtons() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-watch-match') || e.target.classList.contains('btn-play-highlight')) {
            e.preventDefault();
            console.log('▶️ Watching content...');
            alert('Tính năng xem trực tiếp sẽ sớm có mặt!');
        }
    });

    const playButton = document.querySelector('.btn-play');
    if (playButton) {
        playButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('▶️ Playing hero content...');
            alert('Tính năng xem trực tiếp sẽ sớm có mặt!');
        });
    }
}

// ============================================
// HERO CAROUSEL
// ============================================

function setupHeroCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    
    console.log(`🎠 Setting up hero carousel with ${carouselItems.length} items`);

    // Set first item as active by default
    if (carouselItems.length > 0) {
        carouselItems[0].classList.add('active');
    }

    // Add click listeners
    carouselItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            carouselItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            console.log(`🎬 Carousel item ${index} selected`);
        });
    });

    console.log(`✅ Hero carousel ready`);
}

// ============================================
// PAGE LOAD EVENT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof API !== 'undefined') {
        initializePage();
    } else {
        console.error('❌ API not available, waiting...');
        setTimeout(() => {
            if (typeof API !== 'undefined') {
                initializePage();
            } else {
                console.error('❌ API still not available');
            }
        }, 500);
    }
});

// ============================================
// WINDOW RESIZE HANDLER
// ============================================

window.addEventListener('resize', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (window.innerWidth < 768) {
        if (heroTitle) heroTitle.style.fontSize = '32px';
    } else {
        if (heroTitle) heroTitle.style.fontSize = '72px';
    }
});
