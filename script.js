var sortedPoss = JSON.parse(JSON.stringify(fullPoss));
var char = {
  a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0, j: 0, k: 0, l: 0, m: 0,
  n: 0, o: 0, p: 0, q: 0, r: 0, s: 0, t: 0, u: 0, v: 0, w: 0, x: 0, y: 0, z: 0
};
var el = (s) => document.getElementById(s);
var info = { mts: [0, 0, 0, 0, 0], ums: [[], [], [], [], []], lts: [] };
var doc = { mts: el("matches"), dbg: el("debug"), wrds: el("words") };

var tacticalGuess = null;
var tacticalWorker = new Worker("tacticalguess.js");

tacticalWorker.onmessage = (tactical) => {
  tacticalGuess = tactical;
  console.log("tactical guess received");
  renderInfo();
};

// setup
function ready(){
  filterPoss();
  renderInfo();
}

var currentPoss = 0;

window.document.addEventListener("keydown", (key) => {
  var e = (key.key).toLowerCase();
  console.log(e);
  if (e == "backspace") {
    if (currentPoss > 0) currentPoss--;
    var elm = window.document.querySelectorAll(".guessl")[currentPoss];
    elm.textContent = " ";
    return update();
  }

  var elm = window.document.querySelectorAll(".guessl")[currentPoss];
  var alp = "abcdefghijklmnopqrstuvwxyz";
  var valid = false;
  for (i = 0; i < 26; i++) if (e == alp[i]) valid = true;
  if (valid) {
    elm.textContent = e.toUpperCase();
    currentPoss++;
  }

  update();
});

window.document.querySelectorAll(".guessl")
  .forEach(e => { e.setAttribute("onclick", "clicked(this)"); clicked(e); });
window.document.querySelectorAll(".letter")
  .forEach(e => { e.setAttribute("onclick", "clickedlet(this)"); clicked(e); });

function clickedlet(k) {
  var e = k.id;
  if (e == "bkspc") {
    if (currentPoss > 0) currentPoss--;
    var elm = window.document.querySelectorAll(".guessl")[currentPoss];
    elm.textContent = " ";
    return update();
  }

  var elm = window.document.querySelectorAll(".guessl")[currentPoss];
  elm.textContent = e.toUpperCase();
  currentPoss++;

  update();
}

function clicked(k) {
  clickd(k);
  update();
}

function clickd(k) {
  if (k.style.backgroundColor == "rgba(0, 255, 0, 0.2)") return k.style.backgroundColor = "rgba(128, 128, 128, 0.2)";
  if (k.style.backgroundColor == "rgba(128, 128, 128, 0.2)") return k.style.backgroundColor = "rgba(255, 255, 0, 0.2)";
  if (k.style.backgroundColor == "rgba(255, 255, 0, 0.2)") return k.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
  return k.style.backgroundColor = "rgba(128, 128, 128, 0.2)";
}

function update() {
  sortedPoss = JSON.parse(JSON.stringify(fullPoss));
  info = { mts: [0, 0, 0, 0, 0], ums: [[], [], [], [], []], lts: [] };
  var chrs = window.document.querySelectorAll(".guessl");
  var arr = [];
  for (i = 0; i < chrs.length; i++) {
    if (i % 5 == 0) {
      var str = (chrs[i].textContent + chrs[i + 1].textContent +
        chrs[i + 2].textContent + chrs[i + 3].textContent + chrs[i + 4].textContent).toLowerCase();
      if (str.includes(" ")) continue;
      var dta = chrdata(chrs[i]) + chrdata(chrs[i + 1]) + chrdata(chrs[i + 2]) + chrdata(chrs[i + 3]) + chrdata(chrs[i + 4]);
      arr.push({ word: str, matches: dta });
    }
  }

  arr.forEach(d => {
    getInfo(d.word, d.matches, info);
  });

  filterPoss();

  tacticalWorker.postMessage([
    poss, sortedPoss, info
  ]);
  
  renderInfo();
}

function chrdata(l) {
  if (l.style.backgroundColor == "rgba(0, 255, 0, 0.2)") return "2";
  if (l.style.backgroundColor == "rgba(255, 255, 0, 0.2)") return "1";
  if (l.style.backgroundColor == "rgba(128, 128, 128, 0.2)") return "0";
  return "3";
}

async function renderInfo() {
  doc.mts.textContent = (info.mts.join(" ")).toUpperCase();
  for (i = 0; i < 26; i++) {
    var chr = String.fromCharCode(97 + i);
    var docel = el(chr);
    var inc = false
    for (j = 0; j < 5; j++) if (info.lts.includes({ l: chr, i: j })) inc = true;
    docel.style.backgroundColor = (inc) ?
      "rgba(255, 255, 0, .2)" : "rgba(128, 128, 128, .2)";
    for (j = 0; j < 5; j++) if (info.mts[j] == chr)
      docel.style.backgroundColor = "rgba(0, 255, 0, .2)";
  }
  
  var content = sortedPoss;
  content = content.slice(0, 100);
  doc.wrds.textContent = tacticalGuess || `Loading Tactical Guess...\n`;
  doc.wrds.textContent += `${sortedPoss.length} left\n`;
  for (i = 0; i < 100; i++) {
    if (!content[i]) continue;
    if (poss.indexOf(content[i].toLowerCase()) > -1) {
      doc.wrds.textContent += content[i] + " [Y] \n";
    } else {
      doc.wrds.textContent += content[i] + " [N] \n";
    }
  }

  if (window.document.querySelectorAll(".guessl")[4].textContent == " "){
    doc.wrds.textContent = `Tactical:\nslate\n`;
    doc.wrds.textContent += `${sortedPoss.length} left\n`;
    for (i = 0; i < 100; i++) {
      if (!content[i]) continue;
      if (poss.indexOf(content[i].toLowerCase()) > -1) {
        doc.wrds.textContent += content[i] + " [Y] \n";
      } else {
        doc.wrds.textContent += content[i] + " [N] \n";
      }
    }
  }
}

function getInfo(guess, matches, info) {
  for (i = 0; i < 5; i++) {
    if (matches[i] == "2") {
      info.mts[i] = guess[i];
      char[guess[i]]++;
    }
    if (matches[i] == "1") {
      if (!info.lts.includes({ l: guess[i], i })) {
        info.lts.push({ l: guess[i], i });
        char[guess[i]]++;
      }
      if (!info.ums[i].includes(guess[i])) {
        info.ums[i].push(guess[i]);
        char[guess[i]]++;
      }
    }

    if (matches[i] == "0") {
      var ind = false;
      for (j = 0; j < 5; j++) {
        if (j == i) continue;
        if (guess[i] == guess[j]) {
          if (matches[j] !== "0") ind = true;
        }
      }
      if (ind) continue;
      if (!info.ums[0].includes(guess[i])) { info.ums[0].push(guess[i]); char[guess[i]]++; }
      if (!info.ums[1].includes(guess[i])) { info.ums[1].push(guess[i]); char[guess[i]]++; }
      if (!info.ums[2].includes(guess[i])) { info.ums[2].push(guess[i]); char[guess[i]]++; }
      if (!info.ums[3].includes(guess[i])) { info.ums[3].push(guess[i]); char[guess[i]]++; }
      if (!info.ums[4].includes(guess[i])) { info.ums[4].push(guess[i]); char[guess[i]]++; }
    }
  }
}

function filterPoss() {
  var newPoss = [];
  sortedPoss.forEach(word => {
    if (isValid(word, info)) newPoss.push(word);
  });

  sortedPoss = newPoss;

  sortedPoss.sort((a, b) => data[b] - data[a]);

  if (sortedPoss.length == 0) {
    sortedPoss = fullPoss;

    var newPoss = [];
    sortedPoss.forEach(word => {
      if (isValid(word, info)) newPoss.push(word);
    });

    sortedPoss = newPoss;

    sortedPoss.sort((a, b) => data[b] - data[a]);
  }
}

function isValid(word, dat) {
  for (i = 0; i < 5; i++) {
    if (dat.mts[i] != 0 && dat.mts[i] != word[i]) return false;
    for (j = 0; j < dat.ums[i].length; j++) {
      if (word[i] == dat.ums[i][j]) {
        if (dat.mts[i] == word[i]) continue;
        for (k = 0; k < 5; k++) if (info.lts.includes({ l: word[i], i })) if (i != k) continue;
        return false;
      }
    }
  }

  for (i = 0; i < dat.lts.length; i++) {
    var found = false;
    for (j = 0; j < word.length && !found; j++) if (word[j] == dat.lts[i].l) found = true;
    if (!found) return false;
  }

  return true;
}
