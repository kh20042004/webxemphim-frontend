// VFLIX Theme Manager
tailwind.config = { darkMode: 'class' };

(function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light' || (!theme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
})();
