/**
 * Capture Gallery controller to display the preview
 * for the hangout.
 *
 * @constructor
 */
CaptureGalleryController = function() {
  this.momentsTemplate = $('#moments-item-template');
};

/**
 * Initialize the UI..
 */
CaptureGalleryController.prototype.init = function() {
  this.bindUIControls();
  this.renderGallery();
};

/**
 * Bind the UI controlls from the view to their events.
 */
CaptureGalleryController.prototype.bindUIControls = function() {
};

CaptureGalleryController.prototype.renderGallery = function() {
  var self = this;
  chrome.extension.sendRequest({
    service: 'Capture',
    method: 'findAll'
  }, function(res) {
    if (res.status) {
      res.data.forEach(function(moment, index) {
        // DO some preprocessing
        console.log(moment);
        moment.time = $.timeago(new Date(moment.time));
        // Render the template.
        self.momentsTemplate.tmpl(moment).appendTo('.gallery');
      });
    }
    else {
      alert('Error happened ' + res.data);
    }
  });
};