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

<page class="block h-fit overflow-y-auto pb-20">
	<main class="mx-6 my-10 flex flex-col items-start gap-12">
		<div>
			<h1 class="text-2xl font-semibold">
				<a href="/configure">Settings</a>
				<span> &gt; <a href="/configure/reports">Reports Dashboard</a></span>
				<span> &gt; Trend Analysis</span>
			</h1>
			<p class="mb-4 text-muted-foreground">Historical tree planting data analysis</p>
		</div>
		<Card class="w-full">
			<CardHeader>
				<CardTitle>Tree Planting Trend</CardTitle>
				<CardDescription>View tree planting activity over time</CardDescription>
				<div class="mt-2 flex space-x-2">
					<Button
						variant={timeFrame === 'year' ? 'default' : 'outline'}
						size="sm"
						onclick={() => changeTimeFrame('year')}
					>
						Last Year
					</Button>
					<Button
						variant={timeFrame === 'all-time' ? 'default' : 'outline'}
						size="sm"
						onclick={() => changeTimeFrame('all-time')}
					>
						All Time
					</Button>
				</div>
			</CardHeader>
			<CardContent class="flex h-[500px] items-center justify-center">
				{#if loading}
					<div class="text-center">
						<div
							class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"
						></div>
						<p>Loading trend data...</p>
					</div>
				{:else if trendData}
					<Tabs value="chart" class="w-full">
						<TabsList class="grid w-full grid-cols-2">
							<TabsTrigger value="chart">Chart</TabsTrigger>
							<TabsTrigger value="table">Table</TabsTrigger>
						</TabsList>

						<TabsContent value="chart" class="h-[400px]">
							<div class="h-full">
								<Chart
									type="line"
									data={trendData.data}
									title={trendData.title}
									xAxisLabel="Date"
									yAxisLabel="Trees Planted"
								/>
							</div>
						</TabsContent>

						<TabsContent value="table">
							<div class="overflow-x-auto">
								<ScrollArea class="h-[400px] w-full">
									<table class="w-full border-collapse">
										<thead>
											<tr>
												<th class="border-b px-4 py-2 text-left">{trendData.columns[0]}</th>
												<th class="border-b px-4 py-2 text-right">{trendData.columns[1]}</th>
											</tr>
										</thead>
										<tbody>
											{#each trendData.data as item}
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
						<p>No trend data available.</p>
					</div>
				{/if}
			</CardContent>
			<CardFooter class="flex justify-between">
				<Button
					variant="outline"
					onclick={() => {
						if (trendData) {
							window.open(
								`/api/reports/export?type=planting-activity&timeFrame=${timeFrame}&format=csv`,
								'_blank'
							);
						}
					}}>Export CSV</Button
				>
				{#if trendData}
					<p class="text-sm text-muted-foreground">Generated: {new Date().toLocaleString()}</p>
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
