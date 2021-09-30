let personInfo = {
    id: 0,
    nickname: ''
};

const anotherInfo = {
    friends: [

    ]
};

export function addMessage(message, id) {
    const messageItem = document.createElement('li');
    const messageContainer = document.querySelector('#messageContainer');
    const parsedMessage = JSON.parse(message);

    const currentTime = `${new Date().getHours()}:${new Date().getMinutes()}`;
    const currentFullDate = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}T${currentTime}`;
    const fullTime = {
        fullDate: currentFullDate,
        currentTime: currentTime
    };

    const lastElement = messageContainer.lastElementChild;
    const newCookie = `{"${document.cookie.split('; ').join('" "').split('=').join('":"').split(' ').join(', ')}"}`;
    const parsedCookie = JSON.parse(newCookie);

    const source = document.querySelector('#addMessageTemplate').innerHTML;
    const template = Handlebars.compile(source);
    const sourceFull =  document.querySelector('#addFullMessageTemplate').innerHTML;
    const templateFull = Handlebars.compile(sourceFull);
    let html;

    messageItem.classList.add('member');

    // Если привязанное ID к сообщению === моему ID, то оно от меня
    // В ином случае оно от друга
    if (parsedMessage.id === id) {
        // Если сообщения вовсе отсутствуют или последнее было от друга, то используется templateFull(с никнеймом и именем)
        // В ином случае используется html = обычный template
        html =
            lastElement === null || lastElement.classList.contains('friend') || lastElement.classList.contains('join')
                ? templateFull(Object.assign(parsedCookie, parsedMessage, fullTime))
                : template(Object.assign(parsedCookie, parsedMessage, fullTime));

        // Если последнее сообщение было от друга или сообщения вовсе отсутствуют, то создай li и закинь его в ul
        // В ином случае запушь его в последнее ul от меня
        if (lastElement === null || lastElement.classList.contains('friend') || lastElement.classList.contains('join')) {
            messageItem.classList.add('me');
            messageContainer.appendChild(messageItem);
        } else {
            lastElement.insertAdjacentHTML('beforeend', html)
        }
    } else {
        // Если сообщения вовсе отсутствуют или последнее было от МЕНЯ, то используется templateFull(с никнеймом и именем)
        // В ином случае используется html = обычный template
        // const currentNickname = anotherInfo.forEach((el) => {
        //     console.log(el)
        // })
        html =
            lastElement === null || lastElement.classList.contains('me') || lastElement.classList.contains('join')
                ? templateFull(Object.assign({nickname: 'Друг'}, parsedMessage, fullTime))
                : template(Object.assign({nickname: 'Друг'}, parsedMessage, fullTime));

        // Если последнее сообщение было от меня или сообщения вовсе отсутствуют,, то создай li и закинь его в ul
        // В ином случае запушь его в последнее ul от меня
        if (lastElement === null || lastElement.classList.contains('me') || lastElement.classList.contains('join')) {
            messageItem.classList.add('friend');
            messageContainer.appendChild(messageItem);
        } else {
            lastElement.insertAdjacentHTML('beforeend', html)
        }
    }

    messageItem.innerHTML = html;
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Мне кажется, стоило бы использовать sessionStorage, нежели Cookie или localStorage
export function giveCookieId(id) {
    // Выжидает какой никнейм ведет пользователь, чтобы в далнейшем сообщить об этом другим пользователям уже в websocket.js
    return new Promise((resolve) => {
        document.cookie = `id=${id}`
        personInfo.id = Number(id);

        const checkNickName = setInterval(() => {
            if (personInfo.nickname !== undefined && personInfo.nickname.length !== 0) {
                clearInterval(checkNickName);
                resolve(JSON.stringify(personInfo));
            }
        }, 500);
    });
}

export function giveNickname(nickname) {
    personInfo.nickname = nickname;
    refreshOnline(null,1).then(r => {
        console.log('Себя в список онлайна добавили', r)
    })
}

export function addFriendInfo(message) {
    return new Promise((resolve) => {
        let parsedMessage;
        parse(message);
        anotherInfo.friends.push(parsedMessage);
        joinedTheChat(parsedMessage.nickname);

        refreshOnline(anotherInfo.friends).then((r) => {
            resolve(r, 'Значение текущего онлайна обновлено;');
        });

        function parse(mess) {
            parsedMessage = JSON.parse(mess);
            if (typeof parsedMessage !== 'object') {
                parse(parsedMessage);
            } else {
                return parsedMessage;
            }
        }
    })
}

function joinedTheChat(nickname) {
    const messageContainer = document.querySelector('#messageContainer');
    const div = `<li class="member join"><div class="member__join"><div>${nickname} присоединился к чату</div></div></li>`;
    messageContainer.insertAdjacentHTML('beforeend', div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

async function refreshOnline(friends, number){
    return new Promise((resolve) => {
        const num = friends !== undefined && friends !== null ? friends.length : number;
        const onlineNumbers = document.querySelector('.chat__members');
        const text = ['участник', 'участника', 'участников'];


        function variables(num) {
            if (num === 1 || num === 21) {
                onlineNumbers.innerText = `${num} ${text[0]}`; // -К
                resolve(text[0]);
            }
            if (num > 1 || num < 5 || 21 < num < 25) {
                onlineNumbers.innerText = `${num} ${text[1]}`; // -А
                resolve(text[1]);
            }
            if (num > 10 || num < 20 || num >= 25 || num === 0) {
                onlineNumbers.innerText = `${num} ${text[2]}`; // -ОВ
                resolve(text[2]);
            }
        }

        variables(num);
    })
}
