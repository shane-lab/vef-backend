let mongoose = require('mongoose');

module.exports = {
    /**
     * Convert a string to Mongoose' ObjectId
     * 
     * @param id The string value to convert
     * @return ObjectId Returns the string as ObjectId value
     */
    stringAsObjectId: (str) => {
        var mongooseId = null;
        try {
            str = (str || '');
            mongooseId = mongoose.Types.ObjectId(str)
        } catch (err) { 
            // mongooseId = str;
        }

        return mongooseId;
    },

}