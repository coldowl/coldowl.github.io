## 环境准备
查阅厂家文档，得知 TQA40I CoreB 核心板使用的交叉编译器为 
  - 宿主机: WSL2 (Ubuntu 24.04 LTS)
  - 目标平台: 全志 A40i (ARMv7 Cortex-A7, 32位)
  - 工具链: arm-linux-gnueabihf-gcc/g++
  - Qt版本: 5.15.2
  
预先新建 /opt/A40i 文件夹存放搭建环境所需的依赖

## 安装必要依赖
厂家提供 ubuntu_env_install.sh 脚本，用于在搭建环境前安装一些必要工具
``` shell
add-apt-repository ppa:openjdk-r/ppa  
apt-get update
echo y | apt-get install openjdk-8-jdk
echo y | apt-get install m4
echo y | apt-get install bison
echo y | apt-get install zlib1g-dev
echo y | apt-get install g++-multilib gcc-multilib lib32ncurses5-dev
echo y | apt-get install lib32readline-gplv2-dev lib32z1-dev
echo y | apt-get install lzop	
echo y | apt-get install u-boot-tools
echo y | apt-get install libxml2-utils
echo y | apt-get install jack
echo y | apt-get install libz-dev
echo y | apt-get install lib32z1-dev
echo y | apt-get install gnupg flex gperf
echo y | apt-get install genext2fs
echo y | apt-get install android-tools-fastboot 
echo y | apt-get install gawk
echo y | apt-get install curl
```

## 配置交叉编译工具链
从官网下载对应的交叉编译器
[gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf](https://publishing-ie-linaro-org.s3.amazonaws.com/releases/components/toolchain/binaries/5.3-2016.05/arm-linux-gnueabihf/gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf.tar.xz?Signature=ivl0UP99LrgzJuKC%2Bnhv6ZbemkU%3D&Expires=1766543441&AWSAccessKeyId=AKIAIELXV2RYNAHFUP7A)
``` shell
sudo mkdir -p /opt/toolchain
sudo tar -xvf gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf.tar -C /opt/toolchain/
# 将路径添加到环境变量 (建议写入 ~/.bashrc)
export PATH=/opt/toolchain/gcc-linaro-5.3.1-2016.05-x86_64_arm-linux-gnueabihf/bin:$PATH
# 检查是否生效
arm-linux-gnueabihf-gcc -v
``` 

## 下载 Qt 源码
下载并准备 Qt 5.15.2 源码
``` shell
wget https://download.qt.io/archive/qt/5.15/5.15.2/single/qt-everywhere-src-5.15.2.tar.xz
tar -xvf qt-everywhere-src-5.15.2.tar.xz
cd qt-everywhere-src-5.15.2
``` 
## 修改 qmake 配置 
你需要告诉 Qt 如何使用你的交叉编译器。我们需要基于 linux-arm-gnueabi-g++ 修改出一个适用于 A40i 的 mkspec。

1. 复制现有的配置：

```Bash
cp -r qtbase/mkspecs/linux-arm-gnueabi-g++ qtbase/mkspecs/linux-arm-gnueabihf-g++
```

2. 修改 qtbase/mkspecs/linux-arm-gnueabihf-g++/qmake.conf： 使用编辑器将文本中的 gnueabi 修改为 gnueabihf

```qmake
#
# qmake configuration for building with arm-linux-gnueabihf-g++
#

MAKEFILE_GENERATOR      = UNIX
CONFIG                 += incremental
QMAKE_INCREMENTAL_STYLE = sublib

include(../common/linux.conf)
include(../common/gcc-base-unix.conf)
include(../common/g++-unix.conf)

# modifications to g++.conf
QMAKE_CC                = arm-linux-gnueabihf-gcc
QMAKE_CXX               = arm-linux-gnueabihf-g++
QMAKE_LINK              = arm-linux-gnueabihf-g++
QMAKE_LINK_SHLIB        = arm-linux-gnueabihf-g++

# modifications to linux.conf
QMAKE_AR                = arm-linux-gnueabihf-ar cqs
QMAKE_OBJCOPY           = arm-linux-gnueabihf-objcopy
QMAKE_NM                = arm-linux-gnueabihf-nm -P
QMAKE_STRIP             = arm-linux-gnueabihf-strip
load(qt_config)

```

## 核心补丁与源码修复

由于 Ubuntu 24.04 的编译器较新，必须手动修复以下两处源码 Bug：

``` shell
cd /opt/A40i/qt-everywhere-src-5.15.2
```

**A. 修复 C++ 标准库头文件缺失**

因为我们 在使用Qt 源码在编译 qmake（宿主机工具）时，使用了较新版本的 GCC（WSL Ubuntu 默认通常是 GCC 11 或更高）。

而在 GCC 11 及后续版本中，C++ 标准库变得更加“精简”，很多以前会被隐式包含的头文件（如 <limits>）现在必须显式包含。

所以我们需要修复源码中的头文件引用，以兼容当前的编译环境。

否则在执行 ./configure 会提示 error: ‘numeric_limits’ is not a class template 的错误。

理论上，我们需要为报错的文件手动加上` #include <limits>`

在受影响的 corelib 文件中添加：

``` shell
grep -r "std::numeric_limits" qtbase/src/corelib | cut -d: -f1 | sort | uniq | xargs -I {} sed -i '1i #include <limits>' {}
``` 

如果仍有此类报错，手动执行一下（以 qtdeclarative 模块为例）

``` shell
sed -i '1i #include <limits>' qtdeclarative/src/qmldebug/qqmlprofilerevent_p.h
``` 

**B. 修复 zlib 的 Time64 冲突**

zlib 位于 Qt 架构的最底层，是 QtCore 依赖项。

  - 资源系统 (QRC)：你的图片、QML 文件打包进二进制全靠 zlib。
  - PNG/数据流：没有 zlib，Qt 连一张图片都打不开。
  - 网络传输：HTTP 压缩传输也依赖它
 
Linux 社区为了解决 2038 年危机（32 位时间戳溢出），改变了 glibc 头文件，新版本会检查：如果你开启了 64 位时间，就必须同时开启 64 位文件偏移。

目标板卡 A40i 是32位架构（ARMhf），而宿主机（WSL Ubuntu 24.02）较新，如果不加以处理，编译时默认试图启用 64 位时间戳（_TIME_BITS=64）。

Qt 的配置中 _FILE_OFFSET_BITS 的定义与其产生了冲突。

就会出现` #error "_TIME_BITS=64 is allowed only with _FILE_OFFSET_BITS=64" `的错误。

因此我们需要修改 `qtbase/src/3rdparty/zlib/src/gzguts.h`：

``` C
/* gzguts.h -- zlib internal header definitions for gz* operations
 * Copyright (C) 2004, 2005, 2010, 2011, 2012, 2013, 2016 Mark Adler
 * For conditions of distribution and use, see copyright notice in zlib.h
 */

#ifdef _MSC_VER
#  ifndef _CRT_SECURE_NO_DEPRECATE
#    define _CRT_SECURE_NO_DEPRECATE
#  endif
#  ifndef _CRT_NONSTDC_NO_DEPRECATE
#    define _CRT_NONSTDC_NO_DEPRECATE
#  endif
#endif

#ifdef _LARGEFILE64_SOURCE
#  ifndef _LARGEFILE_SOURCE
#    define _LARGEFILE_SOURCE 1
#  endif
// 注释下面三行
// #  ifdef _FILE_OFFSET_BITS
// #    undef _FILE_OFFSET_BITS
// #  endif
#endif

// 新增两宏
#ifndef _FILE_OFFSET_BITS
#  define _FILE_OFFSET_BITS 64
#endif
#ifndef _TIME_BITS
#  define _TIME_BITS 64
#endif

#ifndef QT_BOOTSTRAPPED
#  include <qconfig.h>
#endif

#ifdef QT_VISIBILITY_AVAILABLE
#define HAVE_HIDDEN
#endif


#ifdef HAVE_HIDDEN
#  define ZLIB_INTERNAL __attribute__((visibility ("hidden")))
#else
#  define ZLIB_INTERNAL
#endif

#include <stdio.h>
#include "zlib.h"
#ifdef STDC
#  include <string.h>
```

## 编译

在源码根目录 `/opt/A40i/qt-everywhere-src-5.15.2` 下创建 `autoconfig.sh` 脚本，方便调试配置参数：

```shell
#!/bin/bash
./configure \
  -prefix /opt/qt5.15.2_a40i \
  -release \
  -opensource \
  -confirm-license \
  -xplatform linux-arm-gnueabihf-g++ \
  -make libs \
  -optimize-size \
  -no-opengl \
  -nomake tests \
  -nomake examples \
  -no-use-gold-linker \
  -no-pkg-config \
  -skip qtlocation \
  -v
```

注：-prefix 是编译完成后安装的路径。末尾加上 -v (verbose)，精准定位错误位置。

执行编译：

```shell
chmod +x autonfig.sh
./autoconfig.sh
```

如果出现 "Configure summary" 以及 "Target compiler: gcc 5.3.1"，且命令输出的最后一行没有以 `ERROR `结尾，标志着配置阶段成功。

此时目录下Makefile 文件已经生成：ls -l Makefile 

如果 configure 成功，继续在 /opt/A40i/qt-everywhere-src-5.15.2 下执行 (启用全部 CPU 核心进行编译)

```shell
make -j$(nproc)
```
如果最后输出的 Leaving directory 且没有任何 Error 字样，标志编译成功。

## 安装

```shell
sudo make install
```

这一步通常只需要几分钟。它会将编译好的库文件、头文件、插件和 qmake 工具复制到配置的安装路径 `/opt/qt5.15.2_a40i` 文件夹中。

如何验证安装是否成功？执行

```shell
/opt/qt5.15.2_a40i/bin/qmake -query
```

如果在输出中看到这一行：`QMAKE_SPEC: linux-arm-gnueabihf-g++` 说明安装成功

## 配置 Qt Creator 可视化开发