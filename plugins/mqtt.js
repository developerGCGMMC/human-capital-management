// import mqtt from "mqtt";

export default defineNuxtPlugin(nuxtApp => {
    // var mqttClient = mqtt.connect({
    //     host: '1f5b85349a94432f9455035eede4dbbd.s1.eu.hivemq.cloud',
    //     port: 8883,
    //     protocol: 'mqtts',
    //     username: 'hivemq.webclient.1719220142757',
    //     password: 'H1L,w9t5#0@.uMRDaSob'
    // });

    // mqttClient.on('connect', () => {
    //     console.log('Connected');

    //     mqttClient.publish('test_topic', 'From plugin', { qos: 1 });
    // });

    // mqttClient.on('error', (error) => {
    //     console.log(error);
    // });

    // mqttClient.on('message', (topic, message) => {
    //     console.log('Received message:', topic, message.toString());
    // });

    // return {
    //     provide: {
    //         mqttClient: mqttClient
    //     }
    // }
});