C++语言本身并未定义任何输入输出语句，转而通过 STL 标准库来提供 IO 机制。

### 流的概念
IO 库中使用最多的可能是 iostream 库。库名中的“stream”，即“流”，是计算机邻域的核心概念。

根据书里的说法：_The term stream is intended to suggest that the characters are generated, or consumed, sequentially over time._ （术语“流”想要表达的是，随着时间的推移，字符是顺序生成或消耗的。）

简单来说，可以认为 IO 设备中写入或读出的字符序列，就像水流一样，从一个地方"流"到另一个地方。

> 标准输入输出对象
>
> 标准库定义了4个IO对象。为了处理输入，我们使用一个名为cin（发音为see-in） 的istream类型的对象。这个对象也被称为标准输入（standardinput）。对于输出，我们 使用一个名为cout（发音为see-out）的ostream类型的对象。此对象也被称为标准输出（standardoutput）。
>
>标准库还定义了其他两个ostream对象，名为cerr和clog（发音分别为see-err和see-log）。我们通常用cerr来输出警告和错误消息，因此它也被称为 标准错误（standarderror）。而clog用来输出程序运行时的一般性信息。 
>
>系统通常将程序所运行的窗口与这些对象关联起来。因此，当我们读取cin，数据将从程序正在运行的窗口读入，当我们向cout、cerr和clog写入数据时，将会写到同一个窗口。

---

### 为什么要定义多个输出对象？

主要是为了**职责分离**。不同类型的信息放不同的通道里，有几个好处：

#### ① 可以单独重定向

比如在 Linux Shell 命令行执行：

```bash
./myapp > out.log 2> err.log
```

或是在 Windows CMD 里运行

```bash
test.exe > out.txt 2> err.txt
```

* `>` 会重定向 `stdout`（`cout`、`clog`）
* `2>` 会重定向 `stderr`（`cerr`）


这样就可以把正常信息、错误信息分开保存，便于排查。

比如：使用 find 命令查找文件位置时，每每遍历到需要 root 权限的系统目录，就会恼人地提示该路径“权限不够”。若将所有错误信息（包括权限错误）重定向到空设备，只显示成功找到的目录，输出会清爽很多。

```bash
sudo find / -name ".ssh" -type d 2>/dev/null
```

#### ② 输出时机不同

* `cerr` 是**无缓冲**的，程序崩溃前的最后一个错误消息能保证马上显示出来。
* `cout` 和 `clog` 都是缓冲的，可能等到缓冲区满或者 `flush` 才输出。

#### ③ 便于调试和日志管理

写大型程序或者多线程程序的时候，`cout` 和 `cerr`/`clog` 分离可以很方便地区分：

* 哪些是用户可见的正常输出
* 哪些是程序员需要看的调试信息或错误提示

---
<details><summary>📌 实际应用示例</summary>
<p>

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "程序正常运行中" << endl;
    clog << "日志记录：已经进入主函数" << endl;
    cerr << "错误：文件未找到" << endl;
    return 0;
}
```

运行时：

* `cout` 和 `clog` 一起进标准输出
* `cerr` 直接去标准错误输出

</p>
</details>


<details><summary>📌 拓展阅读：标准 I/O 文件描述符编号说明</summary>
<p>

名称 | 文件描述符编号 | 说明
-- | -- | --
标准输入 stdin | 0 | 一般来自键盘
标准输出 stdout | 1 | 一般到终端/显示器
标准错误 stderr | 2 | 一般到终端/显示器，独立于 stdout

在 Unix-like 系统（Linux、macOS、FreeBSD、OpenBSD…）里，进程启动时就会自动打开 0、1、2 三个文件描述符，分别连接到对应的标准输入输出设备。

* `0` -> `/dev/stdin`
* `1` -> `/dev/stdout`
* `2` -> `/dev/stderr`

虽然 Windows 底层没有 Unix 那种文件描述符（file descriptor）的概念，而是用 **HANDLE** 句柄，但在 C/C++ 标准库（MSVC、MinGW、WSL 等环境）里，为了兼容 POSIX 风格，**C runtime 依然保留了 0、1、2 对应标准输入、输出、错误**。

> 所以在 Windows 上用 `freopen` 或重定向 `1>`、`2>`、`0<` 这些操作也都可以正常工作。

</p>
</details> 