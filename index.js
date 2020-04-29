/**
 * index.js - Loads the email sender adapter
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const {Database} = require('gateway-addon');
const EmailSenderAdapter = require('./email-sender-adapter');
const manifest = require('./manifest.json');

module.exports = (addonManager, _, errorCallback) => {
  const db = new Database(manifest.id);
  db.open().then(() => {
    return db.loadConfig();
  }).then((config) => {
    if (!config.disableDevice) {
      new EmailSenderAdapter(addonManager, config);
    }

    try {
      const EmailSenderNotifier = require('./email-sender-notifier');
      new EmailSenderNotifier(addonManager, config);
    } catch (e) {
      if (!(e instanceof TypeError)) {
        console.error(e);
      }
    }
  }).catch((e) => {
    errorCallback(manifest.id, `${e}`);
  });
};
