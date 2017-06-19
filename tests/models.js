let mongoosep = require('mongoose-promised');
mongoosep.connect('mongodb://127.0.0.1/vef_test');

let _ = require('lodash');

var users = require('../models/user');
var rooms = require('../models/room');
var markers = require('../models/marker');

var expect = require('chai').expect;

/**
 * Creates a new user with valid credentials
 * 
 * @return UserModel Returns an instance of UserModel
 */
let testUser = (() => {
    return new users.Model({
        firstName: 'Test',
        lastName: 'test',
        email: 'test@test.com',
        password: '1234567QWERTY'
    });
});

describe('users', () => {
    describe('validation', () => {
        it('should validate without errors', done => {
            testUser().validate(done);
        });

        it('should fail on validation, empty fields', done => {
            new users.Model().validate(err => {
                expect(err.errors.firstName, 'firstName required').to.exist;
                expect(err.errors.firstName, 'lastName required').to.exist;
                expect(err.errors.firstName, 'email required').to.exist;
                expect(err.errors.firstName, 'password required').to.exist;
                done();
            });
        });

        it('should fail on validation, invalid email format', done => {
            let testUser1 = testUser();
            testUser1.email = 'test.test.com';
            testUser1.validate(err => {
                expect(err.errors.email, 'invalid email format').to.exist;
                done();
            });
        });
    });
});

describe('rooms', () => {
    var userId = null;
    var room = null;

    before(done => {
        testUser()
            .saveQ()
            // .fail((err) => {
            //     done(err);
            // })
            .fail(err => {
                done(err);

                return;
            })
            .then(result => {
                userId = result[0]._id.toString();

                var room = new rooms.Model({
                    title: 'Test',
                    user: userId
                });

                return room.saveQ();
            })
            .fail(err => {
                done(err);

                return;
            })
            .then(result => {
                room = result[0];

                done();
            });
    });

    after((done) => {
        var db = mongoosep.connection;

        db.collections.users.drop();
        db.collections.rooms.drop();

        done();
    });

    describe('validation', () => {
        it('should validate without errors, requires existing user', done => {
            new rooms.Model({
                title: 'Test',
                user: userId
            }).validate(done);
        });

        it('should fail on validation, empty fields', done => {
            new rooms.Model().validate(err => {
                expect(err.errors.title, 'title required').to.exist;
                expect(err.errors.user, 'user required').to.exist;
                done();
            });
        });

        it('should fail on validation, user does not exist (Unprocessable Entity)', done => {
            new rooms.Model({
                title: 'Test',
                user: 'abcdef'
            }).validate(err => {
                expect(err.errors.user, 'valid user required').to.exist;
                done();
            });
        });
    });

    describe('sharing', () => {
        it('should be able to share the room with a user', done => {
            var id = null;

            let testUser1 = testUser();
            testUser1.email = 'test1@test.com';
            testUser1.saveQ()
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {
                    id = result[0]._id.toString();

                    return room.joinQ(id)
                })
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {
                    // check if the user is peer

                    return result.isPeerQ(id);
                })
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {
                    done();
                });
        });

        it('should have set the owner as peer', done => {
            room.isPeerQ(userId)
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {
                    done();
                });
        });

        it('should not be able to share the room with the room owner', done => {
            room.joinQ(userId)
                .fail(err => {
                    expect(err).to.exist;

                    done();
                });
        });

        it('should not be able to share the room, user does not exist (Unprocessable Entity)', done => {
            room.joinQ('abcdef')
                .fail(err => {
                    expect(err).to.exist;

                    done();
                });
        });
    });
});

describe('markers', () => {
    var userId = null;
    var room = null;

    before(done => {
        testUser()
            .saveQ()
            // .fail((err) => {
            //     done(err);
            // })
            .fail(err => {
                done(err);

                return;
            })
            .then(result => {
                userId = result[0]._id.toString();

                var room = new rooms.Model({
                    title: 'Test',
                    user: userId
                });

                return room.saveQ();
            })
            .fail(err => {
                done(err);

                return;
            })
            .then(result => {
                room = result[0];

                done();
            });
    });

    after((done) => {
        var db = mongoosep.connection;

        db.collections.users.drop();
        db.collections.rooms.drop();

        done();
    });

    describe('validation', () => {
        it('should validate without errors, requires an existing room and user', done => {
            new markers.Model({
                room: room._id.toString(),
                user: userId
            }).validate(done);
        });

        it('should fail on validation, empty fields', done => {
            new markers.Model().validate(err => {
                expect(err.errors.user).to.exist;
                expect(err.errors.room).to.exist;
                done();
            });
        });

        it('should fail on validation, user does not exist (Unprocessable Entity)', done => {
            new markers.Model({
                room: room._id.toString(),
                user: 'abcdef'
            }).validate(err => {
                expect(err.errors.user).to.exist;
                done();
            });
        });

        it('should fail on validation, room does not exist (Unprocessable Entity)', done => {
            new markers.Model({
                room: 'abcdef',
                user: userId
            }).validate(err => {
                expect(err.errors.room).to.exist;
                done();
            });
        });
    });

    describe('posting', () => {
        it('should be able to post a marker for the owner', done => {
            var markerId = null;

            markers.Model.postQ(room._id.toString(), userId, 'test message')
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {
                    markerId = result[0]._id.toString();
                    
                    // check if the marker is inserted into the room
                    return rooms.Model.findByIdQ(result[0].room);
                })
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {
                    // should be the only marker of the array, comparing id values
                    expect(result.markers[0]).to.deep.equal(markerId);

                    done();
                });
        });

        it('should be able to post a marker for a peer', done => {
            var id = null;

            let testUser1 = testUser();
            testUser1.email = 'test1@test.com';
            testUser1.saveQ()
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {
                    id = result[0]._id.toString();

                    // user has not yet joined, cant post
                    return markers.Model.postQ(room._id.toString(), id, 'test message');
                })
                .fail(err => {
                    expect(err.errors.room).to.exist;

                    return room.joinQ(id)
                })
                .then(result => {
                    // should be peer
                    return markers.Model.postQ(result._id.toString(), id, 'test message');
                })
                .fail(err => {
                    done(err);

                    return;
                })
                .then(result => {

                    done(); // post successfull by peer user
                });
        });

        it('should not be able to post a marker for an arbitrary user', done => {
            markers.Model.postQ(room._id.toString(), 'def')
                .fail(err => {
                    expect(err.errors.user)

                    done();
                });
        });
    });
});