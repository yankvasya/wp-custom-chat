// Валидатный никнейм?
import {giveNickname} from "./message";
const container = document.querySelector('.container');

// Полный цикл авторизации
export function auth(e) {
    e.preventDefault();
    const errorSpan = document.querySelector('.login__error');
    const login = document.querySelector('#login');
    const nickname = login.previousElementSibling.children[0].value;

    const nickIsValid = validateNickname(nickname);

    if (nickIsValid === true) {
        animateLoading(nickname)
            .then((nickname) => {
                // Когда загрузка пройдет, вернется resolve и запустится then
                document.cookie = `nickname=${nickname}`;
                const loginWindow = document.querySelector('.login');
                loginWindow.classList.add('hide');
                container.classList.remove('hide')
                setTimeout(() => {
                    loginWindow.classList.add('none');
                    container.classList.add('visible');
                }, 300);
            });

    } else {
        errorSpan.innerHTML = `*- ${nickIsValid}`;
        errorSpan.classList.add('visible');
    }
}

// Валидный ли никнейм?
function validateNickname(nickname) {
    try {
        if (nickname === '') {
            return new Error('Пустое поле!');
        }

        if (!isNaN(Number([...nickname][0]))) {
            return new Error('Никнейм не должен начинаться с цифры!');
        }

        if (nickname.length < 5 ) {
            return new Error('Меньше 5 знаков!');
        }

        const specSymbols = ['[', ']', '{', '}', ',', '.', '=', '+', '$', '#', '"', '!', ';', ':', '<', '>', '?', `'`, '|', '*', '&', '№'];

        let spec = true;
        for (const symbol of specSymbols) {
            if (nickname.includes(symbol)) {
                spec = false;
            }
        }

        if (!spec) {
            return new Error('Содержит недопустимый(-ые) символ(-ы)');
        }

        return true;
    } catch (e) {
        return e.message;
    }
}

// Анимашка загрузки, позже сюда стоит засунуть разного рода проверки
async function animateLoading(nickname) {
    return new Promise((resolve ) => {
        let tId;
        let i = 0;
        let position = 64; // start position
        const interval = 10; //10 ms of interval for the setInterval()
        const spinner = document.getElementById('loginLoading');
        spinner.classList.remove('hide');

        tId = setInterval(() => {
            if (i === 100) {
                spinner.classList.add('hide');
                giveNickname(nickname);
                resolve(nickname); // Возвращает никнейм
                clearInterval(tId);
            }
            i++;

            spinner.style.backgroundPositionX= `-${position}px`;
            position < 1792 ? position += 64 : position = 64;
        }, interval);
    });
}
