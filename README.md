#stunning
A STUN server to enable direct client-server communication over NAT

##Usage:

    npm install stunning
    var stunning = require('stunning')
    var server = stunning()
    
### Configuration

You can provide these settings: (defaults shown in _italics_)

  __address__: sets the IP for the server - _127.0.0.1_
  
  __port__: sets the port to be used - _4879_
  
  __resolveDNS__: if the __address__ field should be resolved - _true_
  
  __keepAliveTimeout__: time between each keepalive packet - _400_ (milliseconds)
            







