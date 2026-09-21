/* ==========================================================
   Perlentaucher – Sachunterricht: Fragen und Aufgabenbau

   Drei Aufgabenarten:

   'wahl'         Frage mit Antwortmöglichkeiten. Die richtigen stehen
                  vorn; mit {richtige: 2} sind die ersten zwei richtig.
                  Beim Spielen werden die Antworten gemischt.
   'reihenfolge'  Bausteine in die richtige Ordnung bringen. Die Liste
                  steht hier in der richtigen Reihenfolge.
   'merken'       Frage ohne Auswahl. Das Kind denkt nach, löst auf und
                  schätzt selbst ein, ob es das wusste. Gibt keine
                  Perlen und kostet keine Luftblasen.

   Aufbau einer Zeile:
     [ id, thema, bereich, schwierigkeit, Frage, Antworten, Erklärung,
       { art: '…', richtige: n, loesung: '…' } ]

   Die Fragen hier sind die Rückfallebene, falls die Datenbank nicht
   erreichbar ist. Im Betrieb kommen sie aus der Sammlung
   "quizfragen" und werden im Lehrerbereich gepflegt.

   Die ids sind fest. Sie dürfen nicht verändert werden, sonst
   verliert die Statistik den Bezug zur Frage.
   ========================================================== */
window.WA = window.WA || {};

(function () {
  'use strict';

  var zeilen = [

    // ---------- Was ein Feuer zum Brennen braucht ----------
    ['fe-vd-01', 'feuer', 'verbrennung', 1, 'Ein Feuer braucht drei Dinge zum Brennen. Welches gehört dazu?',
      ['Sauerstoff', 'Stickstoff', 'Rauch', 'Asche'],
      'Ein Feuer braucht Sauerstoff, Wärme und einen Brennstoff.'],
    ['fe-vd-02', 'feuer', 'verbrennung', 1, 'Wie nennt man ein Material, das gut brennt?',
      ['Brennstoff', 'Löschstoff', 'Sauerstoff', 'Rauchstoff'],
      'Holz, Papier und Stroh sind Brennstoffe.'],
    ['fe-vd-03', 'feuer', 'verbrennung', 2, 'Warum brennt eine Kerze nicht weiter, wenn du ein Glas darüber stülpst?',
      ['Der Sauerstoff unter dem Glas wird aufgebraucht.', 'Das Glas macht den Docht nass.', 'Unter dem Glas wird es zu warm.', 'Das Wachs wird unter dem Glas hart.'],
      'Ohne Sauerstoff kann nichts brennen – die Flamme geht aus.'],
    ['fe-vd-04', 'feuer', 'verbrennung', 2, 'Ein Streichholz liegt auf dem Tisch. Warum fängt es nicht von allein an zu brennen?',
      ['Es fehlt die Wärme zum Anzünden.', 'Es fehlt der Sauerstoff.', 'Es fehlt der Brennstoff.', 'Holz kann gar nicht brennen.'],
      'Sauerstoff und Brennstoff sind da. Erst die Wärme bringt das Streichholz zum Brennen.'],
    ['fe-vd-05', 'feuer', 'verbrennung', 2, 'Was entsteht, wenn etwas verbrennt?',
      ['Wärme, Licht und Rauch', 'nur Licht', 'nur Wasser', 'Sauerstoff und Wasser'],
      'Beim Verbrennen entstehen Wärme, Licht, Rauch und Asche.'],
    ['fe-vd-06', 'feuer', 'verbrennung', 3, 'Nimmt man einem Feuer eines der drei Dinge weg, dann …',
      ['geht es aus.', 'brennt es heißer.', 'brennt es blau.', 'raucht es stärker.'],
      'Genau darauf beruht jedes Löschen: einen der drei Teile wegnehmen.'],

    // ---------- Feuer früher und heute ----------
    ['fe-ge-01', 'feuer', 'geschichte', 1, 'Woher kam das Feuer, bevor die Menschen selbst welches machen konnten?',
      ['Aus der Natur, zum Beispiel von einem Blitz', 'Aus Streichhölzern', 'Aus Feuerzeugen', 'Aus dem Backofen'],
      'Blitze und Vulkane entzündeten Brände. Dieses Feuer nahmen die Menschen mit.'],
    ['fe-ge-02', 'feuer', 'geschichte', 2, 'Wie machten Menschen in der Steinzeit selbst Feuer?',
      ['Sie schlugen Steine aneinander, bis Funken entstanden.', 'Sie rieben zwei Blätter aneinander.', 'Sie benutzten kleine Spiegel.', 'Sie gossen heißes Wasser über Holz.'],
      'Die Funken brachten trockenes Gras zum Glimmen. Daraus wurde ein Feuer.'],
    ['fe-ge-03', 'feuer', 'geschichte', 1, 'Wozu war das Feuer für die Menschen in der Steinzeit gut?',
      ['Es wärmte sie und hielt wilde Tiere fern.', 'Es machte ihre Kleidung sauber.', 'Es half ihnen beim Schwimmen.', 'Es machte die Nächte kürzer.'],
      'Wärme, Licht, gegartes Essen und Schutz vor Tieren – das Feuer veränderte alles.'],
    ['fe-ge-04', 'feuer', 'geschichte', 2, 'Womit macht man heute zu Hause meistens Feuer?',
      ['Mit Streichholz oder Feuerzeug', 'Mit zwei Steinen', 'Mit einem Bohrer', 'Mit einer Taschenlampe'],
      'Streichholz und Feuerzeug sind die beiden Geräte, die wir heute benutzen.'],
    ['fe-ge-05', 'feuer', 'geschichte', 2, 'Was passiert, wenn man den Kopf eines Streichholzes an der Reibefläche reibt?',
      ['Durch die Reibung entsteht Wärme und der Kopf entzündet sich.', 'Die Reibefläche gibt Sauerstoff ab.', 'Das Holz wird nass und brennt dann.', 'Der Kopf wird kalt und fängt an zu glühen.'],
      'Reibung macht warm. Diese Wärme reicht aus, um den Zündkopf zu entzünden.'],

    // ---------- Wofür wir Feuer nutzen ----------
    ['fe-nu-01', 'feuer', 'nutzen', 1, 'Wofür nutzen Menschen Feuer?',
      ['Zum Kochen und Wärmen', 'Zum Kühlen von Getränken', 'Zum Trocknen von Wasser', 'Zum Aufpumpen von Reifen'],
      'Kochen, Wärmen und Licht machen sind die wichtigsten Anwendungen.'],
    ['fe-nu-02', 'feuer', 'nutzen', 2, 'Warum wurde früher Wasser über dem Feuer abgekocht?',
      ['Damit Krankheitserreger im Wasser abgetötet werden', 'Damit das Wasser schwerer wird', 'Damit das Wasser besser schmeckt als Saft', 'Damit mehr Wasser entsteht'],
      'Abgekochtes Wasser ist sicherer zu trinken.'],
    ['fe-nu-03', 'feuer', 'nutzen', 2, 'Was macht ein Schmied mit Hilfe von Feuer?',
      ['Er erhitzt Metall, bis er es formen kann.', 'Er kühlt Metall, damit es weich wird.', 'Er wäscht Metall mit heißem Wasser.', 'Er klebt Metallstücke zusammen.'],
      'Heißes Metall lässt sich biegen und in eine neue Form bringen.'],
    ['fe-nu-04', 'feuer', 'nutzen', 3, 'In einem Automotor wird Kraftstoff verbrannt. Wozu dient das?',
      ['Die Verbrennung treibt das Auto an.', 'Die Verbrennung kühlt den Motor.', 'Die Verbrennung reinigt die Luft.', 'Die Verbrennung macht das Auto leiser.'],
      'Deshalb heißt so ein Motor Verbrennungsmotor.'],
    ['fe-nu-05', 'feuer', 'nutzen', 1, 'Welches Feuer findest du bei vielen Menschen zu Hause?',
      ['Eine brennende Kerze', 'Ein Lagerfeuer im Wohnzimmer', 'Eine Fackel im Flur', 'Ein Feuerwerk in der Küche'],
      'Kerzen sind das Feuer, das wir am häufigsten in der Wohnung haben.'],

    // ---------- Wann Feuer gefährlich wird ----------
    ['fe-gf-01', 'feuer', 'gefahren', 1, 'Warum ist Rauch bei einem Brand so gefährlich?',
      ['Man kann ihn nicht einatmen, ohne sich zu schaden.', 'Er ist kalt und macht krank vor Kälte.', 'Er macht den Boden rutschig.', 'Er löscht das Feuer nicht schnell genug.'],
      'Rauch enthält giftige Gase. Bei einem Brand ist er gefährlicher als die Flammen.'],
    ['fe-gf-02', 'feuer', 'gefahren', 2, 'Du riechst Rauch im Treppenhaus. Was tust du?',
      ['Ich hole Hilfe und rufe die Feuerwehr.', 'Ich gehe nachschauen, wo es brennt.', 'Ich warte, bis der Rauch weggeht.', 'Ich mache ein Fenster im Treppenhaus auf.'],
      'Nie selbst nachschauen. Hilfe holen und die Feuerwehr rufen.'],
    ['fe-gf-03', 'feuer', 'gefahren', 1, 'Welche Situation ist gefährlich?',
      ['Eine Kerze brennt allein im leeren Zimmer.', 'Eine Kerze brennt, während jemand daneben sitzt.', 'Eine Kerze steht ungezündet im Schrank.', 'Eine Kerze wird ausgepustet.'],
      'Brennende Kerzen darf man nie allein lassen.'],
    ['fe-gf-04', 'feuer', 'gefahren', 2, 'Warum ist ein Waldbrand schlimm für die Tiere?',
      ['Sie verlieren ihren Lebensraum.', 'Sie bekommen Angst vor Wasser.', 'Sie finden den Weg nach Hause nicht mehr.', 'Sie werden zu schnell satt.'],
      'Verbrannte Bäume sind für lange Zeit weg – mit ihnen der Lebensraum vieler Tiere.'],
    ['fe-gf-05', 'feuer', 'gefahren', 2, 'Wo sollte eine brennende Kerze auf keinen Fall stehen?',
      ['Direkt neben einem trockenen Adventskranz', 'Auf einem Teller aus Porzellan', 'In einem festen Kerzenhalter', 'Auf einem leeren Steintisch'],
      'Trockene Zweige fangen sehr schnell Feuer. Abstand halten!'],

    // ---------- Feuer löschen ----------
    ['fe-lo-01', 'feuer', 'loeschen', 1, 'Womit löscht die Feuerwehr ein brennendes Haus meistens?',
      ['Mit Wasser', 'Mit Öl', 'Mit Mehl', 'Mit warmer Luft'],
      'Wasser kühlt das Feuer, bis es nicht mehr heiß genug zum Brennen ist.'],
    ['fe-lo-02', 'feuer', 'loeschen', 2, 'Du legst eine Löschdecke über ein kleines Feuer. Was nimmst du dem Feuer weg?',
      ['Den Sauerstoff', 'Den Brennstoff', 'Die Asche', 'Den Rauch'],
      'Die Decke schließt das Feuer von der Luft ab.'],
    ['fe-lo-03', 'feuer', 'loeschen', 2, 'Im Kamin legt niemand mehr Holz nach. Warum geht das Feuer aus?',
      ['Weil der Brennstoff fehlt', 'Weil der Sauerstoff fehlt', 'Weil es im Kamin zu warm wird', 'Weil der Rauch das Feuer erstickt'],
      'Ohne neues Holz hat das Feuer nichts mehr zum Brennen.'],
    ['fe-lo-04', 'feuer', 'loeschen', 3, 'In der Pfanne brennt heißes Fett. Was darfst du auf keinen Fall tun?',
      ['Wasser darauf schütten', 'Einen Deckel auf die Pfanne legen', 'Den Herd ausschalten', 'Einen Erwachsenen holen'],
      'Wasser auf brennendes Fett führt zu einer gefährlichen Stichflamme. Nur abdecken!'],
    ['fe-lo-05', 'feuer', 'loeschen', 2, 'Welcher Gegenstand hilft beim Löschen?',
      ['Ein Eimer mit Sand', 'Eine Axt', 'Ein Funkgerät', 'Eine Leiter'],
      'Sand erstickt das Feuer, weil er die Luft abhält.'],
    ['fe-lo-06', 'feuer', 'loeschen', 2, 'Wozu gibt es an der Straße einen Hydranten?',
      ['Dort holt die Feuerwehr Wasser.', 'Dort parken die Feuerwehrautos.', 'Dort meldet man einen Brand.', 'Dort wird Sand gelagert.'],
      'Wenn der Tank im Löschfahrzeug leer ist, schließt die Feuerwehr ihre Schläuche am Hydranten an.'],

    // ---------- Die Feuerwehr ----------
    ['fe-fw-01', 'feuer', 'feuerwehr', 1, 'Was gehört zu den Aufgaben der Feuerwehr?',
      ['Menschen aus Gefahr retten', 'Briefe austragen', 'Hunde ausbilden', 'Straßen bauen'],
      'Retten, Löschen, Bergen und Schützen sind die vier großen Aufgaben.'],
    ['fe-fw-02', 'feuer', 'feuerwehr', 2, 'Die Feuerwehr pumpt einen überfluteten Keller leer. Welche Aufgabe ist das?',
      ['Bergen', 'Löschen', 'Retten', 'Aufklären'],
      'Beim Bergen geht es um Sachen und Tiere, beim Retten um Menschen.'],
    ['fe-fw-03', 'feuer', 'feuerwehr', 2, 'Die Feuerwehr kommt in die Schule und erklärt, wie man sich bei einem Brand verhält. Welche Aufgabe ist das?',
      ['Aufklären', 'Löschen', 'Bergen', 'Absichern'],
      'Die Feuerwehr macht auch auf Gefahren aufmerksam und erklärt, wie man sie vermeidet.'],
    ['fe-fw-04', 'feuer', 'feuerwehr', 1, 'Was gehört zur Ausrüstung einer Feuerwehrfrau?',
      ['Ein Schutzhelm', 'Ein Regenschirm', 'Ein Fahrrad', 'Eine Sonnenbrille'],
      'Helm, Jacke, Hose, Handschuhe und Stiefel schützen vor Hitze.'],
    ['fe-fw-05', 'feuer', 'feuerwehr', 2, 'Wozu trägt ein Feuerwehrmann eine Atemschutzmaske mit Pressluftflasche?',
      ['Damit er im Rauch atmen kann', 'Damit ihn niemand erkennt', 'Damit er unter Wasser tauchen kann', 'Damit er lauter rufen kann'],
      'In der Flasche ist Luft zum Atmen. Ohne sie wäre der Rauch tödlich.'],
    ['fe-fw-06', 'feuer', 'feuerwehr', 2, 'Wozu benutzt die Feuerwehr ein Funkgerät?',
      ['Zum Sprechen mit den anderen im Einsatz', 'Zum Messen der Temperatur', 'Zum Öffnen von Türen', 'Zum Löschen kleiner Brände'],
      'Im Einsatz muss jeder wissen, was die anderen tun.'],
    ['fe-fw-07', 'feuer', 'feuerwehr', 3, 'Was macht die Feuerwehr an der Einsatzstelle als Allererstes?',
      ['Menschen und Tiere in Sicherheit bringen', 'Das Feuer fotografieren', 'Die Straße kehren', 'Die Schläuche waschen'],
      'Menschenleben gehen immer vor. Erst danach beginnt das Löschen.'],

    // ---------- Notruf ----------
    ['fe-nr-01', 'feuer', 'notruf', 1, 'Welche Nummer wählst du, um die Feuerwehr zu rufen?',
      ['119', '112', '110', '911'],
      'Beides ist richtig! In Taiwan ist die 119 die Nummer der Feuerwehr und des Rettungswagens. ' +
      'Die 112 kannst du von jedem Handy wählen – sie wird an die Feuerwehr weitergeleitet und ' +
      'ist in ganz Europa der Notruf. Die 110 ist die Polizei.', { richtige: 2 }],
    ['fe-nr-06', 'feuer', 'notruf', 2, 'Du bist in Taiwan und es brennt. Welche Nummer ist die richtige?',
      ['119', '110', '911', '999'],
      'In Taiwan gilt: 119 für Feuerwehr und Rettungswagen, 110 für die Polizei.'],
    ['fe-nr-07', 'feuer', 'notruf', 2, 'Du bist in den Ferien in Deutschland und es brennt. Welche Nummer wählst du?',
      ['112', '119', '110', '911'],
      'In ganz Europa ist die 112 der Notruf. Die 110 ist dort die Polizei.'],
    ['fe-nr-02', 'feuer', 'notruf', 2, 'Was sagst du zuerst, wenn du den Notruf gewählt hast?',
      ['Wo es passiert ist', 'Wie alt du bist', 'Was du heute gegessen hast', 'Wie das Wetter ist'],
      'Der Ort ist das Wichtigste: Ohne ihn findet niemand den Weg zu dir.'],
    ['fe-nr-03', 'feuer', 'notruf', 2, 'Wann darfst du beim Notruf auflegen?',
      ['Wenn die Leitstelle sagt, dass alles klar ist', 'Sofort nach dem ersten Satz', 'Wenn du deinen Namen gesagt hast', 'Wenn du die Feuerwehr hörst'],
      'Warte ab – die Leitstelle hat oft noch Fragen an dich.'],
    ['fe-nr-04', 'feuer', 'notruf', 2, 'Kostet ein Notruf Geld?',
      ['Nein, ein Notruf ist kostenlos.', 'Ja, er kostet einen Euro.', 'Ja, aber nur nachts.', 'Nur wenn man von zu Hause anruft.'],
      'Ein Notruf ist immer kostenlos. Zögere nie, weil du an Geld denkst.'],
    ['fe-nr-05', 'feuer', 'notruf', 3, 'Was gehört in eine Notrufmeldung?',
      ['Wo, was und wie viele Verletzte', 'Nur der eigene Name', 'Die Lieblingsfarbe', 'Die Hausnummer der Nachbarn'],
      'Wo ist es? Was ist passiert? Wie viele Menschen sind in Gefahr? Wer ruft an? Und dann warten.'],

    // ---------- Verhalten im Brandfall ----------
    ['fe-vh-01', 'feuer', 'verhalten', 1, 'Es brennt in der Schule und der Alarm geht los. Was tust du?',
      ['Ruhig bleiben und mit der Klasse nach draußen gehen', 'Schnell alle Sachen einpacken', 'Unter dem Tisch warten', 'Zum Fenster rennen und rufen'],
      'Ruhe bewahren, Sachen liegen lassen, geordnet zum Sammelplatz.'],
    ['fe-vh-02', 'feuer', 'verhalten', 2, 'Warum sollst du bei einem Brand deine Schultasche liegen lassen?',
      ['Weil jede Sekunde zählt', 'Weil sie brennbar ist', 'Weil sie zu schwer ist', 'Weil die Feuerwehr sie braucht'],
      'Sachen kann man ersetzen. Zeit nicht.'],
    ['fe-vh-03', 'feuer', 'verhalten', 2, 'Sollst du bei einem Brand die Fenster öffnen?',
      ['Nein, offene Fenster bringen dem Feuer frische Luft.', 'Ja, damit der Rauch abziehen kann.', 'Ja, damit es kühler wird.', 'Nur wenn es draußen regnet.'],
      'Frische Luft bedeutet mehr Sauerstoff – das Feuer wird stärker. Fenster und Türen zu.'],
    ['fe-vh-04', 'feuer', 'verhalten', 3, 'Der Weg nach draußen ist verraucht. Was tust du?',
      ['Zimmertür schließen, ans Fenster gehen und um Hilfe rufen', 'Durch den Rauch nach draußen rennen', 'Mich im Schrank verstecken', 'Den Aufzug nehmen'],
      'Im Rauch verliert man sofort die Orientierung. Tür zu und sich am Fenster bemerkbar machen.'],
    ['fe-vh-05', 'feuer', 'verhalten', 2, 'Warum darf man sich bei einem Brand niemals verstecken?',
      ['Weil die Feuerwehr einen dann nicht findet', 'Weil Verstecke immer zuerst brennen', 'Weil es dort zu laut ist', 'Weil man dann den Alarm nicht hört'],
      'Unter dem Bett oder im Schrank sucht niemand zuerst. Zeig dich und rufe.'],
    ['fe-vh-06', 'feuer', 'verhalten', 1, 'Wozu ist ein Rauchmelder an der Zimmerdecke da?',
      ['Er warnt, wenn es raucht – auch im Schlaf.', 'Er löscht kleine Brände.', 'Er ruft selbst die Feuerwehr.', 'Er macht die Luft sauber.'],
      'Rauchmelder retten Leben, weil sie einen aufwecken.'],
    ['fe-vh-07', 'feuer', 'verhalten', 2, 'Wo trefft ihr euch nach einem Feueralarm?',
      ['Am vereinbarten Sammelplatz', 'Auf dem Parkplatz vor der Schule', 'Im Klassenraum', 'Zu Hause'],
      'Am Sammelplatz wird gezählt, ob alle da sind.'],

    // ---------- Reihenfolge bringen ----------
    ['fe-rf-01', 'feuer', 'notruf', 2, 'Bring den Notruf in die richtige Reihenfolge.',
      ['Wo ist es passiert?', 'Was ist passiert?', 'Wie viele Menschen sind in Gefahr?',
       'Wer ruft an?', 'Auf Rückfragen warten'],
      'Zuerst der Ort – ohne ihn findet niemand zu dir. Am Ende wartest du, ob die Leitstelle noch etwas wissen will.',
      { art: 'reihenfolge' }],
    ['fe-rf-02', 'feuer', 'verhalten', 2, 'Der Feueralarm geht los. Bring die Schritte in die richtige Reihenfolge.',
      ['Ruhig bleiben und aufstehen', 'Sachen liegen lassen', 'Fenster und Tür schließen',
       'Mit der Klasse zum Notausgang gehen', 'Am Sammelplatz warten, bis alle da sind'],
      'Ruhe, nichts mitnehmen, Türen zu, geordnet raus, am Sammelplatz zählen.',
      { art: 'reihenfolge' }],
    ['fe-rf-03', 'feuer', 'loeschen', 3, 'In der Pfanne brennt Fett. Bring die Schritte in die richtige Reihenfolge.',
      ['Den Herd ausschalten', 'Einen Deckel auf die Pfanne legen', 'Einen Erwachsenen holen',
       'Die Pfanne stehen lassen und abkühlen lassen'],
      'Erst die Wärmequelle weg, dann die Luft weg. Niemals Wasser, und die heiße Pfanne nicht herumtragen.',
      { art: 'reihenfolge' }],
    ['fe-rf-04', 'feuer', 'geschichte', 2, 'Bring die Geschichte des Feuers in die richtige Reihenfolge.',
      ['Ein Blitz entzündet einen Baum', 'Menschen halten das Feuer am Lagerfeuer am Leben',
       'Menschen schlagen Steine aneinander und machen selbst Feuer',
       'Menschen erfinden das Streichholz'],
      'Erst nehmen, dann bewahren, dann selbst machen – und viel später kommen Streichholz und Feuerzeug.',
      { art: 'reihenfolge' }],
    ['fe-rf-05', 'feuer', 'verhalten', 3, 'Es brennt, und der Weg nach draußen ist verraucht. Was tust du in welcher Reihenfolge?',
      ['Die Zimmertür schließen', 'Zum Fenster gehen', 'Um Hilfe rufen und winken',
       'Auf die Feuerwehr warten'],
      'Die geschlossene Tür hält den Rauch auf. Am Fenster sieht dich die Feuerwehr.',
      { art: 'reihenfolge' }],

    // ---------- Erst denken, dann vergleichen ----------
    ['fe-mk-01', 'feuer', 'verbrennung', 2, 'Nenne die drei Dinge, die ein Feuer zum Brennen braucht.', [],
      '', { art: 'merken', loesung: 'Sauerstoff, Wärme und Brennstoff.' }],
    ['fe-mk-02', 'feuer', 'loeschen', 2, 'Nenne drei Dinge, mit denen man ein Feuer löschen kann.', [],
      '', { art: 'merken', loesung: 'Zum Beispiel: Wasser, Sand, eine Löschdecke, ein Topfdeckel oder ein Feuerlöscher.' }],
    ['fe-mk-03', 'feuer', 'nutzen', 2, 'Wofür nutzen Menschen Feuer? Nenne drei Dinge.', [],
      '', { art: 'merken', loesung: 'Zum Beispiel: kochen, wärmen, Licht machen, Metall formen, Motoren antreiben.' }],
    ['fe-mk-04', 'feuer', 'gefahren', 2, 'Nenne zwei Situationen, in denen Feuer gefährlich wird.', [],
      '', { art: 'merken', loesung: 'Zum Beispiel: eine Kerze bleibt allein brennen, Fett fängt in der Pfanne Feuer, ein Waldbrand, Rauch im Treppenhaus.' }],
    ['fe-mk-05', 'feuer', 'feuerwehr', 2, 'Nenne vier Dinge, die zur Ausrüstung der Feuerwehr gehören.', [],
      '', { art: 'merken', loesung: 'Zum Beispiel: Helm, Jacke, Hose, Handschuhe, Stiefel, Atemschutzmaske, Pressluftflasche, Funkgerät, Axt, Lampe, Seil.' }],
    ['fe-mk-06', 'feuer', 'feuerwehr', 2, 'Welche Aufgaben hat die Feuerwehr? Nenne drei.', [],
      '', { art: 'merken', loesung: 'Retten, Löschen, Bergen und Schützen. Dazu kommen Absichern und Aufklären.' }],
    ['fe-mk-07', 'feuer', 'notruf', 1, 'Welche Nummer wählst du bei einem Feuer – und was sagst du zuerst?', [],
      '', { art: 'merken', loesung: 'In Taiwan die 119, vom Handy geht auch die 112. Zuerst sagst du, wo es passiert ist.' }],
    ['fe-mk-08', 'feuer', 'geschichte', 1, 'Womit machen Menschen heute Feuer? Nenne zwei Geräte.', [],
      '', { art: 'merken', loesung: 'Mit einem Streichholz und mit einem Feuerzeug.' }],
    ['fe-mk-09', 'feuer', 'verhalten', 2, 'Was machst du als Erstes, wenn der Feueralarm losgeht?', [],
      '', { art: 'merken', loesung: 'Ruhig bleiben, Sachen liegen lassen und mit der Klasse zum Sammelplatz gehen. Niemals verstecken.' }]
  ];

  WA.fragen = zeilen.map(function (r) {
    var o = r[7] || {}, art = o.art || 'wahl';
    return {
      id: r[0], thema: r[1], bereich: r[2], schwierigkeit: r[3], art: art,
      frage: r[4], antworten: r[5] || [],
      richtig: art === 'wahl' ? (r[5] || []).slice(0, o.richtige || 1) : [],
      loesung: o.loesung || '',
      erklaerung: r[6]
    };
  });

  // Eine Frage aus einem Datenbankeintrag bauen.
  // "richtig" darf eine einzelne Antwort oder eine Liste sein.
  WA.frageAusDoc = function (id, d) {
    var ant = Array.isArray(d.antworten) ? d.antworten
      : String(d.antworten || '').split('|').map(function (s) { return s.trim(); });
    ant = ant.filter(function (a) { return a; });
    var rich = Array.isArray(d.richtig) ? d.richtig
      : (d.richtig ? [d.richtig] : [ant[0]]);
    var art = d.art || 'wahl';
    return {
      id: id, thema: d.thema || 'feuer', bereich: d.bereich || 'allgemein',
      schwierigkeit: Number(d.schwierigkeit) || 2, art: art,
      frage: d.frage, antworten: ant,
      richtig: art === 'wahl' ? rich.filter(function (r) { return ant.indexOf(r) >= 0; }) : [],
      loesung: d.loesung || '',
      erklaerung: d.erklaerung || ''
    };
  };
})();

/* ==========================================================
   Aufgabenbau für den Sachunterricht
   ========================================================== */
(function () {
  'use strict';
  var C = WA.config;

  function alle() { return WA.fragen || []; }
  function ausThema(thema) {
    return alle().filter(function (f) { return f.thema === thema && f.frage; });
  }

  function mischen(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Wie dringend muss diese Frage geübt werden?
  function gewicht(f) {
    var st = WA.store.wordStat(f.id);
    if (!st || (st.ok + st.wr) === 0) return 3;        // noch nie gesehen
    if (st.lastWrong) return 5;                        // zuletzt falsch
    if (st.ok >= (C.masteredAfter || 3)) return 0.4;   // sitzt
    return 2;
  }

  function aufgabe(f) {
    if (!f) return null;
    var grund = {
      type: 'quiz', quelle: 'quiz', cat: f.bereich, wordId: f.id, thema: f.thema,
      difficulty: f.schwierigkeit, prompt: f.frage, speak: f.frage,
      erklaerung: f.erklaerung
    };

    // Erst denken, dann vergleichen: keine Auswahl, keine Perlen.
    if (f.art === 'merken') {
      return Object.assign(grund, {
        kind: 'offen', ohnePunkte: true,
        loesung: f.loesung,
        solutionText: f.loesung
      });
    }

    // Reihenfolge: die Bausteine werden gemischt und wieder geordnet.
    if (f.art === 'reihenfolge') {
      var richtig = f.antworten.slice();
      var kacheln = mischen(richtig);
      // Nicht zufällig schon in der richtigen Reihenfolge starten.
      if (kacheln.join('|') === richtig.join('|') && kacheln.length > 1) {
        kacheln.push(kacheln.shift());
      }
      return Object.assign(grund, {
        kind: 'build', stapel: true,
        slots: richtig.map(function () { return null; }),
        blanks: richtig.length,      // ohne das bleibt die Reihe leer
        tiles: kacheln,
        answerWord: richtig.join('|'),
        assemble: function (teile) { return teile.join('|'); },
        solutionText: richtig.join(' → ')
      });
    }

    var opt = mischen(f.antworten).map(function (a) { return { label: a, value: a }; });
    return Object.assign(grund, {
      kind: 'choice',
      layout: opt.length > 3 ? 'list' : 'grid2',
      options: opt,
      correct: f.richtig,
      solutionText: f.richtig.join(' oder ')
    });
  }

  function frageMitId(id) {
    return aufgabe(alle().filter(function (f) { return f.id === id; })[0]);
  }

  function baueTauchgang(thema) {
    var alle2 = ausThema(thema), raus = [], benutzt = {};
    if (!alle2.length) return raus;

    // Eine Merkfrage zum Aufwärmen an den Anfang: erst selbst
    // nachdenken, dann vergleichen. Danach die normalen Aufgaben.
    var merk = alle2.filter(function (f) { return f.art === 'merken'; });
    var pool = alle2.filter(function (f) { return f.art !== 'merken'; });
    if (!pool.length) pool = alle2;
    if (merk.length && (!C.quiz || C.quiz.merkfrageZuerst !== false)) {
      var summeM = merk.reduce(function (s2, f) { return s2 + gewicht(f); }, 0);
      var rm = Math.random() * summeM, gew = merk[0];
      for (var m = 0; m < merk.length; m++) { rm -= gewicht(merk[m]); if (rm <= 0) { gew = merk[m]; break; } }
      raus.push(aufgabe(gew));
      benutzt[gew.id] = true;
    }

    for (var k = raus.length; k < C.lessonLength; k++) {
      var kand = pool.filter(function (f) { return !benutzt[f.id]; });
      if (!kand.length) { benutzt = {}; kand = pool; }
      var summe = kand.reduce(function (s, f) { return s + gewicht(f); }, 0);
      if (summe <= 0) { kand = mischen(kand); summe = kand.length; }
      var r = Math.random() * summe, gewaehlt = kand[0];
      for (var i = 0; i < kand.length; i++) {
        r -= gewicht(kand[i]) || 1;
        if (r <= 0) { gewaehlt = kand[i]; break; }
      }
      benutzt[gewaehlt.id] = true;
      raus.push(aufgabe(gewaehlt));
    }
    return raus;
  }

  // Anteil der Fragen eines Themas, die sicher sitzen
  function fortschritt(thema) {
    var pool = ausThema(thema);
    if (!pool.length) return 0;
    var ziel = C.masteredAfter || 3;
    var summe = pool.reduce(function (s, f) {
      var st = WA.store.wordStat(f.id);
      return s + Math.min(st ? st.ok : 0, ziel) / ziel;
    }, 0);
    return summe / pool.length;
  }

  function anzahl(thema) { return ausThema(thema).length; }

  WA.quiz = {
    baueTauchgang: baueTauchgang, frageMitId: frageMitId, aufgabe: aufgabe,
    fortschritt: fortschritt, anzahl: anzahl, ausThema: ausThema
  };
})();
