## KylinOS 开机自启动

### 前言

当前的 Qt 桌面程序，需要以 Kiosk模式（自助服务终端模式）运行在设备上。

在这种模式下，设备会在开机时自动启动特定的应用程序或软件，且用户只能操作这个软件，无法访问其他系统功能。
退出该软件或关闭终端时，设备也会关闭或重启。

当前的项目运行环境：
系统：银河麒麟桌面操作系统 V10 SP1 2303
架构：X86_64

### 踩坑

想实现“关闭软件的同时也关闭设备”是容易的。

真正棘手的是“如何在开机的时候就启动软件”。

通过摸索，找到在 Linux 环境下实现开机自启动的方案有三个：
- a.修改/etc/rc.local文件
- b.修改/etc/profile文件
- c.桌面快捷方式：新建desktop文件

无论哪种方案，都需要先编写启动软件的脚本。

```bash
#!/bin/sh
#进入软件安装目录
cd /data/客户端打包/pack6/Simulator_client
#执行软件
./Apprun
exit 0
```

a方案，在测试时，先尝试在脚本执行echo命令，成功了。但是在脚本中加入启动软件的命令，却不能执行。很奇怪。
总之，这个方案确实可以实现开机启动时执行某些命令，但是不能启动软件。

b方案，没有尝试。但网上反馈可能会导致系统错误，设备不能正常使用。

遂尝试c方案，最终完美解决了我的问题。

值得一提的是，当我采用 [银河麒麟踩坑笔记——sh文件设置开机自启](https://blog.csdn.net/mumumu222/article/details/124566656) 中的desktop方法时，软件确实可实现开机自启动，但是在软件内不能正常使用中文输入法。
表现在我直接双击执行Apprun或直接运行start.sh脚本时，程序可以运行，也可以切换并使用中文输入法。
但是当我通过desktop文件运行程序时，程序运行正常，除了在程序内我不能切换，也不能使用中文输入法。

最终直接把命令写在Exec中，才最终解决问题。

### 最终方案
1. 找到打包后的可执行文件。
（在本例中可执行文件是Apprun）

2. 新建一个 txt 文本文件，写入
   ```
   [Desktop Entry]
   Name=故障仿真终端.desktop
   Exec=/data/客户端打包/pack6/Simulator_client
   Icon=/data/客户端打包/pack6/故障防真终端设备.ico
   StartupNotify=false
   Terminal=false
   Type=Application
   Categories=Network;
   StartupWMClass=generalstartup
   ```
3. 将文件名改为和 Name 一致。在本例是“故障仿真终端.desktop”

4. 给 desktop 文件赋权，再移入 /usr/share/applications/ 文件夹。
   ```bash
   #start.sh
   sudo chmod +x 故障仿真终端.desktop
   sudo cp 故障仿真终端.desktop /usr/share/applications/
   ```
5. 在 `系统设置>应用>开机启动` 添加 “故障仿真终端.desktop”



### **可能的原因与解决方案**

另一个可能解决的方案(ChatGPT提供，未尝试)

以下是 ChatGPT 的回答：

程序在通过 `desktop` 文件启动时无法切换或使用中文输入法，这通常和环境变量的传递或输入法框架的加载有关。桌面快捷方式启动时的环境和直接在终端或脚本中执行时的环境可能有所不同，特别是关于输入法设置的环境变量。
1. **环境变量问题**
   - 当通过 `desktop` 文件启动程序时，输入法框架可能未被正确初始化。环境变量通常在用户的 shell 启动时加载，但通过 `desktop` 文件启动时，环境可能较为简化，导致输入法无法启用。

   **解决方案**：在 `desktop` 文件中明确设置环境变量，使输入法框架正常加载。你可以尝试修改 `desktop` 文件，添加与输入法相关的环境变量，例如：
   
   ```plaintext
   [Desktop Entry]
   Name=故障仿真终端
   Exec=env XMODIFIERS="@im=fcitx" QT_IM_MODULE=fcitx /etc/user.local
   Icon=/data/客户端打包/pack6/故障仿真终端设备.ico
   StartupNotify=false
   Terminal=false
   Type=Application
   Categories=Network;
   StartupWMClass=generalstartup
   ```

   上述例子假设你使用的是 **fcitx** 输入法框架。根据你的实际情况，可能需要使用不同的输入法模块（如 `ibus` 或其他），你可以根据实际输入法框架来修改 `XMODIFIERS` 和 `QT_IM_MODULE` 的值。

   - **常见输入法环境变量**：
     - `XMODIFIERS="@im=fcitx"` 或 `XMODIFIERS="@im=ibus"`，根据你使用的输入法框架选择。
     - `QT_IM_MODULE=fcitx` 或 `QT_IM_MODULE=ibus`，确保 Qt 应用使用正确的输入法模块。

2. **启动时的 DISPLAY 问题**
   - 如果你通过 `desktop` 文件启动程序，可能会遇到与 X11 会话相关的问题，导致输入法框架未正确连接到显示会话。

   **解决方案**：确保在启动时设置了正确的 `DISPLAY` 环境变量。你可以在 `desktop` 文件中显式设置 `DISPLAY`，例如：
   
   ```plaintext
   Exec=env DISPLAY=:0 XMODIFIERS="@im=fcitx" QT_IM_MODULE=fcitx /etc/user.local
   ```

   这里 `:0` 表示第一个显示会话，如果你的环境不同，可能需要调整为正确的值。

3. **fcitx/ibus 自动启动**
   - 如果你使用的是 **fcitx** 或 **ibus** 输入法框架，确保它在用户会话启动时已经加载。有时桌面环境启动的程序没有自动启动输入法框架。

   **解决方案**：
   - 检查是否已经启用输入法框架的自动启动。
   - 可以通过命令检查输入法框架是否正在运行：
     ```bash
     ps aux | grep fcitx
     ```
   - 如果没有运行，可以手动启动：
     ```bash
     fcitx &
     ```

4. **Qt 特定问题**
   - 有时 Qt 程序在启动时未正确加载输入法模块，尤其是在通过 `desktop` 文件启动时。

   **解决方案**：尝试设置 `QT_IM_MODULE` 环境变量为适当的值（例如 `fcitx` 或 `ibus`），并确保在 `desktop` 文件的 `Exec` 行中传递。

5. **系统设置检查**
   - 在银河麒麟桌面操作系统上，可能还需要检查系统是否已正确安装和配置了中文输入法。
   - 确保输入法设置正确，并且输入法框架在启动时没有出现任何错误。
