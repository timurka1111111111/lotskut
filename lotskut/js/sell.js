import {db, collection, addDoc, serverTimestamp} from "./firebase.js";
import {boot, needSetup, $, toast, CATS, CUR} from "./common.js";

boot(async (user, app) => {
  if (needSetup(app)) return;
  if (!user) {
    app.innerHTML = `<div class="panel narrow empty">Чтобы продавать, нужен аккаунт.<p style="margin-top:14px"><a class="btn" href="login.html#up">Создать аккаунт</a> <a class="btn ghost" href="login.html">Войти</a></p></div>`;
    return;
  }
  let image = "";
  app.innerHTML = `<div class="panel narrow"><h2>Новое изделие</h2>
    <label for="t">Название</label><input id="t" maxlength="80">
    <label for="c">Категория</label><select id="c">${CATS.map(c => `<option>${c}</option>`).join("")}</select>
    <label for="pr">Цена, ${CUR}</label><input id="pr" type="number" min="1">
    <label for="d">Описание (материалы, размер, срок изготовления)</label><textarea id="d" rows="4"></textarea>
    <label for="f">Фото</label><input id="f" type="file" accept="image/*"><div id="pv" style="margin-top:10px"></div>
    <p style="margin-top:20px"><button id="pub" class="btn alt">Опубликовать</button></p></div>`;
  // Фото сжимается в браузере и хранится в Firestore (Firebase Storage не нужен)
  $("#f").onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => {
      const k = Math.min(1, 700 / Math.max(im.width, im.height)), cv = document.createElement("canvas");
      cv.width = im.width * k; cv.height = im.height * k; cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
      image = cv.toDataURL("image/jpeg", .75); $("#pv").innerHTML = `<img src="${image}" style="width:140px;border-radius:6px" alt="Превью">`;
    }; im.src = r.result; };
    r.readAsDataURL(file);
  };
  $("#pub").onclick = async () => {
    const title = $("#t").value.trim(), price = +$("#pr").value, desc = $("#d").value.trim();
    if (!title || !(price > 0) || !desc) return toast("Заполните название, цену и описание");
    if (!image) return toast("Добавьте фото");
    $("#pub").disabled = true;
    try {
      await addDoc(collection(db, "products"), {title, price, desc, image, category: $("#c").value,
        sellerId: user.uid, sellerName: user.displayName || "Мастер", createdAt: serverTimestamp()});
    } catch (err) {
      console.error(err); $("#pub").disabled = false;
      return toast(err.code === "permission-denied" ? "Нет доступа: опубликуй firestore.rules в Firebase" : "Не удалось опубликовать, попробуйте ещё раз");
    }
    location.href = "index.html";
  };
});
