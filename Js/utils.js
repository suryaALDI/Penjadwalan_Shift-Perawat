import config from './config.js';

// Fungsi untuk Menghitung Jumlah Jam Berdasarkan Shift
function getShiftHours(shift) {
    return config.shifts[shift] || 0; // Ambil jam kerja dari konfigurasi
}

// Fungsi untuk Menghitung Total Jam Kerja
function calculateTotalHours(schedule) {
    return schedule.reduce((total, shift) => {
        if (typeof shift === 'string' && config.shifts[shift] !== undefined) {
            return total + config.shifts[shift];
        }
        return total;
    }, 0);
}

// Fungsi untuk Memeriksa Validitas Jadwal
function isValidSchedule(schedule, nurses, maxHoursPerMonth) {
    return schedule.every(nurseSchedule => {
        const nurse = nurses.find(n => n.name === nurseSchedule.nurse);
        if (!nurse) {
            console.error(`Data perawat tidak ditemukan: ${nurseSchedule.nurse}`);
            return false;
        }

        const totalHours = calculateTotalHours(nurseSchedule.schedule);
        if (totalHours > maxHoursPerMonth) return false; // Tidak valid jika jam kerja melebihi batas

        // Validasi cuti
        if (nurse.leave) {
            return nurse.leave.every(day => nurseSchedule.schedule[day - 1] === "C");
        }

        return true;
    });
}

// Fungsi untuk Menghitung Statistik Beban Kerja
function calculateWorkloadStatistics(schedule) {
    return schedule.map(nurseSchedule => {
        const shiftCounts = { P: 0, S: 0, M: 0, L: 0, C: 0 }; // Tambahkan Cuti
        let totalHours = 0;

        nurseSchedule.schedule.forEach(shift => {
            if (shiftCounts.hasOwnProperty(shift)) {
                shiftCounts[shift] += 1;
                totalHours += getShiftHours(shift);
            }
        });

        return {
            nurse: nurseSchedule.nurse,
            totalHours,
            ...shiftCounts // Menyimpan jumlah masing-masing shift
        };
    });
}

// Fungsi untuk Memilih Dua Individu untuk Crossover
function selectTwoIndividuals(population) {
    const idx1 = Math.floor(Math.random() * population.length);
    let idx2 = Math.floor(Math.random() * population.length);
    while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * population.length);
    }
    return [population[idx1], population[idx2]];
}

// Fungsi untuk Crossover (Pertukaran Data)
function crossover(parent1, parent2, daysInMonth) {
    const crossoverPoint = Math.floor(Math.random() * daysInMonth);
    const child = parent1.map((nurseSchedule, index) => {
        const newSchedule = [
            ...nurseSchedule.schedule.slice(0, crossoverPoint),
            ...parent2[index].schedule.slice(crossoverPoint)
        ];
        return { nurse: nurseSchedule.nurse, schedule: newSchedule };
    });
    return child;
}

// Fungsi untuk Mutasi pada Jadwal
function mutate(individual, nurses, mutationRate, daysInMonth) {
    return individual.map((nurseSchedule, index) => {
        const newSchedule = nurseSchedule.schedule.map((shift, day) => {
            if (Math.random() < mutationRate) {
                if (nurses[index].leave?.includes(day + 1)) {
                    return "C"; // Jangan mutasi jika hari adalah cuti
                }
                return getRandomShift(nurses[index].leave, day + 1);
            }
            return shift;
        });
        return { nurse: nurseSchedule.nurse, schedule: newSchedule };
    });
}

// Fungsi untuk Mendapatkan Shift Acak
function getRandomShift(leaveDays, day) {
    if (leaveDays?.includes(day)) {
        return "C"; // Cuti
    }
    const shifts = Object.keys(config.shifts).filter(shift => shift !== "C"); // Ambil shift dari konfigurasi
    return shifts[Math.floor(Math.random() * shifts.length)];
}

// Fungsi untuk Validasi Cuti dalam 6 Bulan
function validateLeave(nurse, newLeaveDays) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const totalLeave = nurse.leaveHistory
        .filter(entry => {
            const entryDate = new Date(entry.year, entry.month - 1);
            return entryDate >= sixMonthsAgo;
        })
        .reduce((total, entry) => total + entry.days.length, 0);

    return totalLeave + newLeaveDays.length <= config.leave.maxLeaveDays; // Batas cuti 7 hari
}

// Fungsi untuk Menghitung Total Cuti dalam 6 Bulan
function calculateTotalLeave(nurse) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return nurse.leaveHistory
        .filter(entry => {
            const entryDate = new Date(entry.year, entry.month - 1);
            return entryDate >= sixMonthsAgo;
        })
        .reduce((total, entry) => total + entry.days.length, 0);
}

// Ekspor Fungsi
export {
    getShiftHours,
    calculateTotalHours,
    isValidSchedule,
    calculateWorkloadStatistics,
    selectTwoIndividuals,
    crossover,
    mutate,
    getRandomShift,
    validateLeave,
    calculateTotalLeave,
};