# mkdir 命令

## 命令简介
`mkdir` 命令用于创建新目录，是 "make directory" 的缩写。

## 语法
```bash
mkdir [选项] 目录名...
```

## 常用选项
- `-p`：递归创建目录，即如果父目录不存在则一并创建
- `-m`：设置新目录的权限，如 `-m 755`
- `-v`：显示创建目录的详细信息

## 示例
1. 创建单个目录：
   ```bash
   mkdir documents
   ```

2. 递归创建多级目录：
   ```bash
   mkdir -p /home/user/docs/projects/linux
   ```

3. 创建目录并设置权限：
   ```bash
   mkdir -m 700 private
   ```

4. 创建多个目录：
   ```bash
   mkdir dir1 dir2 dir3
   ```

5. 显示创建过程：
   ```bash
   mkdir -v -p test/subdir
   ```

## 注意事项
- 默认情况下，创建的目录权限由 umask 决定
- 使用 `-p` 选项可以避免 "No such file or directory" 错误
- 可以同时创建多个目录，用空格分隔