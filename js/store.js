/* ==========================================================
   Spielstand (Prototyp: im Browser gespeichert – localStorage)
   In Phase 3 wird dieser Speicher durch Firebase Firestore ersetzt.
   Alle anderen Dateien greifen nur über WA.store darauf zu.
   ========================================================== */
window.WA = window.WA || {};

(function () {
  'use strict';
  // Der Speicherschlüssel behält den alten Namen. Würde er sich ändern,
  // wären lokal gespeicherte Spielstände beim ersten Start verschwunden.
  var C = WA.config, BASIS = 'wortabenteuer.v1', KEY = BASIS;
  var lauscher = [];          // werden nach jedem Speichern benachrichtigt (Cloud)

  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function fresh() {
    return { v: 1, hearts: C.hearts.max, heartsAt: Date.now(), xp: 0, xpGemeldet: 0, days: {},
             best: { day: 0, lesson: 0 }, words: {}, badges: {}, lessons: 0, worlds: {},
             lastDay: null, streakDays: 0, sound: true, updatedAt: 0,
             mal: frischMal() };
  }
  // Belohnungszeit und Pixelbilder.
  //   rest    Guthaben in Sekunden
  //   tage    an welchen Tagen das Tagesziel schon gutgeschrieben wurde
  //   bilder  [{ id, g, px, fertig, ts }] – px ist eine Zeichenkette,
  //           ein Zeichen je Feld: Ziffer/Buchstabe = Platz in der
  //           Farbliste, Punkt = leer
  function frischMal() {
    return { rest: 0, tage: {}, bilder: [], aktiv: null, naechsteId: 1, frisch: 0 };
  }
  // Ältere Spielstände kennen den Malbereich noch nicht.
  function sicherMal(x) {
    x.mal = Object.assign(frischMal(), x.mal || {});
    if (!Array.isArray(x.mal.bilder)) x.mal.bilder = [];
    return x;
  }
  function load() {
    try { var r = localStorage.getItem(KEY); if (r) return sicherMal(Object.assign(fresh(), JSON.parse(r))); } catch (e) {}
    return fresh();
  }
  var s = load();

  function save(still) {
    if (!still) s.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    if (!still) lauscher.forEach(function (f) { try { f(s); } catch (e) {} });
  }

  // ---------- Umschalten zwischen Kindern auf demselben iPad ----------
  // Jedes Kind bekommt einen eigenen lokalen Speicherplatz.
  function useProfile(id) {
    KEY = id ? BASIS + '.' + id : BASIS;
    s = load();
  }

  // ---------- Abgleichsbasis ----------
  // Der Stand, den dieses Gerät zuletzt mit der Datenbank abgeglichen
  // hat. Nur daraus lässt sich später sagen, was dieses Gerät selbst
  // dazugewonnen hat. Liegt bewusst nur lokal.
  function basisSchluessel() { return KEY + '.basis'; }
  function basis() {
    try {
      var r = localStorage.getItem(basisSchluessel());
      return r ? JSON.parse(r) : null;
    } catch (e) { return null; }
  }
  function basisSetzen(stand) {
    try {
      var kopie = JSON.parse(JSON.stringify(stand || s));
      if (kopie.mal) kopie.mal = Object.assign({}, kopie.mal, { bilder: [] });
      localStorage.setItem(basisSchluessel(), JSON.stringify(kopie));
    } catch (e) {}
  }

  // Ergebnis des Abgleichs übernehmen: Spielstand und Basis stehen
  // danach auf demselben Wert. Die gemalten Bilder bleiben, die
  // gehören nicht in den Abgleich.
  function abgleichUebernehmen(zusammen) {
    var bilder = (s.mal && s.mal.bilder) || [];
    s = sicherMal(Object.assign(fresh(), zusammen));
    s.mal.bilder = bilder;
    save(true);
    basisSetzen(zusammen);
  }

  function snapshot() { return JSON.parse(JSON.stringify(s)); }

  function hydrate(obj) {
    if (!obj) return;
    s = sicherMal(Object.assign(fresh(), obj));
    save(true);
  }

  function onChange(f) { if (lauscher.indexOf(f) < 0) lauscher.push(f); }

  function setXpGemeldet(n) { s.xpGemeldet = n; save(true); }

  // ---------- Herzen ----------
  function tick() {
    var iv = C.hearts.refillMinutes * 60000, now = Date.now();
    if (s.hearts >= C.hearts.max) { s.hearts = C.hearts.max; s.heartsAt = now; return; }
    var n = Math.floor((now - s.heartsAt) / iv);
    if (n > 0) {
      s.hearts = Math.min(C.hearts.max, s.hearts + n);
      s.heartsAt = s.hearts >= C.hearts.max ? now : s.heartsAt + n * iv;
      save();
    }
  }
  function hearts() {
    tick();
    var iv = C.hearts.refillMinutes * 60000;
    return { count: s.hearts, max: C.hearts.max, nextMs: s.hearts >= C.hearts.max ? 0 : Math.max(0, iv - (Date.now() - s.heartsAt)) };
  }
  function loseHeart() {
    tick();
    if (s.hearts >= C.hearts.max) s.heartsAt = Date.now();   // Timer startet beim ersten Verlust
    s.hearts = Math.max(0, s.hearts - C.hearts.costPerWrong);
    save();
  }
  function refillHearts() { s.hearts = C.hearts.max; s.heartsAt = Date.now(); save(); }

  // ---------- XP ----------
  function todayXp() { return s.days[dayKey()] || 0; }
  function addXp(n) {
    if (n <= 0) return;
    s.xp += n;
    var k = dayKey();
    s.days[k] = (s.days[k] || 0) + n;
    if (s.days[k] > s.best.day) s.best.day = s.days[k];
    pruefeTagesziel();
    save();
  }
  // ---------- Belohnung: Malzeit und Pixelbilder ----------
  // Wird nach jeder Perlengutschrift geprüft. Je Tag genau einmal.
  function pruefeTagesziel() {
    var M = C.malen;
    if (!M || !M.enabled) return;
    var k = dayKey();
    if (s.mal.tage[k]) return;
    if ((s.days[k] || 0) < C.dailyGoalXp) return;
    s.mal.tage[k] = 1;
    var dazu = M.minutenProZiel * 60;
    s.mal.rest = Math.min(M.maxGuthabenMinuten * 60, s.mal.rest + dazu);
    s.mal.frisch = dazu;          // die Oberfläche holt sich das einmal ab
  }
  // Gibt die eben gutgeschriebene Zeit zurück und setzt sie zurück,
  // damit die Meldung nur ein einziges Mal erscheint.
  function malFrisch() {
    var n = s.mal.frisch || 0;
    if (n) { s.mal.frisch = 0; save(true); }
    return n;
  }
  function malRest() { return s.mal.rest || 0; }

  function leeresBild(g) { return new Array(g * g + 1).join('.'); }

  function malBild() {
    var b = s.mal.bilder.filter(function (x) { return x.id === s.mal.aktiv && !x.fertig; })[0];
    if (b) return b;
    b = s.mal.bilder.filter(function (x) { return !x.fertig; })[0];
    if (b) { s.mal.aktiv = b.id; save(true); return b; }
    return malNeu('raster');
  }
  // art: 'raster' (Pixelraster) oder 'frei' (weißes Blatt)
  function malNeu(art) {
    art = art === 'frei' ? 'frei' : 'raster';
    if (s.mal.bilder.length >= C.malen.maxBilder) return null;
    if (art === 'frei' && malAnzahl('frei') >= C.malen.maxFrei) return null;
    var g = C.malen.groesse;
    var b = art === 'frei'
      ? { id: s.mal.naechsteId++, art: 'frei', striche: '', fertig: false, ts: Date.now() }
      : { id: s.mal.naechsteId++, art: 'raster', g: g, px: leeresBild(g), fertig: false, ts: Date.now() };
    s.mal.bilder.push(b);
    s.mal.aktiv = b.id;
    save();
    return b;
  }
  // Bilder aus der Datenbank übernehmen. Das neuere Bild gewinnt,
  // Bilder, die es nur hier gibt, bleiben erhalten.
  function malZusammenfuehren(fern) {
    var nach = {};
    s.mal.bilder.forEach(function (b) { nach[b.id] = b; });
    (fern || []).forEach(function (b) {
      var da = nach[b.id];
      if (!da || (b.ts || 0) >= (da.ts || 0)) nach[b.id] = b;
    });
    s.mal.bilder = Object.keys(nach).map(function (k) { return nach[k]; })
      .sort(function (a, b) { return a.id - b.id; });
    var hoechste = s.mal.bilder.reduce(function (m, b) { return Math.max(m, b.id); }, 0);
    if (s.mal.naechsteId <= hoechste) s.mal.naechsteId = hoechste + 1;
    save(true);
    return s.mal.bilder;
  }

  function malAnzahl(art) {
    return s.mal.bilder.filter(function (b) { return (b.art || 'raster') === art; }).length;
  }
  function malPlatzFrei(art) {
    if (s.mal.bilder.length >= C.malen.maxBilder) return false;
    return art === 'frei' ? malAnzahl('frei') < C.malen.maxFrei : true;
  }
  function malWaehlen(id) {
    var b = s.mal.bilder.filter(function (x) { return x.id === id; })[0];
    if (!b || b.fertig) return null;
    s.mal.aktiv = id; save(true); return b;
  }
  function malFertig(id) {
    s.mal.bilder.forEach(function (b) { if (b.id === id) { b.fertig = true; b.ts = Date.now(); } });
    s.mal.aktiv = null;
    save();
  }
  function malLoeschen(id) {
    s.mal.bilder = s.mal.bilder.filter(function (b) { return b.id !== id; });
    if (s.mal.aktiv === id) s.mal.aktiv = null;
    save();
  }
  // Ein Feld setzen. still = nur lokal sichern, nicht sofort in die Wolke.
  function malSetzen(id, i, zeichen) {
    var b = s.mal.bilder.filter(function (x) { return x.id === id; })[0];
    if (!b || b.fertig || i < 0 || i >= b.px.length) return false;
    if (b.px.charAt(i) === zeichen) return false;
    b.px = b.px.substring(0, i) + zeichen + b.px.substring(i + 1);
    b.ts = Date.now();
    save(true);
    return true;
  }
  // Einen fertigen Strich an ein freies Bild anhängen.
  // Gibt false zurück, wenn das Bild seine Datengrenze erreicht hat.
  function malStrich(id, text) {
    var b = s.mal.bilder.filter(function (x) { return x.id === id; })[0];
    if (!b || b.fertig || b.art !== 'frei') return false;
    if ((b.striche || '').length + text.length > C.malen.maxStrichdaten) return false;
    b.striche = (b.striche || '') + text;
    b.ts = Date.now();
    save(true);
    return true;
  }
  function malStrichZurueck(id) {
    var b = s.mal.bilder.filter(function (x) { return x.id === id; })[0];
    if (!b || b.fertig || b.art !== 'frei' || !b.striche) return false;
    b.striche = WA.malen.ohneLetztenStrich(b.striche);
    save(true);
    return true;
  }

  // Verbrauchte Sekunden abziehen. Gibt den Rest zurück.
  function malVerbrauchen(sek) {
    s.mal.rest = Math.max(0, (s.mal.rest || 0) - Math.max(0, sek));
    save(true);
    return s.mal.rest;
  }

  function weekDays() {
    var names = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'], out = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      out.push({ label: names[d.getDay()], xp: s.days[dayKey(d)] || 0, today: i === 0 });
    }
    return out;
  }

  // ---------- Wort-Statistik ----------
  function wordStat(id) { return s.words[id] || null; }
  function recordAnswer(id, cat, ok) {
    var st = s.words[id] || (s.words[id] = { ok: 0, wr: 0, lastWrong: false, c: {} });
    if (ok) { st.ok++; st.c[cat] = (st.c[cat] || 0) + 1; } else { st.wr++; }
    st.lastWrong = !ok;
    save();
  }
  function weakWords() {
    return WA.words.filter(function (w) { var st = s.words[w.id]; return st && st.wr >= 2 && st.wr > st.ok; })
      .sort(function (a, b) { return s.words[b.id].wr - s.words[a.id].wr; });
  }
  function wordMastered(id) { var st = s.words[id]; return !!st && st.ok >= (C.masteredAfter || 3); }

  // Status eines Wortes: 'neu' | 'ueben' | 'sicher'
  function wordState(id) {
    var st = s.words[id];
    if (!st || (st.ok + st.wr) === 0) return 'neu';
    return wordMastered(id) ? 'sicher' : 'ueben';
  }

  // Gesamtzahlen für die Fortschrittsseite
  function totals() {
    var ok = 0, wr = 0, practiced = 0, mastered = 0;
    WA.words.forEach(function (w) {
      var st = s.words[w.id];
      if (!st || (st.ok + st.wr) === 0) return;
      practiced++; ok += st.ok; wr += st.wr;
      if (wordMastered(w.id)) mastered++;
    });
    return { ok: ok, wrong: wr, total: ok + wr, practiced: practiced, mastered: mastered,
             words: WA.words.length, accuracy: (ok + wr) ? ok / (ok + wr) : 0 };
  }

  // Die n Wörter mit den meisten Fehlern
  function topWrong(n) {
    return WA.words.filter(function (w) { var st = s.words[w.id]; return st && st.wr > 0; })
      .map(function (w) {
        var st = s.words[w.id];
        return { wort: w, wrong: st.wr, ok: st.ok, quote: st.ok / (st.ok + st.wr) };
      })
      .sort(function (a, b) { return b.wrong - a.wrong || a.quote - b.quote; })
      .slice(0, n || 5);
  }

  // ---------- Woche (Montag bis Sonntag) ----------
  function weekInfo() {
    var now = new Date(), dow = (now.getDay() + 6) % 7, sum = 0;   // 0 = Montag
    for (var i = 0; i <= dow; i++) {
      var d = new Date(); d.setDate(d.getDate() - i);
      sum += s.days[dayKey(d)] || 0;
    }
    return { xp: sum, dayIndex: dow, daysLeft: 6 - dow };
  }

  // ---------- Fortschritt je Lernwelt ----------
  function worldProgress(catId) {
    if (catId === 'gemischt') {
      var ids = Object.keys(C.categories).filter(function (k) { return k !== 'gemischt'; });
      return ids.reduce(function (a, k) { return a + worldProgress(k); }, 0) / ids.length;
    }
    var ws = WA.ex.eligibleWords(catId);
    if (!ws.length) return 0;
    var t = C.masteryTarget;
    return ws.reduce(function (a, w) { var st = s.words[w.id]; return a + Math.min(st ? (st.c[catId] || 0) : 0, t) / t; }, 0) / ws.length;
  }

  // ---------- Abzeichen ----------
  var BADGES = [
    { id: 'first',   icon: 'blasen', title: 'Erster Tauchgang', desc: 'Ersten Tauchgang geschafft',        test: function (x) { return s.lessons >= 1; } },
    { id: 'perfect', icon: 'perle', title: 'Makellose Perle',  desc: 'Ein Tauchgang ohne Fehler',         test: function (x) { return x.perfect; } },
    { id: 'streak8', icon: 'welle', title: 'Wellenreiter',     desc: '8 richtige Antworten in Folge',     test: function (x) { return x.maxStreak >= 8; } },
    { id: 'xp100',   icon: 'auster', title: '100 Perlen',       desc: '100 Perlen gesammelt',              test: function () { return s.xp >= 100; } },
    { id: 'xp500',   icon: 'seestern', title: '500 Perlen',       desc: '500 Perlen gesammelt',              test: function () { return s.xp >= 500; } },
    { id: 'xp1000',  icon: 'wal', title: '1000 Perlen',      desc: '1000 Perlen gesammelt',             test: function () { return s.xp >= 1000; } },
    { id: 'days3',   icon: 'taucherbrille', title: 'Stammtaucher',     desc: '3 Tage in Folge geübt',             test: function () { return s.streakDays >= 3; } },
    { id: 'worlds',  icon: 'kompass', title: 'Riffentdecker',    desc: 'Alle 4 Reviere besucht',            test: function () { return ['schreibweise', 'artikel', 'silben', 'verstehen'].every(function (k) { return (s.worlds[k] || 0) > 0; }); } },
    { id: 'words20', icon: 'delfin', title: 'Wortdelfin',       desc: '20 Wörter sicher gelernt',          test: function () { return WA.words.filter(function (w) { return wordMastered(w.id); }).length >= 20; } }
  ];

  function finishLesson(x) {
    if (!x.practice) {
      s.lessons++;
      s.worlds[x.world] = (s.worlds[x.world] || 0) + 1;
      if (x.xp > s.best.lesson) s.best.lesson = x.xp;
      var today = dayKey(), y = new Date(); y.setDate(y.getDate() - 1);
      if (s.lastDay !== today) { s.streakDays = (s.lastDay === dayKey(y)) ? s.streakDays + 1 : 1; s.lastDay = today; }
    }
    var fresh = [];
    BADGES.forEach(function (b) {
      if (!s.badges[b.id] && b.test(x)) { s.badges[b.id] = Date.now(); fresh.push(b); }
    });
    save();
    return fresh;
  }

  WA.store = {
    get state() { return s; },
    hearts: hearts, loseHeart: loseHeart, refillHearts: refillHearts,
    addXp: addXp, todayXp: todayXp, weekDays: weekDays,
    wordStat: wordStat, recordAnswer: recordAnswer, weakWords: weakWords, wordMastered: wordMastered,
    wordState: wordState, totals: totals, topWrong: topWrong, weekInfo: weekInfo,
    worldProgress: worldProgress, finishLesson: finishLesson, badges: BADGES,
    useProfile: useProfile, snapshot: snapshot, hydrate: hydrate, onChange: onChange,
    basis: basis, basisSetzen: basisSetzen, abgleichUebernehmen: abgleichUebernehmen,
    setXpGemeldet: setXpGemeldet,
    malRest: malRest, malFrisch: malFrisch, malBild: malBild, malNeu: malNeu,
    malWaehlen: malWaehlen, malFertig: malFertig, malLoeschen: malLoeschen,
    malSetzen: malSetzen, malVerbrauchen: malVerbrauchen,
    malStrich: malStrich, malStrichZurueck: malStrichZurueck, malPlatzFrei: malPlatzFrei,
    malBilder: function () { return s.mal.bilder; },
    malZusammenfuehren: malZusammenfuehren,
    setSound: function (v) { s.sound = !!v; save(); },
    // Die gemalten Bilder bleiben erhalten. Sie sind eine Belohnung,
    // kein Lernfortschritt, und sollen nicht mit gelöscht werden.
    reset: function () { var bilder = s.mal; s = fresh(); s.mal = bilder; s.mal.rest = 0; save(); }
  };
})();
