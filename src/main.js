import {routeMessages} from "./message";

require('./index.html');

import {sendInfo, sendMessage} from "./websocket";
import {auth} from "./validate";

const login = document.querySelector('#login');
const loginInput = document.querySelector('#loginInput');
const closeAside = document.querySelector('.aside__button');
const sendButton = document.querySelector('#sendMessage');
const messageText = document.querySelector('#messageText');
const loginWindow = document.querySelector('.login');
const allMembers = document.querySelector('#allMembers');
const imgOpen = document.querySelector('.profile__img');
const imgClose = document.querySelector('.img__close');
const imgWindow = document.querySelector('.img');
const imgSet = document.querySelector('.img__link');

window.addEventListener('load', (e) => {
    // loginWindow.classList.remove('hide');
    // loginWindow.classList.remove('none');
});

// убирает поле с ошибкой
loginInput.addEventListener('input', () => {
    const errorSpan = document.querySelector('.login__error');
    errorSpan.classList.remove('visible');
})

// при нажатии ENTER вызывает auth(e)
loginInput.addEventListener('keyup', (e) => {
    e.key === 'Enter' && !login.disabled ? auth(e).then((r) => sendInfo(r)) : false;
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

// кол-во участников
allMembers.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('clicked')
});

// Открыть модельку с загрузкой изображения
imgOpen.addEventListener('click', (e) => {
    e.preventDefault()
    imgWindow.classList.remove('none');
    setTimeout(()=> {
        imgWindow.classList.remove('hidden')
    }, 100);
});

// Закрытие модельки с загрузкой изображения
imgClose.addEventListener('click', (e) => {
   e.preventDefault();
    imgCloseFunc()
});

let fileCategoryOpened = false;

imgSet.addEventListener('click', (e) => {
    fileCategoryOpened = true;
});

const testDiv = document.querySelector('.profile__picture');

document.addEventListener('DOMContentLoaded', () => {
    const recentImageDataUrl = sessionStorage.getItem('recent-image');

    if (recentImageDataUrl) {
        testDiv.setAttribute('src', recentImageDataUrl);
        testDiv.src = `${recentImageDataUrl}`;
    }

    // при получение файла, меняет аватар
    imgSet.addEventListener('change', function (e) {
        routeMessages('newAvatar', this).then();
    });
});

// отвечает за закрытие модельки загрузки аватарки
function imgCloseFunc() {
    imgWindow.classList.add('hidden');
    setTimeout(() => {
        imgWindow.classList.add('none');
    }, 500)
}

// Если открыта менюшка с выбором аватарки, то нажатие Escape закроет это меню
document.addEventListener('keyup', (e) => {
    e.key === 'Escape' && !imgWindow.classList.contains('hidden') && !fileCategoryOpened ? imgCloseFunc() : null;
    fileCategoryOpened = false;
});

