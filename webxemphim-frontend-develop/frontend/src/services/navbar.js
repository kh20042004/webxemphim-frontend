const navSearchInput = document.querySelector('.nav-search-input');

if (navSearchInput) {
    navSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const keyword = e.target.value.trim();
            if (keyword) {
                // Chuyển hướng sang trang movies.html kèm tham số ?search=...
                window.location.href = `movies.html?search=${encodeURIComponent(keyword)}`;
            }
        }
    });
}