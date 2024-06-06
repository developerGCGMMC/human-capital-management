const room = 'test_room';

export default defineWebSocketHandler({
    open(peer) {
        console.log('[WS] Open:', peer);

        peer.subscribe(room);
        // peer.publish(room, peer+' joined the room');
    },
    close(peer, event) {
        console.log('[WS] Close:', peer, event);

        // peer.publish(room, peer+' left the room');
        peer.unsubscribe(room);
    },
    error(peer, error) {
        console.log('[WS] Error:', peer, error);
    },
    message(peer, message) {
        console.log('[WS] Message:', peer, message);

        // if(message.text().includes('ping')) {
        //     peer.send('pong');
        // }

        peer.publish(room, message.text());
    }
});