import {db, collection, addDoc, serverTimestamp} from "./firebase.js";
import {boot, $, esc, fmt, img, toast, getCart, setCart} from "./common.js";

boot(async (user, app) => {
  const render = () => {
    const c = getCart();
    if (!c.length) { app.innerHTML = `<div class="panel empty">Корзина пуста. <a href="index.html"><u>Перейти в каталог</u></a></div>`; return; }
    const total = c.reduce((s, i) => s + i.price * i.qty, 0);
    app.innerHTML = `<div class="panel"><h2>Корзина</h2>${c.map((i, k) => `<div class="row">${img(i)}
      <div class="grow"><a href="product.html?id=${i.id}"><b>${esc(i.title)}</b></a><p class="meta">${fmt(i.price)}</p></div>
      <div class="qty"><button data-k="${k}" data-d="-1" aria-label="Меньше">−</button>${i.qty}<button data-k="${k}" data-d="1" aria-label="Больше">+</button></div></div>`).join("")}
      <p class="price" style="text-align:right;font-size:22px">Итого: ${fmt(total)}</p>
      <label for="nm">Имя получателя</label><input id="nm" value="${esc(user?.displayName || "")}">
      <label for="ph">Телефон</label><input id="ph" type="tel">
      <label for="ad">Адрес доставки</label><textarea id="ad" rows="2"></textarea>
      <p style="margin-top:18px"><button class="btn alt" id="buy">Оформить заказ</button></p></div>`;
    $("#buy").onclick = async () => {
      if (!db) return toast("Оформление заказов заработает после подключения Firebase");
      if (!user) { toast("Войдите, чтобы оформить заказ"); setTimeout(() => location.href = "login.html", 900); return; }
      const name = $("#nm").value.trim(), phone = $("#ph").value.trim(), address = $("#ad").value.trim();
      if (!name || !phone || !address) return toast("Заполните имя, телефон и адрес");
      const items = c.map(i => ({id: i.id, title: i.title, price: i.price, qty: i.qty, sellerId: i.sellerId || ""}));
      const sellerUids = [...new Set(items.map(i => i.sellerId.split("-s")[0]).filter(Boolean))];
      $("#buy").disabled = true;
      try {
        await addDoc(collection(db, "orders"), {userId: user.uid, buyerName: user.displayName || name, name, phone, address, items, sellerUids, total, createdAt: serverTimestamp()});
      } catch (err) {
        console.error(err); $("#buy").disabled = false;
        return toast(err.code === "permission-denied" ? "Нет доступа: опубликуй firestore.rules в Firebase" : "Не удалось оформить заказ, попробуйте ещё раз");
      }
      toast("Заказ оформлен!");
      setCart([]); setTimeout(() => location.href = "profile.html", 700);
    };
  };
  app.onclick = e => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    const c = getCart(); c[b.dataset.k].qty += +b.dataset.d;
    if (c[b.dataset.k].qty < 1) c.splice(b.dataset.k, 1);
    setCart(c); render();
  };
  render();
});
