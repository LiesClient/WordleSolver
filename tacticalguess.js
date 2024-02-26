onmessage = (s) => {
  var [poss, sortedPoss, info] = s.data;
  console.log("worker received data");
  // postMessage(getTacticalGuess(poss, sortedPoss, info));
  postMessage("not slate");
}

function getTacticalGuess(poss, sortedPoss, info) {
  console.log("getting tactical guess")''
  var tactical = [];
  var tacticalScoreObj = {};
  
  poss.forEach(word => {
    if(!isTactical(word, info)) return;
    console.log("scoring " + word);
    tacticalScoreObj[word] = tacticalScore(word, sortedPoss, info);
    tactical.push(word);
  });


  var best = 0;
  var bestword = "not slate";

  tactical.forEach(word => {
    var score = tacticalScoreObj[score];
    if(score > best) bestword = word;
  });
  
  return bestword;
}

function getInfo(guess, matches, info) {
  for (i = 0; i < 5; i++) {
    if (matches[i] == "2") {
      info.mts[i] = guess[i];
    }
    if (matches[i] == "1") {
      if (!info.lts.includes({ l: guess[i], i })) {
        info.lts.push({ l: guess[i], i });
      }
      if (!info.ums[i].includes(guess[i])) {
        info.ums[i].push(guess[i]);
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
      
      for(k = 0; k < 5; k++)
        if (!info.ums[0].includes(guess[i])) 
          info.ums[0].push(guess[i]);
    }
  }
}

function isValid(word, dat, info) {
  for (i = 0; i < 5; i++) {
    if (dat.mts[i] != 0 && dat.mts[i] != word[i]) return false;
    for (j = 0; j < dat.ums[i].length; j++) {
      if (word[i] == dat.ums[i][j]) {
        if (dat.mts[i] == word[i]) continue;
        for (k = 0; k < 5; k++) if (dat.lts.includes({ l: word[i], i })) if (i != k) continue;
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

function isTactical(word, info){
  var hasLet = false;
  
  info.ums.forEach(lt => {
    if(hasLet) return;
    for(i = 0; i < 5; i++)
      if(word[i] == lt) hasLet = true;
  });

  if(hasLet) return false;
  
  return true;
}

function tacticalScore(word, words, info) {
  var score = 0;

  words.forEach(x => {
    var infov2 = JSON.parse(JSON.stringify(info));
    var matches = "00000";
    for(i = 0; i < 5; i++){
      var match = "0";
      if(word[i] == x[i]) match = "2";
      else if(x.includes(word[i])) match = "1";
      matches[i] = match;
    }
    
    getInfo(word, matches, infov2);
    
    words.forEach(y => {
      if(isValid(y, infov2)){
        score++;
      }
    });
  });

  console.log(word, score);
  
  return score;
}
