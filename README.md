# Hapi-socket.io ![CI status](https://img.shields.io/badge/build-passing-brightgreen.svg)

Implementacion de socket.io para hapijs .

### Requirements
* Hapi js v17 +

## Installation
`$ npm install hapi-socket.io --save`

## Usage

```js
const hapiSocketIo = require('hapi-socket.io')

async () => {
  await server.register({
    plugin: hapiSocketIo,
    options: {
      //Adicionar las opciones necesarias, el plugin tiene las opciones por defecto de socket.io las cuales puede ver en https://socket.io/docs/server-api/#new-server-httpserver-options
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
      description: 'Retorna un usuario',
      notes: 'Devuelve el usuario seleccionado',
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

//handler function
module.exports.emitgetUser = async function(context, h){
  var socket = context.socket

  //console.log("emit: ", context.request.seneca)
  const result = await context.request.seneca.actAsync({role: "user", cmd: "getUser", payload : context.data, token : ""});
  socket.emit('testemit', result)
  return h.continue;
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
