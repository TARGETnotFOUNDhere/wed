const $ = (s) => document.querySelector(s);
const toast = (message) => {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
};

// Countdown to the first event (India Standard Time).
function updateCountdown() {
  const target = new Date("2026-12-03T18:00:00+05:30").getTime();
  let diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000); diff %= 86400000;
  const hours = Math.floor(diff / 3600000); diff %= 3600000;
  const minutes = Math.floor(diff / 60000); diff %= 60000;
  const seconds = Math.floor(diff / 1000);
  $("#days").textContent = String(days).padStart(2, "0");
  $("#hours").textContent = String(hours).padStart(2, "0");
  $("#minutes").textContent = String(minutes).padStart(2, "0");
  $("#seconds").textContent = String(seconds).padStart(2, "0");
}
updateCountdown(); setInterval(updateCountdown, 1000);

// Mobile navigation
$(".menu-toggle").addEventListener("click", () => {
  const nav = $(".nav"); const open = nav.classList.toggle("open");
  $(".menu-toggle").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => $(".nav").classList.remove("open")));

// Invitation-card lightbox
document.querySelectorAll(".gallery-item").forEach(button => button.addEventListener("click", () => {
  $("#lightbox-image").src = button.dataset.image; $("#lightbox").classList.add("open");
}));
function closeLightbox(){ $("#lightbox").classList.remove("open"); }
$(".lightbox-close").addEventListener("click", closeLightbox);
$("#lightbox").addEventListener("click", e => { if(e.target.id === "lightbox") closeLightbox(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") closeLightbox(); });

// Wedding song player using the downloaded MP3 file.
const musicPanel = $("#music-panel");
const musicToggle = $("#music-toggle");
const musicPlayToggle = $("#music-play-toggle");
const weddingAudio = $("#wedding-audio");

function setMusicPanelOpen(open) {
  musicPanel.hidden = !open;
  musicToggle.setAttribute("aria-expanded", String(open));
}

function updateMusicControls(playing) {
  musicToggle.classList.toggle("is-playing", playing);
  musicToggle.setAttribute("aria-label", playing ? "Show wedding music player" : "Open wedding music player");
  musicPlayToggle.innerHTML = playing
    ? '<span aria-hidden="true">Ⅱ</span> Pause song'
    : '<span aria-hidden="true">▶</span> Play song';
  musicPlayToggle.disabled = false;
}

weddingAudio.addEventListener("play", () => updateMusicControls(true));
weddingAudio.addEventListener("pause", () => updateMusicControls(false));
weddingAudio.addEventListener("ended", () => updateMusicControls(false));
weddingAudio.addEventListener("error", () => {
  updateMusicControls(false);
  toast("The wedding song could not be loaded. Please try again.");
});

function startMusicOnInteraction(event) {
  if (event.type === "keydown" && event.repeat) return;
  if (event.target instanceof Element && event.target.closest("#music-play-toggle")) return;
  if (!weddingAudio.paused) return;

  void weddingAudio.play().then(() => {
    updateMusicControls(true);
    document.removeEventListener("pointerdown", startMusicOnInteraction);
    document.removeEventListener("keydown", startMusicOnInteraction);
  }).catch(() => {
    toast("The wedding song could not be played.");
  });
}

document.addEventListener("pointerdown", startMusicOnInteraction);
document.addEventListener("keydown", startMusicOnInteraction);

void weddingAudio.play().then(() => {
  updateMusicControls(true);
  document.removeEventListener("pointerdown", startMusicOnInteraction);
  document.removeEventListener("keydown", startMusicOnInteraction);
}).catch(() => {
  setMusicPanelOpen(true);
  toast("Tap or press a key to start the music.");
});

musicToggle.addEventListener("click", () => {
  const isOpen = musicPanel.hidden === false;
  setMusicPanelOpen(!isOpen);
});

$("#music-close").addEventListener("click", () => setMusicPanelOpen(false));
musicPlayToggle.addEventListener("click", async () => {
  if (weddingAudio.paused) {
    try {
      await weddingAudio.play();
    } catch {
      toast("The wedding song could not be played.");
    }
  } else {
    weddingAudio.pause();
  }
});

// Share / copy link
$("#share-button").addEventListener("click", async () => {
  const data = {title:"Raudra & Sanchi — Wedding Celebrations", text:"Join us for the wedding celebrations of Raudra & Sanchi, 3, 4 and 6 December 2026 in Mumbai.", url:location.href};
  if(navigator.share){ try { await navigator.share(data); } catch(e) {} }
  else { try { await navigator.clipboard.writeText(`${data.text} ${data.url}`); toast("Invitation details copied!"); } catch(e) { toast("Use your browser's address bar to share this page."); } }
});
$("#copy-button").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(location.href); toast("Invitation link copied!"); }
  catch(e) { toast("Copy the page address from your browser."); }
});

// Calendar downloads
const events = {
  chowki: {title:"Mata Di Chowki — Raudra & Sanchi", start:"20261203T123000", end:"20261203T160000", place:"Nimantran Banquet Hall, Ground Floor, Brahma Complex, Sakhi Bhavan Road, Sector 15, CBD Belapur, Navi Mumbai 400614"},
  wedding: {title:"Wedding Ceremony — Raudra & Sanchi", start:"20261204T133000", end:"20261204T180000", place:"Gurukripa Banquets, Vasant Vihar Commercial Complex, Near Cubic Mall, Chembur, Mumbai"},
  reception: {title:"Wedding Reception — Raudra & Sanchi", start:"20261206T133000", end:"20261206T170000", place:"V Banquets and Lawns, 9 Waman Tukaram Patil Marg, Patil Wadi, Govandi, Mumbai 400043"}
};
function icsDate(s){return s+"00";}
document.querySelectorAll(".calendar-button").forEach(btn => btn.addEventListener("click", () => {
  const e = events[btn.dataset.event];
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Raudra and Sanchi//Wedding Invitation//EN","BEGIN:VEVENT",
    `UID:${btn.dataset.event}-raudra-sanchi-2026@wedding-invitation`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"")}`,
    `DTSTART;TZID=Asia/Kolkata:${e.start}`,`DTEND;TZID=Asia/Kolkata:${e.end}`,
    `SUMMARY:${e.title}`,`LOCATION:${e.place.replace(/,/g,"\\,")}`,
    "DESCRIPTION:Wedding celebrations of Raudra and Sanchi.","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics],{type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href=url; a.download=`${btn.dataset.event}-raudra-sanchi.ics`; a.click(); URL.revokeObjectURL(url);
  toast("Calendar event downloaded!");
}));
