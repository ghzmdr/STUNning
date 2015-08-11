
function Endpoint(address, port){
    this.address = address
    this.port = port

    this.resolvedAddress = null

    var dns = require('dns')
    dns.lookup(this.address, function (err, res) {        
        this.resolvedAddress = res
    }.bind(this))

    this.lastSeen = Date.now()    
}

Endpoint.prototype.toString = function() {
    return '\n=== ENDPOINT ===\n== ADDRESS: ' + this.address + '\n== PORT: ' + this.port
}

Endpoint.prototype.send = function(socket, string) {
    var buffer = new Buffer(string)
    socket.send(buffer, 0, buffer.length, this.port, this.resolvedAddress || this.address)
}

module.exports = Endpoint