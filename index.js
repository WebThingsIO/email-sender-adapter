/**
 * index.js - Loads the email sender adapter
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const EmailSenderAdapter = require('./email-sender-adapter');

module.exports = (addonManager) => {
  new EmailSenderAdapter(addonManager);

  try {
    const EmailSenderNotifier = require('./email-sender-notifier');
    new EmailSenderNotifier(addonManager);
  } catch (e) {
    if (!(e instanceof TypeError)) {
      console.error(e);
    }
  }
};
