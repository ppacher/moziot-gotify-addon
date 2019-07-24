'use strict'

const {
    Adapter,
    Device,
    Property
} = require('gateway-addon');

const request = require('request');

/**
 *  GotifyDevice wraps an a gotify application used to notify a user
 */
class GotifyDevice extends Device {
    constructor(adapter, manifest, name, deviceConfig) {
        super(adapter, name);
        this.notifyActions =  {};
 
        this.title = name;
        this.name = name;
        
        this['@context'] = 'https://iot.mozilla.org/schemas/';
        this.description = 'Gotify Notifications via ' + deviceConfig.name;

        this.config = deviceConfig;
        
        deviceConfig.messages.forEach(msg => this._setupPredefinedAction(msg));

        this._setupAction();
    } 
    
    _setupPredefinedAction(messageConfig) {
        //this.properties.set(messageConfig.title, property);

        this.notifyActions[messageConfig.title] = messageConfig;
        this.addAction(messageConfig.title, {
            name: messageConfig.title,
            metadata: {
                label: 'Send a predefined notification',
            }
        });
        console.log(`added action for ${messageConfig.title}`);
    }
    
    _setupAction() {
        this.addAction('notify', {
            name: 'notify',
            metadata: {
                label: 'Send a notification',
                description: 'Send a notification',
                input: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'The title of the notification'
                        },
                        message: {
                            type: 'string',
                            description: 'The message of the notification'
                        }
                    },
                },
            },
        })
    }
    
    performAction(action) {
        return new Promise((resolve, reject) => {
                let msg = {
                  title: action.input.title,
                  message: action.input.message,
                  priority: action.input.priority,
                }

                if (action.input.title == undefined) {
                    msg = this.notifyActions[action.name]
                }

                action.start();
                console.log(`Sending notification: title=${msg.title} message=${msg.message}`);

                    request.post(`${this.config.serverURL}/message`, {
                        headers: {
                         'X-Gotify-Key': this.config.applicationToken,
                        },
                        json: {
                            message: msg.message,
                            title: msg.title,
                            priority: msg.priority,
                        }
                    }, (err, response, body) => {
                        action.finish();

                        if (!!err) {
                           reject(err);
                           return;
                        }

                        if (response.statusCode !== 200) {
                           reject(body);
                           return;
                        }

                        resolve();
                    })
        });
    }
}

class GotifyAdapter extends Adapter {
    constructor(addonManager, manifest) {
        super(addonManager, GotifyAdapter.name, manifest.name);
        
        addonManager.addAdapter(this);

        (manifest.moziot.config.servers || []).forEach(cfg => {
            const device = new GotifyDevice(this, manifest, cfg.name, cfg)
            this.handleDeviceAdded(device);
            console.log('Device added for ' + cfg.serverURL);
        });
    }
}

module.exports = GotifyAdapter;
