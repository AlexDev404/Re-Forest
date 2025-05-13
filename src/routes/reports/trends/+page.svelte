<script lang="ts">
    import RoleGuard from '$lib/components/app/role-guard.svelte';
    import Chart from '$lib/components/charts/chart.svelte';
    import { Button } from '$lib/components/vendor/ui/button/index.js';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/vendor/ui/card/index.js';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/vendor/ui/tabs/index.js';
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

<page class="pb-20">
    <RoleGuard roles={[1, 2]} redirect={true}>
        <main class="container mx-auto p-4">
            <h1 class="text-3xl font-bold mb-6 text-primary">Trend Analysis</h1>
            <p class="mb-4 text-muted-foreground">Historical tree planting data analysis</p>
            
            <Card>
                <CardHeader>
                    <CardTitle>Tree Planting Trend</CardTitle>
                    <CardDescription>
                        View tree planting activity over time
                    </CardDescription>
                    <div class="flex space-x-2 mt-2">
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
                <CardContent class="h-[500px] flex items-center justify-center">
                    {#if loading}
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
                                        yAxisLabel="Trees Planted" />
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="table">
                                <div class="overflow-x-auto">
                                    <table class="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th class="text-left py-2 px-4 border-b">{trendData.columns[0]}</th>
                                                <th class="text-right py-2 px-4 border-b">{trendData.columns[1]}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#each trendData.data as item}
                                                <tr>
                                                    <td class="text-left py-2 px-4 border-b">{item.label}</td>
                                                    <td class="text-right py-2 px-4 border-b">{item.value}</td>
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
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
                    <Button variant="outline" onclick={() => {
                        if (trendData) {
                            window.open(`/api/reports/export?type=planting-activity&timeFrame=${timeFrame}&format=csv`, '_blank');
                        }
                    }}>Export CSV</Button>
                    {#if trendData}
                        <p class="text-sm text-muted-foreground">Generated: {new Date().toLocaleString()}</p>
                    {/if}
                </CardFooter>
            </Card>
        </main>
    </RoleGuard>
</page>

<style>
    :global(body) {
        overflow: auto;
    }
</style>
