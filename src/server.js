const Server = new require('ws');

const clients = {};
let currentId = 1;
const port = 8999;

const webSocketServer = new Server.Server({port: port});

webSocketServer.on('connection', function(ws) {
    const id = currentId++;
    const data = {
        type: 'connection',
        payload: {
            id: id
        }
    }
    clients[id] = ws;
    console.log("новое соединение " + id);

    clients[id].send(JSON.stringify(data));

    ws.on('message', function(message) {
        let info;
        console.log(`Сообщение получено: '${message}' от пользователя с id ${id}`);
        message.includes('nickname') ? info = message.toString() : info = {message: message.toString(), id: id}

        for(const key in clients) {
            clients[key].send(JSON.stringify(info));
        }
    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        const data = {
            type: 'close',
            payload: {
                id: id
            }
        }
        for(const key in clients) {
            clients[key].send(JSON.stringify(data));
        }
        delete clients[id];
    });
});

console.log(`Сервер запущен на порту ${port}`);

