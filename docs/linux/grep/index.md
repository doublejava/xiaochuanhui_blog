# grep 命令

## 命令简介
`grep` 命令用于在文件中搜索指定的模式，是 "global regular expression print" 的缩写，是强大的文本搜索工具。

## 语法
```bash
grep [选项] 模式 [文件...]
```

## 常用选项
- `-i`：忽略大小写
- `-n`：显示匹配行的行号
- `-v`：反向匹配，显示不包含模式的行
- `-r` 或 `-R`：递归搜索目录中的文件
- `-l`：只显示包含匹配的文件名
- `-c`：只显示匹配的行数
- `-A`：显示匹配行及其后指定行数，如 `-A 5`
- `-B`：显示匹配行及其前指定行数，如 `-B 5`
- `-C`：显示匹配行及其前后指定行数，如 `-C 3`
- `-E`：使用扩展正则表达式

## 示例
1. 在文件中搜索关键词：
   ```bash
   grep "keyword" file.txt
   ```

2. 忽略大小写搜索：
   ```bash
   grep -i "keyword" file.txt
   ```

3. 显示匹配行的行号：
   ```bash
   grep -n "keyword" file.txt
   ```

4. 递归搜索目录：
   ```bash
   grep -r "keyword" /home/user/docs/
   ```

5. 显示匹配行及其前后3行：
   ```bash
   grep -C 3 "keyword" file.txt
   ```

## 注意事项
- 支持正则表达式
- 可以结合管道使用，如 `ls -l | grep ".txt"`
- 使用 `-r` 选项可以递归搜索目录
- `-v` 选项用于反向匹配，显示不包含模式的行