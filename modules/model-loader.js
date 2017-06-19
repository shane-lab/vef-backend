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

// load dependencies:
var _ = require('lodash');

/**
 * Simple mongoose model loader class
 *
 * @param connectionstr The connection string to connect to the mongoDb server
 * @example
 * var loader = require((path)'model-loader(.js)')('connection string here');
 * 
 * // in app:
 * loader.getModel(MODEL, HTTP_REPONSE, PREDICATE, function(result) { use_model_here });
 */
var MongooseModelLoader = (function () {
    // constructor
    function MongooseModelLoader(connectionstr) {
    	// fetch mongo and attempt to connect to the given connection
    	var mongoose = require('mongoose');
    	mongoose.connect(connectionstr);

    	// copy prototype
    	return Object.assign(Object.create(MongooseModelLoader.prototype), {
    		mongoose: mongoose
    	});
    }

    return MongooseModelLoader;
}());

/**
 * Unified function to return a mongoose model with the given predicate
 *
 * @param model The expected model to load
 * @param response The router response object
 * @param predicate The where clause
 * @param callback The callback function, returns the result as argument
 */
MongooseModelLoader.prototype.getModel = function(model, response, predicate, callback) {
	if (_.isFunction(callback)) {
		if (_.isPlainObject(predicate)) {
			if (model !== undefined && model != null) {
				var query = model.where(predicate);
				query.find(function(err, object) {
					if (!_.isEmpty(object)) {
						// result OK, return the given room
						callback(_result(200, object));
					} else {
						callback(_result(404, { message: 'room not found'}))
					}
				});
			} else {
				callback(_result(500, { message: 'model `rooms` not found'}))
			}
		} else {
			callback(_result(500, { message: 'no predicate was given'}))
		}
	} else {
		var res = _result(500, { message: 'the given callback is not a function'});
		response.status(res.status).json(res);
	}
}

/**
 * The object result of the model request, used to keep the model result uniform
 *
 * @param status The status of the request, default 500
 * @param params The result of the request
 */
function _result(status, params) {
	var result = params !== undefined && params != null ? 
		params : 
		{}
	// add result status, default 500
	result.status = status !== undefined && status != null ? 
		status : 
		500

	return result;	
}

exports = module.exports = MongooseModelLoader;