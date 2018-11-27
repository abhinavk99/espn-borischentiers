const UNRANKED_TEXT = 'Unranked';
const TIER_NOT_FOUND = 'N/A';
const TABLE_ID = 'playertable_0';
const PLAYER_ROW_ID_1 = 'pncPlayerRow';
const PLAYER_ROW_ID_2 = 'plyr';
const CELL_ALIGN = 'center';
const COLUMN_NAME = 'Boris Chen Tier';
const SPACER_CLASS = 'sectionLeadingSpacer';
const SCORING_STORAGE_ID = 'scoring';
const TIER = 'tier';
const DEFAULT_SCORING = 'ppr';

const DEFENSE = 'D/ST';
const QB = 'QB';
const RB = 'RB';
const WR = 'WR';
const TE = 'TE';
const KICKER = 'K';

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

// Get table of players
const table = document.getElementById(TABLE_ID);
const tbody = table.getElementsByTagName('tbody')[0];
const rows = tbody.rows;

var promises = Object.keys(links).map(pos => setTierInfo(pos));
Promise.all(promises)
  .then(responses => {
    // Add the cell for each player
    // If first cell in the row is a header, add header
    // Otherwise if the row is for a player, add the tier cell
    for (var i = 0; i < rows.length; i++) {
      addSpacer(i);
      var th = rows[i].getElementsByTagName('th')[0];
      if (th)
        addTierHeader(i);
      else if (isPlayerRow(i))
        addTierTd(i);
    }
  })
  .catch(e => { });

/* Checks whether the row in the table stores a player */
function isPlayerRow(i) {
  return rows[i].id.startsWith(PLAYER_ROW_ID_1)
      || rows[i].id.startsWith(PLAYER_ROW_ID_2);
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

/* Add spacer cell */
function addSpacer(i) {
  var space = rows[i].insertCell();
  space.className = SPACER_CLASS;
}

/* Add header cell */
function addTierHeader(i) {
  var newTh = document.createElement('th');
  rows[i].appendChild(newTh);
  newTh.innerHTML = COLUMN_NAME;
  newTh.rowSpan = 2;
}

/* Add tier cell */
function addTierTd(i) {
  var newTd = rows[i].insertCell();
  getTierText(i).then(tier => newTd.innerHTML = tier);
  newTd.align = CELL_ALIGN;
}

/* Set the tier in the cell */
function getTierText(i) {
  return new Promise((resolve, reject) => {
    var playerInfo = rows[i].getElementsByTagName('td')[1].innerText;
    var [name, position] = playerInfo.split(/,\s+/);
    name = name.trim();

    // Gets scoring type (STD, 0.5 PPR, PPR)
    browser.storage.sync.get(SCORING_STORAGE_ID)
      .then(scoringRes => {
        var scoringType = scoringRes[SCORING_STORAGE_ID];
        if (!scoringType)
          scoringType = DEFAULT_SCORING;

        // Gets the tier info of the player's position
        var tierInfo;
        if (name.includes(DEFENSE)) {
          pos = DEFENSE;
          name = name.split(/\s+/)[0];
          tierInfo = tiers.dst;
        } else if (position.includes(QB)) {
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
        } else if (position.includes(' ' + KICKER + ' ')
                || position.endsWith(KICKER)) {
          pos = KICKER;
          tierInfo = tiers.k;
        }

        var tier = getTierFromName(name, tierInfo);
        if (tier == TIER_NOT_FOUND)
          return resolve(UNRANKED_TEXT);
        return resolve(pos + ' ' + TIER + ' ' + tier);
      });
  });
}

/* Get the tier of a player from the name and tier information */
function getTierFromName(name, tierInfo) {
  var lines = tierInfo.split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].includes(name))
      return i + 1;
  }
  return TIER_NOT_FOUND;
}
