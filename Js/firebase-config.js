// Firebase SDK Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, get, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Konfigurasi Firebase (gunakan nilai langsung)
const firebaseConfig = {
    apiKey: "AIzaSyAhTMNSVyLo4f_RvQ0vV2__IkXJCHQjHHk", // Ganti dengan API key Anda
    authDomain: "penjadwalanshiftperawat-93de6.firebaseapp.com", // Ganti dengan domain auth Anda
    databaseURL: "https://penjadwalanshiftperawat-93de6-default-rtdb.firebaseio.com", // Ganti dengan URL database Anda
    projectId: "penjadwalanshiftperawat-93de6", // Ganti dengan project ID Anda
    storageBucket: "penjadwalanshiftperawat-93de6.appspot.com", // Ganti dengan storage bucket Anda
    messagingSenderId: "648323410479", // Ganti dengan messaging sender ID Anda
    appId: "1:648323410479:web:a0d9be743c84a0fd6274da", // Ganti dengan app ID Anda
    measurementId: "G-W6D8BDXP1G" // Ganti dengan measurement ID Anda
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fungsi untuk Menyimpan Data Perawat
async function saveNurse(nurse) {
    try {
        const nurseRef = push(ref(db, "nurses"));
        const nurseId = nurseRef.key;
        nurse.id = nurseId;
        nurse.leaveHistory = []; // Tambahkan field untuk riwayat cuti
        await set(nurseRef, nurse);
        return nurse;
    } catch (error) {
        console.error("Gagal menyimpan data perawat:", error);
        throw error;
    }
}

// Fungsi untuk Mengambil Data Perawat
async function getNurses() {
    try {
        const snapshot = await get(ref(db, "nurses"));
        if (snapshot.exists()) {
            const nurses = Object.values(snapshot.val());
            return nurses;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Gagal mengambil data perawat:", error);
        throw error;
    }
}

// Fungsi untuk Menghapus Data Perawat
async function deleteNurse(nurseId) {
    try {
        await remove(ref(db, `nurses/${nurseId}`));
    } catch (error) {
        console.error("Gagal menghapus data perawat:", error);
        throw error;
    }
}

// Fungsi untuk Memperbarui Data Perawat
async function updateNurse(nurse) {
    try {
        await update(ref(db, `nurses/${nurse.id}`), nurse);
    } catch (error) {
        console.error("Gagal memperbarui data perawat:", error);
        throw error;
    }
}

// Fungsi untuk Menyimpan Jadwal ke Database
async function saveSchedule(month, schedule) {
    try {
        await set(ref(db, `schedules/${month}`), schedule);
    } catch (error) {
        console.error("Gagal menyimpan jadwal:", error);
        throw error;
    }
}

// Fungsi untuk Menyimpan Statistik Beban Kerja ke Database
async function saveWorkloadStats(month, stats) {
    try {
        await set(ref(db, `stats/${month}`), stats);
    } catch (error) {
        console.error("Gagal menyimpan statistik beban kerja:", error);
        throw error;
    }
}

// Fungsi untuk Mengambil Riwayat Cuti
async function getLeaveHistory(nurseId) {
    try {
        const snapshot = await get(ref(db, `nurses/${nurseId}/leaveHistory`));
        return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
        console.error("Gagal mengambil riwayat cuti:", error);
        throw error;
    }
}

// Fungsi untuk Menyimpan Riwayat Cuti
async function updateLeaveHistory(nurseId, leaveHistory) {
    try {
        await update(ref(db, `nurses/${nurseId}`), { leaveHistory });
    } catch (error) {
        console.error("Gagal menyimpan riwayat cuti:", error);
        throw error;
    }
}

// Ekspor Fungsi
export {
    saveNurse,
    getNurses,
    deleteNurse,
    updateNurse,
    saveSchedule,
    saveWorkloadStats,
    getLeaveHistory,
    updateLeaveHistory,
};