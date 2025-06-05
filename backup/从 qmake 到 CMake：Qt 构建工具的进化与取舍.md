
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