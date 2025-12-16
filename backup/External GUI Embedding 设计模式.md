# External GUI Embedding 设计模式

> **在不修改第三方程序源码的前提下，将其 GUI 嵌入到自己的应用中，作为系统的一部分运行。**

这篇文章并不讲 Qt API 细节，而是从**工程与架构视角**，系统性地总结一种在实际项目中反复出现、却很少被正式命名的设计模式。

## 为什么会需要这种模式

在实际工程中，你经常会遇到以下情况：

* 已有一个**成熟但不可修改源码**的第三方 GUI 程序
* 它实现了关键功能（远程控制、监控、工业配置、运维工具等）
* 你需要把它**整合进自己的系统**，而不是让用户单独启动

目标往往不是“启动它”，而是：

> **让用户感觉它本来就是你系统里的一个界面模块。**

这就引出了一个核心矛盾：

* 你的系统有自己的 UI 框架（Qt / Web / MFC 等）
* 第三方程序是**独立进程 + 独立窗口**

如何跨越这条边界？

## 核心思想

在工程实践中，这类方案可以抽象为一个设计模式：

> **External GUI Embedding Pattern**
> （外部 GUI 托管 / 寄生式集成模式）

其核心思想就是

> **不要把第三方程序当作“应用”，而是把它当作“一个失控但可被约束的 UI 组件”。**

这一认知决定了整个设计方向。落实到代码层面，就是通过操作系统窗口机制，将外部进程的顶级窗口“降级”为宿主程序的子窗口。

## 模式结构（角色划分）

```
+-----------------------------+
| Host Application (宿主)     |
|                             |
|  +-----------------------+  |
|  | Embed Controller      |  |  ← 核心协调者
|  +-----------------------+  |
|       |           |         |
|       v           v         |
| Process Manager  Window     |
|                  Manager   |
+-----------------------------+
```

### 1. Host Application（宿主程序）

* 你的主应用（Qt 程序）
* 负责整体 UI、业务逻辑
* **不直接操作系统窗口 API**

### 2. Embed Controller（嵌入控制器）

这是整个模式的**核心角色**。

职责：

* 协调进程、窗口、UI 的生命周期
* 管理时序，避免“窗口未就绪就操作”
* 决定嵌入 / 隐藏 / 销毁的时机

它是一个**状态机 + 调度器**。

### 3. Process Manager（进程管理器）

职责抽象为：

* 启动外部程序
* 判断运行状态
* 获取 PID
* 优雅终止 / 强制终止

关键原则：

> **进程 ≠ 窗口**

进程存在，并不意味着窗口已经创建。

### 4. Window Manager（窗口管理器）

职责抽象为：

* 枚举系统窗口
* 按 PID / 属性匹配目标窗口
* 隐藏无关窗口
* 将目标窗口嵌入宿主

关键原则：

> **永远不要依赖窗口标题来判断身份。**

## 标准时序（黄金流程）

这是该模式在实践中总结出的**稳定执行顺序**：

```
启动第三方进程
   ↓
进程已启动（但窗口未必存在）
   ↓
等待并扫描系统窗口
   ↓
发现目标窗口
   ↓
区分可嵌入窗口 / 无关窗口
   ↓
隐藏无关窗口
   ↓
嵌入目标窗口
   ↓
运行期监控
   ↓
优雅关闭
```

任何跳过或打乱该顺序的实现，通常都会在某些环境下变得不稳定。

## 关键设计原则

### 窗口只是“副产物”

窗口不是目标，只是功能的载体。

因此必须接受：

* 窗口可能被销毁后重建
* 必须支持重新绑定

### 时间不可靠，只能事件驱动

反模式：

* 固定 sleep
* while(1) 忙等

正确模式：

* 事件 + 轮询 + 超时
* 可中断、可恢复

### 嵌入是“降权行为”

你做的不是扩展，而是：

> **把一个完整应用降级为受控子窗口。**

操作系统和窗口管理器**不保证长期稳定支持**。

### 宿主必须“随时拔掉它”

健康的系统应当满足：

* 第三方程序崩溃
* 窗口消失
* 嵌入失败

宿主程序仍然可以继续运行。

## 典型应用场景

* 教学 / 远控一体化平台（Veyon、RDP 工具）
* 工业控制台（老旧 GUI 工具包壳）
* 运维 / 安全平台（多工具统一界面）
* Kiosk / 专用终端系统

场景设定：教学机房一体化控制台

背景：
某教学机房已经部署了 Veyon 用于学生屏幕监控与远程控制，但学校同时希望：
使用一套自研 Qt 教学平台作为统一入口
教师只看到“一个软件”
禁止学生或教师直接操作原生 Veyon 窗口

约束条件：
Veyon 不允许修改源码
必须保留其全部功能
系统运行在 Linux + X11 环境

解决方案：
使用 External GUI Embedding Pattern，将 Veyon 主窗口嵌入到 Qt 教学平台中。

```c++
TVeyonWidget::TVeyonWidget(QWidget *parent)
    : QWidget(parent)
    , m_process(new QProcess(this))
{
    auto *layout = new QHBoxLayout(this);
    layout->setContentsMargins(0,0,0,0);

    connect(m_process, &QProcess::started, this, &TVeyonWidget::onProcessStarted);
    connect(m_process, QOverload<int, QProcess::ExitStatus>::of(&QProcess::finished),
            this, &TVeyonWidget::onProcessFinished);

    m_process->start(m_program);
}

TVeyonWidget::~TVeyonWidget()
{
    if (m_veyonWindow) {
        m_veyonWindow->close();
    }
    if (m_process->state() != QProcess::NotRunning) {
        m_process->terminate();
        m_process->waitForFinished(3000);
    }
}

void TVeyonWidget::onProcessStarted()
{
    m_pid = m_process->processId();

    auto *timer = new QTimer(this);
    timer->setInterval(200);

    connect(timer, &QTimer::timeout, this, [this, timer]() {
        WId wid = findWindowByPid(m_pid);
        if (wid) {
            timer->stop();
            timer->deleteLater();
            embedWindow(wid);
        }
    });

    timer->start();
}

void TVeyonWidget::onProcessFinished()
{
    qWarning() << "Veyon process exited";
}

void TVeyonWidget::embedWindow(WId wid)
{
    m_veyonWindow = QWindow::fromWinId(wid);
    m_veyonContainer = QWidget::createWindowContainer(m_veyonWindow, this);
    layout()->addWidget(m_veyonContainer);
}

WId TVeyonWidget::findWindowByPid(qint64 pid)
{
    QProcess proc;
    proc.start("xprop -root _NET_CLIENT_LIST");
    proc.waitForFinished();

    const QString out = proc.readAllStandardOutput();
    const auto ids = out.split(",", Qt::SkipEmptyParts);

    for (const QString &idStr : ids) {
        bool ok = false;
        WId wid = idStr.trimmed().remove("0x").toULong(&ok, 16);
        if (!ok) continue;

        QProcess p;
        p.start(QString("xprop -id 0x%1 _NET_WM_PID").arg(QString::number(wid, 16)));
        p.waitForFinished();
        if (p.readAllStandardOutput().contains(QString::number(pid))) {
            return wid;
        }
    }
    return 0;
}
```
## 什么时候不该使用该模式

明确的一条工程红线：

> **只要你能改源码，就不要用 External GUI Embedding。**

以下情况应优先选择：

* 官方 API / SDK
* 插件机制
* 无 GUI 服务模式

## 工程总结

> **External GUI Embedding 是系统集成的“最后手段”，不是常规架构方案。**

使用它，意味着你清楚：

* 自己正在跨越进程边界
* 正在和操作系统窗口系统打交道
* 正在承担不稳定性的工程风险

但在不可避免的现实条件下，它依然是**唯一可行、且被反复验证有效的方案**。
