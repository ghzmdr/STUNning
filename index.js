var Endpoint = require('./Endpoint'),
    OP_CODES = require('./OpCodes')

function STUN(config) {        
    this.config  = config || require('./config')
    this.socket = require('dgram').createSocket('udp4')    
    this.server = null
    this.clients = null    
    this.init()    
}

STUN.prototype.init = function() {

    var dns = require('dns')                
    var _this = this

    console.log('\nSTARTING...\n')
    
    /** RESOLVE DNS AND BIND **/
    if (this.config.resolveDNS){
        dns.lookup(this.config.address, function resolved(err, addresses){
            if (err) throw err
            console.log(_this.config.address + ' RESOLVED TO: ' + addresses)
            _this.socket.bind(this.config.port, addresses)
        })
    }
    /**  OR JUST BIND **/    
    else this.socket.bind(this.config.port, this.config.address)

    this.socket.on('error', function (err){
        console.log("\n[!!] ERROR: " + err);
    })

    this.socket.on('listening', function(){
        var address = _this.socket.address()
        console.log('Listening on : ' + address.address + ':' + address.port)
    })
    
    this.socket.on('message', this.handleMessage.bind(this))

    setTimeout(this.keepAlive, this.config.keepAliveTimer)
}

STUN.prototype.handleMessage = function(message, request) {
    if (message == OP_CODES.REGISTER_SERVER)
        this.registerServer(request)
    else this.addClient(request)
}

STUN.prototype.registerServer = function(info) {
    /** REGISTER SERVER **/
    if (!this.server) {
        this.server = new Endpoint(info.address, info.port)
        console.log('\n\nGOT SERVER\n', this.server.toString())
        this.server.send(this.socket, this.clients ? JSON.stringify(this.clients) : OP_CODES.NO_CLIENTS_CONNECTED)
    } else {
        var resp = new Buffer(OP_CODES.SERVER_ALREADY_REGISTERED)
        this.socket.send(resp, 0, resp.length, info.port, info.address)    
    }
}

STUN.prototype.addClient = function(info) {
    if (!this.clients) this.clients = []        

    /** REGISTER NEW CLIENT */
    var c = new Endpoint(info.address, info.port)    
    this.clients.push(c)    
    console.log('\n\nGOT CLIENT\n', c.toString())

    /** SEND SERVER INFO TO NEW CLIENT **/
    c.send(this.socket, this.server ? JSON.stringify(this.server) : OP_CODES.SERVER_NOT_CONNECTED)    

    /** SEND NEW CLIENT INFO TO SERVER **/    
    console.log ("DEBUG: ", JSON.stringify(c), "OBJ", c)
    if (this.server) this.server.send(JSON.stringify(c))
}

STUN.prototype.keepAlive = function() {
    if (this.server){
        this.server.send(this.socket, OP_CODES.KEEP_ALIVE)
        this.server.lastSeen = Date.now()
    }
    
    if (this.clients){
        for (var i = 0; i < this.clients.length; i++){
            clients[i].send(this.socket, OP_CODES.KEEP_ALIVE)
            clients[i].lastSeen = Date.now()
        }
    }
    setTimeout(this.keepAlive, this.keepAliveTimer)
}

module.exports = STUN

var stun = new STUN()