import {boot, esc, cardHTML, loadProducts} from "./common.js";
boot(async (user, app) => {
  const id = new URLSearchParams(location.search).get("id");
  const items = (await loadProducts()).list.filter(p => p.sellerId === id);
  if (!items.length) { app.innerHTML = `<p class="empty">У этого мастера пока нет изделий. <a href="index.html"><u>В каталог</u></a></p>`; return; }
  document.title = items[0].sellerName + " — Лоскут";
  app.innerHTML = `<section class="hero" style="padding-bottom:0"><p class="meta">Лавка мастера</p><h1 style="font-size:38px">${esc(items[0].sellerName)}</h1>
    <p class="meta" style="margin-top:10px">Изделий в лавке: ${items.length}</p></section><div class="grid">${items.map(cardHTML).join("")}</div>`;
});
