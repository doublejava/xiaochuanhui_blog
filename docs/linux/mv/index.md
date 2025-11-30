# mv 命令

## 命令简介
`mv` 命令用于移动或重命名文件和目录，是 "move" 的缩写。

## 语法
```bash
mv [选项] 源文件 目标文件
mv [选项] 源文件... 目标目录
```

## 常用选项
- `-i`：交互式移动，覆盖前提示确认
- `-f`：强制移动，覆盖已存在的文件
- `-v`：显示移动的详细信息
- `-n`：不覆盖已存在的文件

## 示例
1. 重命名文件：
   ```bash
   mv oldname.txt newname.txt
   ```

2. 移动文件到目录：
   ```bash
   mv file.txt /home/user/documents/
   ```

3. 移动多个文件到目录：
   ```bash
   mv file1.txt file2.txt file3.txt /home/user/docs/
   ```

4. 交互式移动：
   ```bash
   mv -i file.txt /home/user/
   ```

5. 重命名目录：
   ```bash
   mv old_dir new_dir
   ```

## 注意事项
- 移动文件时，如果目标文件已存在，默认会覆盖
- 使用 `-i` 选项可以避免误覆盖
- 使用 `-n` 选项可以防止覆盖已存在的文件
- 移动目录不需要 `-r` 选项，直接移动即可
- 可以使用通配符移动多个文件，如 `mv *.txt backup/`