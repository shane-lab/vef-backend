var cfg = require('./cfg');
process.env['DEBUG'] = cfg.name;

var fs = require('fs');
var http = require('http');
var https = require('https');
var debug = require('debug')(cfg.name);

var running = false;
exports.serve = (app, callback) => {
    if (running === true) {
        console.warn('server is already running');

        return;
    }

    app.use((req, res, next) => {
        var error = new Error('Not Found');
        error.status = 404;
        next(error);
    });

    app.use((err, req, res, next) => {
        res.status(err.status || 500); // internal error
        res.render('error', {
            message: err.message,
            error: app.get('env') === 'development' ? err : {}
        });
    });

    port = normalizePort(cfg.port);

    // generate SSL certificate
    // var csrgen = require('csr-gen');
    // var dir = `${__dirname}/keys`;
    // csrgen(cfg.ip, {
    //     outputDir: dir,
    //     read: true,
    //     // company: cfg.name,
    // }, (err, keys) => {
    //     // console.log('test');
    // });

    // var key = fs.readFileSync(`${dir}/key.pem`).toString();
    // var cert = fs.readFileSync(`${dir}/cert.pem`).toString();

    server = http.createServer(app);
    // https.createServer({ key: key.toString(), cert: cert.toString() }, app).listen(8000);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    function normalizePort(val) {
        var _port = parseInt(val, 10);

        if (isNaN(_port)) {
            return val; // named pipe
        }

        if (_port >= 0) {
            return _port; // port number
        }

        return false;
    }

    function onError(err) {
        if (err.syscall !== 'listen') {
            throw error;
        }

        var binding = `${(typeof port === 'string' ? 'Pipe' : 'Port')} ${port}`;

        switch (err.code) {
            case 'EACCESS':
                console.error(`${binding} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${binding} is already in use`);
                process.exit(1);
                break;
            default:
                throw err;
        }
    }

    function onListening(e) {
        var address = server.address;
        var binding = typeof address === 'string' ? `Pipe ${address.port}` : `Port ${port}`;
        debug('Listening on ' + binding);

        if (callback !== undefined && typeof callback === 'function') {
            callback({
                server: server,
                port: port
            });
        }
    }
}

// server listener module
// exports.serve = serve;
