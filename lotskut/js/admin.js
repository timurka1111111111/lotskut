import {db, collection, addDoc, getDocs, getDoc, doc, deleteDoc, updateDoc, query, orderBy, serverTimestamp} from "./firebase.js";
import {boot, needSetup, $, esc, fmt, img, toast, CATS, CUR} from "./common.js";

const ST = {new: "Новый", paid: "Оплачен", shipped: "Отправлен", done: "Выполнен", cancelled: "Отменён"};
const date = o => o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString("ru-RU") : "—";
const rows = s => s.docs.map(d => ({id: d.id, ...d.data()}));

boot(async (user, app) => {
  if (needSetup(app)) return;
  if (!user) { location.href = "login.html"; return; }
  let ok = false;
  try { ok = (await getDoc(doc(db, "admins", user.uid))).exists(); } catch (e) {}
  if (!ok) {
    app.innerHTML = `<div class="panel narrow"><h2>Нет доступа</h2><p style="margin-top:12px">Чтобы стать админом: Firebase Console → Firestore → создай коллекцию <code>admins</code> → документ с ID:</p>
      <p style="margin:12px 0"><code>${esc(user.uid)}</code></p><p class="meta">Поля не нужны, можно добавить любое. Потом обнови страницу.</p></div>`;
    return;
  }
  let P = [], O = [], tab = "home", q = "", image = "";
  const load = async () => {
    [P, O] = await Promise.all([
      getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))).then(rows),
      getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))).then(rows)]);
  };
  const TABS = {home: "Обзор", products: "Товары", orders: "Заказы", sellers: "Мастера", buyers: "Покупатели"};
  const shell = body => `<h1 style="font-size:32px;margin-top:28px">Админка</h1>
    <div class="tabs">${Object.entries(TABS).map(([k, v]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${v}${k === "orders" && O.filter(o => !o.status || o.status === "new").length ? " •" : ""}</button>`).join("")}</div><div class="panel">${body}</div>`;

  const views = {
    home() {
      const rev = O.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);
      const fresh = O.filter(o => !o.status || o.status === "new").length;
      return `<div class="stats"><div>Товаров<b>${P.length}</b></div><div>Заказов<b>${O.length}</b></div><div>Новых заказов<b>${fresh}</b></div><div>Выручка<b>${fmt(rev)}</b></div>
        <div>Мастеров<b>${new Set(P.map(p => p.sellerId)).size}</b></div></div>
        <div class="sec"><h2>Последние заказы</h2>${O.slice(0, 5).map(orderRow).join("") || `<p class="meta">Заказов нет.</p>`}</div>`;
    },
    products() {
      const l = P.filter(p => (p.title + p.sellerName + p.category).toLowerCase().includes(q.toLowerCase()));
      return `<div style="display:flex;gap:10px;margin-bottom:14px"><input id="q" placeholder="Поиск по названию, мастеру, категории" value="${esc(q)}"><button class="btn alt" data-edit="new">+ Товар</button></div>
        ${l.map(p => `<div class="row">${img(p)}<div class="grow"><a href="product.html?id=${p.id}" target="_blank"><b>${esc(p.title)}</b></a>
        <p class="meta">${esc(p.sellerName)} · ${esc(p.category)} · ${fmt(p.price)}</p></div>
        <button class="btn ghost sm" data-edit="${p.id}">Изменить</button><button class="btn danger sm" data-delp="${p.id}">Удалить</button></div>`).join("") || `<p class="meta">Ничего не найдено.</p>`}`;
    },
    orders: () => O.map(orderRow).join("") || `<p class="meta">Заказов пока нет.</p>`,
    sellers() {
      const m = {}; P.forEach(p => { const s = m[p.sellerId] ??= {name: p.sellerName, n: 0, sum: 0}; s.n++; });
      O.forEach(o => (o.items || []).forEach(i => { if (m[i.sellerId]) m[i.sellerId].sum += i.price * i.qty; }));
      return Object.entries(m).map(([id, s]) => `<div class="row"><div class="grow"><a href="seller.html?id=${id}" target="_blank"><b>${esc(s.name)}</b></a>
        <p class="meta">Изделий: ${s.n} · Продано на ${fmt(s.sum)}</p></div></div>`).join("") || `<p class="meta">Пусто.</p>`;
    },
    buyers() {
      const m = {}; O.forEach(o => { const b = m[o.userId] ??= {name: o.name, phone: o.phone, addr: o.address, n: 0, sum: 0}; b.n++; b.sum += o.total || 0; });
      return Object.values(m).map(b => `<div class="row"><div class="grow"><b>${esc(b.name)}</b> · ${esc(b.phone)}
        <p class="meta">${esc(b.addr)}<br>Заказов: ${b.n} · На сумму ${fmt(b.sum)}</p></div></div>`).join("") || `<p class="meta">Покупателей пока нет.</p>`;
    }
  };
  const orderRow = o => `<div class="row"><div class="grow"><b>${fmt(o.total)}</b> · ${esc(o.name)}, ${esc(o.phone)} <span class="st">${ST[o.status || "new"]}</span>
    <p class="meta">${date(o)}<br>${(o.items || []).map(i => esc(i.title) + " × " + i.qty).join(", ")}<br>${esc(o.address)}</p></div>
    <select data-st="${o.id}">${Object.entries(ST).map(([k, v]) => `<option value="${k}" ${k === (o.status || "new") ? "selected" : ""}>${v}</option>`).join("")}</select>
    <button class="btn danger sm" data-delo="${o.id}">Удалить</button></div>`;

  const draw = () => { app.innerHTML = shell(views[tab]()); };
  const form = id => {
    const p = P.find(x => x.id === id) || {}; image = p.image || "";
    app.innerHTML = `<div class="panel narrow"><h2>${id === "new" ? "Новый товар" : "Редактирование"}</h2>
      <label for="t">Название</label><input id="t" value="${esc(p.title)}">
      <label for="c">Категория</label><select id="c">${CATS.map(c => `<option ${c === p.category ? "selected" : ""}>${c}</option>`).join("")}</select>
      <label for="pr">Цена, ${CUR}</label><input id="pr" type="number" min="1" value="${p.price || ""}">
      <label for="sn">Мастер (название лавки)</label><input id="sn" value="${esc(p.sellerName || user.displayName || "Лоскут")}">
      <label for="d">Описание</label><textarea id="d" rows="4">${esc(p.desc)}</textarea>
      <label for="f">Фото</label><input id="f" type="file" accept="image/*"><div id="pv" style="margin-top:10px">${image ? `<img src="${image}" style="width:140px;border-radius:6px" alt="">` : ""}</div>
      <p style="margin-top:20px"><button class="btn alt" id="save">Сохранить</button> <button class="btn ghost" id="cancel">Отмена</button></p></div>`;
    $("#cancel").onclick = draw;
    $("#f").onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader();
      r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 700 / Math.max(im.width, im.height)), cv = document.createElement("canvas");
        cv.width = im.width * k; cv.height = im.height * k; cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
        image = cv.toDataURL("image/jpeg", .75); $("#pv").innerHTML = `<img src="${image}" style="width:140px;border-radius:6px" alt="">`; }; im.src = r.result; };
      r.readAsDataURL(f); };
    $("#save").onclick = async () => {
      const data = {title: $("#t").value.trim(), category: $("#c").value, price: +$("#pr").value, sellerName: $("#sn").value.trim(), desc: $("#d").value.trim(), image};
      if (!data.title || !(data.price > 0) || !data.desc || !image) return toast("Заполните название, цену, описание и фото");
      $("#save").disabled = true;
      try {
        if (id === "new") await addDoc(collection(db, "products"), {...data, sellerId: user.uid, createdAt: serverTimestamp()});
        else await updateDoc(doc(db, "products", id), data);
        await load(); tab = "products"; draw(); toast("Сохранено");
      } catch (e) { console.error(e); $("#save").disabled = false; toast("Ошибка: " + (e.code || e.message)); }
    };
  };

  app.onclick = async e => {
    const t = e.target, d = t.dataset;
    try {
      if (d.tab) { tab = d.tab; draw(); }
      else if (d.edit) form(d.edit);
      else if (d.delp && confirm("Удалить товар?")) { await deleteDoc(doc(db, "products", d.delp)); await load(); draw(); }
      else if (d.delo && confirm("Удалить заказ насовсем?")) { await deleteDoc(doc(db, "orders", d.delo)); await load(); draw(); }
    } catch (err) { console.error(err); toast("Ошибка: " + (err.code || err.message)); }
  };
  app.onchange = async e => {
    if (!e.target.dataset.st) return;
    try { await updateDoc(doc(db, "orders", e.target.dataset.st), {status: e.target.value}); O.find(o => o.id === e.target.dataset.st).status = e.target.value; toast("Статус обновлён"); }
    catch (err) { console.error(err); toast("Ошибка: " + (err.code || err.message)); }
  };
  app.oninput = e => { if (e.target.id === "q") { q = e.target.value; const pos = e.target.selectionStart; draw(); const i = $("#q"); i.focus(); i.setSelectionRange(pos, pos); } };
  await load(); draw();
});
