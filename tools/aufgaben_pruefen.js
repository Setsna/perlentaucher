// Prueft die generierten Uebungsaufgaben gegen den Bestand.
//
//     node tools/aufgaben_pruefen.js [Runden]
//
// Zwei Durchgaenge:
//   1. nur js/words.js        - die Klasse-3-Rueckfallliste
//   2. zusaetzlich tools/bestand/*.csv - Klasse 2 dazu, damit auch die
//      listenuebergreifenden Ablenker geprueft werden
//
// Geprueft wird:
//   Bild-Aufgaben       vier Antworten; kein Ablenker mit gemeinsamem
//                       Emoji-Zeichen, keiner aus derselben Gruppe
//   Bedeutungs-Aufgaben drei Antworten, keine leere, keine doppelte
//   Artikel-Aufgaben    drei Antworten, kein Wort mit zahl = mehrzahl
//   alle Woerter        Silben und Trennung ergeben genau das Wort,
//                       das Wort steht im Beispielsatz
//
// Die Antwortzahlen sind unterschiedlich - vier bei Bild, drei bei
// Bedeutung und Artikel. Wer ueberall vier erwartet, bekommt
// hunderte Scheinfehler.

const fs = require('fs');
const path = require('path');
const P = path.join(__dirname, '..');
const RUNDEN = parseInt(process.argv[2] || '300', 10);

function ladeBestandCsv() {
  const dir = path.join(P, 'tools', 'bestand');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.csv')).sort()) {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^﻿/, '');
    const zeilen = txt.split(/\r?\n/).filter(z => z.trim());
    const kopf = zeilen.shift().split(';');
    for (const z of zeilen) {
      const feld = z.split(';');
      const r = {};
      kopf.forEach((k, i) => r[k] = (feld[i] || '').trim());
      if (!r.wort) continue;
      const silben = (r.silben || r.wort).split('-');
      out.push({
        id: r.wort.toLowerCase(), wort: r.wort, artikel: r.artikel || null,
        zahl: r.zahl || null, silben: silben,
        trennung: (r.trennung || r.silben || r.wort).split('-'),
        wortart: r.wortart, gruppe: r.gruppe, bild: r.bild,
        bedeutung: r.bedeutung, satz: r.satz, liste: r.liste
      });
    }
  }
  return out;
}

function eset(s) {
  const o = new Set();
  for (const c of String(s || '')) if (c !== '️' && c !== '‍') o.add(c);
  return o;
}

function lauf(mitKlasse2) {
  // Frische Umgebung, damit exercises.js den erweiterten Bestand sieht.
  global.window = global;
  global.document = {
    addEventListener() {}, getElementById() { return null; },
    querySelector() { return null; }
  };
  global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  delete global.WA;

  eval(fs.readFileSync(path.join(P, 'js/config.js'), 'utf8'));
  eval(fs.readFileSync(path.join(P, 'js/words.js'), 'utf8'));
  const app = global.WA;

  if (mitKlasse2) {
    // Dubletten ausschliessen: in der echten Datenbank ist die
    // Dokumentkennung das Wort, zwei gleiche Eintraege sind unmoeglich.
    for (const r of ladeBestandCsv()) {
      if (app.words.some(x => x.id === r.id)) continue;
      app.words.push(r);
    }
  }
  eval(fs.readFileSync(path.join(P, 'js/exercises.js'), 'utf8'));

  const W = app.words, T = app.ex.TYPES, typen = Object.keys(T);
  const byId = {}; W.forEach(w => byId[w.id] = w);
  const fehler = [];
  let n = 0;

  for (let runde = 0; runde < RUNDEN; runde++) {
    for (const w of W) {
      for (const t of typen) {
        if (!T[t].applies(w)) continue;
        const q = app.ex.makeQuestion(t, w);
        n++;
        if (t === 'bild') {
          if (q.options.length !== 4)
            fehler.push(`bild ${w.wort}: ${q.options.length} Antworten`);
          const mine = eset(w.bild);
          for (const o of q.options) {
            if (o.value === w.id) continue;
            const x = byId[o.value];
            if (!x) { fehler.push(`bild ${w.wort}: unbekannte Antwort ${o.value}`); continue; }
            if (w.gruppe && x.gruppe && w.gruppe === x.gruppe)
              fehler.push(`bild ${w.wort}: Ablenker ${x.wort} gleiche Gruppe (${x.gruppe})`);
            for (const c of eset(x.bild)) if (mine.has(c))
              fehler.push(`bild ${w.wort} (${w.bild}): Ablenker ${x.wort} (${x.bild}) teilt "${c}"`);
          }
        } else if (t === 'bedeutung') {
          if (q.options.length !== 3)
            fehler.push(`bedeutung ${w.wort}: ${q.options.length} Antworten`);
          if (q.options.some(o => !o.label || !String(o.label).trim()))
            fehler.push(`bedeutung ${w.wort}: leere Antwort`);
          if (new Set(q.options.map(o => o.label)).size !== q.options.length)
            fehler.push(`bedeutung ${w.wort}: doppelte Bedeutung in den Antworten`);
        } else if (t === 'artikel') {
          if (q.options.length !== 3)
            fehler.push(`artikel ${w.wort}: ${q.options.length} Antworten`);
          if (w.zahl === 'mehrzahl')
            fehler.push(`artikel: Mehrzahlwort ${w.wort} gefragt`);
        }
      }
    }
    if (fehler.length > 200) break;
  }

  for (const w of W) {
    if (w.silben.join('') !== w.wort) fehler.push(`Silben: ${w.silben.join('-')} != ${w.wort}`);
    if (w.trennung.join('') !== w.wort) fehler.push(`Trennung: ${w.trennung.join('-')} != ${w.wort}`);
    if (w.satz && w.satz.indexOf(w.wort) < 0) fehler.push(`Satz ohne Wort: ${w.wort}`);
  }

  return { woerter: W.length, aufgaben: n, fehler: [...new Set(fehler)] };
}

let schlecht = 0;
for (const [name, mitK2] of [['nur js/words.js', false], ['mit Klasse 2', true]]) {
  const r = lauf(mitK2);
  console.log(`\n== ${name}: ${r.woerter} Woerter, ${r.aufgaben} Aufgaben geprueft`);
  if (r.fehler.length) {
    schlecht = 1;
    console.log(`   FEHLER (${r.fehler.length} verschiedene):`);
    r.fehler.slice(0, 40).forEach(f => console.log('    -', f));
  } else {
    console.log('   Keine Probleme gefunden.');
  }
}
process.exit(schlecht);
