// Одноразовая страница: заливает 24 демо-товара в Firestore под твоим аккаунтом.
// Мастера (Мастерская Ольги, Ткань и Нить…) получают sellerId = <твой uid>-s1, -s2 …, поэтому все товары можно удалять из профиля.
import {db, collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp} from "./firebase.js";
import {boot, needSetup, $, esc} from "./common.js";
import {DEMO} from "./demo.js";

boot(async (user, app) => {
  if (needSetup(app)) return;
  if (!user) { app.innerHTML = `<div class="panel narrow empty">Сначала войдите или зарегистрируйтесь.<p style="margin-top:14px"><a class="btn" href="login.html#up">Регистрация</a> <a class="btn ghost" href="login.html">Войти</a></p></div>`; return; }
  const mineQ = () => getDocs(query(collection(db, "products"), where("sellerId", ">=", user.uid), where("sellerId", "<=", user.uid + "\uf8ff")));
  const draw = async () => {
    const n = (await mineQ()).size;
    app.innerHTML = `<div class="panel narrow"><h2>Заполнить каталог</h2>
      <p style="margin:12px 0">Твоих товаров в базе сейчас: <b>${n}</b>. Кнопка добавит ${DEMO.length} изделий от 7 мастеров с картинками.</p>
      <p><button id="seed" class="btn alt">Добавить ${DEMO.length} товаров</button></p>
      <p style="margin-top:14px"><button id="wipe" class="btn danger sm">Удалить все мои товары</button></p>
      <p class="meta" id="st" style="margin-top:14px"></p></div>`;
    $("#seed").onclick = async () => {
      if (n && !confirm("В базе уже есть твои товары. Добавить ещё раз (будут дубли)?")) return;
      $("#seed").disabled = true;
      try {
      const list = [...DEMO].reverse(); // чтобы первый демо-товар оказался самым новым
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        $("#st").textContent = `Добавляю ${i + 1} из ${list.length}: ${p.title}`;
        await addDoc(collection(db, "products"), {title: p.title, category: p.category, price: p.price, desc: p.desc, image: p.image,
          sellerId: user.uid + "-" + p.sellerId.replace("demo-", ""), sellerName: p.sellerName, createdAt: serverTimestamp()});
      }
      location.href = "index.html";
      } catch (err) {
        console.error(err); $("#seed").disabled = false;
        $("#st").textContent = "Ошибка: " + (err.code || err.message) + (err.code === "permission-denied" ? " — опубликуй firestore.rules (Firestore → Rules → Publish)" : "");
      }
    };
    $("#wipe").onclick = async () => {
      if (!confirm("Удалить ВСЕ твои товары из базы?")) return;
      const s = await mineQ(); for (const d of s.docs) await deleteDoc(doc(db, "products", d.id));
      draw();
    };
  };
  draw();
});
