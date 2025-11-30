# 金仓数据库 进阶SQL调优

## 1. 执行计划分析与优化

### 执行计划的获取方式
```sql
-- 方式1：使用EXPLAIN
EXPLAIN SELECT * FROM employees WHERE department_id = 10;

-- 方式2：使用EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM employees WHERE department_id = 10;

-- 方式3：使用EXPLAIN VERBOSE
EXPLAIN VERBOSE SELECT * FROM employees WHERE department_id = 10;
```

### 关键执行计划操作符
- `Seq Scan`：全表扫描，通常需要优化
- `Index Scan`：索引扫描，性能较好
- `Index Only Scan`：仅索引扫描，无需回表
- `Bitmap Heap Scan`：位图堆扫描，结合位图索引使用
- `Nested Loop`：嵌套循环连接，适用于小结果集
- `Hash Join`：哈希连接，适用于大结果集
- `Merge Join`：合并连接，适用于排序数据

## 2. 索引优化策略

### 索引类型选择
- **B-Tree索引**：适用于大多数场景
- **Hash索引**：适用于等值查询
- **GiST索引**：适用于空间数据和全文搜索
- **GIN索引**：适用于数组和JSON数据
- **BRIN索引**：适用于大数据量的时序数据

### 部分索引的使用
```sql
-- 创建部分索引
CREATE INDEX idx_employees_active ON employees(employee_id) WHERE status = 'active';

-- 优化前：全表扫描
SELECT * FROM employees WHERE status = 'active' AND department_id = 10;

-- 优化后：使用部分索引，性能提升
SELECT * FROM employees WHERE status = 'active' AND department_id = 10;
```

### 表达式索引的使用
```sql
-- 创建表达式索引
CREATE INDEX idx_employees_hire_year ON employees(EXTRACT(YEAR FROM hire_date));

-- 优化前：无法使用索引
SELECT * FROM employees WHERE EXTRACT(YEAR FROM hire_date) = 2020;

-- 优化后：可以使用表达式索引
SELECT * FROM employees WHERE EXTRACT(YEAR FROM hire_date) = 2020;
```

## 3. SQL语句优化

### 避免在WHERE子句中使用OR
```sql
-- 优化前：OR条件，可能导致全表扫描
SELECT * FROM employees WHERE department_id = 10 OR salary > 5000;

-- 优化后：使用UNION ALL，利用索引
SELECT * FROM employees WHERE department_id = 10
UNION ALL
SELECT * FROM employees WHERE salary > 5000 AND department_id != 10;
```

### 优化聚合查询
```sql
-- 优化前：全表扫描聚合
SELECT department_id, AVG(salary) FROM employees GROUP BY department_id;

-- 优化后：使用索引和物化视图
CREATE MATERIALIZED VIEW mv_dept_avg_salary AS
SELECT department_id, AVG(salary) as avg_salary FROM employees GROUP BY department_id;

SELECT * FROM mv_dept_avg_salary;
REFRESH MATERIALIZED VIEW mv_dept_avg_salary;
```

### 优化窗口函数
```sql
-- 优化前：窗口函数性能差
SELECT 
    employee_id, first_name, department_id, salary,
    RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rank
FROM employees;

-- 优化后：创建索引加速窗口函数
CREATE INDEX idx_employees_dept_salary ON employees(department_id, salary DESC);
```

## 4. 分区表优化

### 分区类型选择
- **范围分区**：适用于时间序列数据
- **列表分区**：适用于离散值数据
- **哈希分区**：适用于均匀分布数据
- **间隔分区**：自动按间隔创建分区

### 分区表的创建
```sql
-- 创建范围分区表
CREATE TABLE sales (
    id INT PRIMARY KEY,
    sale_date DATE,
    amount DECIMAL(10,2)
)
PARTITION BY RANGE (sale_date) (
    PARTITION p2020 VALUES LESS THAN ('2021-01-01'),
    PARTITION p2021 VALUES LESS THAN ('2022-01-01'),
    PARTITION p2022 VALUES LESS THAN ('2023-01-01')
);

-- 创建间隔分区表
CREATE TABLE sales_interval (
    id INT PRIMARY KEY,
    sale_date DATE,
    amount DECIMAL(10,2)
)
PARTITION BY RANGE (sale_date) INTERVAL ('1 year') (
    PARTITION p2020 VALUES LESS THAN ('2021-01-01')
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

### 共享缓冲区优化
```sql
-- 查看共享缓冲区状态
SHOW shared_buffers;

-- 调整共享缓冲区大小
ALTER SYSTEM SET shared_buffers = '8GB';
```

### 工作内存优化
```sql
-- 查看工作内存状态
SHOW work_mem;

-- 调整工作内存大小
ALTER SYSTEM SET work_mem = '64MB';
```

### 维护工作内存
```sql
-- 查看维护工作内存状态
SHOW maintenance_work_mem;

-- 调整维护工作内存大小
ALTER SYSTEM SET maintenance_work_mem = '1GB';
```

## 6. 事务与锁优化

### 事务隔离级别优化
```sql
-- 查看当前隔离级别
SHOW default_transaction_isolation;

-- 设置隔离级别
ALTER SYSTEM SET default_transaction_isolation = 'read committed';
```

### 锁等待优化
```sql
-- 查看锁等待情况
SELECT * FROM pg_locks WHERE NOT granted;

-- 查看锁持有者
SELECT * FROM pg_stat_activity WHERE pid IN (
    SELECT pid FROM pg_locks WHERE granted
);

-- 调整锁等待超时
ALTER SYSTEM SET lock_timeout = '50s';
```

### 死锁处理
```sql
-- 查看死锁日志
SELECT * FROM pg_log WHERE message LIKE '%deadlock%';

-- 启用死锁监控
ALTER SYSTEM SET log_lock_waits = on;
ALTER SYSTEM SET deadlock_timeout = '1s';
```

## 7. 性能监控与诊断

### 慢查询日志
```sql
-- 启用慢查询日志
ALTER SYSTEM SET logging_collector = on;
ALTER SYSTEM SET log_directory = '/var/log/kingbase';
ALTER SYSTEM SET log_filename = 'kingbase-%Y-%m-%d.log';
ALTER SYSTEM SET log_min_duration_statement = 2000;

-- 使用pg_stat_statements分析慢查询
CREATE EXTENSION pg_stat_statements;
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

### 系统视图查询
```sql
-- 查看数据库连接状态
SELECT * FROM pg_stat_activity;

-- 查看表统计信息
SELECT * FROM pg_stat_user_tables;

-- 查看索引使用情况
SELECT * FROM pg_stat_user_indexes;
```

### 性能视图
```sql
-- 查看缓存命中率
SELECT 
    SUM(blks_hit) / (SUM(blks_hit) + SUM(blks_read)) AS cache_hit_ratio
FROM pg_stat_database;

-- 查看锁统计
SELECT 
    locktype, mode, COUNT(*) 
FROM pg_locks 
GROUP BY locktype, mode;
```

## 8. 高级SQL特性

### 递归查询
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

### 批量操作优化
```sql
-- 优化前：单条插入，性能差
INSERT INTO employees (first_name, last_name, department_id, salary) VALUES ('John', 'Doe', 10, 5000);
INSERT INTO employees (first_name, last_name, department_id, salary) VALUES ('Jane', 'Smith', 20, 6000);

-- 优化后：批量插入，性能好
INSERT INTO employees (first_name, last_name, department_id, salary) VALUES 
('John', 'Doe', 10, 5000),
('Jane', 'Smith', 20, 6000);
```

### JSON数据类型优化
```sql
-- 创建JSONB索引
CREATE INDEX idx_employees_metadata ON employees USING GIN (metadata jsonb_path_ops);

-- 优化前：JSON查询性能差
SELECT * FROM employees WHERE metadata->>'city' = 'Beijing';

-- 优化后：使用JSONB索引，性能提升
SELECT * FROM employees WHERE metadata @> '{"city": "Beijing"}'::jsonb;
```

## 9. 存储优化

### 表空间优化
```sql
-- 创建表空间
CREATE TABLESPACE ts_data LOCATION '/data/kingbase/ts_data';

-- 在指定表空间创建表
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50)
) TABLESPACE ts_data;
```

### 压缩表
```sql
-- 创建压缩表
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    data TEXT
) WITH (COMPRESSION = 'pglz');

-- 压缩现有表
ALTER TABLE employees SET (COMPRESSION = 'pglz');
VACUUM FULL employees;
```

### 分区表维护
```sql
-- 添加新分区
ALTER TABLE sales ADD PARTITION p2023 VALUES LESS THAN ('2024-01-01');

-- 删除旧分区
ALTER TABLE sales DROP PARTITION p2020;

-- 合并分区
ALTER TABLE sales MERGE PARTITIONS p2021, p2022 INTO PARTITION p2021_2022;
```

## 10. 金仓特有优化

### 兼容模式优化
```sql
-- 查看兼容模式
SHOW compatible_mode;

-- 设置兼容模式
ALTER SYSTEM SET compatible_mode = 'oracle';
```

### 并行查询优化
```sql
-- 查看并行查询设置
SHOW max_parallel_workers_per_gather;

-- 调整并行查询设置
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;
```

### 计划缓存优化
```sql
-- 查看计划缓存状态
SHOW plan_cache_mode;

-- 调整计划缓存模式
ALTER SYSTEM SET plan_cache_mode = 'auto';
```