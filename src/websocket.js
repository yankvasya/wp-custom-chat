import {routeMessages} from "./message";

const socket = new WebSocket("ws://localhost:8999");
const messageText = document.querySelector('#messageText');
let myId;

socket.addEventListener('message',  function (event) {
    let newMessage;
    function parseMessage(message) {
        let parcedMessage = JSON.parse(message);

        if (typeof parcedMessage !== 'object') {
            parseMessage(parcedMessage);
        } else {
            newMessage = parcedMessage;
        }

        if (newMessage.message !== undefined) {
            const {type, payload} = JSON.parse(newMessage.message);
            newMessage = {
                type: type,
                payload: {
                    message: payload,
                    id: newMessage.id
                }
            }
            // newMessage.type = type;
            // newMessage.payload = payload;
            // delete newMessage.message
        }
    }
    parseMessage(event.data);

    const {type, payload} = newMessage;
    if (myId === undefined) {
        routeMessages(type, null, payload.id).then(r => r);
        myId = payload.id;
        console.warn(`Текущее ID пользователя: ${myId}`);
        return
    }

    routeMessages(type, payload).then(r => {
    })
});

socket.addEventListener('error', function() {
    alert('Соединение закрыто или не может быть открыто');
});

// Отвечает за отправку сообщения и очистку поля
export function sendMessage() {
    const data = {
        type: 'addmessage',
        payload: messageText.value
    };

    socket.send(JSON.stringify(data));
    messageText.value = '';
}

export function sendInfo(info) {
    socket.send(info);
}


