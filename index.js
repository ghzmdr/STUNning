var Endpoint = require('./Endpoint'),
    OP_CODES = require('./OpCodes')

module.exports = stunning

/** 
    Parses config overriding the default if needed
*/

function stunning(config) {        
    this.config  = require('./config-validator')(require('./config'), config)

    this.socket = require('dgram').createSocket('udp4')    

    this.server = null
    this.clients = []        
}

/** 
    RESOLVE DNS AND BINDS 
*/

stunning.prototype.connect = function() {

    console.log('\nSTARTING...\n')
    
    if (this.config.resolveDNS){
        var dns = require('dns')                

        dns.lookup(this.config.address, function resolved(err, addresses){
            if (err) throw err

            console.log(this.config.address + ' RESOLVED TO: ' + addresses)
            this.socket.bind(this.config.port, addresses)

        }.bind(this))
    }

    else this.socket.bind(this.config.port, this.config.address)

    this.socket.on('error', function (err){
        console.log("\n[!!] ERROR: " + err);
    })

    this.socket.on('listening', function(){
        var address = this.socket.address()
        console.log('Listening on : ' + address.address + ':' + address.port)
    }.bind(this))
    
    this.socket.on('message', this.handleMessage.bind(this))

    setTimeout(this.keepAlive, this.config.keepAliveTimer)
}

stunning.prototype.handleMessage = function(message, request) {
	message = message.toString().trim()
     if (message == OP_CODES.REGISTER_SERVER) {
        this.registerServer(request)
    } else if (message == OP_CODES.REGISTER_CLIENT) {
        this.registerClient(request)
    } else {
        console.log('Got unrecognized message\n', message, "\nSTRING: " + message.toString(), request)
    }
}

/** 
    Register a new server and send its info to the clients
    Sends an error if already registered
*/

stunning.prototype.registerServer = function(info) {
    
    if (!this.server) {
        this.server = new Endpoint(info.address, info.port)
        console.log('\n\n[++] ===== GOT SERVER\n', this.server.toString())
        this.server.send(this.socket, this.clients.length > 0 ? JSON.stringify(this.clients) : OP_CODES.NO_CLIENTS_CONNECTED)
        
        console.log(this.server ? "\n[ ] INTRODUCING HIM THE CLIENTS" : "\n[-] " + OP_CODES.NO_CLIENTS_CONNECTED)
        for (var i = 0; i < this.clients.length; ++i) {
            this.clients[i].send(this.socket, JSON.stringify(this.server))
        }

    } else {
        var resp = new Buffer(OP_CODES.SERVER_ALREADY_REGISTERED)
        this.socket.send(resp, 0, resp.length, info.port, info.address)    
    }
}


/** 
    Register a new client and send its info to the server (if any) 
*/

stunning.prototype.registerClient = function(info) {
         
    var client = new Endpoint(info.address, info.port)    
    this.clients.push(client)    
    console.log('\n\n[++] ===== GOT CLIENT\n', client.toString())

    var connectionInfo = this.server ? JSON.stringify(this.server) : OP_CODES.SERVER_NOT_CONNECTED


    console.log(this.server ? "\n[ ] INTRODUCING HIM THE SERVER" : "\n[-] " + OP_CODES.SERVER_NOT_CONNECTED)
    client.send(this.socket, connectionInfo)
    
    if (this.server) 
        this.server.send(this.socket, JSON.stringify(client))
}

/** 
    Update loop every 500ms for keepalives
*/

stunning.prototype.update = function() {
    setTimeout(this.update.bind(this), 500)

    if (this.server){
        this.sendKeepAlive(this.server)
    }
    
    for (var i = 0; i < this.clients.length; i++){
        this.sendKeepAlive(clients[i])
    }
}

stunning.prototype.sendKeepAlive = function(endpoint) {
    endpoint.send(this.socket, OP_CODES.KEEP_ALIVE)
    endpoint.lastSeen = Date.now()
}


