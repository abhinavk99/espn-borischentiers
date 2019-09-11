const links = {
  qb: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_QB.txt',
  rbstd: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_RB.txt',
  rbhalfppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_RB-HALF.txt',
  rbppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_RB-PPR.txt',
  wrstd: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_WR.txt',
  wrhalfppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_WR-HALF.txt',
  wrppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_WR-PPR.txt',
  testd: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_TE.txt',
  tehalfppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_TE-HALF.txt',
  teppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_TE-PPR.txt',
  dst: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_DST.txt',
  k: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_K.txt'
};
const tiers = {
  qb: '',
  rbstd: '',
  rbhalfppr: '',
  rbppr: '',
  wrstd: '',
  wrhalfppr: '',
  wrppr: '',
  testd: '',
  tehalfppr: '',
  teppr: '',
  dst: '',
  k: ''
};

window.addEventListener('load', function () {
  let promises = Object.keys(links).map(pos => setTierInfo(pos));
  Promise.all(promises)
    .then(_responses => {
      widenTable();
      addBorisChenTiersHTML();
      addRefreshButton();
    })
    .catch(_e => { });
});

function widenTable() {
  const tableWrapper = document.getElementsByClassName(CONTAINER_CLASS)[0];
  tableWrapper.style.width = PLAYERS_TABLE_STYLE_WIDTH;
}

function addRefreshButton() {
  const playersTableControls = document.getElementsByClassName(PLAYERS_TABLE_CONTROLS_CLASS)[0];
  let refreshTiersButton = document.createElement('button');
  refreshTiersButton.innerHTML = REFRESH_TIERS_BUTTON_TEXT;
  refreshTiersButton.className = REFRESH_TIERS_BUTTON_CLASS;
  refreshTiersButton.style = REFRESH_TIERS_BUTTON_STYLE;
  refreshTiersButton.onclick = function () {
    removeOldTiersHTML();
    addBorisChenTiersHTML();
  };
  playersTableControls.appendChild(refreshTiersButton);
}

function removeOldTiersHTML() {
  removeTierHeader();
  const rows = document.getElementsByClassName(TABLE_BODY_CLASS)[0].rows;
  for (let row of rows) {
    removeTierTd(row);
  }
}

function addBorisChenTiersHTML() {
  addTierHeader();
  const rows = document.getElementsByClassName(TABLE_BODY_CLASS)[0].rows;
  for (let row of rows) {
    addTierTd(row);
  }
}

/* Checks whether the row in the table stores a player */
function isPlayerRow(row) {
  return row.children[0].innerText.length > 0;
}

/* Set tier info from Boris Chen for each position */
function setTierInfo(pos) {
  return new Promise((resolve, reject) => {
    window.fetch(links[pos])
      .then(response => response.text())
      .then(body => {
        tiers[pos] = body;
        return resolve(body);
      })
      .catch(e => reject(e));
  });
}

function removeTierHeader() {
  const tierHeader = document.getElementById(TIER_HEADER_ID);
  tierHeader.parentNode.removeChild(tierHeader);
}

/* Add header cell */
function addTierHeader() {
  const headerRow = document.getElementsByClassName(TABLE_HEADER_CLASS)[0].children[0];
  let newTh = document.createElement('th');
  newTh.innerHTML = COLUMN_NAME;
  newTh.id = TIER_HEADER_ID;
  newTh.rowSpan = 2;
  headerRow.appendChild(newTh);
}

function removeTierTd(row) {
  if (!isPlayerRow(row))
    return;
  row.deleteCell(-1);
}

/* Add tier cell */
function addTierTd(row) {
  if (!isPlayerRow(row))
    return;

  let newTd = row.insertCell();
  let div = document.createElement('div');
  div.style.margin = CELL_DIV_MARGIN;
  div.align = CELL_ALIGN;
  newTd.appendChild(div);
  newTd.className = CELL_CLASS;
  getTierText(row).then(tierText => {
    // Set cell text
    div.innerHTML = tierText;

    // Set cell color if not unranked and colors setting is set to true
    if (tierText != UNRANKED_TEXT) {
      chrome.storage.sync.get(COLORS_ID, colorsRes => {
        if (colorsRes[COLORS_ID]) {
          let tierTextWords = tierText.split(/\s+/)
          let tierNumber = parseInt(tierTextWords[tierTextWords.length - 1]);
          let color = COLORS[(tierNumber - 1) % COLORS.length];
          newTd.style = 'background-color:' + color + ';';
        }
      });
    }
  });
}

/* Set the tier in the cell */
function getTierText(row) {
  return new Promise((resolve, reject) => {
    // If on team page, player in cell index 1, otherwise in cell index 0
    let playerIndex = window.location.href.includes('team') ? 1 : 0;
    let playerInfo = row.getElementsByTagName('td')[playerIndex].innerText;
    let splitPlayerInfo = playerInfo.split(/[\r\n]+/);
    let name = splitPlayerInfo[0];
    let position = splitPlayerInfo[splitPlayerInfo.length - 1];
    // Trim name and get the first two words of it
    name = name.trim().split(/\s+/).slice(0, 2).join(' ');

    // Gets scoring type (STD, 0.5 PPR, PPR)
    chrome.storage.sync.get(SCORING_STORAGE_ID, scoringRes => {
      let scoringType = scoringRes[SCORING_STORAGE_ID];
      if (!scoringType)
        scoringType = DEFAULT_SCORING;

      // Gets the tier info of the player's position
      let tierInfo;
      if (name.includes(DEFENSE)) {
        pos = DEFENSE;
        name = name.split(/\s+/)[0];
        tierInfo = tiers.dst;
      } else {
        // Replace ESPN name with Boris Chen name if they are different
        if (playerNameFixes.hasOwnProperty(name))
          name = playerNameFixes[name];

        if (position.includes(QB)) {
          pos = QB;
          tierInfo = tiers.qb;
        } else if (position.includes(RB)) {
          pos = RB;
          tierInfo = tiers[RB.toLowerCase() + scoringType];
        } else if (position.includes(WR)) {
          pos = WR;
          tierInfo = tiers[WR.toLowerCase() + scoringType];
        } else if (position.includes(TE)) {
          pos = TE;
          tierInfo = tiers[TE.toLowerCase() + scoringType];
        } else if (position.includes(NBSP + KICKER + NBSP)
                || position.endsWith(KICKER)) {
          // position is surrounded by NBSP characters, not spaces
          pos = KICKER;
          tierInfo = tiers[KICKER.toLowerCase()];
        }
      }

      let tier = getTierFromName(name, tierInfo);
      if (tier == TIER_NOT_FOUND)
        return resolve(UNRANKED_TEXT);
      return resolve(pos + ' ' + TIER + ' ' + tier);
    });
  });
}

/* Get the tier of a player from the name and tier information */
function getTierFromName(name, tierInfo) {
  let lines = tierInfo.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(name))
      return i + 1;
  }
  return TIER_NOT_FOUND;
}
