import {boot, $, CATS, cardHTML, loadProducts, demoNote} from "./common.js";

boot(async () => {
  const r = await loadProducts(), products = r.list;
  $("#note").innerHTML = demoNote(r);
  let cat = "", q = "", sort = "new";
  const cmp = {new: () => 0, cheap: (a, b) => a.price - b.price, dear: (a, b) => b.price - a.price};
  const chips = () => { $("#chips").innerHTML = ["Все", ...CATS].map(c => `<button class="chip ${(c === "Все" ? "" : c) === cat ? "on" : ""}" data-c="${c === "Все" ? "" : c}">${c}</button>`).join(""); };
  const draw = () => {
    const list = products.filter(p => (!cat || p.category === cat) && (!q || p.title.toLowerCase().includes(q))).sort(cmp[sort]);
    $("#count").textContent = "Найдено изделий: " + list.length;
    $("#grid").innerHTML = list.length ? list.map(cardHTML).join("") : `<p class="empty" style="grid-column:1/-1">Ничего не найдено. Сбросьте поиск или выберите другую категорию.</p>`;
  };
  $("#chips").onclick = e => { if (e.target.dataset.c !== undefined) { cat = e.target.dataset.c; chips(); draw(); } };
  $("#q").oninput = e => { q = e.target.value.trim().toLowerCase(); draw(); };
  $("#sort").onchange = e => { sort = e.target.value; draw(); };
  chips(); draw();
});
