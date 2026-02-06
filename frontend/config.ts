// Environment Configuration
export const ENV = {
    // Ganti ini sesuai environment
    MODE: 'production', // 'development' atau 'production'

    // URL Backend Siakad
    BACKEND_URL: {
        development: 'http://localhost:8080',
        production: 'https://siakad.staialmannan.ac.id' // Ganti dengan URL Ngrok atau VPS backend
    }
};

// Helper function untuk mendapatkan backend URL
export const getBackendUrl = () => {
    return ENV.BACKEND_URL[ENV.MODE as keyof typeof ENV.BACKEND_URL];
};
