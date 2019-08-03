'use strict'

const {
    Adapter,
    Device,
    Notifier,
    Outlet,
    Constants
} = require('gateway-addon');

const notify = require("./notify");

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
        action.start();

        let title = action.input.title;
        let message = action.input.message;
        let priority = action.input.priority;

        if (!title) {
            const msg = this.notifyActions[action.name];
            title = msg.title;
            message = msg.message;
            priority = msg.priority;
        }

        return notify(this.config.serverURL, this.config.applicationToken, title, message, priority || 0)
                .catch(() => {})
                .then(() => action.finish());
    }
}

class GotifyOutlet extends Outlet {
    constructor(notifier, config) {
        super(notifier, config.name);
        
        this.name = config.name;
        this.config = config;
    }
    
    notify(title, message, level) {
        let priority = 0;

        switch (level) {
        case Constants.NotificationLevel.LOW:
            priority = 1;
            break;
        case Constants.NotificationLevel.NORMAL:
            priority = 5;
            break;
        case Constants.NotificationLevel.HIGH:
            priority = 9;
            break;
        }

        return notify(this.config.serverURL, this.config.applicationToken, title, message, priority);
    }
}

class GotifyNotifier extends Notifier {
    constructor(addonManager, manifest) {
        super(addonManager, GotifyNotifier.name, manifest.name);

        addonManager.addNotifier(this);

        (manifest.moziot.config.servers || []).forEach(cfg => {
            if (!this.outlets[cfg.name]) {
                const outlet = new GotifyOutlet(this, cfg);
                this.handleOutletAdded(outlet);
            }
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

module.exports = {
    GotifyAdapter,
    GotifyNotifier
};
