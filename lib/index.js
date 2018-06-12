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
        //console.log("ser", ser.settings.routes)
        //console.log("server", ser.connection)
        //console.log("options", options)

        if(ser){
          options = Hoek.applyToDefaults(defaultOptions, options);
          //console.log("server", ser.listener)
          /*var connection = ser && ser.connections.length && ser.connections[0];

          if (!connection) {
            return console.log('No connection/listener found');
          }*/


          const io = SocketIo(ser.listener, options);

          await ser.expose({'io': io});

          var _request = []
          var request = []
          if (ser._core._decorations.requestApply) {
              const properties = Object.keys(server._core._decorations.requestApply);
              for (let i = 0; i < properties.length; ++i) {
                  const property = properties[i];
                  const assignment = server._core._decorations.requestApply[property];
                  request[property] = assignment(request);
              }
          }

          //request._listen();
          _request = request;

          var nsps = {}
          nsps['/'] = io.of('/')
          Object.keys(nsps).forEach(function(namespace) {

            nsps[namespace].on('connection', function(socket){

              var routingTable = server.table();
              console.log("connection", "Connect on")
              routingTable.forEach(function(conn) {

                var hapisocketio = conn.settings.plugins['hapi-socket.io']

                if(hapisocketio){
                  var validEvent = typeof hapisocketio.event === "string"

                  if(validEvent){
                    var event = hapisocketio.event

                      //console.log("socket", socket)
                      //socket.emit('testemit', {response: 1})
                      socket.on(event, async function (data) {
                        
                        console.log("ser", ser._core._decorations.requestApply)
                        //_this.setState({ response: data })
                        var context = {
                          io: server.plugins['hapi-socket.io'].io,
                          socket: socket,
                          event: event,
                          data: data,
                          request: ser
                          //req: req,
                          //res: injResp,
                          //result: injResp.result
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
