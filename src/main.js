require('./index.html');

import {sendInfo, sendMessage} from "./websocket";
import {auth} from "./validate";

const login = document.querySelector('#login');
const loginInput = document.querySelector('#loginInput');
const closeAside = document.querySelector('.aside__button');
const sendButton = document.querySelector('#sendMessage');
const messageText = document.querySelector('#messageText');
const loginWindow = document.querySelector('.login');

window.addEventListener('load', () => {
    loginWindow.classList.remove('hide');
    loginWindow.classList.remove('none');
});

// убирает поле с ошибкой
loginInput.addEventListener('input', () => {
    const errorSpan = document.querySelector('.login__error');
    errorSpan.classList.remove('visible');
})

// при нажатии ENTER вызывает auth(e)
loginInput.addEventListener('keyup', (e) => {
    e.key === 'Enter' ? auth(e).then((r) => sendInfo(r)) : false;
});

login.addEventListener('click', (e) => {
    auth(e).then((r) => sendInfo(r));
});

// Событие на кнопке ОТПРАВИТЬ
sendButton.addEventListener('click', () => {
    messageText.value.length > 0 ? sendMessage() : false;
});

// При нажатии ENTER отправит сообщение
messageText.addEventListener('keyup', (e) => {
    e.key === 'Enter' && messageText.value.length > 0 ? sendMessage() : false;
});

// Шторка слева
closeAside.addEventListener('click', () => {
    const aside = document.querySelector('.aside');
    aside.classList.contains('hidden') ? aside.classList.remove('hidden') : aside.classList.add('hidden');
});

