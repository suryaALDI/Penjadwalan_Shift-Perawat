import config from './config.js';
import { calculateTotalHours, getRandomShift, validateLeave } from './utils.js';

// Fungsi untuk Inisialisasi Populasi Awal
function initializePopulation(nurses, daysInMonth, populationSize) {
    const population = [];

    for (let i = 0; i < populationSize; i++) {
        const individual = nurses.map(nurse => {
            const nurseSchedule = {
                nurse: nurse.name,
                schedule: Array.from({ length: daysInMonth }, (_, day) => getRandomShift(nurse.leave || [], day + 1))
            };
            return nurseSchedule;
        });

        population.push(individual);
    }

    return population;
}

// Fungsi untuk Menghitung Fitness
function calculateFitness(individual, nurses, maxWorkHours) {
    let fitness = 0;

    individual.forEach((nurseSchedule, index) => {
        const totalHours = calculateTotalHours(nurseSchedule.schedule);
        const hourDiff = Math.abs(totalHours - maxWorkHours);
        fitness -= hourDiff; // Penalti jika jam kerja tidak sesuai target

        // Bonus untuk libur setelah shift malam
        nurseSchedule.schedule.forEach((shift, day) => {
            if (shift === "L" && day > 0 && nurseSchedule.schedule[day - 1] === "M") {
                fitness += 10;
            }
        });

        // Penalti untuk distribusi shift yang tidak merata
        const shiftCounts = { P: 0, S: 0, M: 0, L: 0, C: 0 };
        nurseSchedule.schedule.forEach(shift => {
            if (shiftCounts.hasOwnProperty(shift)) {
                shiftCounts[shift] += 1;
            }
        });
        const maxShiftDiff = Math.max(...Object.values(shiftCounts)) - Math.min(...Object.values(shiftCounts));
        fitness -= maxShiftDiff;
    });

    return fitness;
}

// Fungsi untuk Seleksi Dua Individu
function selectTwoIndividuals(population) {
    const idx1 = Math.floor(Math.random() * population.length);
    let idx2 = Math.floor(Math.random() * population.length);
    while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * population.length);
    }
    return [population[idx1], population[idx2]];
}

// Fungsi Crossover
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

// Fungsi Mutasi
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

// Fungsi Generate Jadwal Menggunakan Algoritma Genetika
function generateSchedule(nurses, daysInMonth, populationSize = 50, generations = 500, mutationRate = 0.1) {
    let population = initializePopulation(nurses, daysInMonth, populationSize);

    for (let generation = 0; generation < generations; generation++) {
        // Hitung Fitness dan Urutkan Populasi
        population.sort((a, b) => calculateFitness(b, nurses, config.workHours.maxHoursPerMonth) - calculateFitness(a, nurses, config.workHours.maxHoursPerMonth));

        // Seleksi dan Crossover
        const newPopulation = [];
        for (let i = 0; i < populationSize; i++) {
            const [parent1, parent2] = selectTwoIndividuals(population);
            let child = crossover(parent1, parent2, daysInMonth);
            child = mutate(child, nurses, mutationRate, daysInMonth);
            newPopulation.push(child);
        }

        population = newPopulation;
    }

    // Ambil individu terbaik
    population.sort((a, b) => calculateFitness(b, nurses, config.workHours.maxHoursPerMonth) - calculateFitness(a, nurses, config.workHours.maxHoursPerMonth));
    return population[0];
}

export { generateSchedule };