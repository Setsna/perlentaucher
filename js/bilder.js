/* ==========================================================
   Perlentaucher – Grafiken zum Beschriften

   Jede Grafik ist eine selbst gezeichnete Vektorzeichnung. Sie
   steht hier im Code, nicht in der Datenbank: so kostet sie keinen
   Speicher, bleibt auf jedem Bildschirm scharf und es gibt keine
   Lizenzfragen.

   Aufbau:
     seiten   Zeichenfläche der Grafik (viewBox)
     svg      der Inhalt, ohne das <svg>-Element drumherum
     punkte   die beschriftbaren Stellen, in sinnvoller Reihenfolge
              x und y in Prozent der Zeichenfläche (0 … 100)

   Beim Zeichnen gilt: Jede beschriftbare Stelle muss groß genug
   und farblich unterscheidbar sein, und der Punkt sitzt an ihrem
   Rand – nicht mittendrauf, sonst verdeckt die Nummer genau das,
   was das Kind erkennen soll.

   Die Kennungen der Verläufe müssen über alle Grafiken hinweg
   eindeutig sein (Präfix je Grafik), sonst färben sich Bilder um,
   wenn zwei davon auf einer Seite stehen.

   Die ids der Punkte sind fest. Wer sie ändert, zerreißt die
   Zuordnung in gespeicherten Aufgaben.

   Neue Grafik anlegen: Eintrag hier ergänzen, danach steht sie im
   Lehrerbereich unter "Bild beschriften" zur Auswahl.
   ========================================================== */
window.WA = window.WA || {};

(function () {
  'use strict';

  WA.grafiken = {

    /* ---------- Die brennende Kerze ---------- */
    kerze: {
      titel: 'Brennende Kerze',
      seiten: '0 0 200 340',
      svg:
        '<defs>' +
        '<radialGradient id="kzSchein" cx=".5" cy=".5" r=".5">' +
          '<stop offset="0" stop-color="#FFD166" stop-opacity=".5"/>' +
          '<stop offset=".55" stop-color="#FFB03A" stop-opacity=".15"/>' +
          '<stop offset="1" stop-color="#FF9A2E" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="kzWachs" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#D3B88E"/><stop offset=".15" stop-color="#F3E5CB"/>' +
          '<stop offset=".42" stop-color="#FFFCF4"/><stop offset=".78" stop-color="#EAD7B4"/>' +
          '<stop offset="1" stop-color="#C4A67D"/></linearGradient>' +
        '<linearGradient id="kzFlamme" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0" stop-color="#FF6F12"/><stop offset=".42" stop-color="#FFA92B"/>' +
          '<stop offset="1" stop-color="#FFDC55"/></linearGradient>' +
        '<linearGradient id="kzKern" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0" stop-color="#8FBEEB"/><stop offset=".3" stop-color="#FFF3B0"/>' +
          '<stop offset="1" stop-color="#FFFDF0"/></linearGradient>' +
        '</defs>' +
        // Lichtschein
        '<ellipse cx="100" cy="62" rx="82" ry="100" fill="url(#kzSchein)"/>' +
        // Schatten auf dem Tisch
        '<ellipse cx="100" cy="325" rx="76" ry="11" fill="#C6B7A0" opacity=".38"/>' +
        // Kerzenkörper
        '<path d="M66 134 h68 v180 a10 10 0 0 1 -10 10 h-48 a10 10 0 0 1 -10 -10 Z" fill="url(#kzWachs)"/>' +
        // heruntergelaufenes Wachs
        '<path d="M71 141 q-5 28 2 48 q8 -22 4 -48 Z" fill="#FFFDF6" opacity=".85"/>' +
        '<path d="M124 143 q8 20 1 35 q-9 -16 -7 -35 Z" fill="#FFFDF6" opacity=".6"/>' +
        '<path d="M99 139 q3 16 0 27 q-4 -12 -2 -27 Z" fill="#FFFDF6" opacity=".45"/>' +
        // Wachssee oben
        '<ellipse cx="100" cy="134" rx="34" ry="11.5" fill="#FBF1DE"/>' +
        '<ellipse cx="100" cy="135.5" rx="26" ry="8" fill="#DEBE7E"/>' +
        '<ellipse cx="104" cy="134" rx="12" ry="3.4" fill="#F9EDD2" opacity=".85"/>' +
        // Docht
        '<path d="M100 133 C98 120 102 106 100 88" stroke="#3C2F28" stroke-width="5.5" ' +
          'stroke-linecap="round" fill="none"/>' +
        // Flamme
        '<path d="M100 8 C126 46 130 72 121 86 C113 99 87 99 79 86 C70 72 74 46 100 8 Z" fill="url(#kzFlamme)"/>' +
        '<path d="M100 40 C113 62 115 76 110 84 C105 92 95 92 90 84 C85 76 87 62 100 40 Z" fill="url(#kzKern)"/>',
      punkte: [
        { id: 'flamme',   x: 43, y: 15.3, label: 'Flamme' },
        { id: 'docht',    x: 57, y: 34,   label: 'Docht' },
        { id: 'fluessig', x: 43, y: 40.2, label: 'flüssiges Wachs' },
        { id: 'wachs',    x: 50, y: 71,   label: 'festes Wachs' }
      ]
    },

    /* ---------- Das Feuerdreieck ---------- */
    feuerdreieck: {
      titel: 'Das Feuerdreieck',
      seiten: '0 0 300 270',
      svg:
        '<defs>' +
        '<linearGradient id="fdFlaeche" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#FFE9CE"/></linearGradient>' +
        '<linearGradient id="fdRand" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F08A2B"/><stop offset="1" stop-color="#D9531A"/></linearGradient>' +
        '<radialGradient id="fdSchein" cx=".5" cy=".5" r=".5">' +
          '<stop offset="0" stop-color="#FFC24D" stop-opacity=".55"/>' +
          '<stop offset="1" stop-color="#FFB03A" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="fdFlamme" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0" stop-color="#FF6F12"/><stop offset=".45" stop-color="#FFA92B"/>' +
          '<stop offset="1" stop-color="#FFDC55"/></linearGradient>' +
        '<linearGradient id="fdHolz" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#C98F55"/><stop offset="1" stop-color="#9A6534"/></linearGradient>' +
        '<linearGradient id="fdLuft" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#8FD8F2"/><stop offset="1" stop-color="#2FA6D8"/></linearGradient>' +
        '</defs>' +
        // Dreieck
        '<path d="M150 26 L268 236 H32 Z" fill="url(#fdFlaeche)" stroke="url(#fdRand)" ' +
          'stroke-width="9" stroke-linejoin="round"/>' +
        // Feuer in der Mitte
        '<circle cx="150" cy="150" r="46" fill="url(#fdSchein)"/>' +
        '<path d="M150 112 C167 140 170 157 165 168 C159 180 141 180 135 168 C130 157 133 140 150 112 Z" fill="url(#fdFlamme)"/>' +
        '<path d="M150 134 C159 153 161 162 158 168 C155 174 145 174 142 168 C139 162 141 153 150 134 Z" fill="#FFF3B0"/>' +
        // Wärme: Thermometer
        '<g>' +
        '<rect x="141" y="44" width="18" height="42" rx="9" fill="#FFFFFF" stroke="#7A4F27" stroke-width="3"/>' +
        '<rect x="145.5" y="56" width="9" height="30" fill="#E23B3B"/>' +
        '<path d="M161 54 h6 M161 62 h6 M161 70 h6" stroke="#7A4F27" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="150" cy="93" r="15" fill="#E23B3B" stroke="#7A4F27" stroke-width="3"/>' +
        '<circle cx="145" cy="88" r="4" fill="#FF9A96" opacity=".9"/>' +
        '</g>' +
        // Brennstoff: zwei Holzscheite
        '<g>' +
        '<g transform="rotate(-13 92 200)">' +
          '<rect x="66" y="191" width="52" height="19" rx="9.5" fill="url(#fdHolz)" stroke="#6F4520" stroke-width="2.6"/>' +
          '<ellipse cx="112" cy="200.5" rx="5" ry="8.5" fill="#E3B888" stroke="#6F4520" stroke-width="2.2"/>' +
          '<ellipse cx="112" cy="200.5" rx="2" ry="4" fill="#B98955"/>' +
        '</g>' +
        '<g transform="rotate(10 90 219)">' +
          '<rect x="62" y="209" width="56" height="19" rx="9.5" fill="#B87F46" stroke="#6F4520" stroke-width="2.6"/>' +
          '<ellipse cx="112" cy="218.5" rx="5" ry="8.5" fill="#EBC79B" stroke="#6F4520" stroke-width="2.2"/>' +
          '<ellipse cx="112" cy="218.5" rx="2" ry="4" fill="#C49363"/>' +
        '</g>' +
        '</g>' +
        // Sauerstoff: Luftstrom
        '<g fill="none" stroke="url(#fdLuft)" stroke-width="6.5" stroke-linecap="round">' +
        '<path d="M182 194 h36 a11 11 0 1 0 -11 -11"/>' +
        '<path d="M180 210 h50 a11 11 0 1 1 -11 11"/>' +
        '<path d="M188 226 h28"/>' +
        '</g>',
      punkte: [
        { id: 'waerme',     x: 50,   y: 21.5, label: 'Wärme' },
        { id: 'brennstoff', x: 30,   y: 77,   label: 'Brennstoff' },
        { id: 'sauerstoff', x: 76.5, y: 74.5, label: 'Sauerstoff' }
      ]
    },

    /* ---------- Streichholz und Schachtel ---------- */
    streichholz: {
      titel: 'Streichholz und Schachtel',
      seiten: '0 0 300 190',
      svg:
        '<defs>' +
        '<linearGradient id="shPappe" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F3E6CF"/><stop offset="1" stop-color="#DCC49F"/></linearGradient>' +
        '<linearGradient id="shReibe" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#7C6A5C"/><stop offset=".5" stop-color="#57483D"/>' +
          '<stop offset="1" stop-color="#6B5A4E"/></linearGradient>' +
        '<linearGradient id="shHolz" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F0D9B4"/><stop offset=".5" stop-color="#DCBB8C"/>' +
          '<stop offset="1" stop-color="#BF9A68"/></linearGradient>' +
        '<radialGradient id="shKopf" cx=".38" cy=".32" r=".75">' +
          '<stop offset="0" stop-color="#F58A80"/><stop offset=".45" stop-color="#DC4A3E"/>' +
          '<stop offset="1" stop-color="#A32B22"/></radialGradient>' +
        '</defs>' +
        // Schatten
        '<ellipse cx="82" cy="166" rx="66" ry="8" fill="#B9A78C" opacity=".35"/>' +
        '<ellipse cx="205" cy="164" rx="52" ry="7" fill="#B9A78C" opacity=".28"/>' +
        // Schachtel
        '<rect x="20" y="92" width="124" height="70" rx="9" fill="url(#shPappe)" stroke="#A98B63" stroke-width="3"/>' +
        '<path d="M20 106 h124" stroke="#C3A87F" stroke-width="2.5"/>' +
        // Reibefläche
        '<rect x="26" y="114" width="112" height="32" rx="6" fill="url(#shReibe)"/>' +
        '<g fill="#9C8878" opacity=".85">' +
        '<circle cx="36" cy="122" r="1.7"/><circle cx="52" cy="130" r="1.7"/><circle cx="68" cy="120" r="1.7"/>' +
        '<circle cx="84" cy="132" r="1.7"/><circle cx="100" cy="122" r="1.7"/><circle cx="116" cy="131" r="1.7"/>' +
        '<circle cx="44" cy="138" r="1.7"/><circle cx="76" cy="140" r="1.7"/><circle cx="108" cy="139" r="1.7"/>' +
        '<circle cx="128" cy="126" r="1.7"/><circle cx="60" cy="142" r="1.7"/><circle cx="92" cy="117" r="1.7"/>' +
        '</g>' +
        // Streichholz
        '<g transform="rotate(-40 210 116)">' +
        '<rect x="152" y="108" width="112" height="15" rx="7.5" fill="url(#shHolz)" stroke="#B08A5C" stroke-width="2.4"/>' +
        '<path d="M162 114 h88 M166 119 h80" stroke="#C6A277" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>' +
        '<ellipse cx="266" cy="115.5" rx="18" ry="16" fill="url(#shKopf)" stroke="#8E2018" stroke-width="2.6"/>' +
        '<ellipse cx="260" cy="109" rx="5" ry="4" fill="#FFB3A8" opacity=".75"/>' +
        '</g>',
      punkte: [
        { id: 'kopf',  x: 84,   y: 30.5, label: 'Streichholzkopf' },
        { id: 'holz',  x: 72,   y: 65.5, label: 'Holzstiel' },
        { id: 'reibe', x: 19.5, y: 68.5, label: 'Reibefläche' }
      ]
    },

    /* ---------- Die Ausrüstung der Feuerwehr ---------- */
    feuerwehr: {
      titel: 'Ausrüstung der Feuerwehr',
      seiten: '0 0 200 340',
      svg:
        '<defs>' +
        '<linearGradient id="fwJacke" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#1F2A33"/><stop offset=".4" stop-color="#36454F"/>' +
          '<stop offset="1" stop-color="#1B242C"/></linearGradient>' +
        '<linearGradient id="fwHose" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#2B3842"/><stop offset=".45" stop-color="#425260"/>' +
          '<stop offset="1" stop-color="#26313A"/></linearGradient>' +
        '<linearGradient id="fwHelm" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#F4594E"/><stop offset="1" stop-color="#C32B22"/></linearGradient>' +
        '<linearGradient id="fwGlas" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#8FA4B3"/><stop offset=".55" stop-color="#4E606E"/>' +
          '<stop offset="1" stop-color="#6D8090"/></linearGradient>' +
        '<linearGradient id="fwStiefel" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="#39434C"/><stop offset="1" stop-color="#1B2026"/></linearGradient>' +
        '</defs>' +
        // Bodenschatten
        '<ellipse cx="100" cy="322" rx="72" ry="10" fill="#A9BCC6" opacity=".45"/>' +
        // Stiefel
        '<path d="M60 284 h36 v26 a8 8 0 0 1 -8 8 H68 a8 8 0 0 1 -8 -8 Z" fill="url(#fwStiefel)"/>' +
        '<path d="M104 284 h36 v26 a8 8 0 0 1 -8 8 h-20 a8 8 0 0 1 -8 -8 Z" fill="url(#fwStiefel)"/>' +
        '<path d="M58 312 h40 M102 312 h40" stroke="#0F1317" stroke-width="6" stroke-linecap="round"/>' +
        // Hose
        '<path d="M62 192 h76 v92 a6 6 0 0 1 -6 6 h-26 a6 6 0 0 1 -6 -6 v-44 h-4 v44 a6 6 0 0 1 -6 6 H68 a6 6 0 0 1 -6 -6 Z" ' +
          'fill="url(#fwHose)"/>' +
        '<rect x="62" y="252" width="34" height="9" fill="#F7E04B"/>' +
        '<rect x="104" y="252" width="34" height="9" fill="#F7E04B"/>' +
        '<rect x="62" y="263" width="34" height="5" fill="#D8DEE3"/>' +
        '<rect x="104" y="263" width="34" height="5" fill="#D8DEE3"/>' +
        // Jacke
        '<path d="M58 104 q42 -18 84 0 v82 a8 8 0 0 1 -8 8 H66 a8 8 0 0 1 -8 -8 Z" fill="url(#fwJacke)"/>' +
        '<path d="M100 96 v98" stroke="#131B21" stroke-width="2.5"/>' +
        '<rect x="58" y="150" width="84" height="11" fill="#F7E04B"/>' +
        '<rect x="58" y="163" width="84" height="6" fill="#D8DEE3"/>' +
        // Arme
        '<path d="M62 112 L42 178" stroke="#36454F" stroke-width="24" stroke-linecap="round"/>' +
        '<path d="M138 112 L158 178" stroke="#36454F" stroke-width="24" stroke-linecap="round"/>' +
        '<path d="M48 158 L38 176" stroke="#F7E04B" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M152 158 L162 176" stroke="#F7E04B" stroke-width="7" stroke-linecap="round"/>' +
        // Handschuhe
        '<path d="M22 186 a17 17 0 0 1 34 0 a17 17 0 0 1 -34 0 Z" fill="#5A4636" stroke="#332619" stroke-width="3"/>' +
        '<path d="M144 186 a17 17 0 0 1 34 0 a17 17 0 0 1 -34 0 Z" fill="#5A4636" stroke="#332619" stroke-width="3"/>' +
        '<path d="M24 178 h30 M146 178 h30" stroke="#7A6249" stroke-width="4" stroke-linecap="round"/>' +
        // Atemschutzmaske
        '<rect x="70" y="52" width="60" height="52" rx="24" fill="#C9D6DE" stroke="#7E8F9C" stroke-width="3"/>' +
        '<rect x="78" y="60" width="44" height="26" rx="13" fill="url(#fwGlas)"/>' +
        '<path d="M85 66 q10 -4 18 0" stroke="#C6D6E2" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".8"/>' +
        '<circle cx="100" cy="95" r="11" fill="#8E9EAA" stroke="#6C7C89" stroke-width="2.5"/>' +
        '<circle cx="100" cy="95" r="4.5" fill="#5E6E7A"/>' +
        // Helm
        '<path d="M56 46 q44 -46 88 0 Z" fill="url(#fwHelm)"/>' +
        '<path d="M74 22 q26 -12 52 6" stroke="#FF9A92" stroke-width="5" stroke-linecap="round" fill="none" opacity=".55"/>' +
        '<path d="M100 10 v30" stroke="#A32B22" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="44" y="42" width="112" height="14" rx="7" fill="url(#fwHelm)" stroke="#A32B22" stroke-width="2.5"/>' +
        '<rect x="88" y="44" width="24" height="10" rx="5" fill="#FBEFA0" stroke="#A32B22" stroke-width="2"/>',
      punkte: [
        { id: 'helm',       x: 27, y: 14,   label: 'Helm' },
        { id: 'maske',      x: 37, y: 21.5, label: 'Atemschutzmaske' },
        { id: 'jacke',      x: 50, y: 38,   label: 'Schutzjacke' },
        { id: 'handschuhe', x: 11, y: 57,   label: 'Handschuhe' },
        { id: 'stiefel',    x: 32, y: 90,   label: 'Stiefel' }
      ]
    }
  };

  /* Alle Grafiken als Liste, für die Auswahl im Lehrerbereich */
  WA.grafikListe = function () {
    return Object.keys(WA.grafiken).map(function (k) {
      return { id: k, titel: WA.grafiken[k].titel, punkte: WA.grafiken[k].punkte.length };
    });
  };

  /* Die Punkte einer Grafik. Mit einer Liste von ids werden nur
     diese genommen – in der Reihenfolge der Grafik. */
  WA.grafikPunkte = function (key, ids) {
    var g = WA.grafiken[key];
    if (!g) return [];
    if (!ids || !ids.length) return g.punkte.slice();
    return g.punkte.filter(function (p) { return ids.indexOf(p.id) >= 0; });
  };

  /* Breite und Höhe der Zeichenfläche. Die Marken sitzen in Prozent
     darin, also muss die Fläche im Seitenverhältnis der Grafik
     stehen – sonst wandern die Punkte vom Bild weg. */
  WA.grafikMasse = function (key) {
    var g = WA.grafiken[key];
    var t = String(g ? g.seiten : '').split(/\s+/);
    return { breite: Number(t[2]) || 100, hoehe: Number(t[3]) || 100 };
  };

  /* Die fertige Zeichnung als SVG-Text */
  WA.grafikSvg = function (key) {
    var g = WA.grafiken[key];
    if (!g) return '';
    return '<svg viewBox="' + g.seiten + '" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="' + g.titel + '">' + g.svg + '</svg>';
  };
})();
