'use strict';

const Hoek = require('hoek');
const SocketIo = require('socket.io');
const Auth = require('./auth');
var defaultOptions = {
  socketio: {
    path: '/socket.io'
  }
};

exports.plugin = {
  pkg: require('../package.json'),
  register: async function(server, options) {
    var ser = options.serverLabel ? server.select(options.serverLabel) : server;

    if (ser) {
      var opt = Hoek.applyToDefaults(defaultOptions, options);

      const io = SocketIo(ser.listener, opt);

      await ser.expose('io', io);

      if (options.auth) {
        await Auth(ser, opt, io);
      }

      var nsps = {};
      nsps['/'] = io.of('/');
      Object.keys(nsps).map(function(namespace) {
        nsps[namespace].on('connection', async function(socket) {
          //console.log('on user connected ' + socket.id);

          var routingTable = server.table();

          routingTable.forEach(function(conn) {
            var hapisocketio = conn.settings.plugins['hapi-socket.io'];

            if (hapisocketio) {
              var validEvent = typeof hapisocketio.event === 'string';

              if (validEvent) {
                var event = hapisocketio.event;

                socket.on(event, async function(data) {
                  if (
                    socket.auth ||
                    (socket.auth === undefined && !options.auth)
                  ) {
                    var context = {
                      io: io,
                      socket: socket,
                      event: event,
                      data: data,
                      server: ser
                    };

                    var responder = function(err, result) {};

                    if (hapisocketio.emit) {
                      return hapisocketio.emit(context, responder);
                    }
                  } else {
                    console.log(`Access denied from ${socket.id} socket.id`);
                  }
                });
              }
            }
          });
        });
      });
    }

    return Promise.resolve();
  }
};
