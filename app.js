var fs = require('fs');

// new unique secret for every new iteration
fs.writeFileSync(`${__dirname}/bin/.secret`, require('cuid')());

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

// running server
var www = require(path.resolve(__dirname, 'bin/www'));

// running application
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// resources/static content
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

app.use(passport.initialize());

app.set('json spaces', 4);

// register app routes
app.use('/', express.static(`${__dirname}/doc`));
app.use('/api', require('./routes/api')(passport));

// serve the app on the server, [optional callback param]
www.serve(app, (served) => {
    // handle socket communication after server start
    
    // var ExpressPeerServer = require('peer').ExpressPeerServer;
    // app.use('/peerjs', new ExpressPeerServer(served.server));

    var PeerServer = require('peer').PeerServer;
    var peer = new PeerServer({port: 8080, path: '/streaming'});

    // var io = require('socket.io')(served.server);
    // io.sockets.on('connection', (socket) => {
    //     let id = socket.id;
    // });
});

module.exports = app;
