
function Endpoint(address, port){
    this.address = address
    this.port = port

    this.lastSeen = Date.now()    
}

Endpoint.prototype.toString = function() {
    return '\n\=== ENDPOINT ===\n==ADDRESS: ' + this.address + '\n==PORT: ' + this.port
}

Endpoint.prototype.send = function(socket, string) {
    var buffer = new Buffer(string)
    socket.send(buffer, 0, buffer.length, this.port, this.address)
}

module.exports = Endpoint