const manifest = require('./manifest.json');
const nodemailer = require('nodemailer');

const {
  Constants,
  Database,
  Notifier,
  Outlet,
} = require('gateway-addon');

const config = {
  email: null,
  password: null,
  host: 'smtp.gmail.com',
  port: 465,
};

function createTransport() {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: true,
    requireTLS: true,
    auth: {
      user: config.email,
      pass: config.password,
    },
  });
}

function getMailOptions() {
  return {
    from: config.email,
    to: config.email,
    subject: '',
    text: '',
  };
}

function sendEmail(to, subject, body) {
  const transport = createTransport();
  return new Promise(function(resolve, reject) {
    transport.sendMail(Object.assign(getMailOptions(), {
      to: to,
      subject: subject,
      text: body,
    }), function(error, response) {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * An email sending outlet
 */
class EmailSenderOutlet extends Outlet {
  /**
   * @param {EmailSenderNotifier} notifier
   * @param {string} id - A globally unique identifier
   */
  constructor(notifier, id) {
    super(notifier, id);
    this.name = 'Email Sender';
  }

  async notify(title, message, level) {
    console.log(
      `Sending email with subject "${title}", message "${
        message}", and level "${level}"`
    );

    switch (level) {
      case Constants.NotificationLevel.LOW:
      case Constants.NotificationLevel.NORMAL:
        title = `(NOTICE) ${title}`;
        break;
      case Constants.NotificationLevel.HIGH:
        title = `(ALERT) ${title}`;
        break;
    }

    await sendEmail(config.email, title, message);
  }
}

/**
 * Email Sender Notifier
 * Instantiates one email sender outlet
 */
class EmailSenderNotifier extends Notifier {
  constructor(addonManager) {
    super(addonManager, 'email-sender', manifest.id);

    addonManager.addNotifier(this);

    const db = new Database(manifest.id);
    db.open().then(() => {
      return db.loadConfig();
    }).then((cfg) => {
      Object.assign(config, cfg);

      if (!this.outlets['email-sender-0']) {
        this.handleOutletAdded(new EmailSenderOutlet(this, 'email-sender-0'));
      }
    }).catch(console.error);
  }
}

module.exports = EmailSenderNotifier;
