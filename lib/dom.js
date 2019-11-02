let dom = {}

// Promise which is resolved when the DOM content is loaded.
dom.contentLoaded = new Promise((resolve, reject) => {
  document.addEventListener("DOMContentLoaded", resolve);
});

// Returns the value of a DOM element.
//
// Element is identified by its id and is usually an input.
dom.getValue = function(elementId) {
  return document.getElementById(elementId).value;
}

// Sets the value of a DOM element.
//
// Element is identified by its id and is usually an input.
dom.setValue = function(elementId, value) {
  document.getElementById(elementId).value = value;
}

// Clears the value of a DOM element.
//
// Element is identified by its id and is usually an input.
dom.clearValue = function(elementId) {
  dom.setValue(elementId, "");
}

// Adds a click listener to a DOM element.
//
// Element is identified by its id and is usually a button.
dom.addClickListener = function(elementId, handler) {
  document.getElementById(elementId).addEventListener("click", handler);
}
