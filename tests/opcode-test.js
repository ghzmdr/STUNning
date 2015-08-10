var OP_CODES = require('../OpCodes.js'),
    L = console.log,
    config = require('./config.js')

if (!OP_CODES[process.argv[2]]){
    L('NO SUCH OP CODE')
    listOpCodes()
    process.exit(1)
    return
}

var socket = createSocket('0000', 4444)
sendOpCode(process.argv[2], socket)

function createSocket(address, port) {
    var socket = require('dgram').createSocket('udp4')
    
    var dns = require('dns')                
    dns.lookup(address, function resolved(err, result) {
        if (err) throw err
        socket.bind(port, address)
    })    

    addErrorHandler(socket)
    addListenHandler(socket)
    addMessageHandler(socket)

    return socket
}

function sendOpCode (opCode, socket) {

    var buffer = new Buffer(OP_CODES[opCode])

    var dns = require('dns')
    dns.resolve(config.targetAddress, function (a, b) {
        L("\nSENDING OP CODE: " + OP_CODES[opCode], "\n", buffer)
        L("TO: " + config.targetAddress + " / " + b[0] + ':' + config.targetPort)
        socket.send(buffer, 0, buffer.length, config.targetPort, b[0])        
    })

}

function listOpCodes () {
    L("======= OP CODES =======")
    for (var i in OP_CODES) {
        L('  ' + i + '\t' + OP_CODES[i])
    }
}

function addErrorHandler (socket, handler) {
    socket.on('error', handler || function (err){
        L("\n[!!] ERROR: " + err);
    })    
}

function addListenHandler(socket, handler) {
    socket.on('listening', handler || function(){    
        var address = socket.address()
        L('\nListening on : ' + address.address + ':' + address.port)
    })
}

function addMessageHandler(socket, handler) {
    socket.on('message', handler || function(message, request) {
        L("\n================= GOT MESSAGE" + 
          "\n===== FROM:" + JSON.stringify(request) +
          "\n==== PAYLOAD: \n" + message +                     
          typeof message != String ? "\n==== STRING: \n" + message.toString() +"\n\n" : "\n\n")                    
    })

}
