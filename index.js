/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

'use strict';

const gotify = require('./gotify-adapter');
const {GotifyNotifier, GotifyAdapter} = gotify;

module.exports = (addonManager, manifest, errorCallback) => {
    try {
        new GotifyAdapter(addonManager, manifest);
    } catch(err) {
        errorCallback(manifest.name, err)
    }

    try {
        new GotifyNotifier(addonManager, manifest);
    } catch (err) {
        if (e instanceof TypeError) {
            errorCallback(manifest.name, `Gateway does not support notifieries`);
        } else {
            errorCallback(manifest.name, e);
        }
    }
};
