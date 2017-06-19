/**
 * @apiDefine UnprocessableEntity
 * 
 * @apiError UnprocessableEntity Unable to fetch an entity with the provived paramers and/or headers
 * 
 * @apiErrorExample Error-Response 422:
 *  HTTP/1,1 422 Unprocessable Entity
 *  {
 *      "error": "Unprocessable Entity"
 *  }
 */

/**
 * @apiDefine Unauthorized
 * 
 * @apiError Unauthorized The issuer is not authorized to issue the request
 * 
 * @apiErrorExample Error-Response 401:
 *  HTTP/1,1 401 Unauthorized
 *  {
 *      "error": "Unauthorized"
 *  }
 */

/**
 * @apiDefine BadRequest
 * 
 * @apiError BadRequest The request contains invalid parameters and/or headers
 * 
 * @apiErrorExample Error-Response 400:
 *  HTTP/1,1 400 Bad Request
 *  {
 *      "error": "Bad request"
 *  }
 */

/**
 * @apiDefine JWTHeader
 * 
 * @apiHeader Authorization API user access-token verification using JSON Web Tokens
 * 
 * @apiHeaderExample {json} Request-Example:
 *  {
 *      "Authorization": "JWT 'access token'"
 *  }
 */

// generics:

/**
 * @api {get} / Request entry points
 * @apiName Entry points
 * @apiGroup Generics
 */

/**
 * @api {get} /info/ Request backend info
 * @apiName Backend info
 * @apiGroup Generics
 */

/**
 * @api {post} /authenticate/ Authenticate API account
 * @apiName Authenticate account
 * @apiGroup Generics
 * 
 * @apiParam {String} email Mandatory email value
 * @apiParam {String} password Mandatory password value
 * 
 * @apiUse BadRequest
 * @apiUse UnprocessableEntity
 */

// users:

/**
 * @api {get} /users/me/ Request user info
 * @apiName User details
 * @apiGroup Users
 * 
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

// rooms:

/**
 * @api {post} /rooms/ Create a new rooms
 * @apiName Rooms create
 * @apiGroup Rooms
 * 
 * @apiParam {String} title Mandatory title value
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {get} /rooms/:room_id Request a specific room
 * @apiName Room get
 * @apiGroup Rooms
 * 
 * @apiParam {String} _room_id The room id
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {put} /rooms/:room_id Edit a specific room
 * @apiName Room Edit
 * @apiGroup Rooms
 * 
 * @apiParam {String} _room_id The room id
 * 
 * @apiParam {String} [title] The title value
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {delete} /rooms/:room_id Delete a specific room
 * @apiName Room delete
 * @apiGroup Rooms
 * 
 * @apiParam {String} _room_id The room id
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {post} /rooms/:room_id/join/ Join a specific room
 * @apiName Room join
 * @apiGroup Rooms
 * 
 * @apiParam {String} _room_id The room id
 * 
 * @apiParam {String} token Mandatory the access token of the room
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {post} /rooms/:room_id/close/ Close a specific room
 * @apiName Room close
 * @apiGroup Rooms
 * 
 * @apiParam {String} _room_id The room id
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

// markers:

/**
 * @api {get} /markers/:marker_id Request a specific marker
 * @apiName Marker get
 * @apiGroup Markers
 * 
 * @apiParam {String} _marker_id The marker id
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {put} /markers/:marker_id Edit a specific marker
 * @apiName Marker edit
 * @apiGroup Markers
 * 
 * @apiParam {String} _marker_id The marker id
 * 
 * @apiParam {String} [message] The message value
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {delete} /markers/:marker_id Delete a specific marker
 * @apiName Marker delete
 * @apiGroup Markers
 * 
 * @apiParam {String} _marker_id The marker id
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {get} /markers/room/:room_id Request all markers of a specific room
 * @apiName Markers room get
 * @apiGroup Markers
 * 
 * @apiParam {String} _room_id The room id
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

/**
 * @api {post} /markers/room/:room_id Create a new marker for a specific room
 * @apiName Markers room create
 * @apiGroup Markers
 * 
 * @apiParam {String} _room_id The room id
 * 
 * @apiParam {String} [message] The message value
 * 
 * @apiUse BadRequest
 * @apiUse Unauthorized
 * @apiUse UnprocessableEntity
 * @apiUse JWTHeader
 */

// temporary

/**
 * @api {get} /rooms/ Request all rooms
 * @apiName Rooms get
 * @apiGroup Temporary
 */

/**
 * @api {get} /markers/ Request all markers
 * @apiName Markers get
 * @apiGroup Temporary
 */

/**
 * @api {get} /users/ Request all users
 * @apiName Users get
 * @apiGroup Temporary
 */