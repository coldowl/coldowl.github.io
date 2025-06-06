document.addEventListener("DOMContentLoaded", function () {
  const mermaidBlocks = document.querySelectorAll(
    ".highlight-source-mermaid pre"
  );

  mermaidBlocks.forEach((block, index) => {
    const graphDefinition = block.innerText;

    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.margin = "20px 0";

    const mermaidDiv = document.createElement("div");
    mermaidDiv.className = "mermaid";
    mermaidDiv.textContent = graphDefinition;
    mermaidDiv.style.maxWidth = "100%";
    mermaidDiv.style.maxHeight = "400px";
    mermaidDiv.style.overflow = "auto";
    mermaidDiv.style.border = "1px solid #ddd";
    mermaidDiv.style.padding = "10px";
    mermaidDiv.style.borderRadius = "6px";
    mermaidDiv.style.background = "#fafafa";

    const button = document.createElement("button");
    button.innerText = "查看大图";
    button.style.position = "absolute";
    button.style.top = "10px";
    button.style.right = "10px";
    button.style.padding = "5px 10px";
    button.style.fontSize = "12px";
    button.style.cursor = "pointer";
    button.style.border = "1px solid #ccc";
    button.style.borderRadius = "4px";
    button.style.background = "#fff";

    button.addEventListener("click", () => {
      showOverlay(graphDefinition);
    });

    container.appendChild(mermaidDiv);
    container.appendChild(button);

    block.parentNode.replaceWith(container);
  });

  if (mermaidBlocks.length > 0) {
    mermaid.initialize({ startOnLoad: false });
    mermaid.init(undefined, ".mermaid");
  }

  function showOverlay(graphDefinition) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0, 0, 0, 0.8)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const content = document.createElement("div");
    content.style.position = "relative";
    content.style.maxWidth = "95vw";
    content.style.maxHeight = "95vh";
    content.style.overflow = "auto";
    content.style.background = "#fff";
    content.style.padding = "20px";
    content.style.borderRadius = "8px";
    content.style.textAlign = "center";

    const bigMermaid = document.createElement("div");
    bigMermaid.className = "mermaid";
    bigMermaid.textContent = graphDefinition;
    // bigMermaid.style.display = "inline-block";
    bigMermaid.style.minWidth = "1200px";
    bigMermaid.style.minHeight = "600px";
    bigMermaid.style.maxWidth = "90vw";
    bigMermaid.style.maxHeight = "80vh";
    bigMermaid.style.margin = "0 auto";
    bigMermaid.style.display = "block";
    bigMermaid.style.border = "2px dashed #999";

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "×";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    closeBtn.style.fontSize = "20px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.color = "#333";
    closeBtn.style.zIndex = "10";  // 确保它盖在上方

    closeBtn.addEventListener("click", () => {
      overlay.remove();
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    content.appendChild(closeBtn);
    content.appendChild(bigMermaid);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    mermaid.initialize({ startOnLoad: false });
    mermaid.init(undefined, bigMermaid);

    let scale = 1.0;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    // 缩放功能（以鼠标为中心）
    bigMermaid.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY;

      const rect = bigMermaid.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      bigMermaid.style.transformOrigin = `${offsetX}px ${offsetY}px`;

      if (delta < 0) {
        scale += 0.1;
      } else {
        scale = Math.max(0.1, scale - 0.1);
      }

      updateTransform();
    });

    // 拖动功能
    bigMermaid.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      translateX += dx;
      translateY += dy;
      updateTransform();
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    bigMermaid.addEventListener("dblclick", () => {
      scale = 1.0;
      translateX = 0;
      translateY = 0;
      updateTransform();
    });

    // 更新 transform 样式
    function updateTransform() {
      bigMermaid.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
  }
});
