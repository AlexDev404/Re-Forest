<script lang="ts">
    import { page } from '$app/stores';

    // Props
    export let roles: number[] = []; // Array of allowed role IDs
    export let redirect = false;     // Whether to redirect non-authorized users

    // Derived state
    $: user = $page.data.user;
    $: hasAccess = user && roles.includes(user.Role);
    
    // Handle redirect if needed
    $: if (redirect && !hasAccess && browser) {
        goto('/');
    }

    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
</script>

{#if hasAccess}
    <slot />
{:else if !redirect}
    <slot name="fallback">
        <div class="p-4 rounded bg-muted">
            <p class="text-center text-muted-foreground">You don't have permission to access this content.</p>
        </div>
    </slot>
{/if}
