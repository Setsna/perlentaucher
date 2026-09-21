/* ==========================================================
   Perlentaucher – Einstellungen
   Hier kannst du die Spielregeln ändern (später auch im Lehrer-Dashboard).
   Hinweis: Im Code heißen die Luftblasen weiterhin "hearts" und die
   Perlen weiterhin "xp". Nur die Anzeige für die Kinder ist anders.
   ========================================================== */
window.WA = window.WA || {};

WA.config = {
  // --- Luftblasen (Leben) -------------------------------------
  hearts: {
    max: 5,                    // Luftblasen am Anfang / Maximum
    costPerWrong: 1,           // Verlust pro falscher Antwort
    refillMinutes: 15,         // 1 Luftblase kommt nach so vielen Minuten zurück
    allowPracticeAtZero: true  // Bei 0 Luftblasen: Üben ohne Perlen erlauben
  },

  // --- Perlen (Punkte) ----------------------------------------
  xp: {
    byDifficulty: { 1: 5, 2: 6, 3: 8 }, // Perlen pro richtiger Antwort je Schwierigkeit
    streakBonusFrom: 3,        // Bonus ab so vielen richtigen Antworten in Folge
    streakBonusPerStep: 1,     // +1 Perle pro weiterer richtiger Antwort
    streakBonusMax: 4,         // Bonus-Obergrenze pro Antwort
    completeBonus: 5,          // Bonus für einen beendeten Tauchgang
    perfectLessonBonus: 10     // Zusatzbonus für einen Tauchgang ohne Fehler
  },

  // --- Schwierigkeitsstufen ------------------------------------
  // Werden im Lehrerbereich gewählt, für die Klasse oder je Kind.
  stufen: {
    leicht: { luftblasen: 7, aufgaben: 6,  hinweise: true  },
    mittel: { luftblasen: 5, aufgaben: 8,  hinweise: true  },
    schwer: { luftblasen: 3, aufgaben: 10, hinweise: false }
  },
  stufe: 'mittel',

  // --- Wortlisten ----------------------------------------------
  aktiveListe: null,           // null = alle Wörter üben
  wiederholungAnteil: 0.25,    // Anteil der Aufgaben aus früheren Listen
  hinweise: true,              // Bedeutung als Tipp einblenden

  lessonLength: 8,             // Aufgaben pro Tauchgang
  dailyGoalXp: 100,            // Tagesziel in Perlen
  masteryTarget: 2,            // So oft richtig = Wort gilt im Bereich als "gelernt"
  masteredAfter: 3,            // So oft richtig insgesamt = Wort gilt als "sicher"

  // --- Klassenziel ----------------------------------------------
  // Die Klasse sammelt gemeinsam. Es gibt bewusst keine Rangliste
  // und keinen Vergleich einzelner Kinder untereinander.
  klasse: {
    name: 'Klasse 3',
    kinder: 22,                // Anzahl der Kinder
    wochenzielProKind: 150,    // Wochenziel = kinder × dieser Wert
    // Nur für den Prototyp: Beispielwerte, bis Firebase angebunden ist.
    demoRestDerKlasse: 1730,   // Perlen der übrigen Kinder in dieser Woche
    demoWochen: [              // abgeschlossene Wochen (Beispiel)
      { woche: 'Woche vom 8.9.',  xp: 3480, ziel: 3300 },
      { woche: 'Woche vom 1.9.',  xp: 2910, ziel: 3300 }
    ]
  },

  // --- Belohnung: Pixelbild ------------------------------------
  // Wer das Tagesziel erreicht, bekommt Malzeit gutgeschrieben.
  // Die Zeit läuft nur, solange das Malfeld wirklich offen ist.
  malen: {
    enabled: true,
    groesse: 16,               // Raster: 16 × 16 Felder
    minutenProZiel: 5,         // Gutschrift je erreichtem Tagesziel
    maxGuthabenMinuten: 15,    // Obergrenze, damit sich nichts anstaut
    maxBilder: 120,            // So viele Bilder darf ein Kind sammeln
    maxFrei: 100,              // davon höchstens so viele frei gezeichnete
    // Freies Zeichnen: Strichbreiten im internen Raster (0 … 1023).
    // Der Radierer ist ein weißer Pinsel in der größten Breite.
    breiten: [6, 14, 30],
    maxStrichdaten: 16000,     // Obergrenze je Bild (die Regeln lassen 20000 zu)
    // 23 Farben. Die Reihenfolge bestimmt die Anzeige, der Platz in
    // dieser Liste wird im Bild gespeichert – neue Farben also IMMER
    // hinten anhängen und nie umsortieren, sonst färben sich alte
    // Bilder um. Höchstens 32 Farben (Speicherformat).
    farben: ['#FFFFFF', '#000000', '#7A7A7A', '#C9C9C9',
             '#E23B3B', '#F2766B', '#F2A93B', '#F7E04B',
             '#5BBF4A', '#1F7A3A', '#4FC3E8', '#1F6FD0',
             '#1B3A8C', '#9B59D0', '#8B5A2B',
             '#F7B7D3', '#C21E7E', '#0FB5A8', '#A8E6B0',
             '#F2C9A0', '#8A4B2A', '#A8C63A', '#5B4A9E']
  },

  // --- Übungstypen (einzeln ein-/ausschaltbar) -------------------
  types: {
    buchstaben:     { difficulty: 3, enabled: true, maxLetters: 13 },
    luecke:         { difficulty: 2, enabled: true },
    fehler:         { difficulty: 2, enabled: true },
    artikel:        { difficulty: 1, enabled: true },
    silben_zaehlen: { difficulty: 1, enabled: true },
    silben_ordnen:  { difficulty: 2, enabled: true },
    trennen:        { difficulty: 2, enabled: true },
    bild:           { difficulty: 1, enabled: true },
    bedeutung:      { difficulty: 2, enabled: true },
    satz:           { difficulty: 2, enabled: true }
  },

  // --- Fächer ---------------------------------------------------
  // Die Startseite zeigt diese Knöpfe. Ein Fach der Art "woerter"
  // führt zu den Tauchrevieren, eines der Art "themen" zu seinen
  // Sachthemen.
  faecher: {
    deutsch: {
      title: 'Deutsch', sub: 'Lernwörter üben', icon: 'buchstabe',
      color: '#D4554A', art: 'woerter', enabled: true
    },
    sachunterricht: {
      title: 'Sachunterricht', sub: 'Unsere Themen', icon: 'lupe',
      color: '#2E7D32', art: 'themen', enabled: true
    }
  },

  // --- Sachthemen -----------------------------------------------
  themen: {
    feuer: {
      fach: 'sachunterricht', title: 'Feuer', sub: 'Brennen, Löschen, Feuerwehr',
      icon: 'flamme', color: '#E2631F', enabled: true
    }
  },

  // --- Tauchreviere (Übungskategorien) --------------------------
  // icon: Schlüssel aus js/icons.js oder ein Emoji
  categories: {
    schreibweise: { title: 'Riffschule',        sub: 'Schreibweise',    icon: 'fische', color: '#1F6FD0', enabled: true,
                    types: ['buchstaben', 'luecke', 'fehler'] },
    artikel:      { title: 'Artikel-Lagune',    sub: 'Artikel',         icon: 'muschel', color: '#7A4FD1', enabled: true,
                    types: ['artikel'] },
    silben:       { title: 'Silben-Strömung',   sub: 'Silben',          icon: 'wellen', color: '#0C8F86', enabled: true,
                    types: ['silben_zaehlen', 'silben_ordnen', 'trennen'] },
    verstehen:    { title: 'Schatztruhe',       sub: 'Wortverständnis', icon: 'truhe', color: '#C77A06', enabled: true,
                    types: ['bild', 'bedeutung', 'satz'] },
    gemischt:     { title: 'Tiefsee-Mix',       sub: 'Gemischte Wiederholung', icon: 'anglerfisch', color: '#AC3670', enabled: true,
                    types: ['buchstaben', 'luecke', 'fehler', 'artikel', 'silben_zaehlen', 'silben_ordnen', 'trennen', 'bild', 'bedeutung', 'satz'] }
  }
};

/* ==========================================================
   Einstellungen aus der Datenbank übernehmen.
   Reihenfolge im Betrieb: erst die Klasse, dann das einzelne Kind.
   ========================================================== */
WA.applySettings = function (e) {
  var C = WA.config;
  if (!e) return;

  if (e.stufe && C.stufen[e.stufe]) {
    var st = C.stufen[e.stufe];
    C.stufe = e.stufe;
    C.hearts.max = st.luftblasen;
    C.lessonLength = st.aufgaben;
    C.hinweise = st.hinweise;
  }
  if (e.typen) {
    Object.keys(e.typen).forEach(function (k) {
      if (C.types[k]) C.types[k].enabled = !!e.typen[k];
    });
  }
  if (e.aktiveListe !== undefined) C.aktiveListe = e.aktiveListe || null;
  if (typeof e.wiederholungAnteil === 'number') C.wiederholungAnteil = e.wiederholungAnteil;
  if (typeof e.dailyGoalXp === 'number') C.dailyGoalXp = e.dailyGoalXp;
  if (typeof e.kinder === 'number') C.klasse.kinder = e.kinder;
  if (typeof e.wochenzielProKind === 'number') C.klasse.wochenzielProKind = e.wochenzielProKind;
  if (typeof e.malenAn === 'boolean') C.malen.enabled = e.malenAn;
  if (typeof e.malMinuten === 'number') C.malen.minutenProZiel = e.malMinuten;
  if (typeof e.malMaxMinuten === 'number') C.malen.maxGuthabenMinuten = e.malMaxMinuten;
};

/* Ein Wort aus einem Datenbankeintrag bauen */
WA.wortAusDoc = function (id, d) {
  return {
    id: id,
    wort: d.wort,
    artikel: d.artikel || null,
    silben: String(d.silben || d.wort).split('-'),
    trennung: String(d.trennung || d.silben || d.wort).split('-'),
    wortart: d.wortart || '',
    gruppe: d.gruppe || '',
    bild: d.bild || null,
    bedeutung: d.bedeutung || null,
    satz: d.satz || '',
    liste: d.liste || ''
  };
};
