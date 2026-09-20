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

document.querySelectorAll(".project-media").forEach((image) => {
  const localSource = image.getAttribute("src");
  const productionSource = image.dataset.productionSrc;
  if (!productionSource) return;

  image.addEventListener(
    "error",
    () => {
      if (image.getAttribute("src") !== localSource) {
        image.src = localSource;
      } else {
        image.classList.add("is-missing");
      }
    },
  );
  image.src = productionSource;
});

document.querySelectorAll(".style-video").forEach((styleVideo) => {
  const markVideoUnavailable = () => {
    styleVideo.classList.add("is-unavailable");
  };
  styleVideo.addEventListener("error", markVideoUnavailable);
  styleVideo.querySelectorAll("source").forEach((source) => {
    source.addEventListener("error", markVideoUnavailable);
  });
  styleVideo.addEventListener("loadeddata", () => {
    styleVideo.classList.remove("is-unavailable");
    styleVideo.play().catch(() => {
      // Muted autoplay is normally allowed; browser-level policies may override it.
    });
  });
});

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
    input.alt = `语义图输入，第 ${index + 1} 组`;
    output.alt = `城市生成结果，第 ${index + 1} 组`;
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

const showcaseSets = [
  { clay: "./images/showcase-1-clay.webp", final: "./images/showcase-1-final.webp" },
  { clay: "./images/showcase-2-clay.webp", final: "./images/showcase-2-final.webp" },
  { clay: "./images/showcase-3-clay.webp", final: "./images/showcase-3-final.webp" },
  { clay: "./images/showcase-4-clay.webp", final: "./images/showcase-4-final.webp" },
];

document.querySelectorAll("[data-showcase-carousel]").forEach((carousel) => {
  const clay = carousel.querySelector("[data-showcase-clay]");
  const finalRender = carousel.querySelector("[data-showcase-final]");
  const previous = carousel.querySelector(".showcase-prev");
  const next = carousel.querySelector(".showcase-next");
  let index = 0;

  const renderShowcaseSet = (nextIndex) => {
    index = (nextIndex + showcaseSets.length) % showcaseSets.length;
    const set = showcaseSets[index];
    clay.src = set.clay;
    finalRender.src = set.final;
    clay.alt = `第 ${index + 1} 组城市白模预览`;
    finalRender.alt = `第 ${index + 1} 组 Cycles 最终渲染`;
  };

  previous.addEventListener("click", (event) => {
    event.stopPropagation();
    renderShowcaseSet(index - 1);
  });
  next.addEventListener("click", (event) => {
    event.stopPropagation();
    renderShowcaseSet(index + 1);
  });
  carousel.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    renderShowcaseSet(index + 1);
  });
});

const technicalDetails = {
  "city-generation": {
    title: "双路径城市生成",
    body: `
      <h3>地图数据</h3>
      <p>导入城市道路、建筑和地形信息，自动整理成可编辑的三维场景。</p>
      <h3>语义图</h3>
      <p>读取城市空间中的语义信息，将不同区域转换为建筑、道路、水体和绿地。</p>
      <h3>生成结果</h3>
      <p>两种输入方式都可以进入同一套场景生成流程，并继续进行局部编辑和渲染。</p>
    `,
  },
  "agent-execution": {
    title: "Agent 场景执行",
    body: `
      <h3>理解指令</h3>
      <p>将自然语言转换为场景查询、生成、编辑、相机和渲染等具体操作。</p>
      <h3>分步执行</h3>
      <p>每条命令都记录当前工具、步骤结果和停止状态；多步骤协议在已有场景修改后失败时会明确报告部分完成。</p>
      <h3>保留人工确认</h3>
      <p>需要绘制、选择或确认的环节会保存为有有效期的待处理动作，即使关闭普通历史也能在下一条命令继续。</p>
      <h3>轻量上下文</h3>
      <p>保留近期完整任务并摘要旧内容，精简过长工具结果和历史图片，控制模型上下文增长。</p>
    `,
  },
  "city-elements": {
    title: "程序化城市元素",
    body: `
      <h3>可编辑建筑</h3>
      <p>从建筑底面轮廓生成独立建筑，并支持高度、位置、旋转和外观调整。</p>
      <h3>城市基础设施</h3>
      <p>道路、河流、隧道和高架可以按场景需要分步添加，并保留后续编辑空间。</p>
      <h3>从预览到成片</h3>
      <p>先用快速预览检查构图，再使用高质量渲染输出最终画面。</p>
    `,
  },
};

const detailsDialog = document.querySelector("[data-details-dialog]");
const detailsTitle = document.querySelector("#details-title");
const detailsContent = document.querySelector("#details-content");
const closeDetails = () => {
  if (!detailsDialog) return;
  detailsDialog.hidden = true;
  document.body.classList.remove("dialog-open");
};

document.querySelectorAll("[data-detail]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = technicalDetails[button.dataset.detail];
    if (!detail || !detailsDialog) return;
    detailsTitle.textContent = detail.title;
    detailsContent.innerHTML = detail.body;
    detailsDialog.hidden = false;
    document.body.classList.add("dialog-open");
  });
});

document.querySelectorAll("[data-details-close]").forEach((element) => {
  element.addEventListener("click", closeDetails);
});

const mediaDialog = document.querySelector("[data-media-dialog]");
const mediaContent = document.querySelector("[data-media-content]");
const closeMedia = () => {
  if (!mediaDialog) return;
  mediaDialog.hidden = true;
  mediaContent.replaceChildren();
  document.body.classList.remove("dialog-open");
};

document.querySelectorAll("main img, main video").forEach((media) => {
  if (media.closest(".hero-media")) return;
  media.classList.add("media-zoomable");
  media.addEventListener("click", (event) => {
    event.stopPropagation();
    if (!mediaDialog || !mediaContent) return;

    const enlarged = media.cloneNode(true);
    if (enlarged.tagName === "VIDEO") {
      enlarged.controls = true;
      enlarged.autoplay = true;
      enlarged.loop = true;
      enlarged.muted = true;
      enlarged.classList.add("media-dialog-video");
    } else {
      enlarged.classList.add("media-dialog-image");
    }

    mediaContent.replaceChildren(enlarged);
    mediaDialog.hidden = false;
    document.body.classList.add("dialog-open");
    if (enlarged.tagName === "VIDEO") {
      enlarged.play().catch(() => {});
    }
  });
});

document.querySelectorAll("[data-media-close]").forEach((element) => {
  element.addEventListener("click", closeMedia);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDetails();
  if (event.key === "Escape") closeMedia();
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

