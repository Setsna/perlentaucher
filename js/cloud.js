/* ==========================================================
   WortAbenteuer – Anmeldung und Speicherung in Firebase

   Ablauf:
   1. Kind scannt den QR-Code im Hausaufgabenheft.
      Die Adresse endet dann auf  #c=K7PM4XRT
   2. Die App meldet das Kind unsichtbar bei Firebase an.
      Benutzername: k7pm4xrt@lernplattform-44aa1.firebaseapp.com
      Passwort:     K7PM4XRT
      Das Kind bekommt davon nichts mit.
   3. Nur Codes, die im Lehrerbereich angelegt wurden, funktionieren.
   4. Der Spielstand liegt unter  fortschritt/k7pm4xrt.

   Wenn Firebase nicht geladen werden kann (kein Netz, CDN gesperrt),
   läuft die App im Übungsmodus weiter und speichert nur lokal.
   ========================================================== */
window.WA = window.WA || {};

WA.firebaseConfig = {
  apiKey: "AIzaSyBX3MUJq69uFyejbEiJimGeAtHMER3OCdE",
  authDomain: "lernplattform-44aa1.firebaseapp.com",
  projectId: "lernplattform-44aa1",
  storageBucket: "lernplattform-44aa1.firebasestorage.app",
  messagingSenderId: "213839225177",
  appId: "1:213839225177:web:4cf676269e50c708466c48"
};

(function () {
  'use strict';

  var CODE_RE = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/;
  var app = null, auth = null, db = null;
  var kind = null;          // { code, vorname }
  var bereit = false;       // angemeldet und Spielstand geladen
  var schreibTimer = null;
  var onReady = null;

  function vorhanden() { return typeof firebase !== 'undefined' && !!WA.firebaseConfig.apiKey; }

  function mailVon(code) { return code.toLowerCase() + '@' + WA.firebaseConfig.authDomain; }

  function codeAusAdresse() {
    var m = /[#&?]c=([A-Za-z0-9]{8})/.exec(location.hash + location.search);
    return m ? m[1].toUpperCase() : null;
  }

  function adresseSaeubern() {
    // Den Code aus der Adresszeile entfernen, damit er nicht
    // auf Screenshots oder im Verlauf sichtbar bleibt.
    try {
      if (location.hash || location.search) {
        history.replaceState(null, '', location.pathname);
      }
    } catch (e) {}
  }

  // ---------- Kalenderwoche, z. B. "2026-W38" ----------
  function wochenSchluessel(d) {
    d = new Date(d || Date.now());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));   // Donnerstag derselben Woche
    var jahr = d.getFullYear();
    var jan4 = new Date(jahr, 0, 4);
    var woche = 1 + Math.round(((d - jan4) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
    return jahr + '-W' + (woche < 10 ? '0' + woche : woche);
  }

  // ==========================================================
  //  Start
  // ==========================================================
  function start(fertig) {
    onReady = fertig || function () {};
    if (!vorhanden()) { onReady(); return; }

    try {
      app = firebase.initializeApp(WA.firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      db.enablePersistence({ synchronizeTabs: true })
        .catch(function () {});        // ohne Offline-Zwischenspeicher weitermachen
    } catch (e) {
      console.warn('Firebase nicht verfügbar:', e);
      app = null; onReady(); return;
    }

    var code = codeAusAdresse();
    var inArbeit = false;

    // Firebase meldet den Anmeldezustand mehrfach. Wir arbeiten ihn
    // genau einmal ab und rufen danach immer die Oberfläche auf.
    auth.onAuthStateChanged(function (user) {
      if (bereit) { onReady(); return; }
      if (inArbeit) return;
      inArbeit = true;

      var p;
      if (user && user.email && user.email.indexOf('@') > 0) {
        p = nachAnmeldung(user.email.split('@')[0].toUpperCase());
      } else if (code) {
        p = anmelden(code).then(adresseSaeubern);
      } else {
        p = Promise.resolve();
      }

      p.then(function () { inArbeit = false; onReady(); },
             function (f) { inArbeit = false; fehlerMelden(f); onReady(); });
    });
  }

  var letzterFehler = null;
  function fehlerMelden(f) {
    letzterFehler = f;
    console.warn('WortAbenteuer:', f);
  }

  // ==========================================================
  //  Anmelden
  // ==========================================================
  function anmelden(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!CODE_RE.test(code)) {
      return Promise.reject('Dieser Code sieht nicht richtig aus. Bitte noch einmal prüfen.');
    }
    var mail = mailVon(code);
    return auth.signInWithEmailAndPassword(mail, code)
      .catch(function (e) {
        // Beim allerersten Anmelden gibt es das Konto noch nicht.
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
          return auth.createUserWithEmailAndPassword(mail, code);
        }
        throw e;
      })
      .then(function () { return nachAnmeldung(code); })
      .catch(function (e) {
        var c = e && e.code;
        if (c === 'auth/wrong-password') throw 'Dieser Code gehört zu einem anderen Kind.';
        if (c === 'auth/network-request-failed') throw 'Keine Internetverbindung.';
        if (c === 'auth/too-many-requests') throw 'Zu viele Versuche. Bitte kurz warten.';
        throw (typeof e === 'string') ? e : 'Anmeldung nicht möglich.';
      });
  }

  // Lernwörter und Einstellungen aus der Datenbank holen.
  // Schlägt das fehl, bleiben die mitgelieferten Werte aus js/words.js
  // und js/config.js in Kraft.
  function stammdatenLaden(kindDaten) {
    return Promise.all([
      db.collection('lernwoerter').get().catch(function () { return null; }),
      db.collection('einstellungen').doc('klasse').get().catch(function () { return null; })
    ]).then(function (r) {
      var woerter = r[0], einst = r[1];

      if (woerter && woerter.size) {
        var liste = [];
        woerter.forEach(function (d) {
          var w = d.data();
          if (w && w.wort) liste.push(WA.wortAusDoc(d.id, w));
        });
        if (liste.length) {
          liste.sort(function (a, b) { return a.wort.localeCompare(b.wort, 'de'); });
          WA.words = liste;
        }
      }

      // Erst die Einstellungen der Klasse, dann die des Kindes.
      if (einst && einst.exists) WA.applySettings(einst.data());
      if (kindDaten) {
        WA.applySettings({
          stufe: kindDaten.stufe || undefined,
          aktiveListe: kindDaten.liste !== undefined && kindDaten.liste !== null
            ? kindDaten.liste : undefined
        });
      }
    });
  }

  // Nach erfolgreicher Anmeldung: Kind prüfen, Stammdaten und Spielstand laden
  function nachAnmeldung(code) {
    var id = code.toLowerCase();
    return db.collection('kinder').doc(id).get()
      .then(function (snap) {
        if (!snap.exists) {
          return auth.signOut().then(function () {
            throw 'Dieser Code ist noch nicht freigeschaltet. Bitte sag deiner Lehrkraft Bescheid.';
          });
        }
        var d = snap.data();
        kind = { code: code, vorname: d.vorname || 'Taucher' };
        WA.store.useProfile(id);
        return stammdatenLaden(d);
      })
      .then(function () { return db.collection('fortschritt').doc(kind.code.toLowerCase()).get(); })
      .then(function (snap) {
        var lokal = WA.store.snapshot();
        if (snap.exists) {
          var fern = snap.data();
          // Der neuere Stand gewinnt. So geht nichts verloren,
          // wenn zwischendurch ohne Netz geübt wurde.
          if ((fern.updatedAt || 0) >= (lokal.updatedAt || 0)) WA.store.hydrate(fern);
        }
        bereit = true;
        WA.store.onChange(spaeterSchreiben);
        schreiben();
        return true;
      });
  }

  function abmelden() {
    if (!auth) return Promise.resolve();
    return schreiben().catch(function () {}).then(function () {
      bereit = false; kind = null;
      return auth.signOut();
    });
  }

  // ==========================================================
  //  Speichern
  // ==========================================================
  function spaeterSchreiben() {
    if (!bereit) return;
    clearTimeout(schreibTimer);
    schreibTimer = setTimeout(schreiben, 2500);
  }

  function schreiben() {
    if (!bereit || !kind) return Promise.resolve();
    clearTimeout(schreibTimer);
    var s = WA.store.snapshot();
    var id = kind.code.toLowerCase();

    // Neu dazugekommene Perlen dem Klassenziel gutschreiben.
    var gemeldet = s.xpGemeldet || 0;
    var neu = Math.max(0, Math.min(500, (s.xp || 0) - gemeldet));

    var p = db.collection('fortschritt').doc(id).set(s);
    if (neu > 0) {
      p = p.then(function () {
        return db.collection('klassenwochen').doc(wochenSchluessel())
          .set({ perlen: firebase.firestore.FieldValue.increment(neu) }, { merge: true });
      }).then(function () {
        WA.store.setXpGemeldet(gemeldet + neu);
        return db.collection('fortschritt').doc(id).update({ xpGemeldet: gemeldet + neu });
      });
    }
    return p.catch(function (e) { fehlerMelden(e); });
  }

  // Beim Verlassen der Seite noch schnell sichern
  window.addEventListener('pagehide', function () { schreiben(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') schreiben();
  });

  // ==========================================================
  //  Klassenziel
  // ==========================================================
  function klassenWoche() {
    if (!bereit) return Promise.resolve(null);
    return db.collection('klassenwochen').doc(wochenSchluessel()).get()
      .then(function (s) { return s.exists ? (s.data().perlen || 0) : 0; })
      .catch(function () { return null; });
  }

  WA.cloud = {
    start: start,
    aktiv: function () { return !!app; },
    angemeldet: function () { return bereit; },
    kind: function () { return kind; },
    anmelden: anmelden,
    abmelden: abmelden,
    schreiben: schreiben,
    klassenWoche: klassenWoche,
    wochenSchluessel: wochenSchluessel,
    fehler: function () { return letzterFehler; }
  };
})();
