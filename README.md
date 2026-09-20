# WortAbenteuer

Lernwort-Plattform für die Klasse 3.
Die Kinder üben ihre Merkwörter in kleinen Tauchgängen und sammeln dabei Perlen.

**Adresse:** https://setsna.github.io/wortabenteuer/
**Lehrerbereich:** https://setsna.github.io/wortabenteuer/lehrer.html

## Was liegt wo?

| Datei | Inhalt |
|---|---|
| `index.html` | Die App für die Kinder |
| `lehrer.html` | Lehrerbereich: Kinder freischalten, Fortschritt ansehen |
| `js/config.js` | **Alle Einstellungen**: Luftblasen, Perlen, Tagesziel, Klassenziel, Übungstypen |
| `js/words.js` | **Die Lernwörter** mit Artikel, Silben, Bedeutung und Beispielsatz |
| `js/exercises.js` | Die zehn Aufgabentypen |
| `js/store.js` | Spielstand |
| `js/cloud.js` | Anmeldung und Speicherung in Firebase |
| `js/icons.js` | Alle Symbole als eigene Zeichnungen |
| `js/mascot.js` | Otti, der Oktopus |
| `css/style.css` | Das gesamte Aussehen |
| `tools/qr_aufkleber.py` | Erzeugt den Druckbogen mit den QR-Zugangsaufklebern |

## Lernwörter ändern

In `js/words.js` steht eine Zeile je Wort:

```
['Kompott', 'das', 'Kom-pott', 'Nomen', 'essen', '🍑', 'gekochtes Obst …', 'Zum Nachtisch gibt es Kompott.'],
```

Die Reihenfolge ist: Wort, Artikel, Silben mit Bindestrichen, Wortart, Gruppe, Bild, Bedeutung, Beispielsatz.
Bei Verben und Adjektiven steht beim Artikel `null`. Das Wort muss im Beispielsatz genau so vorkommen,
weil daraus die Lückenaufgabe gebaut wird.

## Spielregeln ändern

Alles in `js/config.js`, zum Beispiel wie schnell sich Luftblasen auffüllen,
wie viele Perlen eine richtige Antwort gibt oder wie hoch das Wochenziel der Klasse liegt.

## Technik

Reines HTML, CSS und JavaScript ohne Framework. Gehostet auf GitHub Pages.
Anmeldung und Spielstände über Firebase (Authentication und Firestore, Standort europe-west).
Die Kinder melden sich mit einem achtstelligen Code an, der als QR-Aufkleber im Hausaufgabenheft klebt.

Die Firestore-Regeln liegen bewusst nicht in diesem öffentlichen Repository,
weil darin die E-Mail-Adresse der Lehrkraft steht.
