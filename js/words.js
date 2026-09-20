/* ==========================================================
   Lernwörter Klasse 3 – Merkwörter
   Spalten: Wort | Artikel | Sprechsilben | Wortart | Gruppe | Bild | Bedeutung | Beispielsatz
            (optional als 9. Spalte: Worttrennung nach Duden, falls abweichend)
   Das Wort muss im Beispielsatz genau so vorkommen (wird als Lücke genutzt).
   Silben, Bedeutungen und Sätze sind ENTWÜRFE – bitte prüfen!
   ========================================================== */
window.WA = window.WA || {};

(function () {
  const rows = [
    ['Kompott',        'das', 'Kom-pott',            'Nomen',   'essen',   '🍑', 'gekochtes Obst mit Zucker, das man als Nachtisch isst', 'Zum Nachtisch gibt es Kompott.'],
    ['Tagpfauenauge',  'das', 'Tag-pfau-en-au-ge',   'Nomen',   'tier',    '🦋', 'ein bunter Schmetterling mit Augenflecken auf den Flügeln', 'Ein Tagpfauenauge sitzt auf der Blüte.'],
    ['Königskobra',    'die', 'Kö-nigs-ko-bra',      'Nomen',   'tier',    '🐍', 'eine sehr giftige, große Schlange', 'Im Zoo sahen wir eine Königskobra.'],
    ['Brillenpinguin', 'der', 'Bril-len-pin-gu-in',  'Nomen',   'tier',    '🐧', 'ein Pinguin, der aussieht, als würde er eine Brille tragen', 'Der Brillenpinguin watschelt am Strand entlang.'],
    ['Regenwurm',      'der', 'Re-gen-wurm',         'Nomen',   'tier',    '🪱', 'ein Tier ohne Beine, das in der Erde lebt', 'Nach dem Regen kriecht ein Regenwurm über den Weg.'],
    ['Wellensittich',  'der', 'Wel-len-sit-tich',    'Nomen',   'tier',    '🦜', 'ein kleiner, bunter Papagei, den viele Menschen als Haustier halten', 'Mein Wellensittich kann ein paar Wörter sprechen.'],
    ['Bernhardiner',   'der', 'Bern-har-di-ner',     'Nomen',   'tier',    '🐕', 'ein sehr großer Hund mit braun-weißem Fell', 'Der Bernhardiner ist ein besonders großer Hund.'],
    ['Papageientaucher','der','Pa-pa-gei-en-tau-cher','Nomen',  'tier',    '🐦', 'ein Meeresvogel mit einem großen, bunten Schnabel', 'Der Papageientaucher fängt kleine Fische im Meer.'],
    ['Streifengnu',    'das', 'Strei-fen-gnu',       'Nomen',   'tier',    null, 'ein großes Tier in Afrika, das in riesigen Herden lebt', 'Das Streifengnu wandert mit der Herde durch die Steppe.'],
    ['Riesensalamander','der','Rie-sen-sa-la-man-der','Nomen',  'tier',    null, 'ein sehr großes Tier, das im Wasser lebt und nicht zu den Fischen gehört', 'Der Riesensalamander wird über einen Meter lang.'],
    ['Schneeleopard',  'der', 'Schnee-le-o-pard',    'Nomen',   'tier',    '❄️🐆', 'eine Raubkatze mit dickem Fell, die hoch im Gebirge lebt', 'Der Schneeleopard lebt hoch oben im Gebirge.'],
    ['Weißkopfseeadler','der','Weiß-kopf-see-ad-ler','Nomen',   'tier',    '🦅', 'ein großer Greifvogel mit weißen Federn am Kopf', 'Der Weißkopfseeadler kreist hoch am Himmel.'],
    ['Wasserbüffel',   'der', 'Was-ser-büf-fel',     'Nomen',   'tier',    '🐃', 'ein kräftiges Rind, das gern im Wasser und Schlamm badet', 'Der Wasserbüffel badet gern im Schlamm.'],
    ['Antilope',       'die', 'An-ti-lo-pe',         'Nomen',   'tier',    null, 'ein schnelles Tier mit schlanken Beinen, das in Afrika und Asien lebt', 'Die Antilope rennt schnell über die Steppe.'],
    ['Jaguar',         'der', 'Ja-gu-ar',            'Nomen',   'tier',    '🐆', 'eine große Raubkatze mit Flecken, die in Südamerika lebt', 'Der Jaguar schleicht durch den Dschungel.'],
    ['Faser',          'die', 'Fa-ser',              'Nomen',   'ding',    '🧵', 'ein sehr dünner Faden, zum Beispiel aus Wolle oder Baumwolle', 'Diese Faser ist ganz dünn und weich.'],
    ['Kinn',           'das', 'Kinn',                'Nomen',   'koerper', null, 'der Teil des Gesichts unter dem Mund', 'Der Opa hat einen Bart am Kinn.'],
    ['Ferien',         'die', 'Fe-ri-en',            'Nomen',   'zeit',    '🏖️', 'die Zeit, in der keine Schule ist', 'In den Ferien fahren wir ans Meer.'],
    ['Morgen',         'der', 'Mor-gen',             'Nomen',   'zeit',    '🌅', 'die Tageszeit, wenn der Tag beginnt', 'Am Morgen putze ich mir die Zähne.'],
    ['Schwimmbecken',  'das', 'Schwimm-be-cken',     'Nomen',   'ort',     '🏊', 'ein großes, mit Wasser gefülltes Becken zum Schwimmen', 'Im Schwimmbecken ist das Wasser angenehm warm.'],
    ['Mittag',         'der', 'Mit-tag',             'Nomen',   'zeit',    '☀️', 'die Tageszeit, wenn die Sonne am höchsten steht', 'Zu Mittag essen wir in der Mensa.'],
    ['Abend',          'der', 'A-bend',              'Nomen',   'zeit',    '🌆', 'die Tageszeit am Ende des Tages, wenn es dunkel wird', 'Am Abend gehe ich ins Bett.', 'Abend'],
    ['Bogen',          'der', 'Bo-gen',              'Nomen',   'ding',    '🏹', 'etwas Gebogenes, zum Beispiel zum Schießen von Pfeilen', 'Der Schütze spannt den Bogen.'],
    ['Wald',           'der', 'Wald',                'Nomen',   'ort',     '🌳', 'ein großes Gebiet mit vielen Bäumen', 'Im Wald sammeln wir Pilze.'],
    ['heizen',         null,  'hei-zen',             'Verb',    'verb',    '🔥', 'einen Raum warm machen', 'Im Winter müssen wir die Wohnung heizen.'],
    ['springen',       null,  'sprin-gen',           'Verb',    'verb',    '🤸', 'sich mit den Beinen vom Boden abstoßen und durch die Luft fliegen', 'Die Kinder springen über das Seil.'],
    ['spritzen',       null,  'sprit-zen',           'Verb',    'verb',    '💦', 'Wasser in Tropfen herumschleudern', 'Beim Baden spritzen wir uns nass.'],
    ['blühen',         null,  'blü-hen',             'Verb',    'verb',    '🌸', 'Blüten bekommen und aufmachen', 'Im Frühling blühen die Blumen.'],
    ['kühl',           null,  'kühl',                'Adjektiv','adjektiv','🧊', 'ein bisschen kalt', 'An heißen Tagen ist das Wasser schön kühl.'],
    ['Tanne',          'die', 'Tan-ne',              'Nomen',   'pflanze', '🎄', 'ein Nadelbaum, den viele zu Weihnachten schmücken', 'Zu Weihnachten steht eine Tanne im Zimmer.'],
    ['Fichte',         'die', 'Fich-te',             'Nomen',   'pflanze', '🌲', 'ein Nadelbaum mit spitzen Nadeln und hängenden Zapfen', 'Die Fichte hat spitze Nadeln und hängende Zapfen.'],
    ['Saugrüssel',     'der', 'Saug-rüs-sel',        'Nomen',   'koerper', null, 'das lange Mundwerkzeug, mit dem ein Schmetterling Nektar trinkt', 'Mit dem Saugrüssel trinkt der Schmetterling Nektar.'],
    ['kleinkariert',   null,  'klein-ka-riert',      'Adjektiv','adjektiv',null, 'mit vielen kleinen Karos gemustert', 'Das Hemd ist kleinkariert.'],
    ['Hydrant',        'der', 'Hy-drant',            'Nomen',   'ding',    '🚒', 'ein Wasseranschluss an der Straße, den die Feuerwehr nutzt', 'Am Straßenrand steht ein roter Hydrant.'],
    ['Betreuer',       'der', 'Be-treu-er',          'Nomen',   'person',  null, 'eine Person, die auf Kinder aufpasst und sich um sie kümmert', 'Der Betreuer passt in der Pause auf die Kinder auf.'],
    ['Hecke',          'die', 'He-cke',              'Nomen',   'pflanze', '🌿', 'eine Reihe dicht gewachsener Sträucher', 'Der Igel versteckt sich unter der Hecke.'],
    ['Adventskranz',   'der', 'Ad-vents-kranz',      'Nomen',   'ding',    '🕯️', 'ein Kranz aus Tannenzweigen mit vier Kerzen', 'Auf dem Adventskranz brennen vier Kerzen.'],
    ['breit',          null,  'breit',               'Adjektiv','adjektiv','↔️', 'von einer Seite zur anderen weit, nicht schmal', 'Die Straße ist sehr breit.'],
    ['Klee',           'der', 'Klee',                'Nomen',   'pflanze', '🍀', 'eine Wiesenpflanze mit meist drei Blättern', 'Im Gras wächst Klee.']
  ];

  WA.words = rows.map(function (r) {
    return {
      id: r[0].toLowerCase(),
      wort: r[0],
      artikel: r[1],
      silben: r[2].split('-'),
      trennung: (r[8] || r[2]).split('-'),   // Worttrennung nach Duden
      wortart: r[3],
      gruppe: r[4],
      bild: r[5],
      bedeutung: r[6],
      satz: r[7],
      liste: 'Merkwörter Klasse 3'
    };
  });
})();
