import {db, auth, collection, getDocs, deleteDoc, doc, query, where, signOut} from "./firebase.js";
import {boot, needSetup, $, esc, fmt, img, toast} from "./common.js";

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
  const rows = snap => snap.docs.map(d => ({id: d.id, ...d.data()}));
  // каждый блок грузится отдельно: если один запрос упал, остальные всё равно покажутся,
  // а вместо вечного «Загружаем…» будет код ошибки
  const safe = async (sel, fn) => {
    try { await fn(); }
    catch (e) {
      console.error(sel, e);
      $(sel).innerHTML = `<p class="meta">Не удалось загрузить (${esc(e.code || e.message)}). Подробности в консоли (F12).</p>`;
    }
  };
  const loadMine = () => safe("#mine", async () => {
    // все товары, чей sellerId начинается с моего uid (включая лавки, созданные сидером)
    const mine = rows(await getDocs(query(collection(db, "products"), where("sellerId", ">=", user.uid), where("sellerId", "<=", user.uid + "\uf8ff"))));
    $("#mine").innerHTML = mine.length ? mine.map(p => `<div class="row">${img(p)}
      <div class="grow"><a href="product.html?id=${p.id}"><b>${esc(p.title)}</b></a><p class="meta">${fmt(p.price)}</p></div>
      <button class="btn danger sm" data-del="${p.id}">Удалить</button></div>`).join("")
      : `<p class="meta">Пока пусто. <a href="sell.html"><u>Добавить изделие</u></a></p>`;
  });
  const loadSales = () => safe("#sales", async () => {
    const sales = rows(await getDocs(query(collection(db, "orders"), where("sellerUids", "array-contains", user.uid)))).sort(byDate);
    $("#sales").innerHTML = sales.length ? sales.map(o => `<div class="row"><div class="grow"><b>${fmt(o.total)}</b> · ${esc(o.name)}, ${esc(o.phone)}
      <p class="meta">${o.items.map(i => esc(i.title) + " × " + i.qty).join(", ")}<br>${esc(o.address)}</p></div></div>`).join("")
      : `<p class="meta">Заказов на ваши изделия пока нет.</p>`;
  });
  const loadOrders = () => safe("#ord", async () => {
    const ord = rows(await getDocs(query(collection(db, "orders"), where("userId", "==", user.uid)))).sort(byDate);
    $("#ord").innerHTML = ord.length ? ord.map(o => `<div class="row"><div class="grow"><b>${fmt(o.total)}</b>
      <p class="meta">${o.items.map(i => esc(i.title) + " × " + i.qty).join(", ")}<br>${esc(o.address)}</p></div></div>`).join("")
      : `<p class="meta">Покупок пока нет.</p>`;
  });
  const load = () => Promise.all([loadMine(), loadSales(), loadOrders()]);
  $("#mine").onclick = async e => {
    const id = e.target.dataset.del;
    if (id && confirm("Удалить этот товар?")) { try { await deleteDoc(doc(db, "products", id)); } catch (err) { console.error(err); toast("Не удалось удалить: " + (err.code || err.message)); return; } loadMine(); }
  };
  load();
});
