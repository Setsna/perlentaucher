/* ==========================================================
   Kleiner Test für den Lehrerbereich (js/lehrer.js), ohne Browser
   und ohne Anmeldung:

     node tools/test/lehrer-test.js

   lehrer.js ist ein geschlossener Block ohne Ausgänge. Der Test
   schneidet deshalb einzelne Funktionen als Text heraus und lässt
   sie gegen eine nachgebaute Datenbank laufen. Die echte Datenbank
   wird nie berührt.

   Geprüft wird nur, was mit den Ständen der anderen Plattformen
   (zs_stand Zahlenschwarm, fp_stand Flaschenpost) zu tun hat:
   Sicherung, Auskunft, Kind löschen, Zurücksetzen.
   NICHT geprüft: die Seite selbst, Knöpfe, Nachfragen, Anmeldung,
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
                bbbb2222: { stationen: {}, stempel: {}, zeit: {}, kannIch: {}, angelegt: 2, geaendert: 2 } }
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
  pruefe('jede Plattform steht auch in SAMMLUNGEN (Sicherung)',
    L.PLATTFORMEN.every(function (pf) { return L.SAMMLUNGEN.indexOf(pf.sammlung) >= 0; }));
  var alles = await L.alleHolen(true);
  pruefe('Sicherung holt zs_stand mit beiden Kindern',
    alles.zs_stand && Object.keys(alles.zs_stand).length === 2 && alles.zs_stand.aaaa1111.klasse === 3);
  var ohneBilder = await L.alleHolen(false);
  pruefe('Sicherung ohne Bilder enthält zs_stand trotzdem', !!ohneBilder.zs_stand && ohneBilder.bilder === undefined);
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
  pruefe('Meldung nennt beide Stände', /, Zahlenschwarm-Stand, Flaschenpost-Stand\.$/.test(meldungen[meldungen.length - 1]));
  pruefe('Auskunft hat nichts gelöscht', db.log.length === 0);

  neu(); delete inhalt.zs_stand.aaaa1111;
  L.auskunft('aaaa1111'); await warte();
  pruefe('ohne Stand: zahlenschwarm ist null',
    datei && datei.daten.zahlenschwarm === null && 'zahlenschwarm' in datei.daten);
  pruefe('ohne Stand: Meldung sagt kein Zahlenschwarm-Stand',
    /kein Zahlenschwarm-Stand, Flaschenpost-Stand\.$/.test(meldungen[meldungen.length - 1]));
  neu(); delete inhalt.fp_stand.aaaa1111;
  L.auskunft('aaaa1111'); await warte();
  pruefe('ohne Flaschenpost-Stand: flaschenpost ist null',
    datei && datei.daten.flaschenpost === null && 'flaschenpost' in datei.daten);

  // ---- Kind löschen ----
  neu();
  var n = await L.kindLoeschen('aaaa1111');
  pruefe('Löschen entfernt kinder, fortschritt, bilder, zs_stand und fp_stand des Kindes',
    n === 1 && !inhalt.kinder.aaaa1111 && !inhalt.fortschritt.aaaa1111 &&
    !inhalt.bilder.aaaa1111_1 && !inhalt.zs_stand.aaaa1111 && !inhalt.fp_stand.aaaa1111);
  pruefe('Löschen lässt das andere Kind unberührt',
    !!inhalt.kinder.bbbb2222 && !!inhalt.fortschritt.bbbb2222 && !!inhalt.bilder.bbbb2222_1 &&
    !!inhalt.zs_stand.bbbb2222 && !!inhalt.fp_stand.bbbb2222);
  pruefe('zs_stand und fp_stand gehen im letzten Paket mit fortschritt und kinder weg',
    db.log[db.log.length - 1] === 'paket fortschritt/aaaa1111 zs_stand/aaaa1111 fp_stand/aaaa1111 kinder/aaaa1111');

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
  var fremd = await L.standLoeschen('fortschritt', 'aaaa1111').then(function () { return 'gelöscht'; }, function () { return 'abgelehnt'; });
  pruefe('Zurücksetzen lehnt Sammlungen ab, die keine Plattform sind', fremd === 'abgelehnt' && !!inhalt.fortschritt.aaaa1111);

  // ---- Inhalte aus zs_stand landen nie als HTML in der Seite ----
  var treffer = quelle.split('\n').filter(function (z) {
    return /zs_stand|fp_stand|zahlenschwarm|flaschenpost|PLATTFORMEN/.test(z) && /innerHTML/.test(z);
  });
  pruefe('keine Zeile setzt zs_stand oder fp_stand in innerHTML ein', treffer.length === 0);

  console.log('\n' + (schlecht ? 'FEHLER' : 'OK') + ': ' + gut + ' von ' + (gut + schlecht) + ' Prüfungen bestanden.');
  process.exit(schlecht ? 1 : 0);
})().catch(function (e) { console.error('FEHLER im Testlauf:', e); process.exit(1); });
