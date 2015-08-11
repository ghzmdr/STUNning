var Endpoint = require('../Endpoint.js'),
    config = require('./config.js'),
    OP_CODES = require('../OpCodes.js')

var stun = new Endpoint(config.targetAddress, config.targetPort)
var mainSocket

createSocket(config.serverAddress, config.serverPort, hitStun)


function hitStun(socket) {
    mainSocket = socket
    mainSocket.on('message', grabExternalIp)
    stun.send(socket, OP_CODES.REGISTER_CLIENT)
}

function grabExternalIp (m, r) {
    console.log(m.toString(), r)
}



function createSocket(address, port, done) {
    var socket = require('dgram').createSocket('udp4')
    
    addErrorHandler(socket)
    addListenHandler(socket)
    
    var dns = require('dns')                
    dns.lookup(address, function resolved (err, result) {
        console.log(result)
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
