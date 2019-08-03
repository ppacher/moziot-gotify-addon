# Gotify Notification Adapter

This repository contains a Gotify notification addon for the [Mozilla WoT Gateway](https://github.com/mozilla-iot/gateway).

For each configured gotify server a WebThing is created with a `notify` action that can be used to send notifications via gotify. Since the Rule engine of the WoT gateway does not yet support parameters, this adapter allows to pre-configure notification messages. For each message a new WebThings action will be created so they can be used in rules as well.

## Configuration

First you need to create a new application token by logging into your gotify-server. Under the `Apps` page click `Create Application`, enter a name and description of your choice and click `CREATE`. Now copy the new application token and open the settings page of mozio-gotify-adapter (`Settings -> Addons -> Gotify Notifications -> Configure`). Now add a new gotify server with the URL of your server and the previously created application token.
