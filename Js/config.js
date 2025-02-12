// Konfigurasi Global untuk Aplikasi Penjadwalan Shift Perawat
const config = {
    // Batasan Jam Kerja
    workHours: {
        maxHoursPerMonth: 180, // Beban kerja maksimum perawat dalam satu bulan
        maxShiftHours: 24      // Batas jam kerja maksimum per hari
    },

    // Konfigurasi Shift
    shifts: {
        P: 6,    // Shift Pagi: 6 jam
        S: 7,    // Shift Sore: 7 jam
        M: 11,   // Shift Malam: 11 jam
        L: 0,    // Shift Libur: 0 jam
        C: 0     // Shift Cuti: 0 jam
    },

    // Hari dalam Bulan
    daysInMonth: (month, year) => new Date(year, month, 0).getDate(),

    // Algoritma Genetik
    geneticAlgorithm: {
        populationSize: 50, // Ukuran populasi
        mutationRate: 0.1,  // Tingkat mutasi
        crossoverRate: 0.8, // Tingkat crossover
        maxHoursPerMonth: 180, // Batas jam kerja per bulan
    },

    // Konfigurasi Cuti
    leave: {
        maxLeaveDays: 7 // Maksimal durasi cuti dalam satu bulan
    },

    // Ekspor Data
    exportFormats: ['csv', 'xlsx'], // Format yang didukung untuk ekspor

    // Notifikasi
    notifications: {
        duration: 3000, // Durasi notifikasi (ms)
        types: {
            success: 'success',
            error: 'error',
            info: 'info',
            warning: 'warning'
        }
    },

    // Tema Warna untuk UI
    theme: {
        colors: {
            primary: '#4CAF50',  // Hijau utama
            secondary: '#337ab7', // Biru sekunder
            danger: '#d9534f',    // Merah untuk aksi berbahaya
            warning: '#f0ad4e',   // Kuning untuk peringatan
            success: '#4CAF50',   // Hijau untuk aksi sukses
            info: '#337ab7'       // Biru untuk informasi
        }
    }
};

export default config;