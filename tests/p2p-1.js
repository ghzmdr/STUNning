var Endpoint = require('../Endpoint.js'),
    config = require('./config.js'),
    OP_CODES = require('../opcodes.json')

var stun = new Endpoint(config.targetAddress, config.targetPort)
var mainSocket

createSocket(config.serverAddress, config.serverPort, hitStun)


function hitStun(socket) {
    mainSocket = socket
    mainSocket.on('message', grabExternalIp)
    stun.send(socket, OP_CODES.REGISTER_CLIENT)
}

function grabExternalIp (m, r) {
    var info = JSON.parse(m)    

    var otherPeer = new Endpoint(info.yourSelf.address, config.clientPort)

    var grabListener = grabExternalIp
    mainSocket.removeListener('message', grabListener)
    mainSocket.on('message', function(m, r) {console.log("====GOT MESSAGE", m, r)})


    setInterval(function () {
        otherPeer.send(mainSocket, "HELLO PEER")
    }, 500)
    console.log("Sending to: ", otherPeer.address + ":" + otherPeer.port)
}

function createSocket(address, port, done) {
    var socket = require('dgram').createSocket('udp4')
    
    addErrorHandler(socket)
    addListenHandler(socket)
    
    var dns = require('dns')                
    dns.lookup(address, function resolved (err, result) {        
        if (err) throw err

        socket.bind(port, result)

        if(done) done(socket)
    })    
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
