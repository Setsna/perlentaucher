# -*- coding: utf-8 -*-
"""Erzeugt die CSV für die alten Lernwörter (Schuljahr 2025/26)."""
import csv, sys, docx
sys.path.insert(0, '.')
from silben import silben, worttrennung

QUELLE = '/root/.claude/uploads/349baf9c-0a62-5fed-acfc-bf021d5ada4a/32866f2f-Deutsch_-_Merkw_rter.docx'
LISTE = 'Merkwörter Klasse 2'

VORHANDEN = set("""Kompott Tagpfauenauge Königskobra Brillenpinguin Regenwurm Wellensittich Bernhardiner
Papageientaucher Streifengnu Riesensalamander Schneeleopard Weißkopfseeadler Wasserbüffel Antilope Jaguar
Faser Kinn Ferien Morgen Schwimmbecken Mittag Abend Bogen Wald heizen springen spritzen blühen kühl Tanne
Fichte Saugrüssel kleinkariert Hydrant Betreuer Hecke Adventskranz breit Klee""".split())

# Zwei-Wort-Eintrag: als Merkwort nicht brauchbar
AUSGESCHLOSSEN = {'am liebsten'}

VERBEN = set("""mahlen verarbeiten mitbringen einpacken gedeihen verkleiden verstecken kommen schnitzen
ausprägen zähmen sinken anziehen rollen liegen bemehlen ausstechen hacken stolzieren necken stecken hocken
sitzen ritzen schützen nützen backen schmücken leuchten freuen überqueren quieken quatschen quetschen
keifen schikanieren fahren fehlen wohnen belohnen frieren lieben verlieren""".split())

ADJEKTIVE = set("""bekannt voll trocken egoistisch feige gruselig gespenstisch hervorragend weiß europäisch
fröhlich heiß glücklich strahlend pünktlich dick vortrefflich gleichgültig ehrlich hohl ziemlich schwierig
quer unterschiedlich serviert""".split())

ZAHLWOERTER = {'Vier', 'sieben', 'viele', 'vielen'}
ANDERE = set("""vor heute draußen zunächst zurück außerdem bald obwohl sehr nie verschiedenen Verben
Camping Norden""".split())

# Bedeutung und Beispielsatz nur dort, wo das Wort für Drittklässler unklar sein kann.
ERKLAERT = {
 'Efeu':        ('eine Kletterpflanze mit immergrünen Blättern', 'An der Mauer wächst dichter Efeu.'),
 'Hieb':        ('ein kräftiger Schlag', 'Mit einem Hieb spaltete er das Holz.'),
 'Roggen':      ('eine Getreideart, aus der dunkles Brot gebacken wird', 'Aus Roggen backt man dunkles Brot.'),
 'Bestandteil': ('ein Teil, aus dem etwas zusammengesetzt ist', 'Mehl ist ein wichtiger Bestandteil des Teigs.'),
 'Vortrag':     ('wenn jemand vor anderen über ein Thema spricht', 'Lina hält einen Vortrag über Pinguine.'),
 'Pavian':      ('ein Affe mit langer Schnauze, der in Afrika lebt', 'Der Pavian sitzt auf einem Felsen.'),
 'Vokale':      ('die Selbstlaute a, e, i, o und u', 'In dem Wort Banane stehen drei Vokale.'),
 'Viper':       ('eine giftige Schlange', 'Die Viper versteckt sich unter einem Stein.'),
 'Luchs':       ('eine Wildkatze mit Pinseln an den Ohren', 'Der Luchs schleicht durch den Wald.'),
 'Ochse':       ('ein männliches Rind, das schwere Lasten zieht', 'Der Ochse zieht den Wagen über das Feld.'),
 'Pfosten':     ('ein senkrecht stehender Balken', 'Der Zaun hängt an einem morschen Pfosten.'),
 'Lärche':      ('ein Nadelbaum, der im Herbst seine Nadeln verliert', 'Die Lärche verliert im Herbst ihre Nadeln.'),
 'Brauchtum':   ('alte Sitten und Feste, die immer wieder gefeiert werden', 'Zu unserem Brauchtum gehören viele Feste.'),
 'Begriff':     ('ein Wort für eine Sache oder eine Idee', 'Für diesen Begriff gibt es eine einfache Erklärung.'),
 'Kelten':      ('ein Volk, das früher in Europa lebte', 'Die Kelten lebten vor sehr langer Zeit in Europa.'),
 'Festlichkeit':('eine Feier zu einem besonderen Anlass', 'Zur Festlichkeit kamen viele Gäste.'),
 'Vorfahre':    ('jemand aus der eigenen Familie, der lange vor einem gelebt hat', 'Mein Vorfahre lebte in diesem Dorf.'),
 'Geruchssinn': ('die Fähigkeit, Dinge zu riechen', 'Der Hund hat einen sehr guten Geruchssinn.'),
 'Utensilien':  ('Dinge, die man für eine Arbeit braucht', 'Zum Backen legen wir alle Utensilien bereit.'),
 'Rührschüssel':('eine große Schüssel, in der man Teig rührt', 'Der Teig kommt in die Rührschüssel.'),
 'Frack':       ('ein feiner schwarzer Anzug mit langen Schößen hinten', 'Der Zauberer trägt einen schwarzen Frack.'),
 'Spatz':       ('ein kleiner brauner Vogel, auch Sperling genannt', 'Ein Spatz pickt Krümel vom Boden.'),
 'Advent':      ('die vier Wochen vor Weihnachten', 'Im Advent zünden wir jede Woche eine Kerze an.'),
 'Satellit':    ('ein Gerät, das um die Erde kreist', 'Der Satellit sendet Bilder zur Erde.'),
 'Meteorit':    ('ein Gesteinsbrocken aus dem All, der auf die Erde fällt', 'Ein Meteorit schlug im Wüstensand ein.'),
 'Weltall':     ('der unendlich große Raum außerhalb der Erde', 'Im Weltall gibt es unzählige Sterne.'),
 'Vorkehrungen':('Dinge, die man vorher vorbereitet', 'Wir treffen Vorkehrungen für den Ausflug.'),
 'Leibgericht': ('das Lieblingsessen von jemandem', 'Nudeln mit Soße sind mein Leibgericht.'),
 'Quirl':       ('ein Küchengerät zum Rühren', 'Mit dem Quirl rührt Papa die Soße.'),
 'Quitte':      ('eine harte gelbe Frucht, die gekocht wird', 'Aus der Quitte kocht Oma Gelee.'),
 'Quelle':      ('die Stelle, an der ein Bach aus der Erde tritt', 'An der Quelle beginnt der Bach.'),
 'Gondel':      ('ein schmales Boot in Venedig', 'Die Gondel gleitet durch den Kanal.'),
 'Gauner':      ('jemand, der andere betrügt', 'Der Gauner wurde von der Polizei gestellt.'),
 'Laich':       ('die Eier von Fröschen und Fischen im Wasser', 'Im Teich schwimmt der Laich der Frösche.'),
 'Taifun':      ('ein sehr starker Wirbelsturm in Asien', 'Der Taifun brachte heftigen Regen.'),
 'Laib':        ('ein ganzes rundes Brot', 'Der Bäcker holt einen Laib Brot aus dem Ofen.'),
 'Saite':       ('eine gespannte Schnur an einem Musikinstrument', 'Auf der Gitarre ist eine Saite gerissen.'),
 'Ruhm':        ('wenn jemand sehr bekannt und berühmt ist', 'Der Sänger genießt seinen Ruhm.'),
 'Fohlen':      ('ein junges Pferd', 'Das Fohlen läuft neben seiner Mutter.'),
 'Kiefer':      ('ein Nadelbaum mit langen Nadeln', 'Die Kiefer wächst auf sandigem Boden.'),
 'Miete':       ('das Geld, das man jeden Monat für eine Wohnung bezahlt', 'Meine Eltern zahlen am Ersten die Miete.'),
 'Stiel':       ('der lange dünne Griff an einem Werkzeug oder an einer Blume', 'Der Besen hat einen langen Stiel.'),
 'Kusine':      ('die Tochter von Onkel oder Tante', 'Meine Kusine wohnt in Hamburg.'),
 'Margarine':   ('ein Streichfett aus Pflanzenöl', 'Auf das Brot kommt etwas Margarine.'),
}


def wortart(wort, artikel):
    if artikel: return 'Nomen'
    if wort in VERBEN: return 'Verb'
    if wort in ADJEKTIVE: return 'Adjektiv'
    if wort in ZAHLWOERTER: return 'Zahlwort'
    if wort[0].isupper(): return 'Nomen'
    return 'anderes'


def lies():
    d = docx.Document(QUELLE)
    zeilen = [p.text.strip() for p in d.paragraphs if p.text.strip()]
    gesehen, raus_dub, raus_vor, eintraege = set(), [], [], []
    for z in zeilen:
        t = z.split()
        art = t[0] if t[0] in ('der', 'die', 'das') else None
        w = ' '.join(t[1:]) if art else z
        if w in gesehen:
            raus_dub.append(w); continue
        gesehen.add(w)
        if w in VORHANDEN:
            raus_vor.append(w); continue
        if w in AUSGESCHLOSSEN:
            continue
        eintraege.append((w, art))
    return eintraege, raus_dub, raus_vor


def main():
    eintraege, dub, vor = lies()
    sp = ['wort', 'artikel', 'silben', 'trennung', 'wortart', 'gruppe', 'bild', 'bedeutung', 'satz', 'liste']
    with open('alte_woerter.csv', 'w', newline='', encoding='utf-8-sig') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(sp)
        for wort, art in eintraege:
            bed, satz = ERKLAERT.get(wort, ('', ''))
            sp_silben = silben(wort)
            w.writerow([wort, art or '', '-'.join(sp_silben), '-'.join(worttrennung(wort, sp_silben)),
                        wortart(wort, art), '', '', bed, satz, LISTE])
    # Kontrolle
    fehler = []
    for wort, art in eintraege:
        if ''.join(silben(wort)) != wort:
            fehler.append('Sprechsilben ergeben nicht das Wort: ' + wort)
        if ''.join(worttrennung(wort)) != wort:
            fehler.append('Worttrennung ergibt nicht das Wort: ' + wort)
        bed, satz = ERKLAERT.get(wort, ('', ''))
        if satz and wort not in satz:
            fehler.append('Wort fehlt im Satz: ' + wort)
    print('Wörter:', len(eintraege), '| mit Bedeutung:', sum(1 for w, a in eintraege if w in ERKLAERT))
    print('übersprungen, doppelt:', len(dub), '| schon vorhanden:', len(vor))
    print('Prüffehler:', fehler or 'keine')


if __name__ == '__main__':
    main()
