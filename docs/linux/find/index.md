# find 命令

## 命令简介
`find` 命令用于在指定目录下搜索文件和目录，是 Linux 系统中强大的搜索工具。

## 语法
```bash
find [路径] [选项] [表达式]
```

## 常用选项
- `-name`：按文件名搜索，支持通配符
- `-type`：按文件类型搜索，如 f(普通文件)、d(目录)、l(符号链接)
- `-size`：按文件大小搜索，如 `-size +10M`(大于10MB)、`-size -50k`(小于50KB)
- `-mtime`：按修改时间搜索，如 `-mtime -7`(7天内修改)、`-mtime +30`(30天前修改)
- `-user`：按文件所有者搜索
- `-group`：按文件所属组搜索
- `-perm`：按文件权限搜索
- `-exec`：对搜索结果执行命令

## 示例
1. 搜索当前目录下的所有txt文件：
   ```bash
   find . -name "*.txt"
   ```

2. 搜索指定目录下的所有目录：
   ```bash
   find /home/user -type d
   ```

3. 搜索大于10MB的文件：
   ```bash
   find / -type f -size +10M
   ```

4. 搜索7天内修改过的文件：
   ```bash
   find . -type f -mtime -7
   ```

5. 搜索文件并执行命令：
   ```bash
   find . -name "*.tmp" -exec rm {} \;
   ```

## 注意事项
- 支持复杂的搜索条件组合
- 通配符需要用引号括起来
- `-exec` 选项后面的命令需要用 `{}` 代表搜索结果，用 `\;` 结束
- 搜索范围越大，执行时间越长
- 可以结合管道使用，如 `find . -name "*.txt" | xargs grep "keyword"`