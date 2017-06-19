/**
 * [DEPRECATED], app now uses Promises (Q) from the mongoose-promised API,
 * if you like callback-hell, you can use this instead.
 */

/*!
 * MongooseModelLoader
 * Copyright(c) 2016 Shane van den Bogaard
 * License: MIT
 */

'use strict';

/**
 * Simple mongoose model loader class
 *
 * @param connectionstr The connection string to connect to the mongoDb server
 * @todo upload to npmjs (?), keep as dependency in package json
 * @exmaple
 * var loader = require((path)'model-loader(.js)')(connection);
 * 
 * // in app:
 * loader.getModel(MODEL, HTTP_REPONSE, PREDICATE, function(result) { use_model_here });
 */
var MongooseAutoIncrement = (function () {
    // constructor
    function MongooseAutoIncrement(mongoose) {

    	// var CounterSchema = null;

    	return Object.assign(Object.create(MongooseAutoIncrement.prototype), {
    		mongoose: mongoose
    	});
    }

    return MongooseAutoIncrement;
}());

/**
 * Unified function to return a mongoose model with the given predicate
 *
 * @param model The expected model to load
 * @param predicate The where clause
 */
MongooseAutoIncrement.prototype.increment = function(model) {

	return model;
}

exports = module.exports = MongooseAutoIncrement;