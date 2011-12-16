/**
 * Incharge of circle notifications.
 *
 * @author Mohamed Mansour 2011 (http://mohamedmansour.com)
 */
CircleNotifier = function(updater) {
  this.updater =  updater;
  this.controller = updater.controller;
  this.circles_to_notify = {};
  this.notify_circles = false;
  this.initializeListeners();
  this.notified = {};
  this.notification = null;
};

/**
 * Initialize listeners for the settings.
 */
CircleNotifier.prototype.initializeListeners = function() {
  settings.addListener('circles_to_notify', this.onSettingsChangeListener.bind(this));
  settings.addListener('notify_circles', this.onSettingsChangeListener.bind(this));
  this.onSettingsChangeListener('circles_to_notify', settings.circles_to_notify);
  this.onSettingsChangeListener('notify_circles', settings.notify_circles);
};

/**
 * Figure out if we should notify any participant in this hangout.
 */
CircleNotifier.prototype.notify = function(hangouts) {
  // Only notify if the user permits.
  if (!this.notify_circles) {
    return;
  }
  var notifyCount = 0;
  for (var h in hangouts) {
    var hangout = hangouts[h];
    this.notified[hangout.data.id] = this.notified[hangout.data.id] || {};
    for (var p in hangout.data.participants) {
      var participant = hangout.data.participants[p];
      if (participant.circle_ids && participant.status) {
        if (!this.notified[hangout.data.id][participant.id]) {
          for (var c in participant.circle_ids) {
            var circleID = participant.circle_ids[c];
            if (this.circles_to_notify[circleID]) {
              this.notified[hangout.data.id][participant.id] = true;
              notifyCount++;
              console.log('NOTIFY USER ', participant.name);
            }
          }
        }
        else {
          this.notified[hangout.data.id][participant.id] = {};
        }
      }
    }
  }
  // Only display notifications if anything exists.
  if (notifyCount > 0) {
    this.showNotification();
  }
};

/**
 * Shows the HTML5 notification popup, if it is already visible, it will 
 * update it in realtime so the user will not have many notifications.
 */
CircleNotifier.prototype.showNotification = function() {
  if (this.notification) {
    this.sendNotificationUpdate();
  }
  else {
    this.notification = this.createNotification();
    this.notification.show();
  }
};

/**
 * Since we live in the extension context, we have total control of the views
 * in this regard, we send data to the controller.
 */
CircleNotifier.prototype.sendNotificationUpdate = function() {
  chrome.extension.getViews({type:'notification'}).forEach(function(win) {
    win.controller.refresh();
  });
};

/**
 * Creates a new HTML5 Notification and registers some events so we can send
 * data back to it when it is already visible.
 */
CircleNotifier.prototype.createNotification = function() {
  var notification = webkitNotifications.createHTMLNotification('notification.html');
  notification.ondisplay = this.onNotificationDisplay.bind(this);
  notification.onclose  = this.onNotificationClose.bind(this);
  return notification;
};

/**
 * When a notification is first displayed, once created, it should fetch refresh itself.
 * We are doing this to have a real-time notification.
 */
CircleNotifier.prototype.onNotificationDisplay = function() {
  this.sendNotificationUpdate();
};

/**
 * When a notification is closed, we must destroy the notification so we can recreate it.
 */
CircleNotifier.prototype.onNotificationClose = function() {
  this.notification = null;
};

/**
 * Listen on settings changes in real time.
 * @param {string} key The setting key that has been updated.
 * @param {string} val The new value for that setting.
 */
CircleNotifier.prototype.onSettingsChangeListener = function(key, val) {
  if (key == 'circles_to_notify') {
    this.circles_to_notify = {};
    if (val.length != 0) {
      for (var c in val) {
        this.circles_to_notify[val[c]] = true;
      }
    }
  }
  else if(key == 'notify_circles') {
    this.notify_circles = val;
  }
};
