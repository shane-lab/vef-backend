/*!
 * StreamerContainer
 * Copyright(c) 2016 Shane van den Bogaard
 * License: MIT
 */

'use strict';

var _ = require('lodash');

var cuid = require('cuid');

let Streamer = (() => {

    class Streamer {

        constructor(id, bytes) {
            this.id = id;
            this.key = cuid();
            this.invitees = [];
            this.bytes = bytes || [];
        }

        getKey() {
            return this.key;
        }

        addInvitee(id) {
            if (!this.isInvitee(id)) {
                this.invitees.push(id);
            }
        }

        isInvitee(id) {
            return _.get(this.invitees, id) != null;
        }

        setBytes(bytes) {
            this.bytes = bytes || [];
        }

        getBytes() {
            return bytes;
        }

    }

    return Streamer;
})();

exports = module.exports = Streamer;