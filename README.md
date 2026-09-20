# Perlentaucher

Lernplattform für die Klasse 3.
Die Kinder üben in kleinen Tauchgängen und sammeln dabei Perlen.
Aufgebaut ist sie fachneutral, damit später weitere Inhalte und Fächer dazukommen können.

**Adresse:** https://setsna.github.io/perlentaucher/
**Lehrerbereich:** https://setsna.github.io/perlentaucher/lehrer.html

## Was liegt wo?

| Datei | Inhalt |
|---|---|
| `index.html` | Die App für die Kinder |
| `lehrer.html` | Lehrerbereich: Inhalte pflegen, Kinder freischalten, Fortschritt ansehen |
| `js/config.js` | **Alle Einstellungen**: Luftblasen, Perlen, Stufen, Tagesziel, Klassenziel, Übungstypen |
| `js/words.js` | Die mitgelieferten Lernwörter als Rückfallebene, falls die Datenbank nicht erreichbar ist |
| `js/exercises.js` | Die zehn Aufgabentypen |
| `js/store.js` | Spielstand |
| `js/cloud.js` | Anmeldung und Speicherung in Firebase |
| `js/icons.js` | Alle Symbole als eigene Zeichnungen |
| `js/mascot.js` | Otti, der Oktopus |
| `css/style.css` | Das gesamte Aussehen |
| `tools/qr_aufkleber.py` | Erzeugt den Druckbogen mit den QR-Zugangsaufklebern |
| `tools/silben.py` | Sprechsilben und Worttrennung nach Duden |

## Inhalte pflegen

Im laufenden Betrieb über den Lehrerbereich, nicht über diese Dateien.
Dort legst du Wörter an, ordnest sie Listen zu, wählst die aktive Liste,
stellst die Schwierigkeit ein und schaltest Übungstypen ab.

Jedes Wort hat zwei getrennte Silbenfelder:
**Sprechsilben** (Silbenbögen, für das Zählen und Ordnen) und
**Worttrennung** nach Duden (für das Trennen am Zeilenende).
Bei den meisten Wörtern sind beide gleich. Sie unterscheiden sich dort,
wo eine Silbe nur aus einem Vokal besteht: *A-bend* hat zwei Silbenbögen,
ist aber nach Duden nicht trennbar.

## Technik

Reines HTML, CSS und JavaScript ohne Framework. Gehostet auf GitHub Pages.
Anmeldung und Spielstände über Firebase (Authentication und Firestore, Standort europe-west).
Die Kinder melden sich mit einem achtstelligen Code an, der als QR-Aufkleber im Hausaufgabenheft klebt.

Die Firestore-Regeln liegen bewusst nicht in diesem öffentlichen Repository,
weil darin die E-Mail-Adresse der Lehrkraft steht.
