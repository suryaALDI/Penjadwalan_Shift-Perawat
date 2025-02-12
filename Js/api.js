// Data mock untuk perawat
let nurses = [
  { id: 1, name: 'Perawat 1', position: 'Senior', leave: [1, 2, 3], leaveHistory: [] },
  { id: 2, name: 'Perawat 2', position: 'Junior', leave: [], leaveHistory: [] }
];

// Fungsi untuk mengambil data perawat
export async function fetchNurses() {
  return Promise.resolve(nurses);
}

// Fungsi untuk menyimpan perawat baru
export async function saveNurse(nurse) {
  const newId = nurses.length ? Math.max(...nurses.map(n => n.id)) + 1 : 1;
  const newNurse = { id: newId, ...nurse };
  nurses.push(newNurse);
  return Promise.resolve(newNurse);
}

// Fungsi untuk memperbarui data perawat
export async function updateNurse(updatedNurse) {
  nurses = nurses.map(nurse => nurse.id === updatedNurse.id ? updatedNurse : nurse);
  return Promise.resolve(updatedNurse);
}

// Fungsi untuk menghapus perawat
export async function deleteNurse(nurseId) {
  nurses = nurses.filter(nurse => nurse.id !== nurseId);
  return Promise.resolve();
}

// Fungsi untuk menyimpan jadwal (mock)
export async function saveSchedule(month, schedule) {
  console.log(`Jadwal untuk bulan ${month} disimpan:`, schedule);
  return Promise.resolve();
}

// Fungsi untuk menyimpan statistik beban kerja (mock)
export async function saveWorkloadStats(month, stats) {
  console.log(`Statistik beban kerja untuk bulan ${month} disimpan:`, stats);
  return Promise.resolve();
}

// Fungsi untuk mengambil riwayat cuti
export async function getLeaveHistory(nurseId) {
  const nurse = nurses.find(n => n.id === nurseId);
  return Promise.resolve(nurse ? nurse.leaveHistory : []);
}

// Fungsi untuk memperbarui riwayat cuti
export async function updateLeaveHistory(nurseId, leaveHistory) {
  const nurse = nurses.find(n => n.id === nurseId);
  if (nurse) {
    nurse.leaveHistory = leaveHistory;
  }
  return Promise.resolve();
}