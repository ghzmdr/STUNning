var Endpoint = require("../Endpoint.js"),
    OP_CODES = require("../opcodes.json")

var LOCAL_PORT = 5678
var LOCAL_ADDRESS = 'localhost'

var socket = require('dgram').createSocket('udp4')    

var server = null
var clients = []

socket.bind(LOCAL_PORT, LOCAL_ADDRESS)

socket.on('listening', function() {
    console.log("=== LISTENING: ", socket.address())
})

socket.on('message', checkOp)

function checkOp (msg, req) {
    console.log("=== MESSAGE FROM :", req)

    msg = msg.toString()

    if (msg.trim() == OP_CODES.REGISTER_SERVER) {

        registerServer(req)

    } else if (msg.trim() == OP_CODES.REGISTER_CLIENT) {

        registerClient(req)

    } else {

        // Got a message to forward
        if (server && (req.address == server.address && req.port == server.port)) {
            dispatchToClients(msg)
        }

        //Got crap
        else {
            console.log("\n=== UNRECOGNIZED MESSAGE\n" + msg)
        }

    } 
}

function registerServer(req) {
    if (server) {
        console.log("=== AVOIDED SERVER TAKEOVER")
        return        
    }
    console.log("=== GOT SERVER")
    server = new Endpoint(req.address, req.port)    
}

function registerClient(req) {
    clients.push(new Endpoint(req.address, req.port))
}

function dispatchToClients(msg) {
    for (var i = 0; i < clients.length; i++) {
        clients[i].send(socket, msg)
    }
}

function update () {
    setTimeout(update, 500)

    for (var i = 0; i < clients.length; i++) {
        clients[i].send(socket, OP_CODES.KEEP_ALIVE)
    }

}

update()