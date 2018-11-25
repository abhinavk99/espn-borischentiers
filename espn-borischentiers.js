const links = {
  qb: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_QB.txt',
  rbstd: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_RB.txt',
  rbhalf: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_RB-HALF.txt',
  rbppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_RB-PPR.txt',
  wrstd: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_WR.txt',
  wrhalf: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_WR-HALF.txt',
  wrppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_WR-PPR.txt',
  testd: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_TE.txt',
  tehalf: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_TE-HALF.txt',
  teppr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_TE-PPR.txt',
  dst: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_DST.txt',
  k: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_K.txt'
};
const tiers = {
  qb: '',
  rbstd: '',
  rbhalf: '',
  rbppr: '',
  wrstd: '',
  wrhalf: '',
  wrppr: '',
  testd: '',
  tehalf: '',
  teppr: '',
  dst: '',
  k: ''
};

// Get table of players
const table = document.getElementById('playertable_0');
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
      if (th) {
        addTierHeader(i);
      } else if (rows[i].id.startsWith('pncPlayerRow') || rows[i].id.startsWith('plyr')) {
        addTierTd(i);
      }
    }
  });

/* Set tier info from Boris Chen for each position */
function setTierInfo(pos) {
  return new Promise((resolve, reject) => {
    window.fetch(links[pos])
      .then(response => response.text())
      .then(body => {
        tiers[pos] = body;
        return resolve('');
      });
  });
}

/* Add spacer cell */
function addSpacer(i) {
  var space = rows[i].insertCell();
  space.className = 'sectionLeadingSpacer';
}

/* Add header cell */
function addTierHeader(i) {
  var newTh = document.createElement('th');
  rows[i].appendChild(newTh);
  newTh.innerHTML = 'Boris Chen Tier';
  newTh.rowSpan = 2;
}

/* Add tier cell */
function addTierTd(i) {
  var newTd = rows[i].insertCell();
  newTd.innerHTML = getTierText(i);
  newTd.align = 'center';
}

/* Set the tier in the cell */
function getTierText(i) {
  var playerInfo = rows[i].getElementsByTagName('td')[1].innerText;
  var [name, position] = playerInfo.split(', ');
  name = name.trim();

  var tierInfo;
  if (name.includes('D/ST')) {
    pos = 'D/ST';
    name = name.split(' ')[0];
    tierInfo = tiers.dst;
  } else if (position.includes('QB')) {
    pos = 'QB';
    tierInfo = tiers.qb;
  } else if (position.includes('RB')) {
    pos = 'RB';
    tierInfo = tiers.rbhalf;
  } else if (position.includes('WR')) {
    pos = 'WR';
    tierInfo = tiers.wrhalf;
  } else if (position.includes('TE')) {
    pos = 'TE';
    tierInfo = tiers.tehalf;
  } else if (position.includes(' K ') || position.endsWith('K')) {
    pos = 'K';
    tierInfo = tiers.k;
  }

  var tier = getTierFromName(name, tierInfo);
  if (tier == 'N/A')
    return 'Unranked';
  return `${pos} Tier ${tier}`;
}

/* Get the tier of a player from the name and tier information */
function getTierFromName(name, tierInfo) {
  var lines = tierInfo.split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].includes(name))
      return i + 1;
  }
  return 'N/A';
}