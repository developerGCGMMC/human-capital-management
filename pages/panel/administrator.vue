<script setup>
    definePageMeta({
        layout: 'panel'
    });

    const user = useSupabaseUser();

    onMounted(async () => {
        watchEffect(async () => {
            if(!user.value) {
                await navigateTo('/');
            }
        });
    });
</script>
<template>
    <div>
        <span>Administrator Panel</span>
    </div>
</template>