$(document).ready(() => {
  $('#optionsButton').click(() => {
    chrome.runtime.openOptionsPage();
  });
});