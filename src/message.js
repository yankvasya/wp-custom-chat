let personInfo = {
    id: 0,
    nickname: ''
};

let anotherInfo = {
    friends: [],
    allId: [],
    online: 0
};

export function addMessage(message, id) {
    const messageItem = document.createElement('li');
    const messageContainer = document.querySelector('#messageContainer');
    const parsedMessage = {
        message: message
    };
    const currentTime = `${new Date().getHours() >= 10 ? new Date().getHours() : '0' + new Date().getHours()}:${new Date().getMinutes() >= 10 ? new Date().getMinutes() : '0' + new Date().getMinutes()}`;
    const currentFullDate = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}T${currentTime}`;
    const fullTime = {
        fullDate: currentFullDate,
        currentTime: currentTime
    };

    const lastElement = messageContainer.lastElementChild;
    const newCookie = `{"${document.cookie.split('; ').join('" "').split('=').join('":"').split(' ').join(', ')}"}`;
    const parsedCookie = JSON.parse(newCookie);
    parsedCookie.id = Number(parsedCookie.id);

    const source = document.querySelector('#addMessageTemplate').innerHTML;
    const template = Handlebars.compile(source);
    const sourceFull =  document.querySelector('#addFullMessageTemplate').innerHTML;
    const templateFull = Handlebars.compile(sourceFull);
    let html;

    messageItem.classList.add('member');

    // Если привязанное ID к сообщению === моему ID, то оно от меня
    // В ином случае оно от друга
    if (parsedCookie.id=== id) {
        // Если сообщения вовсе отсутствуют или последнее было от друга, то используется templateFull(с никнеймом и именем)
        // В ином случае используется html = обычный template
        html =
            lastElement === null
            || lastElement.classList.contains('friend')
            || lastElement.classList.contains('join')
                ? templateFull(Object.assign(parsedCookie, parsedMessage, fullTime))
                : template(Object.assign(parsedCookie, parsedMessage, fullTime));

        // Если последнее сообщение было от друга или сообщения вовсе отсутствуют, то создай li и закинь его в ul
        // В ином случае запушь его в последнее ul от меня
        if (lastElement === null
            || lastElement.classList.contains('friend')
            || lastElement.classList.contains('join')) {
            messageItem.classList.add('me');
            messageContainer.appendChild(messageItem);
        } else {
            lastElement.insertAdjacentHTML('beforeend', html)
        }
    } else {
        // Если сообщения вовсе отсутствуют или последнее было от МЕНЯ, то используется templateFull(с никнеймом и именем)
        // В ином случае используется html = обычный template
        let whoSend;
        anotherInfo.friends.forEach((el) => {
            if (el.id === id) {
                return whoSend = el.nickname;
            }
        });
        html =
            lastElement === null
            || lastElement.classList.contains('me')
            || lastElement.classList.contains('join')
            || lastElement.firstElementChild.textContent
            !== whoSend
                ? templateFull(Object.assign({nickname: whoSend}, parsedMessage, fullTime))
                : template(Object.assign({nickname: whoSend}, parsedMessage, fullTime));

        // Если последнее сообщение было от меня или сообщения вовсе отсутствуют,, то создай li и закинь его в ul
        // В ином случае запушь его в последнее ul от меня
        if (lastElement === null
            || lastElement.classList.contains('me')
            || lastElement.classList.contains('join')
            || lastElement.firstElementChild.textContent
            !== whoSend) {
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
        }, 250);
    });
}

// При вводе ника обновляется число пользователей в чате
export function giveNickname(nickname) {
       personInfo.nickname = nickname;
}

export function addFriendInfo(nickname, id) {
    return new Promise((resolve) => {
        anotherInfo.friends.push({id: id, nickname: nickname});
        anotherInfo.online++;
        eventOnTheChat(nickname, 'присоединился к чату');
        refreshOnline();
    })
}

// Покинул чат? Покинул список друзей)
export function removeFriendInfo(id) {
    const friends = anotherInfo.friends;
    anotherInfo.online--;

    console.log(anotherInfo)

    for (let i = 0; i < friends.length; i++) {
        if (friends[i].id === id) {
            refreshOnline();
            eventOnTheChat(friends[i].nickname, 'вышел из чата');
            delete anotherInfo.friends[i];
        }
    }

    console.log(anotherInfo)
}

// оповещения, кто присоединился, а кто вышел
function eventOnTheChat(nickname, event) {
    const messageContainer = document.querySelector('#messageContainer');
    const div = `<li class="member join">
                    <div class="member__join">
                        <div>${nickname} ${event}</div>
                    </div>
                </li>`;
    messageContainer.insertAdjacentHTML('beforeend', div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// route
export async function routeMessages(info, message, id) {
    switch (info) {
        case 'addmessage':
            await addMessage(message.message, message.id);
            break;
        case 'close':
            await removeFriendInfo(message.id);
            break;
        case 'connection':
            await giveCookieId(id);
            break;
        case 'join':
            await addFriendInfo(message.message.nickname, message.id);
            break;
        default:
            break;
    }
}

//
function refreshOnline(){
        const num = anotherInfo.online;
        const onlineNumbers = document.querySelector('.chat__members');

        // отвечает за склонение
        function variables(num) {
            const text = ['участник', 'участника', 'участников'];
            if (num === 1 || num === 21) {
                onlineNumbers.innerText = `${num} ${text[0]}`; // -К
                return;
            }
            if (num > 1 || num < 5 || 21 < num < 25) {
                onlineNumbers.innerText = `${num} ${text[1]}`; // -А
                return;
            }
            if (num > 10 || num < 20 || num >= 25 || num === 0) {
                onlineNumbers.innerText = `${num} ${text[2]}`; // -ОВ
            }
        }

        variables(num);
}
