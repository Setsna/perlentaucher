/* ==========================================================
   Perlentaucher – Oberfläche (Startseite, Tauchgang, Ergebnis)
   ========================================================== */
(function () {
  'use strict';
  var C = WA.config, S = WA.store, EX = WA.ex;
  var $app = document.getElementById('app'), $modal = document.getElementById('modal');
  var L = null, view = 'home', timer = null;

  // s == null wird zu '' – sonst steht bei einem fehlenden Feld wörtlich
  // "null" auf dem Bildschirm der Kinder.
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function pct(x) { return Math.round(x * 100); }
  function mmss(ms) { var t = Math.ceil(ms / 1000), m = Math.floor(t / 60), s = t % 60; return m + ':' + ('0' + s).slice(-2); }

  // ---------- Ton & Sprache ----------
  var ac = null;
  function tone(seq) {
    if (!S.state.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var t = ac.currentTime;
      seq.forEach(function (n) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + n[1] + 0.03); t += n[1] * 0.9;
      });
    } catch (e) {}
  }
  var sfx = {
    ok: function () { tone([[660, .12], [880, .2]]); },
    bad: function () { tone([[300, .18], [220, .28]]); },
    win: function () { tone([[523, .12], [659, .12], [784, .12], [1047, .32]]); },
    badge: function () { tone([[784, .1], [988, .1], [1319, .3]]); }
  };
  function speak(t) {
    if (!t || !('speechSynthesis' in window)) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.rate = 0.85; speechSynthesis.speak(u); } catch (e) {}
  }

  // ---------- Bausteine ----------
  function heartsHtml(n, max) {
    var h = '';
    for (var i = 0; i < max; i++) h += '<span class="bub ' + (i < n ? 'full' : 'empty') + '"></span>';
    return h;
  }
  function sylHtml(teile) {
    if (!Array.isArray(teile)) teile = teile.silben;
    return teile.map(function (s, i) { return '<span class="syl s' + (i % 3) + '">' + esc(s) + '</span>'; }).join('<span class="dot">·</span>');
  }
  function ico(k) { return (WA.icons && WA.icons[k]) || k; }
  // Ein Tauchgang gehört entweder zu einem Tauchrevier (Deutsch)
  // oder zu einem Sachthema. Beide haben Titel und Farbe.
  function revier(id) {
    if (C.categories[id]) return C.categories[id];
    if (C.themen && C.themen[id]) return C.themen[id];
    if (istThema(id)) return { title: id, color: '#2E7D32' };
    return { title: '', color: 'var(--brand)' };
  }
  // Ein Thema erkennt man daran, dass es Fragen dazu gibt.
  function istThema(id) {
    if (C.categories[id]) return false;
    if (C.themen && C.themen[id]) return true;
    return (WA.fragen || []).some(function (f) { return f.thema === id; });
  }
  function getWord(id) { return WA.words.filter(function (w) { return w.id === id; })[0]; }
  function bar(p, color) {
    return '<div class="bar"><i style="width:' + pct(p) + '%;background:' + (color || 'var(--brand)') + '"></i></div>';
  }
  function showModal(html) { $modal.innerHTML = '<div class="overlay"><div class="dialog">' + html + '</div></div>'; }
  function closeModal() { $modal.innerHTML = ''; }
  function clearConfetti() { var c = document.querySelectorAll('.confetti'); for (var i = 0; i < c.length; i++) c[i].remove(); }

  function confetti() {                      // aufsteigende Luftblasen statt Konfetti
    var h = '';
    for (var i = 0; i < 30; i++) {
      var sz = 10 + Math.random() * 30;
      h += '<span class="cf" style="left:' + Math.random() * 100 + '%;width:' + sz + 'px;height:' + sz +
        'px;animation-delay:' + Math.random() * 1.2 + 's;animation-duration:' + (2.4 + Math.random() * 1.8) + 's"></span>';
    }
    var d = document.createElement('div'); d.className = 'confetti'; d.innerHTML = h; document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 4800);
  }

  // ==========================================================
  //  SPEICHERZUSTAND
  //  Ein Kind darf nicht in dem Glauben weiterüben, alles sei
  //  gesichert, während in Wirklichkeit nichts ankommt. Der Hinweis
  //  liegt fest am unteren Rand und ist in jeder Ansicht zu sehen.
  // ==========================================================
  var speicherStand = null;

  function speicherAnzeige(s) {
    speicherStand = s;
    var leiste = document.getElementById('sync');
    if (!leiste) {
      leiste = document.createElement('div');
      leiste.id = 'sync';
      document.body.appendChild(leiste);
    }
    if (!s || s.zustand === 'ok' || s.zustand === 'wartet') {
      leiste.className = ''; leiste.innerHTML = '';
      platzSchaffen(false);
      return;
    }
    if (s.zustand === 'wartet-lange') {
      leiste.className = 'sync warten';
      leiste.innerHTML = '<b>Kein Internet.</b> Übe ruhig weiter – deine Perlen werden ' +
        'gespeichert, sobald die Verbindung wieder da ist.';
      platzSchaffen(true);
      return;
    }
    leiste.className = 'sync fehler';
    leiste.innerHTML = '<b>Achtung:</b> Deine Perlen können gerade nicht gespeichert werden. ' +
      'Bitte sag deiner Lehrkraft Bescheid.';
    platzSchaffen(true);
  }

  // Die Leiste liegt fest am unteren Rand. Damit sie den Knopf
  // „Prüfen" im Tauchgang nicht verdeckt, rückt alles nach oben.
  function platzSchaffen(an) {
    var leiste = document.getElementById('sync');
    document.body.classList.toggle('sync-an', !!an);
    document.documentElement.style.setProperty('--synch',
      (an && leiste ? leiste.offsetHeight : 0) + 'px');
  }

  // Der Satz in der Fußzeile der Startseite soll dasselbe sagen.
  function fusstext() {
    if (!(WA.cloud && WA.cloud.angemeldet && WA.cloud.angemeldet())) {
      return 'Übungsmodus – der Spielstand bleibt nur auf diesem Gerät.';
    }
    var z = speicherStand && speicherStand.zustand;
    if (z === 'fehler') return 'Dein Fortschritt kann gerade <b>nicht</b> gespeichert werden.';
    if (z === 'wartet-lange') return 'Dein Fortschritt wird gespeichert, sobald wieder Internet da ist.';
    return 'Dein Fortschritt wird gespeichert und ist auf jedem Gerät da.';
  }

  // ==========================================================
  //  STARTSEITE
  // ==========================================================
  function heartChip() {
    var h = S.hearts();
    return '<span class="bubbles">' + heartsHtml(h.count, h.max) + '</span>' +
      (h.count < h.max ? '<small>+1 in ' + mmss(h.nextMs) + '</small>' : '');
  }

  // Karte auf der Startseite: Malzeit und Zugang zur Sammlung
  function malKarteHtml() {
    if (!C.malen || !C.malen.enabled) return '';
    var rest = S.malRest(), offen = S.malBilder().filter(function (b) { return !b.fertig; })[0];
    var bild = offen ? '<img class="malmini" src="' + vorschau(offen, 64) + '" alt="" width="64" height="64">' : '';
    return '<section class="card malcard' + (rest > 0 ? ' offen' : '') + '">' + bild +
      '<div class="maltext"><b>' + (rest > 0 ? 'Malzeit: ' + mmss(rest * 1000) : 'Malen und Zeichnen') + '</b>' +
      '<small>' + (rest > 0
        ? 'Du darfst malen! Die Zeit läuft nur im Malfeld.'
        : 'Schaffe dein Tagesziel und du bekommst ' + C.malen.minutenProZiel + ' Minuten Malzeit.') +
      '</small></div>' +
      // "Meine Bilder" muss immer erreichbar sein. Vorher führte der
      // einzige Knopf bei übriger Malzeit sofort ins angefangene Bild –
      // an die Sammlung kam das Kind dann gar nicht mehr heran.
      '<div class="malknoepfe">' +
      (rest > 0 && offen ? '<button class="btn mini" data-action="malen">Weitermalen</button>' : '') +
      '<button class="btn' + (rest > 0 && !offen ? '' : ' ghost') + ' mini" data-action="malsammlung">' +
      'Meine Bilder</button></div></section>';
  }

  // ---------- Fächer ----------
  // Die Kinder wählen erst das Fach, dann das Revier bzw. das Thema.
  function fachFortschritt(id) {
    var f = C.faecher[id];
    if (f.art === 'themen') {
      var t = themenVon(id);
      if (!t.length) return 0;
      return t.reduce(function (s, k) { return s + WA.quiz.fortschritt(k); }, 0) / t.length;
    }
    var welten = ['schreibweise', 'artikel', 'silben', 'verstehen'];
    return welten.reduce(function (s, k) { return s + S.worldProgress(k); }, 0) / welten.length;
  }
  // Themen kommen aus der Konfiguration – und zusätzlich aus den
  // Fragen selbst. So entsteht ein neues Thema allein dadurch, dass
  // im Lehrerbereich Fragen dazu angelegt werden.
  function themenVon(fachId) {
    var raus = Object.keys(C.themen || {}).filter(function (k) {
      return C.themen[k].enabled !== false && C.themen[k].fach === fachId;
    });
    if (fachId === 'sachunterricht') {
      (WA.fragen || []).forEach(function (f) {
        if (f.thema && raus.indexOf(f.thema) < 0 && !(C.themen || {})[f.thema]) raus.push(f.thema);
      });
    }
    return raus.filter(function (k) { return WA.quiz.anzahl(k) > 0 || (C.themen || {})[k]; });
  }
  // Für Themen ohne Eintrag in der Konfiguration
  function themaInfo(id) {
    var t = (C.themen || {})[id];
    if (t) return t;
    return { title: id.charAt(0).toUpperCase() + id.slice(1), sub: 'Sachthema',
             icon: 'lupe', color: '#2E7D32' };
  }

  function faecherHtml() {
    return Object.keys(C.faecher).filter(function (k) { return C.faecher[k].enabled; })
      .map(function (k) {
        var f = C.faecher[k], p = fachFortschritt(k);
        return '<button class="fach" style="--wc:' + f.color + '" data-action="fach" data-f="' + k + '">' +
          '<span class="wicon">' + ico(f.icon) + '</span>' +
          '<span class="wtext"><b>' + esc(f.title) + '</b><small>' + esc(f.sub) + '</small>' +
          '<span class="wbar"><i style="width:' + pct(p) + '%"></i></span></span>' +
          '<span class="wpct">' + pct(p) + '%</span></button>';
      }).join('');
  }

  function renderFach(fachId) {
    var f = C.faecher[fachId];
    if (!f) { renderHome(); return; }
    view = 'fach'; L = null; clearInterval(timer); clearConfetti();
    var inhalt, weak = S.weakWords();

    if (f.art === 'themen') {
      var themen = themenVon(fachId);
      inhalt = themen.length
        ? '<section class="worlds">' + themen.map(function (k) {
            var t = themaInfo(k), p = WA.quiz.fortschritt(k), n = WA.quiz.anzahl(k);
            return '<button class="world" style="--wc:' + t.color + '" data-action="startthema" data-t="' + esc(k) + '">' +
              '<span class="wicon">' + ico(t.icon) + '</span>' +
              '<span class="wtext"><b>' + esc(t.title) + '</b><small>' + esc(t.sub) + ' · ' + n + ' Fragen</small>' +
              '<span class="wbar"><i style="width:' + pct(p) + '%"></i></span></span>' +
              '<span class="wpct">' + pct(p) + '%</span></button>';
          }).join('') + '</section>'
        : '<section class="card"><p class="muted">Für dieses Fach gibt es noch keine Themen.</p></section>';
    } else {
      inhalt = '<section class="worlds">' +
        Object.keys(C.categories).filter(function (k) { return C.categories[k].enabled; }).map(function (k) {
          var c = C.categories[k], p = S.worldProgress(k);
          return '<button class="world" style="--wc:' + c.color + '" data-action="start" data-w="' + k + '">' +
            '<span class="wicon">' + ico(c.icon) + '</span>' +
            '<span class="wtext"><b>' + esc(c.title) + '</b><small>' + esc(c.sub) + '</small>' +
            '<span class="wbar"><i style="width:' + pct(p) + '%"></i></span></span>' +
            '<span class="wpct">' + pct(p) + '%</span></button>';
        }).join('') + '</section>' +
        (weak.length ? '<section class="card weak"><h3>Kniffelige Wörter</h3><div class="chips2">' +
          weak.slice(0, 6).map(function (w) { return '<span>' + esc(w.wort) + '</span>'; }).join('') +
          '</div></section>' : '');
    }

    $app.innerHTML = '<div class="page" style="--wc:' + f.color + '">' +
      '<header class="ptop"><button class="icon-btn" data-action="home" aria-label="Zurück">' + ico('zurueck') + '</button>' +
      '<h1>' + esc(f.title) + '</h1></header>' +
      '<p class="fachsub">' + esc(f.sub) + '</p>' + inhalt + '</div>';
    window.scrollTo(0, 0);
  }

  function renderHome() {
    view = 'home'; L = null; clearInterval(timer); clearConfetti();
    var st = S.state, today = S.todayXp(), goal = C.dailyGoalXp, weak = S.weakWords();
    var kind = WA.cloud && WA.cloud.kind && WA.cloud.kind();
    var name = kind ? esc(kind.vorname) : null;
    var msg = st.lessons === 0 ? 'Hallo' + (name ? ' ' + name : '') + '! Ich bin <b>Otti</b>. Wähle ein Fach und starte deinen ersten Tauchgang!'
      : today >= goal ? 'Tagesziel geschafft! Du bist ein echter Tiefseetaucher!'
      : weak.length ? 'Ein paar Wörter sind noch kniffelig. Im <b>Tiefsee-Mix</b> üben wir sie zusammen!'
      : 'Schön, dass du wieder da bist' + (name ? ', ' + name : '') + '! Was tauchen wir heute?';

    var faecher = faecherHtml();

    var week = S.weekDays(), maxw = Math.max(goal, Math.max.apply(null, week.map(function (d) { return d.xp; })));
    var weekHtml = week.map(function (d) {
      return '<div class="wd' + (d.today ? ' today' : '') + '"><div class="wcol"><i style="height:' + Math.max(4, Math.round(d.xp / maxw * 100)) + '%"></i></div><span>' + d.label + '</span></div>';
    }).join('');

    var badges = S.badges.map(function (b) {
      var got = !!st.badges[b.id];
      return '<div class="badge' + (got ? ' got' : '') + '" title="' + esc(b.desc) + '"><span>' + (got ? ico(b.icon) : ico('schloss')) + '</span><b>' + esc(b.title) + '</b><small>' + esc(b.desc) + '</small></div>';
    }).join('');

    var weakHtml = weak.length ? '<section class="card weak"><h3>Kniffelige Wörter</h3><div class="chips2">' +
      weak.slice(0, 6).map(function (w) { return '<span>' + esc(w.wort) + '</span>'; }).join('') + '</div></section>' : '';

    $app.innerHTML =
      '<div class="home">' +
      '<header class="top"><div class="brand">' + WA.mascot('happy', 48) + '<span>Perlen<b>taucher</b></span></div>' +
      '<div class="tools"><div class="pill heartpill" id="heartchip">' + heartChip() + '</div>' +
      '<div class="pill xppill"><span class="pearl"></span> <b>' + st.xp + '</b> Perlen</div>' +
      '<button class="icon-btn" data-action="settings" aria-label="Einstellungen">' + ico('zahnrad') + '</button></div></header>' +
      '<section class="hero">' + WA.mascot(today >= goal ? 'cheer' : 'happy', 120) + '<div class="bubble">' + msg + '</div></section>' +
      '<section class="stats">' +
      '<div class="card stat"><h3>Tagesziel</h3><div class="big">' + Math.min(today, 9999) + ' <small>/ ' + goal + ' Perlen</small></div>' + bar(Math.min(1, today / goal), 'var(--coral)') + '</div>' +
      '<div class="card stat"><h3>Dein Rekord</h3><div class="big">' + ico('perle') + ' ' + st.best.day + ' <small>Perlen an einem Tag</small></div><div class="sub">Bester Tauchgang: <b>' + st.best.lesson + ' Perlen</b></div></div>' +
      '<div class="card stat"><h3>Serie</h3><div class="big">' + ico('welle') + ' ' + st.streakDays + ' <small>' + (st.streakDays === 1 ? 'Tag' : 'Tage') + ' in Folge</small></div><div class="sub">Tauchgänge gesamt: <b>' + st.lessons + '</b></div></div>' +
      '</section>' +
      malKarteHtml() +
      '<section class="navrow">' +
      '<button class="navbtn" data-action="progress"><span class="nic">' + ico('fortschritt') + '</span>' +
      '<span class="ntext"><b>Mein Fortschritt</b><small>Wie gut sitzen deine Wörter?</small></span></button>' +
      '<button class="navbtn" data-action="klasse"><span class="nic">' + ico('schwarm') + '</span>' +
      '<span class="ntext"><b>Klassenziel</b><small>Was die Klasse zusammen schafft</small></span></button>' +
      '</section>' +
      '<h2 class="sec">Was möchtest du üben?</h2><section class="faecher">' + faecher + '</section>' +
      weakHtml +
      '<h2 class="sec">Diese Woche</h2><section class="card week">' + weekHtml + '</section>' +
      '<h2 class="sec">Abzeichen</h2><section class="badges">' + badges + '</section>' +
      '<footer class="foot">' + fusstext() +
      '<br><a class="lehrerlink" href="lehrer.html">Für Lehrkräfte</a></footer></div>';

    timer = setInterval(function () { var el = $('#heartchip'); if (el) el.innerHTML = heartChip(); }, 1000);
    window.scrollTo(0, 0);
  }

  // ==========================================================
  //  ANMELDUNG (nur wenn Firebase aktiv ist)
  // ==========================================================
  function renderLogin(meldung) {
    view = 'login'; clearInterval(timer); clearConfetti();
    $app.innerHTML = '<div class="center"><div class="cardbig login">' +
      WA.mascot(meldung ? 'sad' : 'happy', 140) +
      '<h1>Willkommen beim Perlentaucher</h1>' +
      '<p>Scanne den QR-Code in deinem Hausaufgabenheft. Oder tippe den Code darunter ein.</p>' +
      (meldung ? '<div class="loginfehler">' + esc(meldung) + '</div>' : '') +
      '<input id="codefeld" class="codefeld" type="text" inputmode="text" autocapitalize="characters" ' +
      'autocomplete="off" spellcheck="false" maxlength="9" placeholder="ABCD-2345" aria-label="Zugangscode">' +
      '<button class="btn big wide" data-action="login">Los geht\'s</button>' +
      '<p class="muted klein">Du bleibst angemeldet. Den Code brauchst du nur einmal.</p>' +
      '<a class="lehrerlink" href="lehrer.html">Für Lehrkräfte</a>' +
      '</div></div>';
    var f = $('#codefeld');
    if (f) {
      f.addEventListener('input', function () {
        var v = f.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        f.value = v.length > 4 ? v.slice(0, 4) + '-' + v.slice(4) : v;
      });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter') login(); });
    }
  }

  function login() {
    var f = $('#codefeld');
    if (!f) return;
    var code = f.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 8) { renderLogin('Der Code besteht aus 8 Zeichen.'); return; }
    $app.querySelector('[data-action="login"]').textContent = 'Einen Moment …';
    WA.cloud.anmelden(code).then(boot, function (f2) { renderLogin(String(f2)); });
  }

  // ==========================================================
  //  MEIN FORTSCHRITT
  // ==========================================================
  function ring(p, color, label, sub) {
    var r = 52, c = 2 * Math.PI * r;
    return '<div class="ringwrap"><svg class="ring" viewBox="0 0 120 120" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="52" fill="none" stroke="#D3E8F1" stroke-width="14"/>' +
      '<circle cx="60" cy="60" r="52" fill="none" stroke="' + color + '" stroke-width="14" stroke-linecap="round" ' +
      'stroke-dasharray="' + (c * p).toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 60 60)"/>' +
      '</svg><div class="ringtext"><b>' + label + '</b><small>' + sub + '</small></div></div>';
  }

  function pageTop(title) {
    return '<header class="ptop"><button class="icon-btn" data-action="home" aria-label="Zurück">' + ico('zurueck') + '</button>' +
      '<h1>' + esc(title) + '</h1></header>';
  }

  // ==========================================================
  //  BELOHNUNG: PIXELBILD
  //  Wer das Tagesziel erreicht, bekommt Malzeit. Die Zeit läuft
  //  nur, solange dieses Fenster offen und sichtbar ist.
  // ==========================================================
  var ZEICHEN = WA.malen.A;
  var M = { bild: null, farbe: 4, breite: 1, radierer: false, malt: false,
            letzter: -1, schritte: [], tickAb: 0, wolkeAb: 0,
            strich: null, lx: 0, ly: 0, voll: false };

  function farbe(zeichen) {
    if (zeichen === '.') return null;
    return C.malen.farben[ZEICHEN.indexOf(zeichen)] || null;
  }
  function vorschau(b, px) { return WA.malen.vorschau(b, px); }
  function istFrei(b) { return b && b.art === 'frei'; }

  function malZeit() { return mmss(S.malRest() * 1000); }

  // Die Bilder liegen in einer eigenen Sammlung und werden erst
  // geholt, wenn das Kind sie wirklich anschauen will.
  var bilderDa = false;
  function mitBildern(weiter) {
    if (bilderDa || !(WA.cloud && WA.cloud.angemeldet && WA.cloud.angemeldet())) { bilderDa = true; weiter(); return; }
    clearInterval(timer); clearConfetti();
    $app.innerHTML = '<div class="center"><div class="cardbig">' + WA.mascot('think', 120) +
      '<h1>Deine Bilder werden geholt …</h1></div></div>';
    WA.cloud.bilderLaden().then(function () { bilderDa = true; weiter(); });
  }

  function gitterHtml(b) {
    var out = '', i;
    for (i = 0; i < b.px.length; i++) {
      var f = farbe(b.px.charAt(i));
      out += '<i data-i="' + i + '"' + (f ? ' style="background:' + f + '"' : ' class="leer"') + '></i>';
    }
    return '<div class="malfeld" id="malfeld" style="--g:' + b.g + '">' + out + '</div>';
  }

  function paletteHtml() {
    return C.malen.farben.map(function (f, i) {
      return '<button class="farbknopf' + (!M.radierer && M.farbe === i ? ' an' : '') + '" data-action="farbe" data-i="' + i +
        '" style="--f:' + f + '" aria-label="Farbe ' + (i + 1) + '"></button>';
    }).join('') +
    '<button class="farbknopf radier' + (M.radierer ? ' an' : '') + '" data-action="radierer" aria-label="Radierer"></button>';
  }

  // Palette und Strichbreiten neu zeichnen, ohne die ganze Seite
  // neu aufzubauen – sonst wäre das Bild auf dem Blatt kurz weg.
  function neuePalette() {
    var p = $('.palette'); if (p) p.innerHTML = paletteHtml();
    var b = $('.breiten'); if (b) b.outerHTML = breitenHtml();
  }

  // Strichbreiten (nur beim freien Zeichnen)
  function breitenHtml() {
    var namen = ['dünn', 'mittel', 'dick'];
    return '<div class="breiten">' + C.malen.breiten.map(function (w, i) {
      return '<button class="breitknopf' + (M.breite === i ? ' an' : '') + '" data-action="breite" data-i="' + i +
        '" aria-label="Strich ' + namen[i] + '"><span style="width:' + (w / 2) + 'px;height:' + (w / 2) + 'px"></span></button>';
    }).join('') + '</div>';
  }

  function renderMalen() {
    view = 'malen'; L = null; clearInterval(timer); clearConfetti();
    if (S.malRest() <= 0) { renderSammlung(); return; }
    M.bild = S.malBild();
    if (!M.bild) { renderSammlung(); return; }
    M.schritte = [];
    M.tickAb = Date.now();
    M.wolkeAb = Date.now();
    M.voll = false;
    var frei = istFrei(M.bild);

    $app.innerHTML = '<div class="page malseite">' +
      '<header class="ptop"><button class="icon-btn" data-action="malende" aria-label="Zurück">' + ico('zurueck') + '</button>' +
      '<h1>' + (frei ? 'Dein Bild' : 'Dein Pixelbild') + '</h1>' +
      '<div class="maluhr" id="maluhr">' + malZeit() + '</div></header>' +
      '<p class="malhinweis" id="malhinweis">' + (frei
        ? 'Zeichne mit dem Finger auf das weiße Blatt. Die Zeit läuft nur hier.'
        : 'Tippe auf die Felder oder ziehe mit dem Finger. Die Zeit läuft nur hier.') + '</p>' +
      (frei ? '<canvas class="malblatt" id="malblatt"></canvas>' : gitterHtml(M.bild)) +
      (frei ? breitenHtml() : '') +
      '<div class="palette">' + paletteHtml() + '</div>' +
      '<div class="malknoepfe">' +
      '<button class="btn ghost mini" data-action="malzurueck">Rückgängig</button>' +
      '<button class="btn ghost mini" data-action="malsammlung">Meine Bilder</button>' +
      '<button class="btn mini" data-action="malfertig">Bild ist fertig</button>' +
      '</div></div>';

    if (frei) bindeMalblatt(); else bindeMalfeld();
    timer = setInterval(malTick, 1000);
    window.scrollTo(0, 0);
  }

  // Die Uhr rechnet mit echten Zeitabständen. Wird das Gerät
  // zwischendurch gesperrt, geht trotzdem keine Zeit verloren.
  function malTick() {
    if (document.visibilityState === 'hidden') { M.tickAb = Date.now(); return; }
    var jetzt = Date.now(), weg = Math.round((jetzt - M.tickAb) / 1000);
    if (weg <= 0) return;
    M.tickAb = jetzt;
    var rest = S.malVerbrauchen(weg);
    var u = $('#maluhr'); if (u) u.textContent = malZeit();
    if (jetzt - M.wolkeAb > 20000) { M.wolkeAb = jetzt; wolkeSichern(); }
    if (rest <= 0) { wolkeSichern(); zeitVorbei(); }
  }

  // Zwischenstand in die Datenbank schreiben. Während des Malens
  // nur alle 20 Sekunden, sonst wären es viel zu viele Schreibvorgänge.
  function wolkeSichern() {
    if (WA.cloud && WA.cloud.angemeldet && WA.cloud.angemeldet()) WA.cloud.schreiben();
  }

  function zeitVorbei() {
    clearInterval(timer);
    showModal('<h2>Die Zeit ist um</h2>' + WA.mascot('happy', 110) +
      '<p>Dein Bild ist gespeichert. Beim nächsten Tagesziel geht es weiter!</p>' +
      '<button class="btn big wide" data-action="malsammlung">Meine Bilder</button>' +
      '<button class="btn ghost big wide" data-action="home">Zur Startseite</button>');
  }

  function setzeFeld(i) {
    if (i < 0 || i === M.letzter) return;
    var z = M.radierer ? '.' : ZEICHEN.charAt(M.farbe);
    var vorher = M.bild.px.charAt(i);
    if (!S.malSetzen(M.bild.id, i, z)) { M.letzter = i; return; }
    M.letzter = i;
    if (M.schritte.length > 200) M.schritte.shift();
    M.schritte.push({ i: i, z: vorher });
    var zelle = document.querySelector('#malfeld i[data-i="' + i + '"]');
    if (zelle) {
      var f = farbe(z);
      zelle.className = f ? '' : 'leer';
      zelle.style.background = f || '';
    }
  }

  function feldUnter(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el || el.tagName !== 'I' || !el.parentNode || el.parentNode.id !== 'malfeld') return -1;
    return parseInt(el.getAttribute('data-i'), 10);
  }

  function bindeMalfeld() {
    var feld = $('#malfeld');
    if (!feld) return;
    feld.addEventListener('pointerdown', function (e) {
      M.malt = true; M.letzter = -1;
      feld.setPointerCapture(e.pointerId);
      setzeFeld(feldUnter(e.clientX, e.clientY));
      e.preventDefault();
    });
    feld.addEventListener('pointermove', function (e) {
      if (!M.malt) return;
      setzeFeld(feldUnter(e.clientX, e.clientY));
      e.preventDefault();
    });
    function los() { M.malt = false; M.letzter = -1; }
    feld.addEventListener('pointerup', los);
    feld.addEventListener('pointercancel', los);
    feld.addEventListener('pointerleave', los);
  }

  // ---------- Freies Zeichnen auf weißem Blatt ----------
  // Die Striche werden in einem eigenen Raster von 0 bis 1023
  // gespeichert. Dadurch sieht das Bild auf jedem Gerät gleich aus,
  // egal wie groß das Blatt auf dem Bildschirm gerade ist.
  var blattCtx = null, blattPx = 0;

  function blattAufbauen() {
    var cv = $('#malblatt');
    if (!cv) return null;
    var breite = Math.round(cv.getBoundingClientRect().width);
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(breite * dpr);
    cv.height = cv.width;
    blattPx = cv.width;
    blattCtx = cv.getContext('2d');
    WA.malen.freiAuf(blattCtx, M.bild, blattPx);
    return cv;
  }

  function blattPunkt(cv, x, y) {
    var r = cv.getBoundingClientRect();
    var R = WA.malen.RAUM;
    return [Math.max(0, Math.min(R - 1, (x - r.left) / r.width * R)),
            Math.max(0, Math.min(R - 1, (y - r.top) / r.height * R))];
  }

  function strichMalen(p1, p2, farbeIdx, breiteIdx) {
    if (!blattCtx) return;
    var k = blattPx / WA.malen.RAUM;
    blattCtx.strokeStyle = WA.malen.farbwert(farbeIdx);
    blattCtx.lineWidth = Math.max(1, C.malen.breiten[breiteIdx] * k);
    blattCtx.lineCap = 'round'; blattCtx.lineJoin = 'round';
    blattCtx.beginPath();
    blattCtx.moveTo(p1[0] * k, p1[1] * k);
    blattCtx.lineTo(p2[0] * k, p2[1] * k);
    blattCtx.stroke();
  }

  function aktFarbe() { return M.radierer ? 0 : M.farbe; }       // Radierer = weißer Pinsel
  function aktBreite() { return M.radierer ? C.malen.breiten.length - 1 : M.breite; }

  function bindeMalblatt() {
    var cv = blattAufbauen();
    if (!cv) return;

    cv.addEventListener('pointerdown', function (e) {
      if (M.voll) return;
      M.malt = true;
      cv.setPointerCapture(e.pointerId);
      var p = blattPunkt(cv, e.clientX, e.clientY);
      M.strich = WA.malen.strichAnfang(aktFarbe(), aktBreite()) + WA.malen.punkt(p[0], p[1]);
      M.lx = p[0]; M.ly = p[1];
      strichMalen(p, p, aktFarbe(), aktBreite());
      e.preventDefault();
    });

    cv.addEventListener('pointermove', function (e) {
      if (!M.malt) return;
      var p = blattPunkt(cv, e.clientX, e.clientY);
      // Nur merken, wenn der Finger ein Stück weitergewandert ist.
      // Das hält die gespeicherte Datenmenge klein.
      if (Math.abs(p[0] - M.lx) + Math.abs(p[1] - M.ly) < 5) return;
      strichMalen([M.lx, M.ly], p, aktFarbe(), aktBreite());
      M.strich += WA.malen.punkt(p[0], p[1]);
      M.lx = p[0]; M.ly = p[1];
      e.preventDefault();
    });

    function fertig() {
      if (!M.malt) return;
      M.malt = false;
      if (M.strich && !S.malStrich(M.bild.id, M.strich)) blattVoll();
      M.strich = null;
    }
    cv.addEventListener('pointerup', fertig);
    cv.addEventListener('pointercancel', fertig);
    cv.addEventListener('pointerleave', fertig);
  }

  function blattVoll() {
    M.voll = true;
    var h = $('#malhinweis');
    if (h) h.innerHTML = '<b>Dieses Blatt ist voll.</b> Speichere es als fertig und fang ein neues an.';
  }

  function malZurueck() {
    if (istFrei(M.bild)) {
      if (S.malStrichZurueck(M.bild.id)) { M.voll = false; blattAufbauen(); }
      return;
    }
    var sch = M.schritte.pop();
    if (!sch) return;
    S.malSetzen(M.bild.id, sch.i, sch.z);
    var zelle = document.querySelector('#malfeld i[data-i="' + sch.i + '"]');
    if (zelle) {
      var f = farbe(sch.z);
      zelle.className = f ? '' : 'leer';
      zelle.style.background = f || '';
    }
  }

  function renderSammlung() {
    view = 'sammlung'; L = null; clearInterval(timer); clearConfetti();
    closeModal();
    var bilder = S.malBilder().slice().sort(function (a, b) { return b.ts - a.ts; });
    var rest = S.malRest();

    var karten = bilder.length ? bilder.map(function (b) {
      return '<figure class="malkarte' + (b.fertig ? ' fertig' : '') + (istFrei(b) ? ' frei' : '') + '">' +
        '<img src="' + vorschau(b) + '" alt="' + (istFrei(b) ? 'Zeichnung' : 'Pixelbild') + '" width="96" height="96">' +
        '<figcaption>' + (istFrei(b) ? 'Gezeichnet' : 'Pixel') +
        '<span class="malstatus">' + (b.fertig ? 'fertig' : 'in Arbeit') + '</span></figcaption>' +
        '<div class="malknoepfe">' +
        (b.fertig ? '' : '<button class="btn mini" data-action="malweiter" data-id="' + b.id + '"' +
          (rest > 0 ? '' : ' disabled') + '>Weitermalen</button>') +
        '<button class="btn ghost mini malweg" data-action="malweg" data-id="' + b.id + '"' +
        ' aria-label="Bild wegwerfen">' + ico('papierkorb') + '</button></div>' +
        '</figure>';
    }).join('') : '<p class="muted">Noch kein Bild. Erreiche dein Tagesziel, dann darfst du malen!</p>';

    $app.innerHTML = '<div class="page">' + pageTop('Meine Bilder') +
      '<section class="card malzeit">' +
      (rest > 0
        ? '<b>' + mmss(rest * 1000) + '</b> Malzeit übrig ' +
          '<button class="btn mini" data-action="malen">Weitermalen</button>'
        : 'Keine Malzeit übrig. Erreiche dein Tagesziel, dann bekommst du ' +
          C.malen.minutenProZiel + ' Minuten dazu.') +
      '</section>' +
      '<section class="malgalerie">' + karten + '</section>' +
      (rest > 0 ? '<h2 class="sec">' + (bilder.length ? 'Neu anfangen' : 'Womit möchtest du anfangen?') +
        '</h2><section class="neuwahl">' +
        '<button class="navbtn' + (S.malPlatzFrei('raster') ? '' : ' aus') + '" data-action="malneu" data-art="raster"' +
        (S.malPlatzFrei('raster') ? '' : ' disabled') + '>' +
        '<span class="nic">' + ico('raster') + '</span><span class="ntext"><b>Pixelbild</b>' +
        '<small>16 × 16 Felder anmalen</small></span></button>' +
        '<button class="navbtn' + (S.malPlatzFrei('frei') ? '' : ' aus') + '" data-action="malneu" data-art="frei"' +
        (S.malPlatzFrei('frei') ? '' : ' disabled') + '>' +
        '<span class="nic">' + ico('stift') + '</span><span class="ntext"><b>Frei zeichnen</b>' +
        '<small>weißes Blatt und Pinsel</small></span></button></section>' : '') +
      '</div>';
    window.scrollTo(0, 0);
  }

  function renderProgress() {
    view = 'progress'; L = null; clearInterval(timer); clearConfetti();
    var t = S.totals(), top = S.topWrong(5), st = S.state;

    var worlds = ['schreibweise', 'artikel', 'silben', 'verstehen'].map(function (k) {
      var c = C.categories[k], p = S.worldProgress(k);
      return '<div class="prow2"><span class="pic">' + ico(c.icon) + '</span>' +
        '<span class="pname">' + esc(c.sub) + '</span>' +
        '<span class="pbar">' + bar(p, c.color) + '</span><b>' + pct(p) + '%</b></div>';
    }).join('');

    var topHtml = top.length
      ? '<ol class="tricky">' + top.map(function (x) {
          return '<li><span class="tw">' + esc((x.wort.artikel ? x.wort.artikel + ' ' : '') + x.wort.wort) + '</span>' +
            '<span class="tn">' + x.wrong + (x.wrong === 1 ? ' Fehler' : ' Fehler') + '</span></li>';
        }).join('') + '</ol>' +
        '<button class="btn big wide" data-action="drill">Diese Wörter jetzt üben</button>'
      : '<p class="muted">Noch keine Fehler. Weiter so!</p>';

    var chips = WA.words.map(function (w) {
      var s2 = S.wordState(w.id);
      return '<span class="wchip ' + s2 + '">' + esc(w.wort) + '</span>';
    }).join('');

    $app.innerHTML = '<div class="page">' + pageTop('Mein Fortschritt') +
      '<section class="card accu">' + ring(t.accuracy, 'var(--brand)', pct(t.accuracy) + '%', 'richtig') +
      '<div class="acculist">' +
      '<div><b>' + t.practiced + '</b> von ' + t.words + ' Wörtern geübt</div>' +
      '<div><b>' + t.mastered + '</b> Wörter sitzen sicher</div>' +
      '<div><b>' + t.total + '</b> Aufgaben beantwortet</div>' +
      '<div><b>' + t.ok + '</b> richtig, <b>' + t.wrong + '</b> falsch</div>' +
      '<div><b>' + st.lessons + '</b> Tauchgänge, <b>' + st.xp + '</b> Perlen gesamt</div>' +
      '</div></section>' +
      '<h2 class="sec">Fortschritt je Revier</h2><section class="card">' + worlds + '</section>' +
      '<h2 class="sec">Deine kniffeligsten Wörter</h2><section class="card">' + topHtml + '</section>' +
      '<h2 class="sec">Alle Lernwörter</h2><section class="card">' +
      '<div class="legend"><span class="wchip sicher">sicher</span><span class="wchip ueben">noch üben</span><span class="wchip neu">noch nicht geübt</span></div>' +
      '<div class="wchips">' + chips + '</div></section>' +
      '<footer class="foot">Dein Fortschritt gehört nur dir. Kein anderes Kind sieht diese Seite.</footer></div>';
    window.scrollTo(0, 0);
  }

  // ==========================================================
  //  KLASSENZIEL
  // ==========================================================
  function renderClass() {
    view = 'klasse'; L = null; clearInterval(timer); clearConfetti();
    var K = C.klasse, wk = S.weekInfo();
    var ziel = K.kinder * K.wochenzielProKind;
    var echt = WA.cloud && WA.cloud.angemeldet && WA.cloud.angemeldet();
    var gesamt = echt ? (klassenPerlen === null ? wk.xp : klassenPerlen)
                      : K.demoRestDerKlasse + wk.xp;
    var p = Math.min(1, gesamt / ziel), fertig = gesamt >= ziel;
    var rest = Math.max(0, ziel - gesamt);
    var tage = wk.daysLeft;

    var wochen = (K.demoWochen || []).map(function (w) {
      var geschafft = w.xp >= w.ziel;
      return '<li><span class="wk">' + esc(w.woche) + '</span>' +
        '<span class="wv">' + w.xp + ' / ' + w.ziel + '</span>' +
        '<span class="ws ' + (geschafft ? 'ja' : 'nein') + '">' + (geschafft ? 'geschafft' : 'knapp verpasst') + '</span></li>';
    }).join('');

    $app.innerHTML = '<div class="page">' + pageTop('Klassenziel') +
      (echt ? (klassenPerlen === null ? '<div class="demo">Die Zahlen der Klasse werden geladen …</div>' : '')
            : '<div class="demo">Beispielwerte: Die echten Zahlen der Klasse kommen, sobald die Plattform online ist.</div>') +
      '<section class="card goal">' +
      '<div class="goalhead">' + ico(fertig ? 'pokal' : 'schwarm') + '<div><h2>' + esc(K.name) + ' sammelt zusammen</h2>' +
      '<p class="muted">' + K.kinder + ' Kinder, diese Woche</p></div></div>' +
      '<div class="goalbig"><b>' + gesamt + '</b> <small>von ' + ziel + ' Perlen</small></div>' +
      bar(p, fertig ? 'var(--good)' : 'var(--coral)') +
      '<p class="goalmsg">' + (fertig
        ? 'Geschafft! Die Klasse hat das Wochenziel erreicht.'
        : 'Noch <b>' + rest + '</b> Perlen' + (tage > 0 ? ', und noch <b>' + tage + '</b> ' + (tage === 1 ? 'Tag' : 'Tage') + ' Zeit.' : '. Heute ist der letzte Tag!')) + '</p>' +
      '</section>' +
      '<section class="card mine"><h3>Dein Beitrag diese Woche</h3>' +
      '<div class="big">' + ico('perle') + ' <b>' + wk.xp + '</b> Perlen</div>' +
      '<p class="muted">Jede Perle zählt für die ganze Klasse. Es gibt keine Rangliste, niemand wird verglichen.</p>' +
      '<button class="btn big wide" data-action="home">Perlen sammeln gehen</button></section>' +
      (wochen && !echt ? '<h2 class="sec">Frühere Wochen</h2><section class="card"><ul class="wochen">' + wochen + '</ul></section>' : '') +
      '<footer class="foot">Alle sammeln mit. Jede Perle hilft der ganzen Klasse.</footer></div>';
    window.scrollTo(0, 0);

    if (echt && klassenPerlen === null) {
      WA.cloud.klassenWoche().then(function (n) {
        if (n === null) return;
        klassenPerlen = n;
        if (view === 'klasse') renderClass();
      });
    }
  }

  // ==========================================================
  //  LEKTION
  // ==========================================================
  function startLesson(world, onlyIds) {
    if (S.hearts().count <= 0) { renderNoHearts(world, false); return; }
    beginLesson(world, false, onlyIds);
  }

  function beginLesson(world, practice, onlyIds) {
    var queue = istThema(world) ? WA.quiz.baueTauchgang(world) : EX.buildLesson(world, onlyIds);
    if (!queue.length) {
      showModal('<h2>Noch nichts zum Üben</h2>' + WA.mascot('think', 110) +
        '<p>Für dieses Thema sind noch keine Fragen da.</p>' +
        '<button class="btn big wide" data-action="close">Alles klar</button>');
      renderHome(); return;
    }
    L = { world: world, queue: queue, i: 0, practice: practice, correct: 0, wrong: 0, streak: 0, maxStreak: 0, xp: 0,
          outOfHearts: false, retried: {}, onlyIds: onlyIds };
    prepQ(); renderLesson();
  }

  function prepQ() {
    L.q = L.queue[L.i]; L.sel = null; L.slots = []; L.cuts = {}; L.answered = false; L.res = null;
    L.startZeit = Date.now(); L.antwortZeit = 0;
    for (var i = 0; i < (L.q.blanks || 0); i++) L.slots.push(null);
  }

  /* ---------- Bedenkzeit ----------
     Manche Kinder tippen reflexhaft weiter, ohne die Aufgabe oder die
     Erklärung gelesen zu haben. Deshalb wird der Knopf für ein paar
     Sekunden gesperrt – sichtbar, mit Countdown, damit er nicht kaputt
     wirkt. Einstellbar unter bedenkzeit in js/config.js. */
  function bedenkSoll(phase) {
    var b = C.bedenkzeit || {};
    if (b.enabled === false) return 0;
    var s = phase === 'weiter' ? b.vorWeiter : b.vorAntwort;
    return typeof s === 'number' && s > 0 ? s : 0;
  }

  // Wie viel Zeit ist noch übrig? 0 = der Knopf ist frei.
  function bedenkRest(phase) {
    var soll = bedenkSoll(phase);
    if (!soll) return 0;
    var ab = phase === 'weiter' ? L.antwortZeit : L.startZeit;
    if (!ab) return 0;
    return Math.max(0, soll - (Date.now() - ab) / 1000);
  }

  var denkUhr = null;
  function denkUhrStoppen() { if (denkUhr) { clearTimeout(denkUhr); denkUhr = null; } }
  function denkUhrStarten() {
    denkUhrStoppen();
    var phase = L.answered ? 'weiter' : 'antwort';
    if (bedenkRest(phase) <= 0) return;
    denkUhr = setTimeout(function () {
      denkUhr = null;
      var f = $('#footer');
      if (!f || view !== 'lesson') return;   // Ansicht gewechselt
      f.innerHTML = footerHtml();
      denkUhrStarten();
    }, 200);
  }

  function renderLesson() {
    view = 'lesson'; clearInterval(timer); clearConfetti();
    var c = revier(L.world);
    $app.innerHTML =
      '<div class="lesson" style="--wc:' + c.color + '">' +
      '<div class="ltop"><button class="icon-btn" data-action="quit" aria-label="Beenden">' + ico('schliessen') + '</button>' +
      '<div class="lbar" id="lbar"></div><div class="bubbles small" id="lhearts"></div></div>' +
      '<div class="stage" id="stage"></div><div id="footer"></div></div>';
    updateLesson();
  }

  function updateLesson() {
    var h = S.hearts();
    $('#lbar').innerHTML = bar(L.i / L.queue.length, 'var(--wc)');
    $('#lhearts').innerHTML = L.practice ? '<span class="practice">Üben</span>' : heartsHtml(h.count, h.max);
    $('#stage').innerHTML = stageHtml();
    $('#footer').innerHTML = footerHtml();
    denkUhrStarten();
  }

  function stageHtml() {
    var q = L.q, mood = L.answered ? (L.res.ok ? 'cheer' : 'sad')
      : (q.kind === 'build' || q.kind === 'schild' ? 'think' : 'happy');
    var h = '<div class="prow">' + WA.mascot(mood, 72) + '<div class="bubble q">' + esc(q.prompt) +
      (q.speak ? ' <button class="spk" data-action="speak" aria-label="Vorlesen">' + ico('lautsprecher') + '</button>' : '') + '</div></div>';

    if (q.show && (q.show.emoji || q.show.text)) {
      var w = getWord(q.wordId), txt = q.show.text;
      if (L.answered && q.revealSyllables) txt = null;
      // esc() auch beim Emoji: Das Feld kommt aus dem Lernwort-Formular
      // bzw. aus einem CSV-Import und ist damit fremder Text.
      h += '<div class="show">' + (q.show.emoji ? '<div class="emoji">' + esc(q.show.emoji) + '</div>' : '') +
        (q.show.text ? '<div class="bigword">' + (txt === null ? sylHtml(w) : esc(txt)) + '</div>' : '') + '</div>';
    }
    if (q.hint && C.hinweise !== false) h += '<div class="hint">' + esc(q.hint) + '</div>';
    if (q.sentence) {
      var fill = L.answered ? '<span class="gapword ' + (L.res.ok ? 'ok' : 'no') + '">' + esc(getWord(q.correct).wort) + '</span>' : '<span class="gapword">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>';
      h += '<div class="sentence">' + esc(q.sentence[0]) + fill + esc(q.sentence[1]) + '</div>';
    }

    if (q.kind === 'choice') {
      h += '<div class="opts ' + q.layout + '">' + q.options.map(function (o, i) {
        var cls = 'opt ' + (o.cls || '') + (L.sel === i ? ' sel' : '');
        if (L.answered) {
          var istRichtig = Array.isArray(q.correct) ? q.correct.indexOf(o.value) >= 0 : o.value === q.correct;
          if (istRichtig) cls += ' right'; else if (L.sel === i) cls += ' wrong';
        }
        return '<button class="' + cls + '" data-action="pick" data-i="' + i + '"' + (L.answered ? ' disabled' : '') + '>' + esc(o.label) + '</button>';
      }).join('') + '</div>';
    } else if (q.kind === 'build' && q.stapel) {
      // Reihenfolge: untereinander statt nebeneinander, weil die
      // Bausteine ganze Sätze sind.
      h += '<ol class="stapel">' + L.slots.map(function (ti, idx) {
        var cls = 'stapelplatz' + (ti !== null ? ' voll' : '') +
          (L.answered ? (L.res.ok ? ' ok' : ' no') : '');
        return '<li><button class="' + cls + '" data-action="unslot" data-i="' + idx + '"' +
          (L.answered ? ' disabled' : '') + '>' +
          (ti !== null ? esc(q.tiles[ti]) : '<span class="leerplatz">…</span>') + '</button></li>';
      }).join('') + '</ol>';
      var offen = q.tiles.map(function (t, i) {
        return L.slots.indexOf(i) >= 0 ? '' :
          '<button class="stapelkachel" data-action="tile" data-i="' + i + '"' +
          (L.answered ? ' disabled' : '') + '>' + esc(t) + '</button>';
      }).join('');
      if (offen) h += '<div class="stapelpool">' + offen + '</div>';
    } else if (q.kind === 'schild') {
      // Bild beschriften: nummerierte Stellen im Bild, darunter die
      // Zeilen mit denselben Nummern. Das Kind tippt eine Stelle an
      // und wählt dann den Begriff.
      var richtigAn = function (idx) {
        var ti = L.slots[idx];
        return ti !== null && q.tiles[ti] === q.punkte[idx].label;
      };
      var ma = WA.grafikMasse(q.grafik);
      h += '<div class="schild"><div class="schildbild"><div class="schildflaeche" style="' +
        'aspect-ratio:' + ma.breite + '/' + ma.hoehe + ';' +
        'width:min(100%, calc(42vh * ' + ma.breite + ' / ' + ma.hoehe + '))">' +
        WA.grafikSvg(q.grafik) +
        q.punkte.map(function (p, idx) {
          var cls = 'marke' + (L.sel === idx ? ' aktiv' : '') + (L.slots[idx] !== null ? ' voll' : '');
          if (L.answered) cls += richtigAn(idx) ? ' ok' : ' no';
          return '<button class="' + cls + '" data-action="marke" data-i="' + idx + '"' +
            (L.answered ? ' disabled' : '') +
            ' style="left:' + p.x + '%;top:' + p.y + '%"' +
            ' aria-label="Stelle ' + (idx + 1) + '">' + (idx + 1) + '</button>';
        }).join('') + '</div></div>';
      h += '<ol class="schildliste">' + q.punkte.map(function (p, idx) {
        var ti = L.slots[idx], text;
        var cls = 'schildzeile' + (L.sel === idx ? ' aktiv' : '') + (ti !== null ? ' voll' : '');
        if (L.answered) {
          cls += richtigAn(idx) ? ' ok' : ' no';
          text = richtigAn(idx) ? esc(p.label)
            : (ti !== null ? '<s>' + esc(q.tiles[ti]) + '</s> ' : '') + esc(p.label);
        } else {
          text = ti !== null ? esc(q.tiles[ti]) : '<span class="leerplatz">…</span>';
        }
        return '<li><button class="' + cls + '" data-action="marke" data-i="' + idx + '"' +
          (L.answered ? ' disabled' : '') + '><span class="nr">' + (idx + 1) + '</span>' +
          '<span class="wort">' + text + '</span></button></li>';
      }).join('') + '</ol>';
      var frei = q.tiles.map(function (t, i) {
        return L.slots.indexOf(i) >= 0 ? '' :
          '<button class="stapelkachel" data-action="tile" data-i="' + i + '"' +
          (L.answered ? ' disabled' : '') + '>' + esc(t) + '</button>';
      }).join('');
      if (frei) h += '<div class="stapelpool">' + frei + '</div>';
      h += '</div>';
    } else if (q.kind === 'offen') {
      h += '<div class="offen">' + (L.answered
        ? '<div class="loesungsfeld"><h3>So könnte die Antwort lauten</h3><p>' + esc(q.loesung) + '</p></div>' +
          '<p class="muted">Wusstest du das? Sei ehrlich zu dir selbst – es gibt dafür keine Perlen und du verlierst auch keine Luftblasen.</p>'
        : '<div class="denkfeld">' + WA.mascot('think', 96) +
          '<p>Überlege in Ruhe. Sag die Antwort leise vor dich hin oder zähl sie an den Fingern ab. ' +
          'Wenn du fertig bist, tippe auf <b>Auflösen</b>.</p></div>') + '</div>';
    } else if (q.kind === 'build') {
      var bi = 0;
      h += '<div class="slots">' + q.slots.map(function (s) {
        if (s !== null) return '<span class="slot fixed">' + esc(s) + '</span>';
        var idx = bi++, ti = L.slots[idx];
        var cls = 'slot' + (ti !== null ? ' filled' : '') + (L.answered ? (L.res.ok ? ' ok' : ' no') : '');
        return '<button class="' + cls + (q.sylTiles ? ' wide' : '') + '" data-action="unslot" data-i="' + idx + '"' + (L.answered ? ' disabled' : '') + '>' + (ti !== null ? esc(q.tiles[ti]) : '') + '</button>';
      }).join('') + '</div>';
      h += '<div class="tiles">' + q.tiles.map(function (t, i) {
        var used = L.slots.indexOf(i) >= 0;
        return '<button class="tile' + (used ? ' used' : '') + (q.sylTiles ? ' wide' : '') + '" data-action="tile" data-i="' + i + '"' + (used || L.answered ? ' disabled' : '') + '>' + esc(t) + '</button>';
      }).join('') + '</div>';
    } else if (q.kind === 'cut') {
      if (L.answered) {
        h += '<div class="bigword cutdone">' + sylHtml(q.teile || getWord(q.wordId).silben) + '</div>';
      } else {
        var ls = Array.from(q.word);
        h += '<div class="cutrow">' + ls.map(function (ch, i) {
          return '<span class="cl">' + esc(ch) + '</span>' + (i < ls.length - 1 ?
            '<button class="gap' + (L.cuts[i + 1] ? ' on' : '') + '" data-action="cut" data-i="' + (i + 1) + '" aria-label="Trennstrich"><i></i></button>' : '');
        }).join('') + '</div>';
      }
    }
    return h;
  }

  function isReady() {
    var q = L.q;
    if (q.kind === 'offen') return true;
    if (q.kind === 'choice') return L.sel !== null;
    if (q.kind === 'build' || q.kind === 'schild') return L.slots.every(function (x) { return x !== null; });
    return Object.keys(L.cuts).length > 0;
  }

  var PRAISE = ['Super!', 'Genau!', 'Stark getaucht!', 'Richtig!', 'Prima gemacht!', 'Perlentaucher!', 'Klasse!'];

  // Ein Knopf, der erst nach Ablauf der Bedenkzeit gedrückt werden kann.
  // Die Zahl und der Balken zeigen, dass gewartet wird und nichts klemmt.
  function wartenKnopf(phase, klasse, aktion, text) {
    var rest = bedenkRest(phase), soll = bedenkSoll(phase);
    if (rest <= 0) {
      return '<button class="' + klasse + '" data-action="' + aktion + '">' + esc(text) + '</button>';
    }
    var anteil = Math.min(100, Math.max(0, (1 - rest / soll) * 100));
    // data-action bleibt dran, damit der Knopf an derselben Stelle steht
    // und sich nur der Zustand ändert. Gegen den Klick schützen das
    // disabled und zusätzlich die Prüfung im Klick-Empfänger.
    return '<div class="denkzeit"><div class="denkbalken"><i style="width:' + anteil.toFixed(1) + '%"></i></div>' +
      '<button class="' + klasse + ' off" data-action="' + aktion + '" disabled>' + esc(text) +
      ' <span class="denkzahl">' + Math.ceil(rest) + '</span></button></div>';
  }

  function footerHtml() {
    if (!L.answered) {
      var ok = isReady();
      var wort = L.q.kind === 'offen' ? 'Auflösen' : 'Prüfen';
      if (!ok) {
        return '<div class="footer"><button class="btn big off" data-action="check" disabled>' + wort + '</button></div>';
      }
      return '<div class="footer">' + wartenKnopf('antwort', 'btn big', 'check', wort) + '</div>';
    }
    // Merkfrage: das Kind schätzt sich selbst ein.
    if (L.q.kind === 'offen') {
      var restM = bedenkRest('weiter');
      if (restM > 0) {
        var anteilM = Math.min(100, Math.max(0, (1 - restM / bedenkSoll('weiter')) * 100));
        return '<div class="footer"><div class="fb"><b>Lies erst die Lösung.</b></div>' +
          '<div class="denkzeit"><div class="denkbalken"><i style="width:' + anteilM.toFixed(1) + '%"></i></div>' +
          '<button class="btn good big off" data-action="selbst" data-ok="1" disabled>Wusste ich ' +
          '<span class="denkzahl">' + Math.ceil(restM) + '</span></button>' +
          '<button class="btn ghost big off" data-action="selbst" data-ok="0" disabled>Noch nicht</button>' +
          '</div></div>';
      }
      return '<div class="footer"><div class="fb"><b>Wusstest du das?</b></div>' +
        '<button class="btn good big" data-action="selbst" data-ok="1">Wusste ich</button>' +
        '<button class="btn ghost big" data-action="selbst" data-ok="0">Noch nicht</button></div>';
    }
    // Im Sachunterricht steht hinter jeder Frage eine kurze Erklärung.
    // Die ist der eigentliche Lerneffekt und wird immer gezeigt.
    var erkl = L.q.erklaerung ? '<span class="erkl">' + esc(L.q.erklaerung) + '</span>' : '';
    if (L.res.ok) {
      var x = L.res.xp;
      return '<div class="footer good"><div class="fb"><b>' + (L.streak >= C.xp.streakBonusFrom ? L.streak + ' in Folge!' : PRAISE[Math.floor(Math.random() * PRAISE.length)]) + '</b>' +
        (x.total ? '<span class="xpgain">+' + x.total + ' Perlen' + (x.bonus ? ' <small>(Serien-Bonus +' + x.bonus + ')</small>' : '') + '</span>' : '') +
        erkl + '</div>' +
        wartenKnopf('weiter', 'btn good big', 'next', 'Weiter') + '</div>';
    }
    // Beim Beschriften zählt jede Stelle einzeln. Die richtige Lösung
    // steht schon in den Zeilen, deshalb hier nur die Bilanz.
    var t = L.res.teil;
    if (t) {
      var gx = L.res.xp;
      return '<div class="footer bad"><div class="fb"><b>' +
        (t.richtig * 2 >= t.gesamt ? 'Fast!' : 'Nicht ganz.') + '</b> <span class="sol">' +
        t.richtig + ' von ' + t.gesamt + ' sitzen.</span>' +
        (gx.total ? '<span class="xpgain">+' + gx.total + ' Perlen</span>' : '') +
        erkl + '</div>' +
        wartenKnopf('weiter', 'btn bad big', 'next', 'Weiter') + '</div>';
    }
    return '<div class="footer bad"><div class="fb"><b>Nicht ganz.</b> Richtig ist: <span class="sol">' + esc(L.q.solutionText) + '</span>' +
      erkl + '</div>' +
      wartenKnopf('weiter', 'btn bad big', 'next', 'Weiter') + '</div>';
  }

  function check() {
    var q = L.q, ok, teil = null;

    // Bei der Merkfrage entscheidet nicht das Programm, sondern das
    // Kind selbst – deshalb wird hier nur aufgelöst.
    if (q.kind === 'offen') {
      L.answered = true; L.antwortZeit = Date.now();
      L.res = { ok: null, xp: { base: 0, bonus: 0, total: 0 } };
      updateLesson();
      return;
    }

    // Manche Fragen haben mehr als eine richtige Antwort –
    // zum Beispiel, wenn zwei Notrufnummern gelten.
    if (q.kind === 'choice') {
      var gewaehlt = q.options[L.sel].value;
      ok = Array.isArray(q.correct) ? q.correct.indexOf(gewaehlt) >= 0 : gewaehlt === q.correct;
    }
    else if (q.kind === 'build') ok = q.assemble(L.slots.map(function (i) { return q.tiles[i]; })) === q.answerWord;
    else if (q.kind === 'schild') {
      // Hier wird jede einzelne Stelle gezählt, nicht nur alles oder nichts.
      var sitzen = 0;
      L.slots.forEach(function (ti, idx) {
        if (ti !== null && q.tiles[ti] === q.punkte[idx].label) sitzen++;
      });
      teil = { richtig: sitzen, gesamt: q.punkte.length };
      ok = sitzen === q.punkte.length;
    }
    else {
      var a = Object.keys(L.cuts).map(Number).sort(function (x, y) { return x - y; }).join(',');
      ok = a === q.solution.join(',');
    }
    L.answered = true; L.antwortZeit = Date.now();
    var xp = { base: 0, bonus: 0, total: 0 };
    S.recordAnswer(q.wordId, q.cat, ok);
    if (ok) {
      L.correct++; L.streak++; L.maxStreak = Math.max(L.maxStreak, L.streak);
      if (!L.practice) { xp = EX.xpFor(q, L.streak); S.addXp(xp.total); L.xp += xp.total; }
      sfx.ok();
    } else {
      L.wrong++; L.streak = 0; sfx.bad();
      // Teilwertung: Wer die meisten Stellen trifft, bekommt anteilig
      // Perlen und behält seine Luftblase. Nur wer weniger als den
      // eingestellten Anteil schafft, verliert eine.
      var anteil = teil && teil.gesamt ? teil.richtig / teil.gesamt : 0;
      var teilwertung = teil && (C.quiz || {}).teilpunkte !== false;
      if (teilwertung && teil.richtig > 0 && !L.practice) {
        var voll = EX.xpFor(q, 0);
        var perlen = Math.round(voll.base * anteil);
        if (perlen > 0) { xp = { base: perlen, bonus: 0, total: perlen }; S.addXp(perlen); L.xp += perlen; }
      }
      var schont = teilwertung && anteil >= ((C.quiz || {}).luftblaseAbAnteil != null ? C.quiz.luftblaseAbAnteil : 0.5);
      if (!L.practice && !schont) {
        S.loseHeart();
        if (S.hearts().count <= 0) L.outOfHearts = true;
      }
      if (!L.retried[q.wordId] && L.queue.length < C.lessonLength * 2) {    // falsche Aufgabe kommt später noch einmal
        L.retried[q.wordId] = true;
        L.queue.push(q.quelle === 'quiz'
          ? WA.quiz.frageMitId(q.wordId)
          : EX.makeQuestion(q.type, getWord(q.wordId)));
      }
    }
    L.res = { ok: ok, xp: xp, teil: teil };
    updateLesson();
  }

  function next() {
    if (L.outOfHearts && !L.practice) { renderNoHearts(L.world, true); return; }
    L.i++;
    if (L.i >= L.queue.length) { finish(); return; }
    prepQ(); updateLesson(); window.scrollTo(0, 0);
  }

  // ---------- Keine Luftblasen mehr ----------
  function renderNoHearts(world, mid) {
    view = 'nohearts'; clearInterval(timer);
    var h = S.hearts();
    $app.innerHTML = '<div class="center"><div class="cardbig">' + WA.mascot('sad', 140) +
      '<h1>Deine Luftblasen sind leer</h1>' +
      '<p>Otti muss kurz auftauchen. Eine neue Luftblase kommt in <b id="nh">' + mmss(h.nextMs) + '</b> Minuten.</p>' +
      (C.hearts.allowPracticeAtZero ? '<button class="btn big" data-action="practice" data-w="' + world + '" data-mid="' + (mid ? 1 : 0) + '">Ohne Luftblasen weiterüben (keine Perlen)</button>' : '') +
      '<button class="btn ghost big" data-action="home">Zur Startseite</button></div></div>';
    timer = setInterval(function () {
      var hh = S.hearts(), el = $('#nh');
      if (hh.count > 0) { clearInterval(timer); if (!mid) startLesson(world); else renderHome(); return; }
      if (el) el.textContent = mmss(hh.nextMs);
    }, 1000);
  }

  // ---------- Ergebnis ----------
  function finish() {
    var perfect = L.wrong === 0 && !L.practice;
    if (!L.practice) {
      var bonus = C.xp.completeBonus + (perfect ? C.xp.perfectLessonBonus : 0);
      S.addXp(bonus); L.xp += bonus; L.bonus = bonus;
    }
    var fresh = S.finishLesson({ world: L.world, xp: L.xp, perfect: perfect, maxStreak: L.maxStreak, practice: L.practice });
    var malzeit = S.malFrisch();        // eben freigeschaltete Malzeit
    view = 'result'; clearInterval(timer);
    var total = L.correct + L.wrong, acc = total ? Math.round(L.correct / total * 100) : 0;
    $app.innerHTML = '<div class="center"><div class="cardbig">' + WA.mascot(acc >= 60 ? 'cheer' : 'happy', 150) +
      '<h1>' + (perfect ? 'Makellos!' : acc >= 60 ? 'Tauchgang geschafft!' : 'Weiter so!') + '</h1>' +
      '<div class="res"><div><b>+' + L.xp + '</b><small>Perlen</small></div><div><b>' + acc + '%</b><small>richtig</small></div><div><b>' + L.maxStreak + '</b><small>längste Serie</small></div></div>' +
      (L.practice ? '<p class="muted">Im Übungsmodus gibt es keine Perlen.</p>' : '') +
      (fresh.length ? '<div class="newbadges"><h3>Neues Abzeichen!</h3>' + fresh.map(function (b) { return '<div class="badge got big"><span>' + ico(b.icon) + '</span><b>' + esc(b.title) + '</b><small>' + esc(b.desc) + '</small></div>'; }).join('') + '</div>' : '') +
      (malzeit ? '<div class="malbelohnung"><h3>Tagesziel geschafft!</h3>' +
        '<p>Du hast <b>' + Math.round(malzeit / 60) + ' Minuten</b> Malzeit bekommen. Du darfst malen oder zeichnen.</p>' +
        '<button class="btn big wide" data-action="malen">Jetzt malen</button></div>' : '') +
      '<button class="btn big" data-action="again" data-w="' + L.world + '">Nochmal tauchen</button>' +
      '<button class="btn ghost big" data-action="home">Zur Startseite</button></div></div>';
    if (acc >= 60) { confetti(); sfx.win(); }
    if (fresh.length) setTimeout(sfx.badge, 700);
  }

  // ---------- Einstellungen ----------
  function settings() {
    showModal('<h2>Einstellungen</h2>' +
      '<button class="btn big wide" data-action="sound">Ton: ' + (S.state.sound ? 'an ' + ico('lautsprecher') : 'aus ' + ico('lautsprecher_aus')) + '</button>' +
      '<button class="btn ghost big wide" data-action="refill">Luftblasen auffüllen (nur Prototyp)</button>' +
      ((WA.cloud && WA.cloud.angemeldet && WA.cloud.angemeldet())
        ? '<button class="btn ghost big wide" data-action="logout">Abmelden (für ein anderes Kind)</button>'
        : '<button class="btn ghost big wide danger" data-action="reset">Spielstand löschen</button>') +
      '<button class="btn big wide" data-action="close">Fertig</button>');
  }

  // ==========================================================
  //  EREIGNISSE
  // ==========================================================
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t || t.disabled) return;
    var a = t.getAttribute('data-action'), i = parseInt(t.getAttribute('data-i'), 10), w = t.getAttribute('data-w');
    switch (a) {
      case 'start': startLesson(w); break;
      case 'fach': renderFach(t.getAttribute('data-f')); break;
      case 'startthema': startLesson(t.getAttribute('data-t')); break;
      case 'progress': renderProgress(); break;
      case 'login': login(); break;
      case 'malen': closeModal(); mitBildern(renderMalen); break;
      case 'malsammlung': wolkeSichern(); mitBildern(renderSammlung); break;
      case 'malende': wolkeSichern(); renderHome(); break;
      case 'malneu': if (S.malNeu(t.getAttribute('data-art'))) renderMalen(); break;
      case 'breite': M.breite = i; M.radierer = false; neuePalette(); break;
      case 'malweiter': if (S.malWaehlen(parseInt(t.getAttribute('data-id'), 10))) renderMalen(); break;
      case 'malweg':
        var wegId = parseInt(t.getAttribute('data-id'), 10);
        var wegBild = S.malBilder().filter(function (x) { return x.id === wegId; })[0];
        if (!wegBild) break;
        showModal('<h2>Bild wegwerfen?</h2>' +
          '<img class="wegbild" src="' + vorschau(wegBild) + '" alt="" width="120" height="120">' +
          '<p>Das Bild ist dann für immer weg. Du kannst es nicht zurückholen.</p>' +
          '<button class="btn bad big wide" data-action="malwegja" data-id="' + wegId + '">Ja, wegwerfen</button>' +
          '<button class="btn ghost big wide" data-action="close">Behalten</button>');
        break;
      case 'malwegja':
        S.malLoeschen(parseInt(t.getAttribute('data-id'), 10));
        closeModal(); wolkeSichern(); renderSammlung();
        break;
      case 'malzurueck': malZurueck(); break;
      case 'malfertig':
        showModal('<h2>Bild fertig?</h2><p>Fertige Bilder kommen in deine Sammlung. ' +
          'Danach kannst du sie nicht mehr verändern.</p>' +
          '<button class="btn big wide" data-action="malfertigja">Ja, fertig</button>' +
          '<button class="btn ghost big wide" data-action="close">Weitermalen</button>');
        break;
      case 'malfertigja':
        S.malFertig(M.bild.id); closeModal(); wolkeSichern(); renderSammlung();
        break;
      case 'farbe': M.farbe = i; M.radierer = false; neuePalette(); break;
      case 'radierer': M.radierer = true; neuePalette(); break;
      case 'logout':
        closeModal();
        WA.cloud.abmelden().then(function () { location.reload(); });
        break;
      case 'klasse': renderClass(); break;
      case 'drill':
        var ids = S.topWrong(5).map(function (x) { return x.wort.id; });
        if (ids.length) startLesson('gemischt', ids);
        break;
      case 'again': startLesson(w); break;
      case 'home': renderHome(); break;
      case 'practice': if (t.getAttribute('data-mid') === '1') { L.practice = true; L.outOfHearts = false; renderLesson(); next(); } else beginLesson(w, true); break;
      case 'settings': settings(); break;
      case 'close': closeModal(); break;
      case 'sound': S.setSound(!S.state.sound); settings(); break;
      case 'refill': S.refillHearts(); closeModal(); renderHome(); break;
      case 'reset':
        if (t.getAttribute('data-sure')) { S.reset(); closeModal(); renderHome(); }
        else { t.setAttribute('data-sure', '1'); t.textContent = 'Wirklich alles löschen? Nochmal tippen.'; }
        break;
      case 'quit':
        showModal('<h2>Tauchgang beenden?</h2><p>Deine bisherigen Perlen bleiben erhalten.</p>' +
          '<button class="btn big wide" data-action="close">Weiterüben</button><button class="btn ghost big wide" data-action="quitok">Beenden</button>');
        break;
      case 'quitok': closeModal(); renderHome(); break;
      case 'speak': speak(L.q.speak); break;
      case 'pick': if (!L.answered) { L.sel = i; updateLesson(); } break;
      case 'tile':
        if (!L.answered && L.slots.indexOf(i) < 0) {
          // Beim Beschriften zählt die vorher angetippte Stelle,
          // sonst geht der Baustein auf den nächsten freien Platz.
          var ziel = (L.q.kind === 'schild' && L.sel !== null && L.slots[L.sel] === null)
            ? L.sel : L.slots.indexOf(null);
          if (ziel >= 0) { L.slots[ziel] = i; if (L.q.kind === 'schild') L.sel = null; updateLesson(); }
        }
        break;
      case 'marke':
        if (!L.answered) {
          if (L.slots[i] !== null) { L.slots[i] = null; L.sel = i; }   // Begriff wieder abnehmen
          else L.sel = (L.sel === i ? null : i);
          updateLesson();
        }
        break;
      case 'unslot': if (!L.answered && L.slots[i] !== null) { L.slots[i] = null; updateLesson(); } break;
      case 'cut': if (!L.answered) { if (L.cuts[i]) delete L.cuts[i]; else L.cuts[i] = true; updateLesson(); } break;
      case 'check': if (!L.answered && isReady() && bedenkRest('antwort') <= 0) check(); break;
      case 'selbst':
        if (L.answered && L.q.kind === 'offen' && bedenkRest('weiter') <= 0) {
          var wusste = t.getAttribute('data-ok') === '1';
          S.recordAnswer(L.q.wordId, L.q.cat, wusste);
          if (wusste) { L.correct++; sfx.ok(); } else { L.wrong++; sfx.bad(); }
          next();
        }
        break;
      case 'next': if (L.answered && bedenkRest('weiter') <= 0) next(); break;
    }
  });

  // Doppeltipp-Zoom auf iOS verhindern
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  var klassenPerlen = null;

  function boot() {
    klassenPerlen = null;
    if (WA.cloud && WA.cloud.onSpeicher) {
      WA.cloud.onSpeicher(function (s) {
        speicherAnzeige(s);
        if (view === 'home') { var f = $('.foot'); if (f) f.innerHTML = fusstext() +
          '<br><a class="lehrerlink" href="lehrer.html">Für Lehrkräfte</a>'; }
      });
    }
    if (WA.cloud && WA.cloud.aktiv() && !WA.cloud.angemeldet()) {
      renderLogin(WA.cloud.fehler() ? String(WA.cloud.fehler()) : null);
      return;
    }
    renderHome();
  }

  WA.debug = { get L() { return L; }, home: renderHome, boot: boot };

  if (WA.cloud && typeof firebase !== 'undefined') {
    WA.cloud.start(boot);      // wartet auf Firebase
  } else {
    boot();                    // Übungsmodus ohne Cloud
  }
})();
