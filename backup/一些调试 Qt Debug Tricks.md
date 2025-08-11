1. 在 main 函数中添加 [qSetMessagePattern](https://doc.qt.io/archives/qt-5.15/qtglobal.html#qSetMessagePattern) 函数，能帮助打印出更多有用的信息。

**void qSetMessagePattern(const QString &pattern)**

函数功能：
>  **Qt 5.0** 引入的函数，用于更改默认消息处理程序的输出。
> 
> 允许调整 qDebug()、qInfo()、qWarning()、qCritical() 和 qFatal() 的输出。此外，qCDebug()、qCInfo()、qCWarning() 和 qCCritical() 的这样的分类日志输出（category logging output）格式也会进行调整。

支持以下占位符：

| 占位符 | 描述 |
| --- | --- |
| `%{appname}` | `QCoreApplication::applicationName()` 返回的应用程序名称 |
| `%{category}` | 日志类别 |
| `%{file}` | 源文件路径 |
| `%{function}` | 函数名 |
| `%{line}` | 源文件中的行号 |
| `%{message}` | 实际的日志消息内容 |
| `%{pid}` | `QCoreApplication::applicationPid()` 返回的进程 ID |
| `%{threadid}` | 当前线程的系统级 ID（如果可获取） |
| `%{qthreadptr}` | 指向当前 `QThread` 的指针（`QThread::currentThread()` 的结果） |
| `%{type}` | 日志类型："debug"、"warning"、"critical" 或 "fatal" |
| `%{time process}` | 日志消息发生的时间（以进程启动后的秒数计算，"process" 为字面量） |
| `%{time boot}` | 日志消息发生的时间（以系统启动后的秒数计算，"boot" 为字面量）。如果无法获取系统启动时间，输出值不确定（参见 `QElapsedTimer::msecsSinceReference()`） |
| `%{time [format]}` | 日志消息发生时的系统时间，格式由传入的 `format` 参数控制（传给 `QDateTime::toString()`）。若未指定 `format`，则使用 `Qt::ISODate` 格式 |
| `%{backtrace [depth=N] [separator="..."]}` | 调用栈，帧数由可选参数 `depth` 指定（默认 5），帧间分隔符由可选参数 `separator` 指定（默认 `"|"`）。此功能仅在部分平台可用（目前仅 glibc 平台）。函数名仅在导出函数中可见，如需看到所有函数名，可在构建时加入 `QMAKE_LFLAGS += -rdynamic`。调用栈可能缺少某些帧（内联或尾调用优化所致） |

> 还可以根据消息的类型使用条件判断，如果希望只当类型匹配时才输出，可以使用 `%{if-debug}`、`%{if-info}`、`%{if-warning}`、`%{if-critical}` 或 `%{if-fatal}`，并以 `%{endif}` 结束。
> 
> 此外，`%{if-category} ... %{endif}` 之间的文本仅在类别不是默认类别时才会被输出。
> 
> 示例：
> 
> ```bash
> QT_MESSAGE_PATTERN="[%{time yyyyMMdd h:mm:ss.zzz t} %{if-debug}D%{endif}%{if-info}I%{endif}%{if-warning}W%{endif}%{if-critical}C%{endif}%{if-fatal}F%{endif}] %{file}:%{line} - %{message}"
> ```
> 
> 默认的模式是：
> 
> ```
> "%{if-category}%{category}: %{endif}%{message}"
> ```
> 
> 模式也可以在运行时通过设置环境变量 `QT_MESSAGE_PATTERN` 来更改；如果同时调用了 `qSetMessagePattern()` 且设置了 `QT_MESSAGE_PATTERN`，则**环境变量优先**。
> 
> **注意：** 消息模式仅适用于**非结构化日志**（例如默认输出到 stderr 的日志）。像 **systemd** 这样的结构化日志系统会直接记录原始消息，并尽可能附带更多可获取的结构化信息。
> 
> 自定义消息处理程序可以使用 `qFormatLogMessage()` 来考虑消息模式。

2. 在生产环境调试一个 GUI 程序，只要一点改动，就可以让程序运行时附带控制台，来方便调试。

生产环境是 Windows 平台，在.pro文件中添加 `CONFIG += console`，然后在 Qt Creator 中，勾选 `项目>构建和运行>运行设置>在终端中运行` 的单选框。若使 MS Dev studio，在等价于在菜单选项 Project Properties>Configuration Properties>Linker>System>Subsystem>Console 。

生产环境是 Linux 平台，直接在命令行窗口启动可执行文件，可在命令行窗口查看调试信息。