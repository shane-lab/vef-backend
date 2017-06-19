var hat = require('hat');
var Q = require('q');
var _ = require('lodash');

var methods = require('../modules/mongoose-helper');

var users = require('./user');

var mongoose = require('mongoose-promised');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

const RoomsSchemaName = 'Rooms';

const RoomsSchema = new Schema({
	// performance/presentation name
	title: {
		type: String,
		index: true,
		required: true,
		unique: false,
		dropDups: false,
		validate: [validators.isLength(1, 128)]
	},
	code: {
		type: String,
		index: true,
		required: false,
		unique: false, // <= async saving, initial value is null. duplicates can exists
		dropDups: false,
		validate: [],
	},
	startdate: {
		type: Date,
		index: false,
		required: true,
		unique: false,
		dropDups: false,
		default: Date.now,
		validate: []
	},
	enddate: {
		type: Date,
		index: false,
		required: false,
		unique: false,
		dropDups: false,
		validate: [
			function (value) {
				return this.startdate <= value;
			}
		]
	},
	// the room owner
	user: {
		type: String, // serialized Schema.ObjectId
		ref: 'Users',
		required: true,
		unique: false,
	},
	// the room invitees
	peers: [{
		type: String, // serialized Schema.ObjectId
		ref: 'Users'
	}],
	markers: [{
		type: String, // serialized Schema.ObjectId
		ref: 'Markers'
	}]
});

// validates the entered user referenced value
RoomsSchema.path('user').validate(function (value, respond) {
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

// Generates a sharable key before the model is saved
RoomsSchema.pre('save', function (next) {
	let room = this;

	if (this.isNew) {
		generateKey(room, function (key) {
			room.code = key;

			next();
		});
	} else {
		next();
	}
});

/**
 * Schema method to check if a user is involved with the room
 * Same as @see isPeer, but returns a Promise (Q)
 * 
 * @param userId The user Schema id as string
 * @return Promise Returns a promise of this object
 */
RoomsSchema.methods.isPeerQ = function (userId) {
	var deferred = Q.defer();

	if (isPeer(this, userId)) {
		deferred.resolve(this);
	} else {
		deferred.reject(new Error(`The user with id \'${userId}\' is not a peer`));
	}

	// console.log(this);
	// console.log(`is peer "${isPeer(this, userId.toString())}"`, this.peers, userId)
	// console.log('is peer:', 

	return deferred.promise;
};

/**
 * Sets the user as peer of the room
 * 
 * @param userId The user Schema id as string
 * @return Promise Returns a promise of this object
 */
RoomsSchema.methods.joinQ = function (userId) {
	var deferred = Q.defer();

	if (isPeer(this, userId)) {
		deferred.reject(new Error(`The user with id \'${userId}\' is not a peer`));
	} else {
		var mongooseId = methods.stringAsObjectId(userId);

		if (mongooseId == null) {
			deferred.reject(new Error(`The entered id \'${userId}\' can not be converted to Schema.ObjectId`));
		} else {
			var that = this;
			users.Model.findByIdQ(mongooseId)
				.fail((err) => {
					deferred.reject(new Error(`No user with id \'${userId}\' was found`));
				})
				.then((result) => {
					that.peers.push(userId);

					return that.saveQ();
				})
				.then((result) => {
					deferred.resolve(that);
				});
		}
	}

	return deferred.promise;
}

/**
 * Schema method to fetch a room by id
 * 
 * @param id The room id to match
 * @return Promise Returns a promise of the query
 */
RoomsSchema.statics.findByIdQ = function (id) {
	return RoomModel
		.where({
			_id: id
		})
		.findOneQ()
};

/**
 * Schema method to check if a user is involved with the room
 * 
 * @param room The room instance to compare at
 * @param userId The user Schema id as string
 * @return boolean Returns true if the user is involved
 */
isPeer = (room, userId) => {
	return _.isEqual(room.user, userId) || _.some(room.peers, function (v) {
		return v === userId;
	});
};

/**
 * Generates an unique sharable key
 * 
 * @param room The room to set the sharable key at
 */
generateKey = (room, callback) => {
	var model = mongoose.model(RoomsSchemaName, RoomsSchema);

	var key = hat();

	model.findOne({
		code: key
	}, (err, result) => {
		if (!callback) return;

		if (result === null) {
			callback(key);
		} else {
			generateKey(room, callback);
		}
	})
};

const RoomModel = mongoose.model(RoomsSchemaName, RoomsSchema)

exports.Model = RoomModel;
exports.Schema = RoomsSchema;
exports.SchemaName = RoomsSchemaName;