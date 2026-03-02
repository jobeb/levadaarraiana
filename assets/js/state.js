/**
 * State — Store centralizado (reemplaza variables globales)
 */
const AppState = {
    user: null,
    token: null,
    lang: localStorage.getItem('lang') || CONFIG.DEFAULT_LANG,

    // Data cache
    usuarios: [],
    noticias: [],
    bolos: [],
    albums: [],
    propostas: [],
    actas: [],
    documentos: [],
    votacions: [],

    ensaios: [],
    instrumentos: [],
    repertorio: [],
    config: {},

    // UI state
    currentSection: 'dashboard',

    setUser(user) {
        this.user = user;
        if (user && user.token) {
            this.token = user.token;
            localStorage.setItem('session', JSON.stringify(user));
        }
    },

    loadSession() {
        const s = localStorage.getItem('session');
        if (s) {
            try {
                const data = JSON.parse(s);
                this.user = data;
                this.token = data.token;
                return true;
            } catch(e) { /* ignore */ }
        }
        return false;
    },

    clearSession() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('session');
    },

    isAdmin() {
        return this.user && this.user.role === 'Admin';
    },

    isSocio() {
        return this.user && (this.user.role === 'Admin' || this.user.role === 'Socio');
    }
};
