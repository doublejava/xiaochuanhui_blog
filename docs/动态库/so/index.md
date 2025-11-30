# Python操作SO动态库

## 1. 动态库概述

SO（Shared Object）是Linux/Unix平台上的共享对象库，类似于Windows平台的DLL（Dynamic Link Library）。SO文件允许程序在运行时动态加载和调用库中的函数，实现了代码的共享和模块化。

### 动态库的优势
- **节省内存**：多个进程可以共享同一个SO实例
- **便于更新**：可以独立更新SO而不需要重新编译主程序
- **模块化设计**：便于将功能模块化，提高代码复用性
- **保护核心算法**：可以将核心算法编译为SO，只暴露接口
- **跨语言调用**：支持不同编程语言之间的相互调用

## 2. Python加载SO的方法

Python主要通过`ctypes`模块来加载和调用SO中的函数。`ctypes`是Python的标准库，无需额外安装。

### 2.1 加载SO

```python
import ctypes

# 方法1：直接加载SO文件
so = ctypes.CDLL('./libmylib.so')

# 方法2：使用完整路径
so = ctypes.CDLL('/path/to/libmylib.so')

# 方法3：使用系统库路径中的SO
so = ctypes.CDLL('libc.so.6')  # 加载C标准库
```

### 2.2 函数类型定义

在调用SO函数之前，需要定义函数的参数类型和返回值类型，否则可能会导致内存错误。

```python
# 定义函数参数类型和返回值类型
so.add.argtypes = [ctypes.c_int, ctypes.c_int]
so.add.restype = ctypes.c_int
```

## 3. 基本数据类型映射

| C类型 | ctypes类型 | Python类型 |
|-------|------------|------------|
| char | ctypes.c_char | bytes |
| unsigned char | ctypes.c_ubyte | int |
| short | ctypes.c_short | int |
| unsigned short | ctypes.c_ushort | int |
| int | ctypes.c_int | int |
| unsigned int | ctypes.c_uint | int |
| long | ctypes.c_long | int |
| unsigned long | ctypes.c_ulong | int |
| long long | ctypes.c_longlong | int |
| unsigned long long | ctypes.c_ulonglong | int |
| float | ctypes.c_float | float |
| double | ctypes.c_double | float |
| void* | ctypes.c_void_p | int/None |
| char* | ctypes.c_char_p | bytes/str |
| const char* | ctypes.c_char_p | bytes/str |

## 4. 函数调用示例

### 4.1 简单函数调用

假设SO中包含以下C函数：

```c
int add(int a, int b) {
    return a + b;
}
```

Python调用示例：

```python
import ctypes

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义函数类型
so.add.argtypes = [ctypes.c_int, ctypes.c_int]
so.add.restype = ctypes.c_int

# 调用函数
result = so.add(10, 20)
print(f"10 + 20 = {result}")  # 输出：10 + 20 = 30
```

### 4.2 字符串参数

C函数：

```c
const char* greet(const char* name) {
    static char buffer[100];
    snprintf(buffer, sizeof(buffer), "Hello, %s!", name);
    return buffer;
}
```

Python调用：

```python
import ctypes

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义函数类型
so.greet.argtypes = [ctypes.c_char_p]
so.greet.restype = ctypes.c_char_p

# 调用函数
name = b"World"  # 使用bytes类型
result = so.greet(name)
print(result.decode('utf-8'))  # 输出：Hello, World!
```

### 4.3 指针参数

C函数：

```c
void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
```

Python调用：

```python
import ctypes

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义函数类型
so.swap.argtypes = [ctypes.POINTER(ctypes.c_int), ctypes.POINTER(ctypes.c_int)]
so.swap.restype = None

# 创建int变量
a = ctypes.c_int(10)
b = ctypes.c_int(20)

print(f"交换前：a={a.value}, b={b.value}")  # 输出：交换前：a=10, b=20

# 调用函数（传递指针）
so.swap(ctypes.byref(a), ctypes.byref(b))

print(f"交换后：a={a.value}, b={b.value}")  # 输出：交换后：a=20, b=10
```

## 5. 结构体的使用

### 5.1 定义结构体

C结构体：

```c
typedef struct {
    int x;
    int y;
} Point;

Point add_points(Point p1, Point p2) {
    Point result;
    result.x = p1.x + p2.x;
    result.y = p1.y + p2.y;
    return result;
}
```

Python中定义对应的结构体：

```python
import ctypes

# 定义Point结构体
class Point(ctypes.Structure):
    _fields_ = [
        ("x", ctypes.c_int),
        ("y", ctypes.c_int)
    ]

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义函数类型
so.add_points.argtypes = [Point, Point]
so.add_points.restype = Point

# 创建Point实例
p1 = Point(10, 20)
p2 = Point(30, 40)

# 调用函数
result = so.add_points(p1, p2)
print(f"({p1.x}, {p1.y}) + ({p2.x}, {p2.y}) = ({result.x}, {result.y})")  # 输出：(10, 20) + (30, 40) = (40, 60)
```

## 6. 数组的使用

### 6.1 传递数组

C函数：

```c
int sum_array(int* arr, int length) {
    int sum = 0;
    for (int i = 0; i < length; i++) {
        sum += arr[i];
    }
    return sum;
}
```

Python调用：

```python
import ctypes

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义函数类型
so.sum_array.argtypes = [ctypes.POINTER(ctypes.c_int), ctypes.c_int]
so.sum_array.restype = ctypes.c_int

# 创建数组
arr = [1, 2, 3, 4, 5]
# 转换为ctypes数组
c_arr = (ctypes.c_int * len(arr))(*arr)

# 调用函数
sum_result = so.sum_array(c_arr, len(arr))
print(f"数组和：{sum_result}")  # 输出：数组和：15
```

## 7. 回调函数

### 7.1 定义回调函数

C函数：

```c
typedef void (*CallbackFunc)(int);

void process_data(int* data, int length, CallbackFunc callback) {
    for (int i = 0; i < length; i++) {
        callback(data[i]);
    }
}
```

Python调用：

```python
import ctypes

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义回调函数类型
CallbackFunc = ctypes.CFUNCTYPE(None, ctypes.c_int)

# 定义Python回调函数
@CallbackFunc
def my_callback(value):
    print(f"回调函数被调用，值：{value}")

# 定义process_data函数类型
so.process_data.argtypes = [ctypes.POINTER(ctypes.c_int), ctypes.c_int, CallbackFunc]
so.process_data.restype = None

# 创建数据
arr = [1, 2, 3, 4, 5]
c_arr = (ctypes.c_int * len(arr))(*arr)

# 调用函数，传递回调
so.process_data(c_arr, len(arr), my_callback)
```

## 8. 错误处理

### 8.1 检查函数返回值

```python
# 调用函数
result = so.some_function()
if result == -1:
    print("函数调用失败")
else:
    print(f"函数调用成功，结果：{result}")
```

### 8.2 捕获系统错误

```python
try:
    result = so.some_function()
except OSError as e:
    print(f"系统错误：{e}")
```

### 8.3 获取错误码

```python
import ctypes
import os

# 调用函数
result = so.some_function()
if result == -1:
    error_code = ctypes.get_errno()
    error_msg = os.strerror(error_code)
    print(f"错误码：{error_code}，错误信息：{error_msg}")
```

## 9. 实战案例：调用Linux系统API

### 9.1 调用printf

```python
import ctypes

# 加载C标准库
libc = ctypes.CDLL('libc.so.6')

# 定义printf函数类型
libc.printf.argtypes = [ctypes.c_char_p, ...]  # 可变参数
libc.printf.restype = ctypes.c_int

# 调用printf
result = libc.printf(b"Hello from Python!\n")
print(f"printf返回值：{result}")  # 返回打印的字符数
```

### 9.2 调用getpid

```python
import ctypes

# 加载C标准库
libc = ctypes.CDLL('libc.so.6')

# 定义getpid函数类型
libc.getpid.restype = ctypes.c_int

# 调用getpid
pid = libc.getpid()
print(f"当前进程ID：{pid}")
```

### 9.3 调用malloc和free

```python
import ctypes

# 加载C标准库
libc = ctypes.CDLL('libc.so.6')

# 定义函数类型
libc.malloc.restype = ctypes.c_void_p
libc.free.argtypes = [ctypes.c_void_p]
libc.free.restype = None

# 分配内存
buffer_size = 100
buffer = libc.malloc(buffer_size)
print(f"分配的内存地址：{buffer}")

# 使用内存
# ...

# 释放内存
libc.free(buffer)
print("内存已释放")
```

### 9.4 调用stat获取文件信息

```python
import ctypes
import os

# 定义stat结构体
class stat(ctypes.Structure):
    _fields_ = [
        ("st_dev", ctypes.c_ulong),
        ("st_ino", ctypes.c_ulong),
        ("st_mode", ctypes.c_uint),
        ("st_nlink", ctypes.c_uint),
        ("st_uid", ctypes.c_uint),
        ("st_gid", ctypes.c_uint),
        ("st_rdev", ctypes.c_ulong),
        ("st_size", ctypes.c_longlong),
        ("st_blksize", ctypes.c_long),
        ("st_blocks", ctypes.c_longlong),
        ("st_atime", ctypes.c_long),
        ("st_atime_nsec", ctypes.c_long),
        ("st_mtime", ctypes.c_long),
        ("st_mtime_nsec", ctypes.c_long),
        ("st_ctime", ctypes.c_long),
        ("st_ctime_nsec", ctypes.c_long),
    ]

# 加载C标准库
libc = ctypes.CDLL('libc.so.6')

# 定义stat函数类型
libc.stat.argtypes = [ctypes.c_char_p, ctypes.POINTER(stat)]
libc.stat.restype = ctypes.c_int

# 调用stat
file_path = b"./test.txt"
file_stat = stat()
result = libc.stat(file_path, ctypes.byref(file_stat))

if result == 0:
    print(f"文件名：{file_path.decode()}")
    print(f"文件大小：{file_stat.st_size} 字节")
    print(f"文件权限：{oct(file_stat.st_mode & 0o777)}")
    print(f"最后修改时间：{file_stat.st_mtime}")
    print(f"用户ID：{file_stat.st_uid}")
    print(f"组ID：{file_stat.st_gid}")
else:
    error_code = ctypes.get_errno()
    print(f"获取文件信息失败：{os.strerror(error_code)}")
```

## 10. 高级技巧

### 10.1 动态加载和卸载

```python
import ctypes
import os

# 动态加载SO
so_path = './libmylib.so'
so = ctypes.CDLL(so_path)

# 使用SO...

# 卸载SO（Linux平台）
if hasattr(ctypes, 'dlclose'):
    # 注意：ctypes没有直接提供dlclose，但可以通过libc调用
    libc = ctypes.CDLL('libc.so.6')
    libc.dlclose.argtypes = [ctypes.c_void_p]
    libc.dlclose.restype = ctypes.c_int
    libc.dlclose(so._handle)
    print("SO已卸载")
```

### 10.2 处理可变长度字符串

```python
import ctypes

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义函数，返回字符串长度
so.get_string_length.argtypes = [ctypes.c_char_p]
so.get_string_length.restype = ctypes.c_int

# 定义函数，获取字符串
so.get_string.argtypes = [ctypes.c_char_p, ctypes.c_int]
so.get_string.restype = ctypes.c_int

# 先获取字符串长度
name = b"test"
length = so.get_string_length(name)

# 分配足够大的缓冲区
buffer = ctypes.create_string_buffer(length + 1)  # +1 for null terminator

# 获取字符串
dll.get_string(buffer, length + 1)

# 转换为Python字符串
result = buffer.value.decode('utf-8')
print(f"获取到的字符串：{result}")
```

### 10.3 处理回调函数中的异常

```python
import ctypes
import traceback

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义回调函数类型
CallbackFunc = ctypes.CFUNCTYPE(None, ctypes.c_int)

# 定义Python回调函数，包含异常处理
@CallbackFunc
def my_callback(value):
    try:
        # 可能抛出异常的代码
        if value == 0:
            raise ValueError("值不能为0")
        print(f"回调函数被调用，值：{value}")
    except Exception as e:
        # 捕获所有异常，避免崩溃
        print(f"回调函数异常：{e}")
        traceback.print_exc()

# 定义process_data函数类型
so.process_data.argtypes = [ctypes.POINTER(ctypes.c_int), ctypes.c_int, CallbackFunc]
so.process_data.restype = None

# 创建数据（包含0值，用于测试异常处理）
arr = [1, 2, 0, 4, 5]
c_arr = (ctypes.c_int * len(arr))(*arr)

# 调用函数，传递回调
so.process_data(c_arr, len(arr), my_callback)
```

## 11. 常见问题与解决方案

### 11.1 找不到SO文件
- 确保SO文件存在于当前目录或系统LD_LIBRARY_PATH中
- 使用完整路径加载SO
- 检查SO的位数（32位/64位）是否与Python解释器匹配
- 确保SO文件有执行权限：`chmod +x libmylib.so`

### 11.2 函数调用崩溃
- 确保正确定义了函数的参数类型和返回值类型
- 检查参数传递是否正确，特别是指针和数组
- 确保SO使用的调用约定与Python加载方式匹配（CDLL用于cdecl调用约定）
- 检查SO的依赖库是否存在：`ldd libmylib.so`

### 11.3 数据类型不匹配
- 严格按照C函数的声明映射数据类型
- 对于复杂类型（结构体、联合体），确保字段顺序和类型正确
- 注意字符串编码（ASCII vs UTF-8）
- 对于long类型，注意不同平台的大小差异

### 11.4 内存泄漏
- 确保释放动态分配的内存
- 对于返回指针的函数，了解内存的所有权和释放责任
- 使用上下文管理器管理SO的加载和卸载

### 11.5 权限问题
- 确保SO文件有读取和执行权限
- 对于系统库，确保当前用户有访问权限

## 12. 编译SO文件

### 12.1 简单编译

```bash
# 编译单个源文件为SO
gcc -shared -fPIC -o libmylib.so mylib.c

# 编译多个源文件为SO
gcc -shared -fPIC -o libmylib.so mylib1.c mylib2.c
```

### 12.2 编译选项说明
- `-shared`：生成共享库
- `-fPIC`：生成位置无关代码，这是SO必须的
- `-o`：指定输出文件名
- `-I`：指定头文件目录
- `-L`：指定库文件目录
- `-l`：链接其他库

### 12.3 示例：编译包含多个源文件的SO

```bash
# 假设目录结构
# mylib/
# ├── include/
# │   └── mylib.h
# └── src/
#     ├── mylib1.c
#     └── mylib2.c

# 编译命令
gcc -shared -fPIC -o libmylib.so src/mylib1.c src/mylib2.c -Iinclude
```

## 13. 使用PyInstaller打包包含SO的Python应用

### 13.1 PyInstaller简介

PyInstaller是一个用于将Python应用程序打包成独立可执行文件的工具，支持Windows、Linux和macOS平台。它可以自动检测并打包Python应用程序依赖的库和资源，包括SO文件。

### 13.2 安装PyInstaller

```bash
pip install pyinstaller
```

### 13.3 打包包含SO的Python应用

#### 13.3.1 基本打包命令

```bash
# 基本打包，生成单个可执行文件
pyinstaller --onefile your_script.py

# 打包并包含SO文件
pyinstaller --onefile --add-data "libmylib.so:." your_script.py

# 打包并指定输出目录
pyinstaller --onefile --distpath ./dist --workpath ./build your_script.py
```

#### 13.3.2 示例：打包包含SO的Python应用

假设我们有一个Python脚本`app.py`，它使用了`libmylib.so`动态库：

```python
# app.py
import ctypes

# 加载SO
so = ctypes.CDLL('./libmylib.so')

# 定义函数类型
so.add.argtypes = [ctypes.c_int, ctypes.c_int]
so.add.restype = ctypes.c_int

# 调用函数
result = so.add(10, 20)
print(f"10 + 20 = {result}")
```

打包命令：

```bash
pyinstaller --onefile --add-data "libmylib.so:." app.py
```

### 13.4 打包成DEB包

DEB是Debian及其衍生发行版（如Ubuntu）的软件包格式，使用PyInstaller可以将包含SO的Python应用打包成DEB包，便于在Linux平台上分发和安装。

#### 13.4.1 安装必要的工具

```bash
# 安装fpm工具
apt-get update
apt-get install -y ruby ruby-dev build-essential
gem install fpm

# 或使用dpkg-deb工具
apt-get install -y dpkg-dev
```

#### 13.4.2 使用PyInstaller打包

```bash
# 打包Python应用，生成可执行文件
pyinstaller --onefile --add-data "libmylib.so:." app.py

# 验证生成的可执行文件
./dist/app
```

#### 13.4.3 使用fpm创建DEB包

```bash
# 创建DEB包
fpm -s dir -t deb -n myapp -v 1.0.0 -p myapp_1.0.0_amd64.deb --prefix /usr/local/bin ./dist/app

# 添加描述信息
fpm -s dir -t deb -n myapp -v 1.0.0 -p myapp_1.0.0_amd64.deb --prefix /usr/local/bin --description "My Python app with SO library" --maintainer "your@email.com" ./dist/app
```

#### 13.4.4 使用dpkg-deb创建DEB包

```bash
# 创建DEB包目录结构
mkdir -p deb_package/DEBIAN
mkdir -p deb_package/usr/local/bin

# 复制可执行文件
cp ./dist/app deb_package/usr/local/bin/

# 创建控制文件
echo "Package: myapp" > deb_package/DEBIAN/control
echo "Version: 1.0.0" >> deb_package/DEBIAN/control
echo "Architecture: amd64" >> deb_package/DEBIAN/control
echo "Maintainer: your@email.com" >> deb_package/DEBIAN/control
echo "Description: My Python app with SO library" >> deb_package/DEBIAN/control

# 设置文件权限
chmod 755 deb_package/usr/local/bin/app
chmod 644 deb_package/DEBIAN/control

# 构建DEB包
dpkg-deb --build deb_package myapp_1.0.0_amd64.deb
```

#### 13.4.5 DEB包的安装和使用

```bash
# 安装DEB包
sudo dpkg -i myapp_1.0.0_amd64.deb

# 如果缺少依赖，使用apt修复
sudo apt-get install -f

# 运行应用
myapp

# 卸载应用
sudo dpkg -r myapp
```

### 13.5 高级打包技巧

#### 13.5.1 处理多个SO文件

```bash
# 打包多个SO文件
pyinstaller --onefile --add-data "libmylib1.so:." --add-data "libmylib2.so:." app.py
```

#### 13.5.2 指定动态库搜索路径

```python
# 在Python代码中指定动态库搜索路径
import os
import ctypes

# 添加当前目录到动态库搜索路径
if os.name == 'posix':
    # Linux/macOS
    if hasattr(ctypes, 'CDLL'):
        ctypes.CDLL('./libmylib.so', ctypes.RTLD_GLOBAL)
        os.environ['LD_LIBRARY_PATH'] = '.' + os.pathsep + os.environ.get('LD_LIBRARY_PATH', '')
```

#### 13.5.3 使用.spec文件定制打包

```bash
# 生成spec文件
pyinstaller --onefile --add-data "libmylib.so:." app.py --name myapp --specpath ./spec

# 编辑spec文件，自定义打包配置
# 然后使用spec文件打包
pyinstaller ./spec/myapp.spec
```

### 13.6 常见问题与解决方案

#### 13.6.1 SO文件找不到
- 确保SO文件存在于正确的位置
- 使用`--add-data`参数正确包含SO文件
- 检查SO文件的权限，确保有执行权限
- 检查SO文件的依赖是否都已包含

#### 13.6.2 打包后的应用运行失败
- 使用`--debug`参数获取详细的调试信息
- 检查应用的依赖是否都已正确打包
- 确保SO文件的位数（32位/64位）与Python解释器匹配
- 检查SO文件的依赖库是否存在

#### 13.6.3 DEB包安装失败
- 检查DEB包的架构是否与目标系统匹配
- 确保目标系统满足应用的依赖要求
- 使用`dpkg -i --force-all`强制安装（不推荐）
- 检查控制文件的格式是否正确

## 14. 总结

Python通过`ctypes`模块可以方便地加载和调用SO动态库，实现了Python与C/C++代码的无缝集成。在使用过程中，需要注意以下几点：

1. 正确定义函数的参数类型和返回值类型
2. 注意数据类型的映射和转换
3. 妥善处理指针、数组和结构体
4. 实现适当的错误处理机制
5. 注意内存管理，避免内存泄漏
6. 了解SO的编译和链接过程
7. 注意平台差异和调用约定
8. 使用PyInstaller打包时，确保正确包含所有依赖的SO文件

通过掌握这些知识和技巧，可以充分利用SO的优势，扩展Python的功能，提高程序的性能和模块化程度。同时，使用PyInstaller可以方便地将包含SO的Python应用打包成独立可执行文件或DEB包，便于分发和部署。在Linux/Unix平台上，SO是实现跨语言调用和代码共享的重要手段，掌握Python操作SO的技术对于开发高性能、模块化的应用程序具有重要意义。