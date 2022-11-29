if (Array.isArray(directive)) {
  directive = directive.join(",");
}
// Send directive to background.js
chrome.runtime.sendMessage(
  {
    directive: directive,
  },
  function(response) {
    // this.close();
  }
);

/**
 * Execute js files recursively
 * @param {number|null} tabId 
 * @param {object} injectDetailsArray 
 */
 function executeScripts(tabId, injectDetailsArray) {
  function createCallback(tabId, injectDetails, innerCallback) {
    return function () {
      chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
    };
  }
  var callback = null;
  for (var i = injectDetailsArray.length - 1; i >= 0; --i)
    callback = createCallback(tabId, injectDetailsArray[i], callback);
  if (callback !== null) callback(); // execute outermost function
}
/**
 * Execute css files recursively
 * @param {number|null} tabId 
 * @param {object} injectDetailsArray 
 */
function insertCSSs(tabId, injectDetailsArray) {
  function createCallback(tabId, injectDetails, innerCallback) {
    return function () {
      chrome.tabs.insertCSS(tabId, injectDetails, innerCallback);
    };
  }
  var callback = null;
  for (var i = injectDetailsArray.length - 1; i >= 0; --i)
    callback = createCallback(tabId, injectDetailsArray[i], callback);
  if (callback !== null) callback(); // execute outermost function
}