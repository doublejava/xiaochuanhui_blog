# Java 文件操作详解与实践

## 什么是Java文件操作

Java文件操作是指使用Java API对文件系统进行的各种操作，包括文件的创建、读取、写入、修改、删除、复制、移动等。Java提供了多种文件操作API，从传统的IO到现代的NIO.2，满足不同场景的需求。

## Java文件操作的发展

1. **Java 1.0-1.6**: 传统IO (java.io包)
   - 基于流的操作
   - 代码较为繁琐
   - 性能相对较低

2. **Java 7**: NIO.2 (java.nio.file包)
   - 基于路径的操作
   - 提供了更简洁的API
   - 支持文件系统的各种操作
   - 支持异步IO

3. **Java 8+**: Stream API与NIO.2结合
   - 支持文件内容的流式处理
   - 更高效的文件操作

## 传统IO文件操作

### 1. 文件读取

**使用FileInputStream和BufferedReader**:

```java
// 读取文本文件
try (BufferedReader reader = new BufferedReader(new FileReader("example.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}

// 读取二进制文件
try (FileInputStream fis = new FileInputStream("example.bin")) {
    byte[] buffer = new byte[1024];
    int bytesRead;
    while ((bytesRead = fis.read(buffer)) != -1) {
        // 处理读取的数据
        System.out.println("Read " + bytesRead + " bytes");
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

### 2. 文件写入

**使用FileOutputStream和BufferedWriter**:

```java
// 写入文本文件
try (BufferedWriter writer = new BufferedWriter(new FileWriter("output.txt"))) {
    writer.write("Hello, World!");
    writer.newLine();
    writer.write("This is a test.");
} catch (IOException e) {
    e.printStackTrace();
}

// 写入二进制文件
byte[] data = "Hello, Binary!".getBytes();
try (FileOutputStream fos = new FileOutputStream("output.bin")) {
    fos.write(data);
} catch (IOException e) {
    e.printStackTrace();
}
```

### 3. 文件复制

**使用FileInputStream和FileOutputStream**:

```java
public static void copyFile(File source, File destination) throws IOException {
    try (InputStream in = new FileInputStream(source);
         OutputStream out = new FileOutputStream(destination)) {
        byte[] buffer = new byte[1024];
        int length;
        while ((length = in.read(buffer)) > 0) {
            out.write(buffer, 0, length);
        }
    }
}

// 使用示例
copyFile(new File("source.txt"), new File("destination.txt"));
```

## NIO.2文件操作

### 1. Path和Paths类

Path是NIO.2中表示文件路径的核心类，Paths是创建Path对象的工具类。

```java
// 创建Path对象
Path path1 = Paths.get("example.txt"); // 相对路径
Path path2 = Paths.get("C:\\temp\\example.txt"); // 绝对路径
Path path3 = Paths.get("C:", "temp", "example.txt"); // 可变参数形式

// Path的常用方法
System.out.println("文件名: " + path1.getFileName());
System.out.println("父路径: " + path1.getParent());
System.out.println("根路径: " + path1.getRoot());
System.out.println("绝对路径: " + path1.toAbsolutePath());
System.out.println("规范化路径: " + path1.normalize());
```

### 2. Files类

Files类提供了大量静态方法，用于各种文件操作。

#### 2.1 文件读写

```java
// 读取所有行
List<String> lines = Files.readAllLines(Paths.get("example.txt"), StandardCharsets.UTF_8);
lines.forEach(System.out::println);

// 读取为字节数组
byte[] bytes = Files.readAllBytes(Paths.get("example.bin"));

// 写入文本文件
List<String> content = Arrays.asList("Hello, NIO!", "This is a test.");
Files.write(Paths.get("output.txt"), content, StandardCharsets.UTF_8);

// 写入字节数组
Files.write(Paths.get("output.bin"), "Hello, Binary!".getBytes());
```

#### 2.2 文件复制、移动和删除

```java
// 文件复制
Files.copy(Paths.get("source.txt"), Paths.get("destination.txt"), StandardCopyOption.REPLACE_EXISTING);

// 文件移动
Files.move(Paths.get("old.txt"), Paths.get("new.txt"), StandardCopyOption.REPLACE_EXISTING);

// 文件删除
Files.delete(Paths.get("delete.txt"));

// 安全删除（检查文件是否存在）
if (Files.exists(Paths.get("delete.txt"))) {
    Files.delete(Paths.get("delete.txt"));
}
```

#### 2.3 文件属性操作

```java
Path path = Paths.get("example.txt");

// 检查文件是否存在
boolean exists = Files.exists(path);

// 检查是否为文件
boolean isFile = Files.isRegularFile(path);

// 检查是否为目录
boolean isDirectory = Files.isDirectory(path);

// 检查是否可读
boolean isReadable = Files.isReadable(path);

// 检查是否可写
boolean isWritable = Files.isWritable(path);

// 检查是否可执行
boolean isExecutable = Files.isExecutable(path);

// 获取文件大小
long size = Files.size(path);

// 获取文件创建时间
FileTime creationTime = Files.getAttribute(path, "creationTime");

// 获取文件最后修改时间
FileTime lastModifiedTime = Files.getLastModifiedTime(path);

// 设置文件最后修改时间
Files.setLastModifiedTime(path, FileTime.from(Instant.now()));
```

### 3. 目录操作

```java
Path dirPath = Paths.get("newdir");

// 创建目录
Files.createDirectory(dirPath);

// 创建多级目录
Path multiDirPath = Paths.get("dir1/dir2/dir3");
Files.createDirectories(multiDirPath);

// 列出目录内容
try (DirectoryStream<Path> stream = Files.newDirectoryStream(Paths.get(""))) {
    for (Path entry : stream) {
        System.out.println(entry.getFileName());
    }
}

// 递归列出目录内容（使用Files.walk）
Files.walk(Paths.get(""))
    .filter(Files::isRegularFile)
    .forEach(System.out::println);
```

## 文件读写的高级操作

### 1. 使用BufferedReader和BufferedWriter

```java
// 使用BufferedReader读取大文件
try (BufferedReader reader = Files.newBufferedReader(Paths.get("largefile.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        // 处理每一行
    }
}

// 使用BufferedWriter写入大文件
try (BufferedWriter writer = Files.newBufferedWriter(Paths.get("output.txt"))) {
    for (int i = 0; i < 10000; i++) {
        writer.write("Line " + i);
        writer.newLine();
    }
}
```

### 2. 使用Stream API处理文件内容

```java
// 读取文件并过滤包含特定关键字的行
try (Stream<String> lines = Files.lines(Paths.get("example.txt"))) {
    lines.filter(line -> line.contains("Java"))
         .forEach(System.out::println);
}

// 读取文件并统计行数
long lineCount = Files.lines(Paths.get("example.txt")).count();

// 读取文件并按长度排序
List<String> sortedLines = Files.lines(Paths.get("example.txt"))
    .sorted(Comparator.comparingInt(String::length))
    .collect(Collectors.toList());
```

## 文件监控

Java NIO.2提供了WatchService API，用于监控文件系统的变化。

```java
// 创建WatchService
WatchService watchService = FileSystems.getDefault().newWatchService();

// 注册要监控的目录
Path dir = Paths.get("monitor");
dir.register(watchService, 
             StandardWatchEventKinds.ENTRY_CREATE, 
             StandardWatchEventKinds.ENTRY_MODIFY, 
             StandardWatchEventKinds.ENTRY_DELETE);

// 监控文件变化
while (true) {
    WatchKey key = watchService.take(); // 阻塞，直到有事件发生
    
    for (WatchEvent<?> event : key.pollEvents()) {
        WatchEvent.Kind<?> kind = event.kind();
        Path fileName = (Path) event.context();
        
        System.out.println(kind.name() + ": " + fileName);
    }
    
    // 重置WatchKey，以便继续监控
    boolean valid = key.reset();
    if (!valid) {
        break; // 监控目录已被删除
    }
}
```

## 随机文件访问

使用RandomAccessFile可以随机访问文件的任意位置。

```java
// 随机访问文件
try (RandomAccessFile raf = new RandomAccessFile("random.txt", "rw")) {
    // 写入数据
    raf.writeUTF("Hello");
    raf.writeInt(123);
    raf.writeDouble(3.14);
    
    // 移动到文件开头
    raf.seek(0);
    
    // 读取数据
    String str = raf.readUTF();
    int intValue = raf.readInt();
    double doubleValue = raf.readDouble();
    
    System.out.println("String: " + str);
    System.out.println("Int: " + intValue);
    System.out.println("Double: " + doubleValue);
}
```

## 文件操作的最佳实践

1. **使用try-with-resources**：自动关闭资源，避免资源泄露
2. **使用NIO.2 API**：更简洁、更高效
3. **处理异常**：妥善处理IOException
4. **检查文件存在性**：在操作文件前检查文件是否存在
5. **使用适当的字符集**：明确指定字符集，避免乱码
6. **大文件处理**：对于大文件，使用流式处理，避免一次性加载到内存
7. **使用StandardCopyOption**：在复制文件时，明确指定复制选项
8. **使用相对路径时要小心**：相对路径是相对于当前工作目录的
9. **权限检查**：在操作文件前检查文件权限
10. **使用WatchService监控文件变化**：对于需要实时响应文件变化的场景

## 文件操作的性能考虑

1. **缓冲流**：使用缓冲流可以提高IO性能
2. **NIO vs IO**：对于大多数场景，NIO.2 API比传统IO更高效
3. **并行处理**：对于大文件，可以考虑使用并行流处理
4. **减少IO次数**：尽量减少IO次数，批量处理数据
5. **使用内存映射文件**：对于超大文件，使用内存映射文件可以提高性能

## 常见文件操作问题及解决方案

### 1. 乱码问题

**问题**：读取文件时出现乱码
**解决方案**：明确指定字符集

```java
// 使用指定字符集读取文件
List<String> lines = Files.readAllLines(Paths.get("example.txt"), StandardCharsets.UTF_8);
```

### 2. 大文件处理

**问题**：读取大文件时内存不足
**解决方案**：使用流式处理

```java
// 流式处理大文件
try (Stream<String> lines = Files.lines(Paths.get("largefile.txt"))) {
    lines.forEach(line -> {
        // 处理每一行
    });
}
```

### 3. 文件权限问题

**问题**：无法访问文件，提示权限不足
**解决方案**：检查文件权限，确保有足够的权限

```java
// 检查文件权限
Path path = Paths.get("example.txt");
if (Files.isReadable(path) && Files.isWritable(path)) {
    // 执行文件操作
}
```

### 4. 路径分隔符问题

**问题**：在不同操作系统上，路径分隔符不同
**解决方案**：使用Paths.get()方法，它会自动处理不同操作系统的路径分隔符

```java
// 跨平台路径处理
Path path = Paths.get("dir", "subdir", "file.txt");
```

## 总结

Java文件操作是Java开发中的重要内容，从传统的IO到现代的NIO.2，Java提供了丰富的API来满足各种文件操作需求。

在实际开发中，我们应该根据具体需求选择合适的API：
- 对于简单的文件操作，使用Files类的静态方法最为方便
- 对于大文件处理，使用流式API可以提高性能
- 对于需要随机访问的场景，使用RandomAccessFile
- 对于需要监控文件变化的场景，使用WatchService

通过掌握Java文件操作的各种API和最佳实践，我们可以编写出高效、可靠的文件处理代码。