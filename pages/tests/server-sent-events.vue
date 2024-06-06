<script setup>
    const data = ref();

    onMounted(async () => {
        let eventSource = new EventSource('//'+location.host+'/server-sent-events');

        eventSource.onmessage = (event) => {
            data.value = event.data;
        };
    });
</script>
<template>
    <div class="flex items-center justify-center w-full h-screen">
        <p>{{ data }}</p>
    </div>
</template>