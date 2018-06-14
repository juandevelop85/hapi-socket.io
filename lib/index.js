'use strict'

const Hoek = require('hoek');
const SocketIo = require('socket.io')


var defaultOptions = {
    socketio: {}
}

exports.plugin = {
    pkg: require('../package.json'),
    register: async function(server, options){

        var ser = options.serverLabel ? server.select(options.serverLabel) : server;        

        if(ser){
          options = Hoek.applyToDefaults(defaultOptions, options);
          
          const io = SocketIo(ser.listener, options);

          await ser.expose({'io': io});

          var nsps = {}
          nsps['/'] = io.of('/')
          Object.keys(nsps).forEach(function(namespace) {

            nsps[namespace].on('connection', function(socket){

              var routingTable = server.table();
              
              routingTable.forEach(function(conn) {

                var hapisocketio = conn.settings.plugins['hapi-socket.io']

                if(hapisocketio){
                  var validEvent = typeof hapisocketio.event === "string"

                  if(validEvent){
                    var event = hapisocketio.event

                      socket.on(event, async function (data) {
                        
                        var context = {
                          io: io,
                          socket: socket,
                          event: event,
                          data: data,
                          server: ser
                        };

                        var responder = function(err, result) {
                          
                        };

                        if (hapisocketio.emit) {
                          return hapisocketio.emit(context, responder);
                        }
                    })
                  }
                }
              })

            })
          })
        }

        return Promise.resolve();
    }
}
