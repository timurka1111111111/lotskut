import {db, doc, deleteDoc} from "./firebase.js";
import {boot, isMine, $, esc, fmt, img, toast, getCart, setCart, getFavs, toggleFav, renderNav, cardHTML, getProduct, loadProducts} from "./common.js";

boot(async (user, app) => {
  const id = new URLSearchParams(location.search).get("id");
  const p = await getProduct(id);
  if (!p) { app.innerHTML = `<p class="empty">Такого товара нет. <a href="index.html"><u>В каталог</u></a></p>`; return; }
  const mine = isMine(user, p);
  document.title = p.title + " — Лоскут";
  app.innerHTML = `<div class="split">${img(p)}<div><p class="meta"><a href="index.html"><u>Каталог</u></a> / ${esc(p.category)}</p>
    <h1 style="font-size:32px;margin:6px 0 12px">${esc(p.title)}</h1><p class="price" style="font-size:26px">${fmt(p.price)}</p>
    <p style="margin:18px 0;white-space:pre-line">${esc(p.desc)}</p>
    <p class="meta">Мастер: <a href="seller.html?id=${p.sellerId}"><u>${esc(p.sellerName)}</u></a></p>
    <div style="margin-top:22px;display:flex;gap:10px;flex-wrap:wrap"><button id="add">Добавить в корзину</button>
    <button class="btn ghost" id="fav"></button>${mine ? `<button class="btn danger" id="del">Удалить товар</button>` : ""}</div>
    <ul class="facts"><li>Сделано вручную в единственном экземпляре или небольшой партии</li><li>Отправка мастером в течение нескольких дней</li><li>Вопросы по изделию можно уточнить у мастера</li></ul></div></div>
    <section class="sec"><h2>Ещё в категории «${esc(p.category)}»</h2><div class="grid" id="rel"></div></section>`;
  const favLabel = () => $("#fav").textContent = getFavs().includes(p.id) ? "♥ В избранном" : "♡ В избранное";
  favLabel();
  $("#fav").onclick = () => { toggleFav(p.id); favLabel(); renderNav(user); };
  $("#add").onclick = () => {
    const c = getCart(), f = c.find(i => i.id === p.id);
    f ? f.qty++ : c.push({id: p.id, title: p.title, price: p.price, image: p.image || "", sellerId: p.sellerId || "", qty: 1});
    setCart(c); toast("Добавлено в корзину");
  };
  if (mine) $("#del").onclick = async () => {
    if (!confirm("Удалить этот товар?")) return;
    await deleteDoc(doc(db, "products", p.id)); location.href = "profile.html";
  };
  const rel = (await loadProducts()).list.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  $("#rel").innerHTML = rel.length ? rel.map(cardHTML).join("") : `<p class="meta">Пока других изделий в этой категории нет.</p>`;
});
