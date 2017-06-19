var mongoose = require('mongoose-promised');
var validators = require('mongoose-validators');
var Schema = mongoose.Schema;

const PeersSchemaName = 'Peers';

const PeersSchema = new Schema({
	room: {
		type: String,
		ref: 'Room'
	},
	user: {
		type: String,
		ref: 'User'
	}
});

exports.Model = mongoose.model(PeersSchemaName, PeersSchema);
exports.Schema = PeersSchema;
exports.SchemaName = PeersSchemaName;