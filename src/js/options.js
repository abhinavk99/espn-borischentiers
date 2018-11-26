$(document).ready(() => {
  browser.storage.sync.get('scoring', res => {
    if (res.scoring == 'std') {
      $('#std').prop('checked', true);
    } else if (res.scoring == 'halfppr') {
      $('#halfppr').prop('checked', true);
    } else {
      // Set default scoring to PPR
      if (!res.scoring)
        browser.storage.sync.set({ scoring: 'ppr' });
      $('#ppr').prop('checked', true);
    }
  });

  $("input[name='scoring']").change(() => {
    browser.storage.sync.set({ scoring: $("input[name='scoring']:checked").val() });
  });
});