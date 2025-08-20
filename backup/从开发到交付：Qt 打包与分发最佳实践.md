对于一个独立开发者，完成编码只是万里长征的第一步，真正的挑战往往出现在软件发布阶段。这一环节，决定了你的产品交付到用户的样子。无论你的用户是从光盘还是网络上获取到软件，你都会希望，自己精心制作的大餐能有个不错的包装。谁都不想浪费过多的精力在软件的安装阶段，如果用户需要 google 才能搞清楚怎么把程序在自己的机器上跑起来。毫无疑问，你会收到各种差评、抱怨，以及槽糕的评分。

那么，我们可以拟定一些核心目标，首要的任务是确保程序“开箱即用”，最好能有一个引导程序，让用户了解安装的全流程。软件的体积要尽可能小，只包含必要的依赖库，不对用户机器造成负担。如果可能，最好给安装包加壳，保护产品的安全，防止注入，提高逆向难度。

对于复杂项目，可以考虑静态编译或 CI 自动化打包，以提升效率和稳定性。

### 1 初步打包

这一阶段的目标，是实现程序在缺少开发环境的机器上也能独立运行。

1.1 以 release 模式构建项目

你会在 release 文件夹下得到可执行文件，但是如果你试图执行它，大概率会出现缺失依赖库的告警。这是因为文件夹下缺少程序运行时的相应依赖（如 QtCore、QtGui、QtWidgets 等DLL）。

使用 Qt 官方提供的 windeployqt / macdeployqt 来自动收集依赖，执行后会在当前目录下复制所有必需的 DLL、插件等。

以 Windows 平台为例：

```bat
@echo off
chcp 65001
REM === 配置区 ===
set APP_NAME = MyApp.exe
set RELEASE_DIR = D:\project\release
set QT_ENV = E:\QT\5.15.2\msvc2019_64\bin\qtenv2.bat

echo [1/3] 初始化 Qt 环境...
call "%QT_ENV%"

echo [2/3] 切换到 release 目录...
cd /d "%RELEASE_DIR%"

echo [3/3] 执行 windeployqt...
if exist "%RELEASE_DIR%\%APP_NAME%" (
    windeployqt "%RELEASE_DIR%\%APP_NAME%"
) else (
    echo ERROR: %APP_NAME% 不存在！
)

pause
```

现在执行 release 文件夹下的 MyApp.exe ，程序就能正常运行啦！现在将 release 文件夹拷贝到任何一台没有 Qt 环境的电脑，程序也能正常运行。

自动收集的依赖有些不是必需的，可以删除它，来减少安装包的体积。例如：若程序不包含多语言环境，可以删除 translations 文件夹。

### 2 压缩加壳

1. 使用 Enigma Virtual Box

<p align="center">
<img width="700" height="500" alt="Image" src="https://github.com/user-attachments/assets/a22a74f9-5667-4363-93ea-83e5872bdd4d" />
</p>

封包后的程序只剩下一个 exe 文件，真正做到了即开即用。

3. 使用 UPX (Ultimate Packer for eXecutables)

UPX 是最著名的开源可执行文件压缩/加壳工具，且支持 Windows / Linux / macOS 多平台。

### 3 引导安装程序

### 4 静态编译