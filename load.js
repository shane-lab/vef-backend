let cfg = require('./bin/cfg');

var mongoosep = require('mongoose-promised');

var users = require('./models/user');
var rooms = require('./models/room');
var markers = require('./models/marker');

let user = new users.Model({
    firstName: "Shane",
    lastName: "van den Bogaard",
    email: "shanevdb@hotmail.nl",
    password: "123456"
});

mongoosep.connectQ(cfg.connectionString).then(() => {
    var db = mongoosep.connection;

    // collection in "db" uses ecmascript 6 Symbols,
    // calling any method or field on one of the collections should be save
    db.collections.markers.drop();
    db.collections.rooms.drop();
    db.collections.users.drop();

    console.log('cleared mongo storage');

    new users.Model({
        firstName: "Test",
        lastName: "Test",
        email: "test@test.test",
        password: "123456"
    }).save();

    user.saveQ()
        .fail((err) => {
            console.log(`unable to insert user \'${user.email}\'`);
        })
        .then((result) => {
            if (result) {
                console.log(`inserted user \'${user.email}\'`);
                var room = new rooms.Model({
                    title: 'Test subject',
                    user: result[0]._id.toString()
                });

                return room.saveQ();
            }
        })
        .fail((err) => {
            console.log('unable to insert new room');
        })
        .then((result) => {
            if (result) {
                console.log('inserted new room')

                // var marker = new markers.Model({
                //     message: "Initial test message",
                //     room: result[0]._id.toString(),
                //     user: result[0].user
                // });

                // return marker.saveQ();

                return markers.Model.postQ(result[0]._id.toString(), result[0].user, 'test');
            }
        })
        .fail((err) => {
            console.log(err);
            console.log('unable to insert new marker');
        })
        .then((result) => {
            if (result) {
                console.log('inserted new marker');
            }
        })
        // the mongoose connection closes too early
        .done(disconnect);
});

function disconnect() {
    mongoosep.disconnect();
}