const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll(".reveal").forEach((element) => {
  const delay = Number(element.dataset.delay || 0);
  element.style.setProperty("--reveal-delay", `${delay}ms`);
});

if (reduceMotion || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("is-visible");
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
}

const semanticSets = [
  { input: "./images/semantic/input-1.webp", output: "./images/semantic/result-1.webp" },
  { input: "./images/semantic/input-2.webp", output: "./images/semantic/result-2.webp" },
  { input: "./images/semantic/input-3.webp", output: "./images/semantic/result-3.webp" },
];

document.querySelectorAll("[data-semantic-carousel]").forEach((carousel) => {
  const input = carousel.querySelector("[data-semantic-input]");
  const output = carousel.querySelector("[data-semantic-output]");
  const previous = carousel.querySelector(".semantic-prev");
  const next = carousel.querySelector(".semantic-next");
  let index = 0;

  const renderSemanticSet = (nextIndex) => {
    index = (nextIndex + semanticSets.length) % semanticSets.length;
    const set = semanticSets[index];
    input.src = set.input;
    output.src = set.output;
    input.alt = `Input semantic map, example ${index + 1}`;
    output.alt = `Generated city, example ${index + 1}`;
  };

  previous.addEventListener("click", (event) => {
    event.stopPropagation();
    renderSemanticSet(index - 1);
  });
  next.addEventListener("click", (event) => {
    event.stopPropagation();
    renderSemanticSet(index + 1);
  });
  carousel.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    renderSemanticSet(index + 1);
  });
});

const mediaDialog = document.querySelector("[data-media-dialog]");
const mediaContent = document.querySelector("[data-media-content]");
let mediaOpener = null;
const closeMedia = () => {
  if (!mediaDialog) return;
  mediaDialog.hidden = true;
  mediaContent.replaceChildren();
  mediaOpener?.focus();
  document.body.classList.remove("dialog-open");
};

document.querySelectorAll("main img").forEach((media) => {
  if (media.closest(".hero-media")) return;
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "image-preview-button";
  trigger.setAttribute("aria-label", `Enlarge: ${media.alt}`);
  media.replaceWith(trigger);
  trigger.append(media);
  media.classList.add("media-zoomable");
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!mediaDialog || !mediaContent) return;

    mediaOpener = trigger;
    const enlarged = media.cloneNode(true);
    enlarged.classList.add("media-dialog-image");

    mediaContent.replaceChildren(enlarged);
    mediaDialog.hidden = false;
    document.body.classList.add("dialog-open");
    mediaDialog.querySelector("button").focus();
  });
});

document.querySelectorAll("[data-media-close]").forEach((element) => {
  element.addEventListener("click", closeMedia);
});

document.addEventListener("keydown", (event) => {
  if (mediaDialog.hidden) return;
  if (event.key === "Escape") closeMedia();
  if (event.key === "Tab") { event.preventDefault(); mediaDialog.querySelector("button").focus(); }
});

const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const navigationObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "is-active",
          link.getAttribute("href") === `#${visible.target.id}`,
        );
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5] },
  );
  sections.forEach((section) => navigationObserver.observe(section));
}


const editPlayer = document.querySelector("#edit-player");
const clipCaption = document.querySelector("#clip-caption");
const clips = document.querySelectorAll(".clip-list a");
clips.forEach(link => {
  link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.getAttribute("aria-current") !== "true") {
      clips.forEach(item => item.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "true");
      editPlayer.removeAttribute("poster");
      editPlayer.src = link.href;
      editPlayer.setAttribute("aria-label", link.textContent);
      clipCaption.textContent = link.dataset.caption;
    }
    editPlayer.play().catch(() => {});
  });
});
