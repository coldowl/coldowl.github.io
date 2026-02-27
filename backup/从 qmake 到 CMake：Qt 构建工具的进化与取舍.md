
> 大型项目对构建工具的依赖，就好比大厦对地基的依赖。它看不见、却撑起了整个工程的框架，一旦出问题，整个项目分分钟就会“坍塌”。一个好用的构建工具，能够极大提升项目的开发效率，简化环境配置的构建流程，让开发者专注于业务逻辑本身，而不用把精力浪费在各种“奇怪的问题”和“玄学的兼容性”上。

谈到 C++ 的构建工具 `CMake` ，常常被人诟病的一点就是配置繁琐、语法晦涩。相比之下，Java 世界里的 Gradle、Maven 就显得人性化太多，它们配置文件结构清晰，语义友好，插件生态也更完善，更像是“现代化”的构建工具范本。

Qt 作为老牌的 C++ 框架，曾雄心勃勃地主推自家的 `qmake` 和 `qbs`来取代它。无奈 `CMake` 已经凭借其广泛的社区支持、生态和强大的适配能力，成为了 C++ 项目事实上的标准。所以，深感无望的Qt 官方，自 Qt 6.0 后也逐渐放弃了 `qmake`，全面转向 `CMake`。至于曾经被寄予厚望的 `qbs`，早就凉了不止一两天了。

所以，对于后来的 Qt 开发者们， 尽早放弃使用 `qmake` 而改用 `CMake` 是一个明智的决定。

现在，让我们看看 Qt Widgets 项目里，qmake 的 .pro 文件和 CMake 的 CMakeLists.txt 分别长什么样，顺便比较一下它们各自的优劣。

构建套件：Desktop Qt 5.15.2 MSVC2019 64bit

```qmake
QT    += core gui

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

CONFIG += c++17

# You can make your code fail to compile if it uses deprecated APIs.
# In order to do so, uncomment the following line.
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0

SOURCES += \
    main.cpp \
    mainwindow.cpp

HEADERS += \
    mainwindow.h

FORMS += \
    mainwindow.ui

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target

```

```cmake
cmake_minimum_required(VERSION 3.16)

project(untitled8 VERSION 0.1 LANGUAGES CXX)

set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(QT NAMES Qt6 Qt5 REQUIRED COMPONENTS Widgets)
find_package(Qt${QT_VERSION_MAJOR} REQUIRED COMPONENTS Widgets)

set(PROJECT_SOURCES
        main.cpp
        mainwindow.cpp
        mainwindow.h
        mainwindow.ui
)

if(${QT_VERSION_MAJOR} GREATER_EQUAL 6)
    qt_add_executable(untitled8
        MANUAL_FINALIZATION
        ${PROJECT_SOURCES}
    )
# Define target properties for Android with Qt 6 as:
#    set_property(TARGET untitled8 APPEND PROPERTY QT_ANDROID_PACKAGE_SOURCE_DIR
#                 ${CMAKE_CURRENT_SOURCE_DIR}/android)
# For more information, see https://doc.qt.io/qt-6/qt-add-executable.html#target-creation
else()
    if(ANDROID)
        add_library(untitled8 SHARED
            ${PROJECT_SOURCES}
        )
# Define properties for Android with Qt 5 after find_package() calls as:
#    set(ANDROID_PACKAGE_SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/android")
    else()
        add_executable(untitled8
            ${PROJECT_SOURCES}
        )
    endif()
endif()

target_link_libraries(untitled8 PRIVATE Qt${QT_VERSION_MAJOR}::Widgets)

# Qt for iOS sets MACOSX_BUNDLE_GUI_IDENTIFIER automatically since Qt 6.1.
# If you are developing for iOS or macOS you should consider setting an
# explicit, fixed bundle identifier manually though.
if(${QT_VERSION} VERSION_LESS 6.1.0)
  set(BUNDLE_ID_OPTION MACOSX_BUNDLE_GUI_IDENTIFIER com.example.untitled8)
endif()
set_target_properties(untitled8 PROPERTIES
    ${BUNDLE_ID_OPTION}
    MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
    MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION_MAJOR}.${PROJECT_VERSION_MINOR}
    MACOSX_BUNDLE TRUE
    WIN32_EXECUTABLE TRUE
)

include(GNUInstallDirs)
install(TARGETS untitled8
    BUNDLE DESTINATION .
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

if(QT_VERSION_MAJOR EQUAL 6)
    qt_finalize_executable(untitled8)
endif()
```

怎么在 CMake 项目中引入 Qt
Start with find_package to locate the libraries and header files shipped with Qt. Then, you can use these libraries and header files with the target_link_libraries command to build Qt-based libraries and applications. This command automatically adds the appropriate include directories, compile definitions, the position-independent-code flag, and links to the qtmain.lib library on Windows, for example.
首先使用 find_package 来定位 Qt 附带的库和头文件。然后，通过 target_link_libraries 命令使用这些库和头文件来构建基于 Qt 的库和应用程序。例如，此命令会自动添加相应的包含目录、编译定义、位置无关代码标志，并在Windows上链接到qtmain.lib库。

Build a GUI executable 构建GUI可执行文件
To build a helloworld GUI executable, you need the following:
要构建一个“hello world”图形用户界面可执行文件，您需要以下内容：

```CMake
cmake_minimum_required(VERSION 3.1.0)

project(helloworld VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

if(CMAKE_VERSION VERSION_LESS "3.7.0")
    set(CMAKE_INCLUDE_CURRENT_DIR ON)
endif()

find_package(Qt5 COMPONENTS Widgets REQUIRED)

add_executable(helloworld
    mainwindow.ui
    mainwindow.cpp
    main.cpp
    resources.qrc
)

target_link_libraries(helloworld Qt5::Widgets)
```

For find_package to be successful, CMake must find the Qt installation in one of the following ways:
要使find_package成功，CMake必须通过以下方式之一找到Qt的安装路径：

Set your CMAKE_PREFIX_PATH environment variable to the Qt 5 installation prefix. This is the recommended way.
将您的CMAKE_PREFIX_PATH环境变量设置为Qt 5的安装前缀。这是推荐的方法。
Set the Qt5_DIR in the CMake cache to the location of the Qt5Config.cmake file.
将CMake缓存中的Qt5_DIR设置为Qt5Config.cmake文件的位置。
The CMAKE_AUTOMOC setting runs moc automatically when required. For more details, see [CMake AUTOMOC documentation](https://cmake.org/cmake/help/latest/manual/cmake-qt.7.html#automoc).
CMAKE_AUTOMOC 设置会在需要时自动运行 moc。有关更多详细信息，请参见 [CMake AUTOMOC 文档](https://cmake.org/cmake/help/latest/manual/cmake-qt.7.html#automoc)。

Imported library targets 导入的库目标
Each Qt module that is loaded defines a CMake library target. The target names start with Qt5::, followed by the module name. For example: Qt5::Core, Qt5::Gui. Pass the name of the library target to target_link_libraries to use the respective library.
每个加载的Qt模块都会定义一个CMake库目标。目标名称以Qt5::开头，后跟模块名称。例如：Qt5::Core、Qt5::Gui。将库目标的名称传递给target_link_libraries即可使用相应的库。

Note: Since Qt 5.15, the CMake targets are also available as Qt::Core, Qt::Gui, and so on. This eases writing CMake code that can work with both Qt 5 and Qt 6.
注意：从 Qt 5.15 开始，CMake 目标也可作为 Qt::Core、Qt::Gui 等使用。这简化了可同时用于 Qt 5 和 Qt 6 的 CMake 代码的编写。

Imported targets are created with the same configurations as when Qt was configured. That is:
导入目标的创建配置与 Qt 配置时的配置相同。即：

If Qt was configured with the -debug switch, an imported target with the DEBUG configuration is created.
如果 Qt 是使用 -debug 开关配置的，就会创建一个带有 DEBUG 配置的导入目标。
If Qt was configured with the -release switch, an imported target with the RELEASE configuration is created.
如果 Qt 是使用 -release 开关配置的，就会创建一个带有 RELEASE 配置的导入目标。
If Qt was configured with the -debug-and-release switch, then imported targets are created with both RELEASE and DEBUG configurations.
如果 Qt 是使用 -debug-and-release 开关配置的，那么导入的目标将同时创建 RELEASE 和 DEBUG 配置。
If your project has custom CMake build configurations, you have to map your custom configuration to either the debug or the release Qt configuration.
如果您的项目有自定义的CMake构建配置，则必须将您的自定义配置映射到调试或发布Qt配置。

find_package(Qt5 COMPONENTS Core REQUIRED)

set(CMAKE_CXX_FLAGS_COVERAGE "${CMAKE_CXX_FLAGS_RELEASE} -fprofile-arcs -ftest-coverage")

# set up a mapping so that the Release configuration for the Qt imported target is
# used in the COVERAGE CMake configuration.
set_target_properties(Qt5::Core PROPERTIES MAP_IMPORTED_CONFIG_COVERAGE "RELEASE")