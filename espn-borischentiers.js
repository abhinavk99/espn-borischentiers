const links = {
  qb: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_QB.txt',
  rb: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_RB-HALF.txt',
  wr: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_WR-HALF.txt',
  te: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_TE-HALF.txt',
  dst: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_DST.txt',
  k: 'https://s3-us-west-1.amazonaws.com/fftiers/out/text_K.txt'
};
const tiers = { qb: '', rb: '', wr: '', te: '', dst: '', k: '' };

const table = document.getElementById('playertable_0');
const tbody = table.getElementsByTagName('tbody')[0];
const rows = tbody.rows;

Object.keys(links).forEach(function (key, index) {
  window.fetch(links[key])
    .then(response => {
      console.log(response.url);
      return response.text();
    })
    .then(body => {
      console.log(body);
      tiers[key] = tierInfo;
    });
});

for (var i = 0; i < rows.length; i++) {
  addSpacer(i);
  var th = rows[i].getElementsByTagName('th')[0];
  if (th) {
    // If first cell in the row is a header, add header
    addTierHeader(i);
    i++;
  } else {
    // Otherwise, add the tier cell
    addTierTd(i);
  }
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
  setTier(i, newTd);
  newTd.align = 'center';
}

/* Set the tier in the cell */
function setTier(i, newTd) {
  newTd.innerHTML = i;
}