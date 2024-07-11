首先，磁盘ID不等于磁盘序列号(S/N)！百度上很多回答是错误的!

比如：[win7怎么查看硬盘序列号](https://jingyan.baidu.com/article/f3e34a12ec500ef5ea653543.html)


闲话少说，直接演示步骤吧

1. 使用 `wmic diskdrive get serialnumber`, 如果直接得到序列号，恭喜你！

如果你使用Win7或者其它老古董系统，你会得到一串40位16进制数：
![命令窗口](https://github.com/coldowl/coldowl.github.io/assets/62004435/7eb60de5-bfcc-4ee6-bdda-95c1fa343268)
“2020202057202d44435732433045504c35434350”需要转换为ASCII码，别灰心，继续看下去。

2. 管理者模式下执行bat脚本
```bat
::测试环境Win7
@echo off
SetLocal EnableDelayedExpansion
chcp 65001
call :SetAscVar
::获取硬盘序列号（16进制）。可能有多块硬盘，显示中字母行“SerialNumber”，还有2行空行，需要先处理。
for /f %%x in ('"wmic diskdrive get serialnumber|find " "|find /v /i "SerialNumber""')do (
	if not "%%x"=="" (
		set/adn+=1
		echo 硬盘!dn!：
		call :Ascii4Sn ASN %%x
		echo 16进制序列号：%%x
		echo   硬盘序列号：!ASN!
		echo\
	)
)

pause
::测试
::对应序列号为WD-WCC2E0LPC5PC，WD是品牌名
set sn=2020202057202d44435732433045504c35434350
call :Ascii4Sn ASN %sn%
echo 16进制序列号：%sn%
echo   硬盘序列号：%ASN%
pause
goto :eof

::函数
::定义数字和字母的ASCII变量，需要先调用
:SetAscVar	
set Num=0123456789
set Abc=ABCDEFGHIJKLMNOPQRSTUVWXYZ
set Hex=%Num%%Abc:~,6%
for /l %%i in (0 1 9)do set _0x3%%i=%%i
for /l %%i in (0 1 26)do call :AbcAsc %%i
goto :eof
:AbcAsc <offset>
::定义26个字母对应的ASCII变量
set/a Asc=0x41+%1,h=Asc/16,e=Asc%%16
set _0x!Hex:~%h%,1!!Hex:~%e%,1!=!Abc:~%1,1!
set/a as1=0x61+%1,h=as1/16,e=as1%%16
set _0x!Hex:~%h%,1!!Hex:~%e%,1!=!Abc:~%1,1!
goto :eof

:Ascii4Sn <str_var> <hexs>	
::回传变量，长串16进制数
set hsn=%2
set ns=
set as=
:ASloop
set ns=%ns%%hsn:~2,2%%hsn:~,2%
set as=%as%!_0x%hsn:~2,2%!!_0x%hsn:~,2%!
set hsn=%hsn:~4%
if not "%hsn%"=="" goto :ASloop
set %1=%as%
goto :eof
```
测试结果：“2020202057202d44435732433045504c35434350”对应“WD-WCC2E0LPC5PC”

经过对比，无误：
<img src="https://github.com/coldowl/coldowl.github.io/assets/62004435/1550c296-8fdd-4db9-b591-5befa846afcd" height="300px" /> 
![硬盘实物](https://github.com/coldowl/coldowl.github.io/assets/62004435/1550c296-8fdd-4db9-b591-5befa846afcd)