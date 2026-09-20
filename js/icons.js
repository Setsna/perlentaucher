/* ==========================================================
   Alle Symbole als eigene SVG-Zeichnungen (keine Emojis)
   Verwendung in js/config.js und js/store.js:  icon: 'fische'
   Statt eines Schlüssels kann dort auch ein Emoji stehen.
   Die Größe wird über CSS gesteuert (Klasse "ic").
   ========================================================== */
window.WA = window.WA || {};

(function () {
  function svg(inner) {
    return '<svg class="ic" viewBox="0 0 100 100" aria-hidden="true">' + inner + '</svg>';
  }

  WA.icons = {

    // --- Riffschule: ein großer Fisch mit zwei kleinen ---------------
    fische: svg(
      // zwei kleine Fische im Hintergrund
      '<g fill="#3FA9D9">' +
      '<path d="M18 22 C24 16, 36 16, 40 23 C36 30, 24 30, 18 22 Z"/><path d="M18 22 L10 16 L11 22 L10 28 Z"/>' +
      '<path d="M20 78 C26 72, 38 72, 42 79 C38 86, 26 86, 20 78 Z"/><path d="M20 78 L12 72 L13 78 L12 84 Z"/>' +
      '</g>' +
      // großer Fisch
      '<path d="M38 24 C46 26, 52 32, 55 38 L40 44 Z" fill="#E8913A"/>' +          // Rückenflosse
      '<path d="M36 50 C36 34, 54 26, 70 30 C82 33, 90 41, 92 50 C90 59, 82 67, 70 70 C54 74, 36 66, 36 50 Z" fill="#F4A93F"/>' +
      '<path d="M36 50 L16 34 L21 50 L16 66 Z" fill="#E8913A"/>' +                  // Schwanzflosse
      '<path d="M56 32 C60 40, 60 60, 56 68 C52 66, 49 58, 49 50 C49 42, 52 34, 56 32 Z" fill="#fff" opacity=".65"/>' +
      '<path d="M70 31 C74 40, 74 60, 70 69 C67 67, 65 59, 65 50 C65 41, 67 33, 70 31 Z" fill="#D97C28" opacity=".55"/>' +
      '<path d="M60 62 C68 62, 74 66, 76 70 C70 72, 62 70, 58 66 Z" fill="#E8913A"/>' + // Bauchflosse
      '<circle cx="82" cy="46" r="5.5" fill="#fff"/><circle cx="83" cy="46" r="3" fill="#1B3A4B"/>'
    ),

    // --- Artikel-Lagune: eine Muschel --------------------------------
    muschel: svg(
      '<path d="M50 84 C 20 80, 8 56, 16 36 C 24 22, 38 16, 50 16 C 62 16, 76 22, 84 36 C 92 56, 80 80, 50 84 Z" fill="#F7B9CB"/>' +
      '<g stroke="#DE8AA6" stroke-width="3.5" stroke-linecap="round" fill="none">' +
      '<path d="M50 82 L22 44"/><path d="M50 82 L36 26"/><path d="M50 82 L50 18"/><path d="M50 82 L64 26"/><path d="M50 82 L78 44"/>' +
      '</g>' +
      '<path d="M50 84 C 34 82, 24 74, 19 62 C 30 66, 40 68, 50 68 C 60 68, 70 66, 81 62 C 76 74, 66 82, 50 84 Z" fill="#FDD9E3" opacity=".75"/>' +
      '<circle cx="50" cy="82" r="7" fill="#FFF3F6"/><circle cx="48" cy="80" r="2.4" fill="#fff"/>' +   // Perle am Scharnier
      '<path d="M30 30 C36 22, 44 18, 50 17" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>'
    ),

    // --- Silben-Strömung: Wellen mit Luftblasen -----------------------
    wellen: svg(
      '<g fill="none" stroke-linecap="round" stroke-width="9">' +
      '<path d="M12 32 q 9.5 -10 19 0 t 19 0 t 19 0 t 19 0" stroke="#A7E2F5"/>' +
      '<path d="M12 52 q 9.5 -10 19 0 t 19 0 t 19 0 t 19 0" stroke="#3FA9D9"/>' +
      '<path d="M12 72 q 9.5 -10 19 0 t 19 0 t 19 0 t 19 0" stroke="#0C7A8C"/>' +
      '</g>' +
      '<circle cx="74" cy="20" r="8" fill="#fff" opacity=".85"/><circle cx="71" cy="17" r="2.6" fill="#EAF7FC"/>' +
      '<circle cx="26" cy="88" r="5.5" fill="#fff" opacity=".8"/>'
    ),

    // --- Schatztruhe -------------------------------------------------
    truhe: svg(
      // Münzen, die hinter dem Deckel hervorschauen
      '<g fill="#F5CE58" stroke="#D9A62F" stroke-width="2.5">' +
      '<circle cx="26" cy="30" r="7.5"/><circle cx="74" cy="30" r="7.5"/>' +
      '<circle cx="38" cy="22" r="7.5"/><circle cx="62" cy="22" r="7.5"/><circle cx="50" cy="16" r="8.5"/>' +
      '</g>' +
      // gewölbter Deckel
      '<path d="M12 54 C12 32, 28 20, 50 20 C72 20, 88 32, 88 54 Z" fill="#B87B33"/>' +
      '<path d="M12 54 C12 32, 28 20, 50 20 C54 20, 58 20.4, 61 21.2 C43 26, 34 39, 32 54 Z" fill="#CE9145"/>' +
      '<path d="M50 20 C 50 20, 50 36, 50 54" stroke="#8D5A22" stroke-width="2" opacity=".45" fill="none"/>' +
      // Kasten mit Holzfugen
      '<rect x="12" y="54" width="76" height="28" rx="5" fill="#A9702F"/>' +
      '<g stroke="#8D5A22" stroke-width="2" opacity=".5"><path d="M34 56 L34 80"/><path d="M66 56 L66 80"/></g>' +
      '<rect x="12" y="74" width="76" height="8" rx="4" fill="#8D5A22"/>' +
      // Beschläge und Schloss
      '<rect x="10" y="50" width="80" height="8" rx="4" fill="#F2C14E"/>' +
      '<rect x="42" y="48" width="16" height="18" rx="4" fill="#F2C14E" stroke="#C8991F" stroke-width="2"/>' +
      '<circle cx="50" cy="55" r="2.8" fill="#7A5A12"/><path d="M50 56 L50 61" stroke="#7A5A12" stroke-width="2.6" stroke-linecap="round"/>'
    ),

    // --- Tiefsee-Mix: freundlicher Laternenfisch -----------------------
    anglerfisch: svg(
      '<circle cx="54" cy="16" r="15" fill="#FFE26B" opacity=".3"/>' +                 // Leuchtschein
      '<path d="M36 40 C 30 24, 40 12, 54 14" stroke="#2E3B7A" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="54" cy="14" r="8" fill="#FFE26B"/><circle cx="51" cy="11" r="2.6" fill="#FFF8D6"/>' +
      '<path d="M22 60 C22 44, 36 36, 52 36 C 68 36, 80 45, 80 60 C 80 73, 68 82, 52 82 C 36 82, 22 74, 22 60 Z" fill="#4457A8"/>' +
      '<path d="M80 60 L94 47 L90 60 L94 73 Z" fill="#33418B"/>' +                      // Schwanz
      '<path d="M30 72 C 40 80, 62 82, 76 74 C 66 82, 40 84, 30 72 Z" fill="#6E7ECB"/>' + // heller Bauch
      '<path d="M50 38 C 58 40, 64 44, 66 49 C 58 48, 52 45, 50 38 Z" fill="#33418B"/>' + // Rückenflosse
      '<circle cx="38" cy="54" r="8" fill="#fff"/><circle cx="39" cy="54" r="4.2" fill="#1B2350"/><circle cx="41" cy="51.5" r="1.6" fill="#fff"/>' +
      '<path d="M28 66 Q35 72, 43 68" stroke="#1B2350" stroke-width="3.5" fill="none" stroke-linecap="round"/>'  // Lächeln
    ),

    /* ---------- Abzeichen ---------- */

    // Erster Tauchgang: aufsteigende Luftblasen
    blasen: svg(
      '<g fill="#BDE7F7" stroke="#3FA9D9" stroke-width="4">' +
      '<circle cx="38" cy="70" r="18"/><circle cx="66" cy="42" r="13"/><circle cx="46" cy="24" r="8"/>' +
      '</g>' +
      '<circle cx="31" cy="63" r="5" fill="#fff"/><circle cx="61" cy="37" r="3.4" fill="#fff"/>'
    ),

    // Makellose Perle
    perle: svg(
      '<circle cx="50" cy="54" r="32" fill="#C9B6CF"/>' +
      '<circle cx="48" cy="51" r="27" fill="#F1E6EF"/>' +
      '<circle cx="40" cy="42" r="9" fill="#fff"/>' +
      '<path d="M80 18 L83 27 L92 30 L83 33 L80 42 L77 33 L68 30 L77 27 Z" fill="#FFD966"/>'
    ),

    // Wellenreiter: Wellenkamm
    welle: svg(
      '<path d="M10 66 C 10 38, 34 20, 58 26 C 76 31, 86 46, 81 59 C 77 70, 63 73, 57 64 ' +
      'C 66 62, 69 53, 63 46 C 52 34, 30 43, 26 64 Z" fill="#3FA9D9"/>' +
      '<path d="M58 26 C 70 29, 78 36, 81 45 C 74 38, 66 33, 56 32 Z" fill="#fff" opacity=".8"/>' +
      '<path d="M8 80 q 11 -10 21 0 t 21 0 t 21 0 t 21 0" fill="none" stroke="#0C7A8C" stroke-width="8" stroke-linecap="round"/>'
    ),

    // 100 Perlen: geöffnete Auster
    auster: svg(
      '<circle cx="50" cy="32" r="19" fill="#CDBACF"/><circle cx="48.5" cy="30" r="16" fill="#F7EFF6"/><circle cx="44" cy="25" r="5.7" fill="#fff"/>' +
      '<circle cx="30" cy="64" r="19" fill="#CDBACF"/><circle cx="28.5" cy="62" r="16" fill="#F7EFF6"/><circle cx="24" cy="57" r="5.7" fill="#fff"/>' +
      '<circle cx="70" cy="64" r="19" fill="#CDBACF"/><circle cx="68.5" cy="62" r="16" fill="#F7EFF6"/><circle cx="64" cy="57" r="5.7" fill="#fff"/>'
    ),

    // 500 Perlen: Seestern
    seestern: svg(
      '<path d="M50 14 L60 40 L88 42 L66 59 L74 86 L50 71 L26 86 L34 59 L12 42 L40 40 Z" ' +
      'fill="#F2766B" stroke="#F2766B" stroke-width="8" stroke-linejoin="round"/>' +
      '<g fill="#FFB7AE"><circle cx="50" cy="38" r="4"/><circle cx="62" cy="55" r="3.6"/>' +
      '<circle cx="38" cy="55" r="3.6"/><circle cx="43" cy="70" r="3.2"/><circle cx="57" cy="70" r="3.2"/></g>'
    ),

    // 1000 Perlen: Wal
    wal: svg(
      // Wasserfontäne als Tropfen
      '<g fill="#A6E0F5"><circle cx="37" cy="12" r="7"/><circle cx="26" cy="19" r="4.5"/><circle cx="48" cy="16" r="5"/></g>' +
      // große Schwanzfluke
      '<path d="M72 54 C 80 44, 88 32, 95 21 C 99 34, 98 48, 92 55 C 98 63, 99 78, 96 91 C 88 80, 79 66, 72 58 Z" fill="#3A76B0"/>' +
      // Körper
      '<path d="M8 56 C 8 36, 28 26, 51 26 C 67 26, 78 34, 80 47 C 82 62, 72 78, 46 80 C 24 82, 8 72, 8 56 Z" fill="#4A8FD0"/>' +
      // heller Bauch
      '<path d="M13 64 C 30 79, 63 77, 79 59 C 76 77, 48 86, 30 81 C 22 79, 16 71, 13 64 Z" fill="#C4E2F7"/>' +
      // Brustflosse
      '<path d="M36 72 C 42 84, 55 87, 62 83 C 53 78, 45 73, 41 68 Z" fill="#3A76B0"/>' +
      '<circle cx="24" cy="50" r="5" fill="#1B3A4B"/><circle cx="25.8" cy="48.2" r="1.8" fill="#fff"/>' +
      '<path d="M12 61 Q21 69, 31 64" stroke="#1B3A4B" stroke-width="3.2" fill="none" stroke-linecap="round"/>'
    ),

    // Stammtaucher: Taucherbrille
    taucherbrille: svg(
      // Kopfband
      '<path d="M14 42 L2 36" stroke="#E0574C" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M86 42 L98 36" stroke="#E0574C" stroke-width="9" stroke-linecap="round"/>' +
      // Rahmen mit Nasenteil
      '<rect x="41" y="62" width="18" height="16" rx="7" fill="#F2766B"/>' +
      '<rect x="10" y="26" width="80" height="42" rx="18" fill="#F2766B"/>' +
      // Sichtgläser
      '<ellipse cx="32" cy="46" rx="16" ry="13.5" fill="#5FC0E3"/>' +
      '<ellipse cx="68" cy="46" rx="16" ry="13.5" fill="#5FC0E3"/>' +
      '<rect x="46" y="43" width="8" height="6" rx="3" fill="#E0574C"/>' +
      '<path d="M23 41 C 26 36, 32 34, 37 35" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M59 41 C 62 36, 68 34, 73 35" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"/>'
    ),

    // Riffentdecker: Kompass
    kompass: svg(
      '<circle cx="50" cy="50" r="38" fill="#0C7A8C"/>' +
      '<circle cx="50" cy="50" r="30" fill="#EAF7FC"/>' +
      '<g fill="#fff"><rect x="47" y="8" width="6" height="9" rx="3"/><rect x="47" y="83" width="6" height="9" rx="3"/>' +
      '<rect x="83" y="47" width="9" height="6" rx="3"/><rect x="8" y="47" width="9" height="6" rx="3"/></g>' +
      '<path d="M50 22 L59 50 L50 56 L41 50 Z" fill="#E04A44"/>' +
      '<path d="M50 78 L41 50 L50 44 L59 50 Z" fill="#96AEBA"/>' +
      '<circle cx="50" cy="50" r="5" fill="#0C7A8C"/>'
    ),

    // Wortdelfin
    delfin: svg(
      '<path d="M20 68 L3 55 L9 70 L2 88 Z" fill="#3A76B0"/>' +                      // Schwanzfluke
      '<path d="M42 32 C 47 16, 58 9, 67 12 C 57 20, 50 29, 48 38 Z" fill="#3A76B0"/>' + // hohe Rückenfinne
      '<ellipse cx="48" cy="56" rx="32" ry="16" fill="#4A8FD0" transform="rotate(-16 48 56)"/>' +
      '<path d="M74 38 C 84 33, 93 28, 99 25 C 97 31, 93 37, 86 42 C 82 44, 78 45, 75 45 Z" fill="#4A8FD0"/>' + // langer Schnabel
      '<path d="M24 66 C 38 79, 64 74, 82 48 C 80 68, 56 82, 38 78 C 30 76, 26 72, 24 66 Z" fill="#C4E2F7"/>' +
      '<path d="M44 66 C 48 78, 58 84, 65 81 C 57 75, 52 69, 49 63 Z" fill="#3A76B0"/>' +  // Brustflosse
      '<circle cx="70" cy="45" r="4" fill="#1B3A4B"/><circle cx="71.4" cy="43.6" r="1.5" fill="#fff"/>' +
      '<path d="M76 48 Q82 50, 87 46" stroke="#1B3A4B" stroke-width="3" fill="none" stroke-linecap="round"/>'
    ),

    // Noch nicht erreichtes Abzeichen
    schloss: svg(
      '<path d="M33 46 V36 a17 17 0 0 1 34 0 V46" fill="none" stroke="#A7BAC6" stroke-width="9" stroke-linecap="round"/>' +
      '<rect x="24" y="44" width="52" height="40" rx="9" fill="#BCCDD8"/>' +
      '<circle cx="50" cy="60" r="6" fill="#7E93A1"/>' +
      '<path d="M50 62 V72" stroke="#7E93A1" stroke-width="6" stroke-linecap="round"/>'
    ),

    /* ---------- Bedienelemente (nehmen die Textfarbe an) ---------- */

    zahnrad: svg(
      '<g stroke="currentColor" stroke-width="11" stroke-linecap="round">' +
      '<path d="M50 9 V23"/><path d="M50 9 V23" transform="rotate(45 50 50)"/>' +
      '<path d="M50 9 V23" transform="rotate(90 50 50)"/><path d="M50 9 V23" transform="rotate(135 50 50)"/>' +
      '<path d="M50 9 V23" transform="rotate(180 50 50)"/><path d="M50 9 V23" transform="rotate(225 50 50)"/>' +
      '<path d="M50 9 V23" transform="rotate(270 50 50)"/><path d="M50 9 V23" transform="rotate(315 50 50)"/>' +
      '</g>' +
      '<circle cx="50" cy="50" r="21" fill="none" stroke="currentColor" stroke-width="12"/>'
    ),

    lautsprecher: svg(
      '<path d="M14 38 H32 L50 22 V78 L32 62 H14 Z" fill="currentColor" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M62 36 a 20 20 0 0 1 0 28" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M76 24 a 34 34 0 0 1 0 52" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>'
    ),

    lautsprecher_aus: svg(
      '<path d="M14 38 H32 L50 22 V78 L32 62 H14 Z" fill="currentColor" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M64 38 L90 64 M90 38 L64 64" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>'
    ),

    schliessen: svg(
      '<path d="M28 28 L72 72 M72 28 L28 72" stroke="currentColor" stroke-width="11" stroke-linecap="round"/>'
    ),

    zurueck: svg(
      '<path d="M58 22 L30 50 L58 78" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
    ),

    // Mein Fortschritt: Balken mit Luftblase
    fortschritt: svg(
      '<rect x="14" y="58" width="18" height="30" rx="6" fill="#A7E2F5"/>' +
      '<rect x="41" y="40" width="18" height="48" rx="6" fill="#3FA9D9"/>' +
      '<rect x="68" y="20" width="18" height="68" rx="6" fill="#0C7A8C"/>' +
      '<circle cx="77" cy="10" r="7" fill="#F2766B"/>'
    ),

    // Klassenziel: Fischschwarm, alle in eine Richtung
    schwarm: svg(
      '<g fill="#3FA9D9">' +
      '<path d="M30 30 C 37 22, 51 22, 56 30 C 51 38, 37 38, 30 30 Z"/><path d="M30 30 L19 22 L21 30 L19 38 Z"/>' +
      '<path d="M30 70 C 37 62, 51 62, 56 70 C 51 78, 37 78, 30 70 Z"/><path d="M30 70 L19 62 L21 70 L19 78 Z"/>' +
      '</g>' +
      '<g fill="#0C7A8C">' +
      '<path d="M56 50 C 65 40, 83 40, 90 50 C 83 60, 65 60, 56 50 Z"/><path d="M56 50 L42 40 L45 50 L42 60 Z"/>' +
      '</g>' +
      '<circle cx="80" cy="47" r="3.4" fill="#fff"/>'
    ),

    // Erreichtes Klassenziel
    pokal: svg(
      '<path d="M26 20 H74 V40 C74 56, 64 66, 50 66 C36 66, 26 56, 26 40 Z" fill="#F2C14E"/>' +
      '<path d="M26 26 H16 a12 12 0 0 0 12 20" fill="none" stroke="#F2C14E" stroke-width="7"/>' +
      '<path d="M74 26 H84 a12 12 0 0 1 -12 20" fill="none" stroke="#F2C14E" stroke-width="7"/>' +
      '<rect x="42" y="64" width="16" height="14" rx="3" fill="#D9A62F"/>' +
      '<rect x="28" y="78" width="44" height="10" rx="5" fill="#D9A62F"/>' +
      '<circle cx="50" cy="40" r="11" fill="#FFF3D1"/><circle cx="46" cy="36" r="3.4" fill="#fff"/>'
    )
  };
})();
