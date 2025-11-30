# Oracle 进阶SQL调优

## 1. 执行计划分析与优化

### 执行计划的获取方式
```sql
-- 方式1：使用EXPLAIN PLAN
EXPLAIN PLAN FOR SELECT * FROM employees WHERE department_id = 10;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY());

-- 方式2：使用AUTOTRACE
SET AUTOTRACE ON;
SELECT * FROM employees WHERE department_id = 10;

-- 方式3：使用SQL Monitor
SELECT * FROM TABLE(DBMS_SQLTUNE.REPORT_SQL_MONITOR());
```

### 关键执行计划操作符
- `TABLE ACCESS FULL`：全表扫描，通常需要优化
- `INDEX RANGE SCAN`：索引范围扫描，性能较好
- `INDEX FULL SCAN`：索引全扫描，适用于选择性低的列
- `NESTED LOOPS`：嵌套循环连接，适用于小结果集
- `HASH JOIN`：哈希连接，适用于大结果集
- `MERGE JOIN`：合并连接，适用于排序数据

## 2. 索引优化策略

### 复合索引的设计原则
- 选择性高的列放在前面
- 考虑SQL的WHERE、ORDER BY、GROUP BY子句
- 避免过多的复合索引（维护成本高）

### 函数索引的使用
```sql
-- 创建函数索引
CREATE INDEX idx_employees_hire_year ON employees(EXTRACT(YEAR FROM hire_date));

-- 优化前：无法使用索引
SELECT * FROM employees WHERE EXTRACT(YEAR FROM hire_date) = 2020;

-- 优化后：可以使用函数索引
SELECT * FROM employees WHERE EXTRACT(YEAR FROM hire_date) = 2020;
```

### 索引压缩技术
```sql
-- 创建压缩索引
CREATE INDEX idx_employees_department ON employees(department_id) COMPRESS 1;
```

## 3. SQL语句优化

### 避免在WHERE子句中使用函数
```sql
-- 优化前：无法使用索引
SELECT * FROM employees WHERE UPPER(last_name) = 'SMITH';

-- 优化后：可以使用索引
SELECT * FROM employees WHERE last_name = 'SMITH';
```

### 合理使用绑定变量
```sql
-- 优化前：硬解析，性能差
SELECT * FROM employees WHERE employee_id = 100;
SELECT * FROM employees WHERE employee_id = 101;

-- 优化后：软解析，性能好
SELECT * FROM employees WHERE employee_id = :emp_id;
```

### 避免使用SELECT *
```sql
-- 优化前：返回所有列，增加I/O
SELECT * FROM employees;

-- 优化后：只返回需要的列
SELECT employee_id, first_name, last_name FROM employees;
```

## 4. 分区表优化

### 分区类型选择
- **范围分区**：适用于时间序列数据
- **列表分区**：适用于离散值数据
- **哈希分区**：适用于均匀分布数据
- **复合分区**：结合多种分区类型

### 分区裁剪优化
```sql
-- 优化前：全分区扫描
SELECT * FROM sales WHERE sale_date BETWEEN '2020-01-01' AND '2020-12-31';

-- 优化后：只扫描相关分区
SELECT * FROM sales PARTITION FOR (DATE '2020-06-01') WHERE sale_date BETWEEN '2020-01-01' AND '2020-12-31';
```

## 5. 并行执行优化

### 并行度设置
```sql
-- 设置会话级并行度
ALTER SESSION FORCE PARALLEL QUERY PARALLEL 4;

-- 在SQL中指定并行度
SELECT /*+ PARALLEL(4) */ * FROM sales;
```

### 并行执行的适用场景
- 大数据量查询
- 批量插入、更新、删除操作
- 数据仓库环境

## 6. 内存管理优化

### SGA和PGA的调整
```sql
-- 查看SGA和PGA使用情况
SELECT * FROM V$SGASTAT;
SELECT * FROM V$PGASTAT;

-- 调整SGA大小
ALTER SYSTEM SET sga_target = 8G SCOPE = SPFILE;

-- 调整PGA大小
ALTER SYSTEM SET pga_aggregate_target = 4G SCOPE = SPFILE;
```

### 共享池优化
```sql
-- 查看共享池使用情况
SELECT * FROM V$SHARED_POOL_RESERVED;

-- 调整共享池大小
ALTER SYSTEM SET shared_pool_size = 2G SCOPE = SPFILE;
```

## 7. 性能监控与诊断

### 常用性能视图
- `V$SQL`：查看SQL执行信息
- `V$SQLSTATS`：查看SQL统计信息
- `V$SESSION`：查看会话信息
- `V$SYSTEM_EVENT`：查看系统等待事件

### AWR报告的使用
```sql
-- 生成AWR报告
@$ORACLE_HOME/rdbms/admin/awrrpt.sql
```

### ASH报告的使用
```sql
-- 生成ASH报告
@$ORACLE_HOME/rdbms/admin/ashrpt.sql
```

## 8. 高级SQL特性

### 递归查询
```sql
WITH emp_hierarchy AS (
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

### 模型子句
```sql
SELECT department_id, month, sales, 
       MODEL PARTITION BY (department_id)
             DIMENSION BY (month)
             MEASURES (sales)
             RULES (
                 sales[FOR month FROM 13 TO 24 INCREMENT 1] = sales[CV(month)-12] * 1.1
             )
FROM sales_data;
```

### 闪回查询
```sql
-- 查看表的历史数据
SELECT * FROM employees AS OF TIMESTAMP SYSTIMESTAMP - INTERVAL '1' HOUR;

-- 闪回表到指定时间点
FLASHBACK TABLE employees TO TIMESTAMP SYSTIMESTAMP - INTERVAL '1' HOUR;
```