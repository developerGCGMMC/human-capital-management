<script setup>
    import { useWebSocket } from '@vueuse/core'

    const message = ref();
    const messages = ref([]);

    const { status, data, send } = useWebSocket('ws://'+location.host+'/websocket', {
        autoReconnect: true,
        heartbeat: {
            message: 'ping',
            interval: 60000,
            pongTimeout: 2000,
        }
    });

    const sendData = () => {
        send(message.value);
        messages.value = [...messages.value, message.value];
        message.value = null;
    };

    watch(data, (newData) => {
        messages.value = [...messages.value, newData];
    });
</script>

<template>
    <div class="flex flex-col items-center justify-center w-full h-screen">
        <div class="w-96">
            <span>Status: {{ status }}</span>
            <InputGroup>
                <InputText v-model="message" @keyup.enter="sendData()" />
                <Button @click="sendData()" icon="pi pi-comment" />
            </InputGroup>
            <p v-for="chat in messages">{{ chat }}</p>
        </div>
    </div>
</template>
