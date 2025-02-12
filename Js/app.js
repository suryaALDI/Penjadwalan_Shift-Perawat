import { saveNurse, getNurses, deleteNurse, saveSchedule, saveWorkloadStats, getLeaveHistory, updateLeaveHistory } from './firebase-config.js';
import { generateSchedule } from './genetic.js';
import { calculateWorkloadStatistics, calculateTotalLeave } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const addNurseForm = document.getElementById('addNurseForm');
    const nurseTable = document.getElementById('nurseTable').getElementsByTagName('tbody')[0];
    const generateJadwalButton = document.getElementById('generateJadwal');
    const bulanSelect = document.getElementById('bulanSelect');
    const jadwalTable = document.getElementById('jadwalTable');
    const workloadStatsContainer = document.getElementById('workloadStats');
    const downloadExcelButton = document.getElementById('downloadExcel');
    const leaveSummaryContainer = document.getElementById('leaveSummary');

    const editModal = document.getElementById('editModal');
    const cutiModal = document.getElementById('cutiModal');
    const modalOverlay = document.getElementById('modalOverlay');

    let nurses = []; // Penyimpanan sementara data perawat

    // Fungsi untuk Menampilkan Notifikasi
    function showNotification(type, message) {
        const notification = document.getElementById('notification');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Fungsi untuk Memuat Data Perawat dari Firebase
    async function loadNurses() {
        try {
            nurses = await getNurses();
            renderNurseTable();
            renderLeaveSummary();
        } catch (error) {
            console.error('Gagal memuat data perawat:', error);
        }
    }

    // Fungsi untuk Merender Tabel Perawat
    function renderNurseTable() {
        nurseTable.innerHTML = '';
        nurses.forEach((nurse) => {
            const row = nurseTable.insertRow();
            row.innerHTML = `
                <td>${nurse.name}</td>
                <td>${nurse.position}</td>
                <td>${nurse.leave?.join(', ') || 'Tidak ada hari'}</td>
                <td>
                    <button class="edit-btn" data-id="${nurse.id}">Edit</button>
                    <button class="cuti-btn" data-id="${nurse.id}">Atur Cuti</button>
                    <button class="delete-btn" data-id="${nurse.id}">Hapus</button>
                </td>
            `;

            row.querySelector('.edit-btn').addEventListener('click', () => openEditModal(nurse));
            row.querySelector('.cuti-btn').addEventListener('click', () => openCutiModal(nurse));
            row.querySelector('.delete-btn').addEventListener('click', async () => {
                if (confirm('Apakah Anda yakin ingin menghapus perawat ini?')) {
                    try {
                        await deleteNurse(nurse.id);
                        nurses = nurses.filter(n => n.id !== nurse.id);
                        renderNurseTable();
                        showNotification('success', 'Perawat berhasil dihapus!');
                    } catch (error) {
                        console.error('Gagal menghapus perawat:', error);
                        showNotification('error', 'Gagal menghapus perawat.');
                    }
                }
            });
        });
    }

    // Fungsi untuk Menambah Perawat Baru
    addNurseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nurseName = document.getElementById('nurseName').value.trim();
        const nursePosition = document.getElementById('nursePosition').value;

        if (!nurseName || !nursePosition) {
            showNotification('error', 'Harap isi semua field!');
            return;
        }

        const newNurse = { name: nurseName, position: nursePosition, leave: [], leaveHistory: [] };
        try {
            await saveNurse(newNurse);
            nurses.push({ id: newNurse.id, ...newNurse });
            renderNurseTable();
            addNurseForm.reset();
            showNotification('success', 'Perawat berhasil ditambahkan!');
        } catch (error) {
            console.error('Gagal menambahkan perawat:', error);
            showNotification('error', 'Gagal menambahkan perawat.');
        }
    });

    // Fungsi untuk Membuka Modal Edit
    function openEditModal(nurse) {
        const editName = document.getElementById('editName');
        const editPosition = document.getElementById('editPosition');

        editName.value = nurse.name;
        editPosition.value = nurse.position;

        editModal.querySelector('form').onsubmit = async (e) => {
            e.preventDefault();
            try {
                nurse.name = editName.value.trim();
                nurse.position = editPosition.value;
                await saveNurse(nurse);
                renderNurseTable();
                closeModals();
                showNotification('success', 'Perawat berhasil diperbarui!');
            } catch (error) {
                console.error('Gagal memperbarui perawat:', error);
                showNotification('error', 'Gagal memperbarui perawat.');
            }
        };

        openModal(editModal);
    }

    // Fungsi untuk Membuka Modal Atur Cuti
    function openCutiModal(nurse) {
        const cutiDays = document.getElementById('cutiDays');
        cutiDays.value = nurse.leave?.join(', ') || '';

        cutiModal.querySelector('form').onsubmit = async (e) => {
            e.preventDefault();
            try {
                const leaveDays = cutiDays.value.split(',').map(day => parseInt(day.trim())).filter(Number.isFinite).sort((a, b) => a - b);
                if (leaveDays.length > 7) {
                    alert('Cuti tidak boleh lebih dari 7 hari.');
                    return;
                }

                nurse.leave = leaveDays;
                await saveNurse(nurse);
                renderNurseTable();
                closeModals();
                showNotification('success', 'Cuti berhasil diperbarui!');
            } catch (error) {
                console.error('Gagal memperbarui cuti:', error);
                showNotification('error', 'Gagal memperbarui cuti.');
            }
        };

        openModal(cutiModal);
    }

    // Fungsi untuk Membuka Modal
    function openModal(modal) {
        modal.style.display = 'block';
        modalOverlay.style.display = 'block';
    }

    // Fungsi untuk Menutup Semua Modal
    function closeModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
        modalOverlay.style.display = 'none';
    }

    // Tutup Modal Saat Klik di Overlay
    modalOverlay.addEventListener('click', closeModals);

    // Fungsi untuk Menghasilkan Jadwal
    generateJadwalButton.addEventListener('click', async () => {
        const month = bulanSelect.value;
        if (!month) {
            showNotification('error', 'Pilih bulan terlebih dahulu!');
            return;
        }
        try {
            const daysInMonth = new Date(new Date().getFullYear(), month, 0).getDate();
            const schedule = await generateSchedule(nurses, daysInMonth);
            const stats = calculateWorkloadStatistics(schedule, nurses);

            await saveScheduleToFirebase(month, schedule);
            await saveStatsToFirebase(month, stats);

            renderScheduleTable(schedule, daysInMonth);
            renderWorkloadStats(stats);
            renderWorkloadChart(stats);

            showNotification('success', 'Jadwal dan statistik berhasil disimpan!');
        } catch (error) {
            console.error('Gagal generate jadwal:', error);
            showNotification('error', 'Gagal generate jadwal');
        }
    });

    // Fungsi untuk Menyimpan Jadwal ke Firebase
    async function saveScheduleToFirebase(month, schedule) {
        try {
            await saveSchedule(month, schedule);
        } catch (error) {
            console.error('Gagal menyimpan jadwal:', error);
        }
    }

    // Fungsi untuk Menyimpan Statistik ke Firebase
    async function saveStatsToFirebase(month, stats) {
        try {
            await saveWorkloadStats(month, stats);
        } catch (error) {
            console.error('Gagal menyimpan statistik:', error);
        }
    }

    // Fungsi untuk Merender Tabel Jadwal
    function renderScheduleTable(schedule, daysInMonth) {
        jadwalTable.innerHTML = '';

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Nama Perawat</th>';
        for (let i = 1; i <= daysInMonth; i++) {
            headerRow.innerHTML += `<th>Hari ${i}</th>`;
        }
        jadwalTable.appendChild(headerRow);

        schedule.forEach(nurseSchedule => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${nurseSchedule.nurse}</td>`;
            nurseSchedule.schedule.forEach(shift => {
                row.innerHTML += `<td>${shift}</td>`;
            });
            jadwalTable.appendChild(row);
        });
    }

    // Fungsi untuk Merender Statistik Beban Kerja
    function renderWorkloadStats(stats) {
        workloadStatsContainer.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'stats-table';

        const headerRow = '<tr><th>Nama Perawat</th><th>Total Jam</th><th>Pagi</th><th>Sore</th><th>Malam</th><th>Libur</th></tr>';
        table.innerHTML += headerRow;

        stats.forEach(stat => {
            const row = `
                <tr>
                    <td>${stat.nurse}</td>
                    <td>${stat.totalHours}</td>
                    <td>${stat.P}</td>
                    <td>${stat.S}</td>
                    <td>${stat.M}</td>
                    <td>${stat.L}</td>
                </tr>
            `;
            table.innerHTML += row;
        });

        workloadStatsContainer.appendChild(table);
    }

    // Fungsi untuk Merender Grafik Beban Kerja
    function renderWorkloadChart(stats) {
        const ctx = document.getElementById('workloadChart').getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: stats.map(stat => stat.nurse),
                datasets: [{
                    label: 'Total Jam Kerja',
                    data: stats.map(stat => stat.totalHours),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Fungsi untuk Merender Rekapan Cuti
    function renderLeaveSummary() {
        leaveSummaryContainer.innerHTML = '';
        nurses.forEach(nurse => {
            const totalLeave = calculateTotalLeave(nurse);
            const summary = document.createElement('div');
            summary.innerHTML = `
                <p><strong>${nurse.name}</strong>: ${totalLeave} hari cuti dalam 6 bulan terakhir.</p>
            `;
            leaveSummaryContainer.appendChild(summary);
        });
    }

    // Fungsi untuk Mengunduh Jadwal ke Excel
    downloadExcelButton.addEventListener('click', () => {
        const workbook = XLSX.utils.book_new();
        const worksheetData = [];

        const headerRow = ['Nama Perawat'];
        const daysInMonth = jadwalTable.querySelector('tr').children.length - 1;
        for (let i = 1; i <= daysInMonth; i++) {
            headerRow.push(`Hari ${i}`);
        }
        worksheetData.push(headerRow);

        const rows = jadwalTable.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index === 0) return;
            const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent);
            worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Perawat');
        XLSX.writeFile(workbook, 'jadwal-perawat.xlsx');
    });

    // Muat Data Perawat saat Halaman Dimuat
    loadNurses();
});