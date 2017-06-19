let cfg = require('../bin/cfg');

var express = require('express');
var mongoosep = require('mongoose-promised');
var jwt = require('jwt-simple');
var _ = require('lodash');

var passportJWT = require('passport-jwt');

/**
 * The API routes of the application
 * For documentation issue @see{../apidoc/doc.js}
 */
module.exports = ((passport) => {
    var router = express.Router();

    // models
    var markers = require('../models/marker');
    var rooms = require('../models/room');
    var users = require('../models/user');

    var methods = require('../modules/mongoose-helper');

    mongoosep.connectQ(cfg.connectionString).then(() => {
        require('../bin/passport')(passport);
    });

    let addr = `${cfg.remoteAddress}/api`;

    router.get('/', (req, res, next) => {});

    router.get('/info/', (req, res, next) => {
        var info = require('../package.json');

        res.status(200).json({
            app: info.name,
            version: info.version,
            desc: info.desc,
            author: info.author,
            entry_points: addr,
            license: 'Licensed under ' + (info.license || 'MIT')
        });
    });

    router.post('/authenticate/', (req, res, next) => {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                message: 'Missing either \'email\' or \'password\' parameter'
            });
        }
        var email = req.body.email;
        var password = req.body.password;
        var key = req.body.key;

        users.Model.findOne({
            email: email,
        }, (err, user) => {
            if (err) throw err;

            if (user) {
                user.comparePassword(password, (err, match) => {
                    if (match && !err) {
                        // var encode = {};
                        // encode.time = +new Date;
                        // encode.user = user.email;

                        var token = jwt.encode(user, cfg.api.secret);
                        // store tokens to refresh
                        // tokens[token] = encode;

                        // res.send(`JWT ${token}`)
                        res.status(200).json({
                        	message: 'Authentication successfull, granted access token',
                        	token: token
                        });
                    } else {
                        res.status(422).json({
                            message: 'Authentication failed, invalid credentials'
                        });
                    }
                })
            } else {
                res.status(422).json({
                    message: `Authentication failed. No user with the given email \'${email}\' was found`
                });
            }
        });
    });
    
    router.get('/users/me/', passport.authenticate('jwt', {
        session: false
    }), (req, res, next) => {
        res.status(200).json({
            user: req.user
        });
    });

    router.route('/rooms/')
        .get((req, res, next) => {
            // temporary, to list all rooms
            rooms.Model
                .find()
                .populate('markers')
                .exec((err, result) => {
                    if (err) {
                        console.log('/rooms/ {get}', err);
                    }

                    let rooms = result;

                    var i;
                    for (i = 0; i < rooms.length; i++) {
                        var room = rooms[i];
                        // fix markers null value to empty array
                        room.markers = room.markers || [];
                    }

                    res.status(200).json({
                        rooms: rooms
                    });
                });
        })
        .post(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            if (!req.body.title) {
                return res.status(400).json({
                    message: 'Missing \'title\' parameter'
                });
            }

            let uid = req.user._id;

            var room = new rooms.Model({
                title: req.body.title,
                user: uid.toString()
            });

            room.saveQ()
                .fail((err) => {
                    res.status(400).json({
                        message: 'Invalid parameters were entered'
                    });
                })
                .then((result) => {
                    res.status(200).json({
                        message: 'Successfully created a new room'
                    });
                });
        });

    router.route('/rooms/:room_id')
        .get(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            let id = req.params.room_id;

            let uid = req.user._id;

            rooms.Model
                .findOne({
                    _id: methods.stringAsObjectId(id)
                })
                .populate('markers')
                .exec((err, result) => {
                    if (!result || err) {
                        console.log(result);
                        console.log(err);
                        res.status(422).json({
                            message: `No room with the given id \'${id}\' was found`
                        });

                        return;
                    }

                    if (_.isEqual(result.user, uid.toString())) {
                        result.markers = result.markers || [];

                        res.status(200).json({
                            room: result
                        });
                    } else {
                        res.status(401).json({
                            message: `User with id \'${uid}\' is not authorized to fetch the room`
                        });
                    }
                });
        })
        .put(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            let id = req.params.room_id;

            let uid = req.user._id;

            rooms.Model
                .where({
                    _id: methods.stringAsObjectId(id)
                })
                .findOneQ()
                .fail((err) => {
                    res.status(422).json({
                        message: `No room with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    if (!result) {
                        res.status(422).json({
                            message: `No room with the given id \'${id}\' was found`
                        });

                        return;
                    }

                    if (_.isEqual(result.user, uid.toString())) {

                        result.title = req.body.title || result.title;

                        return result.saveQ();
                    } else {
                        return res.status(401).json({
                            message: `User with id \'${uid}\' is not authorized to edit the room`
                        });
                    }
                })
                .fail((err) => {
                    res.status(422).json({
                        message: `No room with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    res.status(200).json({
                        message: `The changes have been made to the room with id \'${id}\'`,
                        room: result
                    });
                });
        })
        .delete(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            let id = req.params.room_id;

            let uid = req.user._id;

            rooms.Model
                .where({
                    _id: methods.stringAsObjectId(id)
                })
                .findOneQ()
                .fail((err) => {
                    res.status(422).json({
                        message: `No room with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    if (!result) {
                        res.status(422).json({
                            message: `No room with the given id \'${id}\' was found`
                        });

                        return;
                    }

                    if (_.isEqual(result.user, uid.toString())) {
                        return result.removeQ();
                    } else {
                        return res.status(401).json({
                            message: `User with id \'${uid}\' is not authorized to remove the room`
                        });
                    }
                })
                .fail((err) => {
                    res.status(422).json({
                        message: `No room with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    res.status(200).json({
                        message: `The room with id \'${id}\' was successfully removed`
                    });
                });
        });

    router.post('/rooms/:room_id/join/:token', passport.authenticate('jwt', {
        session: false
    }), (req, res, next) => {
        // TODO, create token for room (code field or socket/peerjs id?) and set authenticated user as peer
    });

    router.post('/rooms/:room_id/close/', passport.authenticate('jwt', {
        session: false
    }), (req, res, next) => {
        let id = req.params.room_id;

        let uid = req.user._id;

        rooms.Model
            .where({
                _id: methods.stringAsObjectId(id)
            })
            .findOneQ()
            .fail((err) => {
                res.status(422).json({
                    message: `No room with the given id \'${id}\' was found`
                });
            })
            .then((result) => {
                if (!result) {
                    res.status(422).json({
                        message: `No room with the given id \'${id}\' was found`
                    });

                    return;
                }

                if (_.isEqual(result.user, uid.toString())) {

                    result.enddate = Date.now;

                    return result.saveQ();
                } else {
                    return res.status(401).json({
                        message: `User with id \'${uid}\' is not authorized to edit the room`
                    });
                }
            })
            .fail((err) => {
                res.status(422).json({
                    message: `No room with the given id \'${id}\' was found`
                });
            })
            .then((result) => {
                res.status(200).json({
                    message: `The changes have been made to the room with id \'${id}\'`,
                    room: result
                });
            });
    });

    router.get('/markers/', (req, res, next) => {
        // temporary, to list all markers
        markers.Model
            .find((err, result) => {
                res.status(200).json({
                    markers: result
                });
            });
    });

    router.route('/markers/:marker_id')
        .get(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            let id = req.params.marker_id;

            let uid = req.user._id;

            markers.Model
                .where({
                    _id: methods.stringAsObjectId(id)
                })
                .findOneQ()
                .fail((err) => {
                    res.status(422).json({
                        message: `No marker with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    if (!result) {
                        res.status(422).json({
                            message: `No marker with the given id \'${id}\' was found`
                        });

                        return;
                    }

                    if (_.isEqual(result.user, uid.toString())) {
                        res.status(200).json({
                            marker: result
                        });
                    } else {
                        return res.status(401).json({
                            message: `User with id \'${uid}\' is not authorized to fetch the marker`
                        });
                    }
                });
        })
        .put(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            let id = req.params.marker_id;

            let uid = req.user._id;

            markers.Model
                .where({
                    _id: methods.stringAsObjectId(id)
                })
                .findOneQ()
                .fail((err) => {
                    res.status(422).json({
                        message: `No marker with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    if (!result) {
                        res.status(422).json({
                            message: `No marker with the given id \'${id}\' was found`
                        });

                        return;
                    }

                    if (_.isEqual(result.user, uid.toString())) {

                        result.message = req.body.message || result.message;

                        return result.saveQ();
                    } else {
                        return res.status(401).json({
                            message: `User with id \'${uid}\' is not authorized to edit the marker`
                        });
                    }
                })
                .fail((err) => {
                    res.status(422).json({
                        message: `No marker with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    res.status(200).json({
                        message: `The changes have been made to the marker with id \'${id}\'`,
                        marker: result
                    });
                });
        })
        .delete(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            let id = req.params.marker_id;

            let uid = req.user._id;

            markers.Model
                .where({
                    _id: methods.stringAsObjectId(id)
                })
                .findOneQ()
                .fail((err) => {
                    res.status(422).json({
                        message: `No marker with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    if (!result) {
                        res.status(422).json({
                            message: `No marker with the given id \'${id}\' was found`
                        });

                        return;
                    }

                    if (_.isEqual(result.user, uid.toString())) {
                        return result.removeQ();
                    } else {
                        return res.status(401).json({
                            message: `User with id \'${uid}\' is not authorized to remove the marker`
                        });
                    }
                })
                .fail((err) => {
                    res.status(422).json({
                        message: `No marker with the given id \'${id}\' was found`
                    });
                })
                .then((result) => {
                    res.status(200).json({
                        message: `The marker with id \'${id}\' was successfully removed`
                    });
                });
        });

    router.route('/markers/room/:room_id')
        .get(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            let rid = req.params.room_id;

            let uid = req.user._id;

            rooms.Model
                .where({
                    _id: methods.stringAsObjectId(rid)
                })
                .findOneQ()
                .fail((err) => {
                    return res.status(422).json({
                        message: `No room with the given id \'${rid}\' was found`
                    });
                })
                .then((result) => {
                    if (!result) {
                        res.status(422).json({
                            message: `No room with the given id \'${id}\' was found`
                        });

                        return;
                    }

                    return result.isPeerQ(uid.toString());
                })
                .fail((err) => {
                    return res.status(401).json({
                        message: `User with id \'${uid}\' is not authorized to fetch the marker`
                    });
                })
                .then((result) => {

                    return markers.Model
                        .where({
                            room: rid
                        }).find((err, result) => {
                            res.status(200).json({
                                markers: result || []
                            });
                        });
                });
        })
        .post(passport.authenticate('jwt', {
            session: false
        }), (req, res, next) => {
            // allow to add empty markers, e.g. as reference points for the issuer (?)
            // if (!req.body.message) {
            // 	return res.status(400).json({
            // 		message: 'Missing \'message\' parameter'
            // 	});
            // }

            let rid = req.params.room_id;

            let uid = req.user._id;

            rooms.Model
                .where({
                    _id: methods.stringAsObjectId(rid)
                })
                .findOneQ()
                .fail((err) => {
                    return res.status(422).json({
                        message: `No room with the given id \'${rid}\' was found`
                    });
                })
                .then((result) => {
                    if (!result) {
                        res.status(422).json({
                            message: `No room with the given id \'${rid}\' was found`
                        });

                        return;
                    }

                    return result.isPeerQ(uid.toString());
                })
                .fail((err) => {
                    console.log(err);
                    return res.status(401).json({
                        message: `User with id \'${uid}\' is not authorized to post a marker for the room with id \'${rid}\'`
                    });
                })
                .then((result) => {
                    let room = result;

                    markers.Model.postQ(rid, uid.toString(), req.body.message || '')
                        .fail((err) => {
                            res.status(400).json({
                                message: 'Invalid parameters were entered'
                            });
                        })
                        .then((result) => {
                            res.status(200).json({
                                message: 'Successfully created a new marker',
                                marker: result
                            });
                        });
                });
        });

    router.get('/users/', (req, res, next) => {
        // temporary, to list all users
        users.Model
            .find((err, result) => {
                res.status(200).json({
                    users: result
                });
            });
    });

    return router;
});

/**
 * Checks if the given array of parameters meets the expected amount of parameters
 * 
 * @param params An object or array of given parameters
 * @param expected The amount of expected parameters
 * @return boolean Returns true if the given array of parameters meets the expected amount of required parameters
 */
function _required(params, expected) {
    return _.toArray(params).length == expected;
}

/**
 * Outputs a result set as json
 * 
 * @param response The Response instance of the route
 * @param result The object(s) to convert as json
 * @param status (Optional, default 500) The http status code
 */
function _json_response(response, result, status) {
    result.status = (result.status || status || 500);
    response.status(result.status).json(result);
}

/**
 * Creates a formatted json result set
 * 
 * response = {message: ${message}, status: ${status}}
 * 
 * @param response The Response instance of the route
 * @param message The message to append to the result set
 * @param status The http status code to append to the result set
 */
function _json_message(response, message, status) {
    _json_response(response, {
        message: message
    }, status);
}

/**
 * Converts an expected mongoose id value as mongooses' ObjectId
 * 
 * @example _validateId(response, "0123456789", (id) => { });
 * @param res The Response instance of the route
 * @param id The value to convert to ObjectId
 * @param callback (Optional) The callback to run after converting, contains the converted value as argument
 */
function _validateId(res, id, callback) {
    var mongooseId = null;

    try {
        id = (id || '');
        mongooseId = mongoosep.Types.ObjectId(id)
    } catch (err) {
        console.log(err);
        _json_message(res, `The given id format was invalid`, 500);

        return;
    }

    if (callback !== undefined && typeof callback === 'function') {
        callback(mongooseId);
    } else {
        _json_response(res, {}, 200);
    }
}

// module.exports = router;