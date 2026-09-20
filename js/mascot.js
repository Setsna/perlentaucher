/* ==========================================================
   Maskottchen "Otti" – ein Oktopus (eigene SVG-Zeichnung)
   Stimmungen: happy, cheer, sad, think
   ========================================================== */
window.WA = window.WA || {};

WA.mascot = function (mood, size) {
  mood = mood || 'happy';
  size = size || 96;

  var BODY = '#F2766B', DARK = '#D4554A', SUCK = '#FFC9C0';

  // --- Arme (8 Stück). Die hinteren werden dunkler gezeichnet. ---
  var backArms = [
    'M50 116 C 22 138, 10 168, 26 188',
    'M150 116 C 178 138, 190 168, 174 188',
    'M68 132 C 46 154, 40 180, 56 192',
    'M132 132 C 154 154, 160 180, 144 192'
  ];
  if (mood === 'cheer') {                       // jubelnd: die äußeren Arme nach oben
    backArms[0] = 'M50 116 C 22 100, 12 66, 26 46';
    backArms[1] = 'M150 116 C 178 100, 188 66, 174 46';
  }
  var frontArms = [
    'M84 140 C 72 164, 70 184, 84 194',
    'M116 140 C 128 164, 130 184, 116 194',
    'M95 143 C 86 168, 88 188, 98 196',
    'M105 143 C 114 168, 112 188, 102 196'
  ];

  var arms = backArms.map(function (d) {
    return '<path d="' + d + '" fill="none" stroke="' + DARK + '" stroke-width="15" stroke-linecap="round"/>';
  }).join('') + frontArms.map(function (d) {
    return '<path d="' + d + '" fill="none" stroke="' + BODY + '" stroke-width="14" stroke-linecap="round"/>' +
           '<path d="' + d + '" fill="none" stroke="' + SUCK + '" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="0.5 11"/>';
  }).join('');

  // --- Gesicht ---
  var eyes, mouth, brows = '';
  if (mood === 'cheer') {
    eyes = '<path d="M62 100 Q76 82 90 100" stroke="#12343F" stroke-width="7" fill="none" stroke-linecap="round"/>' +
           '<path d="M110 100 Q124 82 138 100" stroke="#12343F" stroke-width="7" fill="none" stroke-linecap="round"/>';
    mouth = '<path d="M82 126 Q100 156 118 126 Z" fill="#8C2F33"/>' +
            '<path d="M91 142 Q100 151 109 142 Q100 137 91 142 Z" fill="#FFA8A0"/>';
  } else if (mood === 'sad') {
    eyes = '<circle cx="76" cy="98" r="19" fill="#fff"/><circle cx="124" cy="98" r="19" fill="#fff"/>' +
           '<circle cx="76" cy="103" r="8" fill="#12343F"/><circle cx="124" cy="103" r="8" fill="#12343F"/>' +
           '<circle cx="79" cy="100" r="2.6" fill="#fff"/><circle cx="127" cy="100" r="2.6" fill="#fff"/>';
    mouth = '<path d="M86 140 Q100 126 114 140" stroke="#12343F" stroke-width="5.5" fill="none" stroke-linecap="round"/>';
    brows = '<path d="M58 76 L92 86" stroke="' + DARK + '" stroke-width="6" stroke-linecap="round"/>' +
            '<path d="M142 76 L108 86" stroke="' + DARK + '" stroke-width="6" stroke-linecap="round"/>';
  } else if (mood === 'think') {
    eyes = '<circle cx="76" cy="98" r="19" fill="#fff"/><circle cx="124" cy="98" r="19" fill="#fff"/>' +
           '<circle cx="83" cy="94" r="8.5" fill="#12343F"/><circle cx="131" cy="94" r="8.5" fill="#12343F"/>' +
           '<circle cx="86" cy="91" r="2.8" fill="#fff"/><circle cx="134" cy="91" r="2.8" fill="#fff"/>';
    mouth = '<path d="M90 134 L112 130" stroke="#12343F" stroke-width="5.5" fill="none" stroke-linecap="round"/>';
    brows = '<path d="M58 72 L92 76" stroke="' + DARK + '" stroke-width="6" stroke-linecap="round"/>';
  } else { // happy
    eyes = '<circle cx="76" cy="98" r="19" fill="#fff"/><circle cx="124" cy="98" r="19" fill="#fff"/>' +
           '<circle cx="76" cy="98" r="9" fill="#12343F"/><circle cx="124" cy="98" r="9" fill="#12343F"/>' +
           '<circle cx="79" cy="94" r="3" fill="#fff"/><circle cx="127" cy="94" r="3" fill="#fff"/>';
    mouth = '<path d="M86 128 Q100 146 114 128" stroke="#12343F" stroke-width="5.5" fill="none" stroke-linecap="round"/>';
  }

  return '<svg class="mascot" viewBox="0 0 200 200" width="' + size + '" height="' + size + '" role="img" aria-label="Otti, der Oktopus">' +
    arms +
    // Mantel (Kopf)
    '<path d="M34 104 C 34 50, 62 22, 100 22 C 138 22, 166 50, 166 104 C 166 138, 138 156, 100 156 C 62 156, 34 138, 34 104 Z" fill="' + BODY + '"/>' +
    // Glanzlicht oben links
    '<ellipse cx="72" cy="52" rx="20" ry="13" fill="#fff" opacity=".28" transform="rotate(-24 72 52)"/>' +
    // Wangen
    '<ellipse cx="50" cy="118" rx="11" ry="8" fill="' + DARK + '" opacity=".45"/>' +
    '<ellipse cx="150" cy="118" rx="11" ry="8" fill="' + DARK + '" opacity=".45"/>' +
    brows + eyes + mouth +
    '</svg>';
};
