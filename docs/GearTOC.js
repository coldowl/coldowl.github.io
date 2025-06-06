function createLineMenuTOC() {
  const headings = document.querySelectorAll('#content h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) return;

  // 横线按钮组容器
  const lineGroup = document.createElement('div');
  lineGroup.id = 'line-menu';
  document.body.appendChild(lineGroup);

  // 横线按钮（每条线代表一个标题）
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = heading.textContent.trim().replace(/\s+/g, '-').toLowerCase();
    }
    const line = document.createElement('div');
    line.className = `line-btn level-${heading.tagName.toLowerCase()}`;
    line.dataset.index = index;
    lineGroup.appendChild(line);
  });

  // 目录面板容器
  const tocPanel = document.createElement('div');
  tocPanel.id = 'toc-panel';
  tocPanel.innerHTML = '<div class="toc-title">CONTENTS</div>';
  document.body.appendChild(tocPanel);

  // 填充目录面板
  headings.forEach((heading, index) => {
    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    link.className = `toc-link llevel-${heading.tagName.toLowerCase()}`;
    link.style.paddingLeft = `${(parseInt(heading.tagName.charAt(1)) - 1) * 10}px`;
    tocPanel.appendChild(link);
  });
  
  // 点击目录链接，滑动定位，并高亮正文对应标题
tocPanel.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();  // 阻止 <a href> 默认跳转

    const targetId = link.getAttribute('href').substring(1);
    const targetHeading = document.getElementById(targetId);

    if (targetHeading) {
      // 平滑滚动到目标标题
      targetHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 添加高亮
      targetHeading.classList.add('highlight-heading');
      setTimeout(() => {
        targetHeading.classList.remove('highlight-heading');
      }, 1000);
    }

    // 关闭目录面板
    tocPanel.style.display = 'none';
  });
});



  // 点击横线，展开/关闭目录面板
  lineGroup.addEventListener('click', (event) => {
    event.stopPropagation();  // 阻止事件冒泡到 document
    tocPanel.style.display = tocPanel.style.display === 'block' ? 'none' : 'block';
  });

  // 点击目录面板内，阻止冒泡
  tocPanel.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // 点击其它位置，关闭目录面板
  document.addEventListener('click', () => {
    tocPanel.style.display = 'none';
  });


  // 滚动高亮当前章节对应横线
  window.addEventListener('scroll', () => {
    let activeIndex = -1;
    headings.forEach((heading, i) => {
      const rect = heading.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2) {
        activeIndex = i;
      }
    });
    document.querySelectorAll('.line-btn').forEach((line, i) => {
      line.classList.toggle('active', i === activeIndex);
    });
  });

  // 内嵌 CSS
const css = `
@media (max-width: 1249px) {
  #line-menu,
  #toc-panel {
    display: none !important;
  }
}


#line-menu {
  position: fixed;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 9999;
  cursor: pointer;
}
.line-btn {
  height: 3px;
  border-radius: 2px;
  background: #ccc;
  opacity: 0.6;
  transition: all 0.3s;
  align-self: flex-end;
}
.line-btn.active {
  opacity: 1;
  background: #C333D0;
  box-shadow: 0 0 6px rgba(0,0,0,0.2);
}
.level-h1 { width: 8px; background: #333; }
.level-h2 { width: 7px; background: #555; }
.level-h3 { width: 6px; background: #777; }
.level-h4 { width: 5px; background: #999; }
.level-h5 { width: 4px; background: #bbb; }
.level-h6 { width: 3px; background: #ccc; }

#toc-panel {
  position: fixed;
  top: 50%;
  left: 50px;
  transform: translateY(-50%);
  background: #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 240px;
  max-height: 70vh;
  overflow-y: auto;
  display: none;
  z-index: 9998;
}
#toc-panel .toc-title {
  font-weight: bold;
  font-size: 11px;
  margin-bottom: 10px;
}

#toc-panel a {
  display: block;
  text-decoration: none;
  padding: 5px 0;
  font-size: 14px;
  max-width: 222px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.llevel-h1 { color: #555; }
.llevel-h2 { color: #999; }
.llevel-h3 { color: #bbb; }
.llevel-h4 { color: #C0C0C0; }
.llevel-h5 { color: #C6C6C6; }
.llevel-h6 { color: #ccc; }

#toc-panel a:hover {
  color: #000;
}

@keyframes highlight-fade {
  0%   { background: #C333D0; }
  100% { background: transparent; }
}

.highlight-heading {
  border-radius: 3px;
  padding: 2px 4px;
  animation: highlight-fade 3s ease forwards;
}


/* 自定义滚动条样式 */
#toc-panel::-webkit-scrollbar {
  width: 4px;
}
#toc-panel::-webkit-scrollbar-track {
  background: transparent;
}
#toc-panel::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 4px;
}
#toc-panel:hover::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.25);
}
`;



  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

// 页面加载完成执行
document.addEventListener('DOMContentLoaded', createLineMenuTOC);
