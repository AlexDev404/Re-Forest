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
	import { ScrollArea } from '$lib/components/vendor/ui/scroll-area';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/vendor/ui/select/index.js';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/vendor/ui/tabs';
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
	<title>Re:Forest :: Reports Dashboard</title>
</svelte:head>

<page class="block min-h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-y-auto pb-24">
	<main class="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-16 flex flex-col gap-10">
		<header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-border">
			<div>
				<h1 class="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
					<a href="/configure" class="text-primary hover:underline">Settings</a>
					<span class="text-muted-foreground/60 mx-2">/</span>
					Reports Dashboard
				</h1>
				<p class="text-sm text-muted-foreground mt-1 max-w-2xl">
					Analyze trends, monitor growth, and gain insights into your reforestation efforts. 
					This dashboard is available to administrators and environmentalists only.
				</p>
			</div>
			<div class="mt-4 sm:mt-0 flex-shrink-0">
				<Button 
					variant="outline"
					href="/configure/reports/trends"
					class="w-full sm:w-auto bg-background hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground text-sm font-medium rounded-md px-4 py-2 border-input shadow-sm hover:shadow-md transition-all duration-200 ease-out flex items-center justify-center gap-1.5"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
					View Trends Analysis
				</Button>
			</div>
		</header>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
			<!-- Report Controls -->
			<div class="lg:col-span-3 space-y-8">
				<Card class="shadow rounded-xl border border-border">
					<CardHeader class="pb-4">
						<CardTitle class="text-lg font-semibold text-foreground flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>
							Report Configuration
						</CardTitle>
						<CardDescription class="text-xs text-muted-foreground pt-1">Select report type and time frame to generate insights.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-5 pt-2">
						<div class="space-y-1.5">
							<Label for="report-type" class="text-sm font-medium text-foreground">Report Type</Label>
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
					<CardFooter class="border-t border-border pt-5">
						<Button 
							class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md px-5 py-2.5 text-sm shadow hover:shadow-md transition-all duration-200 ease-out flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
							onclick={generateReport}
							disabled={loading}
						>
							{#if loading}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin mr-1.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
								Generating...
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5 group-hover:rotate-[-15deg] transition-transform"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
								Generate Report
							{/if}
						</Button>
					</CardFooter>
				</Card>

				<Card class="shadow rounded-xl border border-border">
					<CardHeader class="pb-4">
						<CardTitle class="text-lg font-semibold text-foreground flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><line x1="16" x2="16" y1="3" y2="21"/><line x1="8" x2="8" y1="3" y2="21"/><line x1="3" x2="21" y1="16" y2="16"/><line x1="3" x2="21" y1="8" y2="8"/></svg>
							Key Metrics Summary
						</CardTitle>
						<CardDescription class="text-xs text-muted-foreground pt-1">A quick overview of important statistics.</CardDescription>
					</CardHeader>
					<CardContent class="space-y-5 pt-2 text-sm">
						{#if data.summary}
							<div class="flex justify-between items-center">
								<p class="text-muted-foreground">Total Trees Planted</p>
								<p class="font-semibold text-foreground text-base">{data.summary.totalTrees?.toLocaleString() ?? 'N/A'}</p>
							</div>
							<div class="flex justify-between items-center">
								<p class="text-muted-foreground">Unique Species Recorded</p>
								<p class="font-semibold text-foreground text-base">{data.summary.totalSpecies?.toLocaleString() ?? 'N/A'}</p>
							</div>
							<div class="flex justify-between items-center">
								<p class="text-muted-foreground">Active Contributors</p>
								<p class="font-semibold text-foreground text-base">{data.summary.activeContributors?.toLocaleString() ?? 'N/A'}</p>
							</div>
							<div class="flex justify-between items-center">
								<p class="text-muted-foreground">Trees Planted (Last 30 Days)</p>
								<p class="font-semibold text-foreground text-base">{data.summary.treesThisMonth?.toLocaleString() ?? 'N/A'}</p>
							</div>
							<div class="space-y-1.5">
								<div class="flex justify-between items-center">
									<p class="text-muted-foreground">Overall Fleet Health</p>
									<p class="font-semibold text-foreground text-base">{data.summary.healthScore ?? 'N/A'}%</p>
								</div>
								<Progress value={data.summary.healthScore} max={100} class="h-2" />
								<p class="text-xs text-muted-foreground/80 text-right">Based on reported conditions</p>
							</div>
						{:else}
							{#each Array(5) as _}
								<div class="space-y-2 animate-pulse py-1.5">
									<div class="h-4 bg-muted rounded w-3/4"></div>
									<div class="h-5 bg-muted rounded w-1/2"></div>
								</div>
							{/each}
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Report Visualization -->
			<div class="lg:col-span-9">
				<Card class="shadow rounded-xl border border-border min-h-[600px]">
					<CardHeader class="border-b border-border pb-4">
						<CardTitle class="text-lg font-semibold text-foreground flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/80"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
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
						<CardDescription class="text-sm text-muted-foreground">
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
					<CardContent class="p-6 pt-8 h-full">
						{#if loading}
							<div class="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin mb-4"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
								<p class="text-lg font-medium">Generating Report...</p>
								<p class="text-sm">Please wait while we gather and process the data.</p>
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
							<div class="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
								{JSON.stringify(chartData)}
								<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15V11"/><line x1="12" y1="7" x2="12.01" y2="7"/></svg>
								<p class="text-lg font-medium">Select Report Options</p>
								<p class="text-sm text-center max-w-md">Please choose a report type and time frame from the configuration panel on the left, then click "Generate Report" to view the data visualization.</p>
							</div>
						{/if}
					</CardContent>
					<CardFooter class="flex justify-between">
						<div class="md:space-x-2">
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
