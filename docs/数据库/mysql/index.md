# MySQL 进阶SQL调优

## 1. 执行计划分析与优化

### 执行计划的获取方式
```sql
-- 方式1：使用EXPLAIN
EXPLAIN SELECT * FROM employees WHERE department_id = 10;

-- 方式2：使用EXPLAIN ANALYZE（MySQL 8.0+）
EXPLAIN ANALYZE SELECT * FROM employees WHERE department_id = 10;

-- 方式3：使用SHOW PROFILES
SET profiling = 1;
SELECT * FROM employees WHERE department_id = 10;
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

### 关键执行计划列解析
- `id`：查询执行顺序
- `select_type`：查询类型（SIMPLE, PRIMARY, SUBQUERY等）
- `table`：访问的表
- `type`：访问类型（ALL, index, range, ref, eq_ref, const, system）
- `possible_keys`：可能使用的索引
- `key`：实际使用的索引
- `key_len`：使用的索引长度
- `rows`：估计扫描的行数
- `Extra`：额外信息（Using index, Using where, Using filesort等）

## 2. 索引优化策略

### 索引类型选择
- **B-Tree索引**：适用于大多数场景
- **Hash索引**：适用于等值查询，不支持范围查询
- **Fulltext索引**：适用于全文搜索
- **Spatial索引**：适用于地理空间数据

### 覆盖索引的使用
```sql
-- 创建覆盖索引
CREATE INDEX idx_employees_dept_salary ON employees(department_id, salary);

-- 优化前：需要回表查询
SELECT employee_id, first_name, salary FROM employees WHERE department_id = 10;

-- 优化后：使用覆盖索引，无需回表
SELECT employee_id, salary FROM employees WHERE department_id = 10;
```

### 前缀索引的优化
```sql
-- 创建前缀索引
CREATE INDEX idx_employees_last_name ON employees(last_name(10));

-- 选择合适的前缀长度
SELECT COUNT(DISTINCT LEFT(last_name, 10)) / COUNT(*) FROM employees;
```

## 3. SQL语句优化

### 避免隐式类型转换
```sql
-- 优化前：隐式类型转换，无法使用索引
SELECT * FROM employees WHERE employee_id = '100';

-- 优化后：显式类型匹配，可以使用索引
SELECT * FROM employees WHERE employee_id = 100;
```

### 优化JOIN操作
```sql
-- 优化前：笛卡尔积，性能差
SELECT * FROM employees, departments;

-- 优化后：使用显式JOIN和索引
SELECT * FROM employees e JOIN departments d ON e.department_id = d.department_id;
```

### 优化子查询
```sql
-- 优化前：相关子查询，性能差
SELECT * FROM employees WHERE department_id IN (SELECT department_id FROM departments WHERE location_id = 1);

-- 优化后：使用JOIN，性能好
SELECT e.* FROM employees e JOIN departments d ON e.department_id = d.department_id WHERE d.location_id = 1;
```

## 4. 分区表优化

### 分区类型选择
- **RANGE分区**：适用于时间序列数据
- **LIST分区**：适用于离散值数据
- **HASH分区**：适用于均匀分布数据
- **KEY分区**：基于MySQL内部哈希函数
- **COLUMNS分区**：直接使用列值进行分区

### 分区表的创建
```sql
-- 创建RANGE分区表
CREATE TABLE sales (
    id INT AUTO_INCREMENT,
    sale_date DATE,
    amount DECIMAL(10,2),
    PRIMARY KEY (id, sale_date)
) PARTITION BY RANGE (YEAR(sale_date)) (
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023)
);
```

### 分区裁剪优化
```sql
-- 优化前：全分区扫描
SELECT * FROM sales WHERE sale_date BETWEEN '2020-01-01' AND '2020-12-31';

-- 优化后：只扫描相关分区
SELECT * FROM sales PARTITION (p2020) WHERE sale_date BETWEEN '2020-01-01' AND '2020-12-31';
```

## 5. 内存与缓存优化

### InnoDB缓冲池优化
```sql
-- 查看缓冲池使用情况
SHOW ENGINE INNODB STATUS\G

-- 调整缓冲池大小
SET GLOBAL innodb_buffer_pool_size = 8G;

-- 调整缓冲池实例数量
SET GLOBAL innodb_buffer_pool_instances = 4;
```

### 查询缓存优化（MySQL 8.0前）
```sql
-- 查看查询缓存状态
SHOW VARIABLES LIKE 'query_cache%';

-- 启用查询缓存
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_size = 128M;
```

### 优化器缓存
```sql
-- 查看优化器缓存状态
SHOW VARIABLES LIKE 'optimizer_switch';

-- 调整优化器缓存大小
SET GLOBAL optimizer_prune_level = 1;
SET GLOBAL optimizer_search_depth = 62;
```

## 6. 事务与锁优化

### 事务隔离级别优化
```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET GLOBAL transaction_isolation = 'READ COMMITTED';
```

### 锁等待优化
```sql
-- 查看锁等待情况
SHOW ENGINE INNODB STATUS\G

-- 查看锁信息
SELECT * FROM performance_schema.data_locks;
SELECT * FROM performance_schema.data_lock_waits;

-- 调整锁等待超时
SET GLOBAL innodb_lock_wait_timeout = 50;
```

### 死锁处理
```sql
-- 查看死锁日志
SHOW ENGINE INNODB STATUS\G

-- 启用死锁监控
SET GLOBAL innodb_print_all_deadlocks = ON;
```

## 7. 性能监控与诊断

### 慢查询日志
```sql
-- 启用慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 2;

-- 使用mysqldumpslow分析慢查询
mysqldumpslow -s t /var/log/mysql/slow.log
```

### Performance Schema
```sql
-- 查看Performance Schema状态
SHOW VARIABLES LIKE 'performance_schema';

-- 查询执行统计
SELECT * FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_timer_wait DESC LIMIT 10;
```

### Sys Schema
```sql
-- 查看Top 10慢查询
SELECT * FROM sys.statements_with_runtimes_in_95th_percentile LIMIT 10;

-- 查看索引使用情况
SELECT * FROM sys.schema_unused_indexes;
```

## 8. 高级SQL特性

### 窗口函数
```sql
-- 计算部门内工资排名
SELECT 
    employee_id, first_name, department_id, salary,
    RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rank,
    DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_rank,
    ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num
FROM employees;
```

### 递归CTE（MySQL 8.0+）
```sql
WITH RECURSIVE emp_hierarchy AS (
    SELECT employee_id, first_name, last_name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL
    UNION ALL
    SELECT e.employee_id, e.first_name, e.last_name, e.manager_id, eh.level + 1
    FROM employees e
    JOIN emp_hierarchy eh ON e.manager_id = eh.employee_id
)
SELECT * FROM emp_hierarchy;
```

### 直方图（MySQL 8.0+）
```sql
-- 创建直方图
ANALYZE TABLE employees UPDATE HISTOGRAM ON last_name WITH 10 BUCKETS;

-- 查看直方图
SELECT * FROM information_schema.column_statistics WHERE table_name = 'employees';
```

## 9. InnoDB存储引擎优化

### 表空间管理
```sql
-- 查看表空间使用情况
SELECT TABLE_SCHEMA, TABLE_NAME, DATA_LENGTH, INDEX_LENGTH, DATA_FREE
FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'mydb';

-- 优化表空间
OPTIMIZE TABLE employees;
```

### 日志优化
```sql
-- 调整 redo log 大小
SET GLOBAL innodb_log_file_size = 256M;
SET GLOBAL innodb_log_files_in_group = 2;

-- 调整 undo log 大小
SET GLOBAL innodb_undo_tablespaces = 2;
SET GLOBAL innodb_undo_log_truncate = ON;
```

### 并行复制优化
```sql
-- 启用并行复制
SET GLOBAL slave_parallel_type = 'LOGICAL_CLOCK';
SET GLOBAL slave_parallel_workers = 4;
```