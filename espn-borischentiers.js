var table = document.getElementById('playertable_0');
var tbody = table.getElementsByTagName('tbody')[0];
var rows = tbody.rows;

for (var i = 0; i < rows.length; i++) {
  addSpacer(i);
  var th = rows[i].getElementsByTagName('th')[0];
  if (th) {
    addTierHeader(i);
    i++;
  } else {
    addTierTd(i);
  }
}

function addSpacer(i) {
  var space = rows[i].insertCell();
  space.className = 'sectionLeadingSpacer';
}

function addTierHeader(i) {
  var newTh = document.createElement('th');
  rows[i].appendChild(newTh);
  newTh.innerHTML = 'Boris Chen Tier';
  newTh.rowSpan = 2;
}

function addTierTd(i) {
  var newTd = rows[i].insertCell();
  newTd.innerHTML = i;
  newTd.align = 'center';
}