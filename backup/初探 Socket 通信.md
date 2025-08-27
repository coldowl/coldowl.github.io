什么是 Socket ？

Socket 本意是插座，在计算机网络中，它被翻译为“套接字”。

冰箱需要插座来连接电路，你面前的浏览器也需要套接字，来和大西洋彼岸的服务器通信。


<p align="center">
<img width="256" height="180" alt="Image" src="https://github.com/user-attachments/assets/21b64a1b-b7e3-4a20-bb04-b6a6f2b1c878" />
<p align="center">Figure 1. 展示套接字概念的电气类比</p>
</p>

_Socket是一个抽象概念，它被认为是双向通信信道中的一个端点，而不是连接本身。<sub>1</sub>_ 

在类 Unix 系统中，Socket 被操作系统抽象为一种文件描述符（file descriptor），可以像文件一样操作（读、写、关闭）。_如果不那么较真，你确实可以把它当作一个特殊的文件，想着打开它，顺便再写点东西。_ 但严格来说，Socket 本身不是文件，而是一个抽象的通信端点，由操作系统管理，文件描述符只是它的表示方式之一。Windows 的 Winsock 系统中，Socket 也是类似的句柄（handle），不完全等同于文件。

Socket 通信是进程间通信（IPC，Inter-Process Communication）的一种手段，相比其他 IPC 机制（如管道、消息队列、共享内存），Socket 通信的独特之处在于，它允许不同主机（或同一主机）的进程通过网络协议交换数据。


操作系统如何操作 Socket ？

1.[What is a socket?](https://www.ibm.com/docs/en/zos/2.4.0?topic=services-what-is-socket)
