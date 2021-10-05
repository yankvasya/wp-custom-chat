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

// просит разрешение на получение данных по кол-ву пользователей, текущему онлайну
export function getDataBaseInfo() {
    socket.send(JSON.stringify({type: "dataBaseInfo", payload: {id: myId}}));
}

// отправляет от лица олдов данные по текущему онлайну.
// потом нужно будет отправлять только от имени одной персоны.
export function sendDataBaseInfo(info, id) {
    const {friends, online} = info;
    const data = {
        type: 'takeDataBaseInfo',
        payload: {
            friends: friends,
            online: online,
            length: friends.length,
            id: id
        }
    }
    friends.length > 0 ? socket.send(JSON.stringify(data)) : null;
}





