/* 
		You can modify its contents.
*/
const extend = require('js-base/core/extend');
const PgHttpDesign = require('ui/ui_pgHttp');
const Picker = require("sf-core/ui/picker");
const Http = require("sf-core/net/http");
const Color = require('sf-core/ui/color');
const PgHttp = extend(PgHttpDesign)(
  // Constructor
  function(_super) {
    // Initalizes super class for this page scope
    _super(this);
    // overrides super.onShow method
    this.onShow = onShow.bind(this, this.onShow.bind(this));
    // overrides super.onLoad method
    this.onLoad = onLoad.bind(this, this.onLoad.bind(this));

  });

/**
 * @event onShow
 * This event is called when a page appears on the screen (everytime).
 * @param {function} superOnShow super onShow function
 * @param {Object} parameters passed from Router.go function
 */
function onShow(superOnShow) {
  superOnShow();
  const page = this;
  var scrollHeight = 0;
  for (let cname in page.scroll.childen) {
    let c = page.scroll.childen[cname];
    scrollHeight += (c.height || 0);
  }
  page.scroll.layout.height = scrollHeight || 890;
}

/**
 * @event onLoad
 * This event is called once when page is created.
 * @param {function} superOnLoad super onLoad function
 */
function onLoad(superOnLoad) {
  superOnLoad();
  const page = this;

  page.lblMethod.onTouchEnded = function() {
    var items = [
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "DELETE",
      "CONNECT",
      "OPTIONS",
      "TRACE",
      "PATCH"
    ];
    var options = {
      items: items,
    };
    var index = items.indexOf(page.lblMethod.text);
    if (index !== -1)
      options.currentIndex = index;
    var myPicker = new Picker(options);

    var okCallback = function(params) {
      page.lblMethod.text = items[params.index];
    };
    var cancelCallback = function() {

    };
    myPicker.show(okCallback, cancelCallback);
  };
  var timerID, request, completed = true;
  page.btnSend.onPress = function() {
    if (!completed && request) {
      request.cancel();
      clearTimeout(timerID);
    }
    var http = new Http();
    completed = false;
    var options = {
      'url': page.tbUrl.text,
      'method': page.lblMethod.text,
      onLoad: function(response) {
        completed = true;
        page.lblResponse.text = bodyParser(arguments);
        page.lblResponse.textColor = Color.BLACK;
        clearTimeout(timerID);
      },
      onError: function(e) {
        completed = true;
        page.lblResponse.text = bodyParser(arguments);
        page.lblResponse.textColor = Color.RED;
        clearTimeout(timerID);
      }
    };
    var bodyText = page.taBody.text.trim();
    if (bodyText)
      options.body = bodyText;
    var headerText = page.taHeaders.text.trim();
    if (headerText)
      options.headers = JSON.parse(headerText);
    page.lblResponse.text = "IN PROGRESS";
    page.lblResponse.textColor = Color.BLUE;
    timerID = setTimeout(function() {
      if (!completed && request) {
        request.cancel();
        page.lblResponse.text = "TIME OUT";
        page.lblResponse.textColor = Color.MAGENTA;
      }
    }, 180000);
    request = http.request(options);
  };

  page.tbUrl.onActionButtonPress = closeKeyb;
}

function closeKeyb() {
  this.removeFocus();
}

function bodyParser(args_) {
  var args = Array.prototype.slice.call(args_);
  if (typeof args[0] === "object" && args[0].body) {
    args[0].body = args[0].body.toString();
  }
  return JSON.stringify(args, null, "\t");
}

module && (module.exports = PgHttp);
