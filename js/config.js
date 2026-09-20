/* ==========================================================
   WortAbenteuer – Einstellungen
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
