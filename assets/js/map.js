/* ============================================================
   Kret Check — map.js
   ทำให้หมุดบนแผนที่ใน map.html กดได้ แล้วเด้งป๊อบอัพ
   ที่ลิงก์ต่อไปยังหน้าเนื้อหาที่มีอยู่จริงในเว็บ

   หลักการ
   - เป็น progressive enhancement ล้วน ถ้าไม่มี JS แผนที่ยังเป็นภาพนิ่ง
     และรายชื่อ 40 จุดใต้แผนที่ยังอ่านได้ครบเหมือนเดิม
   - พิกัดหมุดไม่ได้เก็บซ้ำในไฟล์นี้ อ่านจาก <circle> ใน SVG โดยตรง
     ถ้าย้ายหมุดในแผนที่ ป๊อบอัพจะตามไปเอง ไม่ต้องแก้สองที่
   - เลขในไฟล์นี้คือเลขเดียวกับหมุดในแผนที่และรายชื่อใต้แผนที่

   ถ้าจะเปลี่ยนไปใช้แผนที่ที่เป็นไฟล์ภาพ (.png/.jpg) แทน SVG วาดเอง
   ดูวิธีที่ HANDOFF.md ข้อ 11 — โครงป๊อบอัพชุดนี้ใช้ต่อได้เลย
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. เส้นทางทั้ง 6 ---------- */
  var ROUTES = {
    craft: {
      name: 'เส้นทางนักปั้นและหัตถกรรม',
      note: 'กลุ่มงานดินเผาและงานฝีมือของชุมชนมอญ ส่วนใหญ่เป็นบ้านที่ยังปั้นและเผาจริง ไม่ใช่ร้านขายของที่ระลึก',
      fallback: { href: 'places/kwan-aman.html', label: 'หมู่บ้านกวานอาม่าน' }
    },
    sweet: {
      name: 'เส้นทางขนมหวาน',
      note: 'เจ้าที่ทำขนมไทยและขนมมอญขายเอง หลายเจ้าทำเป็นรอบและหมดเร็ว',
      fallback: { href: 'eat/dessert.html', label: 'ขนมหวานมอญ' }
    },
    herb: {
      name: 'เส้นทางสปา สมุนไพร เกษตร',
      note: 'กลุ่มวิสาหกิจชุมชน สมุนไพรรางแดง และสวนผลไม้กลางเกาะ',
      fallback: { href: 'index.html#places', label: 'ที่เที่ยวทั้งหมด' }
    },
    dance: {
      name: 'เส้นทางนาฏศิลป์',
      note: 'บ้านสอนนาฏศิลป์ไทยของชุมชน',
      fallback: { href: 'index.html#places', label: 'ที่เที่ยวทั้งหมด' }
    },
    bike: {
      name: 'เส้นทางนักปั่นและวัดรอบเกาะ',
      note: 'จุดที่อยู่บนเส้นทางปั่นรอบเกาะ ระยะรอบเกาะประมาณหกกิโลเมตร',
      fallback: { href: 'index.html#places', label: 'ที่เที่ยวทั้งหมด' }
    },
    pier: {
      name: 'จุดลงเรือ',
      note: 'ท่าข้ามฟากขึ้นเกาะ เรือออกถี่ในวันหยุด และห่างขึ้นในวันธรรมดา',
      fallback: { href: 'index.html#ferry', label: 'เรือข้ามฟาก' }
    }
  };

  /* ---------- 2. 40 จุด ----------
     no    เลขหมุด ตรงกับเลขในแผนที่และรายชื่อใต้แผนที่
     th/en ชื่อ ตรงกับผังเส้นทางของชุมชน
     route เส้นทางที่จุดนั้นสังกัด
     links หน้าในเว็บที่เกี่ยวข้อง ถ้าไม่ใส่จะใช้ fallback ของเส้นทางนั้น
     tel   เบอร์ที่มีอยู่ในผังเส้นทางเท่านั้น ไม่ได้ไปหามาเพิ่ม            */
  var POIS = [
    { no: 1,  th: 'กลุ่มหัตถกรรมเครื่องปั้นดินเผา หมู่ 1', en: 'Moo 1 Pottery', route: 'craft' },
    { no: 2,  th: 'ช่างหนุ่ย เครื่องปั้นดินเผา', en: 'Chang Nui Pottery', route: 'craft' },
    { no: 3,  th: 'ประดิษฐ์ทวงศ์', en: 'Praditwong Pottery Factory', route: 'craft' },
    { no: 4,  th: 'ลุงตี๋ ดินเปา', en: 'Lungti Din Pao Pottery', route: 'craft' },
    { no: 5,  th: 'บริรักษ์ เครื่องปั้นดินเผา', en: 'Borirak Pottery', route: 'craft' },
    { no: 6,  th: 'บ้านทาดดิน', en: 'Tad Din Home Pottery', route: 'craft' },
    { no: 7,  th: 'ช่างน่อง เครื่องปั้นดินเผา', en: 'Chang Nong Pottery', route: 'craft' },
    { no: 8,  th: 'ลัดดาบาติก', en: 'Ladda Batik', route: 'craft',
      note: 'งานผ้าบาติก ไม่ใช่งานดินเผา แต่อยู่ในเส้นทางหัตถกรรมเส้นเดียวกัน' },
    { no: 9,  th: 'สวนเกร็ดพุทธ', en: 'Kretput Learning Center', route: 'craft',
      note: 'ศูนย์เรียนรู้ของชุมชน ใช้เป็นที่จัดกิจกรรมและอบรม',
      links: [{ href: 'index.html#places', label: 'ที่เที่ยวทั้งหมด' }] },
    { no: 10, th: 'กลุ่มอาชีพสหกรณ์จักสานพลาสติก', en: 'Plastic Wickerwork', route: 'craft',
      note: 'งานจักสาน เป็นอีกงานฝีมือของกลุ่มอาชีพในชุมชน' },

    { no: 11, th: 'กลุ่มขนมมงคลเกาะเกร็ด (ยุพิน ขนมไทยโบราณ)', en: 'Thai Ceremonious Dessert', route: 'sweet' },
    { no: 12, th: 'ขนมไทยแม่ทองเดิม', en: 'Tongterm Thai Dessert', route: 'sweet' },
    { no: 13, th: 'ขนมทองม้วน', en: 'Waffle Thai Dessert', route: 'sweet' },
    { no: 14, th: 'ขนมดอกจอก', en: 'Lotus Blossom Cookie', route: 'sweet' },
    { no: 15, th: 'ลัดดา ปั้นขลิบ', en: 'Ladda Fried Puff', route: 'sweet' },
    { no: 16, th: 'บ้านลูกชุบ', en: 'LookChoup Home', route: 'sweet' },
    { no: 17, th: 'ปังป้าใหญ่', en: 'Pang-Pa-Yai', route: 'sweet',
      links: [{ href: 'eat/cafe.html', label: 'คาเฟ่ริมน้ำ' }, { href: 'eat/dessert.html', label: 'ขนมหวานมอญ' }] },
    { no: 18, th: 'บ้านหนมปั้น เกาะเกร็ด', en: 'Baan-Nhom-Pun Kohkret', route: 'sweet' },

    { no: 19, th: 'Her Bee กลุ่มวิสาหกิจชุมชน หมู่ 1', en: 'Herbal Balm', route: 'herb' },
    { no: 20, th: 'บ้านยาสา', en: 'Baan Yasa Herb for Health & Beauty', route: 'herb' },
    { no: 21, th: 'ร้านแป๊ะเต๋ ชาสมุนไพรรางแดง', en: 'Pae Te Rangdang Tea', route: 'herb' },
    { no: 22, th: 'สมุนไพร เค กรรณิกา', en: 'Herbal Balm', route: 'herb' },
    { no: 23, th: 'ศูนย์ส่งเสริมการแพทย์แผนไทยเพื่อสุขภาพ ต.เกาะเกร็ด', en: 'Thai Massage', route: 'herb' },
    { no: 24, th: 'บ้านสมุนไพรรางแดง “เจ๊เพ็ญ”', en: 'Jae Pen Herbal Tea', route: 'herb' },
    { no: 25, th: 'กลุ่มเกษตรกรทำสวนเกาะเกร็ด (สมุนไพรรางแดง “มงคล”)', en: 'Monkol Herbal Tea', route: 'herb' },
    { no: 26, th: 'ท่องเที่ยวเชิงเกษตร สวนเมล่อนเกาะเกร็ด', en: 'Melon Farm', route: 'herb',
      note: 'สวนเมล่อนกลางเกาะ เป็นจุดท่องเที่ยวเชิงเกษตร' },
    { no: 27, th: 'สวนทุเรียนแม่จรูญ', en: 'Mae Jaroon Farm', route: 'herb',
      note: 'สวนทุเรียนกลางเกาะ ให้ผลตามฤดู' },
    { no: 28, th: 'นฤมล สลัดโรล', en: 'Naruamon Salad Roll', route: 'herb',
      links: [{ href: 'eat/savoury.html', label: 'ของคาวบนเกาะ' }] },

    { no: 29, th: 'ครูอุ้ม นาฏศิลป์ไทยเกาะเกร็ด', en: 'Kroo Aum Thai Dance', route: 'dance' },

    { no: 30, th: 'แมวปั้น จักรยานให้เช่า', en: 'Bicycle Rental', route: 'bike',
      note: 'จุดเช่าจักรยานสำหรับปั่นรอบเกาะ',
      links: [{ href: 'plans/half-day.html', label: 'แพลนครึ่งวัน' }] },
    { no: 31, th: 'วัดปรมัยยิกาวาส', en: 'Poramaiyikawas Temple', route: 'bike',
      note: 'วัดหลักของเกาะ อยู่ใกล้ท่าเรือที่คนส่วนใหญ่ขึ้นเกาะ เจดีย์เอียงมุเตาอยู่ริมน้ำหน้าวัด',
      links: [
        { href: 'places/wat-poramai.html', label: 'วัดปรมัยยิกาวาส' },
        { href: 'places/leaning-pagoda.html', label: 'เจดีย์เอียงมุเตา' },
        { href: 'places/riverside-market.html', label: 'ตลาดริมน้ำ' }
      ] },
    { no: 32, th: 'วัดไผ่ล้อม', en: 'Phai Lom Temple', route: 'bike' },
    { no: 33, th: 'วัดเสาธงทอง', en: 'Sao Thong Thong Temple', route: 'bike' },
    { no: 34, th: 'วัดศาลากุล', en: 'Sala Kul Temple', route: 'bike' },
    { no: 35, th: 'วัดฉิมพลี', en: 'Chimphli Temple', route: 'bike' },
    { no: 36, th: 'อบต.เกาะเกร็ด', en: 'Koh Kret Subdistrict Administrative Organization', route: 'bike',
      note: 'ที่ทำการองค์การบริหารส่วนตำบล ถามทางหรือถามเรื่องกิจกรรมในชุมชนได้ที่นี่',
      tel: ['02 583 9544', '02 960 9063'] },

    { no: 37, th: 'ท่าวัดสนามเหนือ', en: 'Sa Nam Nuea Temple Pier', route: 'pier',
      note: 'ท่าฝั่งปากเกร็ด เป็นท่าที่คนส่วนใหญ่ใช้ข้ามไปขึ้นหน้าวัดปรมัยยิกาวาส' },
    { no: 38, th: 'ท่าวัดบางจาก', en: 'Bangjak Temple Pier', route: 'pier' },
    { no: 39, th: 'ท่าวัดกลางเกร็ด', en: 'Klangkret Temple Pier', route: 'pier' },
    { no: 40, th: 'ท่ามัสยิดท่าอิฐ', en: 'Ta-it Mosque Pier', route: 'pier' }
  ];

  var BY_NO = {};
  POIS.forEach(function (p) { BY_NO[p.no] = p; });

  /* ---------- 3. หา element ที่ต้องใช้ ---------- */
  var sheet = document.querySelector('[data-mapsheet]');
  var scroller = document.querySelector('[data-map-scroll]');
  var pinLayer = document.getElementById('pins');
  if (!sheet || !pinLayer) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 700px)');

  /* ---------- 4. สร้างกล่องป๊อบอัพ ---------- */
  var card = document.createElement('div');
  card.className = 'poi';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-labelledby', 'poi-name');
  card.setAttribute('data-open', 'false');
  card.hidden = true;
  card.innerHTML =
    '<button class="poi__close" type="button" aria-label="ปิด">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
        '<path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<div class="poi__head">' +
      '<span class="poi__no" data-poi-no></span>' +
      '<div><p class="poi__route" data-poi-route></p>' +
      '<h3 class="poi__name" id="poi-name" data-poi-name></h3>' +
      '<p class="poi__en" data-poi-en></p></div>' +
    '</div>' +
    '<p class="poi__note" data-poi-note></p>' +
    '<p class="poi__tel" data-poi-tel></p>' +
    '<div class="poi__links" data-poi-links></div>' +
    '<p class="poi__src">เลขหมุดและรายชื่อมาจากผังเส้นทางของชุมชน · รายละเอียดร้านรอลงพื้นที่เก็บจริง</p>';
  sheet.appendChild(card);

  var elNo = card.querySelector('[data-poi-no]');
  var elRoute = card.querySelector('[data-poi-route]');
  var elName = card.querySelector('[data-poi-name]');
  var elEn = card.querySelector('[data-poi-en]');
  var elNote = card.querySelector('[data-poi-note]');
  var elTel = card.querySelector('[data-poi-tel]');
  var elLinks = card.querySelector('[data-poi-links]');

  var openNo = null;      /* เลขจุดที่เปิดอยู่ */
  var lastFocus = null;   /* ปุ่มที่กดมา เอาไว้คืนโฟกัสตอนปิด */

  /* ---------- 5. ทำให้หมุดใน SVG กดได้ ---------- */
  var pins = {};
  Array.prototype.forEach.call(pinLayer.children, function (g) {
    var label = g.querySelector('text');
    if (!label) return;
    var no = parseInt(label.textContent, 10);
    var poi = BY_NO[no];
    if (!poi) return;

    pins[no] = g;
    g.classList.add('pin');
    g.setAttribute('data-poi', String(no));
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-haspopup', 'dialog');
    g.setAttribute('aria-expanded', 'false');
    g.setAttribute('aria-label', 'จุดที่ ' + no + ' ' + poi.th);

    g.addEventListener('click', function () { toggle(no, g); });
    g.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      e.preventDefault();
      toggle(no, g);
    });
  });

  /* ---------- 6. ทำให้เลขในรายชื่อใต้แผนที่กดได้ด้วย ----------
     เลือกเฉพาะรายชื่อใน [data-map-legend] เท่านั้น
     เพราะกลุ่ม “ที่พัก ร้านอาหาร ร้านกาแฟ” ใช้เลข 1-4 ซ้ำกัน
     แต่ไม่ได้ปักหมุดไว้ในแผนที่                                    */
  document.querySelectorAll('[data-map-legend] .route__list li').forEach(function (li) {
    var badge = li.querySelector('.route__no');
    if (!badge) return;
    var no = parseInt(badge.textContent, 10);
    if (!BY_NO[no] || !pins[no]) return;

    li.setAttribute('data-poi-item', String(no));

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = badge.className;
    btn.textContent = badge.textContent;
    btn.setAttribute('aria-label', 'ดูจุดที่ ' + no + ' บนแผนที่');
    btn.addEventListener('click', function () { jumpTo(no, btn); });
    badge.replaceWith(btn);
  });

  /* ---------- 7. เปิด / ปิด ---------- */
  function toggle(no, trigger) {
    if (openNo === no) close();
    else open(no, trigger);
  }

  function open(no, trigger) {
    var poi = BY_NO[no];
    var pin = pins[no];
    if (!poi || !pin) return;

    if (openNo !== null) clearActive(openNo);
    openNo = no;
    lastFocus = trigger || pin;

    elNo.textContent = String(no);
    elRoute.textContent = ROUTES[poi.route].name;
    elName.textContent = poi.th;
    elEn.textContent = poi.en;

    var note = poi.note || ROUTES[poi.route].note;
    elNote.textContent = note;
    elNote.hidden = !note;

    elTel.textContent = '';
    if (poi.tel && poi.tel.length) {
      elTel.appendChild(document.createTextNode('โทร '));
      poi.tel.forEach(function (t, i) {
        if (i) elTel.appendChild(document.createTextNode(' · '));
        var a = document.createElement('a');
        a.href = 'tel:' + t.replace(/\s/g, '');
        a.textContent = t;
        elTel.appendChild(a);
      });
    }
    elTel.hidden = !(poi.tel && poi.tel.length);

    elLinks.textContent = '';
    (poi.links || [ROUTES[poi.route].fallback]).forEach(function (l) {
      var a = document.createElement('a');
      a.className = 'poi__link';
      a.href = l.href;
      a.textContent = l.label;
      elLinks.appendChild(a);
    });

    card.setAttribute('data-route', poi.route);
    card.hidden = false;
    /* บังคับให้เบราว์เซอร์วาดก่อนหนึ่งเฟรม ทรานซิชันจะได้ทำงาน */
    void card.offsetWidth;
    card.setAttribute('data-open', 'true');

    pin.classList.add('is-active');
    pin.setAttribute('aria-expanded', 'true');
    var item = document.querySelector('[data-poi-item="' + no + '"]');
    if (item) item.classList.add('is-active');

    place(pin);
    card.querySelector('.poi__close').focus({ preventScroll: true });
  }

  function close() {
    if (openNo === null) return;
    clearActive(openNo);
    openNo = null;
    card.setAttribute('data-open', 'false');
    card.hidden = true;
    if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function clearActive(no) {
    if (pins[no]) {
      pins[no].classList.remove('is-active');
      pins[no].setAttribute('aria-expanded', 'false');
    }
    var item = document.querySelector('[data-poi-item="' + no + '"]');
    if (item) item.classList.remove('is-active');
  }

  /* ---------- 8. วางกล่องให้ชี้หมุด (เฉพาะจอ 700px ขึ้นไป) ----------
     จอเล็กกล่องเป็นแผ่นเลื่อนขึ้นจากขอบล่าง เพราะแผนที่เลื่อนแนวนอนได้
     ตำแหน่งหมุดจึงวิ่งไปมา ยึดกับขอบจอนิ่งกว่า — กติกาอยู่ใน map.css */
  function place(pin) {
    if (!wide.matches) return;
    var box = pin.getBoundingClientRect();
    var base = sheet.getBoundingClientRect();
    var x = box.left + box.width / 2 - base.left;
    var y = box.top - base.top;

    /* กันกล่องล้นขอบซ้ายขวาของแผ่นแผนที่ */
    var half = Math.min(300, base.width - 32) / 2;
    x = Math.max(half + 16, Math.min(base.width - half - 16, x));

    card.style.setProperty('--poi-x', x + 'px');
    card.style.setProperty('--poi-y', y + 'px');
    /* ถ้าหมุดอยู่สูงจนกล่องโผล่พ้นขอบบน ให้พลิกไปอยู่ใต้หมุดแทน */
    card.setAttribute('data-flip', String(y < card.offsetHeight + 30));
  }

  /* ---------- 9. เลื่อนจากรายชื่อไปหาหมุด ---------- */
  function jumpTo(no, trigger) {
    var pin = pins[no];
    if (!pin) return;

    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
      var box = pin.getBoundingClientRect();
      var view = scroller.getBoundingClientRect();
      var to = scroller.scrollLeft + (box.left - view.left) - view.width / 2 + box.width / 2;
      scroller.scrollTo({ left: to, behavior: reduced ? 'auto' : 'smooth' });
    }
    sheet.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });

    /* รอให้เลื่อนเสร็จก่อนค่อยวางกล่อง ไม่งั้นกล่องจะไปโผล่ผิดที่ */
    window.setTimeout(function () { open(no, trigger); }, reduced ? 0 : 320);
  }

  /* ---------- 10. ปิดกล่อง ---------- */
  card.querySelector('.poi__close').addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openNo !== null) close();
  });

  document.addEventListener('click', function (e) {
    if (openNo === null) return;
    if (card.contains(e.target)) return;
    if (e.target.closest && e.target.closest('.pin, .route__no')) return;
    close();
  });

  /* ย่อขยายหน้าต่างหรือเลื่อนแผนที่แล้วต้องตามไปวางใหม่ */
  var reposition = function () { if (openNo !== null) place(pins[openNo]); };
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, { passive: true });
  if (scroller) scroller.addEventListener('scroll', reposition, { passive: true });
})();
