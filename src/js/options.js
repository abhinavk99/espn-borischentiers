$(document).ready(() => {
  chrome.storage.sync.get([SCORING_STORAGE_ID, COLORS_ID], res => {
    // Set radio button in options page to whatever scoring has been saved
    if (res[SCORING_STORAGE_ID] == STD) {
      $('#' + STD).prop('checked', true);
    } else if (res[SCORING_STORAGE_ID] == HALFPPR) {
      $('#' + HALFPPR).prop('checked', true);
    } else {
      // Default is PPR if nothing has been saved yet
      if (!res[SCORING_STORAGE_ID]) {
        let scoringSave = {};
        scoringSave[SCORING_STORAGE_ID] = PPR;
        chrome.storage.sync.set(scoringSave);
      }
      $('#' + PPR).prop('checked', true);
    }

    // Set toggle button to true if colors setting is set to true
    if (res[COLORS_ID])
      $('#' + COLORS_ID).prop('checked', true);
  });

  $(RADIO_BUTTON_NAME).change(() => {
    // Save new scoring when different scoring is selected in radio button
    let scoring = $(RADIO_BUTTON_NAME + ':checked').val();
    chrome.storage.sync.set({ [SCORING_STORAGE_ID] : scoring });
  });

  $(SWITCH_NAME).change(() => {
    // Save colors setting when toggle switched changes state
    let checked = $('#' + COLORS_ID).is(':checked');
    chrome.storage.sync.set({ [COLORS_ID] : checked });
  });
});