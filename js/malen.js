/* ==========================================================
   Perlentaucher – Malen: Speicherformat und Zeichnen

   Zwei Arten von Bildern:
     art 'raster'  16 × 16 Felder. Gespeichert in "px": ein Zeichen
                   je Feld, Punkt = leer, sonst der Platz in
                   WA.config.malen.farben (0–9, A–V).
     art 'frei'    Freihand auf weißem Blatt. Gespeichert in
                   "striche" als Zeichenkette:
                   "!" + Farbe(1) + Breite(1) + Punkte(je 4 Zeichen)
                   Die Punkte liegen in einem Raster von 0 bis 1023,
                   sind also von der Bildschirmgröße unabhängig.

   Diese Datei wird von der Kinder-App und vom Lehrerbereich benutzt.
   ========================================================== */
window.WA = window.WA || {};

(function () {
  'use strict';
  var A = '0123456789ABCDEFGHIJKLMNOPQRSTUV';   // 32 Zeichen
  var RAUM = 1024;                              // internes Koordinatenraster

  function zeichenFuer(n) {
    n = Math.max(0, Math.min(RAUM - 1, Math.round(n)));
    return A.charAt(Math.floor(n / 32)) + A.charAt(n % 32);
  }
  function wertAb(s, i) { return A.indexOf(s.charAt(i)) * 32 + A.indexOf(s.charAt(i + 1)); }

  function punkt(x, y) { return zeichenFuer(x) + zeichenFuer(y); }
  function strichAnfang(farbe, breite) { return '!' + A.charAt(farbe) + A.charAt(breite); }

  // Zeichenkette in eine Liste von Strichen zerlegen
  function striche(text) {
    var teile = String(text || '').split('!'), out = [];
    for (var i = 1; i < teile.length; i++) {
      var t = teile[i];
      if (t.length < 6) continue;                       // Kopf + mindestens ein Punkt
      var st = { farbe: A.indexOf(t.charAt(0)), breite: A.indexOf(t.charAt(1)), punkte: [] };
      for (var j = 2; j + 4 <= t.length; j += 4) st.punkte.push([wertAb(t, j), wertAb(t, j + 2)]);
      if (st.punkte.length) out.push(st);
    }
    return out;
  }

  // Den letzten Strich entfernen
  function ohneLetztenStrich(text) {
    var i = String(text || '').lastIndexOf('!');
    return i < 0 ? '' : text.substring(0, i);
  }

  function farbwert(i) {
    var f = WA.config.malen.farben;
    return f[i] || f[1] || '#000000';
  }

  // Ein freies Bild auf einen Zeichenbereich malen
  function freiAuf(ctx, bild, px, nurAb) {
    var k = px / RAUM, liste = striche(bild.striche);
    if (!nurAb) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, px, px); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    liste.slice(nurAb || 0).forEach(function (st) {
      ctx.strokeStyle = farbwert(st.farbe);
      ctx.lineWidth = Math.max(1, (WA.config.malen.breiten[st.breite] || 6) * k);
      ctx.beginPath();
      st.punkte.forEach(function (p, i) {
        if (i) ctx.lineTo(p[0] * k, p[1] * k); else ctx.moveTo(p[0] * k, p[1] * k);
      });
      if (st.punkte.length === 1) ctx.lineTo(st.punkte[0][0] * k + 0.1, st.punkte[0][1] * k);
      ctx.stroke();
    });
  }

  // Ein Rasterbild auf einen Zeichenbereich malen
  function rasterAuf(ctx, bild, px) {
    var g = bild.g || 16, k = px / g;
    ctx.fillStyle = '#DCEAF2'; ctx.fillRect(0, 0, px, px);
    for (var i = 0; i < bild.px.length; i++) {
      var z = bild.px.charAt(i);
      if (z === '.') continue;
      ctx.fillStyle = farbwert(A.indexOf(z));
      ctx.fillRect((i % g) * k, Math.floor(i / g) * k, k, k);
    }
  }

  function aufZeichenflaeche(ctx, bild, px) {
    if (bild.art === 'frei') freiAuf(ctx, bild, px);
    else rasterAuf(ctx, bild, px);
  }

  // Kleines Vorschaubild als Bilddatei im Speicher
  function vorschau(bild, px) {
    px = px || 96;
    var c = document.createElement('canvas');
    c.width = px; c.height = px;
    aufZeichenflaeche(c.getContext('2d'), bild, px);
    return c.toDataURL();
  }

  WA.malen = {
    A: A, RAUM: RAUM,
    punkt: punkt, strichAnfang: strichAnfang, striche: striche,
    ohneLetztenStrich: ohneLetztenStrich, farbwert: farbwert,
    freiAuf: freiAuf, rasterAuf: rasterAuf,
    aufZeichenflaeche: aufZeichenflaeche, vorschau: vorschau
  };
})();
