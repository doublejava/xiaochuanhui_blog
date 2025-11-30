# chown 命令

## 命令简介
`chown` 命令用于修改文件或目录的所有者和所属组，是 "change owner" 的缩写。

## 语法
```bash
chown [选项] 所有者[:所属组] 文件/目录...
```

## 常用选项
- `-R`：递归修改目录及其内容的所有者和所属组
- `-v`：显示修改的详细信息
- `-c`：只显示发生变化的文件
- `--reference=RFILE`：使用参考文件的所有者和所属组

## 示例
1. 修改文件所有者：
   ```bash
   chown user file.txt
   ```

2. 修改文件所有者和所属组：
   ```bash
   chown user:group file.txt
   ```

3. 只修改文件所属组：
   ```bash
   chown :group file.txt
   ```

4. 递归修改目录的所有者和所属组：
   ```bash
   chown -R user:group directory/
   ```

5. 使用参考文件的所有者和所属组：
   ```bash
   chown --reference=ref.txt target.txt
   ```

## 注意事项
- 只有 root 用户可以修改文件的所有者
- 普通用户可以修改自己文件的所属组，但必须是该组的成员
- 使用 `-R` 选项时要小心，避免误改系统文件
- 可以同时修改多个文件的所有者和所属组