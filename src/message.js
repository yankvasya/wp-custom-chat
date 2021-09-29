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
            lastElement === null || lastElement.classList.contains('friend')
                ? templateFull(Object.assign(parsedCookie, parsedMessage))
                : template(Object.assign(parsedCookie, parsedMessage));

        // Если последнее сообщение было от друга или сообщения вовсе отсутствуют, то создай li и закинь его в ul
        // В ином случае запушь его в последнее ul от меня
        if (lastElement === null || lastElement.classList.contains('friend')) {
            messageItem.classList.add('me');
            messageContainer.appendChild(messageItem);
        } else {
            lastElement.insertAdjacentHTML('beforeend', html)
        }
    } else {
        // Если сообщения вовсе отсутствуют или последнее было от МЕНЯ, то используется templateFull(с никнеймом и именем)
        // В ином случае используется html = обычный template
        html =
            lastElement === null || lastElement.classList.contains('me')
                ? templateFull(Object.assign({nickname: 'Друг'}, parsedMessage))
                : template(Object.assign({nickname: 'Друг'}, parsedMessage));

        // Если последнее сообщение было от меня или сообщения вовсе отсутствуют,, то создай li и закинь его в ul
        // В ином случае запушь его в последнее ul от меня
        if (lastElement === null || lastElement.classList.contains('me')) {
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
    return new Promise((resolve, reject) => {
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
        console.log('Себя в список онлайна добавили')
    })
}

export function addFriendInfo(message) {
    return new Promise((resolve, reject) => {
        let parsedMessage;
        parse(message);
        anotherInfo.friends.push(parsedMessage);

        refreshOnline(anotherInfo.friends).then((r) => {
            console.log('12313')
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

async function refreshOnline(friends, number){
    return new Promise((resolve, reject) => {
        const num = friends !== undefined && friends !== null ? friends.length : number;
        console.log(num)

        const onlineNumbers = document.querySelector('.chat__members');
        const text = ['участник', 'участника', 'участников'];

        function variables(num) {
            if (num === 1 && num === 21) {
                onlineNumbers.innerText = `${num} ${text[0]}`; // -К
                resolve(text[0]);
            }
            if (num > 1 && num < 5 && 21 < num < 25) {
                onlineNumbers.innerText = `${num} ${text[1]}`; // -А
                resolve(text[1]);
            }
            if (num > 10 && num < 20 && num >= 25 && num === 0) {
                onlineNumbers.innerText = `${num} ${text[2]}`; // -ОВ
                resolve(text[2]);
            }
        }

        variables(num);
    })
}
