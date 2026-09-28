// Демо-товары: показываются, пока Firebase не подключён или в базе нет ни одного товара.
// Этот же список заливает в базу страница seed.html (один клик).
const pal = [["#f3d9a4","#26346b"],["#f2d0c4","#7a3b52"],["#d9ead3","#2f6b57"],["#f1dcc0","#8a5a2b"],["#f6c9b8","#3b4a8f"],["#ffe3a3","#5b3a75"],["#cfe3f0","#c0562f"],["#eadcf2","#3d5a80"]];
const A = {
 "Керамика": [
  (c,b) => `<g stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"><path d="M190 100L160 38M200 100V26M212 100L242 44"/></g><g fill="${c}"><circle cx="160" cy="36" r="9"/><circle cx="200" cy="24" r="9"/><circle cx="242" cy="42" r="9"/></g><rect x="140" y="95" width="120" height="18" rx="6" fill="${c}"/><path d="M150 110h100l-10 30c50 30 50 130 0 170h-80c-50-40-50-140 0-170z" fill="${c}"/><path d="M170 150c-22 40-22 100 0 140" stroke="#fff" stroke-opacity=".35" stroke-width="10" fill="none" stroke-linecap="round"/>`,
  (c,b) => `<path d="M270 165h22a38 38 0 0 1 0 90h-22" fill="none" stroke="${c}" stroke-width="18"/><rect x="118" y="130" width="154" height="176" rx="24" fill="${c}"/><rect x="118" y="130" width="154" height="18" rx="9" fill="#fff" opacity=".25"/><path d="M150 190h90M150 220h90" stroke="#fff" stroke-opacity=".4" stroke-width="6" stroke-linecap="round"/><path d="M165 110q-12-18 0-34M200 110q-12-18 0-34M235 110q-12-18 0-34" stroke="${c}" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/>`],
 "Текстиль": [
  (c,b) => `<rect x="80" y="90" width="240" height="210" rx="6" fill="${c}"/>${[0,1,2,3,4].map(i=>`<rect x="${100+i*50}" y="90" width="14" height="210" fill="#fff" opacity=".28"/>`).join("")}${[0,1,2,3].map(i=>`<rect x="80" y="${120+i*48}" width="240" height="10" fill="#fff" opacity=".28"/>`).join("")}<path d="${Array.from({length:16},(_, i)=>`M${88+i*15} 300v22`).join("")}" stroke="${c}" stroke-width="4"/>`,
  (c,b) => `<path d="M60 140q70-50 140 0t140 0v56q-70 50-140 0t-140 0z" fill="${c}"/><path d="M60 168q70-50 140 0t140 0" stroke="#fff" stroke-opacity=".45" stroke-width="8" fill="none"/><path d="M60 190q70-50 140 0t140 0" stroke="#fff" stroke-opacity=".3" stroke-width="5" fill="none"/><rect x="292" y="190" width="40" height="120" rx="4" fill="${c}"/><path d="${Array.from({length:6},(_, i)=>`M${297+i*7} 310v20`).join("")}" stroke="${c}" stroke-width="3"/>`],
 "Украшения": [
  (c,b) => `<circle cx="200" cy="245" r="80" fill="none" stroke="${c}" stroke-width="16"/><polygon points="200,110 236,148 200,192 164,148" fill="${c}"/><polygon points="200,110 218,148 200,192 182,148" fill="#fff" opacity=".3"/>`,
  (c,b) => [110,250].map(x=>`<path d="M${x+30} 80a22 22 0 1 1 22 22" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><circle cx="${x+30}" cy="126" r="10" fill="${c}"/><path d="M${x+30} 140c-36 50-36 100 0 130 36-30 36-80 0-130z" fill="${c}"/><path d="M${x+18} 175c-10 25-6 50 4 65" stroke="#fff" stroke-opacity=".4" stroke-width="7" fill="none" stroke-linecap="round"/>`).join("")],
 "Дерево": [
  (c,b) => `<rect x="60" y="150" width="240" height="130" rx="22" fill="${c}"/><circle cx="270" cy="215" r="13" fill="${b}"/><path d="M90 185q60-14 120 0t60 0M90 215q60-14 120 0M90 245q60-14 120 0t60 0" stroke="#fff" stroke-opacity=".4" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M300 215h40" stroke="${c}" stroke-width="0"/>`,
  (c,b) => `<rect x="100" y="185" width="200" height="115" rx="10" fill="${c}"/><path d="M100 185l24-58h152l24 58z" fill="${c}" opacity=".75"/><rect x="184" y="174" width="32" height="30" rx="5" fill="#fff" opacity=".7"/><path d="M118 235h164" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>`],
 "Свечи и мыло": [
  (c,b) => `<path d="M200 70c30 32 22 56 0 68-22-12-30-36 0-68z" fill="#e8a91f"/><path d="M200 100c12 14 8 26 0 32-8-6-12-18 0-32z" fill="#fff" opacity=".8"/><rect x="196" y="136" width="8" height="30" fill="${c}"/><rect x="140" y="165" width="120" height="145" rx="14" fill="${c}"/><rect x="156" y="212" width="88" height="56" rx="6" fill="#fff" opacity=".6"/><path d="M170 232h60M170 248h40" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`,
  (c,b) => `<rect x="105" y="250" width="190" height="58" rx="16" fill="${c}"/><rect x="120" y="190" width="160" height="58" rx="16" fill="${c}" opacity=".78"/><rect x="138" y="130" width="124" height="58" rx="16" fill="${c}" opacity=".55"/><rect x="190" y="130" width="20" height="178" fill="#fff" opacity=".4"/><path d="M200 130c-22-26 6-40 0-40M200 130c22-26-6-40 0-40" stroke="${c}" stroke-width="5" fill="none"/>`],
 "Кожа": [
  (c,b) => `<rect x="100" y="150" width="200" height="135" rx="18" fill="${c}"/><rect x="113" y="163" width="174" height="109" rx="11" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-dasharray="10 8"/><rect x="128" y="120" width="120" height="70" rx="10" fill="${c}" opacity=".7"/><rect x="128" y="120" width="120" height="70" rx="10" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-dasharray="8 7"/>`,
  (c,b) => `<path d="M150 158a50 56 0 0 1 100 0" fill="none" stroke="${c}" stroke-width="15"/><rect x="92" y="150" width="216" height="155" rx="22" fill="${c}"/><path d="M92 205h216" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-dasharray="10 8"/><circle cx="200" cy="222" r="11" fill="#fff" opacity=".75"/>`],
 "Игрушки": [
  (c,b) => `<circle cx="150" cy="105" r="20" fill="${c}"/><circle cx="250" cy="105" r="20" fill="${c}"/><circle cx="200" cy="245" r="72" fill="${c}"/><circle cx="200" cy="145" r="52" fill="${c}"/><ellipse cx="200" cy="255" rx="36" ry="42" fill="#fff" opacity=".22"/><circle cx="180" cy="138" r="6" fill="#fff"/><circle cx="220" cy="138" r="6" fill="#fff"/><ellipse cx="200" cy="158" rx="14" ry="10" fill="#fff" opacity=".8"/><circle cx="200" cy="154" r="5" fill="${c}"/><circle cx="142" cy="220" r="20" fill="${c}"/><circle cx="258" cy="220" r="20" fill="${c}"/>`,
  (c,b) => `<ellipse cx="165" cy="75" rx="17" ry="52" fill="${c}"/><ellipse cx="235" cy="75" rx="17" ry="52" fill="${c}"/><ellipse cx="165" cy="80" rx="7" ry="34" fill="#fff" opacity=".35"/><ellipse cx="235" cy="80" rx="7" ry="34" fill="#fff" opacity=".35"/><ellipse cx="200" cy="255" rx="70" ry="66" fill="${c}"/><circle cx="200" cy="165" r="52" fill="${c}"/><circle cx="182" cy="160" r="6" fill="#fff"/><circle cx="218" cy="160" r="6" fill="#fff"/><ellipse cx="200" cy="178" rx="8" ry="6" fill="#fff" opacity=".85"/><circle cx="262" cy="285" r="16" fill="#fff" opacity=".5"/>`],
 "Другое": [
  (c,b) => `<g transform="rotate(-9 200 220)"><rect x="90" y="120" width="150" height="190" rx="8" fill="#fff"/></g><g transform="rotate(7 200 220)"><rect x="150" y="105" width="160" height="200" rx="8" fill="${c}"/><g transform="translate(230 205)"><circle r="14" fill="#fff"/>${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-26" rx="11" ry="17" fill="#fff" transform="rotate(${a})"/>`).join("")}<circle r="10" fill="#e8a91f"/></g></g>`,
  (c,b) => `<rect x="90" y="90" width="220" height="230" rx="6" fill="${c}"/><rect x="112" y="112" width="176" height="186" fill="#fff"/><path d="M112 298l60-88 40 50 30-36 46 74z" fill="${c}" opacity=".85"/><circle cx="250" cy="160" r="20" fill="#e8a91f"/>`]
};
const art = (cat, v, i) => { const [bg, fg] = pal[i % pal.length];
  return "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><circle cx="200" cy="200" r="178" fill="#fff" opacity=".28"/><ellipse cx="200" cy="336" rx="118" ry="13" fill="#000" opacity=".12"/>${A[cat][v](fg, bg)}</svg>`); };
const sellers = {s1:"Мастерская Ольги", s2:"Ткань и Нить", s3:"Серебряная нить", s4:"Дом Дуба", s5:"Тёплый воск", s6:"Мелочи мастера", s7:"Бумажный лес"};
// [мастер, название, категория, цена, описание, вариант рисунка 0/1]
const raw = [
 ["s1","Ваза «Утро»","Керамика",3200,"Ваза ручной лепки, глазурь цвета молока. Высота 22 см. Подходит для сухоцветов и свежих букетов. Каждая ваза немного отличается от другой.",0],
 ["s1","Кружка «Дымок»","Керамика",1400,"Кружка на 320 мл, ручная лепка, обжиг при 1200 °C. Можно мыть в посудомоечной машине и греть в микроволновке.",1],
 ["s1","Ваза «Полдень»","Керамика",3600,"Высокая ваза с матовой глазурью, высота 26 см. Внутри покрыта глазурью — можно ставить свежие цветы с водой.",0],
 ["s2","Льняной плед с вышивкой","Текстиль",7900,"Плед 140×200 из умягчённого льна. Вышивка выполнена вручную, на один плед уходит около двух недель.",0],
 ["s2","Шарф из мериносовой шерсти","Текстиль",3600,"Мягкий тёплый шарф, не колется. Связан на спицах. Стирка при 30 °C, сушка в горизонтальном положении.",1],
 ["s2","Клетчатый плед «Осень»","Текстиль",6400,"Плотный хлопковый плед 130×170 см с бахромой по краю. Хорошо держит тепло и не электризуется.",0],
 ["s3","Серьги «Капля»","Украшения",5400,"Серебро 925, ручная ковка. Длина 3 см. Приходят в льняном мешочке.",1],
 ["s3","Кольцо с лабрадоритом","Украшения",6200,"Серебряное кольцо с натуральным камнем. Размер подбирается под вас — напишите мастеру после заказа.",0],
 ["s3","Серьги «Роса»","Украшения",4700,"Лёгкие серьги-капли из серебра 925, длина 2,5 см. Гипоаллергенная застёжка.",1],
 ["s4","Разделочная доска из дуба","Дерево",2900,"Массив дуба, пропитка пищевым маслом. Размер 40×22 см. Есть отверстие, чтобы повесить.",0],
 ["s4","Шкатулка из ореха","Дерево",4100,"Шкатулка с откидной крышкой и войлочным дном. Собрана без гвоздей, на шипах.",1],
 ["s4","Доска для сыра из ясеня","Дерево",2400,"Светлый ясень, шлифовка вручную, покрытие воском и льняным маслом. Размер 35×18 см.",0],
 ["s5","Соевая свеча «Кедр»","Свечи и мыло",1200,"Соевый воск, хлопковый фитиль, эфирное масло кедра. Горит около 40 часов.",0],
 ["s5","Набор мыла ручной работы","Свечи и мыло",950,"Три куска мыла холодным способом: овсянка с мёдом, лаванда и шалфей. Без пальмового масла.",1],
 ["s5","Свеча «Тёплый хлеб»","Свечи и мыло",1350,"Соевый воск с ароматом ванили и корицы, стеклянная банка 200 мл. Горит около 45 часов.",0],
 ["s6","Кожаный кардхолдер","Кожа",2300,"Растительное дубление, ручная прошивка вощёной нитью. Вмещает до 6 карт и сложенные купюры.",0],
 ["s6","Сумка-шоппер из кожи","Кожа",8900,"Мягкая натуральная кожа, вместительная, с внутренним карманом на молнии. Ручная прошивка.",1],
 ["s6","Картхолдер «Кофе»","Кожа",2100,"Компактный картхолдер цвета кофе с молоком. Кожа растительного дубления, со временем темнеет и хорошеет.",0],
 ["s6","Вязаный мишка","Игрушки",2700,"Игрушка из хлопковой пряжи, набивка гипоаллергенная. Высота 25 см. Безопасна для детей от года.",0],
 ["s6","Вязаный зайчик","Игрушки",2500,"Мягкий зайчик из хлопковой пряжи, высота 30 см. Можно стирать при 30 °C. Подходит с рождения.",1],
 ["s6","Мишка «Соня»","Игрушки",2900,"Сонный мишка из плюшевой пряжи, высота 28 см. Гипоаллергенный наполнитель, безопасен для детей.",0],
 ["s7","Набор открыток «Луг»","Другое",780,"Пять открыток на плотной бумаге с рисунком и тиснением, конверты в комплекте. Формат А6.",0],
 ["s7","Картина «Горы на рассвете»","Другое",5200,"Авторская работа на холсте 30×40 см, акрил. Уже на подрамнике, крепления в комплекте.",1],
 ["s7","Открытки «Цветы»","Другое",820,"Набор из пяти открыток ручной росписи, бумага 300 г/м². Конверты из крафта в комплекте.",0]
];
const cnt = {};
export const DEMO = raw.map(([s, title, category, price, desc, v], i) => ({
  id: "demo-" + (i + 1), title, category, price, desc, image: art(category, v, i),
  sellerId: "demo-" + s, sellerName: sellers[s], demo: true }));
