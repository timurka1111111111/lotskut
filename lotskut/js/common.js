import {configured, whenUser, db, collection, getDocs, getDoc, doc, query, orderBy} from "./firebase.js";
import {DEMO} from "./demo.js";

export const CUR = "₽"; // валюта
export const CATS = ["Керамика","Текстиль","Украшения","Дерево","Свечи и мыло","Кожа","Игрушки","Другое"];
export const isMine = (user, p) => !!user && typeof p.sellerId === "string" && (p.sellerId === user.uid || p.sellerId.startsWith(user.uid + "-s"));
export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const fmt = n => new Intl.NumberFormat("ru-RU").format(n) + " " + CUR;
export const img = p => p.image ? `<img src="${p.image}" alt="${esc(p.title)}" loading="lazy">` : `<div class="ph">${esc((p.title || "?")[0])}</div>`;
export const cardHTML = p => `<a class="card" href="product.html?id=${p.id}">${img(p)}<div><h3>${esc(p.title)}</h3><p class="meta">${esc(p.sellerName)} · ${esc(p.category)}</p><p class="price">${fmt(p.price)}</p></div></a>`;

export function toast(t) {
  const e = $("#toast"); e.textContent = t; e.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("show"), 2600);
}

const jget = (k) => JSON.parse(localStorage.getItem(k) || "[]");
export const getCart = () => jget("cart");
export const getFavs = () => jget("favs");
export function toggleFav(id) { const f = getFavs(), i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); localStorage.setItem("favs", JSON.stringify(f)); return i < 0; }
let currentUser = null;
export function setCart(c) { localStorage.setItem("cart", JSON.stringify(c)); renderNav(currentUser); }

export function renderNav(user) {
  currentUser = user;
  const n = getCart().reduce((s, i) => s + i.qty, 0), f = getFavs().length;
  $("#nav").innerHTML = `<a href="index.html">Каталог</a><a href="about.html">О нас</a>
    <a href="favorites.html">Избранное${f ? `<span class="badge">${f}</span>` : ""}</a><a href="sell.html">Продать</a>
    <a href="cart.html">Корзина${n ? `<span class="badge">${n}</span>` : ""}</a>
    ${user ? `<a href="profile.html">${esc(user.displayName || "Профиль")}</a>` : `<a href="login.html">Войти</a>`}`;
}

/* Товары: из Firestore; если Firebase не подключён или база пуста — демо-товары, чтобы сайт не был пустым */
export async function loadProducts() {
  if (!configured) return {list: DEMO, demo: true, setup: true};
  const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
  const list = snap.docs.map(d => ({id: d.id, ...d.data()}));
  return list.length ? {list, demo: false} : {list: DEMO, demo: true};
}
export async function getProduct(id) {
  if (!id) return null;
  if (id.startsWith("demo-")) return DEMO.find(p => p.id === id) || null;
  if (!configured) return null;
  const s = await getDoc(doc(db, "products", id)); return s.exists() ? {id, ...s.data()} : null;
}
export const demoNote = r => !r.demo ? "" : `<p class="notice">${r.setup
  ? "Firebase ещё не подключён — сайт работает в демо-режиме. Подключи его по инструкции из README (файл <code>js/firebase.js</code>)."
  : "Пока в базе нет ни одного товара, показаны демо-изделия. Добавь первое через «Продать» — демо исчезнут."}</p>`;

/* Страницы, которым нужна база (вход, продажа, профиль) */
export function needSetup(app) {
  if (configured) return false;
  app.innerHTML = `<div class="panel narrow"><h2>Нужно подключить Firebase</h2><p style="margin-top:12px">Эта страница заработает после подключения Firebase. Открой <code>js/firebase.js</code>, вставь свой <code>firebaseConfig</code> — шаги в файле README.</p><p style="margin-top:16px"><a class="btn" href="index.html">В каталог</a></p></div>`;
  return true;
}

const HINTS = {
  "permission-denied": "Firestore не пускает: правила не опубликованы. Firebase → Firestore Database → Rules → вставь содержимое файла firestore.rules → Publish.",
  "failed-precondition": "Firestore Database не создана или нужен индекс. Firebase → Build → Firestore Database → Create database.",
  "unavailable": "Нет связи с Firebase. Проверь интернет.",
  "not-found": "Firestore Database не создана. Firebase → Build → Firestore Database → Create database."
};
export async function boot(fn) {
  const app = $("#app");
  const user = configured ? await whenUser() : null; renderNav(user);
  try { await fn(user, app); }
  catch (e) {
    console.error(e);
    const code = e.code ? String(e.code).replace("firestore/", "") : "";
    app.innerHTML = `<div class="panel narrow"><h2>Не удалось загрузить данные</h2><p style="margin-top:12px">${esc(HINTS[code] || "Открой консоль браузера (F12) — там подробности.")}</p><p class="meta" style="margin-top:12px">Код ошибки: ${esc(code || e.message || "unknown")}</p></div>`;
  }
}
