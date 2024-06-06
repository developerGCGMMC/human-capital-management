import moment from 'moment';

export default defineEventHandler(async (event) => {
    const eventStream = createEventStream(event);

    const interval = setInterval(async () => {
        await eventStream.push(moment().format('dddd, MMMM Do YYYY, h:mm:ss A'));
    }, 1000);

    eventStream.onClosed(async () => {
        clearInterval(interval);
        await eventStream.close();
    });

    return eventStream.send();
});