const Hoek = require('hoek');
const internals = {};
var url = require('url');
/**
 *
 *
 * @param {*} server
 * @param {*} options
 * @param {*} io
 * @returns
 * @author Juan Sebstian Vernaza Lopez
 */
module.exports = async function(server, options, io) {
  try {
    var strategy = options.auth;

    server.route({
      method: 'GET',
      path: '/hapisocketio',
      config: {
        auth: strategy,
        id: 'hapisocketio'
      },
      handler: function(request, h) {
        return 'I did something!';
      }
    });

    io.use(async function(socket, next) {
      //console.log(options);
      socket.auth = false;

      var route = server.lookup('hapisocketio');
      var request = await internals.createRequest({ socket, route });
      const response = await server.inject(request);

      if (response.statusCode === 200) {
        socket.auth = true;
      }

      next();
    });
  } catch (err) {
    console.log(err);
  }
  return options;
};

/**
 *
 *
 * @param {*} options
 * @returns request object
 * @author Juan Sebstian Vernaza
 */
internals.createRequest = async function(options) {
  var socket = options.socket;
  var route = options.route || {};
  var data = options.data || {};

  var path = route.path || '/';
  var dataKeys = Object.keys(data);

  var newPath = path.replace(/(?:\{(\w+)(\??)\})/g, function(group, key, type) {
    var index = dataKeys.indexOf(key);
    var optional = type === '?';

    if (index === -1) {
      if (optional) {
        return '';
      }

      return group;
    }

    dataKeys.splice(index, 1);
    return data[key];
  });

  var uri = url.parse(newPath, true);

  var request = [];
  var headers = Hoek.clone(socket.request.headers);

  request = {
    method: 'GET',
    url: url.format(uri),
    headers: headers,
    payload: {}
  };
  return request;
};
