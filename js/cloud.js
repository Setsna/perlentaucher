/* ==========================================================
   Perlentaucher – Anmeldung und Speicherung in Firebase

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
  var bilderGeladen = false;    // Bilder des Kindes schon aus der Datenbank geholt?
  var letzteFassung = {};       // je Bild der zuletzt hochgeladene Stand
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
    console.warn('Perlentaucher:', f);
  }

  // ==========================================================
  //  Speicherzustand
  //  Bisher landete ein fehlgeschlagener Schreibvorgang nur in der
  //  Browser-Konsole. Ein Kind hätte weitergeübt und geglaubt, alles
  //  sei gesichert. Diese drei Zustände werden nach außen gemeldet:
  //    ok       zuletzt erfolgreich gespeichert
  //    wartet   Schreibvorgang unterwegs (bei Funkloch: liegt bereit)
  //    fehler   die Datenbank hat abgelehnt
  // ==========================================================
  var speicher = { zustand: 'ok', seit: Date.now(), meldung: null };
  var speicherLauscher = [];
  var wartUhr = null;

  function speicherMelden(zustand, meldung) {
    if (speicher.zustand === zustand && speicher.meldung === (meldung || null)) return;
    clearTimeout(wartUhr); wartUhr = null;
    speicher = { zustand: zustand, seit: Date.now(), meldung: meldung || null };
    speicherLauscher.forEach(function (f) { try { f(speicher); } catch (e) {} });
  }

  // Firestore lehnt einen Schreibvorgang ohne Netz nicht ab, sondern
  // hält ihn zurück. Dauert das ungewöhnlich lange, sagen wir das –
  // aber als Hinweis, nicht als Fehler.
  // Läuft die Uhr schon, wird sie nicht neu gestartet. Sonst würde
  // jeder neue Versuch die Wartezeit zurücksetzen und der Hinweis
  // käme nie.
  function wartenBeobachten() {
    if (wartUhr) return;
    wartUhr = setTimeout(function () {
      wartUhr = null;
      if (speicher.zustand === 'wartet') speicherMelden('wartet-lange');
    }, 25000);
  }

  function schreibFehlerText(e) {
    var c = e && e.code;
    if (c === 'permission-denied') return 'Die Datenbank hat das Speichern abgelehnt.';
    if (c === 'resource-exhausted') return 'Die Datenbank ist für heute ausgelastet.';
    if (c === 'unavailable') return 'Die Datenbank ist gerade nicht erreichbar.';
    return (e && (e.message || e)) || 'Unbekannter Fehler beim Speichern.';
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
      db.collection('einstellungen').doc('klasse').get().catch(function () { return null; }),
      db.collection('quizfragen').get().catch(function () { return null; })
    ]).then(function (r) {
      var woerter = r[0], einst = r[1], fragen = r[2];

      // Sachunterricht: Fragen aus der Datenbank. Kommt nichts an,
      // bleiben die mitgelieferten Fragen aus js/quiz.js in Kraft.
      if (fragen && fragen.size) {
        var liste2 = [];
        fragen.forEach(function (d) {
          var f = d.data();
          if (f && f.frage && f.aktiv !== false) liste2.push(WA.frageAusDoc(d.id, f));
        });
        if (liste2.length) WA.fragen = liste2;
      }

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
      .then(function () {
        bereit = true;
        WA.store.onChange(spaeterSchreiben);
        // Beim Anmelden wird nicht überschrieben, sondern zusammen-
        // geführt – genau wie bei jedem späteren Speichern auch.
        //
        // WICHTIG: ohne "return". Das Kind sah vorher einen weißen
        // Bildschirm, bis diese Transaktion durch war – eine vierte
        // Netzrunde nacheinander. Der Spielstand liegt lokal sicher,
        // das Hochladen darf nebenher laufen. Schlägt es fehl, meldet
        // sich die Speicherleiste, und spaeterSchreiben versucht es
        // beim nächsten Speichern erneut.
        schreiben().catch(function () {});
        return true;
      });
  }

  function abmelden() {
    if (!auth) return Promise.resolve();
    return schreiben().catch(function () {}).then(function () {
      bereit = false; kind = null; bilderGeladen = false; letzteFassung = {};
      return auth.signOut();
    });
  }

  // ==========================================================
  //  Speichern
  // ==========================================================
  function spaeterSchreiben(verzug) {
    if (!bereit) return;
    clearTimeout(schreibTimer);
    schreibTimer = setTimeout(schreiben, typeof verzug === 'number' ? verzug : 2500);
  }

  function ohneBilder(x) {
    var k = Object.assign({}, x);
    k.mal = Object.assign({}, x.mal || {}, { bilder: [] });
    return k;
  }

  // ==========================================================
  //  Speichern = Zusammenführen
  //  Es wird nicht blind überschrieben. In einer Transaktion wird
  //  der ferne Stand gelesen, mit dem eigenen verrechnet (siehe
  //  js/merge.js) und das Ergebnis zurückgeschrieben. Übt ein Kind
  //  auf zwei Geräten, geht dadurch nichts mehr verloren.
  // ==========================================================
  function schreiben() {
    if (!bereit || !kind) return Promise.resolve();
    clearTimeout(schreibTimer);
    var id = kind.code.toLowerCase();
    var ref = db.collection('fortschritt').doc(id);
    var lokal = ohneBilder(WA.store.snapshot());
    var basis = WA.store.basis();
    var zusammen = null;

    speicherMelden('wartet');
    wartenBeobachten();

    return db.runTransaction(function (t) {
      return t.get(ref).then(function (snap) {
        zusammen = WA.mische.spielstand(basis, lokal, snap.exists ? snap.data() : null);
        // xpGemeldet hat keine eigene Bedeutung mehr, es zeigt nur an,
        // wie viel insgesamt gemeldet wurde. Die Lehrkraft setzt es
        // beim Zurücksetzen auf null.
        zusammen.xpGemeldet = zusammen.xp;
        t.set(ref, zusammen);
      });
    }).then(function () {
      WA.store.abgleichUebernehmen(zusammen);
      bilderSichern();
      speicherMelden('ok');
      return klassenzielMelden(WA.mische.eigenerZuwachs(basis, lokal));
    }, function (e) {
      // Ohne Netz kommt eine Transaktion nicht zustande. Das ist kein
      // Fehler: Der Spielstand liegt weiter lokal, wir versuchen es
      // gleich noch einmal.
      if (!e || e.code === 'unavailable' || e.code === 'deadline-exceeded' ||
          e.code === 'failed-precondition' || e.code === 'aborted') {
        spaeterSchreiben(8000);
        return;
      }
      fehlerMelden(e);
      speicherMelden('fehler', schreibFehlerText(e));
    });
  }

  // Nur der eigene Zuwachs zählt für das Klassenziel. Was ein anderes
  // Gerät beigesteuert hat, hat dieses Gerät dort schon gemeldet.
  function klassenzielMelden(neu) {
    if (!neu) return Promise.resolve();
    return db.collection('klassenwochen').doc(wochenSchluessel())
      .set({ perlen: firebase.firestore.FieldValue.increment(neu) }, { merge: true })
      .catch(function (e) { fehlerMelden(e); });
  }

  // ==========================================================
  //  Gemalte Bilder – eine eigene Sammlung, ein Datensatz je Bild
  //  Kennung: <code>_<nummer>, zum Beispiel  wd3ftqrg_7
  // ==========================================================
  function bildSchluessel(b) { return JSON.stringify(b); }

  // Bilder des Kindes holen. Wird erst aufgerufen, wenn das Kind
  // den Malbereich öffnet – nicht schon beim Anmelden.
  function bilderLaden() {
    if (!bereit || !kind) return Promise.resolve(WA.store.malBilder());
    if (bilderGeladen) return Promise.resolve(WA.store.malBilder());
    var code = kind.code.toLowerCase();
    return db.collection('bilder').where('code', '==', code).get()
      .then(function (snap) {
        var liste = [], geloescht = [];
        snap.forEach(function (d) {
          var x = d.data();
          // Eine Löschmarke: Das Kind hat dieses Bild weggeworfen.
          // Sie bleibt stehen, damit kein anderes Gerät es zurückholt.
          if (x.geloescht) { geloescht.push(x.id); letzteFassung[x.id] = 'weg'; return; }
          liste.push({ id: x.id, art: x.art || 'raster', g: x.g || 16,
                       px: x.px, striche: x.striche, fertig: !!x.fertig, ts: x.ts || 0 });
          letzteFassung[x.id] = bildSchluessel({ id: x.id, art: x.art || 'raster', g: x.g || 16,
                       px: x.px, striche: x.striche, fertig: !!x.fertig, ts: x.ts || 0 });
        });
        bilderGeladen = true;
        if (geloescht.length) WA.store.malWegMerken(geloescht);
        WA.store.malZusammenfuehren(liste);
        bilderSichern();                      // was nur lokal da war, hochladen
        return WA.store.malBilder();
      })
      .catch(function (e) {
        fehlerMelden(e);
        bilderGeladen = true;                 // offline weiterarbeiten
        return WA.store.malBilder();
      });
  }

  // Nur die Bilder schreiben, die sich seit dem letzten Mal
  // geändert haben. Sonst würden bei jedem Strich alle Bilder
  // neu hochgeladen.
  function bilderSichern() {
    if (!bereit || !kind || !bilderGeladen) return Promise.resolve();
    var code = kind.code.toLowerCase(), aufgaben = [];
    // Erst die Löschmarken: ein winziges Dokument ohne Bilddaten.
    WA.store.malWeg().forEach(function (id) {
      if (letzteFassung[id] === 'weg') return;
      letzteFassung[id] = 'weg';
      aufgaben.push(db.collection('bilder').doc(code + '_' + id)
        .set({ code: code, id: id, geloescht: true, ts: Date.now() }));
    });
    WA.store.malBilder().forEach(function (b) {
      var schluessel = bildSchluessel(b);
      if (letzteFassung[b.id] === schluessel) return;
      letzteFassung[b.id] = schluessel;
      var daten = { code: code, id: b.id, art: b.art || 'raster',
                    fertig: !!b.fertig, ts: b.ts || Date.now() };
      if (daten.art === 'frei') daten.striche = b.striche || '';
      else { daten.px = b.px || ''; daten.g = b.g || 16; }
      aufgaben.push(db.collection('bilder').doc(code + '_' + b.id).set(daten));
    });
    return Promise.all(aufgaben).catch(function (e) {
      fehlerMelden(e);
      speicherMelden('fehler', schreibFehlerText(e));
    });
  }

  // Beim Verlassen der Seite noch schnell sichern
  window.addEventListener('pagehide', function () { schreiben(); });
  // Sobald das Gerät wieder Netz hat, sofort nachholen.
  window.addEventListener('online', function () { spaeterSchreiben(500); });
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
    bilderLaden: bilderLaden,
    speicher: function () { return speicher; },
    onSpeicher: function (f) {
      if (speicherLauscher.indexOf(f) < 0) speicherLauscher.push(f);
      f(speicher);
    },
    bilderSichern: bilderSichern,
    wochenSchluessel: wochenSchluessel,
    fehler: function () { return letzterFehler; }
  };
})();
