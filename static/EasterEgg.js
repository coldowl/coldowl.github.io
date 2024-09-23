function loadResource(type, attributes) {
  if (type === 'style') {
    const style = document.createElement('style');
    style.textContent = attributes.css;
    document.head.appendChild(style);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const css = `#user-content-hidden-content {
    display: none;
    opacity: 0;
    transition: opacity 1s ease;
}
#user-content-hint-message {
    display: none;
}
#user-content-hidden-content.show {
    display: block;
    opacity: 1;
}
`;
  loadResource('style', { css: css });
  
});

// 预设的触发密码
const secretCode = 'open';
// 保存用户输入的字符
let userInput = [];

document.addEventListener('keydown', function(event) {
    userInput.push(event.key);

    if (userInput.length > secretCode.length) {
        userInput.shift();
    }

    if (userInput.join('').toLowerCase() === secretCode.slice(0, 3)) {
        document.getElementById('user-content-hint-message').style.display = 'block';
    }

    if (userInput.join('').toLowerCase() === secretCode) {
        const hiddenContent = document.getElementById('user-content-hidden-content');
        hiddenContent.classList.add('show');

        // 禁用进一步的监听器
        document.removeEventListener('keydown', arguments.callee);
    }
});
