const Server = new require('ws');

const clients = {};
let currentId = 1;
const port = 8999;

const webSocketServer = new Server.Server({port: port});

webSocketServer.on('connection', function(ws) {
    const id = currentId++;
    clients[id] = ws;
    console.log("новое соединение " + id);
    clients[id].send(id)

    ws.on('message', function(message) {
        console.log(`Сообщение получено: '${message}' от пользователя с id ${id}`);
        let info;
        if (message.includes('nickname')) {
            info = message.toString();
        } else {
            info = {
                message: message.toString(),
                id: id
            }
        }

        for(const key in clients) {
            clients[key].send(JSON.stringify(info));
        }
    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];
    });
});
console.log(`Сервер запущен на порту ${port}`);

