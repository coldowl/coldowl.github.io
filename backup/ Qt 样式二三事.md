## 为什么要专门约定样式

我是在项目规模变大之后，才意识到样式是一个**必须提前管住的工程问题**。

一开始大家都会觉得 QSS 很方便：哪里不好看，哪里 `setStyleSheet()` 一下。但当窗口和控件数量上来后，很快就会遇到这些情况：

* 同类控件外观不一致，只能靠肉眼对齐
* 样式分散在构造函数、槽函数甚至业务逻辑里
* Designer、QSS、代码三套东西同时生效，没人说得清谁覆盖谁
* 想整体换风格，发现只能全工程搜索字符串

到这个阶段，UI 已经不是“不好看”，而是**不敢动**了。


## 我最终坚持的一条原则

后来我给自己定了一条死规矩：

> **样式集中管理，业务代码不写外观。**

这不是抽象原则，而是可以直接落地的三条约定：

1. 样式只在应用启动时加载一次
2. 控件差异通过属性表达，不继承、不写分支
3. Qt Designer 只负责布局

这三条如果能长期坚持，样式问题基本不会失控。


## 样式在工程里的位置

我会把样式当成一等工程资源来管理，而不是零散的配置。

目录结构一般是这样：

```text
res/
 └─ qss/
     ├─ theme.json      // 唯一入口
     ├─ base.qss       // 全局基础样式
     ├─ button.qss     // 按钮规范
     └─ view.qss       // View / Item / Scrollbar
```

`theme.json` 本身不写具体样式，只负责组织：

```json
{
  "name": "theme_name",
  "qss": [
    ":/res/qss/base.qss",
    ":/res/qss/button.qss",
    ":/res/qss/treeview.qss"
  ]
}
```

这样做的好处是：当你想重构样式时，只需要盯着这一个入口文件。


## 样式只加载一次

在代码层面，我只允许样式在 `main.cpp` 里出现一次：

```cpp
static QString loadQss(const QString &jsonPath)
{
    QFile f(jsonPath);
    f.open(QIODevice::ReadOnly | QIODevice::Text);

    const auto doc = QJsonDocument::fromJson(f.readAll());
    const auto arr = doc["qss"].toArray();

    QString out;
    for (const auto &v : arr) {
        QFile qssFile(v.toString());
        if (qssFile.open(QIODevice::ReadOnly | QIODevice::Text))
            out += QString::fromUtf8(qssFile.readAll()) + "\n";
    }
    return out;
}

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    app.setStyleSheet(loadQss(":/res/qss/theme.json"));

    MainWindow w;
    w.show();
    return app.exec();
}
```

我的约定很明确：

* 工程中不允许第二次 `setStyleSheet()`
* 窗口、控件、业务类一律不碰样式

只要破一次，这条线基本就守不住了。


## 只用属性来表示控件差异

我以前也干过一件事：为了一个按钮的外观，新写一个子类。

后来发现这会让类型体系越来越脏。

现在我统一用动态属性：

```cpp
QPushButton *btn = new QPushButton("确定");
btn->setProperty("type", "primary");
```

对应的 QSS：

```css
QPushButton[type="primary"] {
    background: #2563eb;
    color: white;
    border-radius: 6px;
}
```

这种方式的优点很实际：

* 业务代码只表达“语义”，不关心长什么样
* 不引入新的控件类型
* 想改风格，直接改 QSS


## 我给 Qt Designer 划的边界

在我的项目里，Designer 只做三件事：

* 摆控件
* 调布局
* 设 SizePolicy

明确禁止的事情也很少，但很重要：

* 不在 Designer 里改字体、颜色
* 不填写任何控件的 `styleSheet` 属性

一旦 Designer 开始参与样式，后面一定会变得说不清楚。


## 关于字体和间距的一个小技巧

QSS 没有变量，但我还是会在样式文件里**先写清规范**。

例如：

```css
/*
 Font:
  small  : 12px
  normal : 13px
  title  : 16px
*/
```

这看起来只是注释，但它能有效避免工程里到处出现随手写的数值。


## 一个我常用的基础样式示例

```css
QTreeView {
    background: #f9fafb;
    border: none;
    outline: 0;
}

QTreeView::item:selected {
    background: #2563eb;
    color: white;
}

QPushButton {
    height: 32px;
    padding: 0 12px;
    border-radius: 6px;
}
```

配合属性选择器，这一套基本能覆盖大多数桌面项目的需求。


## 踩坑之后留下的几条经验

* 样式不生效，先检查选择器
* View 类控件要重点看伪元素
* 项目越大，样式集中管理的收益越明显


## 写在最后

Qt 的样式本身并不复杂，真正复杂的是**没有工程约定**。

当你能做到把样式当成配置，而不是散落在代码里的临时修补：

* UI 修改的心理成本会明显下降
* 整体换风格才变成一件可控的事情

这套做法不追求技巧，只追求一件事：**项目活得久一点**。
