# cat 命令

## 命令简介
`cat` 命令用于连接文件并打印到标准输出，常用于查看文件内容，是 "concatenate" 的缩写。

## 语法
```bash
cat [选项] [文件...]
```

## 常用选项
- `-n`：显示行号，包括空行
- `-b`：显示行号，但不包括空行
- `-s`：压缩连续的空行，只保留一个空行
- `-A`：显示所有字符，包括控制字符和换行符
- `-T`：将制表符显示为 ^I
- `-E`：在每行末尾显示 $ 符号

## 示例
1. 查看文件内容：
   ```bash
   cat file.txt
   ```

2. 查看文件并显示行号：
   ```bash
   cat -n file.txt
   ```

3. 连接多个文件并显示：
   ```bash
   cat file1.txt file2.txt file3.txt
   ```

4. 将内容输出到文件：
   ```bash
   cat file.txt > newfile.txt
   ```

5. 查看文件并显示所有字符：
   ```bash
   cat -A file.txt
   ```

## 注意事项
- `cat` 适合查看小文件，大文件建议使用 `less` 或 `more`
- 可以使用 `cat > file.txt` 从标准输入创建文件，按 Ctrl+D 结束输入
- 使用 `cat >> file.txt` 可以追加内容到文件末尾
- 结合管道使用，如 `cat file.txt | grep "keyword"`