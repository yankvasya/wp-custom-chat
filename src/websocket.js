import {addMessage, giveCookieId, addFriendInfo } from "./message";

const socket = new WebSocket("ws://localhost:8999");
const messageText = document.querySelector('#messageText');
let myId;

socket.addEventListener('message',  function (event) {
    if (event.data.includes('nickname')) {
        addFriendInfo(event.data).then(r => {
            console.log(r, 'websocket.js, addFriendInfo|');
        });
    } else {
        if (myId !== undefined) {
            addMessage(event.data, myId);
        } else {
            myId = Number(event.data);
            giveCookieId(event.data).then(info => {
                socket.send(info.toString());
            });
            console.warn(`Текущее ID пользователя: ${myId}`);
        }
    }
});

socket.addEventListener('error', function() {
    alert('Соединение закрыто или не может быть открыто');
});

// Отвечает за отправку сообщения и очистку поля
export function sendMessage() {
    socket.send(messageText.value);
    messageText.value = '';
}



