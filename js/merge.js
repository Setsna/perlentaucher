/* ==========================================================
   Perlentaucher – Spielstände zusammenführen

   Das Problem: Ein Kind übt nachmittags zu Hause und abends noch
   einmal auf dem iPad, das seit Mittag offen liegt. Würde der zweite
   Stand den ersten einfach ersetzen, wäre der Nachmittag weg.

   Die Lösung ist ein Dreiwege-Vergleich, wie ihn auch Versionsver-
   waltungen benutzen:

     BASIS   der Stand, den dieses Gerät zuletzt mit der Datenbank
             abgeglichen hat (liegt nur lokal)
     LOKAL   was dieses Gerät seitdem daraus gemacht hat
     FERN    was gerade in der Datenbank steht

   Für Zähler gilt dann:  neu = FERN + (LOKAL − BASIS)
   Das Gerät gibt also nur seinen eigenen Zuwachs dazu und überschreibt
   nichts, was inzwischen von einem anderen Gerät gekommen ist.

   Nicht alles ist ein Zähler. Luftblasen füllen sich von selbst auf,
   da würde die Regel den Zuwachs doppelt zählen – dort gewinnt der
   zuletzt geschriebene Stand. Abzeichen werden vereinigt, Rekorde
   sind das Maximum.

   Die gemalten Bilder stehen hier nicht drin, die haben ihre eigene
   Sammlung und ihren eigenen Abgleich.
   ========================================================== */
window.WA = window.WA || {};

(function () {
  'use strict';

  function zahl(x) { return typeof x === 'number' && isFinite(x) ? x : 0; }

  // Zähler: eigener Zuwachs auf den fernen Stand addieren.
  // Nie unter null, damit ein kaputter Stand nichts negativ macht.
  function zaehler(basis, lokal, fern) {
    return Math.max(0, zahl(fern) + (zahl(lokal) - zahl(basis)));
  }

  // Eine Sammlung von Zählern, z. B. die Perlen je Tag.
  function zaehlerMap(basis, lokal, fern) {
    basis = basis || {}; lokal = lokal || {}; fern = fern || {};
    var raus = {}, schluessel = {};
    [basis, lokal, fern].forEach(function (m) {
      Object.keys(m).forEach(function (k) { schluessel[k] = 1; });
    });
    Object.keys(schluessel).forEach(function (k) {
      var n = zaehler(basis[k], lokal[k], fern[k]);
      if (n) raus[k] = n;
    });
    return raus;
  }

  function groesser(a, b) { return Math.max(zahl(a), zahl(b)); }

  // Abzeichen: wer es hat, behält es. Der frühere Zeitpunkt gilt.
  function abzeichen(lokal, fern) {
    var raus = Object.assign({}, fern || {});
    Object.keys(lokal || {}).forEach(function (k) {
      raus[k] = raus[k] ? Math.min(raus[k], lokal[k]) : lokal[k];
    });
    return raus;
  }

  // Statistik je Wort. ok, wr und die Treffer je Tauchrevier sind Zähler.
  function woerter(basis, lokal, fern) {
    basis = basis || {}; lokal = lokal || {}; fern = fern || {};
    var raus = {}, ids = {};
    [basis, lokal, fern].forEach(function (m) {
      Object.keys(m).forEach(function (k) { ids[k] = 1; });
    });
    Object.keys(ids).forEach(function (id) {
      var b = basis[id] || {}, l = lokal[id] || {}, f = fern[id] || {};
      var eintrag = {
        ok: zaehler(b.ok, l.ok, f.ok),
        wr: zaehler(b.wr, l.wr, f.wr),
        c: zaehlerMap(b.c, l.c, f.c)
      };
      // Ob das Wort zuletzt falsch war, sagt der jüngere Stand.
      eintrag.lastWrong = lokal[id] ? !!l.lastWrong : !!f.lastWrong;
      if (eintrag.ok || eintrag.wr) raus[id] = eintrag;
    });
    return raus;
  }

  // Malzeit: rest ist ein Zähler (Gutschriften rauf, Verbrauch runter),
  // die Tage sind eine Vereinigung, damit es die Gutschrift nicht
  // zweimal gibt.
  function malen(basis, lokal, fern) {
    var b = basis || {}, l = lokal || {}, f = fern || {};
    return {
      rest: Math.max(0, zahl(f.rest) + (zahl(l.rest) - zahl(b.rest))),
      tage: Object.assign({}, f.tage || {}, l.tage || {}),
      bilder: [],                       // eigene Sammlung
      aktiv: l.aktiv != null ? l.aktiv : (f.aktiv != null ? f.aktiv : null),
      naechsteId: groesser(l.naechsteId, f.naechsteId) || 1,
      frisch: zahl(l.frisch)
    };
  }

  /* Der eigentliche Abgleich.
     basis darf null sein – dann hat dieses Gerät noch nie abgeglichen
     und sein ganzer Stand gilt als eigener Zuwachs.
     fern darf null sein – dann gibt es in der Datenbank noch nichts. */
  function spielstand(basis, lokal, fern) {
    basis = basis || {};
    lokal = lokal || {};
    if (!fern) return Object.assign({}, lokal);

    // Ein Zurücksetzen durch die Lehrkraft ist ein GEWOLLTER Verlust.
    // Der Dreiwege-Vergleich würde ihn rückgängig machen: Abzeichen
    // werden vereinigt und Rekorde sind das Maximum, also kämen sie
    // vom Gerät des Kindes zurück. Trägt der ferne Stand eine neue
    // Reset-Marke, gilt er deshalb vollständig.
    if (fern.resetAt && fern.resetAt !== basis.resetAt) {
      var frisch = Object.assign({}, fern);
      // Quittung: Der Lehrerbereich sieht daran, dass dieses Gerät den
      // Reset wirklich übernommen hat und nichts mehr nachträgt.
      frisch.resetGesehen = fern.resetAt;
      frisch.updatedAt = Date.now();
      return frisch;
    }

    var lokalNeuer = zahl(lokal.updatedAt) >= zahl(fern.updatedAt);
    var juenger = lokalNeuer ? lokal : fern;          // für Werte ohne Zählcharakter

    return {
      v: 1,

      // Luftblasen füllen sich mit der Zeit von selbst. Ein Zuwachs
      // ließe sich nicht vom Nachfüllen unterscheiden, deshalb gilt
      // hier schlicht der jüngere Stand.
      hearts: zahl(juenger.hearts),
      heartsAt: zahl(juenger.heartsAt),

      xp: zaehler(basis.xp, lokal.xp, fern.xp),
      xpGemeldet: groesser(lokal.xpGemeldet, fern.xpGemeldet),
      days: zaehlerMap(basis.days, lokal.days, fern.days),
      lessons: zaehler(basis.lessons, lokal.lessons, fern.lessons),
      worlds: zaehlerMap(basis.worlds, lokal.worlds, fern.worlds),
      words: woerter(basis.words, lokal.words, fern.words),
      badges: abzeichen(lokal.badges, fern.badges),

      best: {
        day: groesser((lokal.best || {}).day, (fern.best || {}).day),
        lesson: groesser((lokal.best || {}).lesson, (fern.best || {}).lesson)
      },

      // Der spätere Übungstag und die längere Serie gewinnen.
      lastDay: (String(lokal.lastDay || '') > String(fern.lastDay || ''))
        ? (lokal.lastDay || null) : (fern.lastDay || null),
      streakDays: groesser(lokal.streakDays, fern.streakDays),

      sound: juenger.sound !== false,
      mal: malen(basis.mal, lokal.mal, fern.mal),
      // Die Marke mitführen, sonst greift derselbe Reset immer wieder.
      resetAt: fern.resetAt || lokal.resetAt || null,
      resetGesehen: lokal.resetGesehen || fern.resetGesehen || null,
      updatedAt: Date.now()
    };
  }

  // Perlen, die dieses Gerät seit dem letzten Abgleich dazugewonnen
  // hat. Nur die dürfen dem Klassenziel gutgeschrieben werden – der
  // Zuwachs des anderen Geräts wurde dort schon gemeldet.
  function eigenerZuwachs(basis, lokal) {
    var d = zahl((lokal || {}).xp) - zahl((basis || {}).xp);
    return Math.max(0, Math.min(500, d));
  }

  WA.mische = {
    spielstand: spielstand,
    eigenerZuwachs: eigenerZuwachs,
    zaehler: zaehler, zaehlerMap: zaehlerMap, woerter: woerter, abzeichen: abzeichen
  };
})();
