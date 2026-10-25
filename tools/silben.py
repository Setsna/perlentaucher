# -*- coding: utf-8 -*-
"""Deutsche Sprechsilben-Trennung (Regelwerk + Ausnahmen).

Regeln, die hier umgesetzt sind:
  * Ein einzelner Konsonant zwischen Vokalen geht zur folgenden Silbe.
  * Bei mehreren Konsonanten geht nur der letzte zur folgenden Silbe.
  * Untrennbare Verbindungen: ch, sch, ck, ph, th, rh, qu.
  * Nicht getrennt werden Verbindungen aus Konsonant + l/r/n, wenn sie
    eine Silbe eröffnen können (z. B. bl, br, dr, fl, fr, gl, gr, kl, kr,
    pl, pr, tr, schr, schl, schw, str, spr).
  * Dehnungs-h und Vokalverbindungen bleiben beim Vokal.
  * Zusammengesetzte Wörter werden an der Fuge getrennt (Liste unten).
"""

VOKALE = set('aeiouäöüyAEIOUÄÖÜY')
MEHRGRAPHEN = ['sch', 'ch', 'ck', 'ph', 'th', 'rh', 'qu']
# Verbindungen, die eine Silbe eröffnen dürfen
# st, sp und pf eroeffnen im Wortinneren keine Sprechsilbe: Pfos-ten, Wes-pe, Zap-fen
ANLAUT2 = {'bl','br','dr','fl','fr','gl','gr','kl','kn','kr','pl','pr','tr','tw',
           'sl','sm','sn','schl','schr','schw','spr','str','chl','chr','zw'}

# Vorsilben werden zuerst abgetrennt
VORSILBEN = ['unter','über','hervor','ver','vor','ent','zer','aus','ein','auf','mit',
             'her','hin','ge','be','er','ab','an','zu','un']

# Woerter, bei denen das Regelwerk danebenliegt (Vokalfolgen, Zusammensetzungen)
AUSNAHMEN = {
    'Pavian': 'Pa-vi-an', 'Video': 'Vi-de-o', 'Utensilien': 'U-ten-si-li-en',
    'Alien': 'A-li-en', 'Materialien': 'Ma-te-ri-a-li-en', 'Meteorit': 'Me-te-o-rit',
    'Ferien': 'Fe-ri-en', 'egoistisch': 'e-go-is-tisch', 'europäisch': 'eu-ro-pä-isch',
    'freuen': 'freu-en', 'Lebensmittel': 'Le-bens-mit-tel', 'Lagerfeuer': 'La-ger-feu-er',
    'Backofen': 'Back-o-fen', 'Weltall': 'Welt-all', 'Postamt': 'Post-amt',
    'Geruchssinn': 'Ge-ruchs-sinn', 'Rezeptbuch': 'Re-zept-buch', 'Leibgericht': 'Leib-ge-richt',
    'Kohlestücke': 'Koh-le-stü-cke', 'Arbeitsfläche': 'Ar-beits-flä-che',
    'Weihnachtsbräuche': 'Weih-nachts-bräu-che', 'Lichterkette': 'Lich-ter-ket-te',
    'Tannenzweige': 'Tan-nen-zwei-ge', 'Rührschüssel': 'Rühr-schüs-sel',
    'Kühlschrank': 'Kühl-schrank', 'Schlafsack': 'Schlaf-sack', 'Fernglas': 'Fern-glas',
    'Flugzeug': 'Flug-zeug', 'Treffpunkt': 'Treff-punkt', 'Geburtstag': 'Ge-burts-tag',
    'Schwimmbecken': 'Schwimm-be-cken', 'Adventskranz': 'Ad-vents-kranz',
    'Beispiel': 'Bei-spiel', 'Festlichkeit': 'Fest-lich-keit', 'Hering': 'He-ring',
}

# Wortfugen bei Zusammensetzungen: Wort -> Liste der Teile
FUGEN = {}


def _graphem_teilen(wort):
    """Zerlegt in Grapheme, hält sch/ch/ck/ph/th/rh/qu zusammen."""
    out, i, w = [], 0, wort.lower()
    while i < len(w):
        for g in MEHRGRAPHEN:
            if w.startswith(g, i):
                out.append((g, i, i + len(g)))
                i += len(g)
                break
        else:
            out.append((w[i], i, i + 1))
            i += 1
    return out


def _ist_vokal(g):
    return len(g) == 1 and g in VOKALE


def _silben_einfach(wort):
    """Trennt ein nicht zusammengesetztes Wort."""
    g = _graphem_teilen(wort)
    # Positionen der Vokalkerne (Vokalgruppen zusammenfassen)
    kerne = []
    i = 0
    while i < len(g):
        if _ist_vokal(g[i][0]):
            j = i
            while j + 1 < len(g) and _ist_vokal(g[j + 1][0]):
                j += 1
            # Dehnungs-h direkt nach dem Vokal gehört zum Kern
            if j + 1 < len(g) and g[j + 1][0] == 'h' and j + 2 < len(g) and not _ist_vokal(g[j + 2][0]):
                j += 1
            kerne.append((i, j))
            i = j + 1
        else:
            i += 1

    if len(kerne) < 2:
        return [wort]

    schnitte = []
    for k in range(len(kerne) - 1):
        ende = kerne[k][1]          # letztes Graphem des Kerns
        start = kerne[k + 1][0]     # erstes Graphem des nächsten Kerns
        zwischen = g[ende + 1:start]

        if not zwischen:                       # Vokal trifft Vokal: dazwischen trennen
            pos = g[start][1]
        elif len(zwischen) == 1:               # ein Konsonant -> zur nächsten Silbe
            pos = zwischen[0][1]
        else:
            # Prüfen, ob die letzten beiden zusammen eine Silbe eröffnen dürfen
            paar = zwischen[-2][0] + zwischen[-1][0]
            drei = ''.join(x[0] for x in zwischen[-3:]) if len(zwischen) >= 3 else ''
            if len(zwischen) >= 3 and zwischen[-3][0] == zwischen[-2][0]:
                pos = zwischen[-1][1]          # Doppelkonsonant bleibt zusammen
            elif drei in ANLAUT2:
                pos = zwischen[-3][1]
            elif paar in ANLAUT2:
                pos = zwischen[-2][1]
            else:
                pos = zwischen[-1][1]          # nur der letzte Konsonant wandert
        schnitte.append(pos)

    teile, vor = [], 0
    for p in schnitte:
        if p > vor:
            teile.append(wort[vor:p]); vor = p
    teile.append(wort[vor:])
    return [t for t in teile if t]


def _vorsilbe_abtrennen(wort):
    """Trennt eine Vorsilbe ab, wenn der Rest eigenstaendig ist."""
    k = wort.lower()
    for v in VORSILBEN:
        if not k.startswith(v) or len(wort) < len(v) + 3:
            continue
        rest = wort[len(v):]
        # 'be' nicht vor i abtrennen: Bei-spiel, nicht Be-ispiel
        if v in ('be', 'ge', 'zu', 'an', 'un', 'er', 'ab') and rest[0].lower() in 'iue':
            continue
        if not any(c in VOKALE for c in rest):
            continue
        return wort[:len(v)], rest
    return None


def silben(wort, fugen=None):
    """Silben eines Wortes als Liste."""
    if wort in AUSNAHMEN:
        return AUSNAHMEN[wort].split('-')
    fugen = fugen or FUGEN
    if wort in fugen:
        out = []
        for teil in fugen[wort]:
            out += _silben_einfach(teil)
        return out
    geteilt = _vorsilbe_abtrennen(wort)
    if geteilt:
        return _silben_einfach(geteilt[0]) + _silben_einfach(geteilt[1])
    return _silben_einfach(wort)


def probe(paare):
    """paare: Liste (wort, erwartet) -> gibt Abweichungen zurück."""
    schlecht = []
    for w, soll in paare:
        ist = '-'.join(silben(w))
        if ist != soll:
            schlecht.append((w, soll, ist))
    return schlecht


# ---------------------------------------------------------------
#  Worttrennung nach Duden (Zeilenumbruch), nicht Sprechsilben.
#  Unterschied: Eine Silbe aus einem einzelnen Vokalbuchstaben
#  wird am Wortanfang und am Wortende nicht abgetrennt.
#  In der Wortmitte dagegen schon: Me-te-o-rit, Schnee-le-o-pard.
#  Gepruefte Ausnahmen (duden.de, September 2026):
# ---------------------------------------------------------------
TRENNUNG = {
    'Efeu': 'Efeu', 'Ufo': 'Ufo', 'Abend': 'Abend', 'Video': 'Vi-deo',
    'Alien': 'Ali-en', 'Utensilien': 'Uten-si-li-en', 'Backofen': 'Back-ofen',
    'überqueren': 'über-que-ren', 'egoistisch': 'ego-is-tisch',
}


def worttrennung(wort, sprechsilben=None):
    """Worttrennung als Liste. Faellt auf die Sprechsilben zurueck."""
    if wort in TRENNUNG:
        return TRENNUNG[wort].split('-')
    t = list(sprechsilben or silben(wort))
    geaendert = True
    while geaendert and len(t) > 1:
        geaendert = False
        if len(t[0]) == 1:                      # Einzelbuchstabe am Anfang
            t = [t[0] + t[1]] + t[2:]; geaendert = True
        elif len(t) > 1 and len(t[-1]) == 1:    # Einzelbuchstabe am Ende
            t = t[:-2] + [t[-2] + t[-1]]; geaendert = True
    return t
