'use strict'

const {
    Adapter,
    Device,
    Property
} = require('gateway-addon');

const request = require('request');

/**
 * Until github.com/mozilla-iot/gateway supports notifications (upcoming 0.9.0) release
 * we wrap predefined messages into properties that can be "triggered". 
 */
class GotifyProperty extends Property {
    constructor(device, name, propertyDescr, cfg) {
        super(device, name, propertyDescr);
        this.setCachedValue(false);
        this.cfg = cfg;
        this.device.notifyPropertyChanged(this);
    }

    setValue(value) {
        return new Promise((resolve, reject) => {
            console.log(`sending notification: title=${this.cfg.title} message=${this.cfg.message}`)
            // we never change our value
            resolve(false);
        });
    }
}

/**
 *  GotifyDevice wraps an a gotify application used to notify a user
 */
class GotifyDevice extends Device {
    constructor(adapter, name, deviceConfig) {
        super(adapter, name);
        this.config = deviceConfig;
        
        deviceConfig.messages.forEach(msg => this._setupProperty(msg));

        this._setupAction();
    } 
    
    _setupProperty(messageConfig) {
        const property = new GotifyProperty(this, messageConfig.title, {
            title: messageConfig.title,
            type: 'boolean',
            '@type': 'AlarmProperty',
        }, messageConfig)
        
        this.properties.set(messageConfig.title, property);
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
        action.start();
        console.log(`Sending notification: title=${action.input.title} message=${action.input.message}`);
        action.finish();
    }
}

class GotifyAdapter extends Adapter {
    constructor(addonManager, manifest) {
        super(addonManager, GotifyAdapter.name, manifest.name);
        
        addonManager.addAdapter(this);
        
        (manifest.moziot.config || []).forEach(cfg => {
            const device = new GotifyDevice(this, cfg.name, cfg)
            this.handleDeviceAdded(device);
        });
    }
}

module.exports = GotifyAdapter;