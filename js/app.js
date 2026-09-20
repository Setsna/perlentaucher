/* ==========================================================
   WortAbenteuer – Oberfläche (Startseite, Tauchgang, Ergebnis)
   ========================================================== */
(function () {
  'use strict';
  var C = WA.config, S = WA.store, EX = WA.ex;
  var $app = document.getElementById('app'), $modal = document.getElementById('modal');
  var L = null, view = 'home', timer = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
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
  //  STARTSEITE
  // ==========================================================
  function heartChip() {
    var h = S.hearts();
    return '<span class="bubbles">' + heartsHtml(h.count, h.max) + '</span>' +
      (h.count < h.max ? '<small>+1 in ' + mmss(h.nextMs) + '</small>' : '');
  }

  function renderHome() {
    view = 'home'; L = null; clearInterval(timer); clearConfetti();
    var st = S.state, today = S.todayXp(), goal = C.dailyGoalXp, weak = S.weakWords();
    var kind = WA.cloud && WA.cloud.kind && WA.cloud.kind();
    var name = kind ? esc(kind.vorname) : null;
    var msg = st.lessons === 0 ? 'Hallo' + (name ? ' ' + name : '') + '! Ich bin <b>Otti</b>. Wähle ein Tauchrevier und starte deinen ersten Tauchgang!'
      : today >= goal ? 'Tagesziel geschafft! Du bist ein echter Tiefseetaucher!'
      : weak.length ? 'Ein paar Wörter sind noch kniffelig. Im <b>Tiefsee-Mix</b> üben wir sie zusammen!'
      : 'Schön, dass du wieder da bist' + (name ? ', ' + name : '') + '! Wo tauchen wir heute?';

    var worlds = Object.keys(C.categories).filter(function (k) { return C.categories[k].enabled; }).map(function (k) {
      var c = C.categories[k], p = S.worldProgress(k);
      return '<button class="world" style="--wc:' + c.color + '" data-action="start" data-w="' + k + '">' +
        '<span class="wicon">' + ((WA.icons && WA.icons[c.icon]) || c.icon) + '</span>' +
        '<span class="wtext"><b>' + esc(c.title) + '</b><small>' + esc(c.sub) + '</small>' +
        '<span class="wbar"><i style="width:' + pct(p) + '%"></i></span></span>' +
        '<span class="wpct">' + pct(p) + '%</span></button>';
    }).join('');

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
      '<header class="top"><div class="brand">' + WA.mascot('happy', 48) + '<span>Wort<b>Abenteuer</b></span></div>' +
      '<div class="tools"><div class="pill heartpill" id="heartchip">' + heartChip() + '</div>' +
      '<div class="pill xppill"><span class="pearl"></span> <b>' + st.xp + '</b> Perlen</div>' +
      '<button class="icon-btn" data-action="settings" aria-label="Einstellungen">' + ico('zahnrad') + '</button></div></header>' +
      '<section class="hero">' + WA.mascot(today >= goal ? 'cheer' : 'happy', 120) + '<div class="bubble">' + msg + '</div></section>' +
      '<section class="stats">' +
      '<div class="card stat"><h3>Tagesziel</h3><div class="big">' + Math.min(today, 9999) + ' <small>/ ' + goal + ' Perlen</small></div>' + bar(Math.min(1, today / goal), 'var(--coral)') + '</div>' +
      '<div class="card stat"><h3>Dein Rekord</h3><div class="big">' + ico('perle') + ' ' + st.best.day + ' <small>Perlen an einem Tag</small></div><div class="sub">Bester Tauchgang: <b>' + st.best.lesson + ' Perlen</b></div></div>' +
      '<div class="card stat"><h3>Serie</h3><div class="big">' + ico('welle') + ' ' + st.streakDays + ' <small>' + (st.streakDays === 1 ? 'Tag' : 'Tage') + ' in Folge</small></div><div class="sub">Tauchgänge gesamt: <b>' + st.lessons + '</b></div></div>' +
      '</section>' +
      '<section class="navrow">' +
      '<button class="navbtn" data-action="progress"><span class="nic">' + ico('fortschritt') + '</span>' +
      '<span class="ntext"><b>Mein Fortschritt</b><small>Wie gut sitzen deine Wörter?</small></span></button>' +
      '<button class="navbtn" data-action="klasse"><span class="nic">' + ico('schwarm') + '</span>' +
      '<span class="ntext"><b>Klassenziel</b><small>Was die Klasse zusammen schafft</small></span></button>' +
      '</section>' +
      '<h2 class="sec">Tauchreviere</h2><section class="worlds">' + worlds + '</section>' +
      weakHtml +
      '<h2 class="sec">Diese Woche</h2><section class="card week">' + weekHtml + '</section>' +
      '<h2 class="sec">Abzeichen</h2><section class="badges">' + badges + '</section>' +
      '<footer class="foot">Prototyp – Spielstand wird nur auf diesem Gerät gespeichert.</footer></div>';

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
      '<h1>Willkommen bei WortAbenteuer</h1>' +
      '<p>Scanne den QR-Code in deinem Hausaufgabenheft. Oder tippe den Code darunter ein.</p>' +
      (meldung ? '<div class="loginfehler">' + esc(meldung) + '</div>' : '') +
      '<input id="codefeld" class="codefeld" type="text" inputmode="text" autocapitalize="characters" ' +
      'autocomplete="off" spellcheck="false" maxlength="9" placeholder="ABCD-2345" aria-label="Zugangscode">' +
      '<button class="btn big wide" data-action="login">Los geht\'s</button>' +
      '<p class="muted klein">Du bleibst angemeldet. Den Code brauchst du nur einmal.</p>' +
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
    var queue = EX.buildLesson(world, onlyIds);
    L = { world: world, queue: queue, i: 0, practice: practice, correct: 0, wrong: 0, streak: 0, maxStreak: 0, xp: 0,
          outOfHearts: false, retried: {}, onlyIds: onlyIds };
    prepQ(); renderLesson();
  }

  function prepQ() {
    L.q = L.queue[L.i]; L.sel = null; L.slots = []; L.cuts = {}; L.answered = false; L.res = null;
    for (var i = 0; i < (L.q.blanks || 0); i++) L.slots.push(null);
  }

  function renderLesson() {
    view = 'lesson'; clearInterval(timer); clearConfetti();
    var c = C.categories[L.world];
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
  }

  function stageHtml() {
    var q = L.q, mood = L.answered ? (L.res.ok ? 'cheer' : 'sad') : (q.kind === 'build' ? 'think' : 'happy');
    var h = '<div class="prow">' + WA.mascot(mood, 72) + '<div class="bubble q">' + esc(q.prompt) +
      (q.speak ? ' <button class="spk" data-action="speak" aria-label="Vorlesen">' + ico('lautsprecher') + '</button>' : '') + '</div></div>';

    if (q.show && (q.show.emoji || q.show.text)) {
      var w = getWord(q.wordId), txt = q.show.text;
      if (L.answered && q.revealSyllables) txt = null;
      h += '<div class="show">' + (q.show.emoji ? '<div class="emoji">' + q.show.emoji + '</div>' : '') +
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
        if (L.answered) { if (o.value === q.correct) cls += ' right'; else if (L.sel === i) cls += ' wrong'; }
        return '<button class="' + cls + '" data-action="pick" data-i="' + i + '"' + (L.answered ? ' disabled' : '') + '>' + esc(o.label) + '</button>';
      }).join('') + '</div>';
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
    if (q.kind === 'choice') return L.sel !== null;
    if (q.kind === 'build') return L.slots.every(function (x) { return x !== null; });
    return Object.keys(L.cuts).length > 0;
  }

  var PRAISE = ['Super!', 'Genau!', 'Stark getaucht!', 'Richtig!', 'Prima gemacht!', 'Perlentaucher!', 'Klasse!'];

  function footerHtml() {
    if (!L.answered) {
      var ok = isReady();
      return '<div class="footer"><button class="btn big' + (ok ? '' : ' off') + '" data-action="check"' + (ok ? '' : ' disabled') + '>Prüfen</button></div>';
    }
    if (L.res.ok) {
      var x = L.res.xp;
      return '<div class="footer good"><div class="fb"><b>' + (L.streak >= C.xp.streakBonusFrom ? L.streak + ' in Folge!' : PRAISE[Math.floor(Math.random() * PRAISE.length)]) + '</b>' +
        (x.total ? '<span class="xpgain">+' + x.total + ' Perlen' + (x.bonus ? ' <small>(Serien-Bonus +' + x.bonus + ')</small>' : '') + '</span>' : '') + '</div>' +
        '<button class="btn good big" data-action="next">Weiter</button></div>';
    }
    return '<div class="footer bad"><div class="fb"><b>Nicht ganz.</b> Richtig ist: <span class="sol">' + esc(L.q.solutionText) + '</span></div>' +
      '<button class="btn bad big" data-action="next">Weiter</button></div>';
  }

  function check() {
    var q = L.q, ok;
    if (q.kind === 'choice') ok = q.options[L.sel].value === q.correct;
    else if (q.kind === 'build') ok = q.assemble(L.slots.map(function (i) { return q.tiles[i]; })) === q.answerWord;
    else {
      var a = Object.keys(L.cuts).map(Number).sort(function (x, y) { return x - y; }).join(',');
      ok = a === q.solution.join(',');
    }
    L.answered = true;
    var xp = { base: 0, bonus: 0, total: 0 };
    S.recordAnswer(q.wordId, q.cat, ok);
    if (ok) {
      L.correct++; L.streak++; L.maxStreak = Math.max(L.maxStreak, L.streak);
      if (!L.practice) { xp = EX.xpFor(q, L.streak); S.addXp(xp.total); L.xp += xp.total; }
      sfx.ok();
    } else {
      L.wrong++; L.streak = 0; sfx.bad();
      if (!L.practice) {
        S.loseHeart();
        if (S.hearts().count <= 0) L.outOfHearts = true;
      }
      if (!L.retried[q.wordId] && L.queue.length < C.lessonLength * 2) {    // falsche Aufgabe kommt später noch einmal
        L.retried[q.wordId] = true;
        L.queue.push(EX.makeQuestion(q.type, getWord(q.wordId)));
      }
    }
    L.res = { ok: ok, xp: xp };
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
    view = 'result'; clearInterval(timer);
    var total = L.correct + L.wrong, acc = total ? Math.round(L.correct / total * 100) : 0;
    $app.innerHTML = '<div class="center"><div class="cardbig">' + WA.mascot(acc >= 60 ? 'cheer' : 'happy', 150) +
      '<h1>' + (perfect ? 'Makellos!' : acc >= 60 ? 'Tauchgang geschafft!' : 'Weiter so!') + '</h1>' +
      '<div class="res"><div><b>+' + L.xp + '</b><small>Perlen</small></div><div><b>' + acc + '%</b><small>richtig</small></div><div><b>' + L.maxStreak + '</b><small>längste Serie</small></div></div>' +
      (L.practice ? '<p class="muted">Im Übungsmodus gibt es keine Perlen.</p>' : '') +
      (fresh.length ? '<div class="newbadges"><h3>Neues Abzeichen!</h3>' + fresh.map(function (b) { return '<div class="badge got big"><span>' + ico(b.icon) + '</span><b>' + esc(b.title) + '</b><small>' + esc(b.desc) + '</small></div>'; }).join('') + '</div>' : '') +
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
      case 'progress': renderProgress(); break;
      case 'login': login(); break;
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
        if (!L.answered) { var free = L.slots.indexOf(null); if (free >= 0 && L.slots.indexOf(i) < 0) { L.slots[free] = i; updateLesson(); } }
        break;
      case 'unslot': if (!L.answered && L.slots[i] !== null) { L.slots[i] = null; updateLesson(); } break;
      case 'cut': if (!L.answered) { if (L.cuts[i]) delete L.cuts[i]; else L.cuts[i] = true; updateLesson(); } break;
      case 'check': if (!L.answered && isReady()) check(); break;
      case 'next': if (L.answered) next(); break;
    }
  });

  // Doppeltipp-Zoom auf iOS verhindern
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); });

  var klassenPerlen = null;

  function boot() {
    klassenPerlen = null;
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
