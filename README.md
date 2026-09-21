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
| `js/bilder.js` | Die Grafiken zum Beschriften, als eigene Zeichnungen |
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

Es gibt vier **Aufgabenarten** (Feld `art` in der Datenbank):

| Art | Was die Kinder tun | Perlen |
|---|---|---|
| `wahl` | Aus zwei bis vier Antworten auswählen | ja |
| `reihenfolge` | Bausteine in die richtige Reihenfolge bringen | ja |
| `merken` | Erst selbst überlegen, dann mit der Musterlösung vergleichen und sich selbst einschätzen | nein |
| `beschriften` | Den nummerierten Stellen einer Grafik die Begriffe zuordnen | ja |

Bei `merken` bewertet niemand außer dem Kind selbst; die Antwort wird nicht
getippt und nicht geprüft. Die Selbsteinschätzung geht trotzdem in die
Statistik ein, damit du im Lehrerbereich siehst, was noch wackelt. Weil sich
ein Kind hier bewusst besser einschätzen könnte, gibt es dafür keine Perlen
und keine Luftblasen zurück – das nimmt den Anreiz zum Schummeln. Ist
`quiz.merkfrageZuerst` gesetzt (Voreinstellung), beginnt jeder Tauchgang mit
einer solchen Aufgabe zum Aufwärmen.

Beim Beschriften tippt das Kind eine nummerierte Stelle im Bild an und
wählt dann den Begriff; ein zweiter Tipp auf dieselbe Stelle nimmt ihn
wieder weg. Nach dem Prüfen stehen die falschen Begriffe durchgestrichen
neben den richtigen, und die Rückmeldung lautet „3 von 5 sitzen".

Gewertet wird **jede Stelle einzeln**: Perlen gibt es anteilig, und die
Luftblase bleibt erhalten, solange mindestens die Hälfte stimmt. Nur eine
fehlerfreie Aufgabe zählt als richtig – für die Serie, für die Statistik
und für den vollen Perlenbetrag samt Bonus; falsche Aufgaben kommen im
selben Tauchgang noch einmal. Zwei Stellschrauben in `js/config.js` unter
`quiz`: `teilpunkte` (auf `false` wieder alles oder nichts) und
`luftblaseAbAnteil` (`0.5` = die Hälfte reicht, `1` = nur fehlerfrei).

Die Grafiken sind selbst gezeichnete Vektorbilder in `js/bilder.js` – nicht
in der Datenbank. Das spart Speicher, bleibt auf jedem Bildschirm scharf und
umgeht jede Lizenzfrage. Im Lehrerbereich kannst du auswählen, welche Grafik
eine Aufgabe benutzt und welche ihrer Stellen beschriftet werden sollen; neue
Grafiken kommen dagegen nur über den Code dazu. Es gibt vier: brennende
Kerze, Feuerdreieck, Streichholz mit Schachtel und Ausrüstung der Feuerwehr.
Die Kennungen der Stellen (`docht`, `helm`, …) sind fest – wer sie in
`js/bilder.js` ändert, zerreißt gespeicherte Aufgaben.

Jede Aufgabe hat außerdem eine **Erklärung**. Sie erscheint nach jeder
Antwort – auch nach einer richtigen – und ist der eigentliche Lerneffekt.
Antworten und Bausteine werden beim Üben gemischt.

Es dürfen **mehrere Antworten richtig** sein. Das Kind wählt eine aus, und
jede angekreuzte zählt als richtig. Gebraucht wird das zum Beispiel beim
Notruf: In Taiwan gilt die **119** für Feuerwehr und Rettungswagen, die
**112** funktioniert vom Handy ebenfalls und ist in Europa die Notrufnummer.
Beide sind als richtig hinterlegt, die Erklärung ordnet sie ein. Dazu gibt
es zwei weitere Fragen, die Taiwan und Europa gezielt auseinanderhalten.

Gepflegt wird das im Lehrerbereich unter **Sachthemen**. Das Formular stellt
sich auf die gewählte Art um: Ankreuzfelder bei `wahl`, nummerierte Schritte
in der richtigen Reihenfolge bei `reihenfolge`, ein Feld für die
Musterlösung bei `merken`, Bildauswahl mit Vorschau bei `beschriften`. Beim
Wechsel der Art bleibt stehen, was du schon eingegeben hast. Dort gibt es auch
**Mitgelieferte Fragen abgleichen**: Die Datenbank hat Vorrang vor der Datei
`js/quiz.js`, also kommen korrigierte oder neue mitgelieferte Fragen nicht
von allein an. Der Abgleich schreibt sie nach – Fragen mit derselben Kennung
werden überschrieben, neue kommen dazu, deine eigenen bleiben unberührt. Vor
dem Schreiben wird angezeigt, was sich ändert. Ein neues Thema
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

**Als CSV sichern** legt die Datei über „Als Datei laden" in deinen
Downloads ab; alternativ kopiert „Text kopieren" den Inhalt. Formulare und
Ausgaben erscheinen unter der Tabelle, und die Seite springt dorthin – bei
langen Listen sah es sonst aus, als täte der Knopf nichts.

Die **Gruppe** fasst Wörter zu Themenfeldern zusammen (tier, pflanze, zeit,
person …). Zwei Wörter derselben Gruppe stehen nie gemeinsam in einer
Aufgabe zur Auswahl – sonst wären bei 🐦 sowohl *Papageientaucher* als auch
*Wellensittich* plausibel und das Kind könnte nur raten. Das Feld wirkt nur,
wo es gepflegt ist; leer bleibt es folgenlos.

Das **Bild** ist ein Emoji im Wortfeld. Es erscheint als Anschauung bei
vielen Übungen und ist bei **Welches Wort passt zum Bild?** die Frage
selbst. Deshalb gilt: lieber kein Bild als ein mehrdeutiges. Drei Fische
brauchen nicht drei Fisch-Emojis – wo die Zuordnung nicht eindeutig ist,
bleibt das Feld leer. Die App sorgt zusätzlich dafür, dass kein Ablenker
ein Zeichen mit dem gezeigten Bild teilt.

Die Wortliste zeigt unter jedem Wort, was ihm fehlt – Bedeutung,
Beispielsatz oder Bild. Fehlt eines davon, entfällt für dieses Wort der
passende Übungstyp. Die Übung **Was bedeutet das Wort?** braucht außerdem
mindestens drei Wörter mit Bedeutung, weil sie drei Antworten zur Auswahl
stellt; darunter entfällt sie ganz. Über der Liste steht, wie viele Wörter
ohne Bedeutung sind.

Jedes Wort hat zwei getrennte Silbenfelder:
**Sprechsilben** (Silbenbögen, für das Zählen und Ordnen) und
**Worttrennung** nach Duden (für das Trennen am Zeilenende).
Bei den meisten Wörtern sind beide gleich. Sie unterscheiden sich dort,
wo eine Silbe nur aus einem Vokal besteht: *A-bend* hat zwei Silbenbögen,
ist aber nach Duden nicht trennbar.

## Bedenkzeit

Manche Kinder tippen reflexhaft weiter, ohne die Aufgabe oder die Erklärung
gelesen zu haben. Deshalb ist **Prüfen** die ersten Sekunden gesperrt und
**Weiter** ebenfalls. Der Knopf zeigt währenddessen die Restsekunden und
einen ablaufenden Balken – sonst wirkt er kaputt. Gesperrt ist auch die
Selbsteinschätzung bei den Merkfragen, damit die Musterlösung gelesen wird.

Einstellbar im Lehrerbereich unter **Einstellungen → Bedenkzeit** oder in
`js/config.js` unter `bedenkzeit`: `vorAntwort` (Voreinstellung 5 Sekunden)
und `vorWeiter` (3 Sekunden). **0** schaltet die jeweilige Sperre ab.

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
Deshalb hängt hinter jeder lokalen Datei in `index.html` und `lehrer.html` ein `?v=22`.
**Wenn du etwas am Programm änderst, zähl diese Zahl in beiden Dateien um eins hoch.**
Dann laden alle Geräte beim nächsten Aufruf die neue Fassung.

## Technik

Reines HTML, CSS und JavaScript ohne Framework. Gehostet auf GitHub Pages.
Anmeldung und Spielstände über Firebase (Authentication und Firestore, Standort europe-west).
Die Kinder melden sich mit einem achtstelligen Code an, der als QR-Aufkleber im Hausaufgabenheft klebt.

Die Firestore-Regeln liegen bewusst nicht in diesem öffentlichen Repository,
weil darin die E-Mail-Adresse der Lehrkraft steht.
