import express from "express";
import {createServer} from "http";
import {connect} from "mqtt";
import {Server} from "socket.io";
import {dirname} from "path";
import {fileURLToPath} from "url";

/**
 * Gère le lien des websockets vers mqtt
 * @param socket
 * @param client
 * @param io
 * @returns {Promise<void>}
 */
async function manageAjoutSupprGet(socket, client, io) {
    socket.on('ajout', function (amount) {
        client.publish(`/compte/banque/${socket.id}/add`, amount)
    });
    socket.on('suppr', function (amount) {
        client.publish(`/compte/banque/${socket.id}/del`, amount)
    });
    socket.on('get', function () {
        client.publish(`/compte/banque/${socket.id}/get`,);
    })
    socket.on('changeAcc', function () {
        client.publish(`/compte/banque/${socket.id}/get`,);
    })
}

/**
 * Gère l'initialisation de mqtt
 * @param socket
 * @param io
 * @returns {Promise<void>}
 */
async function manageMqtt(socket, io) {
    const client = connect('http://localhost:1883')  // create a client

    client.on('message', function (topic, message) {
        const amount = parseInt(message.toString());
        if (topic.includes("/compte/client/")) {
            const acc = io.sockets.sockets.get(topic.split("/")[3])
            acc.emit("updateAcc", topic.split("/")[3] + " -- " + amount);
        }
    })

    client.on('connect', function () {
        console.log("Connected");
        client.subscribe('/compte/client/+', () => {
            console.log("Subscribed");
        });
        manageAjoutSupprGet(socket, client, io).then(() => client.publish(`/compte/banque/${socket.id}/get`,));
    })
}


/**
 * Gère le démarrage de l'appli
 */
export function main() {
    const app = express();
    const server = createServer(app);
    const io = new Server(server);

    app.get('/', function (req, res) {
        res.sendFile(`${dirname(fileURLToPath(import.meta.url))}/accueil.html`);
    });

    io.on('connection', (socket) => {
        manageMqtt(socket, io).then()
    });

    server.listen(3000, function () {
        console.log('listening on *:3000');
    });

}

main();