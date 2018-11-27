const SCORING_STORAGE_ID = 'scoring';
const RADIO_BUTTON_NAME = "input[name='scoring']";
const CHECKED_PROP = 'checked';

const STD = 'std';
const HALFPPR = 'halfppr';
const PPR = 'ppr';

$(document).ready(() => {
  browser.storage.sync.get(SCORING_STORAGE_ID, res => {
    // Set radio button in options page to whatever scoring has been saved
    if (res.scoring == STD) {
      $('#' + STD).prop(CHECKED_PROP, true);
    } else if (res.scoring == HALFPPR) {
      $('#' + HALFPPR).prop(CHECKED_PROP, true);
    } else {
      // Default is PPR if nothing has been saved yet
      if (!res.scoring) {
        var scoringSave = {};
        scoringSave[SCORING_STORAGE_ID] = PPR;
        browser.storage.sync.set(scoringSave);
      }
      $('#' + PPR).prop(CHECKED_PROP, true);
    }
  });

  $(RADIO_BUTTON_NAME).change(() => {
    // Save new scoring when different scoring is selected in radio button
    var scoringSave = {};
    scoringSave[SCORING_STORAGE_ID] = $(RADIO_BUTTON_NAME + ':' + CHECKED_PROP).val();
    browser.storage.sync.set(scoringSave);
  });
});