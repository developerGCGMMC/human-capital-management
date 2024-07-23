<script setup>
    // import mqtt from "mqtt";

    // const mqttClient = mqtt.connect({
    //     host: '1f5b85349a94432f9455035eede4dbbd.s1.eu.hivemq.cloud',
    //     port: 8883,
    //     protocol: 'mqtts',
    //     username: 'hivemq.webclient.1719220142757',
    //     password: 'H1L,w9t5#0@.uMRDaSob'
    // });

    const data = ref([]);

    const { $mqttClient } = useNuxtApp();

    $mqttClient.subscribe('test_topic', { qos: 1 }, (err) => {
        if(err) {
            console.error('Error subscribing to topic:', err);
        } else {
            console.log('Subscribed to topic successfully');
        }
    });

    $mqttClient.publish('test_topic', 'Hello, HiveMQ!', { qos: 1 }, (err) => {
        if(err) {
            console.error('Error publishing message:', err);
        } else {
            console.log('Message published successfully');
        }
    });

    const publishMQTT = () => {
        // try {
        //     const result = $mqttClient.publish('cluster/messages/node7', 'Hello, HiveMQ!', { qos: 1 });
        //     console.log('Message published:', result);
        // } catch (error) {
        //     console.error('Error publishing message:', error);
        // }

        $mqttClient.publish('test_topic', '-------------------- HiveMQ!', { qos: 1 }, (err) => {
            if(err) {
                console.error('Error publishing message:', err);
            } else {
                console.log('Message published successfully');
            }
        });
    }

    onMounted(() => {

    });
</script>
<template>
    <div class="flex flex-col items-center justify-center w-full h-screen">
        <p>MQTT Test</p>
        <p>{{ data }}</p>
        <Button @click="publishMQTT" label="Publish" />
    </div>
</template>