import {addMessage, giveCookieId, addFriendInfo } from "./message";

const socket = new WebSocket("ws://localhost:8999");
const messageText = document.querySelector('#messageText');
const sendButton = document.querySelector('#sendMessage');
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
                socket.send(info);
            });
            console.warn(`Текущее ID пользователя: ${myId}`);
        }
    }
});

socket.addEventListener('error', function() {
    alert('Соединение закрыто или не может быть открыто');
});

// Отвечает за отправку сообщения и очистку поля
function sendMessage() {
    socket.send(messageText.value);
    messageText.value = '';
}

// Событие на кнопке ОТПРАВИТЬ
sendButton.addEventListener('click', () => {
    if (messageText.value.length > 0) {
        sendMessage()
    }
});

// При нажатии ENTER отправит сообщение
messageText.addEventListener('keyup', (e) => {
    if(e.key === 'Enter' && messageText.value.length > 0) {
        sendMessage();
    }
});


