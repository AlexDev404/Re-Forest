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
	import { ScrollArea } from '$lib/components/vendor/ui/scroll-area';
	import {
		Tabs,
		TabsContent,
		TabsList,
		TabsTrigger
	} from '$lib/components/vendor/ui/tabs/index.js';
	import { ArrowLeft, BarChart2, CalendarDays, Download } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let trendData: any = null;
	let loading = false;
	let timeFrame: 'year' | 'all-time' = 'all-time';

	async function fetchTrendData() {
		loading = true;
		try {
			const response = await fetch(`/api/reports?type=planting-activity&timeFrame=${timeFrame}`);
			if (response.ok) {
				trendData = await response.json();
			} else {
				console.error('Failed to fetch trend data');
			}
		} catch (error) {
			console.error('Error fetching trend data:', error);
		} finally {
			loading = false;
		}
	}

	// Change the time frame and refetch data
	function changeTimeFrame(newTimeFrame: 'year' | 'all-time') {
		timeFrame = newTimeFrame;
		fetchTrendData();
	}

	onMount(() => {
		fetchTrendData();
	});
</script>

<svelte:head>
	<title>Re:Forest :: Trend Analysis</title>
</svelte:head>

<page class="min-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900">
	<main class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8">
		<header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-border">
			<div>
				<h1 class="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
					<a href="/configure" class="text-primary hover:underline">Settings</a>
					<span class="text-muted-foreground/60 mx-2">/</span>
					<a href="/configure/reports" class="text-primary hover:underline">Reports Dashboard</a>
					<span class="text-muted-foreground/60 mx-2">/</span>
					Trend Analysis
				</h1>
				<p class="mt-1 text-sm text-muted-foreground max-w-2xl">
					Analyze historical tree planting data to identify patterns and growth over time.
				</p>
			</div>
			<Button href="/configure/reports" variant="outline" class="w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0 bg-background hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground text-sm font-medium rounded-md px-4 py-2 border-input shadow-sm hover:shadow-md transition-all duration-200 ease-out flex items-center justify-center gap-1.5">
				<ArrowLeft class="mr-1 h-4 w-4" />
				Back to Reports
			</Button>
		</header>

		<Card class="w-full shadow rounded-xl border border-border">
			<CardHeader class="border-b border-border">
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<CardTitle class="text-xl font-semibold flex items-center">
							<BarChart2 class="mr-3 h-6 w-6 text-primary" />
							Tree Planting Trend
						</CardTitle>
						<CardDescription class="mt-1 text-sm text-slate-500 dark:text-slate-400">
							View tree planting activity over selected time frames.
						</CardDescription>
					</div>
					<div class="flex space-x-2 mt-4 sm:mt-0">
						<Button
							variant={timeFrame === 'year' ? 'default' : 'outline'}
							size="sm"
							onclick={() => changeTimeFrame('year')}
							class="flex items-center"
						>
							<CalendarDays class="mr-2 h-4 w-4" />
							Last Year
						</Button>
						<Button
							variant={timeFrame === 'all-time' ? 'default' : 'outline'}
							size="sm"
							onclick={() => changeTimeFrame('all-time')}
							class="flex items-center"
						>
							<CalendarDays class="mr-2 h-4 w-4" />
							All Time
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent class="p-6 min-h-[550px] flex items-center justify-center">
				{#if loading}
					<div class="text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
						<div
							class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
						></div>
						<p class="text-lg font-medium">Loading trend data...</p>
						<p class="text-sm">Please wait while we fetch the latest information.</p>
					</div>
				{:else if trendData && trendData.data && trendData.data.length > 0}
					<Tabs value="chart" class="w-full">
						<TabsList class="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 rounded-md p-1">
							<TabsTrigger value="chart" class="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-sm px-3 py-1.5 text-sm font-medium">Chart View</TabsTrigger>
							<TabsTrigger value="table" class="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-sm px-3 py-1.5 text-sm font-medium">Table View</TabsTrigger>
						</TabsList>

						<TabsContent value="chart" class="pt-6 h-[450px]">
							<div class="h-full p-4 border rounded-lg bg-background dark:bg-slate-800/30 shadow-inner">
								<Chart
									type="line"
									data={trendData.data}
									title={trendData.title}
									xAxisLabel="Date"
									yAxisLabel="Trees Planted"
									ariaLabel={`Line chart showing ${trendData.title}`}
								/>
							</div>
						</TabsContent>

						<TabsContent value="table" class="pt-6">
							<ScrollArea class="h-[450px] w-full border rounded-lg bg-background dark:bg-slate-800/30 shadow-inner">
								<table class="w-full text-sm">
									<thead class="sticky top-0 bg-slate-100 dark:bg-slate-700/60 z-10">
										<tr>
											<th class="border-b border-border px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">{trendData.columns[0]}</th>
											<th class="border-b border-border px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">{trendData.columns[1]}</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-border">
										{#each trendData.data as item, i (item.label + i)}
											<tr class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
												<td class="px-4 py-3 text-left text-slate-600 dark:text-slate-300">{item.label}</td>
												<td class="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{item.value}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</ScrollArea>
						</TabsContent>
					</Tabs>
				{:else}
					<div class="text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
						<BarChart2 class="h-16 w-16 mb-4 text-slate-400 dark:text-slate-500" />
						<p class="text-lg font-medium">No trend data available.</p>
						<p class="text-sm">There is currently no data to display for the selected period.</p>
						<Button variant="outline" class="mt-6" onclick={fetchTrendData} disabled={loading}>
							Try Refreshing Data
						</Button>
					</div>
				{/if}
			</CardContent>
			<CardFooter class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
				<Button
					variant="outline"
					onclick={() => {
						if (trendData && trendData.data && trendData.data.length > 0) {
							window.open(
								`/api/reports/export?type=planting-activity&timeFrame=${timeFrame}&format=csv`,
								'_blank'
							);
						}
					}}
					disabled={!trendData || !trendData.data || trendData.data.length === 0 || loading}
					class="w-full sm:w-auto"
				>
					<Download class="mr-2 h-4 w-4" />
					Export CSV
				</Button>
				{#if trendData}
					<p class="text-sm text-slate-500 dark:text-slate-400">
						Last generated: {new Date().toLocaleString()}
					</p>
				{/if}
			</CardFooter>
		</Card>
	</main>
</page>

<style>
	:global(body) {
		overflow: auto;
	}
</style>
