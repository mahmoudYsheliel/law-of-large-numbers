# Probability Simulation Dashboard 🎲



https://github.com/user-attachments/assets/c1d2a02a-3504-4fe4-8f88-06a23eef8379


A modern, responsive Vue 3 dashboard designed to visualize statistical concepts like the **Law of Large Numbers** and **Binomial Probability Distributions**. Built with TypeScript, PrimeVue, and Chart.js, this tool allows users to run Monte Carlo-style simulations and compare empirical results against theoretical mathematical expectations in real-time.

## Features

- **Interactive Parameters:** Dynamically adjust the True Event Probability, Number of Trials, and Number of Episodes.
- **Line Chart Mode (Law of Large Numbers):** Visualizes how the empirical running probability converges toward the true probability as the number of trials increases.
- **Bar Chart Mode (Probability Distribution):** Simulates a Binomial distribution across multiple episodes to show the frequency of outcomes.
- **Real-time Mathematical Expectations:** Automatically calculates and displays the theoretical expected Mean and Standard Deviation based on user inputs.
- **Modern Dark UI:** A sleek, responsive layout utilizing PrimeVue components and custom CSS.

## Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API & `<script setup>`)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [PrimeVue](https://primevue.org/)
- **Icons:** PrimeIcons
- **Data Visualization:** [Chart.js](https://www.chartjs.org/) (via PrimeVue `<Chart />`)

## Mathematical Context

This dashboard calculates both theoretical expectations and empirical (simulated) results.

The theoretical values are based on the properties of a sample proportion from a Binomial distribution:

- **Expected Mean ($\mu$):** The expected proportion of successes equals the true probability of the event.
  $$\mu = p$$
- **Expected Standard Deviation ($\sigma$):** The spread of the expected proportions relies on the probability and the number of trials ($N$).
  $$\sigma = \sqrt{\frac{p(1-p)}{N}}$$

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/probability-simulation-dashboard.git](https://github.com/your-username/probability-simulation-dashboard.git)
   cd probability-simulation-dashboard
   ```
