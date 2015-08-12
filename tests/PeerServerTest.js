/*
    1 - Register to server
        1.1 - Meet current cliets if any

    2 - Wait for client connections        
        3 - Meet client (Keep sending handshake and listen for response)
            4 - Connection established or failed to connect     
*/

var Endpoint = require('../Endpoint.js'),
    config = require('./config.js'),
    OP_CODES = require('../opcodes.json')

var stun = new Endpoint(config.targetAddress, config.targetPort)
var mainSocket

var clients = []

createSocket(config.serverAddress, config.serverPort, hitStun)

function hitStun (socket) {
    mainSocket = socket
    stun.send(socket, OP_CODES.REGISTER_SERVER)
    socket.on('message', handleStunMessage)
}

function handleStunMessage (msg, req) {
    var clientInfo

    try {
        clientInfo = JSON.parse(msg)
    } catch (e) {
        console.log("==== GOT OPCODE : ", msg.toString() + "\n")
        return
    }

    if (Array.isArray(clientInfo)) {
        for (var i = 0; i < clientInfo.length; i++){
            var client = new Endpoint(clientInfo[i].address, clientInfo[i].port)    

            clients.push(client)
            meetClient(client)
        }

        return
    }

    var client = new Endpoint(clientInfo.address, clientInfo.port)    
    clients.push(client)
    meetClient(client)
}

function meetClient(client) {

    console.log("\n==== MEETING CLIENT\n")
    console.log("=== SENDING OPCODE: SERVER_HANDSHAKE - " + OP_CODES.SERVER_HANDSHAKE)
    console.log("=== TO: " + client.address + ":" + client.port + "\n\n")

    function validateConnection (msg) {
        msg = msg.toString().trim()
        
        if (msg == OP_CODES.CLIENT_HANDSHAKE){
            console.log("==== CLIENT CONNECTED ", client)
            client.connected = true   

           
        } else console.log("==== IGNORED MESSAGE " + msg)
    }

    mainSocket.on('message', validateConnection)

    handShake()

    function handShake() {        
        console.log("WAITING...")
        client.send(mainSocket, OP_CODES.SERVER_HANDSHAKE)
        if (!client.connected)
            setTimeout(handShake, 500)
        //else mainSocket.removeListener(validateConnection)
    }
}

function createSocket(address, port, done) {
    var socket = require('dgram').createSocket('udp4')
    
    addErrorHandler(socket)
    addListenHandler(socket)
    
    socket.bind(port)    
    /*

    var dns = require('dns')                
    dns.lookup(address, function resolved (err, result) {
        console.log(result)
        if (err) throw err

        socket.bind(port, result)

        if(done) done(socket)
    })    

    */  
}


function addErrorHandler (socket, handler) {
    socket.on('error', handler || function (err){
        console.log("\n[!!] ERROR: " + err);
    })    
}

function addListenHandler(socket, handler) {
    socket.on('listening', handler || function(){    
        var address = socket.address()
        console.log('\nListening on : ' + address.address + ':' + address.port)
    })
}

function addMessageHandler(socket, handler) {
    socket.on('message', handler || function(message, request) {
        console.log("\n================= GOT MESSAGE" + 
          "\n===== FROM:" + JSON.stringify(request) +
          "\n==== PAYLOAD: \n" + message +                     
          typeof message != String ? "\n==== STRING: \n" + message.toString() +"\n\n" : "\n\n")                    
    })

}
