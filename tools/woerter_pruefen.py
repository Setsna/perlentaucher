#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prueft die Lernwoerter einer Woche und erzeugt CSV + Zeilen fuer js/words.js.

    python3 tools/woerter_pruefen.py woche.json

Die Wochendatei ist JSON (Beispiel: tools/woche-beispiel.json):

    {
      "liste":     "Merkwoerter Klasse 3",
      "kommentar": "Lernwoerter der Woche vom 29.10.2026",
      "csv":       "/mnt/user-data/outputs/perlentaucher-woche-29-10.csv",
      "woerter": [
        { "wort": "Seele", "artikel": "die", "silben": "See-le",
          "wortart": "Nomen", "gruppe": "gefuehl",
          "bedeutung": "das Innere von einem Menschen, das man nicht sehen kann",
          "satz": "Niemand kann die Seele sehen.",
          "duden": "See-le|die" }
      ]
    }

Feldwerte je Wort:
  wort        Pflicht. Kein Bindestrich im Wort (der Bindestrich ist das
              Silbentrennzeichen, T-Shirt ist nicht darstellbar).
  artikel     der/die/das bei Nomen, sonst leer.
  silben      Sprechsilben, mit Bindestrich getrennt.
  trennung    Worttrennung nach Duden, falls sie von den Sprechsilben
              abweicht (Vi-de-o / Vi-deo). Sonst weglassen.
  wortart     Nomen | Verb | Adjektiv | Zahlwort | anderes
  gruppe      aus der festen Liste GRUPPEN unten.
  bild        Emoji oder weglassen. Lieber kein Bild als ein mehrdeutiges.
  bedeutung   ein Satzteil, klein beginnend, ohne Punkt am Ende.
              NIE von duden.de uebernehmen (urheberrechtlich geschuetzt).
  satz        Beispielsatz, das Wort muss wortgleich und als eigenes Wort
              darin vorkommen.
  zahl        "mehrzahl" bei Woertern ohne Einzahl (dann artikel = die).
  duden       Beleg in der Form "Tren-nung|genus", genus leer bei
              Nicht-Nomen: "gru-se-lig|". Pflicht, ausser ohne_beleg.
  ohne_beleg  Begruendung, wenn es keinen direkten Duden-Eintrag gibt.
              Wird bei jedem Lauf ausgegeben, nicht verschwiegen.
  funktionswort  true bei Funktionswoertern und Eigennamen (im, viel, doch,
              Mexiko): sie haben KEINE Bedeutung und kein Bild, aber einen
              Beispielsatz.

Geprueft wird gegen den gesamten Bestand: Klasse 3 aus js/words.js,
Klasse 2 aus tools/bestand/*.csv. Ein Wort, das dort schon steht, wird
gemeldet - der Import wuerde es aus seiner Liste herausziehen.
Das Skript ist wiederholbar: die eigenen Woerter werden aus dem
abgeglichenen Bestand herausgefiltert.
"""
import csv, glob, json, os, re, sys

PROJEKT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BESTAND = os.path.join(PROJEKT, 'tools', 'bestand')

GRUPPEN = {'adjektiv', 'ding', 'essen', 'gefuehl', 'geld', 'kleidung',
           'koerper', 'ort', 'person', 'pflanze', 'schule', 'technik',
           'tier', 'verb', 'werkzeug', 'wetter', 'wort', 'zahl', 'zeit'}
WORTARTEN = {'Nomen', 'Verb', 'Adjektiv', 'Zahlwort', 'anderes'}
SPALTEN = ['wort', 'artikel', 'zahl', 'silben', 'trennung', 'wortart',
           'gruppe', 'bild', 'bedeutung', 'satz', 'liste']


def emoji_set(s):
    """Wie emojiSet in js/exercises.js: Steuerzeichen filtern, zeichenweise.
    Zusammengesetzte Emojis teilen Bausteine - 🧙‍♀️ und 🧜‍♀️ teilen das ♀."""
    return {c for c in str(s or '') if c not in ('️', '‍')}


def lies_words_js(eigene):
    """Klasse-3-Rueckfallliste aus js/words.js als Liste von Feldlisten."""
    pfad = os.path.join(PROJEKT, 'js', 'words.js')
    txt = open(pfad, encoding='utf-8').read()
    block = txt.split('const rows = [', 1)[1].split('\n  ];', 1)[0]
    zeilen = []
    for m in re.finditer(r"\[\s*'((?:[^'\\]|\\.)*)'(.*?)\],?\s*(?:\n|$)", block, re.S):
        felder = re.findall(r"'((?:[^'\\]|\\.)*)'|(\bnull\b)", m.group(0))
        vals = [a if b == '' else None for a, b in felder]
        if vals and vals[0] and vals[0].lower() not in eigene:
            zeilen.append(vals)
    return zeilen


def lies_bestand_csv(eigene):
    """Bestand aus tools/bestand/*.csv, dedupliziert.
    Die Spalte liste entscheidet, zu welcher Liste eine Zeile gehoert -
    in den Wandlisten stehen auch einzelne Klasse-3-Zeilen (die Woerter,
    die ihr Emoji an ein allgemeineres Wort abgegeben haben)."""
    rows, gesehen = [], set()
    for f in sorted(glob.glob(os.path.join(BESTAND, '*.csv'))):
        with open(f, encoding='utf-8-sig', newline='') as fh:
            for r in csv.DictReader(fh, delimiter=';'):
                w = (r.get('wort') or '').strip()
                if not w or w.lower() in eigene or w.lower() in gesehen:
                    continue
                gesehen.add(w.lower())
                rows.append(r)
    return rows


def main(pfad):
    with open(pfad, encoding='utf-8') as fh:
        cfg = json.load(fh)
    liste = cfg['liste']
    woerter = cfg['woerter']
    fehler = []

    eigene = {w['wort'].lower() for w in woerter}
    k3 = lies_words_js(eigene)
    k2 = lies_bestand_csv(eigene)

    bestand_woerter = {r[0].lower(): 'Merkwoerter Klasse 3 (js/words.js)' for r in k3}
    for r in k2:
        bestand_woerter.setdefault(r['wort'].lower(), r.get('liste') or 'tools/bestand')
    bestand_emojis = [(r[0], r[5]) for r in k3 if len(r) > 5 and r[5]]
    bestand_emojis += [(r['wort'], r['bild']) for r in k2 if r.get('bild')]
    nach_liste = {}
    for r in k2:
        nach_liste[r.get('liste') or '?'] = nach_liste.get(r.get('liste') or '?', 0) + 1
    print(f'Bestand: {len(k3)} aus js/words.js, {len(k2)} aus tools/bestand '
          f'({", ".join(f"{v}x {k}" for k, v in sorted(nach_liste.items()))}), '
          f'{len(bestand_emojis)} Woerter mit Bild')

    gesehene_emojis = {}
    for w in woerter:
        wort = w['wort']

        def f(msg, wort=wort):
            fehler.append(f'{wort}: {msg}')

        artikel = w.get('artikel') or ''
        silben = w['silben']
        trennung = w.get('trennung') or silben
        wortart = w.get('wortart') or ''
        gruppe = w.get('gruppe') or ''
        bild = w.get('bild') or ''
        bed = w.get('bedeutung') or ''
        satz = w.get('satz') or ''
        zahl = w.get('zahl') or ''
        funk = bool(w.get('funktionswort'))

        if '-' in wort:
            f('Bindestrich im Wort - nicht darstellbar, Wort weglassen')
        if silben.replace('-', '') != wort:
            f(f'Sprechsilben ergeben "{silben.replace("-", "")}", nicht "{wort}"')
        if trennung.replace('-', '') != wort:
            f(f'Worttrennung ergibt "{trennung.replace("-", "")}", nicht "{wort}"')

        if w.get('duden'):
            d_tr, _, d_gen = w['duden'].partition('|')
            if d_tr != trennung:
                f(f'Worttrennung {trennung} weicht von Duden {d_tr} ab')
            if d_gen != artikel:
                f(f'Artikel "{artikel}" weicht von Duden-Genus "{d_gen}" ab')
        elif w.get('ohne_beleg'):
            print(f'  OHNE DIREKTEN DUDEN-BELEG: {wort} - {w["ohne_beleg"]}')
        else:
            f('kein Duden-Beleg und keine Begruendung in "ohne_beleg"')

        if wortart not in WORTARTEN:
            f(f'unbekannte Wortart "{wortart}"')
        if gruppe not in GRUPPEN:
            f(f'unbekannte Gruppe "{gruppe}"')
        if wortart == 'Nomen' and artikel not in ('der', 'die', 'das'):
            f('Nomen ohne Artikel')
        if wortart != 'Nomen' and artikel:
            f('Artikel bei Nicht-Nomen')
        if zahl not in ('', 'mehrzahl'):
            f(f'zahl "{zahl}" ungueltig')
        if zahl == 'mehrzahl' and artikel != 'die':
            f('zahl=mehrzahl, aber Artikel nicht "die"')

        pos = satz.find(wort)
        if pos < 0:
            f('Wort steht nicht wortgleich im Beispielsatz')
        else:
            vor = satz[pos - 1] if pos > 0 else ' '
            nach = satz[pos + len(wort)] if pos + len(wort) < len(satz) else ' '
            if vor.isalpha():
                f(f'Buchstabe vor dem Treffer ("{satz[max(0, pos - 6):pos + len(wort)]}")')
            if nach.isalpha():
                f(f'Buchstabe nach dem Treffer ("{satz[pos:pos + len(wort) + 6]}")')
        if not satz or satz[-1] not in '.!?':
            f('Beispielsatz endet nicht mit Satzzeichen')
        if '"' in satz:
            f('gerade Anfuehrungszeichen im Satz - deutsche "..." verwenden')

        if funk:
            if bed:
                f('Funktionswort darf keine Bedeutung haben')
            if bild:
                f('Funktionswort darf kein Bild haben')
        else:
            if len(bed) < 15:
                f('Bedeutung fehlt oder ist zu kurz')
            if bed[:1].isupper():
                f('Bedeutung beginnt gross')
            if bed.endswith('.'):
                f('Bedeutung endet mit Punkt')

        if bild:
            neu = emoji_set(bild)
            for andere, e in bestand_emojis:
                if neu & emoji_set(e):
                    f(f'Bildzeichen {bild} teilt ein Zeichen mit {andere} ({e})')
            for andere, e in gesehene_emojis.items():
                if neu & emoji_set(e):
                    f(f'Bildzeichen {bild} teilt ein Zeichen mit {andere} ({e})')
            gesehene_emojis[wort] = bild

        if wort.lower() in bestand_woerter:
            wo = bestand_woerter[wort.lower()]
            if wo.endswith('Klasse 3') or 'words.js' in wo:
                f(f'steht schon im Bestand ({wo}) - der Import wuerde es ueberschreiben')
            else:
                f(f'steht schon in {wo} - der Import wuerde es dort herausziehen')

    if fehler:
        print('\nFEHLER:')
        for z in fehler:
            print(' -', z)
        return 1
    print('\nAlle Pruefungen bestanden.')

    # --- CSV ------------------------------------------------------------
    if cfg.get('csv'):
        with open(cfg['csv'], 'w', encoding='utf-8-sig', newline='') as fh:
            out = csv.writer(fh, delimiter=';', quoting=csv.QUOTE_MINIMAL)
            out.writerow(SPALTEN)
            for w in woerter:
                silben = w['silben']
                trennung = w.get('trennung') or silben
                out.writerow([w['wort'], w.get('artikel') or '', w.get('zahl') or '',
                              silben, trennung if trennung != silben else '',
                              w.get('wortart') or '', w.get('gruppe') or '',
                              w.get('bild') or '', w.get('bedeutung') or '',
                              w.get('satz') or '', liste])
        print('CSV:', cfg['csv'])

    # --- Zeilen fuer js/words.js (nur Klasse 3) -------------------------
    if liste.endswith('Klasse 3'):
        def q(s):
            return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'") + "'"
        print('\n    // ' + cfg.get('kommentar', 'Lernwoerter der Woche'))
        for w in woerter:
            silben = w['silben']
            trennung = w.get('trennung') or silben
            zahl = w.get('zahl') or ''
            felder = [q(w['wort']),
                      q(w['artikel']) if w.get('artikel') else 'null',
                      q(silben), q(w.get('wortart') or ''), q(w.get('gruppe') or ''),
                      q(w['bild']) if w.get('bild') else 'null',
                      q(w.get('bedeutung') or ''), q(w.get('satz') or '')]
            if trennung != silben or zahl:
                felder.append(q(trennung) if trennung != silben else 'null')
            if zahl:
                felder.append(q(zahl))
            print('    [' + ', '.join(felder) + '],')
        print('\n  Letzte vorhandene Zeile in js/words.js endet OHNE Komma -')
        print('  erst Komma setzen, dann anhaengen. Danach ?v= hochzaehlen in')
        print('  index.html, lehrer.html, datenschutz.html und README.md.')
    return 0


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
