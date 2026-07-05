<script setup lang="ts">
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import Menu from 'primevue/menu';
import { ref, onMounted, computed } from 'vue';
import 'primeicons/primeicons.css'

type Mode = 'bar' | 'line'

// Set sensible defaults for an immediate "attractive" first run
const eventProb = ref(0.5)
const trialsCount = ref(100)
const episodesCount = ref(1000)
const chartMode = ref<Mode>('line')
const chartData = ref();
const chartOptions = ref();
const menu = ref();

// Menu options for selecting chart visualization mode
const items = ref([
    {
        label: 'Line Chart (Law of Large Numbers)',
        icon: 'pi pi-chart-line',
        command: () => { chartMode.value = 'line'; proceed(); }
    },
    {
        label: 'Bar Chart (Probability Distribution)',
        icon: 'pi pi-chart-bar',
        command: () => { chartMode.value = 'bar'; proceed(); }
    }
]);

const toggle = (event: Event) => {
    menu.value.toggle(event);
};

/**
 * Generates the chart data based on the selected mode and updates the chart references.
 */
function proceed() {
    chartData.value = getChartData(chartMode.value, trialsCount.value, episodesCount.value, eventProb.value)
    chartOptions.value = getChartOptions(chartMode.value)
}

/**
 * Core simulation logic to generate data points for Line or Bar charts.
 */
function getChartData(mode: Mode, trialsCount: number, episodesCount: number, eventProb: number) {
    if (mode == 'line') {
        // Line Mode: Demonstrates Law of Large Numbers
        // Tracks running probability as the number of trials increases.
        const labels = []
        const data = []
        const line = []
        let total = 0

        for (let i = 0; i < trialsCount; i++) {
            labels.push(i.toString())
            total += Math.random() < eventProb ? 1 : 0
            data.push(total / (i + 1))
            line.push(eventProb) // The true probability baseline
        }

        const mean = calcMean(data).toFixed(4)
        const std = calcSTD(data).toFixed(4)
        const info = `Mean: ${mean} | STD: ${std}`

        return {
            labels,
            datasets: [
                {
                    label: `Empirical Probability (${info})`,
                    data,
                    borderColor: '#4ade80', // PrimeVue Green
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                },
                {
                    label: 'True Probability',
                    data: line,
                    borderColor: '#f87171', // PrimeVue Red
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0,
                    pointRadius: 0
                }
            ]
        };
    }
    else if (mode == 'bar') {
        // Bar Mode: Demonstrates Probability Distribution across multiple episodes
        const length = Math.min(trialsCount, 50); // Cap bins to avoid UI clutter

        // Adjusted to perfectly map 0 to 1 based on the length
        const labels = Array.from({ length }, (_, i) => (i / (length - 1)).toFixed(2));
        const data = Array.from({ length }, () => 0);
        const episodeResults = [];

        // 1. Generate Empirical Data
        for (let i = 0; i < episodesCount; i++) {
            let total = 0;
            for (let j = 0; j < trialsCount; j++) {
                total += Math.random() < eventProb ? 1 : 0;
            }
            const prob = (total / trialsCount);
            episodeResults.push(prob);

            let index = Math.floor(prob * (length - 1));
            // Safety bound in case prob is exactly 1.0
            if (index >= length) index = length - 1;
            data[index]! += 1;
        }

        const mean = calcMean(episodeResults).toFixed(4);
        const std = calcSTD(episodeResults).toFixed(4);
        const info = `Mean: ${mean} | STD: ${std}`;

        // 2. Generate Expected Normal Distribution
        const expectedData = [];
        const mu = eventProb; // Expected mean
        const variance = (eventProb * (1 - eventProb)) / trialsCount;
        const sigma = Math.sqrt(variance); // Expected standard deviation
        const binWidth = 1 / (length - 1);

        for (let i = 0; i < length; i++) {
            const x = i / (length - 1); // The specific probability (x-axis) for this bin

            if (sigma === 0) {
                // Edge case: if true probability is exactly 0 or 1
                expectedData.push(x === mu ? episodesCount : 0);
            } else {
                // Normal Probability Density Function (PDF)
                const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
                const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

                // Scale the PDF by total episodes and bin width to match the frequency histogram
                const expectedFrequency = pdf * episodesCount * binWidth;
                expectedData.push(expectedFrequency);
            }
        }

        return {
            labels,
            datasets: [
                {
                    type: 'bar', // Explicitly declare this dataset as the bars
                    label: `Frequency Distribution (${info})`,
                    data,
                    backgroundColor: 'rgba(96, 165, 250, 0.8)', // PrimeVue Blue
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    order: 2 // Draw behind the line
                },
                {
                    type: 'line', // The overlaid expected normal curve
                    label: 'Expected Normal Distribution',
                    data: expectedData,
                    borderColor: '#f87171', // PrimeVue Red
                    borderWidth: 2,
                    tension: 0.4, // Smooth curve
                    pointRadius: 0, // Hide data point circles
                    fill: false,
                    order: 1 // Draw on top
                }
            ]
        };
    }
}

/**
 * Styling and configuration options for the PrimeVue Chart component.
 */
/**
 * Styling and configuration options for the PrimeVue Chart component.
 */
function getChartOptions(mode: Mode) {
    const textColor = '#e2e8f0';
    const textColorSecondary = '#94a3b8';
    const surfaceBorder = '#334155';

    return {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: textColor, font: { weight: 'bold' } }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false },
                title: { display: true, text: mode === 'line' ? 'Trials' : 'Probability Bins', color: textColor }
            },
            y: {
                beginAtZero: true,
                min: 0,
                // Only force the max to 1 for the Line chart (Probability). 
                // The Bar chart needs to scale automatically for Frequency.
                ...(mode === 'line' ? { max: 1 } : {}),
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false },
                title: { display: true, text: mode === 'line' ? 'Running Probability' : 'Frequency', color: textColor }
            }
        }
    };
}

// Mathematical Helpers
function calcMean(data: number[]) {
    if (data.length === 0) return 0;
    return data.reduce((acc, val) => acc + val, 0) / data.length;
}

function calcSTD(data: number[]) {
    if (data.length === 0) return 0;
    const mean = calcMean(data);
    const variance = data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;
    return Math.sqrt(variance); // Fixed logic: Square root of variance
}

// Initialize the chart as soon as the component loads
onMounted(() => {
    proceed();
});

const expectedMean = computed(() => {
    // Expected Mean = p
    return eventProb.value.toFixed(4);
});

const expectedSTD = computed(() => {
    // Expected STD = sqrt( (p * (1 - p)) / N )
    if (trialsCount.value <= 0) return "0.0000";
    const p = eventProb.value;
    const n = trialsCount.value;
    const variance = (p * (1 - p)) / n;
    return Math.sqrt(variance).toFixed(4);
});
</script>

<template>
    <div class="dashboard-container">
        <header class="dashboard-header">
            <h2>Probability Simulation Dashboard</h2>
            <p>Visualize the Law of Large Numbers and Event Distributions</p>
        </header>

        <div class="main-content">
            <div class="setup-section card">
                <h3>Simulation Parameters</h3>

                <div class="input-grid">
                    <div class="input-field">
                        <label for="eventProb" class="label">Event Probability (0 to 1)</label>
                        <InputNumber id="eventProb" class="input" v-model="eventProb" :min="0" :max="1" :step="0.05"
                            :minFractionDigits="2" showButtons />
                    </div>

                    <div class="input-field">
                        <label for="trialsCount" class="label">Trials Count</label>
                        <InputNumber id="trialsCount" class="input" v-model="trialsCount" :min="1" :max="10000"
                            showButtons />
                    </div>

                    <div class="input-field" v-if="chartMode == 'bar'">
                        <label for="episodesCount" class="label">Episodes Count</label>
                        <InputNumber id="episodesCount" class="input" v-model="episodesCount" :min="1" :max="100000"
                            showButtons />
                    </div>
                </div>

                <div class="action-row">
                    <div class="menu-container">
                        <Button :label="chartMode === 'line' ? 'Mode: Line' : 'Mode: Bar'" icon="pi pi-angle-down"
                            @click="toggle" aria-haspopup="true" aria-controls="overlay_menu" iconPos="right"
                            severity="secondary" />
                        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                    </div>
                    <Button label="Run Simulation" icon="pi pi-play" @click="proceed()" class="run-btn" />

                </div>

                <div class="stats-panel" v-if="chartMode == 'bar'">
                    <h4>Theoretical Expectations</h4>
                    <div class="stat-row">
                        <span class="stat-label">Expected Mean (μ)</span>
                        <span class="stat-value">{{ expectedMean }}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Expected STD (σ)</span>
                        <span class="stat-value">{{ expectedSTD }}</span>
                    </div>
                    <p class="stat-note">These are the true mathematical bounds based on your inputs.</p>
                </div>
            </div>

            <div class="results-section card">
                <Chart :type="chartMode" :data="chartData" :options="chartOptions" class="chart-canvas" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Base Container */
.dashboard-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #0f172a;
    /* Slate 900 */
    color: #f8fafc;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Typography */
.dashboard-header {
    text-align: center;
    margin-bottom: 2rem;
}

.dashboard-header h2 {
    margin: 0;
    font-size: 2rem;
    color: #38bdf8;
    /* Sky 400 */
}

.dashboard-header p {
    margin-top: 0.5rem;
    color: #94a3b8;
    /* Slate 400 */
}

/* Layout */
.main-content {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Cards */
.card {
    background-color: #1e293b;
    /* Slate 800 */
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #334155;
}

.setup-section h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    border-bottom: 1px solid #334155;
    padding-bottom: 0.75rem;
}

/* Form Elements */
.input-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.input-field {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #cbd5e1;
}

.input {
    width: 100%;
}

/* Actions */
.action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #334155;
}

.run-btn {
    background-color: #3b82f6;
    border-color: #3b82f6;
    transition: background-color 0.2s;
}

.run-btn:hover {
    background-color: #2563eb;
    border-color: #2563eb;
}

/* Chart Area */
.results-section {
    min-height: 400px;
    display: flex;
    flex-direction: column;
}

.chart-canvas {
    height: 400px;
    /* Enforces a fixed height to prevent collapsing */
    width: 100%;
}

/* Theoretical Stats Panel */
.stats-panel {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #334155;
}

.stats-panel h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    background-color: #0f172a;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border: 1px solid #1e293b;
}

.stat-label {
    font-size: 0.9rem;
    color: #cbd5e1;
    font-weight: 600;
}

.stat-value {
    font-family: monospace;
    font-size: 1rem;
    color: #38bdf8;
    font-weight: bold;
}

.stat-note {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.5rem;
    text-align: center;
}

/* Responsive Media Queries */
@media (min-width: 850px) {
    .main-content {
        flex-direction: row;
    }

    .setup-section {
        flex: 1;
        max-width: 350px;
    }

    .results-section {
        flex: 2;
    }

    .input-grid {
        flex-direction: column;
    }
}
</style>