<!--
    Generic Chart.js wrapper component for Re-Forest application
    Supports Line, Bar, and Pie chart types
-->
<script lang="ts">
    import Chart from 'chart.js/auto';
    import 'chartjs-adapter-date-fns';
    import { onDestroy, onMount } from 'svelte';

    export let type: 'line' | 'bar' | 'pie' = 'bar';
    export let data: { label: string; value: number }[] = [];
    export let title: string = '';
    export let xAxisLabel: string = '';
    export let yAxisLabel: string = '';
    export let colors: string[] = ["#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800", "#FF5722"];

    let chartElement: HTMLCanvasElement;
    let chartInstance: Chart;

    function createChart() {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const labels = data.map(item => item.label);
        const values = data.map(item => item.value);
        
        // Generate background colors for pie/doughnut charts
        const backgroundColors = type === 'pie' 
            ? data.map((_, i) => colors[i % colors.length])
            : colors[0];

        const chartConfig = {
            type,
            data: {
                labels,
                datasets: [{
                    label: title,
                    data: values,
                    backgroundColor: backgroundColors,
                    borderColor: type !== 'pie' ? colors[0] : undefined,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: type === 'pie',
                        position: 'top' as const,
                    },
                    title: {
                        display: !!title,
                        text: title
                    }
                },
                scales: type !== 'pie' ? {
                    x: {
                        title: {
                            display: !!xAxisLabel,
                            text: xAxisLabel
                        },
                        // If dates are provided, parse them
                        type: labels.some(label => !isNaN(Date.parse(label))) ? 'time' : 'category',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: !!yAxisLabel,
                            text: yAxisLabel
                        }
                    }
                } : undefined
            }
        };

        chartInstance = new Chart(chartElement, chartConfig);
    }

    $: if (chartElement && data) {
        createChart();
    }

    onMount(() => {
        if (chartElement && data) {
            createChart();
        }
    });

    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });
</script>

<div class="chart-container" style="width:100%; height:100%;">
    <canvas bind:this={chartElement}></canvas>
</div>
