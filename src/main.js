require('./index.html');

import {sendMessage} from "./websocket";
import {auth} from "./validate";

const login = document.querySelector('#login');
const loginInput = document.querySelector('#loginInput');
const closeAside = document.querySelector('.aside__button');
const sendButton = document.querySelector('#sendMessage');
const messageText = document.querySelector('#messageText');

loginInput.addEventListener('input', () => {
    const errorSpan = document.querySelector('.login__error');
    errorSpan.classList.remove('visible');
})

loginInput.addEventListener('keyup', (e) => {
    e.key === 'Enter' ? auth(e) : false;
});

login.addEventListener('click', (e) => {
    auth(e);
});

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

// Шторка слева
closeAside.addEventListener('click', () => {
    const aside = document.querySelector('.aside');
    if(aside.classList.contains('hidden')) {
        aside.classList.remove('hidden');
    } else {
        aside.classList.add('hidden');
    }
});

