import fetch from "node-fetch";

import express from "express";

import {createServer} from "http";

import {connect} from "mqtt";
import {Server} from "socket.io";

import jrpc from "json-rpc-2.0";
import {dirname} from "path";
import {fileURLToPath} from "url";

async function manageArrosage(socket, clientRPC, currentState, io) {
    socket.on('arrosage', function () {
        clientRPC.request("arrosage", {etat: currentState === "on" ? "arrosePlus" : "arrose"})
            .then((result) => {
                currentState = result;
                io.emit('updateArrosage', currentState);
            });
    })
}

async function manageCapteurs(io) {
    const client = connect('http://localhost:1883')  // create a client
    client.on('connect', function () {
        console.log("Connected");
        client.subscribe('/capteur/+', () => {
            console.log("Subscribed");
        });
    })

    client.on('message', function (topic, message) {
        if (topic === "/capteur/temp") {
            io.emit("updateTemp", parseFloat(message.toString()));
        } else if (topic === "/capteur/humid") {
            io.emit("updateHumid", parseFloat(message.toString()));
        } else {
            client.end();
        }
    })
}


export function main() {
    const app = express();
    const JSONRPCClient = jrpc.JSONRPCClient;

    const server = createServer(app);
    const io = new Server(server);
    const clientRPC = new JSONRPCClient((jsonRPCRequest) =>
        fetch("http://localhost:8000/json-rpc", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(jsonRPCRequest),
        }).then((response) => {
            if (response.status === 200) {
                return response
                    .json()
                    .then((jsonRPCResponse) => clientRPC.receive(jsonRPCResponse));
            } else if (jsonRPCRequest.id !== undefined) {
                return Promise.reject(new Error(response.statusText));
            }
        })
    );

    let currentState = "on"

    app.get('/', function (req, res) {
        res.sendFile(dirname(fileURLToPath(import.meta.url)) + '/accueil.html');
    });

    io.on('connection', (socket) => {
        socket.emit('updateArrosage', currentState)
        manageArrosage(socket, clientRPC, currentState, io).then(() => null);
        manageCapteurs(io).then(() => null);
    });
    server.listen(3000, function () {
        console.log('listening on *:3000');
    });

}

main();