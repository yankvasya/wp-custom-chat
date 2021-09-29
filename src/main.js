require('./index.html')

window.addEventListener('load', () => {
    const login = document.querySelector('#login');
    const errorSpan = document.querySelector('.login__error');
    const loginInput = document.querySelector('#loginInput');

    loginInput.addEventListener('input', () => {
        errorSpan.classList.remove('visible');
    })

    login.addEventListener('click', (e) => {
       e.preventDefault();
        const nickname = login.previousElementSibling.children[0].value;

        const nickIsValid = validateNickname(nickname);

       if (nickIsValid === true) {
           animateLoading(nickname)
               .then((nickname) => {
               // Когда загрузка пройдет, вернется resolve и запустится then
                   document.cookie = `nickname=${nickname}`;
                   const loginWindow = document.querySelector('.login');
                   const container = document.querySelector('.container');
                   loginWindow.classList.add('hide');
                   container.classList.remove('hide')
                   setTimeout(() => {
                       loginWindow.classList.add('none');
                       container.classList.add('visible');
                   }, 300);
                   // console.log(nickname);
           });

       } else {
           errorSpan.innerHTML = `*- ${nickIsValid}`;
           errorSpan.classList.add('visible');
       }
    });

    const closeAside = document.querySelector('.aside__button');
    closeAside.addEventListener('click', () => {
        const aside = document.querySelector('.aside');
        if(aside.classList.contains('hidden')) {
            aside.classList.remove('hidden');
        } else {
            aside.classList.add('hidden');
        }
    });

});

function validateNickname(nickname) {
   try {
       let result = true;

       if (nickname === '') {
           throw new Error('Пустое поле!');
       }

       if (!isNaN(Number([...nickname][0]))) {
           throw new Error('Не должно начинаться с цифры!');
       }

       if (nickname.length < 5 ) {
           throw new Error('Меньше 5 знаков!');
       }

       return result

   } catch (e) {
       return e.message
   }
}

async function animateLoading(nickname) {
    return new Promise((resolve, reject) => {
        let tId;
        let i = 0;
        let position = 64; // start position
        const interval = 35; //100 ms of interval for the setInterval()
        const spinner = document.getElementById('loginLoading');
        spinner.classList.remove('hide');

        tId = setInterval(() => {
            if (i === 100) {
                spinner.classList.add('hide');
                resolve(nickname); // Возвращает никнейм
                clearInterval(tId);
            }
            i++;

            spinner.style.backgroundPositionX= `-${position}px`;
            position < 1792 ? position += 64 : position = 64;
        }, interval);
    });
}
