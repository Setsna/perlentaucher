/* ==========================================================
   Übungsgeneratoren
   Jeder Typ erzeugt aus einem Wort eine Aufgabe (Objekt "q").
   kind: 'choice' (Auswahl), 'build' (Kacheln legen), 'cut' (Silben trennen)
   ========================================================== */
window.WA = window.WA || {};

(function () {
  'use strict';
  var C = WA.config;
  function W() { return WA.words || []; }   // wird zur Laufzeit gelesen

  // ---------- Hilfsfunktionen ----------
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function shuffleDiff(a) {
    if (new Set(a).size < 2) return a.slice();
    var r, n = 0;
    do { r = shuffle(a); n++; } while (r.join('|') === a.join('|') && n < 40);
    return r;
  }
  function pick(a) { return a[rnd(a.length)]; }
  function sample(a, n) { return shuffle(a).slice(0, n); }
  function full(w) { return (w.artikel ? w.artikel + ' ' : '') + w.wort; }
  function chars(s) { return Array.from(s); }
  function others(w, f) { return W().filter(function (x) { return x.id !== w.id && (!f || f(x)); }); }
  function emojiSet(b) {
    return b ? chars(b).filter(function (c) { var p = c.codePointAt(0); return p > 0x2000 && p !== 0xFE0F && p !== 0x200D; }) : [];
  }
  function tdiff(type) { return C.types[type].difficulty; }

  // Ablenker-Auswahl: erst andere Gruppe + gleiche Wortart, dann gleiche Wortart, dann alle.
  // "taugt" grenzt zusätzlich ein – zum Beispiel auf Wörter, die überhaupt
  // eine Bedeutung haben. Ohne diese Schranke landen Wörter ohne Bedeutung
  // als Antwort im Tauchgang und die Kinder lesen dort "null".
  // Vorrang hat die eigene Wortliste: Sonst steht neben "Schwimmbecken"
  // die Bedeutung eines Wortes aus einer ganz anderen Einheit, und die
  // Kinder erkennen die richtige Antwort am Thema statt am Wort. Die
  // letzten beiden Töpfe greifen nur, wenn die Liste zu klein ist.
  function distractors(w, n, preferArticle, taugt) {
    var ok = function (x) { return !taugt || taugt(x); };
    var liste = function (x) { return x.liste === w.liste; };
    var pools = [
      others(w, function (x) { return ok(x) && liste(x) && x.gruppe !== w.gruppe && x.wortart === w.wortart; }),
      others(w, function (x) { return ok(x) && liste(x) && x.wortart === w.wortart; }),
      others(w, function (x) { return ok(x) && liste(x); }),
      others(w, function (x) { return ok(x) && x.wortart === w.wortart; }),
      others(w, ok)
    ];
    var out = [];
    pools.forEach(function (pool) {
      var s = shuffle(pool);
      if (preferArticle) s.sort(function (a, b) { return (b.artikel === w.artikel) - (a.artikel === w.artikel); });
      s.forEach(function (x) { if (out.length < n && out.indexOf(x) < 0) out.push(x); });
    });
    return out;
  }

  // ---------- Fehlerhafte Schreibweisen ----------
  var RULES = [
    [/ie/, 'i'], [/ei/, 'ai'], [/ä/, 'e'], [/ö/, 'oe'], [/ü/, 'ue'], [/ß/, 'ss'], [/ss/, 'ß'],
    [/ck/, 'k'], [/tz/, 'z'], [/eu/, 'äu'], [/äu/, 'eu'], [/(.)h([aeiouäöü])/, '$1$2'], [/([aeiou])h/, '$1'],
    [/([bdfgklmnprt])\1/, '$1'], [/([aeiouäöü])([lmnrt])([aeiouäöü])/, '$1$2$2$3'],
    [/ee/, 'eh'], [/ee/, 'e'], [/v/, 'f'], [/f/, 'v'], [/d$/, 't'], [/t$/, 'd'], [/g$/, 'k'], [/i([aeou])/, 'ie$1'], [/z/, 'tz'], [/ch/, 'g']
  ];
  function misspell(word, n) {
    var out = [];
    shuffle(RULES).forEach(function (r) {
      var m = word.replace(r[0], r[1]);
      if (m !== word && out.indexOf(m) < 0) out.push(m);
    });
    var a = chars(word), tries = 0;
    while (out.length < n && tries++ < 50) {           // Buchstabendreher als Reserve
      var i = 1 + rnd(a.length - 1), b = a.slice();
      if (i + 1 < b.length && b[i] !== b[i + 1]) { var t = b[i]; b[i] = b[i + 1]; b[i + 1] = t; var m2 = b.join(''); if (m2 !== word && out.indexOf(m2) < 0) out.push(m2); }
    }
    tries = 0;
    while (out.length < n && tries++ < 60) {           // letzte Reserve: Buchstabe weglassen oder verdoppeln
      var k = 1 + rnd(a.length - 1), c = a.slice();
      if (Math.random() < 0.5) c.splice(k, 1); else c.splice(k, 0, a[k]);
      var m3 = c.join('');
      if (m3 !== word && out.indexOf(m3) < 0) out.push(m3);
    }
    return sample(out, n);
  }

  // ---------- Lücken-Übung: Verwechslungsbuchstaben ----------
  var CONFUSE = { 'ä': 'e', 'e': 'ä', 'ö': 'o', 'o': 'ö', 'ü': 'u', 'u': 'ü', 'ß': 's', 's': 'ß', 'k': 'c', 'c': 'k',
                  'd': 't', 't': 'd', 'f': 'v', 'v': 'f', 'b': 'p', 'p': 'b', 'g': 'k', 'i': 'y', 'z': 's', 'h': 'n' };

  // ---------- Übungstypen ----------
  var T = {};

  T.artikel = {
    cat: 'artikel',
    applies: function (w) { return !!w.artikel; },
    make: function (w) {
      return {
        type: 'artikel', cat: 'artikel', kind: 'choice', layout: 'row3', wordId: w.id,
        prompt: 'Welcher Artikel passt?',
        show: { emoji: w.bild, text: w.wort }, speak: w.wort,
        options: ['der', 'die', 'das'].map(function (a) { return { label: a, value: a, cls: 'art-' + a }; }),
        correct: w.artikel, solutionText: full(w)
      };
    }
  };

  T.fehler = {
    cat: 'schreibweise',
    applies: function (w) { return w.wort.length >= 4; },
    make: function (w) {
      var opts = misspell(w.wort, 2).concat([w.wort]).map(function (x) { return { label: x, value: x }; });
      return {
        type: 'fehler', cat: 'schreibweise', kind: 'choice', layout: 'list', wordId: w.id,
        prompt: 'Welche Schreibweise ist richtig?',
        show: { emoji: w.bild }, speak: w.wort,
        options: shuffle(opts), correct: w.wort, solutionText: w.wort
      };
    }
  };

  T.silben_zaehlen = {
    cat: 'silben',
    applies: function () { return true; },
    make: function (w) {
      var n = w.silben.length, cand = [n];
      [1, -1, 2, -2, 3].forEach(function (d) { if (n + d >= 1 && cand.length < 4) cand.push(n + d); });
      cand.sort(function (a, b) { return a - b; });
      return {
        type: 'silben_zaehlen', cat: 'silben', kind: 'choice', layout: 'row4', wordId: w.id,
        prompt: 'Wie viele Silben hat das Wort?',
        show: { emoji: w.bild, text: w.wort }, speak: w.wort, revealSyllables: true,
        options: cand.map(function (m) { return { label: String(m), value: m }; }),
        correct: n, solutionText: w.silben.join('-')
      };
    }
  };

  T.bild = {
    cat: 'verstehen',
    applies: function (w) { return !!w.bild; },
    make: function (w) {
      var mine = emojiSet(w.bild);
      var pool = others(w, function (x) { return emojiSet(x.bild).every(function (e) { return mine.indexOf(e) < 0; }); });
      var opts = sample(pool, 3).concat([w]).map(function (x) { return { label: x.wort, value: x.id }; });
      return {
        type: 'bild', cat: 'verstehen', kind: 'choice', layout: 'grid2', wordId: w.id,
        prompt: 'Welches Wort passt zum Bild?',
        show: { emoji: w.bild }, speak: null,
        options: shuffle(opts), correct: w.id, solutionText: full(w)
      };
    }
  };

  function hatBedeutung(x) { return !!(x.bedeutung && String(x.bedeutung).trim()); }

  T.bedeutung = {
    cat: 'verstehen',
    // Es braucht nicht nur eine eigene Bedeutung, sondern auch zwei andere
    // Wörter mit Bedeutung – sonst gäbe es nichts zum Auswählen.
    applies: function (w) {
      return hatBedeutung(w) && others(w, hatBedeutung).length >= 2;
    },
    make: function (w) {
      var opts = distractors(w, 2, false, hatBedeutung).concat([w])
        .filter(hatBedeutung)
        .map(function (x) { return { label: x.bedeutung, value: x.id }; });
      return {
        type: 'bedeutung', cat: 'verstehen', kind: 'choice', layout: 'list', wordId: w.id,
        prompt: 'Was bedeutet das Wort?',
        show: { text: w.wort }, speak: w.wort,
        options: shuffle(opts), correct: w.id, solutionText: full(w) + ': ' + w.bedeutung
      };
    }
  };

  T.satz = {
    cat: 'verstehen',
    applies: function (w) { return !!w.satz && w.satz.indexOf(w.wort) >= 0; },
    make: function (w) {
      var i = w.satz.indexOf(w.wort);
      var opts = distractors(w, 2, true).concat([w]).map(function (x) { return { label: x.wort, value: x.id }; });
      return {
        type: 'satz', cat: 'verstehen', kind: 'choice', layout: 'grid2', wordId: w.id,
        prompt: 'Welches Wort fehlt im Satz?',
        sentence: [w.satz.slice(0, i), w.satz.slice(i + w.wort.length)], speak: null,
        options: shuffle(opts), correct: w.id, solutionText: w.satz
      };
    }
  };

  T.buchstaben = {
    cat: 'schreibweise',
    applies: function (w) { return chars(w.wort).length <= C.types.buchstaben.maxLetters; },
    make: function (w) {
      var ls = chars(w.wort);
      return {
        type: 'buchstaben', cat: 'schreibweise', kind: 'build', wordId: w.id,
        prompt: 'Bringe die Buchstaben in die richtige Reihenfolge.',
        show: { emoji: w.bild }, hint: w.bedeutung, speak: w.wort,
        slots: ls.map(function () { return null; }), blanks: ls.length,
        tiles: shuffleDiff(ls), answerWord: w.wort,
        assemble: function (fills) { return fills.join(''); },
        solutionText: w.wort
      };
    }
  };

  T.luecke = {
    cat: 'schreibweise',
    applies: function (w) { return chars(w.wort).length >= 4; },
    make: function (w) {
      var ls = chars(w.wort);
      var n = ls.length <= 6 ? 1 : (ls.length <= 10 ? 2 : 3);
      function score(i) {
        var c = ls[i].toLowerCase();
        if ('äöüß'.indexOf(c) >= 0) return 4;
        if ((ls[i - 1] && ls[i - 1].toLowerCase() === c) || (ls[i + 1] && ls[i + 1].toLowerCase() === c)) return 3;
        if ('hvyckz'.indexOf(c) >= 0) return 2;
        return 1;
      }
      var idx = [], left = [];
      for (var i = 1; i < ls.length; i++) left.push(i);
      while (idx.length < n && left.length) {           // gewichtete Auswahl
        var tot = left.reduce(function (s, k) { return s + score(k); }, 0), r = Math.random() * tot, k2 = 0;
        for (; k2 < left.length; k2++) { r -= score(left[k2]); if (r <= 0) break; }
        idx.push(left.splice(Math.min(k2, left.length - 1), 1)[0]);
      }
      idx.sort(function (a, b) { return a - b; });
      var fills = idx.map(function (k) { return ls[k]; });
      var tiles = fills.slice();
      fills.forEach(function (f) { var c = CONFUSE[f]; if (c && tiles.length < fills.length + 3) tiles.push(c); });
      var alpha = 'aeioulnrstmhkg';
      while (tiles.length < fills.length + 3) tiles.push(alpha[rnd(alpha.length)]);
      var slots = ls.map(function (c, k) { return idx.indexOf(k) >= 0 ? null : c; });
      return {
        type: 'luecke', cat: 'schreibweise', kind: 'build', wordId: w.id,
        prompt: n > 1 ? 'Welche Buchstaben fehlen?' : 'Welcher Buchstabe fehlt?',
        show: { emoji: w.bild }, hint: w.bedeutung, speak: w.wort,
        slots: slots, blanks: idx.length, tiles: shuffle(tiles), answerWord: w.wort,
        assemble: function (f) { var b = 0; return slots.map(function (s) { return s === null ? f[b++] : s; }).join(''); },
        solutionText: w.wort
      };
    }
  };

  T.silben_ordnen = {
    cat: 'silben',
    applies: function (w) { return w.silben.length >= 2; },
    make: function (w) {
      var syl = w.silben.map(function (s) { return s.toLowerCase(); });
      return {
        type: 'silben_ordnen', cat: 'silben', kind: 'build', wordId: w.id,
        prompt: 'Setze die Silben zum Wort zusammen.',
        show: { emoji: w.bild }, hint: w.bedeutung, speak: w.wort,
        slots: syl.map(function () { return null; }), blanks: syl.length,
        tiles: shuffleDiff(syl), answerWord: syl.join(''),
        assemble: function (f) { return f.join(''); },
        solutionText: w.silben.join('-'), sylTiles: true
      };
    }
  };

  // Achtung: Diese Übung fragt die Worttrennung am Zeilenende ab,
  // nicht die Sprechsilben. Wörter, die nach Duden nicht trennbar
  // sind (z. B. Abend, Efeu), kommen hier gar nicht vor.
  T.trennen = {
    cat: 'silben',
    applies: function (w) { return (w.trennung || w.silben).length >= 2; },
    make: function (w) {
      var t = w.trennung || w.silben, pos = [], s = 0;
      t.slice(0, -1).forEach(function (x) { s += chars(x).length; pos.push(s); });
      return {
        type: 'trennen', cat: 'silben', kind: 'cut', wordId: w.id,
        prompt: 'Tippe dorthin, wo das Wort getrennt wird.',
        show: { emoji: w.bild }, speak: w.wort, word: w.wort, solution: pos,
        teile: t, solutionText: t.join('-')
      };
    }
  };

  // ---------- Öffentliche Funktionen ----------
  function typeOn(t) { return C.types[t] && C.types[t].enabled !== false; }
  function typesOf(catId) { return C.categories[catId].types.filter(typeOn); }

  function eligibleWords(catId) {
    var types = typesOf(catId);
    return W().filter(function (w) { return types.some(function (t) { return T[t].applies(w); }); });
  }

  function weightOf(w, apps) {
    var st = WA.store && WA.store.wordStat(w.id);
    if (!st || (st.ok + st.wr) === 0) return 1.6;                       // neue Wörter etwas bevorzugen
    var tot = st.ok + st.wr, wt = 1 + 3 * (st.wr / tot);                // oft falsch = höhere Chance
    if (st.lastWrong) wt += 1.5;
    var mastered = apps.every(function (t) { return (st.c[T[t].cat] || 0) >= C.masteryTarget; });
    return mastered ? wt * 0.5 : wt;
  }

  // onlyIds (optional): nur aus diesen Wörtern eine Lektion bauen
  function buildLesson(worldId, onlyIds) {
    var types = typesOf(worldId), qs = [], used = {}, counts = {};
    var alle = onlyIds && onlyIds.length
      ? W().filter(function (w) { return onlyIds.indexOf(w.id) >= 0; })
      : W();

    // Schwerpunkt auf der aktiven Liste, ein Teil zur Wiederholung aus früheren
    var aktiv = alle, alt = [];
    if (C.aktiveListe && !onlyIds) {
      aktiv = alle.filter(function (w) { return w.liste === C.aktiveListe; });
      alt   = alle.filter(function (w) { return w.liste !== C.aktiveListe; });
      if (!aktiv.length) { aktiv = alle; alt = []; }
    }

    for (var k = 0; k < C.lessonLength; k++) {
      var ausAlt = alt.length && Math.random() < (C.wiederholungAnteil || 0);
      var pool = ausAlt ? alt : aktiv;
      var cands = [];
      pool.forEach(function (w) {
        var apps = types.filter(function (t) { return T[t].applies(w); });
        if (apps.length) cands.push({ w: w, apps: apps, wt: weightOf(w, apps) });
      });
      var fresh = cands.filter(function (c) { return !used[c.w.id]; });
      if (fresh.length) cands = fresh;
      if (!cands.length) break;
      var tot = cands.reduce(function (s, c) { return s + c.wt; }, 0), r = Math.random() * tot, ch = cands[0];
      for (var i = 0; i < cands.length; i++) { r -= cands[i].wt; if (r <= 0) { ch = cands[i]; break; } }
      var last = qs.length ? qs[qs.length - 1].type : null;
      var apps2 = ch.apps.filter(function (t) { return t !== last; });
      if (!apps2.length) apps2 = ch.apps;
      var minUse = Math.min.apply(null, apps2.map(function (t) { return counts[t] || 0; }));
      var type = pick(apps2.filter(function (t) { return (counts[t] || 0) === minUse; }));
      counts[type] = (counts[type] || 0) + 1;
      used[ch.w.id] = true;
      qs.push(makeQuestion(type, ch.w));
    }
    return qs;
  }

  function makeQuestion(type, w) {
    var q = T[type].make(w);
    q.difficulty = tdiff(type);
    return q;
  }

  function xpFor(q, streak) {
    var X = C.xp, base = X.byDifficulty[q.difficulty] || 10, bonus = 0;
    if (streak >= X.streakBonusFrom) bonus = Math.min(X.streakBonusMax, (streak - X.streakBonusFrom + 1) * X.streakBonusPerStep);
    return { base: base, bonus: bonus, total: base + bonus };
  }

  WA.ex = { TYPES: T, buildLesson: buildLesson, makeQuestion: makeQuestion, eligibleWords: eligibleWords, xpFor: xpFor,
            typeCat: function (t) { return T[t].cat; }, misspell: misspell };
})();
