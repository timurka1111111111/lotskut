import {auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail} from "./firebase.js";
import {boot, needSetup, $, toast} from "./common.js";

const ERR = {"auth/invalid-credential": "Неверный email или пароль", "auth/user-not-found": "Такого аккаунта нет", "auth/wrong-password": "Неверный пароль",
  "auth/email-already-in-use": "Такой email уже занят", "auth/weak-password": "Пароль слишком короткий (от 6 символов)", "auth/invalid-email": "Некорректный email",
  "auth/missing-password": "Введите пароль", "auth/too-many-requests": "Слишком много попыток, подождите немного",
  "auth/network-request-failed": "Нет связи с интернетом",
  "auth/operation-not-allowed": "В Firebase не включён вход по Email/Password (Authentication → Sign-in method)"};

boot(async (user, app) => {
  if (needSetup(app)) return;
  if (user) { location.href = "profile.html"; return; }
  let reg = new URLSearchParams(location.search).get("mode") === "up" || location.hash === "#up";

  const draw = () => {
    document.title = (reg ? "Регистрация" : "Вход") + " — Лоскут";
    app.innerHTML = `<div class="panel narrow"><h2>${reg ? "Создать аккаунт" : "Вход"}</h2>
    ${reg ? `<label for="n">Имя или название мастерской</label><input id="n" autocomplete="nickname">` : ""}
    <label for="e">Email</label><input id="e" type="email" autocomplete="email"><label for="p">Пароль (от 6 символов)</label><input id="p" type="password" autocomplete="${reg ? "new-password" : "current-password"}">
    <p style="margin-top:20px"><button id="go">${reg ? "Зарегистрироваться" : "Войти"}</button></p>
    ${reg ? "" : `<p class="meta" style="margin-top:14px"><a href="#" id="forgot"><u>Забыли пароль?</u></a></p>`}
    <p class="meta" style="margin-top:14px">${reg ? "Уже есть аккаунт?" : "Впервые здесь?"}
    <a href="#" id="sw"><u>${reg ? "Войти" : "Создать аккаунт"}</u></a></p></div>`;
    $("#sw").onclick = ev => { ev.preventDefault(); reg = !reg; history.replaceState(null, "", reg ? "#up" : location.pathname); draw(); };
    $("#go").onclick = go;
    if ($("#forgot")) $("#forgot").onclick = async ev => {
      ev.preventDefault();
      const e = $("#e").value.trim(); if (!e) return toast("Впишите email, куда отправить письмо");
      try { await sendPasswordResetEmail(auth, e); toast("Письмо для сброса пароля отправлено"); }
      catch (err) { toast(ERR[err.code] || "Ошибка: " + err.code); }
    };
  };

  const go = async () => {
    const btn = $("#go"); btn.disabled = true;
    try {
      const e = $("#e").value.trim(), p = $("#p").value;
      if (reg) {
        const n = $("#n").value.trim(); if (!n) { toast("Укажите имя"); btn.disabled = false; return; }
        const c = await createUserWithEmailAndPassword(auth, e, p); await updateProfile(c.user, {displayName: n});
      } else await signInWithEmailAndPassword(auth, e, p);
      location.href = "index.html";
    } catch (err) { console.error(err); btn.disabled = false; toast(ERR[err.code] || "Ошибка: " + (err.code || err.message)); }
  };
  app.onkeydown = e => { if (e.key === "Enter") go(); };
  draw();
});
