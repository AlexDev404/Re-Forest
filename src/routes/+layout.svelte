<script lang="ts">
	import Navigation from '$lib/components/app/navigation.svelte';
	import '../app.css';
</script>

<app class="h-full w-full">
	<content><slot /></content>
	<control class="fixed bottom-2 w-full px-3 z-10"><Navigation /></control>
</app>
