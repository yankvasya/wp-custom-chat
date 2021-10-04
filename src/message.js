import {getDataBaseInfo, sendDataBaseInfo, sendInfo} from "./websocket";

let standartAvatar = 'https://avavatar.ru/images/avatars/2/avatar_X45iWdICzBLrkbJs.jpg';

let personInfo = {
    id: 0,
    nickname: '',
    avatar: standartAvatar,
};

let anotherInfo = {
    friends: [],
    online: 0
};

export function addMessage(message, id) {
    const messageItem = document.createElement('li');
    const messageContainer = document.querySelector('#messageContainer');
    let imageSrc = {
        imageSrc: personInfo.avatar
    };
    const another = {
        imageSrc: standartAvatar
    }
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
                ? templateFull(Object.assign(personInfo, parsedMessage, fullTime))
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
        const friendInfo = {};
        anotherInfo.friends.forEach((el) => {
            if (el.id === id) {
                friendInfo.nickname = el.nickname;
                friendInfo.avatar = el.avatar;
            }
        });
        console.log(friendInfo)
        html =
            lastElement === null
            || lastElement.classList.contains('me')
            || lastElement.classList.contains('join')
            || lastElement.firstElementChild.textContent.length !== 0
            && lastElement.firstElementChild.textContent !== friendInfo.nickname
                ? templateFull(Object.assign(friendInfo, parsedMessage, fullTime))
                : template(Object.assign(parsedMessage, fullTime));

        // Если последнее сообщение было от меня или сообщения вовсе отсутствуют,, то создай li и закинь его в ul
        // В ином случае запушь его в последнее ul от меня
        if (lastElement === null
            || lastElement.classList.contains('me')
            || lastElement.classList.contains('join')
            || lastElement.firstElementChild.textContent !== friendInfo.nickname) {
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
       document.querySelector('.profile__nickname').innerText = `${nickname}`;
}

// Забрать из localstorage аватар
function giveAvatar() {
    if (sessionStorage.getItem('recent-image')) {
        personInfo.avatar = sessionStorage.getItem('recent-image');
    } else {
        personInfo.avatar = standartAvatar;
    }
}

export function addFriendInfo(nickname, id, avatar) {
    return new Promise(() => {
        anotherInfo.friends.push({id: id, nickname: nickname, avatar: avatar});
        anotherInfo.online++;
        refreshOnline();
        eventOnTheChat(nickname, 'присоединился к чату');
        asideOnline(nickname, 'join');
    })
}

function asideOnline(nickname, event) {
    if (event === 'join') {
        personInfo.nickname !== nickname ?
            document.querySelector('.profile__nicknames')
                .insertAdjacentHTML('beforeend', `<li class="nickname">${nickname}</li>`) :
            null;
    } else if (event === 'leave') {
        if (personInfo.nickname !== nickname) {
            const friends = document.querySelector('.profile__nicknames').children;

            for (let i = 0; i < friends.length; i++) {
                if(friends[i].innerText === `${nickname}`) {
                    friends[i].remove();
                    // friends = friends.slice[0, i] + friends.slice(i+1)
                }
            }
        }
    }
}

// Покинул чат? Покинул список друзей)
export function removeFriendInfo(id) {
        const friends = anotherInfo.friends;
        for (let i = 0; i < friends.length; i++) {
            if (friends[i].id === id) {
                anotherInfo.online--;
                refreshOnline();
                eventOnTheChat(friends[i].nickname, 'вышел из чата');
                asideOnline(friends[i].nickname, 'leave');
                anotherInfo.friends[i] = {}
            }
        }
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
            getDataBaseInfo();
            giveAvatar();
            await giveCookieId(id);
            break;
        case 'join':
            await addFriendInfo(message.message.nickname, message.id, message.message.avatar);
            break;
        case 'dataBaseInfo':
            message.id !== personInfo.id ? sendDataBaseInfo(anotherInfo, message.id) : null;
            break;
        case 'takeDataBaseInfo':
            message.message.id === personInfo.id && anotherInfo.friends.length === 0 ? pushDataBaseInfo(message.message) : null;
            break;
        case 'newAvatar':
            await newAvatar(message);
            break;
        case 'friendChangeAvatar':
            changeFriendAvatar(message.message.avatar, message.id);
            break;
        default:
            break;
    }
}

// отвечает за счетчик онлайна
function refreshOnline(){
    const num = anotherInfo.online;
    const onlineNumbers = document.querySelector('.chat__members');
    variables(num);

    // отвечает за склонение
    function variables(num) {
        const text = ['участник', 'участника', 'участников'];
        if (num < 0) {
            return;
        }
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

        //switch почему-то не работает

        // switch (num) {
        //     case num < 0:
        //         return
        //         break;
        //     case num === 1 || num === 21:
        //         return onlineNumbers.innerText = `${num} ${text[0]}`; // -К
        //         break;
        //     case num > 1 || num < 5 || 21 < num < 25:
        //         return onlineNumbers.innerText = `${num} ${text[1]}`; // -А
        //         break;
        //     case num > 10 || num < 20 || num >= 25 || num === 0:
        //         return onlineNumbers.innerText = `${num} ${text[2]}`; // -ОВ
        //         break;
        //     default:
        //         break;
        // }
    }
}

// данные пушит в anotherInfo (данные по чату, онлайн)
function pushDataBaseInfo(data) {
    anotherInfo.friends = data.friends;
    anotherInfo.online = data.online;
    refreshOnline();
    for (const friend of anotherInfo.friends) {
        friend.nickname !==undefined ? asideOnline(friend.nickname, 'join') : null;
    }
}

// при изменении аватара происходит это
function newAvatar(that) {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
        sessionStorage.setItem('recent-image', reader.result);
        personInfo.avatar = reader.result;

        const testDiv = document.querySelector('.profile__picture');
        const newRecentImageDataUrl = sessionStorage.getItem('recent-image');
        const data = {
            type: 'friendChangeAvatar',
            payload: {
                avatar: newRecentImageDataUrl
            }
        }

        sendInfo(JSON.stringify(data));
        // testDiv.style.display = 'none';
        testDiv.src = `${newRecentImageDataUrl}`;
        // testDiv.style.display = 'block';
    });

    reader.readAsDataURL(that.files[0]);
}

// Если друг сменит аватарку, то у всех запустится эта функция по замене аватарке в anotherInfo.friends
function changeFriendAvatar(avatar, id) {
    anotherInfo.friends.forEach((el) => {
       el.id === id ? el.avatar = avatar : null;
    });
}
