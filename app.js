/* =========================
   BYPASS (ONLY for Page 1 timer)
   - true  => Page 1 unlocks instantly
   - false => Real countdown lock
========================= */
const BYPASS_TIMER = false;

/* =========================
   CONFIG (properties kept same)
========================= */
const CONFIG = {
  totalPages: 10,
  openAt: new Date(2026, 1, 14, 0, 0, 0),

  spotifyEmbedUrl:
    "https://open.spotify.com/embed/track/2GBgiuXwY1KzJMA0gSAr9J",

  // ✅ EASY EDIT (Pages 1–6)
  pages: {
    p1: {
      gif: "assets/gifs/gif1.gif",
      openWhen: "Open when its",
      eventName: "Valentine's Day",
      note: "DEV_MODE is ON so NEXT works now.",
    },

    p2: {
      image: "assets/cat_flower.png",
      hiText: "Hi my love!\n I got a suprise for you",
      yesGoto: 4,
      forceTryAgainAfter: 5,
      tipStart: "Try clicking NO 😈",
    },

    p3: {
      image: "assets/cat_knife.png",
      btnText: "TRY AGAIN",
    },

    p4: {
      image: "assets/warning.png",
    },

    p5: {
      image1: "assets/postbox.png",
      image2: "assets/happy_valentine.png",
    },

    p6: {
      gifts: [
        { img: "assets/gift_1.png", goto: 7, label: "Letter", anim: "animA" },
        { img: "assets/gift_2.png", goto: 8, label: "Flowers", anim: "animB" },
        { img: "assets/gift_3.png", goto: 9, label: "Moments", anim: "animC" },
        { img: "assets/gift_4.png", goto: 10, label: "Music", anim: "animD" },
      ],
    },
  },

  // ✅ Page 7–10 assets
  assets: {
    gif2: "assets/gifs/gif2.gif",
    gif3: "assets/gifs/gif3.gif",
    letterPhoto: "assets/letter_photo.png",
    momentsBg: "assets/background.png",
    moment1: "assets/moments/moment1.png",
    moment2: "assets/moments/moment2.png",
    headphones: "assets/headphones.png",
    cd: "assets/cd.png",
  },

  heartsBackground: true,
};

/* =========================
   STATE
========================= */
let page = 1;
let unlocked = false;
let timerHandle = null;

/* =========================
   DOM
========================= */
const screen = document.getElementById("screen");
const pagesBar = document.getElementById("pagesBar");
const btnBack = document.getElementById("btnBack");
const btnNext = document.getElementById("btnNext");
const hint = document.getElementById("hint");
const heartsLayer = document.getElementById("heartsLayer");

/* =========================
   NAV
========================= */
btnNext.addEventListener("click", () => {
  if (page === 1 && !unlocked) return;
  goTo(page + 1);
});

// Footer BACK: from 7/8/9/10 -> 6
btnBack.addEventListener("click", () => {
  if (page >= 7) {
    goTo(6);
    return;
  }
  goTo(page - 1);
});

function setHint(t) {
  hint.textContent = t || "";
}

function setButtons({
  back = true,
  next = true,
  nextLabel = "NEXT",
  backLabel = "BACK",
  nextDisabled = false,
}) {
  btnBack.style.visibility = back ? "visible" : "hidden";
  btnNext.style.visibility = next ? "visible" : "hidden";
  btnBack.textContent = backLabel;
  btnNext.textContent = nextLabel;
  btnNext.disabled = !!nextDisabled;
}

function renderPagesBar() {
  pagesBar.innerHTML = "";
  for (let i = 1; i <= CONFIG.totalPages; i++) {
    const chip = document.createElement("div");
    chip.className = "page-chip" + (i === page ? " active" : "");
    chip.textContent = `Page ${i}`;
    pagesBar.appendChild(chip);
  }
}

function goTo(p) {
  page = Math.max(1, Math.min(CONFIG.totalPages, p));
  render();
}

/* =========================
   HEARTS
========================= */
function spawnHeart() {
  const h = document.createElement("div");
  h.className = "heart";
  h.textContent = Math.random() < 0.7 ? "❤️" : "💗";
  h.style.left = Math.floor(Math.random() * 100) + "vw";
  h.style.animationDuration = (6 + Math.random() * 6).toFixed(2) + "s";
  h.style.setProperty("--dx", (Math.random() * 80 - 40).toFixed(0) + "px");
  h.style.fontSize = (14 + Math.random() * 16).toFixed(0) + "px";
  heartsLayer.appendChild(h);
  setTimeout(() => h.remove(), 13000);
}

let heartsHandle = null;
function startHearts() {
  if (!CONFIG.heartsBackground) return;
  if (heartsHandle) return;
  heartsHandle = setInterval(spawnHeart, 420);
}

function stopHearts() {
  if (heartsHandle) {
    clearInterval(heartsHandle);
    heartsHandle = null;
  }
  heartsLayer.innerHTML = "";
}

/* =========================
   COUNTDOWN
========================= */
function msToParts(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return { days, hours, mins, secs };
}

function stopCountdown() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function startCountdown() {
  stopCountdown();
  timerHandle = setInterval(() => {
    if (page !== 1) return;
    renderCountdownOnly();
  }, 250);
}

function renderCountdownOnly() {
  const now = new Date();
  const diff = CONFIG.openAt.getTime() - now.getTime();

  unlocked = BYPASS_TIMER ? true : diff <= 0;

  const { days, hours, mins, secs } = msToParts(diff);

  const d = document.getElementById("cd_days");
  const h = document.getElementById("cd_hours");
  const m = document.getElementById("cd_mins");
  const s = document.getElementById("cd_secs");

  if (d) d.textContent = String(days).padStart(2, "0");
  if (h) h.textContent = String(hours).padStart(2, "0");
  if (m) m.textContent = String(mins).padStart(2, "0");
  if (s) s.textContent = String(secs).padStart(2, "0");

  btnNext.disabled = !unlocked;
  setHint(unlocked ? "Unlocked ✅" : "Locked 🔒");
}

/* =========================
   UTIL
========================= */
function setScene(html) {
  screen.innerHTML = `<div class="scene">${html}</div>`;
}

function wireInPageNext() {
  const nextEls = screen.querySelectorAll("[data-next='true']");
  nextEls.forEach((el) =>
    el.addEventListener("click", () => {
      if (page === 1 && !unlocked) return;
      goTo(page + 1);
    }),
  );
}

/* =========================
   PAGES
========================= */

function page1Countdown() {
  setButtons({
    back: false,
    next: true,
    nextLabel: "NEXT",
    nextDisabled: true,
  });
  setHint("Locked 🔒");

  const p = CONFIG.pages.p1;

  setScene(`
    <div class="center-col" style="position:relative">
      <div class="gif-sticker gif-p1"><img src="${p.gif}" alt="gif1"></div>

      <div class="sub" style="font-weight:900; letter-spacing:.4px">${p.openWhen}</div>
      <div class="title">${p.eventName}</div>

      <div class="big-count">
        <div class="unit"><div class="num" id="cd_days">00</div><div class="lbl">DAYS</div></div>
        <div class="unit"><div class="num" id="cd_hours">00</div><div class="lbl">HOURS</div></div>
        <div class="unit"><div class="num" id="cd_mins">00</div><div class="lbl">MINS</div></div>
        <div class="unit"><div class="num" id="cd_secs">00</div><div class="lbl">SECS</div></div>
      </div>

      <div class="pill" data-next="true" style="margin-top:10px">NEXT</div>
    </div>
  `);

  wireInPageNext();
  renderCountdownOnly();
  startCountdown();
}

function page2YesNo() {
  stopCountdown();
  setButtons({ back: true, next: false });
  setHint("Choose 😭");

  const p = CONFIG.pages.p2;
  let noAttempts = 0;

  setScene(`
    <div class="center-col">
      <img class="p-img" id="p2-img" src="${p.image}" alt="Cute cat"/>
      <div class="title" id="hiLove"></div>

      <div class="choice-row" id="choiceRow">
        <button class="choice yes" id="btnYes">YES</button>
        <button class="choice no" id="btnNo">NO</button>
      </div>

      <div class="small-note" id="noTip">${p.tipStart}</div>
    </div>
  `);

  const hi = screen.querySelector("#hiLove");
  const msg = p.hiText;
  let i = 0;
  const t = setInterval(() => {
    if (!hi) return clearInterval(t);
    hi.textContent = msg.slice(0, i);
    i++;
    if (i > msg.length) clearInterval(t);
  }, 18);

  const btnYes = screen.querySelector("#btnYes");
  const btnNo = screen.querySelector("#btnNo");
  const row = screen.querySelector("#choiceRow");
  const tip = screen.querySelector("#noTip");

  btnYes.addEventListener("click", () => goTo(p.yesGoto));

  const runAway = () => {
    btnNo.classList.remove("shake");
    const rowRect = row.getBoundingClientRect();
    const x = Math.random() * (rowRect.width - btnNo.offsetWidth);
    const y = Math.random() * 10;
    btnNo.style.position = "absolute";
    btnNo.style.left = `${x}px`;
    btnNo.style.top = `${y}px`;
    btnNo.classList.add("shake");
  };

  const countAttempt = () => {
    noAttempts++;
    const left = Math.max(0, p.forceTryAgainAfter - noAttempts);
    tip.textContent =
      left > 0 ? `NO is running… (${left} tries left)` : "Fine. TRY AGAIN 😭";
    if (noAttempts >= p.forceTryAgainAfter) setTimeout(() => goTo(3), 200);
  };

  btnNo.addEventListener("mouseenter", () => {
    runAway();
    countAttempt();
  });
  btnNo.addEventListener("click", () => {
    runAway();
    countAttempt();
  });
}

function page3TryAgain() {
  setButtons({ back: true, next: false });
  setHint("Try again 😭");

  const p = CONFIG.pages.p3;

  setScene(`
    <div class="center-col">
      <img class="p-img" id="p3-img" src="${p.image}" alt="Try again cat"/>
      <button class="btn" id="btnTry">${p.btnText}</button>
    </div>
  `);

  screen.querySelector("#btnTry").addEventListener("click", () => goTo(2));
}

function page4Warning() {
  setButtons({ back: true, next: true, nextLabel: "NEXT" });
  setHint("Warning");

  const p = CONFIG.pages.p4;

  setScene(`
    <div class="center-col" style="width:100%">
      <img class="p-img" id="p4-img" src="${p.image}" alt="Warning image"/>
      <div class="pill" id="nextP4" data-next="true">NEXT</div>
    </div>
  `);

  wireInPageNext();
}

function page5MergedValentine() {
  setButtons({ back: true, next: false });
  setHint("Valentine ❤️");

  const p = CONFIG.pages.p5;

  setScene(`
    <div class="p5-wrap">
      <div class="p5-left">
        <img class="p5-postbox" src="${p.image1}" alt="Postbox"/>
      </div>

      <div class="p5-right">
        <img class="p5-textImg" src="${p.image2}" alt="Happy Valentine's Day"/>
        <button class="pill" id="p5Next">NEXT</button>
      </div>
    </div>
  `);

  document.getElementById("p5Next").addEventListener("click", () => goTo(6));
}

function page6GiftHub() {
  setButtons({ back: true, next: false });
  setHint("Pick one 🎁");

  const gifts = CONFIG.pages.p6.gifts;

  setScene(`
    <div class="center-col" style="width:100%">
      <div class="gift-grid">
        ${gifts
          .map(
            (g, idx) => `
          <button class="gift-card ${g.anim}" data-goto="${g.goto}" id="gift${idx}">
            <img src="${g.img}" alt="${g.label}"/>
          </button>
        `,
          )
          .join("")}
      </div>
    </div>
  `);

  gifts.forEach((g, idx) => {
    screen
      .querySelector(`#gift${idx}`)
      .addEventListener("click", () => goTo(g.goto));
  });
}

function page7Letter() {
  setButtons({ back: true, next: false });
  setHint("Letter 💌");

  setScene(`
    <div class="p7-wrap">
      <div class="p7-left">
        <div class="p7-topline">I love you more than words can express.</div>

        <div class="p7-title">
          HAPPY<br>
          NEWYEAR,<br>
          MY LOVE.
        </div>

        <div class="p7-sub">
          May our love continue to blossom and<br>
          flourish forever.
        </div>

        <div class="p7-sign">
          With all my heart,<br>
          <span class="p7-love">love</span>
        </div>
      </div>

      <div class="p7-right">
        <div class="polaroid">
          <div class="polaroid-frame">
            <img class="polaroid-img" src="${CONFIG.assets.letterPhoto}" alt="Photo">
          </div>
        </div>
      </div>

      <div class="gif-sticker gif-p7">
        <img src="${CONFIG.assets.gif2}" alt="gif2">
      </div>
    </div>
  `);
}

function page8Flowers() {
  setButtons({ back: true, next: false });
  setHint("Flowers 🌹");

  setScene(`
    <div class="p8-ref">
      <div class="p8-left">
        <div class="p8-text">
          Hey love,<br>
          I'm sending you this little<br>
          virtual bouquet. I wish I<br>
          could hand you real<br>
          flowers myself, but until I<br>
          get to see you again,<br>
          these carry a little bit of<br>
          my warmth to you.
        </div>
      </div>

      <div class="p8-right">
        <img class="p8-gif" src="${CONFIG.assets.gif3}" alt="Bouquet gif">
      </div>
    </div>
  `);
}

function page9Moments() {
  setButtons({ back: true, next: false });
  setHint("Moments 📸");

  const bg = CONFIG.assets.momentsBg;
  const m1 = CONFIG.assets.moment1;
  const m2 = CONFIG.assets.moment2;
  const hp = CONFIG.assets.headphones;

  setScene(`
    <div class="p9-refWrap">
      <img class="p9-bg" src="${bg}" alt="Background"/>

      <div class="p9-title">Best<br/>Moments!</div>

      <div class="p9-photos">
        <div class="p9-polaroid p9-m1">
          <img class="p9-img1" src="${m1}" alt="Moment 1">
        </div>

        <div class="p9-polaroid p9-m2">
          <img class="p9-img2" src="${m2}" alt="Moment 2">
        </div>
      </div>

      <img class="p9-headphones" src="${hp}" alt="Headphones"/>
    </div>
  `);
}

function page10Music() {
  setButtons({ back: true, next: false });
  setHint("Spotify 🎶");

  const embed = CONFIG.spotifyEmbedUrl || "";
  const cd = CONFIG.assets.cd;

  setScene(`
    <div class="p10-wrap">
      <div class="p10-left">
        ${
          embed
            ? `
          <iframe
            class="p10-spotify"
            src="${embed}"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
          </iframe>
        `
            : `<div class="p10-missing">No Spotify embed URL set.</div>`
        }
      </div>

      <div class="p10-right">
        <div class="p10-card">
          <div class="p10-disc">
            <img class="p10-discImg" src="${cd}" alt="CD">
            <div class="p10-hole"></div>
          </div>
        </div>
      </div>
    </div>
  `);
}

/* =========================
   MAIN
========================= */
function render() {
  renderPagesBar();

  if (CONFIG.heartsBackground) startHearts();
  else stopHearts();

  if (page === 1) page1Countdown();
  else if (page === 2) page2YesNo();
  else if (page === 3) page3TryAgain();
  else if (page === 4) page4Warning();
  else if (page === 5) page5MergedValentine();
  else if (page === 6) page6GiftHub();
  else if (page === 7) page7Letter();
  else if (page === 8) page8Flowers();
  else if (page === 9) page9Moments();
  else if (page === 10) page10Music();

  if (page !== 1) stopCountdown();
}

render();
