# Hapi-socket.io ![CI status](https://img.shields.io/badge/build-passing-brightgreen.svg)

Implementacion de socket.io para hapijs .

### Requirements

- Hapi js v17 +

## Installation

`$ npm install hapi-socket.io --save`

## Usage

```js
const hapiSocketIo = require('hapi-socket.io')

async () => {
  await server.register({
    plugin: hapiSocketIo,
    options: {
        auth: 'jwt', //jwt Strategy
        socketoptions: {
            //Adicionar las opciones necesarias, el plugin tiene las opciones por defecto de socket.io las cuales puede ver en https://socket.io/docs/server-api/#new-server-httpserver-options
        }
    }
  })
  ...
}
```

## Using hapi-socket.io

```js
  server.route({
    method: "GET",
    path: "/user/getUser",
    config: {
      auth: false,
      handler: handlers.getUser,
      description: 'Example description',
      notes: 'Example notes',
      plugins: {
        'hapi-swagger': {
          payloadType: 'form'
        },
        'hapi-socket.io': {
          event: 'getUser',
          emit: handlers.emitUser
        }
      },
      tags: ['api'],
      validate: {
        query: {
          idUser: Joi.string().required()
        },
        headers: Joi.object({
          'authorization': Joi.string().required()
        }).unknown()
      }
    }
  })
}

//handler function respond to the same customer
module.exports.emitgetUser = async function(context, h){
  var socket = context.socket

  const result = await context.server.seneca.actAsync({role: "user", cmd: "getUser", payload : context.data, token : ""});
  socket.emit('testemit', result)
  return h.continue;
}

//handler function to emit to all customer
module.exports.emitgetUser = async function(context, h){
  var io = context.io

  const result = await context.server.seneca.actAsync({role: "user", cmd: "getUser", payload : context.data, token : ""});
  io.sockets.emit('testemit', result)
  return h.continue;
}

//handler function to emit to others customer
module.exports.emitgetUser = async function(context, h){
  var socket = context.socket

  const result = await context.server.seneca.actAsync({role: "user", cmd: "getUser", payload : context.data, token : ""});
  socket.broadcast.emit('testemit', result)
  return h.continue;
}

//The context variable contains...
{
  io: io,
  socket: socket,
  event: event,
  data: data,
  server: ser
}
```

## Client Example

```js
var io = require('socket.io-client');
var ioClient = io.connect('http://localhost:9001/', {
  transports: ['websocket']
});
console.log('ioClient', ioClient);
ioClient.on('connect', function() {
  console.log('connect');
  ioClient.emit('event', { test: 1 });
});
ioClient.on('testemit', msg => console.log(msg));
ioClient.on('disconnect', function() {
  console.log('disconnect');
});
```

## hapi-socket.io options

auth: text string with the defined security strategy, false, in case of not requiring authentication
socketoptions: you can define the options of the socket io library

## Auth options

We have added, the option to validate with the authentication strategy defined in the server, This option is valid only with the socket configuration that allows the sending of extraHeaders.

```js
// Client example
this.socket = io.connect(URL_SERVER, {
  forceNew: true,
  jsonp: false,
  transports: ['polling'],
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: token // heres go your token
      }
    }
  }
});
```

please do the registry after define your auth strategy

```js
//Auth API with JWT
server.auth.strategy('jwt', 'jwt', {
  key: jwtkey,
  validate: validate,
  verifyOptions: {
    ignoreExpiration: false, // do not reject expired tokens
    algorithms: ['HS256'] // specify your secure algorithm
  },
  urlKey: true
});

server.auth.default('jwt');

await server.register({
  plugin: hapiSocketIo,
  options: {
    auth: 'jwt',
    socketoptions: {}
    //add the necessary options, the plugin has the default options of socket.io which you can see in https://socket.io/docs/server-api/#new-server-httpserver-options
  }
});
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

```

```
