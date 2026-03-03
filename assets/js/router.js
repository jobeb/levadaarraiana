/**
 * Router — SPA hash-based navigation
 */
const Router = {
    routes: {},

    register(name, callback) {
        this.routes[name] = callback;
    },

    navigate(name) {
        window.location.hash = '#' + name;
    },

    init() {
        window.addEventListener('hashchange', () => this._resolve());
        this._resolve();
    },

    _resolve() {
        const raw = window.location.hash.slice(1) || 'dashboard';
        const slashIdx = raw.indexOf('/');
        const hash = slashIdx === -1 ? raw : raw.substring(0, slashIdx);
        AppState.currentSection = hash;
        AppState.routeParam = slashIdx === -1 ? null : decodeURIComponent(raw.substring(slashIdx + 1));

        // Hide all sections, show target
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById('sec-' + hash);
        if (target) target.classList.add('active');

        // Update sidebar active state
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === hash);
        });

        // Scroll to top
        document.querySelector('.app-main')?.scrollTo(0, 0);
        window.scrollTo(0, 0);

        // Call route callback if registered
        if (this.routes[hash]) {
            this.routes[hash]();
        }

        // Close mobile sidebar
        document.querySelector('.app-sidebar')?.classList.remove('open');
        document.querySelector('.sidebar-overlay')?.classList.remove('show');
    }
};
