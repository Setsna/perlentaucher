/* ==========================================================
   Kleiner Test für den Lehrerbereich (js/lehrer.js), ohne Browser
   und ohne Anmeldung:

     node tools/test/lehrer-test.js

   lehrer.js ist ein geschlossener Block ohne Ausgänge. Der Test
   schneidet deshalb einzelne Funktionen als Text heraus und lässt
   sie gegen eine nachgebaute Datenbank laufen. Die echte Datenbank
   wird nie berührt.

   Geprüft wird nur, was mit den Ständen der anderen Plattformen
   (zs_stand Zahlenschwarm, fp_stand Flaschenpost, ra_stand Riff-Akten, sw_stand Seesternwerkstatt, kr_stand KI-Korallenriff, cb_stand Chancenbucht, lu_stand Leuchtturmuhr, kw_stand Kieselwaage, wg_stand Walgesang, ze_stand Zeitenstrom, sa_stand Satzwerft, an_stand Abyss of Numbers) zu tun hat:
   Sicherung, Auskunft, Kind löschen, Zurücksetzen.
   Dazu der erzeugte Text der Kinderzeile (vier Knöpfe) und des Felds
   „Zurücksetzen“ (Plattform-Knöpfe).
   Seit v72 auch die Navigation in zwei Ebenen (BEREICHE): Startzustand,
   Bereich und Reiter wählen, jeder alte Reiter erreichbar.
   Seit v73 der Bereich Abyss of Numbers: Einträge, Zeichnen mit esc(),
   Sortieren, Ansicht „Kind“, Download ohne Namen ab drei Kindern je
   Klassenstufe, dazu ein Lauf mit dem echten Berichtsmodul aus dem
   Nachbarordner „Abyss of Numbers“ (fehlt er, wird das übersprungen).
   NICHT geprüft: die Seite selbst, Klicks, Nachfragen, Anmeldung,
   die echten Firestore-Regeln.
   ========================================================== */
'use strict';
var fs = require('fs');
var path = require('path');
var quelle = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'lehrer.js'), 'utf8');

// Schneidet "function name(...) { ... }" heraus (Klammern gezählt).
function funktion(name) {
  var start = quelle.indexOf('  function ' + name + '(');
  if (start < 0) throw new Error('Funktion fehlt in lehrer.js: ' + name);
  var i = quelle.indexOf('{', start), tiefe = 0;
  for (; i < quelle.length; i++) {
    if (quelle[i] === '{') tiefe++;
    if (quelle[i] === '}') { tiefe--; if (tiefe === 0) return quelle.slice(start, i + 1); }
  }
  throw new Error('Ende nicht gefunden: ' + name);
}
var sammlungenZeile = (quelle.match(/^\s*var SAMMLUNGEN = \[.*\];$/m) || [])[0];
if (!sammlungenZeile) throw new Error('SAMMLUNGEN fehlt in lehrer.js');
var plattformenZeile = (quelle.match(/^\s*var PLATTFORMEN = \[.*\];$/m) || [])[0];
if (!plattformenZeile) throw new Error('PLATTFORMEN fehlt in lehrer.js (muss eine Zeile sein)');

// ---------- nachgebaute Datenbank ----------
function attrappe(inhalt) {
  var log = [];
  function dok(c, id) {
    return {
      c: c, id: id,
      get: function () {
        var d = (inhalt[c] || {})[id];
        return Promise.resolve({ exists: d !== undefined, id: id, data: function () { return d; } });
      },
      delete: function () {
        log.push('delete ' + c + '/' + id);
        if (inhalt[c]) delete inhalt[c][id];
        return Promise.resolve();
      }
    };
  }
  function schnappschuss(c, filter) {
    var ids = Object.keys(inhalt[c] || {}).filter(filter || function () { return true; });
    return { forEach: function (f) {
      ids.forEach(function (id) {
        f({ id: id, ref: dok(c, id), data: function () { return inhalt[c][id]; } });
      });
    } };
  }
  return {
    log: log,
    collection: function (c) {
      return {
        doc: function (id) { return dok(c, id); },
        get: function () { return Promise.resolve(schnappschuss(c)); },
        where: function (feld, op, wert) {
          return { get: function () {
            return Promise.resolve(schnappschuss(c, function (id) { return inhalt[c][id][feld] === wert; }));
          } };
        }
      };
    },
    batch: function () {
      var vor = [];
      return {
        delete: function (ref) { vor.push(ref); },
        commit: function () {
          log.push('paket ' + vor.map(function (r) { return r.c + '/' + r.id; }).join(' '));
          vor.forEach(function (r) { if (inhalt[r.c]) delete inhalt[r.c][r.id]; });
          return Promise.resolve();
        }
      };
    }
  };
}

// Baut die herausgeschnittenen Funktionen mit eigener Umgebung zusammen.
function bauen(db, kinder, um) {
  var koerper = sammlungenZeile + '\n' + plattformenZeile + '\n' +
    ['plattformNamen', 'sicherungPruefen', 'alleHolen', 'auskunft', 'kindLoeschen', 'standLoeschen'].map(funktion).join('\n') +
    '\nreturn { SAMMLUNGEN: SAMMLUNGEN, PLATTFORMEN: PLATTFORMEN, sicherungPruefen: sicherungPruefen, alleHolen: alleHolen,' +
    ' auskunft: auskunft, kindLoeschen: kindLoeschen, standLoeschen: standLoeschen,' +
    ' zsStandLoeschen: function (id) { return standLoeschen(\'zs_stand\', id); } };';
  return new Function('db', 'kinder', 'melde', 'esc', 'alsDateiSichern', 'heuteFuerDateiname', koerper)(
    db, kinder, um.melde, function (s) { return String(s); }, um.alsDateiSichern,
    function () { return '2026-01-01'; });
}

var gut = 0, schlecht = 0;
function pruefe(name, ok) {
  if (ok) gut++; else schlecht++;
  console.log((ok ? 'ok     ' : 'FEHLER ') + name);
}
function warte() { return new Promise(function (r) { setTimeout(r, 20); }); }

function frisch() {
  return {
    kinder: { aaaa1111: { vorname: 'Mila' }, bbbb2222: { vorname: 'Tom' } },
    fortschritt: { aaaa1111: { xp: 5 }, bbbb2222: { xp: 7 } },
    bilder: { aaaa1111_1: { code: 'aaaa1111' }, bbbb2222_1: { code: 'bbbb2222' } },
    zs_stand: { aaaa1111: { klasse: 3, aufgaben: {}, schwarm: {}, stempel: {}, zeit: {}, geaendert: 1 },
                bbbb2222: { klasse: 4, aufgaben: {}, schwarm: {}, stempel: {}, zeit: {}, geaendert: 2 } },
    fp_stand: { aaaa1111: { stationen: { 'wer-1': { fertig: 5 } }, stempel: { 'wer-1': 5 }, zeit: {}, kannIch: {}, angelegt: 1, geaendert: 5 },
                bbbb2222: { stationen: {}, stempel: {}, zeit: {}, kannIch: {}, angelegt: 2, geaendert: 2 } },
    ra_stand: { aaaa1111: { erledigt: { demo: 7 }, stempel: { demo: 7 }, zeit: { demo: 60 }, eintraege: {}, abzeichen: 'qualle', angelegt: 1, geaendert: 7 },
                bbbb2222: { erledigt: {}, stempel: {}, zeit: {}, eintraege: {}, abzeichen: '', angelegt: 2, geaendert: 2 } },
    sw_stand: { aaaa1111: { tangram: { geloest: { 'wal:knifflig': 9 } }, spiegeln: { runden: { leicht: 1 } }, band: { runden: {} }, stempel: { 'spiegeln:leicht': 9 }, angelegt: 1, geaendert: 9 },
                bbbb2222: { tangram: { geloest: {} }, spiegeln: { runden: {} }, band: { runden: {} }, stempel: {}, angelegt: 2, geaendert: 2 } },
    kr_stand: { aaaa1111: { done: { a1: 2 }, stempel: { a1: 9 }, zeit: { a1: 300 }, ziele: { 'm1-0': 'kann' }, angelegt: 1, geaendert: 9 },
                bbbb2222: { done: {}, stempel: {}, zeit: {}, ziele: {}, angelegt: 2, geaendert: 2 } },
    cb_stand: { aaaa1111: { stempel: { 'muenze:leicht': 9 }, runden: { 'muenze:leicht': 6 }, angelegt: 1, geaendert: 9 },
                bbbb2222: { stempel: {}, runden: {}, angelegt: 2, geaendert: 2 } },
    lu_stand: { aaaa1111: { stempel: { 'uhr:leicht': 9 }, runden: { 'uhr:leicht': 4 }, angelegt: 1, geaendert: 9 },
                bbbb2222: { stempel: {}, runden: {}, angelegt: 2, geaendert: 2 } },
    kw_stand: { aaaa1111: { stempel: { 'gramm:leicht': 9 }, runden: { 'gramm:leicht': 5 }, angelegt: 1, geaendert: 9 },
                bbbb2222: { stempel: {}, runden: {}, angelegt: 2, geaendert: 2 } },
    wg_stand: { aaaa1111: { stempel: { 'vorne:leicht': 9 }, runden: { 'vorne:leicht': 7 }, angelegt: 1, geaendert: 9 },
                bbbb2222: { stempel: {}, runden: {}, angelegt: 2, geaendert: 2 } },
    ze_stand: { aaaa1111: { stempel: { 'erkennen:leicht': 9 }, runden: { 'erkennen:leicht': 8 }, angelegt: 1, geaendert: 9 },
                bbbb2222: { stempel: {}, runden: {}, angelegt: 2, geaendert: 2 } },
    sa_stand: { aaaa1111: { stempel: { 'umstellen:leicht': 9 }, runden: { 'umstellen:leicht': 6 }, angelegt: 1, geaendert: 9 },
                bbbb2222: { stempel: {}, runden: {}, angelegt: 2, geaendert: 2 } },
    an_stand: { aaaa1111: { spielstand: '{"stufe":4}', angelegt: 1, geaendert: 9 },
                bbbb2222: { spielstand: '', angelegt: 2, geaendert: 2 } },
    ra_faelle: { demo: { titel: 'Akte', nr: 1 } },
    ra_loesungen: { demo: { aufgaben: {} } }
  };
}
var kinderListe = [{ id: 'aaaa1111', vorname: 'Mila' }, { id: 'bbbb2222', vorname: 'Tom' }];

(async function () {
  var inhalt, db, datei, meldungen, L;
  function neu() {
    inhalt = frisch(); db = attrappe(inhalt); datei = null; meldungen = [];
    L = bauen(db, kinderListe, {
      melde: function (t) { meldungen.push(t); },
      alsDateiSichern: function (name, text) { datei = { name: name, daten: JSON.parse(text) }; return true; }
    });
  }

  // ---- Sicherung ----
  neu();
  pruefe('SAMMLUNGEN enthält zs_stand', L.SAMMLUNGEN.indexOf('zs_stand') >= 0);
  pruefe('SAMMLUNGEN enthält fp_stand', L.SAMMLUNGEN.indexOf('fp_stand') >= 0);
  pruefe('SAMMLUNGEN enthält ra_stand, ra_faelle und ra_loesungen',
    ['ra_stand', 'ra_faelle', 'ra_loesungen'].every(function (c) { return L.SAMMLUNGEN.indexOf(c) >= 0; }));
  pruefe('PLATTFORMEN enthält ra_stand, aber nicht die Akten',
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'ra_stand' && pf.name === 'Riff-Akten'; }) &&
    !L.PLATTFORMEN.some(function (pf) { return /^ra_(faelle|loesungen)$/.test(pf.sammlung); }));
  pruefe('jede Plattform steht auch in SAMMLUNGEN (Sicherung)',
    L.PLATTFORMEN.every(function (pf) { return L.SAMMLUNGEN.indexOf(pf.sammlung) >= 0; }));
  var alles = await L.alleHolen(true);
  pruefe('Sicherung holt zs_stand mit beiden Kindern',
    alles.zs_stand && Object.keys(alles.zs_stand).length === 2 && alles.zs_stand.aaaa1111.klasse === 3);
  var ohneBilder = await L.alleHolen(false);
  pruefe('Sicherung ohne Bilder enthält zs_stand trotzdem', !!ohneBilder.zs_stand && ohneBilder.bilder === undefined);
  pruefe('Sicherung holt ra_stand und die Akten',
    alles.ra_stand && alles.ra_stand.aaaa1111.stempel.demo === 7 && alles.ra_faelle && alles.ra_faelle.demo && alles.ra_loesungen && alles.ra_loesungen.demo);
  pruefe('Sicherung holt fp_stand mit beiden Kindern',
    alles.fp_stand && Object.keys(alles.fp_stand).length === 2 && alles.fp_stand.aaaa1111.stempel['wer-1'] === 5);

  var paket = { format: 'perlentaucher-sicherung', version: 1, daten: alles };
  pruefe('Sicherung mit zs_stand wird angenommen', L.sicherungPruefen(paket) === null);
  var alt = { format: 'perlentaucher-sicherung', version: 1,
              daten: { kinder: inhalt.kinder, fortschritt: inhalt.fortschritt } };
  pruefe('alte Sicherung ohne zs_stand wird angenommen', L.sicherungPruefen(alt) === null);
  pruefe('fp_stand als Liste wird abgelehnt',
    /Fehlerhafter Eintrag/.test(L.sicherungPruefen({ format: 'perlentaucher-sicherung', daten: { fp_stand: [] } }) || ''));
  pruefe('fremder Bereich wird abgelehnt',
    /Unbekannter Bereich/.test(L.sicherungPruefen({ format: 'perlentaucher-sicherung', daten: { zs_fremd: {} } }) || ''));
  pruefe('zs_stand als Liste wird abgelehnt',
    /Fehlerhafter Eintrag/.test(L.sicherungPruefen({ format: 'perlentaucher-sicherung', daten: { zs_stand: [] } }) || ''));
  pruefe('zs_stand-Eintrag, der kein Datensatz ist, wird abgelehnt',
    /Fehlerhafter Eintrag/.test(L.sicherungPruefen({ format: 'perlentaucher-sicherung', daten: { zs_stand: { aaaa1111: 'x' } } }) || ''));
  pruefe('zs_stand-Kennung mit Schrägstrich wird abgelehnt',
    /Fehlerhafter Eintrag/.test(L.sicherungPruefen({ format: 'perlentaucher-sicherung', daten: { zs_stand: { 'a/b': {} } } }) || ''));

  // ---- Auskunft ----
  neu();
  L.auskunft('aaaa1111'); await warte();
  pruefe('Auskunft enthält den Abschnitt zahlenschwarm',
    datei && datei.daten.zahlenschwarm && datei.daten.zahlenschwarm.klasse === 3);
  pruefe('Auskunft enthält weiter Kind, Fortschritt, Bilder',
    datei && datei.daten.kind.vorname === 'Mila' && datei.daten.fortschritt.xp === 5 && datei.daten.bilder.length === 1);
  pruefe('Hinweis nennt beide Plattformen',
    datei && /Perlentaucher/.test(datei.daten.hinweis) && /Zahlenschwarm/.test(datei.daten.hinweis));
  pruefe('Auskunft enthält den Abschnitt flaschenpost',
    datei && datei.daten.flaschenpost && datei.daten.flaschenpost.stempel['wer-1'] === 5);
  pruefe('Hinweis nennt die Flaschenpost und dass Einträge nur auf dem Gerät liegen',
    datei && /Flaschenpost/.test(datei.daten.hinweis) && /nur auf den Geräten/.test(datei.daten.hinweis));
  pruefe('Meldung nennt beide Stände', /, Zahlenschwarm-Stand, Flaschenpost-Stand, Riff-Akten-Stand, Seesternwerkstatt-Stand, KI-Korallenriff-Stand, Chancenbucht-Stand, Leuchtturmuhr-Stand, Kieselwaage-Stand, Walgesang-Stand, Zeitenstrom-Stand, Satzwerft-Stand, Abyss of Numbers-Stand\.$/.test(meldungen[meldungen.length - 1]));
  pruefe('Auskunft enthält den Chancenbucht-Stand', datei && datei.daten.chancenbucht && datei.daten.chancenbucht.runden['muenze:leicht'] === 6);
  pruefe('Auskunft enthält den Leuchtturmuhr-Stand', datei && datei.daten.leuchtturmuhr && datei.daten.leuchtturmuhr.runden['uhr:leicht'] === 4);
  pruefe('Auskunft enthält den Kieselwaage-Stand', datei && datei.daten.kieselwaage && datei.daten.kieselwaage.runden['gramm:leicht'] === 5);
  pruefe('Auskunft enthält den Walgesang-Stand', datei && datei.daten.walgesang && datei.daten.walgesang.runden['vorne:leicht'] === 7);
  pruefe('Auskunft enthält den Zeitenstrom-Stand', datei && datei.daten.zeitenstrom && datei.daten.zeitenstrom.runden['erkennen:leicht'] === 8);
  pruefe('Auskunft enthält den Satzwerft-Stand', datei && datei.daten.satzwerft && datei.daten.satzwerft.runden['umstellen:leicht'] === 6);
  pruefe('Auskunft enthält den Abyss-Spielstand als Text', datei && datei.daten.abyss && datei.daten.abyss.spielstand === '{"stufe":4}');
  pruefe('Auskunft enthält den Korallenriff-Stand ohne Einträge, Hinweis nennt das Riff',
    datei && datei.daten.korallenriff && datei.daten.korallenriff.done.a1 === 2 && !('eintraege' in datei.daten.korallenriff) &&
    /KI-Korallenriff liegen nur auf den Geräten/.test(datei.daten.hinweis));
  pruefe('Auskunft hat nichts gelöscht', db.log.length === 0);

  neu(); delete inhalt.zs_stand.aaaa1111;
  L.auskunft('aaaa1111'); await warte();
  pruefe('ohne Stand: zahlenschwarm ist null',
    datei && datei.daten.zahlenschwarm === null && 'zahlenschwarm' in datei.daten);
  pruefe('ohne Stand: Meldung sagt kein Zahlenschwarm-Stand',
    /kein Zahlenschwarm-Stand, Flaschenpost-Stand, Riff-Akten-Stand, Seesternwerkstatt-Stand, KI-Korallenriff-Stand, Chancenbucht-Stand, Leuchtturmuhr-Stand, Kieselwaage-Stand, Walgesang-Stand, Zeitenstrom-Stand, Satzwerft-Stand, Abyss of Numbers-Stand\.$/.test(meldungen[meldungen.length - 1]));
  neu(); delete inhalt.fp_stand.aaaa1111;
  L.auskunft('aaaa1111'); await warte();
  pruefe('ohne Flaschenpost-Stand: flaschenpost ist null',
    datei && datei.daten.flaschenpost === null && 'flaschenpost' in datei.daten);

  // ---- Kind löschen ----
  neu();
  var n = await L.kindLoeschen('aaaa1111');
  pruefe('Löschen entfernt kinder, fortschritt, bilder, zs_stand und fp_stand des Kindes',
    n === 1 && !inhalt.kinder.aaaa1111 && !inhalt.fortschritt.aaaa1111 &&
    !inhalt.bilder.aaaa1111_1 && !inhalt.zs_stand.aaaa1111 && !inhalt.fp_stand.aaaa1111 && !inhalt.ra_stand.aaaa1111 && !inhalt.sw_stand.aaaa1111 && !!inhalt.sw_stand.bbbb2222 && !inhalt.kr_stand.aaaa1111 && !!inhalt.kr_stand.bbbb2222 && !inhalt.cb_stand.aaaa1111 && !!inhalt.cb_stand.bbbb2222 && !inhalt.lu_stand.aaaa1111 && !!inhalt.lu_stand.bbbb2222 && !inhalt.kw_stand.aaaa1111 && !!inhalt.kw_stand.bbbb2222 && !inhalt.wg_stand.aaaa1111 && !!inhalt.wg_stand.bbbb2222 && !inhalt.ze_stand.aaaa1111 && !!inhalt.ze_stand.bbbb2222 && !inhalt.sa_stand.aaaa1111 && !!inhalt.sa_stand.bbbb2222 && !inhalt.an_stand.aaaa1111 && !!inhalt.an_stand.bbbb2222 &&
    !!inhalt.ra_faelle.demo && !!inhalt.ra_loesungen.demo);
  pruefe('Löschen lässt das andere Kind unberührt',
    !!inhalt.kinder.bbbb2222 && !!inhalt.fortschritt.bbbb2222 && !!inhalt.bilder.bbbb2222_1 &&
    !!inhalt.zs_stand.bbbb2222 && !!inhalt.fp_stand.bbbb2222);
  pruefe('zs_stand und fp_stand gehen im letzten Paket mit fortschritt und kinder weg',
    db.log[db.log.length - 1] === 'paket fortschritt/aaaa1111 zs_stand/aaaa1111 fp_stand/aaaa1111 ra_stand/aaaa1111 sw_stand/aaaa1111 kr_stand/aaaa1111 cb_stand/aaaa1111 lu_stand/aaaa1111 kw_stand/aaaa1111 wg_stand/aaaa1111 ze_stand/aaaa1111 sa_stand/aaaa1111 an_stand/aaaa1111 kinder/aaaa1111');

  // ---- Zahlenschwarm zurücksetzen ----
  neu();
  var gab = await L.zsStandLoeschen('aaaa1111');
  pruefe('Zurücksetzen löscht zs_stand des Kindes', gab === true && !inhalt.zs_stand.aaaa1111);
  pruefe('Zurücksetzen löscht sonst nichts',
    db.log.length === 1 && db.log[0] === 'delete zs_stand/aaaa1111' &&
    !!inhalt.kinder.aaaa1111 && !!inhalt.fortschritt.aaaa1111 && !!inhalt.bilder.aaaa1111_1 && !!inhalt.zs_stand.bbbb2222);
  var nochmal = await L.zsStandLoeschen('aaaa1111');
  pruefe('Zurücksetzen ohne Stand meldet false und löscht nichts', nochmal === false && db.log.length === 1);

  // ---- Flaschenpost zurücksetzen ----
  neu();
  var fp = await L.standLoeschen('fp_stand', 'aaaa1111');
  pruefe('Flaschenpost zurücksetzen löscht nur fp_stand des Kindes',
    fp === true && db.log.length === 1 && db.log[0] === 'delete fp_stand/aaaa1111' &&
    !!inhalt.zs_stand.aaaa1111 && !!inhalt.fortschritt.aaaa1111 && !!inhalt.fp_stand.bbbb2222);
  neu();
  var ra = await L.standLoeschen('ra_stand', 'aaaa1111');
  pruefe('Riff-Akten zurücksetzen löscht nur ra_stand des Kindes, die Akten bleiben',
    ra === true && db.log.length === 1 && db.log[0] === 'delete ra_stand/aaaa1111' &&
    !!inhalt.ra_stand.bbbb2222 && !!inhalt.ra_faelle.demo && !!inhalt.fp_stand.aaaa1111);
  neu();
  var sw = await L.standLoeschen('sw_stand', 'aaaa1111');
  pruefe('Seesternwerkstatt zurücksetzen löscht nur sw_stand des Kindes',
    sw === true && db.log.length === 1 && db.log[0] === 'delete sw_stand/aaaa1111' && !!inhalt.sw_stand.bbbb2222 && !!inhalt.ra_stand.aaaa1111);
  pruefe('Sicherung holt sw_stand mit beiden Kindern', L.SAMMLUNGEN.indexOf('sw_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'sw_stand' && pf.name === 'Seesternwerkstatt' && pf.schluessel === 'seesternwerkstatt'; }));
  neu();
  var kr = await L.standLoeschen('kr_stand', 'aaaa1111');
  pruefe('KI-Korallenriff zurücksetzen löscht nur kr_stand des Kindes',
    kr === true && db.log.length === 1 && db.log[0] === 'delete kr_stand/aaaa1111' && !!inhalt.kr_stand.bbbb2222 && !!inhalt.sw_stand.aaaa1111);
  neu();
  var cbz = await L.standLoeschen('cb_stand', 'aaaa1111');
  pruefe('Chancenbucht zurücksetzen löscht nur cb_stand des Kindes',
    cbz === true && db.log.length === 1 && db.log[0] === 'delete cb_stand/aaaa1111' && !!inhalt.cb_stand.bbbb2222 && !!inhalt.kr_stand.aaaa1111);
  pruefe('Sicherung holt cb_stand, Plattform heißt Chancenbucht', L.SAMMLUNGEN.indexOf('cb_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'cb_stand' && pf.name === 'Chancenbucht' && pf.schluessel === 'chancenbucht'; }));
  neu();
  var luz = await L.standLoeschen('lu_stand', 'aaaa1111');
  pruefe('Leuchtturmuhr zurücksetzen löscht nur lu_stand des Kindes',
    luz === true && db.log.length === 1 && db.log[0] === 'delete lu_stand/aaaa1111' && !!inhalt.lu_stand.bbbb2222 && !!inhalt.cb_stand.aaaa1111);
  pruefe('Sicherung holt lu_stand, Plattform heißt Leuchtturmuhr', L.SAMMLUNGEN.indexOf('lu_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'lu_stand' && pf.name === 'Leuchtturmuhr' && pf.schluessel === 'leuchtturmuhr'; }));
  neu();
  var kwz = await L.standLoeschen('kw_stand', 'aaaa1111');
  pruefe('Kieselwaage zurücksetzen löscht nur kw_stand des Kindes',
    kwz === true && db.log.length === 1 && db.log[0] === 'delete kw_stand/aaaa1111' && !!inhalt.kw_stand.bbbb2222 && !!inhalt.lu_stand.aaaa1111);
  pruefe('Sicherung holt kw_stand, Plattform heißt Kieselwaage', L.SAMMLUNGEN.indexOf('kw_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'kw_stand' && pf.name === 'Kieselwaage' && pf.schluessel === 'kieselwaage'; }));
  neu();
  var wgz = await L.standLoeschen('wg_stand', 'aaaa1111');
  pruefe('Walgesang zurücksetzen löscht nur wg_stand des Kindes',
    wgz === true && db.log.length === 1 && db.log[0] === 'delete wg_stand/aaaa1111' && !!inhalt.wg_stand.bbbb2222 && !!inhalt.kw_stand.aaaa1111);
  pruefe('Sicherung holt wg_stand, Plattform heißt Walgesang', L.SAMMLUNGEN.indexOf('wg_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'wg_stand' && pf.name === 'Walgesang' && pf.schluessel === 'walgesang'; }));
  neu();
  var zez = await L.standLoeschen('ze_stand', 'aaaa1111');
  pruefe('Zeitenstrom zurücksetzen löscht nur ze_stand des Kindes',
    zez === true && db.log.length === 1 && db.log[0] === 'delete ze_stand/aaaa1111' && !!inhalt.ze_stand.bbbb2222 && !!inhalt.wg_stand.aaaa1111);
  pruefe('Sicherung holt ze_stand, Plattform heißt Zeitenstrom', L.SAMMLUNGEN.indexOf('ze_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'ze_stand' && pf.name === 'Zeitenstrom' && pf.schluessel === 'zeitenstrom'; }));
  neu();
  var saz = await L.standLoeschen('sa_stand', 'aaaa1111');
  pruefe('Satzwerft zurücksetzen löscht nur sa_stand des Kindes',
    saz === true && db.log.length === 1 && db.log[0] === 'delete sa_stand/aaaa1111' && !!inhalt.sa_stand.bbbb2222 && !!inhalt.ze_stand.aaaa1111);
  pruefe('Sicherung holt sa_stand, Plattform heißt Satzwerft', L.SAMMLUNGEN.indexOf('sa_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'sa_stand' && pf.name === 'Satzwerft' && pf.schluessel === 'satzwerft'; }));
  neu();
  var anz = await L.standLoeschen('an_stand', 'aaaa1111');
  pruefe('Abyss of Numbers zurücksetzen löscht nur an_stand des Kindes',
    anz === true && db.log.length === 1 && db.log[0] === 'delete an_stand/aaaa1111' && !!inhalt.an_stand.bbbb2222 && !!inhalt.sa_stand.aaaa1111);
  pruefe('Sicherung holt an_stand, Plattform heißt Abyss of Numbers', L.SAMMLUNGEN.indexOf('an_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'an_stand' && pf.name === 'Abyss of Numbers' && pf.schluessel === 'abyss'; }));
  pruefe('Sicherung holt kr_stand, Plattform heißt KI-Korallenriff', L.SAMMLUNGEN.indexOf('kr_stand') >= 0 &&
    L.PLATTFORMEN.some(function (pf) { return pf.sammlung === 'kr_stand' && pf.name === 'KI-Korallenriff' && pf.schluessel === 'korallenriff'; }));
  var akteWeg = await L.standLoeschen('ra_faelle', 'demo').then(function () { return 'gelöscht'; }, function () { return 'abgelehnt'; });
  pruefe('Zurücksetzen lehnt ra_faelle ab', akteWeg === 'abgelehnt' && !!inhalt.ra_faelle.demo);
  var fremd = await L.standLoeschen('fortschritt', 'aaaa1111').then(function () { return 'gelöscht'; }, function () { return 'abgelehnt'; });
  pruefe('Zurücksetzen lehnt Sammlungen ab, die keine Plattform sind', fremd === 'abgelehnt' && !!inhalt.fortschritt.aaaa1111);

  // ---- Kinderliste: vier Knöpfe je Zeile, Plattform-Knöpfe im Feld ----
  // Geprüft wird nur der erzeugte Text, nicht die Seite und nicht die Klicks.
  var S = new Function('staende', 'esc', 'zahl', 'fmtCode', 'aktivText', 'wochenBeitrag',
    plattformenZeile + '\n' + ['kinderZeile', 'resetFeldHtml'].map(funktion).join('\n') +
    '\nreturn { PLATTFORMEN: PLATTFORMEN, kinderZeile: kinderZeile, resetFeldHtml: resetFeldHtml };')(
    { aaaa1111: { xp: 5 } },
    function (s) { return String(s).replace(/[&<>"]/g, '?'); },
    function (x) { return typeof x === 'number' ? x : 0; },
    function (c) { return c.toUpperCase(); }, function () { return 'heute'; }, function () { return 0; });
  function knoepfe(html) { return (html.match(/<button[^>]*>[^<]*<\/button>/g) || []).map(function (b) { return b.replace(/<[^>]+>/g, ''); }); }
  var mitStand = S.kinderZeile({ id: 'aaaa1111', vorname: 'Mila' });
  var ohneStand = S.kinderZeile({ id: 'bbbb2222', vorname: 'Tom' });
  pruefe('Zeile hat genau vier Knöpfe: Auskunft, Zurücksetzen, Sperren, Löschen',
    knoepfe(mitStand).join('|') === 'Auskunft|Zurücksetzen|Sperren|Löschen');
  pruefe('Zeile ohne Perlentaucher-Stand hat dieselben vier Knöpfe',
    knoepfe(ohneStand).join('|') === 'Auskunft|Zurücksetzen|Sperren|Löschen' && /data-reset="bbbb2222"/.test(ohneStand));
  pruefe('in der Zeile steht kein Plattform-Knopf mehr', !/data-pfreset/.test(mitStand + ohneStand));
  var feldMit = S.resetFeldHtml({ id: 'aaaa1111', vorname: 'Mila' }, { xp: 5 });
  var erwartet = ['Nur die Perlen zurücksetzen', 'Alles zurücksetzen']
    .concat(S.PLATTFORMEN.map(function (pf) { return pf.name + ' zurücksetzen'; })).concat(['Abbrechen']);
  pruefe('Feld mit Stand: Perlentaucher-Knöpfe, je ein Knopf pro Plattform, Abbrechen',
    knoepfe(feldMit).join('|') === erwartet.join('|') && S.PLATTFORMEN.length === 12);
  pruefe('Feld: jeder Plattform-Knopf trägt Kind und Sammlung',
    S.PLATTFORMEN.every(function (pf) { return feldMit.indexOf('data-pfreset="aaaa1111" data-sammlung="' + pf.sammlung + '"') >= 0; }));
  pruefe('Feld hat die Überschriften Perlentaucher und Andere Plattformen',
    /<h2[^>]*>Mila zurücksetzen<\/h2>/.test(feldMit) && /<h3[^>]*>Perlentaucher<\/h3>/.test(feldMit) && /<h3[^>]*>Andere Plattformen<\/h3>/.test(feldMit));
  var feldOhne = S.resetFeldHtml({ id: 'bbbb2222', vorname: 'Tom' }, undefined);
  pruefe('Feld ohne Perlentaucher-Stand: Satz statt der zwei Knöpfe, Plattform-Knöpfe bleiben',
    !/data-tun/.test(feldOhne) && /nichts zurückzusetzen/.test(feldOhne) &&
    knoepfe(feldOhne).join('|') === erwartet.slice(2).join('|'));
  pruefe('Feld setzt den Vornamen nur über esc() ein',
    S.resetFeldHtml({ id: 'bbbb2222', vorname: '<b>x' }, undefined).indexOf('<b>x') < 0);

  // ---- Inhalte aus zs_stand landen nie als HTML in der Seite ----
  var treffer = quelle.split('\n').filter(function (z) {
    return /zs_stand|fp_stand|ra_stand|sw_stand|kr_stand|cb_stand|lu_stand|kw_stand|wg_stand|ze_stand|sa_stand|an_stand|zahlenschwarm|flaschenpost|riffakten|seesternwerkstatt|korallenriff|chancenbucht|leuchtturmuhr|kieselwaage|walgesang|zeitenstrom|satzwerft|abyss|PLATTFORMEN/.test(z) && /innerHTML/.test(z);
  });
  pruefe('keine Zeile setzt zs_stand oder fp_stand in innerHTML ein', treffer.length === 0);

  // ---- „Lange inaktive Kinder löschen“ zählt alle Plattformen ----
  // letzterTag gibt es in lehrer.js zweimal; es gilt die zweite Fassung
  // (Reiter Kinder), deshalb wird ab dort ausgeschnitten.
  var TAG = 86400000, jetzt = Date.now();
  function tagText(vorTagen) { return new Date(jetzt - vorTagen * TAG).toISOString().slice(0, 10); }
  function aufraeumer(dbA, kinderA, staendeA) {
    var ab = quelle.indexOf('Reiter 4: Kinder');
    var lt = quelle.indexOf('  function letzterTag(', ab);
    var ltText = quelle.slice(lt, quelle.indexOf('\n  }', lt) + 4);
    var koerper = plattformenZeile + '\n' + ltText + '\n' +
      ['tageHer', 'plattformAktiv', 'inaktiveKinder'].map(funktion).join('\n') +
      '\nreturn { plattformAktiv: plattformAktiv, inaktiveKinder: inaktiveKinder };';
    return new Function('db', 'kinder', 'staende', koerper)(dbA, kinderA, staendeA);
  }
  var kinderA = [{ id: 'aaaa1111', vorname: 'Mila' }, { id: 'bbbb2222', vorname: 'Tom' },
                 { id: 'cccc3333', vorname: 'Ada' }, { id: 'dddd4444', vorname: 'Ben' }, { id: 'eeee5555', vorname: 'Kai' }];
  // Mila: Perlentaucher vor 300 Tagen, Zahlenschwarm vor 3 Tagen  -> bleibt
  // Tom:  nie im Perlentaucher, Riff-Akten vor 10 Tagen           -> bleibt
  // Ada:  Perlentaucher vor 300 Tagen, Flaschenpost vor 250 Tagen -> inaktiv (250)
  // Ben:  nirgends ein Stand                                      -> inaktiv (nie)
  // Kai:  nie im Perlentaucher, Stand ohne Zeitstempel            -> bleibt (im Zweifel nicht löschen)
  var staendeA = { aaaa1111: { lastDay: tagText(300) }, bbbb2222: null, cccc3333: { lastDay: tagText(300) }, dddd4444: null, eeee5555: null };
  var inhaltA = {
    zs_stand: { aaaa1111: { geaendert: jetzt - 3 * TAG } },
    fp_stand: { cccc3333: { geaendert: jetzt - 250 * TAG, angelegt: jetzt - 280 * TAG } },
    ra_stand: { bbbb2222: { geaendert: 0, angelegt: jetzt - 10 * TAG } },
    sw_stand: { eeee5555: { geaendert: 'kaputt' } },
    kr_stand: {},
    cb_stand: {},
    lu_stand: {},
    kw_stand: {},
    wg_stand: {},
    ze_stand: {},
    sa_stand: {},
    an_stand: {}
  };
  var dbA = attrappe(inhaltA);
  var A = aufraeumer(dbA, kinderA, staendeA);
  var zuletztA = await A.plattformAktiv();
  var listeA = A.inaktiveKinder(200, zuletztA);
  var namenA = listeA.map(function (x) { return x.kind.vorname; }).sort().join(',');
  pruefe('Aufräumen: Kind mit frischem Zahlenschwarm-Stand bleibt, obwohl der Perlentaucher alt ist', namenA.indexOf('Mila') < 0);
  pruefe('Aufräumen: Kind nur in den Riff-Akten aktiv bleibt (Zeitstempel aus angelegt)', namenA.indexOf('Tom') < 0);
  pruefe('Aufräumen: Kind mit Stand ohne Zeitstempel bleibt', namenA.indexOf('Kai') < 0);
  pruefe('Aufräumen: überall alt und nie aktiv werden gefunden, sonst niemand', namenA === 'Ada,Ben');
  var adaA = listeA.filter(function (x) { return x.kind.vorname === 'Ada'; })[0];
  var benA = listeA.filter(function (x) { return x.kind.vorname === 'Ben'; })[0];
  pruefe('Aufräumen: es zählt die jüngste Aktivität (250 statt 300 Tage), nie aktiv ist null',
    adaA && adaA.tage >= 249 && adaA.tage <= 250 && benA && benA.tage === null);
  pruefe('Aufräumen: Grenze 0 trifft alle außer niemandem (alle fünf)', A.inaktiveKinder(0, zuletztA).length === 5);
  pruefe('Aufräumen: Prüfen löscht nichts', dbA.log.length === 0);
  // Gegenprobe: ohne die anderen Plattformen würden Mila, Tom und Kai mitgelöscht
  pruefe('Gegenprobe: ohne Plattform-Stände wären es alle fünf', A.inaktiveKinder(200, {}).length === 5);
  // Lässt sich eine Plattform nicht lesen, bricht das Prüfen ab (es wird nichts gelöscht)
  var dbKaputt = attrappe(inhaltA), echt = dbKaputt.collection;
  dbKaputt.collection = function (c) { return c === 'sw_stand' ? { get: function () { return Promise.reject(new Error('gesperrt')); } } : echt(c); };
  var kaputt = await aufraeumer(dbKaputt, kinderA, staendeA).plattformAktiv().then(function () { return 'durch'; }, function () { return 'abgebrochen'; });
  pruefe('Aufräumen: Lesefehler in einer Plattform bricht ab', kaputt === 'abgebrochen');
  pruefe('alteAufraeumen fragt erst die Plattformen ab und nutzt inaktiveKinder',
    /plattformAktiv\(\)\.then/.test(funktion('alteAufraeumen')) && /inaktiveKinder\(grenze, zuletzt\)/.test(funktion('alteAufraeumen')) &&
    !/tageHer\(letzterTag\(staende\[k\.id\]\)\)/.test(funktion('alteAufraeumen')));

  // ---- Navigation in zwei Ebenen (Bereiche, darunter Reiter) ----
  // Geprüft werden der erzeugte Text und der Zustand nach dem Wählen,
  // nicht die Klicks in der echten Seite.
  var bereicheZeile = (quelle.match(/^\s*var BEREICHE = \[.*\];$/m) || [])[0];
  pruefe('BEREICHE steht in lehrer.js (eine Zeile)', !!bereicheZeile);
  var startReiter = (quelle.match(/^\s*var reiter = '(\w+)'/m) || [])[1];
  function navBauer() {
    return new Function('woerter', 'fragen', 'kinder',
      bereicheZeile + '\nvar reiter = ' + JSON.stringify(startReiter) + ', zuletztReiter = {};\n' +
      ['esc', 'knopf', 'bereichVon', 'reiterName', 'bereichWaehlen', 'reiterWaehlen', 'navHtml'].map(funktion).join('\n') +
      '\nreturn { BEREICHE: BEREICHE, navHtml: navHtml, bereichWaehlen: bereichWaehlen, reiterWaehlen: reiterWaehlen,' +
      ' bereichVon: bereichVon, reiter: function () { return reiter; } };')(
      [1, 2, 3], [1, 2], [1, 2, 3, 4]);
  }
  var N = navBauer();
  function navKnoepfe(html, attr) {
    var re = new RegExp('<button data-' + attr + '="([^"]+)"([^>]*)>([^<]*)<\\/button>', 'g'), m, aus = [];
    while ((m = re.exec(html))) aus.push({ id: m[1], an: /class="an"/.test(m[2]), text: m[3] });
    return aus;
  }
  var ALTE = ['fortschritt', 'auswertung', 'woerter', 'themen', 'einstellungen', 'kinder', 'bilder', 'sicherung'];
  var alleReiter = [].concat.apply([], N.BEREICHE.map(function (b) { return b.reiter; }));
  pruefe('Bereiche: Perlentaucher, Abyss of Numbers und Verwaltung, in dieser Reihenfolge',
    N.BEREICHE.map(function (b) { return b.name; }).join('|') === 'Perlentaucher|Abyss of Numbers|Verwaltung');
  pruefe('Perlentaucher hat Fortschritt, Auswertung, Lernwörter, Sachthemen, Einstellungen, Bilder',
    N.BEREICHE[0].reiter.join('|') === 'fortschritt|auswertung|woerter|themen|einstellungen|bilder');
  pruefe('Abyss of Numbers hat Klasse und Schwierige Aufgaben', N.BEREICHE[1].reiter.join('|') === 'an_klasse|an_schwer');
  pruefe('Verwaltung hat Kinder und Sicherung', N.BEREICHE[2].reiter.join('|') === 'kinder|sicherung');
  pruefe('jeder der acht alten und zwei neuen Reiter steht in genau einem Bereich, kein Reiter doppelt',
    ALTE.concat(['an_klasse', 'an_schwer']).every(function (r) { return alleReiter.filter(function (x) { return x === r; }).length === 1; }) &&
    alleReiter.length === ALTE.length + 2);
  var zeichnenText = funktion('zeichnen');
  pruefe('zeichnen() kennt jeden Reiter (Inhalt und binde…)', alleReiter.every(function (r) {
    return (r === 'fortschritt' || zeichnenText.indexOf("reiter === '" + r + "' ? tab") >= 0) &&
      zeichnenText.indexOf("if (reiter === '" + r + "') binde") >= 0;
  }));
  var start = N.navHtml();
  var startB = navKnoepfe(start, 'bereich'), startR = navKnoepfe(start, 'reiter');
  pruefe('Start: Perlentaucher ist gewählt, Fortschritt ist offen',
    N.reiter() === 'fortschritt' && startB.length === 3 && startB[0].an && !startB[1].an && !startB[2].an &&
    startR.filter(function (k) { return k.an; }).map(function (k) { return k.id; }).join() === 'fortschritt');
  pruefe('Start: unter Perlentaucher stehen nur dessen sechs Reiter',
    startR.map(function (k) { return k.id; }).join('|') === N.BEREICHE[0].reiter.join('|'));
  pruefe('Zähler in den Beschriftungen (Lernwörter 3, Sachthemen 2)',
    startR.map(function (k) { return k.text; }).join('|') === 'Fortschritt|Auswertung|Lernwörter (3)|Sachthemen (2)|Einstellungen|Bilder');
  pruefe('Knöpfe melden ihren Zustand (aria-pressed)', /data-bereich="perlentaucher" class="an" aria-pressed="true"/.test(start) &&
    /data-bereich="verwaltung" aria-pressed="false"/.test(start));
  N.bereichWaehlen('verwaltung');
  var verw = N.navHtml(), verwR = navKnoepfe(verw, 'reiter');
  pruefe('Verwaltung wählen: Kinder ist offen, darunter Kinder (4) und Sicherung',
    N.reiter() === 'kinder' && navKnoepfe(verw, 'bereich')[2].an &&
    verwR.map(function (k) { return k.text; }).join('|') === 'Kinder (4)|Sicherung' && verwR[0].an);
  N.bereichWaehlen('abyss');
  var aby = N.navHtml(), abyR = navKnoepfe(aby, 'reiter');
  pruefe('Abyss of Numbers wählen: Klasse ist offen, darunter Klasse und Schwierige Aufgaben',
    N.reiter() === 'an_klasse' && navKnoepfe(aby, 'bereich')[1].an &&
    abyR.map(function (k) { return k.text; }).join('|') === 'Klasse|Schwierige Aufgaben' && abyR[0].an);
  N.bereichWaehlen('verwaltung');
  N.reiterWaehlen('sicherung');
  pruefe('Reiter Sicherung wählen', N.reiter() === 'sicherung' && navKnoepfe(N.navHtml(), 'reiter')[1].an);
  N.bereichWaehlen('perlentaucher');
  pruefe('zurück zu Perlentaucher: Fortschritt (dort zuletzt offen)', N.reiter() === 'fortschritt');
  N.reiterWaehlen('bilder');
  N.bereichWaehlen('verwaltung');
  pruefe('wieder Verwaltung: Sicherung (dort zuletzt offen)', N.reiter() === 'sicherung');
  N.bereichWaehlen('perlentaucher');
  pruefe('wieder Perlentaucher: Bilder (dort zuletzt offen)', N.reiter() === 'bilder');
  N.bereichWaehlen('gibtsnicht'); N.reiterWaehlen('gibtsnicht');
  pruefe('unbekannter Bereich oder Reiter ändert nichts', N.reiter() === 'bilder');
  // jeder alte Reiter ist erreichbar: Bereich wählen, Reiter wählen, er ist offen und markiert
  var N2 = navBauer();
  pruefe('jeder der acht alten Reiter ist über Bereich und Reiter erreichbar', ALTE.every(function (r) {
    var b = N2.bereichVon(r); if (!b) return false;
    N2.bereichWaehlen(b.id); N2.reiterWaehlen(r);
    var html = N2.navHtml();
    return N2.reiter() === r && navKnoepfe(html, 'reiter').some(function (k) { return k.id === r && k.an; }) &&
      navKnoepfe(html, 'bereich').some(function (k) { return k.id === b.id && k.an; });
  }));
  // Gegenprobe: ohne den Bereich Verwaltung wären Kinder und Sicherung nicht erreichbar
  var N3 = new Function('woerter', 'fragen', 'kinder',
    bereicheZeile.replace(/, \{ id: 'verwaltung'[^\]]*\] \}/, '') + '\nvar reiter = "fortschritt", zuletztReiter = {};\n' +
    ['esc', 'knopf', 'bereichVon', 'reiterName', 'bereichWaehlen', 'reiterWaehlen', 'navHtml'].map(funktion).join('\n') +
    '\nreturn { bereichVon: bereichVon, BEREICHE: BEREICHE };')([], [], []);
  pruefe('Gegenprobe: ohne Verwaltung fehlen Kinder und Sicherung', N3.BEREICHE.length === 2 && !N3.bereichVon('kinder') && !N3.bereichVon('sicherung'));

  // ---- Bereich Abyss of Numbers: Laden, Zeichnen, Sortieren, Download ----
  // Mit dem echten Berichtsmodul aus dem Nachbarordner „Abyss of Numbers“
  // (falls vorhanden) und ausgedachten Daten. Nicht geprüft: das Nachladen
  // im Browser von der Abyss-Seite und das echte Firebase.
  var abyssZeilen = quelle.match(/^\s*var (ABYSS_\w+|abyss) = .*;.*$/mg) || [];
  pruefe('Abyss: Einstellungen und Zustand stehen in lehrer.js', abyssZeilen.length === 4);
  var ABYSS_FUNKTIONEN = ['esc', 'zahl', 'abyssEintraege', 'abyssSortWert', 'abyssZeilen', 'abyssSortieren', 'berichtTabelle',
    'abyssStatus', 'abyssKopf', 'tabAnKlasse', 'abyssSummenDatei', 'tabAnSchwer'];
  function abyssBauer(kinderA, escErsatz) {
    return new Function('kinder', 'heuteFuerDateiname', 'escErsatz',
      abyssZeilen.join('\n') + '\n' + ABYSS_FUNKTIONEN.map(funktion).join('\n') +
      '\nif (escErsatz) esc = escErsatz;' +
      '\nreturn { abyss: abyss, eintraege: abyssEintraege, zeilen: abyssZeilen, sortieren: abyssSortieren, tabelle: berichtTabelle,' +
      ' klasse: tabAnKlasse, schwer: tabAnSchwer, summen: abyssSummenDatei, MIN: ABYSS_MIN_KINDER };')(
      kinderA, function () { return '2026-11-20'; }, escErsatz || null);
  }
  function schnapp(docs) {
    return { forEach: function (f) { Object.keys(docs).forEach(function (id) { f({ id: id, data: function () { return docs[id]; } }); }); } };
  }
  var A3 = abyssBauer([{ id: 'cccc3333', vorname: 'Tom' }, { id: 'aaaa1111', vorname: 'Mila' }, { id: 'dddd4444', vorname: 'Ada' }, { id: 'bbbb2222', vorname: 'Ben' }]);
  var ein = A3.eintraege(schnapp({ aaaa1111: { spielstand: '{"x":1}' }, cccc3333: { spielstand: '' }, bbbb2222: { spielstand: 42 }, ffff9999: { spielstand: '{}' } }));
  pruefe('Abyss: Einträge nur für Kinder mit Stand, nach Vornamen sortiert, Codes ohne Kind fallen weg',
    ein.map(function (e) { return e.name; }).join('|') === 'Ben|Mila|Tom' && JSON.stringify(ein).indexOf('aaaa1111') < 0);
  pruefe('Abyss: Text bleibt Text, leerer Stand bleibt leer, kein Text wird null',
    ein[1].text === '{"x":1}' && ein[2].text === '' && ein[0].text === null);

  var boese = '<img src=x onerror=alert(1)>';
  var tabBoese = { title: boese, note: boese, columns: [{ key: 'name', label: boese }, { key: 'x', label: '<script>' }],
    rows: [{ cells: { name: boese, x: '"><script>' }, child: 0 }] };
  var htmlBoese = A3.tabelle(tabBoese, { sortierbar: ['name'], kind: true });
  function sicher(html) { return html.indexOf('<img') < 0 && html.indexOf('<script') < 0 && html.indexOf('&lt;img') >= 0; }
  pruefe('Abyss: Titel, Spalten, Zellen und Hinweis gehen durch esc()', sicher(htmlBoese));
  pruefe('Gegenprobe: ohne esc() käme HTML aus dem Spielstand in die Seite',
    !sicher(abyssBauer([], function (s) { return String(s); }).tabelle(tabBoese, { sortierbar: ['name'], kind: true })));
  pruefe('Abyss: Name als Knopf zur Ansicht „Kind“ nur mit kind:true und ganzzahligem child',
    /data-ankind="0"/.test(htmlBoese) && !/data-ankind/.test(A3.tabelle(tabBoese)) &&
    !/data-ankind/.test(A3.tabelle({ title: 't', columns: [{ key: 'name', label: 'n' }], rows: [{ cells: { name: 'a' }, child: '0" onclick="x' }] }, { kind: true })));
  pruefe('Abyss: leere Tabelle zeigt einen Satz statt nichts', /Noch keine Einträge/.test(A3.tabelle({ title: 't', columns: [{ key: 'a', label: 'A' }], rows: [] })));

  var sortRows = [
    { cells: { name: 'Mila', zuletzt: '01.11.2026', hilfe: '' } },
    { cells: { name: 'Ada', zuletzt: 'noch nicht gespielt', hilfe: '' } },
    { cells: { name: 'Ben', zuletzt: '15.11.2026', hilfe: 'Mal' } },
    { cells: { name: 'Tom', zuletzt: '03.10.2027', hilfe: 'Geteilt, Plus' } }];
  function namen(rows) { return rows.map(function (r) { return r.cells.name; }).join(','); }
  A3.sortieren('zuletzt');
  pruefe('Abyss: „zuletzt gespielt“ zuerst neueste oben (Jahr zählt), ohne Datum unten', namen(A3.zeilen(sortRows, A3.abyss.sort)) === 'Tom,Ben,Mila,Ada');
  A3.sortieren('zuletzt');
  pruefe('Abyss: zweiter Klick dreht um, ohne Datum bleibt unten', namen(A3.zeilen(sortRows, A3.abyss.sort)) === 'Mila,Ben,Tom,Ada');
  A3.sortieren('hilfe');
  pruefe('Abyss: „Braucht Hilfe“ zuerst Kinder mit Eintrag, leere unten', namen(A3.zeilen(sortRows, A3.abyss.sort)) === 'Tom,Ben,Mila,Ada');
  A3.sortieren('name');
  pruefe('Abyss: Vorname aufsteigend', namen(A3.zeilen(sortRows, A3.abyss.sort)) === 'Ada,Ben,Mila,Tom');
  A3.sortieren('sterne');
  pruefe('Abyss: nur Vorname, zuletzt und Hilfe sind sortierbar', A3.abyss.sort.key === 'name');
  pruefe('Abyss: Sortieren ändert die Zeilen des Berichts nicht', namen(sortRows) === 'Mila,Ada,Ben,Tom');

  var sum = A3.summen({ kinder: 25, jeKlasse: { 3: { kinder: 22, antwort: { add: [5, 1, 0] }, lauf: {} }, 4: { kinder: 2, antwort: {}, lauf: {} } } });
  pruefe('Abyss: Download nur mit Klassenstufen ab ' + A3.MIN + ' Kindern, kleinere werden genannt',
    Object.keys(sum.daten.jeKlasse).join() === '3' && sum.weggelassen.join() === '4' && sum.daten.kinder === 22 && !sum.leer);
  pruefe('Abyss: Download ohne Namen und Codes', !/name|vorname|code|Kind /i.test(JSON.stringify(sum.daten).replace('mindestKinderJeKlasse', '')));
  pruefe('Abyss: unter ' + A3.MIN + ' Kindern je Stufe gibt es nichts herunterzuladen',
    A3.summen({ jeKlasse: { 3: { kinder: 2 } } }).leer && A3.summen(null).leer);

  A3.abyss.zustand = 'fehler'; A3.abyss.fehler = boese;
  var fehlerHtml = A3.klasse();
  pruefe('Abyss: Ladefehler wird gemeldet (mit esc) und lässt sich neu laden', /id="anneu"/.test(fehlerHtml) && sicher(fehlerHtml));
  A3.abyss.zustand = 'laedt';
  pruefe('Abyss: während des Ladens ein Satz, keine Tabelle', /werden geladen/.test(A3.schwer()) && !/<table/.test(A3.schwer()));
  var ladeText = funktion('abyssLaden');
  pruefe('Abyss: lädt Modul, Konfiguration und an_stand von der eigenen Adresse',
    /var ABYSS_BASIS = '\.\.\/abyss-of-numbers\/';/.test(quelle) && /src\/teacher\/report\.js/.test(ladeText) &&
    /src\/platform\/config-loader\.js/.test(ladeText) && /config\/teacher\/stages\.de\.json/.test(ladeText) &&
    /collection\('an_stand'\)\.get\(\)/.test(ladeText) && !/https?:/.test(ladeText));

  // Echtes Berichtsmodul aus dem Abyss-Projekt (veröffentlicht unter abyss-of-numbers/, lokal unter game/)
  var abyssSpiel = path.join(__dirname, '..', '..', '..', '..', 'Abyss of Numbers', 'game');
  if (!fs.existsSync(path.join(abyssSpiel, 'src', 'teacher', 'report.js'))) {
    console.log('hinweis Abyss-Ordner nicht gefunden, Prüfung mit dem echten Berichtsmodul übersprungen: ' + abyssSpiel);
  } else {
    var url = require('url');
    var modul = await import(url.pathToFileURL(path.join(abyssSpiel, 'src', 'teacher', 'report.js')).href);
    var lader = await import(url.pathToFileURL(path.join(abyssSpiel, 'src', 'platform', 'config-loader.js')).href);
    var konfig = await lader.loadConfig(function (p) { return Promise.resolve(JSON.parse(fs.readFileSync(path.join(abyssSpiel, 'config', p), 'utf8'))); });
    var stufen = JSON.parse(fs.readFileSync(path.join(abyssSpiel, 'config', 'teacher', 'stages.de.json'), 'utf8'));
    var daten = JSON.parse(fs.readFileSync(path.join(abyssSpiel, 'tools', 'report-preview-data.json'), 'utf8'));
    daten[0].name = boese;
    var bericht = modul.buildReport(daten, konfig, stufen, { tzOffsetMinutes: -480 });
    var A4 = abyssBauer([]);
    A4.abyss.zustand = 'fertig'; A4.abyss.bericht = bericht;
    var klasseHtml = A4.klasse();
    var mitKind = bericht.klasse.rows.filter(function (r) { return Number.isInteger(r.child); }).length;
    pruefe('Abyss (echtes Modul): Klasse zeigt eine Zeile je Kind (' + daten.length + ')',
      (klasseHtml.match(/<tr>/g) || []).length === daten.length + 1);
    pruefe('Abyss (echtes Modul): lesbare Stände haben einen Namensknopf, die anderen nicht (' + mitKind + ')',
      mitKind > 0 && mitKind < daten.length && (klasseHtml.match(/data-ankind=/g) || []).length === mitKind);
    pruefe('Abyss (echtes Modul): Vorname aus der Kinderliste geht durch esc()', sicher(klasseHtml));
    pruefe('Abyss (echtes Modul): Vorname, zuletzt und Hilfe haben Sortierknöpfe',
      ['name', 'zuletzt', 'hilfe'].every(function (k) { return klasseHtml.indexOf('data-ansort="' + k + '"') >= 0; }) &&
      (klasseHtml.match(/data-ansort=/g) || []).length === 3);
    A4.abyss.kind = 0;
    var kindHtml = A4.klasse();
    pruefe('Abyss (echtes Modul): Ansicht „Kind“ mit Zurück-Knopf, Name und allen Tabellen des Kindes',
      /id="anzurueck"/.test(kindHtml) && sicher(kindHtml) &&
      (kindHtml.match(/<table/g) || []).length === bericht.kinder[0].tables.length && !/data-ansort/.test(kindHtml));
    A4.abyss.kind = null;
    var schwerHtml = A4.schwer();
    pruefe('Abyss (echtes Modul): Schwierige Aufgaben zeigt alle Klassentabellen und den Download-Knopf',
      (schwerHtml.match(/<table/g) || []).length === bericht.schwer.length && /id="ansummen"(?! disabled)/.test(schwerHtml));
    var datei = A4.summen(bericht.summen);
    pruefe('Abyss (echtes Modul): Download ohne Vornamen', JSON.stringify(datei.daten).indexOf('Kind ') < 0 && !datei.leer);
  }

  console.log('\n' + (schlecht ? 'FEHLER' : 'OK') + ': ' + gut + ' von ' + (gut + schlecht) + ' Prüfungen bestanden.');
  process.exit(schlecht ? 1 : 0);
})().catch(function (e) { console.error('FEHLER im Testlauf:', e); process.exit(1); });
