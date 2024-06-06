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
        <span>Daily Time Record</span>
    </div>
</template>