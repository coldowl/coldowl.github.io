document.addEventListener("DOMContentLoaded", function () {
  const mermaidBlocks = document.querySelectorAll(".highlight-source-mermaid pre");

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
    bigMermaid.style.display = "inline-block"
    bigMermaid.style.minWidth = "1200px";
    bigMermaid.style.minHeight = "600px";

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
  }
});
