import {boot, cardHTML, getFavs, loadProducts} from "./common.js";
boot(async (user, app) => {
  const ids = getFavs(), items = (await loadProducts()).list.filter(p => ids.includes(p.id));
  app.innerHTML = `<section class="hero" style="padding-bottom:0"><h1 style="font-size:38px">Избранное</h1></section>` + (items.length
    ? `<div class="grid">${items.map(cardHTML).join("")}</div>`
    : `<div class="panel empty">Здесь появятся изделия, которые вы отметите сердечком на странице товара.<p style="margin-top:14px"><a class="btn" href="index.html">Выбрать в каталоге</a></p></div>`);
});
