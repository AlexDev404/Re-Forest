<script lang="ts">
	import Chart from '$lib/components/charts/chart.svelte';
	import { Button } from '$lib/components/vendor/ui/button/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/vendor/ui/card/index.js';
	import { Label } from '$lib/components/vendor/ui/label/index.js';
	import { Progress } from '$lib/components/vendor/ui/progress/index.js';
	import { ScrollArea } from '$lib/components/vendor/ui/scroll-area/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/vendor/ui/select/index.js';
	import {
		Tabs,
		TabsContent,
		TabsList,
		TabsTrigger
	} from '$lib/components/vendor/ui/tabs/index.js';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	let selectedReport = $state('tree-health');
	let selectedTimeFrame = $state('all-time');
	let chartData: any = $state(null);
	let loading = $state(false);

	async function generateReport() {
		loading = true;
		try {
			const response = await fetch(
				`/api/reports?type=${selectedReport}&timeFrame=${selectedTimeFrame}`
			);
			if (response.ok) {
				chartData = await response.json();
			} else {
				console.error('Failed to fetch report data');
			}
		} catch (error) {
			console.error('Error generating report:', error);
		} finally {
			loading = false;
		}
	}

	// Pre-load first report on mount
	onMount(() => {
		generateReport();
	});
</script>

<svelte:head>
	<title>Re:Forest :: Reports</title>
</svelte:head>

<page class="pb-20">
	<main class="container mx-auto p-4">
		<div class="mb-6 flex flex-col items-start justify-between sm:flex-row">
			<div>
				<h1 class="text-2xl font-semibold">
					<a href="/configure">Settings</a> <span> &gt; Reports Dashboard</span>
				</h1>
				<br />
				<p class="text-muted-foreground">
					This dashboard is available to administrators and environmentalists only.
				</p>
			</div>
			<div class="mt-4 sm:mt-0">
				<Button variant="outline" href="/configure/reports/trends">View Trends Analysis</Button>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
			<!-- Report Controls -->
			<div class="lg:col-span-1">
				<Card class="mb-6">
					<CardHeader>
						<CardTitle>Report Settings</CardTitle>
						<CardDescription>Select the report type and time frame</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="report-type">Report Type</Label>
							<Select type="single" bind:value={selectedReport}>
								<SelectTrigger id="report-type">
									<span
										>{selectedReport === 'tree-health'
											? 'Tree Health Distribution'
											: selectedReport === 'trees-by-species'
												? 'Trees by Species'
												: selectedReport === 'planting-activity'
													? 'Planting Activity'
													: selectedReport === 'user-contributions'
														? 'User Contributions'
														: selectedReport === 'tree-growth'
															? 'Tree Growth'
															: 'Select report type'}</span
									>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="tree-health">Tree Health Distribution</SelectItem>
									<SelectItem value="trees-by-species">Trees by Species</SelectItem>
									<SelectItem value="planting-activity">Planting Activity</SelectItem>
									<SelectItem value="user-contributions">User Contributions</SelectItem>
									<SelectItem value="tree-growth">Tree Growth</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div class="space-y-2">
							<Label for="time-frame">Time Frame</Label>
							<Select type="single" bind:value={selectedTimeFrame}>
								<SelectTrigger id="time-frame">
									<span
										>{selectedTimeFrame === 'week'
											? 'Last 7 days'
											: selectedTimeFrame === 'month'
												? 'Last 30 days'
												: selectedTimeFrame === 'year'
													? 'Last 365 days'
													: selectedTimeFrame === 'all-time'
														? 'All Time'
														: 'Select time frame'}</span
									>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="week">Last 7 days</SelectItem>
									<SelectItem value="month">Last 30 days</SelectItem>
									<SelectItem value="year">Last 365 days</SelectItem>
									<SelectItem value="all-time">All Time</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
					<CardFooter>
						<Button class="w-full" onclick={generateReport}>Generate Report</Button>
					</CardFooter>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Stats Summary</CardTitle>
						<CardDescription>Key metrics at a glance</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						{#if data.summary}
							<div>
								<p class="text-sm font-medium">Total Trees</p>
								<p class="text-2xl font-bold">{data.summary.totalTrees}</p>
							</div>
							<div>
								<p class="text-sm font-medium">Total Species</p>
								<p class="text-2xl font-bold">{data.summary.totalSpecies}</p>
							</div>
							<div>
								<p class="text-sm font-medium">Active Contributors</p>
								<p class="text-2xl font-bold">{data.summary.activeContributors}</p>
							</div>
							<div>
								<p class="text-sm font-medium">Trees Planted This Month</p>
								<p class="text-2xl font-bold">{data.summary.treesThisMonth}</p>
							</div>
							<div>
								<p class="text-sm font-medium">Overall Health</p>
								<Progress value={data.summary.healthScore} max={100} class="my-2" />
								<p class="text-sm">{data.summary.healthScore}% Excellent/Good</p>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Loading summary data...</p>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Report Visualization -->
			<div class="lg:col-span-3">
				<Card>
					<CardHeader>
						<CardTitle>
							{#if selectedReport === 'tree-health'}
								Tree Health Distribution
							{:else if selectedReport === 'trees-by-species'}
								Trees by Species
							{:else if selectedReport === 'planting-activity'}
								Planting Activity Over Time
							{:else if selectedReport === 'user-contributions'}
								Top Contributors
							{:else if selectedReport === 'tree-growth'}
								Tree Growth Statistics
							{:else}
								Report Visualization
							{/if}
						</CardTitle>
						<CardDescription>
							{#if selectedTimeFrame === 'week'}
								Last 7 days
							{:else if selectedTimeFrame === 'month'}
								Last 30 days
							{:else if selectedTimeFrame === 'year'}
								Last 365 days
							{:else}
								All time data
							{/if}
						</CardDescription>
					</CardHeader>
					<CardContent class="flex h-[500px] items-center justify-center">
						{#if loading}
							<div class="text-center">
								<div
									class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"
								></div>
								<p>Loading report data...</p>
							</div>
						{:else if chartData}
							<Tabs value="chart" class="h-full w-full">
								<TabsList class="grid w-full grid-cols-2">
									<TabsTrigger value="chart">Chart</TabsTrigger>
									<TabsTrigger value="table">Table</TabsTrigger>
								</TabsList>

								<TabsContent value="chart" class="h-[400px]">
									{#if selectedReport === 'tree-health' || selectedReport === 'trees-by-species'}
										<div class="h-full">
											<Chart
												type="pie"
												data={chartData.data}
												title={chartData.title}
												colors={chartData.colors || ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107']}
											/>
										</div>
									{:else if selectedReport === 'planting-activity'}
										<div class="h-full">
											<Chart
												type="line"
												data={chartData.data}
												title={chartData.title}
												xAxisLabel={chartData.columns[0]}
												yAxisLabel="Trees Planted"
											/>
										</div>
									{:else}
										<div class="h-full">
											<Chart type="bar" data={chartData.data} title={chartData.title} />
										</div>
									{/if}
								</TabsContent>

								<TabsContent value="table">
									<div class="overflow-x-auto">
										<ScrollArea class="h-[400px] w-full">
											<table class="w-full border-collapse">
												<thead>
													<tr>
														<th class="border-b px-4 py-2 text-left">{chartData.columns[0]}</th>
														<th class="border-b px-4 py-2 text-right">{chartData.columns[1]}</th>
													</tr>
												</thead>
												<tbody>
													{#each chartData.data as item}
														<tr>
															<td class="border-b px-4 py-2 text-left">{item.label}</td>
															<td class="border-b px-4 py-2 text-right">{item.value}</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</ScrollArea>
									</div>
								</TabsContent>
							</Tabs>
						{:else}
							<div class="text-center text-muted-foreground">
								<p>No data available. Please generate a report.</p>
							</div>
						{/if}
					</CardContent>
					<CardFooter class="flex justify-between">
						<div class="space-x-2">
							<Button variant="outline" onclick={() => window.print()}>Print Report</Button>
							<Button
								variant="outline"
								onclick={() => {
									if (chartData) {
										window.open(`/api/reports/export?type=${selectedReport}&format=csv`, '_blank');
									}
								}}>Export CSV</Button
							>
						</div>
						{#if chartData}
							<p class="text-sm text-muted-foreground">
								Generated: {new Date().toLocaleString()}
							</p>
						{/if}
					</CardFooter>
				</Card>
			</div>
		</div>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
