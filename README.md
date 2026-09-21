# Perlentaucher

Lernplattform für die Klasse 3 der Deutschen Sektion der Taipei European School.
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
| `js/exercises.js` | Die zehn Aufgabentypen für Deutsch |
| `js/quiz.js` | Fragen für den Sachunterricht und ihr Aufgabenbau |
| `js/store.js` | Spielstand |
| `js/cloud.js` | Anmeldung und Speicherung in Firebase |
| `js/icons.js` | Alle Symbole als eigene Zeichnungen |
| `js/malen.js` | Speicherformat und Zeichnen der Pixelbilder und freien Bilder |
| `js/merge.js` | Führt Spielstände von zwei Geräten zusammen |
| `js/mascot.js` | Otti, der Oktopus |
| `css/style.css` | Das gesamte Aussehen |
| `tools/qr_aufkleber.py` | Erzeugt den Druckbogen mit den QR-Zugangsaufklebern |
| `tools/silben.py` | Sprechsilben und Worttrennung nach Duden |

## Fächer und Sachthemen

Die Startseite zeigt zuerst die **Fächer**. Deutsch führt zu den fünf
Tauchrevieren mit den Lernwörtern, Sachunterricht zu den **Sachthemen**;
das erste ist *Feuer*.

Eine Sachunterrichtsfrage besteht aus der Frage, zwei bis vier Antworten,
den angekreuzten richtigen Antworten und einer **Erklärung**. Die Erklärung
erscheint nach jeder Antwort – auch nach einer richtigen – und ist der
eigentliche Lerneffekt. Die Antworten werden beim Üben gemischt.

Es dürfen **mehrere Antworten richtig** sein. Das Kind wählt eine aus, und
jede angekreuzte zählt als richtig. Gebraucht wird das zum Beispiel beim
Notruf: In Taiwan gilt die **119** für Feuerwehr und Rettungswagen, die
**112** funktioniert vom Handy ebenfalls und ist in Europa die Notrufnummer.
Beide sind als richtig hinterlegt, die Erklärung ordnet sie ein. Dazu gibt
es zwei weitere Fragen, die Taiwan und Europa gezielt auseinanderhalten.

Gepflegt wird das im Lehrerbereich unter **Sachthemen**. Ein neues Thema
entsteht dadurch, dass du Fragen mit einem neuen Themennamen anlegst; dafür
ist keine Änderung am Programm nötig. Nur wenn das Thema eine eigene Farbe
und ein eigenes Symbol bekommen soll, muss es zusätzlich in `js/config.js`
unter `themen` eingetragen werden – sonst erscheint es mit Standardfarbe
und Lupensymbol.

Perlen, Luftblasen, Tagesziel und Klassenziel gelten fächerübergreifend.
Ein Kind kann sein Tagesziel also mit Deutsch, mit Sachunterricht oder mit
beidem erreichen.

**Zum Urheberrecht:** Die Fragen sind eigene Formulierungen. Aus fremden
Unterrichtsmaterialien dürfen weder Texte noch Bilder noch Aufgaben-
stellungen übernommen werden – diese Seite ist öffentlich erreichbar, und
die meisten Materialverlage untersagen genau das ausdrücklich. Sachverhalte
selbst sind nicht geschützt und dürfen in eigenen Worten abgefragt werden.

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

## Belohnung: Malen und Zeichnen

Wer das Tagesziel erreicht, bekommt Malzeit gutgeschrieben. Das Kind wählt
unter **Meine Bilder**, ob es ein **Pixelbild** (16 × 16 Felder anmalen) oder
ein **freies Bild** (weißes Blatt, Pinsel in drei Breiten) anfangen will.
Angefangene Bilder werden beim nächsten Mal weitergemalt.

Alles dazu steht in `js/config.js` unter `malen`:

| Einstellung | Bedeutung |
|---|---|
| `enabled` | Belohnung ein- oder ausschalten |
| `groesse` | Kantenlänge des Rasters (16 = 16 × 16 Felder) |
| `minutenProZiel` | Gutschrift je erreichtem Tagesziel |
| `maxGuthabenMinuten` | Obergrenze, damit sich nichts anstaut |
| `maxBilder` | So viele Bilder darf ein Kind insgesamt sammeln |
| `maxFrei` | davon höchstens so viele frei gezeichnete |
| `breiten` | die drei Pinselbreiten beim freien Zeichnen |
| `maxStrichdaten` | Obergrenze je freiem Bild. Ist sie erreicht, meldet die App „Dieses Blatt ist voll" |
| `farben` | Die Palette, höchstens 32 Farben. **Neue Farben nur hinten anhängen und nie umsortieren** – die Bilder speichern den Platz in dieser Liste, nicht den Farbwert |

Die Zeit läuft nur, solange das Malfeld offen und die App sichtbar ist. Wird das
iPad gesperrt, bleibt das Guthaben stehen. Je Tag gibt es die Gutschrift genau
einmal, auch bei mehreren Tauchgängen.

Das Speicherformat steht in `js/malen.js` und wird von der Kinder-App und vom
Lehrerbereich gemeinsam benutzt. Pixelbilder sind eine Zeichenkette mit einem
Zeichen je Feld, freie Bilder eine Zeichenkette aus Strichen mit Farbe, Breite
und Punkten in einem Raster von 0 bis 1023 – dadurch sieht ein Bild auf jedem
Gerät gleich aus.

### Wo die Bilder liegen

In einer eigenen Sammlung `bilder`, **ein Datensatz je Bild**, mit der Kennung
`<code>_<nummer>`. Im Spielstand `fortschritt/<code>` steht nur noch das
Zeitguthaben. Das ist kein Schönheitsfehler, sondern nötig: Firestore lässt je
Datensatz höchstens 1 MB zu, und der Spielstand wird beim Üben ständig neu
geschrieben. Lägen hundert Bilder darin, würde die Synchronisierung langsam und
irgendwann unmöglich.

Daraus folgt:

* Die Bilder werden erst geholt, wenn das Kind **Meine Bilder** oder das
  Malfeld öffnet – nicht schon beim Anmelden.
* Hochgeladen wird nur, was sich geändert hat, ein Bild je Datensatz.
* Im Lehrerbereich lädst du die Bilder je Kind über **Bilder anzeigen**,
  oder alle auf einmal über **Alle Bilder anzeigen**.
* Für die Sammlung `bilder` gibt es einen eigenen Block in den
  Firestore-Regeln. Ohne den bekommen Kinder und Lehrkraft eine
  Fehlermeldung „Fehlende Berechtigung".

Die Bilder sehen nur das Kind selbst und die Lehrkraft, nicht die Klasse.
Beim Zurücksetzen des Fortschritts bleiben sie unberührt, nur das
Zeitguthaben wird auf null gesetzt.

## Zwei Geräte, ein Spielstand

Übt ein Kind nachmittags zu Hause und abends auf dem Schul-iPad, das seit
Mittag offen liegt, darf der zweite Stand den ersten nicht einfach ersetzen.
Deshalb wird nicht überschrieben, sondern **zusammengeführt** – mit einem
Dreiwege-Vergleich, wie ihn Versionsverwaltungen benutzen:

| | |
|---|---|
| **Basis** | der Stand, den dieses Gerät zuletzt abgeglichen hat (liegt nur lokal, Schlüssel `…​.basis`) |
| **Lokal** | was dieses Gerät seitdem daraus gemacht hat |
| **Fern** | was gerade in der Datenbank steht |

Für Zähler – Perlen, Tagesperlen, Tauchgänge, richtige und falsche Antworten
je Wort – gilt dann `neu = fern + (lokal − basis)`. Jedes Gerät steuert also
nur seinen eigenen Zuwachs bei. Abzeichen werden vereinigt, Rekorde sind das
Maximum, der spätere Übungstag gewinnt.

Eine Ausnahme sind die **Luftblasen**: Sie füllen sich mit der Zeit von selbst
auf, ein Zuwachs ließe sich nicht vom Nachfüllen unterscheiden. Dort gilt
schlicht der jüngere Stand.

Geschrieben wird in einer **Transaktion**: lesen, verrechnen, zurückschreiben.
Ohne Netz kommt keine Transaktion zustande – dann bleibt der Stand lokal
liegen und die App versucht es alle acht Sekunden erneut, außerdem sofort,
sobald das Gerät wieder online ist. Verloren geht dabei nichts.

Dem **Klassenziel** wird nur der eigene Zuwachs gemeldet, nicht der ganze
Perlenstand. Sonst würde der Beitrag des anderen Geräts doppelt zählen.

Die Logik steht in `js/merge.js` und ist bewusst von Firebase getrennt, damit
sie sich ohne Netz testen lässt.

## Wenn das Speichern nicht klappt

Die Kinder-App meldet den Speicherzustand sichtbar, statt Fehler nur in die
Browser-Konsole zu schreiben:

* **Rote Leiste am unteren Rand:** Die Datenbank hat abgelehnt – meist, weil
  die Firestore-Regeln nicht (mehr) passen oder das Tageskontingent erschöpft
  ist. Das Kind soll Bescheid sagen. Sichtbar in jeder Ansicht, auch mitten
  im Tauchgang.
* **Sandfarbene Leiste:** Seit 25 Sekunden wartet ein Schreibvorgang. Das ist
  fast immer ein Funkloch und kein Fehler – Firestore hält den Vorgang zurück
  und schickt ihn nach, sobald wieder Netz da ist. Der Text sagt das auch so.
* Ist alles in Ordnung, ist keine Leiste zu sehen.

Die Fußzeile der Startseite sagt dasselbe in einem Satz.

Grenze: Erkannt wird der Fehler auf dem Gerät des Kindes. Genau dieses Gerät
erreicht die Datenbank in dem Moment nicht – im Lehrerbereich taucht also
nichts auf. Das ist keine Nachlässigkeit, sondern liegt in der Natur der
Sache. Wenn ein Kind die rote Leiste meldet, prüfst du als Erstes die
Firestore-Regeln.

## Auswertung

Der Reiter **Auswertung** rechnet über alle Kinder zusammen, ohne Namen, und
beantwortet die Frage: *Welche Wörter muss ich noch einmal an die Tafel
bringen?* Zu sehen sind die Trefferquote der Klasse, die schwersten Wörter mit
Fehlerzahl und Anzahl betroffener Kinder, die Wörter, die noch niemand geübt
hat, und eine vollständige Tabelle, nach Trefferquote sortiert.

In die Rangliste kommt ein Wort erst, wenn mindestens zwei Kinder es bearbeitet
haben und insgesamt mindestens vier Antworten vorliegen. Sonst stünde ein
einzelner Fehltipp ganz oben. **Sicher** bedeutet: so oft richtig, wie
`masteredAfter` in `js/config.js` angibt (Vorgabe: 3).

Die Zahlen stammen aus `fortschritt/<code>` im Feld `words`, wo je Wort
gespeichert ist, wie oft es richtig und falsch war. Es wird nichts zusätzlich
erhoben und nichts gespeichert.

## Sicherung

Firebase legt im kostenlosen Tarif **keine** Sicherungen an. Im Lehrerbereich
gibt es dafür den Reiter **Sicherung**:

* **Herunterladen** holt alle sechs Sammlungen (`kinder`, `lernwoerter`,
  `einstellungen`, `klassenwochen`, `fortschritt`, `bilder`) in eine einzige
  JSON-Datei. Die Bilder lassen sich abwählen, dann bleibt die Datei klein.
* **Zurückspielen** liest eine solche Datei, zeigt erst an, was darin steht,
  und schreibt sie erst nach einer zweiten Bestätigung. Geschrieben wird in
  Paketen zu 400 Datensätzen, weil Firestore nicht mehr auf einmal annimmt.

Wichtig: Zurückspielen **überschreibt**, aber **löscht nichts**. Ein Kind, das
nach der Sicherung dazugekommen ist, bleibt erhalten. Wer eine alte Sicherung
einspielt, verliert also den Fortschritt seit diesem Zeitpunkt, aber keine
neuen Kinder oder Wörter.

Sinnvoller Rhythmus: freitags herunterladen, Datei zu den Unterlagen legen,
und immer direkt vor größeren Änderungen an den Wörtern oder den Regeln.

## Nach einer Änderung: Versionsnummer hochzählen

Browser merken sich `js` und `css` und liefern sonst tagelang die alte Fassung aus.
Deshalb hängt hinter jeder lokalen Datei in `index.html` und `lehrer.html` ein `?v=14`.
**Wenn du etwas am Programm änderst, zähl diese Zahl in beiden Dateien um eins hoch.**
Dann laden alle Geräte beim nächsten Aufruf die neue Fassung.

## Technik

Reines HTML, CSS und JavaScript ohne Framework. Gehostet auf GitHub Pages.
Anmeldung und Spielstände über Firebase (Authentication und Firestore, Standort europe-west).
Die Kinder melden sich mit einem achtstelligen Code an, der als QR-Aufkleber im Hausaufgabenheft klebt.

Die Firestore-Regeln liegen bewusst nicht in diesem öffentlichen Repository,
weil darin die E-Mail-Adresse der Lehrkraft steht.
