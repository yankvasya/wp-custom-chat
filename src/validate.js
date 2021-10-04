// Валидатный никнейм?
import {giveNickname} from "./message";

const container = document.querySelector('.container');

// Полный цикл авторизации
export function auth(e) {
    return new Promise((resolve) => {
        e.preventDefault();
        const errorSpan = document.querySelector('.login__error');
        const login = document.querySelector('#login');
        const nickname = login.previousElementSibling.children[0].value;

        const nickIsValid = validateNickname(nickname);

        if (nickIsValid === true) {
            const login = document.querySelector('#login');
            login.disabled = true;
            animateLoading(nickname)
                .then((nickname) => {
                    // Когда загрузка пройдет, вернется resolve и запустится then
                    giveNickname(nickname);
                    const loginWindow = document.querySelector('.login');
                    const data = {
                        type: 'join',
                        payload: {
                            nickname: nickname,
                            avatar: sessionStorage.getItem('recent-image') || 'https://i.ibb.co/znS6VSk/pngwing-com.png'
                        }
                    }
                    document.cookie = `nickname=${nickname}`;
                    loginWindow.classList.add('hide');
                    container.classList.remove('hide');
                    setTimeout(() => {
                        loginWindow.classList.add('none');
                        container.classList.add('visible');
                    }, 300);
                    resolve(JSON.stringify(data));
                });

        } else {
            errorSpan.innerHTML = `*- ${nickIsValid}`;
            errorSpan.classList.add('visible');
        }
    });
}

// Валидный ли никнейм?
function validateNickname(nickname) {
    let isValide = true;
    const specSymbols = ['[', ']', '{', '}', ',', '.', '=', '+', '$', '#', '"', '!', ';', ':', '<', '>', '?', `'`, '|', '*', '&', '№'];

    nickname === '' ? isValide = 'Пустое поле!' : null;
    !isNaN(Number([...nickname][0])) ? isValide = 'Никнейм не должен начинаться с цифры!' : null;
    nickname.length < 5 ? isValide = 'Меньше 5 знаков!' : null;
    specSymbols.forEach((symbol) => nickname.includes(symbol) ? isValide = 'Содержит недопустимый(-ые) символ(-ы)': null);

    return isValide;
}

// Анимашка загрузки, позже сюда стоит засунуть разного рода проверки
async function animateLoading(nickname) {
    return new Promise((resolve ) => {
        const spinner = document.getElementById('loginLoading');
        let {position, interval, i} = {
            position: 64,
            interval: 10,
            i: 0
        }
        let tId;

        spinner.classList.remove('hide');
        tId = setInterval(() => {
            if (i === 100) {
                spinner.classList.add('hide');
                // routeMessages('nickname',nickname);
                resolve(nickname); // Возвращает никнейм
                clearInterval(tId);
            }
            i++;

            spinner.style.backgroundPositionX= `-${position}px`;
            position < 1792 ? position += 64 : position = 64;
        }, interval);
    });
}
