
1.创建一个简单的 Qt 控制台程序 sayhi_qt.cpp

```c++
#include <QCoreApplication>
#include <QDebug>

int main(int argc, char \*argv[])
{
    QCoreApplication a(argc, argv);
    qDebug() << "hello";
    return 0;
}
```

2.简单构建

Qt 是有别于标准库的第三方库，使用 `g++ sayhi_qt.cpp -o sayhi-qt`, 是不足以完成编译的，还缺少：

- 头文件路径
- 库链接
- 宏定义

pkg-config 工具可以读取存储系统上的库和软件包的各类信息。

我确信控制台程序会使用到 QtCore。

```shell
# 确认 Qt Qt5Core 存在
> pkg-config --list-all | grep Qt

Qt5Core                        Qt5 Core - Qt Core module
Qt5Widgets                     Qt5 Widgets - Qt Widgets module
Qt5Gui                         Qt5 Gui - Qt Gui module

# 获取预处理宏和头文件路径（编译阶段）
> pkg-config --cflags Qt5Core

-DQT_CORE_LIB -I/usr/include/x86_64-linux-gnu/qt5/QtCore -I/usr/include/x86_64-linux-gnu/qt5

# 获取库文件链接参数（链接阶段）
> pkg-config --libs Qt5Core

-lQt5Core
```

汇总一下分析命令的返回结果，

- 宏（-D = Define）：-DQT_CORE_LIB
- 头文件搜素路径（-I = include path）：-I/usr/include/x86_64-linux-gnu/qt5/QtCore -I/usr/include/x86_64-linux-gnu/qt5
- 链接库（-l = link library）：-lQt5Core
- 库文件搜索路径（-L = Library path）：这里空缺

由于我系统上的 Qt 库是用 -reduce-relocations 选项编译的，这要求所有链接到 Qt 的代码也必须是位置无关代码（PIC）。

所以，还需要额外在末尾添加 -fPIC 参数，来避免编译报错。

这样，我们就能拼凑出完整的构建命令：
`g++ sayhi_qt.cpp -o sayhi_qt -DQT_CORE_LIB -I/usr/include/x86_64-linux-gnu/qt5/QtCore -I/usr/include/x86_64-linux-gnu/qt5 -lQt5Core -fPIC`

知晓原理后，构建命令可以进一步简化：

```shell
g++ sayhi_qt.cpp -o sayhi_qt -fPIC `pkg-config --cflags --libs Qt5Core`
```

3.构建分析

ldd 命令可以列出可执行文件或共享库所需的动态链接库。

```shell
> ldd sayhi_qt

linux-vdso.so.1 (0x00007ffe6d3dd000)
libQt5Core.so.5 => /lib/x86_64-linux-gnu/libQt5Core.so.5 (0x000076fdc9c00000)
libstdc++.so.6 => /lib/x86_64-linux-gnu/libstdc++.so.6 (0x000076fdc9800000)
libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x000076fdca1c8000)
libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x000076fdc9400000)
libz.so.1 => /lib/x86_64-linux-gnu/libz.so.1 (0x000076fdca1ac000)
libdouble-conversion.so.3 => /lib/x86_64-linux-gnu/libdouble-conversion.so.3 (0x000076fdca195000)
libicui18n.so.74 => /lib/x86_64-linux-gnu/libicui18n.so.74 (0x000076fdc9000000)
libicuuc.so.74 => /lib/x86_64-linux-gnu/libicuuc.so.74 (0x000076fdc8c00000)
libpcre2-16.so.0 => /lib/x86_64-linux-gnu/libpcre2-16.so.0 (0x000076fdc9b74000)
libzstd.so.1 => /lib/x86_64-linux-gnu/libzstd.so.1 (0x000076fdc9aba000)
libglib-2.0.so.0 => /lib/x86_64-linux-gnu/libglib-2.0.so.0 (0x000076fdc96b7000)
libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x000076fdc8f17000)
/lib64/ld-linux-x86-64.so.2 (0x000076fdca217000)
libicudata.so.74 => /lib/x86_64-linux-gnu/libicudata.so.74 (0x000076fdc6e00000)
libpcre2-8.so.0 => /lib/x86_64-linux-gnu/libpcre2-8.so.0 (0x000076fdc961d000)
```

g++ -v 可以输出详细的构建流程

```shell
> g++ -v sayhi_qt.cpp -o sayhi_qt -fPIC `pkg-config --cflags --libs Qt5Core`

Using built-in specs.
COLLECT_GCC=g++
COLLECT_LTO_WRAPPER=/usr/libexec/gcc/x86_64-linux-gnu/13/lto-wrapper
OFFLOAD_TARGET_NAMES=nvptx-none:amdgcn-amdhsa
OFFLOAD_TARGET_DEFAULT=1
Target: x86_64-linux-gnu
Configured with: ../src/configure -v --with-pkgversion='Ubuntu 13.3.0-6ubuntu2~24.04.1' --with-bugurl=file:///usr/share/doc/gcc-13/README.Bugs --enable-languages=c,ada,c++,go,d,fortran,objc,obj-c++,m2 --prefix=/usr --with-gcc-major-version-only --program-suffix=-13 --program-prefix=x86_64-linux-gnu- --enable-shared --enable-linker-build-id --libexecdir=/usr/libexec --without-included-gettext --enable-threads=posix --libdir=/usr/lib --enable-nls --enable-bootstrap --enable-clocale=gnu --enable-libstdcxx-debug --enable-libstdcxx-time=yes --with-default-libstdcxx-abi=new --enable-libstdcxx-backtrace --enable-gnu-unique-object --disable-vtable-verify --enable-plugin --enable-default-pie --with-system-zlib --enable-libphobos-checking=release --with-target-system-zlib=auto --enable-objc-gc=auto --enable-multiarch --disable-werror --enable-cet --with-arch-32=i686 --with-abi=m64 --with-multilib-list=m32,m64,mx32 --enable-multilib --with-tune=generic --enable-offload-targets=nvptx-none=/build/gcc-13-EldibY/gcc-13-13.3.0/debian/tmp-nvptx/usr,amdgcn-amdhsa=/build/gcc-13-EldibY/gcc-13-13.3.0/debian/tmp-gcn/usr --enable-offload-defaulted --without-cuda-driver --enable-checking=release --build=x86_64-linux-gnu --host=x86_64-linux-gnu --target=x86_64-linux-gnu --with-build-config=bootstrap-lto-lean --enable-link-serialization=2
Thread model: posix
Supported LTO compression algorithms: zlib zstd
gcc version 13.3.0 (Ubuntu 13.3.0-6ubuntu2~24.04.1)
COLLECT_GCC_OPTIONS='-v' '-o' 'sayhi_qt' '-fPIC' '-D' 'QT_CORE_LIB' '-I' '/usr/include/x86_64-linux-gnu/qt5/QtCore' '-I' '/usr/include/x86_64-linux-gnu/qt5' '-shared-libgcc' '-mtune=generic' '-march=x86-64'
 /usr/libexec/gcc/x86_64-linux-gnu/13/cc1plus -quiet -v -I /usr/include/x86_64-linux-gnu/qt5/QtCore -I /usr/include/x86_64-linux-gnu/qt5 -imultiarch x86_64-linux-gnu -D_GNU_SOURCE -D QT_CORE_LIB sayhi_qt.cpp -quiet -dumpbase sayhi_qt.cpp -dumpbase-ext .cpp -mtune=generic -march=x86-64 -version -fPIC -fasynchronous-unwind-tables -fstack-protector-strong -Wformat -Wformat-security -fstack-clash-protection -fcf-protection -o /tmp/ccDbLiIw.s
GNU C++17 (Ubuntu 13.3.0-6ubuntu2~24.04.1) version 13.3.0 (x86_64-linux-gnu)
        compiled by GNU C version 13.3.0, GMP version 6.3.0, MPFR version 4.2.1, MPC version 1.3.1, isl version isl-0.26-GMP

GGC heuristics: --param ggc-min-expand=100 --param ggc-min-heapsize=131072
ignoring duplicate directory "/usr/include/x86_64-linux-gnu/c++/13"
ignoring nonexistent directory "/usr/local/include/x86_64-linux-gnu"
ignoring nonexistent directory "/usr/lib/gcc/x86_64-linux-gnu/13/include-fixed/x86_64-linux-gnu"
ignoring nonexistent directory "/usr/lib/gcc/x86_64-linux-gnu/13/include-fixed"
ignoring nonexistent directory "/usr/lib/gcc/x86_64-linux-gnu/13/../../../../x86_64-linux-gnu/include"
#include "..." search starts here:
#include <...> search starts here:
 /usr/include/x86_64-linux-gnu/qt5/QtCore
 /usr/include/x86_64-linux-gnu/qt5
 /usr/include/c++/13
 /usr/include/x86_64-linux-gnu/c++/13
 /usr/include/c++/13/backward
 /usr/lib/gcc/x86_64-linux-gnu/13/include
 /usr/local/include
 /usr/include/x86_64-linux-gnu
 /usr/include
End of search list.
Compiler executable checksum: 7896445e4990772fdae9dc0659a99266
COLLECT_GCC_OPTIONS='-v' '-o' 'sayhi_qt' '-fPIC' '-D' 'QT_CORE_LIB' '-I' '/usr/include/x86_64-linux-gnu/qt5/QtCore' '-I' '/usr/include/x86_64-linux-gnu/qt5' '-shared-libgcc' '-mtune=generic' '-march=x86-64'
 as -v -I /usr/include/x86_64-linux-gnu/qt5/QtCore -I /usr/include/x86_64-linux-gnu/qt5 --64 -o /tmp/ccnILArs.o /tmp/ccDbLiIw.s
GNU assembler version 2.42 (x86_64-linux-gnu) using BFD version (GNU Binutils for Ubuntu) 2.42
COMPILER_PATH=/usr/libexec/gcc/x86_64-linux-gnu/13/:/usr/libexec/gcc/x86_64-linux-gnu/13/:/usr/libexec/gcc/x86_64-linux-gnu/:/usr/lib/gcc/x86_64-linux-gnu/13/:/usr/lib/gcc/x86_64-linux-gnu/
LIBRARY_PATH=/usr/lib/gcc/x86_64-linux-gnu/13/:/usr/lib/gcc/x86_64-linux-gnu/13/../../../x86_64-linux-gnu/:/usr/lib/gcc/x86_64-linux-gnu/13/../../../../lib/:/lib/x86_64-linux-gnu/:/lib/../lib/:/usr/lib/x86_64-linux-gnu/:/usr/lib/../lib/:/usr/lib/gcc/x86_64-linux-gnu/13/../../../:/lib/:/usr/lib/
COLLECT_GCC_OPTIONS='-v' '-o' 'sayhi_qt' '-fPIC' '-D' 'QT_CORE_LIB' '-I' '/usr/include/x86_64-linux-gnu/qt5/QtCore' '-I' '/usr/include/x86_64-linux-gnu/qt5' '-shared-libgcc' '-mtune=generic' '-march=x86-64' '-dumpdir' 'sayhi_qt.'
 /usr/libexec/gcc/x86_64-linux-gnu/13/collect2 -plugin /usr/libexec/gcc/x86_64-linux-gnu/13/liblto_plugin.so -plugin-opt=/usr/libexec/gcc/x86_64-linux-gnu/13/lto-wrapper -plugin-opt=-fresolution=/tmp/cc34UBuF.res -plugin-opt=-pass-through=-lgcc_s -plugin-opt=-pass-through=-lgcc -plugin-opt=-pass-through=-lc -plugin-opt=-pass-through=-lgcc_s -plugin-opt=-pass-through=-lgcc --build-id --eh-frame-hdr -m elf_x86_64 --hash-style=gnu --as-needed -dynamic-linker /lib64/ld-linux-x86-64.so.2 -pie -z now -z relro -o sayhi_qt /usr/lib/gcc/x86_64-linux-gnu/13/../../../x86_64-linux-gnu/Scrt1.o /usr/lib/gcc/x86_64-linux-gnu/13/../../../x86_64-linux-gnu/crti.o /usr/lib/gcc/x86_64-linux-gnu/13/crtbeginS.o -L/usr/lib/gcc/x86_64-linux-gnu/13 -L/usr/lib/gcc/x86_64-linux-gnu/13/../../../x86_64-linux-gnu -L/usr/lib/gcc/x86_64-linux-gnu/13/../../../../lib -L/lib/x86_64-linux-gnu -L/lib/../lib -L/usr/lib/x86_64-linux-gnu -L/usr/lib/../lib -L/usr/lib/gcc/x86_64-linux-gnu/13/../../.. /tmp/ccnILArs.o -lQt5Core -lstdc++ -lm -lgcc_s -lgcc -lc -lgcc_s -lgcc /usr/lib/gcc/x86_64-linux-gnu/13/crtendS.o /usr/lib/gcc/x86_64-linux-gnu/13/../../../x86_64-linux-gnu/crtn.o
COLLECT_GCC_OPTIONS='-v' '-o' 'sayhi_qt' '-fPIC' '-D' 'QT_CORE_LIB' '-I' '/usr/include/x86_64-linux-gnu/qt5/QtCore' '-I' '/usr/include/x86_64-linux-gnu/qt5' '-shared-libgcc' '-mtune=generic' '-march=x86-64' '-dumpdir' 'sayhi_qt.'
```

逐段拆解输出，看看 Qt 程序是怎么被编译出来的：

- 编译阶段（cc1plus）

```
/usr/libexec/gcc/x86_64-linux-gnu/13/cc1plus ...
```

GCC 的 C++ 前端，负责把 `sayhi_qt.cpp` 编译成汇编代码。

| 参数                                          | 含义                                               |
| --------------------------------------------- | -------------------------------------------------- |
| `-D QT_CORE_LIB`                              | 定义了 `QT_CORE_LIB` 宏，这是 Qt5Core 模块的标准宏 |
| `-I /usr/include/x86_64-linux-gnu/qt5/QtCore` | QtCore 头文件路径                                  |
| `-I /usr/include/x86_64-linux-gnu/qt5`        | Qt 总头文件路径                                    |
| `-fPIC`                                       | 生成位置无关代码（Position Independent Code）      |

头文件搜索路径（`#include <...>` search starts here）：

```
/usr/include/x86_64-linux-gnu/qt5/QtCore
/usr/include/x86_64-linux-gnu/qt5
/usr/include/c++/13
...
```

编译器会按顺序查找 `#include <QtCore/...>` 和系统头文件。

- 汇编阶段（as）

```
as -v ... -o /tmp/ccnILArs.o /tmp/ccDbLiIw.s
```

把汇编代码翻译成目标文件 `/tmp/ccnILArs.o`。

- 链接阶段（collect2 / ld）

```
/usr/libexec/gcc/x86_64-linux-gnu/13/collect2 ...
```

这是链接器调用，

| 参数        | 含义                                            |
| ----------- | ----------------------------------------------- |
| `-lQt5Core` | 链接 Qt5Core 共享库                             |
| `-lstdc++`  | 链接 C++ 标准库                                 |
| `-lm`       | 链接数学库                                      |
| `-pie`      | 生成位置无关的可执行文件（Ubuntu 默认安全特性） |

**库搜索路径**（`-L`）：

```
-L/usr/lib/gcc/x86_64-linux-gnu/13
-L/usr/lib/x86_64-linux-gnu
-L/usr/lib/...
```

`pkg-config --libs Qt5Core` 只返回了 `-lQt5Core`，没有显式 `-L` 路径。这是因为 Qt5Core 安装在系统标准库路径 `/usr/lib/x86_64-linux-gnu` 下，链接器默认就会搜索这里，所以不需要额外指定。
