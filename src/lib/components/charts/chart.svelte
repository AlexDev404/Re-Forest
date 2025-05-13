<!--
    Generic Chart.js wrapper component for Re-Forest application
    Supports Line, Bar, and Pie chart types
-->
<script lang="ts">
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-date-fns';

	interface PropData {
		type: 'line' | 'bar' | 'pie';
		data: { label: string; value: number }[];
		title: string;
		xAxisLabel: string;
		yAxisLabel: string;
		colors: string[];
	}

	let { type, data, title, xAxisLabel, yAxisLabel, colors }: PropData = $props();

	if (!colors) {
		colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'];
	}

	let chartElement: HTMLCanvasElement;
	let chartInstance = $state<Chart | undefined>(undefined);

	function createChart() {
		if (!chartElement) return;

		const labels = data.map((item) => item.label);
		const values = data.map((item) => item.value);

		// Generate background colors for pie/doughnut charts
		const backgroundColors =
			type === 'pie' ? data.map((_, i) => colors[i % colors.length]) : colors[0];

		// Check if labels are in "MMM YYYY" format (e.g., "Jul 2023")
		const isDateFormat = labels.some((label) => {
			// Check for "MMM YYYY" format (3 letters + space + 4 digits)
			return typeof label === 'string' && /^[A-Za-z]{3}\s\d{4}$/.test(label.trim());
		});

		// Determine if we should use time scale
		const useTimeScale = labels.some((label) => !isNaN(Date.parse(label))) || isDateFormat;

		const chartConfig = {
			type,
			data: {
				labels,
				datasets: [
					{
						label: title,
						data: values,
						backgroundColor: backgroundColors,
						borderColor: type !== 'pie' ? colors[0] : undefined,
						borderWidth: 1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: type === 'pie',
						position: 'top' as const
					},
					title: {
						display: !!title,
						text: title
					}
				},
				scales:
					type !== 'pie'
						? {
								x: useTimeScale
									? {
											title: {
												display: !!xAxisLabel,
												text: xAxisLabel
											}
										}
									: {
											title: {
												display: !!xAxisLabel,
												text: xAxisLabel
											},
											type: 'category' as const
										},
								y: {
									beginAtZero: true,
									title: {
										display: !!yAxisLabel,
										text: yAxisLabel
									}
								}
							}
						: undefined
			}
		};

		chartInstance = new Chart(chartElement, chartConfig);
	}

	// Replace the reactive statement with $effect
	$effect(() => {
		if (chartInstance === undefined && data !== undefined && data.length > 0) {
			createChart();
		}
		// console.log('Chart instance:', chartInstance);

		// Handle cleanup within the same effect
		// return () => {
		// 	if (chartInstance) {
		// 		chartInstance.destroy();
		// 	}
		// };
	});
</script>

<div class="chart-container" style="width:100%; height:100%;">
	<canvas bind:this={chartElement}></canvas>
</div>
