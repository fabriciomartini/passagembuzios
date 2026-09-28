// templates/deck/ds-base.js — loads this design system's component bundle
// into the deck. The system stylesheet is deliberately NOT loaded here: the
// deck is a Design Component whose <helmet> links ../../styles.css ahead of
// the deck's own <style>, so the deck's rules win equal-specificity ties in
// every load path — a script-injected sheet would land after that <style>
// and silently outrank it, live and in published artifacts alike. The window
// flag makes the load one-shot: a Design Component evaluates helmet scripts
// twice when the page is opened directly (once from the parsed document,
// once from the runtime's recreated helmet copy), and the bundle must not
// run twice. In a consuming project, point base at the bound _ds/<folder>
// tree relative to this page — one line to edit.
(() => {
  const base = 'ds/industry';
  if (window['__dsBundle:' + base]) return;
  window['__dsBundle:' + base] = true;
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src + ' — if this is a consuming project, point the base line in ds-base.js at the bound _ds/<folder> tree relative to this page (e.g. _ds/<folder> at the project root, ../_ds/<folder> one level down); in a fresh design system this can just mean the bundle is not compiled yet');
  document.head.appendChild(s);
})();
