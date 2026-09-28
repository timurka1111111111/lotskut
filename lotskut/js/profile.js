import {db, auth, collection, getDocs, deleteDoc, doc, query, where, signOut} from "./firebase.js";
import {boot, needSetup, $, esc, fmt, img} from "./common.js";

boot(async (user, app) => {
  if (needSetup(app)) return;
  if (!user) { location.href = "login.html"; return; }
  app.innerHTML = `<div class="panel"><h2>${esc(user.displayName || "Профиль")}</h2><p class="meta">${esc(user.email)}</p>
    <div class="sec"><h2>Мои изделия</h2><div id="mine"><p class="meta">Загружаем…</p></div></div>
    <div class="sec"><h2>Заказы на мои изделия</h2><div id="sales"><p class="meta">Загружаем…</p></div></div>
    <div class="sec"><h2>Мои покупки</h2><div id="ord"><p class="meta">Загружаем…</p></div></div>
    <p style="margin-top:28px"><button class="btn ghost" id="out">Выйти</button></p></div>`;
  $("#out").onclick = async () => { await signOut(auth); location.href = "index.html"; };

  const byDate = (x, y) => (y.createdAt?.seconds || 0) - (x.createdAt?.seconds || 0);
  const load = async () => {
    const [a, b, c] = await Promise.all([
      // все товары, чей sellerId начинается с моего uid (включая лавки, созданные сидером)
      getDocs(query(collection(db, "products"), where("sellerId", ">=", user.uid), where("sellerId", "<=", user.uid + "\uf8ff"))),
      getDocs(query(collection(db, "orders"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "orders"), where("sellerUids", "array-contains", user.uid)))]);
    const mine = a.docs.map(d => ({id: d.id, ...d.data()}));
    const ord = b.docs.map(d => ({id: d.id, ...d.data()})).sort(byDate);
    const sales = c.docs.map(d => ({id: d.id, ...d.data()})).sort(byDate);
    $("#mine").innerHTML = mine.length ? mine.map(p => `<div class="row">${img(p)}
      <div class="grow"><a href="product.html?id=${p.id}"><b>${esc(p.title)}</b></a><p class="meta">${fmt(p.price)}</p></div>
      <button class="btn danger sm" data-del="${p.id}">Удалить</button></div>`).join("")
      : `<p class="meta">Пока пусто. <a href="sell.html"><u>Добавить изделие</u></a></p>`;
    $("#sales").innerHTML = sales.length ? sales.map(o => `<div class="row"><div class="grow"><b>${fmt(o.total)}</b> · ${esc(o.name)}, ${esc(o.phone)}
      <p class="meta">${o.items.map(i => esc(i.title) + " × " + i.qty).join(", ")}<br>${esc(o.address)}</p></div></div>`).join("")
      : `<p class="meta">Заказов на ваши изделия пока нет.</p>`;
    $("#ord").innerHTML = ord.length ? ord.map(o => `<div class="row"><div class="grow"><b>${fmt(o.total)}</b>
      <p class="meta">${o.items.map(i => esc(i.title) + " × " + i.qty).join(", ")}<br>${esc(o.address)}</p></div></div>`).join("")
      : `<p class="meta">Покупок пока нет.</p>`;
  };
  $("#mine").onclick = async e => {
    const id = e.target.dataset.del;
    if (id && confirm("Удалить этот товар?")) { await deleteDoc(doc(db, "products", id)); load(); }
  };
  load();
});
