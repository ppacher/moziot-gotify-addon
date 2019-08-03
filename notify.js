/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.*
 */

const request = require('request');

function sendNotification(server, token, title, message, priority) {
    return new Promise((resolve, reject) => {
        console.log(`Sending notification: title="${title}" message="${message}" priority=${priority}`);
        request.post(`${server}/message`, {
            headers: {
             'X-Gotify-Key': token,
            },
            json: {
                message: message,
                title: title,
                priority: priority,
            }
        }, (err, response, body) => {
            if (!!err) {
               console.error(err);
               reject(err);
               return;
            }

            if (response.statusCode !== 200) {
               console.error(err);
               reject(body);
               return;
            }
            console.log(`Notification sent`);
            resolve();
        });
    });
}

module.exports = sendNotification;