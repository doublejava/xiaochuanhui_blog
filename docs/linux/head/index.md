# head 命令

## 命令简介
`head` 命令用于显示文件的开头部分内容，默认显示前10行。

## 语法
```bash
head [选项] [文件...]
```

## 常用选项
- `-n`：指定显示的行数，如 `-n 20` 或 `-20`
- `-c`：指定显示的字节数，如 `-c 100`
- `-q`：不显示文件名头
- `-v`：总是显示文件名头

## 示例
1. 显示文件前10行：
   ```bash
   head file.txt
   ```

2. 显示文件前20行：
   ```bash
   head -n 20 file.txt
   ```
   或
   ```bash
   head -20 file.txt
   ```

3. 显示文件前50字节：
   ```bash
   head -c 50 file.txt
   ```

4. 显示多个文件的前5行：
   ```bash
   head -n 5 file1.txt file2.txt file3.txt
   ```

5. 不显示文件名头：
   ```bash
   head -q -n 5 file1.txt file2.txt
   ```

## 注意事项
- 默认显示前10行
- 可以结合管道使用，如 `ls -l | head -n 5`
- 对于多个文件，默认会显示文件名头
- 使用 `-q` 选项可以隐藏文件名头