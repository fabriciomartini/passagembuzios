/* Sincronização na nuvem (Supabase) das chaves bz-* do localStorage.
   Carga inicial completa, envio com mescla em 3 vias (itens por id), consulta periódica e fila offline. */
(function () {
  if (window.bzNuvem) return;
  var URL = 'https://gjzxhpazddvayhneodpe.supabase.co/rest/v1/bz_kv';
  var KEY = 'sb_publishable_rz5DjrHTAkY0N3E49BMUmw_HNbcoJJV';
  var LOCAL = /^bz-(sessao|sol|noite|tema-manual|haptics|wake|ptt)-v\d/;
  var ls = window.localStorage, P = Storage.prototype, rawSet = P.setItem, rawDel = P.removeItem;
  var aplicando = false;
  function lsGet(k) { try { return ls.getItem(k); } catch (e) { return null; } }
  function put(k, v) { aplicando = true; try { v === null ? rawDel.call(ls, k) : rawSet.call(ls, k, v); } catch (e) { /* cheio */ } aplicando = false; }
  var CID = lsGet('bzn-cid') || (Math.random().toString(36).slice(2) + Date.now().toString(36)); put('bzn-cid', CID);
  try { for (var z = ls.length - 1; z >= 0; z--) { var kz = ls.key(z); if (kz && kz.indexOf('bzn-base:') === 0) { var kb = kz.slice(9), fq = {}; try { fq = JSON.parse(lsGet('bzn-fila') || '{}') || {}; } catch (e) {} if (!(kb in fq) || (lsGet(kz) || '').length >= 120000) rawDel.call(ls, kz); } } } catch (e) { /* ignora */ }
  var fila = {}; try { fila = JSON.parse(lsGet('bzn-fila') || '{}') || {}; } catch (e) { fila = {}; }
  var base = {}, cursor = '', timer = null, enviando = false, ouvintes = [], estado = 'conectando', erro = '';
  function comp(k) { return typeof k === 'string' && k.indexOf('bz-') === 0 && !LOCAL.test(k); }
  function salvarFila() { put('bzn-fila', JSON.stringify(fila)); }

  function req(method, q, body, extra) {
    var h = { apikey: KEY, 'Content-Type': 'application/json' };
    for (var i in extra) h[i] = extra[i];
    return fetch(URL + (q || ''), { method: method, headers: h, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' })
      .then(function (r) { return r.text().then(function (t) { if (!r.ok) throw new Error(r.status + ' ' + t); return t ? JSON.parse(t) : null; }); });
  }

  // ---- mescla em 3 vias ----
  function idDe(x) { return x && typeof x === 'object' ? (x.id || x.u || x.codigo || null) : null; }
  function ig(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function obj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  function merge3(b, l, r) {
    if (ig(l, r)) return l;
    if (ig(b, r)) return l;
    if (ig(b, l)) return r;
    if (Array.isArray(l) && Array.isArray(r)) {
      var bb = Array.isArray(b) ? b : [];
      var todos = l.concat(r, bb);
      if (!todos.length || !todos.every(function (x) { return idDe(x) != null; })) return l;
      var mb = {}, ml = {}, mr = {};
      bb.forEach(function (x) { mb[idDe(x)] = x; }); l.forEach(function (x) { ml[idDe(x)] = x; }); r.forEach(function (x) { mr[idDe(x)] = x; });
      var out = [];
      r.forEach(function (x) {
        var id = idDe(x);
        if (id in ml) out.push(merge3(mb[id], ml[id], x));
        else if (!(id in mb) || !ig(mb[id], x)) out.push(x);
      });
      l.forEach(function (x, i) {
        var id = idDe(x);
        if (id in mr) return;
        if (id in mb && ig(mb[id], x)) return;
        out.splice(Math.min(i, out.length), 0, x);
      });
      return out;
    }
    if (obj(l) && obj(r)) {
      var b2 = obj(b) ? b : {}, o = {}, ks = {};
      [l, r, b2].forEach(function (m) { for (var k in m) ks[k] = 1; });
      for (var k in ks) { var v = merge3(b2[k], l[k], r[k]); if (v !== undefined) o[k] = v; }
      return o;
    }
    if (typeof l === 'number' && typeof r === 'number') return Math.max(l, r);
    return l;
  }
  function mergeStr(b, l, r) {
    try {
      var lp = JSON.parse(l), rp = JSON.parse(r), bp = b == null ? undefined : JSON.parse(b);
      if (bp === undefined) bp = Array.isArray(lp) ? [] : (obj(lp) ? {} : undefined);
      var m = merge3(bp, lp, rp);
      return ig(m, lp) ? l : JSON.stringify(m);
    } catch (e) { return l; }
  }

  // ---- intercepta gravações locais ----
  function marcar(k) {
    if (aplicando || !comp(k)) return;
    if (!fila[k]) { fila[k] = 0; if (base[k] !== undefined && (base[k] === null || base[k].length < 120000)) put('bzn-base:' + k, base[k] === null ? '\u0000' : base[k]); }
    fila[k]++; salvarFila(); status('pendente'); agendar();
  }
  P.setItem = function (k, v) { rawSet.call(this, k, v); if (this === ls) marcar(k); };
  P.removeItem = function (k) { rawDel.call(this, k); if (this === ls) marcar(k); };

  function agendar(ms) { clearTimeout(timer); timer = setTimeout(enviar, ms || 1200); }
  function baseDe(k) { if (base[k] !== undefined) return base[k]; var s = lsGet('bzn-base:' + k); return s === '\u0000' ? null : s; }
  function enviar() {
    var ks = Object.keys(fila);
    if (!ks.length) return Promise.resolve();
    if (enviando) { agendar(); return Promise.resolve(); }
    if (navigator.onLine === false) { status('offline'); return Promise.resolve(); }
    enviando = true;
    var ver = {}; ks.forEach(function (k) { ver[k] = fila[k]; });
    var lotes = []; for (var i = 0; i < ks.length; i += 40) lotes.push(ks.slice(i, i + 40));
    return lotes.reduce(function (p, lote) { return p.then(function () { return enviarLote(lote, ver); }); }, Promise.resolve())
      .then(function () { enviando = false; status(Object.keys(fila).length ? 'pendente' : 'ok'); if (Object.keys(fila).length) agendar(); })
      .catch(function (e) { enviando = false; falha(e); agendar(15000); });
  }
  function enviarLote(ks, ver) {
    var q = '?select=k,v&k=in.' + encodeURIComponent('(' + ks.map(function (k) { return '"' + k.replace(/"/g, '') + '"'; }).join(',') + ')');
    return req('GET', q).then(function (rows) {
      var rm = {}; (rows || []).forEach(function (r) { rm[r.k] = r.v; });
      var up = [], mud = [];
      ks.forEach(function (k) {
        var loc = lsGet(k), b = baseDe(k), rv = k in rm ? rm[k] : null, out;
        if (loc === null) out = (b != null && rv !== null && rv !== b) ? rv : null;
        else if (rv === null) out = loc;
        else out = mergeStr(b, loc, rv);
        if (out !== loc) { put(k, out); mud.push(k); }
        up.push({ k: k, v: out, autor: CID });
      });
      return req('POST', '?on_conflict=k', up, { Prefer: 'resolution=merge-duplicates,return=minimal' }).then(function () {
        up.forEach(function (r) {
          base[r.k] = r.v;
          if (fila[r.k] === ver[r.k]) { delete fila[r.k]; aplicando = true; try { rawDel.call(ls, 'bzn-base:' + r.k); } catch (e) {} aplicando = false; }
        });
        salvarFila();
        if (mud.length) avisar(mud);
      });
    });
  }

  function puxar(inicial) {
    var q = '?select=k,v,atualizado&order=atualizado.asc&limit=500' + (cursor ? '&atualizado=gt.' + encodeURIComponent(cursor) : '');
    return req('GET', q).then(function (rows) {
      rows = rows || []; var mud = [];
      rows.forEach(function (r) {
        cursor = r.atualizado;
        if (inicial) inicial[r.k] = 1;
        if (fila[r.k] !== undefined) return;
        base[r.k] = r.v;
        if (lsGet(r.k) === r.v) return;
        put(r.k, r.v); mud.push(r.k);
      });
      if (mud.length && !inicial) avisar(mud);
      if (rows.length === 500) return puxar(inicial);
      if (!enviando) status(Object.keys(fila).length ? 'pendente' : 'ok');
    });
  }

  function avisar(ks) { ouvintes.forEach(function (fn) { try { fn(ks); } catch (e) { console.error(e); } }); }
  function falha(e) { erro = String(e && e.message || e); console.warn('[nuvem]', erro); status(navigator.onLine === false ? 'offline' : 'erro'); }

  // ---- indicador ----
  var pill = null;
  var TXT = { conectando: 'Nuvem · conectando', ok: 'Nuvem · sincronizado', pendente: 'Nuvem · enviando…', offline: 'Nuvem · offline (fila local)', erro: 'Nuvem · falha' };
  var COR = { conectando: 'var(--color-neutral-500, #888)', ok: 'var(--color-accent, #5980a6)', pendente: 'var(--color-accent-300, #9bb3cc)', offline: 'oklch(0.7 0.14 70)', erro: 'oklch(0.55 0.19 25)' };
  function status(s) {
    estado = s;
    if (!pill && document.body) {
      pill = document.createElement('div');
      Object.assign(pill.style, { position: 'fixed', left: '8px', bottom: '8px', zIndex: 9000, display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', font: '11px/1.4 var(--font-body, sans-serif)', color: 'var(--color-text, #1d1f20)', background: 'color-mix(in srgb, var(--color-bg, #f2f2f3) 88%, transparent)', border: '1px solid var(--color-divider, #ccc)', pointerEvents: 'auto', cursor: 'default' });
      pill.innerHTML = '<i style="width:7px;height:7px;border-radius:50%;display:inline-block"></i><span></span>';
      document.body.appendChild(pill);
    }
    if (!pill) return;
    pill.firstChild.style.background = COR[s];
    pill.lastChild.textContent = TXT[s];
    pill.title = s === 'erro' ? erro : (s === 'ok' ? 'Dados compartilhados com todos os usuários' : '');
  }

  var pronto = new Promise(function (res) {
    var t = setTimeout(res, 9000);
    var vistos = {};
    puxar(vistos).then(function () {
      for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (comp(k) && !vistos[k] && fila[k] === undefined) { fila[k] = 1; } }
      salvarFila();
      clearTimeout(t); res();
      enviar();
    }).catch(function (e) { falha(e); clearTimeout(t); res(); });
  });

  setInterval(function () { if (document.visibilityState !== 'hidden') puxar().catch(falha); }, 8000);
  window.addEventListener('online', function () { enviar(); puxar().catch(falha); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') puxar().catch(falha); });
  window.addEventListener('pagehide', function () { if (Object.keys(fila).length) enviar(); });
  if (document.body) status('conectando'); else document.addEventListener('DOMContentLoaded', function () { status(estado); });

  window.bzNuvem = {
    pronto: pronto,
    aoMudar: function (fn) { ouvintes.push(fn); },
    sincronizar: function () { return enviar().then(function () { return puxar(); }); },
    estado: function () { return { estado: estado, pendentes: Object.keys(fila).length, erro: erro }; }
  };
})();
