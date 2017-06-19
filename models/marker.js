var methods = require('../modules/mongoose-helper');

var rooms = require('./room');
var users = require('./user');

var mongoose = require('mongoose-promised');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

const MarkersSchemaName = 'Markers';

const MarkersSchema = new Schema({
    timestamp: {
        type: Date,
        index: true,
        required: true,
        unique: false,
        dropDups: false,
        default: Date.now,
        validate: []
    },
    message: {
        type: String,
        index: false,
        required: false,
        unique: false,
        dropDups: false,
        validate: [validators.isLength(0, 500)]
    },
    room: {
        type: String, // serialized Schema.ObjectId
        ref: 'Room',
        required: true
    },
    user: {
        type: String, // serialized Schema.ObjectId
        ref: 'User',
        required: true
    }
});

// validates the entered room referenced value
MarkersSchema.path('room').validate(function (value, respond) {
    var mongooseId = methods.stringAsObjectId(value);

    if (mongooseId == null) {
        respond(false);

        return;
    }

    var that = this;
    // var flag = false;
    rooms.Model.findByIdQ(mongooseId)
        .then((result) => {
            // flag = result ? true : false;
            // console.log(result);
            // console.log(result);
            return result.isPeerQ(that.user);
        })
        .fail((err) => {
            // console.log(err);
            respond(false);

            return;
        })
        .then((result) => {
            respond(true);
        });
});

// validates the entered user referenced value
MarkersSchema.path('user').validate(function (value, respond) {
    var mongooseId = methods.stringAsObjectId(value);

    if (mongooseId == null) {
        respond(false);

        return;
    }

    var flag = false;
    users.Model.findByIdQ(mongooseId)
        .then((result) => {
            flag = result ? true : false;
        })
        .done(() => {
            respond(flag);
        });
});

MarkersSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
    } else {
        var mongooseId = methods.stringAsObjectId(this.room);

        if (mongooseId == null) {
            next();
            return;
        }

        var that = this;
        rooms.Model.findByIdQ(mongooseId)
            // .fail((err) => {
            // 	console.log('err', err);
            // })
            .then((result) => {
                result.markers = result.markers || [];
                result.markers.addToSet(that._id.toString()); //.push(that._id.toString());

                result.saveQ().then(() => {
                    next()
                });
            });
    }
});

/**
 * Schema method to post a marker to a room from a specific user
 * 
 * @param roomId The room id to match
 * @param userId The user id to match
 * @param message [optional] The message to append to the marker
 * @return Promise Returns a promise of this object
 */
MarkersSchema.statics.postQ = function (roomId, userId, message) {
    return new MarkerModel({
        message: message || '',
        room: roomId,
        user: userId
    }).saveQ();
};

/**
 * Schema method to fetch a marker by id
 * 
 * @param id The marker id to match
 * @return Promise Returns a promise of the query
 */
MarkersSchema.statics.findByIdQ = function (id) {
    return MarkerModel
        .where({
            _id: id
        })
        .findOneQ()
};

const MarkerModel = mongoose.model(MarkersSchemaName, MarkersSchema);

exports.Model = MarkerModel
exports.Schema = MarkersSchema;
exports.SchemaName = MarkersSchemaName;