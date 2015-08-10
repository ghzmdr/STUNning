var Endpoint = require('./Endpoint'),
    OP_CODES = require('./OpCodes')

function stunning(config) {        
    /** PARSE CONFIG **/
    this.config  = require('./config-validator')(require('./config'), config)

    this.socket = require('dgram').createSocket('udp4')    

    this.server = null
    this.clients = []        
}

stunning.prototype.connect = function() {

    console.log('\nSTARTING...\n')
    
    /** RESOLVE DNS AND BIND **/
    if (this.config.resolveDNS){
        var dns = require('dns')                

        dns.lookup(this.config.address, function resolved(err, addresses){
            if (err) throw err

            console.log(this.config.address + ' RESOLVED TO: ' + addresses)
            this.socket.bind(this.config.port, addresses)

        }.bind(this))
    }

    /**  OR JUST BIND **/    
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
     if (message == OP_CODES.REGISTER_SERVER) {
        this.registerServer(request)
    } else if (message == OP_CODES.REGISTER_CLIENT) {
        this.registerClient(request)
    }
}

stunning.prototype.registerServer = function(info) {
    /** REGISTER SERVER **/
    if (!this.server) {
        this.server = new Endpoint(info.address, info.port)
        console.log('\n\nGOT SERVER\n', this.server.toString())
        this.server.send(this.socket, this.clients ? JSON.stringify(this.clients) : OP_CODES.NO_CLIENTS_CONNECTED)
        
        for (var i = this.clients.length - 1; i >= 0; i--) {
            this.clients[i].send(this.socket, JSON.stringify(this.server))
        }

    } else {
        var resp = new Buffer(OP_CODES.SERVER_ALREADY_REGISTERED)
        this.socket.send(resp, 0, resp.length, info.port, info.address)    
    }
}

stunning.prototype.registerClient = function(info) {
         
    /** REGISTER NEW CLIENT */
    var client = new Endpoint(info.address, info.port)    
    this.clients.push(client)    
    console.log('\n\nGOT CLIENT\n', client.toString())

    /** SEND SERVER INFO TO NEW CLIENT **/
    client.send(this.socket, this.server ? JSON.stringify(this.server) : OP_CODES.SERVER_NOT_CONNECTED)    

    /** SEND NEW CLIENT INFO TO SERVER **/    
    if (this.server) this.server.send(this.socket, JSON.stringify(client))
}

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

module.exports = stunning
