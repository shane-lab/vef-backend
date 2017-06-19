var bcrypt = require('bcryptjs');

var methods = require('../modules/mongoose-helper');

var mongoose = require('mongoose-promised');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

const UsersSchemaName = 'Users';

const UsersSchema = new Schema({
    // corresponds as fhict i-account, generic name for other institutions(?)
    // accountNr: {
    // 	type: String,
    // 	index: true,
    // 	required: true,
    // 	unique: true,
    // 	dropDups: true,
    // 	validate: []
    // },
    firstName: {
        type: String,
        index: false,
        required: true,
        unique: false,
        dropDups: false,
        validate: [validators.isLength(1, 45)]
    },
    lastName: {
        type: String,
        index: false,
        required: true,
        unique: false,
        dropDups: false,
        validate: [validators.isLength(1, 128)]
    },
    createdAt: {
        type: Date,
        index: true,
        required: true,
        unique: false,
        dropDups: false,
        default: Date.now,
        validate: []
    },
    // TODO remove password and email, use OAUTH authentication and use accountNr field
    email: {
        type: String,
        index: true,
        required: true,
        unique: true,
        dropDups: false,
        validate: [validators.isEmail()]
    },
    password: {
        type: String,
        index: true,
        required: true,
        unique: false,
        dropDups: false,
        validate: [validators.isLength(1, 128)],
    }
});

// Hashes the entered password and generates an API key before the model is saved
UsersSchema.pre('save', function (next) {
    let user = this;

    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    return next(err);
                }

                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

/**
 * Schema method to compare password hashes
 * 
 * @param passw The password hash to compare
 * @param callback The callback to run to fetch the result of the comparison
 */
UsersSchema.methods.comparePassword = function (passw, callback) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
        if (err) {
            return callback(err);
        }

        callback(null, isMatch);
    });
};

/**
 * Schema method to fetch an user by id
 * 
 * @param id The user id to match
 * @return Promise Returns a promise of the query
 */
UsersSchema.statics.findByIdQ = function (id) {
    return UserModel
        .where({
            _id: id
        })
        .findOneQ()
};

const UserModel = mongoose.model(UsersSchemaName, UsersSchema)

exports.Model = UserModel;
exports.Schema = UsersSchema;
exports.SchemaName = UsersSchemaName;