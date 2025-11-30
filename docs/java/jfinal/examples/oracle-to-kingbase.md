# JFinal 跨数据库表拷贝示例（Oracle 到金仓）

本示例将演示如何使用 JFinal 的 DB 和 ActiveRecord 功能，实现从 Oracle 数据库拷贝表结构和数据到金仓（Kingbase）数据库。

## 技术栈

- JFinal 5.1.0
- Oracle 19c
- 金仓数据库 V8
- Druid 连接池
- JDK 11

## 项目结构

```
oracle-to-kingbase/
├── src/main/java/
│   ├── com/example/
│   │   ├── config/
│   │   │   └── AppConfig.java        # 配置类
│   │   ├── controller/
│   │   │   └── TableCopyController.java  # 表拷贝控制器
│   │   └── service/
│   │       └── TableCopyService.java     # 表拷贝服务
│   └── AppStart.java                 # 启动类
├── src/main/resources/
│   └── config.properties           # 配置文件
└── src/main/webapp/
    ├── table-copy.html             # 表拷贝页面
    └── WEB-INF/
        └── web.xml                  # Web 配置
```

## 1. 配置文件

### config.properties

```bash
# Oracle 数据库配置
oracle.url=jdbc:oracle:thin:@localhost:1521:orcl
oracle.username=system
oracle.password=oracle

# 金仓数据库配置
kingbase.url=jdbc:kingbase8://localhost:54321/test
kingbase.username=system
kingbase.password=kingbase

# 开发模式
devMode=true

# 表拷贝配置
table.copy.batchSize=1000  # 批量插入大小
table.copy.includeTables=USER,DEPARTMENT,EMPLOYEE  # 要拷贝的表，多个表用逗号分隔
table.copy.excludeTables=LOG,AUDIT  # 排除的表，多个表用逗号分隔
```

## 2. 配置类

### AppConfig.java

```java
package com.example.config;

import com.jfinal.config.*;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.druid.DruidPlugin;

public class AppConfig extends JFinalConfig {
    
    @Override
    public void configConstant(Constants me) {
        // 加载配置文件
        loadPropertyFile("config.properties");
        
        // 设置开发模式
        me.setDevMode(getPropertyToBoolean("devMode", false));
        
        // 设置基础视图路径
        me.setBaseViewPath("/");
    }
    
    @Override
    public void configRoute(Routes me) {
        // 配置表拷贝路由
        me.add("/table-copy", com.example.controller.TableCopyController.class);
    }
    
    @Override
    public void configPlugin(Plugins me) {
        // 配置 Oracle 数据库连接池
        DruidPlugin oracleDruid = new DruidPlugin(
            getProperty("oracle.url"),
            getProperty("oracle.username"),
            getProperty("oracle.password"),
            "oracle.jdbc.driver.OracleDriver"
        );
        me.add(oracleDruid);
        
        // 配置 Oracle ActiveRecord 插件（主数据源）
        ActiveRecordPlugin oracleArp = new ActiveRecordPlugin("oracle", oracleDruid);
        // Oracle 方言配置
        oracleArp.setDialect(new com.jfinal.plugin.activerecord.dialect.OracleDialect());
        oracleArp.setShowSql(true);
        me.add(oracleArp);
        
        // 配置金仓数据库连接池
        DruidPlugin kingbaseDruid = new DruidPlugin(
            getProperty("kingbase.url"),
            getProperty("kingbase.username"),
            getProperty("kingbase.password"),
            "com.kingbase8.Driver"
        );
        me.add(kingbaseDruid);
        
        // 配置金仓 ActiveRecord 插件
        ActiveRecordPlugin kingbaseArp = new ActiveRecordPlugin("kingbase", kingbaseDruid);
        // 金仓方言配置（金仓兼容 PostgreSQL，可以使用 PostgreSQL 方言）
        kingbaseArp.setDialect(new com.jfinal.plugin.activerecord.dialect.PostgreSqlDialect());
        kingbaseArp.setShowSql(true);
        me.add(kingbaseArp);
    }
    
    @Override
    public void configInterceptor(Interceptors me) {
        // 可以添加全局拦截器
    }
    
    @Override
    public void configHandler(Handlers me) {
        // 可以添加全局处理器
    }
}
```

## 3. 表拷贝服务

### TableCopyService.java

```java
package com.example.service;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.Table;
import com.jfinal.plugin.activerecord.TableMapping;
import com.jfinal.plugin.druid.DruidPlugin;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class TableCopyService {
    
    // Oracle 数据源名称
    private static final String ORACLE_DS = "oracle";
    // 金仓数据源名称
    private static final String KINGBASE_DS = "kingbase";
    
    // 批量插入大小
    private int batchSize;
    // 要拷贝的表列表
    private List<String> includeTables;
    // 要排除的表列表
    private List<String> excludeTables;
    
    public TableCopyService(Properties prop) {
        // 初始化配置
        this.batchSize = Integer.parseInt(prop.getProperty("table.copy.batchSize", "1000"));
        
        // 解析要拷贝的表
        String includeTablesStr = prop.getProperty("table.copy.includeTables", "");
        this.includeTables = new ArrayList<>();
        if (!includeTablesStr.isEmpty()) {
            for (String table : includeTablesStr.split(",")) {
                this.includeTables.add(table.trim().toUpperCase());
            }
        }
        
        // 解析要排除的表
        String excludeTablesStr = prop.getProperty("table.copy.excludeTables", "");
        this.excludeTables = new ArrayList<>();
        if (!excludeTablesStr.isEmpty()) {
            for (String table : excludeTablesStr.split(",")) {
                this.excludeTables.add(table.trim().toUpperCase());
            }
        }
    }
    
    /**
     * 获取 Oracle 数据库中的所有表
     */
    public List<String> getOracleTables() {
        List<String> tables = new ArrayList<>();
        
        try {
            // 获取 Oracle 数据源的连接
            DruidPlugin oracleDruid = getDruidPlugin(ORACLE_DS);
            Connection conn = oracleDruid.getDataSource().getConnection();
            DatabaseMetaData metaData = conn.getMetaData();
            
            // 查询用户表
            ResultSet rs = metaData.getTables(null, getProperty("oracle.username").toUpperCase(), null, new String[]{"TABLE"});
            
            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                tables.add(tableName);
            }
            
            rs.close();
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return tables;
    }
    
    /**
     * 拷贝单个表从 Oracle 到金仓
     */
    public boolean copyTable(String tableName) {
        try {
            // 1. 获取表结构
            String createTableSql = getCreateTableSql(tableName);
            if (createTableSql == null) {
                System.err.println("无法获取表 " + tableName + " 的创建语句");
                return false;
            }
            
            // 2. 在金仓数据库创建表
            Db.use(KINGBASE_DS).update(createTableSql);
            System.out.println("成功创建金仓表: " + tableName);
            
            // 3. 拷贝数据
            copyTableData(tableName);
            System.out.println("成功拷贝表 " + tableName + " 的数据");
            
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * 获取表创建语句
     */
    private String getCreateTableSql(String tableName) {
        // 这里需要根据 Oracle 表结构生成金仓兼容的创建语句
        // 实际项目中可以使用更复杂的表结构转换逻辑
        
        // 示例：简单的表结构转换
        // 注意：实际项目中需要根据 Oracle 数据类型映射到金仓数据类型
        String oracleSql = Db.use(ORACLE_DS).queryStr("SELECT DBMS_METADATA.GET_DDL('TABLE', ?) FROM DUAL", tableName);
        
        if (oracleSql == null) {
            return null;
        }
        
        // 转换 Oracle 数据类型到金仓数据类型
        String kingbaseSql = oracleSql
            .replace("NUMBER", "INTEGER")
            .replace("VARCHAR2", "VARCHAR")
            .replace("DATE", "TIMESTAMP")
            .replace("CLOB", "TEXT")
            .replace("BLOB", "BYTEA")
            .replace(" CONSTRAINT ", " CONSTRAINT ")
            .replace("PRIMARY KEY (", "PRIMARY KEY (");
        
        // 移除 Oracle 特定的存储子句
        kingbaseSql = kingbaseSql.replaceAll("STORAGE\([^)]+\)", "");
        kingbaseSql = kingbaseSql.replaceAll("TABLESPACE\s+\w+", "");
        
        return kingbaseSql;
    }
    
    /**
     * 拷贝表数据
     */
    private void copyTableData(String tableName) {
        // 获取表的所有列
        List<String> columns = getTableColumns(tableName);
        if (columns.isEmpty()) {
            return;
        }
        
        // 构建查询 SQL
        String selectSql = "SELECT " + String.join(", ", columns) + " FROM " + tableName;
        
        // 构建插入 SQL
        String insertSql = "INSERT INTO " + tableName + " (" + String.join(", ", columns) + ") VALUES (" + 
                          generatePlaceholders(columns.size()) + ")";
        
        // 分页查询 Oracle 数据并批量插入金仓
        int pageSize = this.batchSize;
        int pageNumber = 1;
        
        while (true) {
            // 从 Oracle 分页查询数据
            List<Record> records = Db.use(ORACLE_DS).paginate(pageNumber, pageSize, selectSql).getList();
            
            if (records.isEmpty()) {
                break;
            }
            
            // 批量插入金仓
            Db.use(KINGBASE_DS).tx(() -> {
                for (Record record : records) {
                    // 转换 Oracle 数据类型到金仓兼容类型
                    convertOracleDataToKingbase(record, columns);
                    
                    // 执行插入
                    Db.use(KINGBASE_DS).update(insertSql, record.getColumns().values().toArray());
                }
                return true;
            });
            
            System.out.println("已拷贝 " + tableName + " 第 " + pageNumber + " 页数据");
            pageNumber++;
        }
    }
    
    /**
     * 获取表的所有列
     */
    private List<String> getTableColumns(String tableName) {
        List<String> columns = new ArrayList<>();
        
        try {
            DruidPlugin oracleDruid = getDruidPlugin(ORACLE_DS);
            Connection conn = oracleDruid.getDataSource().getConnection();
            DatabaseMetaData metaData = conn.getMetaData();
            
            ResultSet rs = metaData.getColumns(null, getProperty("oracle.username").toUpperCase(), tableName, null);
            
            while (rs.next()) {
                columns.add(rs.getString("COLUMN_NAME"));
            }
            
            rs.close();
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return columns;
    }
    
    /**
     * 生成占位符
     */
    private String generatePlaceholders(int count) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            if (i > 0) {
                sb.append(", ");
            }
            sb.append("?");
        }
        return sb.toString();
    }
    
    /**
     * 转换 Oracle 数据到金仓兼容类型
     */
    private void convertOracleDataToKingbase(Record record, List<String> columns) {
        // 转换 Oracle 特定数据类型到金仓兼容类型
        for (String column : columns) {
            Object value = record.get(column);
            if (value != null) {
                // 转换 Oracle DATE 类型到 java.util.Date
                // 转换 Oracle CLOB 类型到 String
                // 转换 Oracle BLOB 类型到 byte[]
                // 这里根据实际情况添加转换逻辑
            }
        }
    }
    
    /**
     * 拷贝所有配置的表
     */
    public boolean copyAllTables() {
        List<String> tables = getOracleTables();
        boolean allSuccess = true;
        
        for (String table : tables) {
            // 检查是否需要拷贝该表
            if (shouldCopyTable(table)) {
                boolean success = copyTable(table);
                if (!success) {
                    allSuccess = false;
                }
            }
        }
        
        return allSuccess;
    }
    
    /**
     * 检查是否需要拷贝该表
     */
    private boolean shouldCopyTable(String tableName) {
        // 如果有包含列表，只拷贝包含列表中的表
        if (!includeTables.isEmpty() && !includeTables.contains(tableName)) {
            return false;
        }
        
        // 如果在排除列表中，不拷贝
        if (excludeTables.contains(tableName)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 获取 Druid 插件
     */
    private DruidPlugin getDruidPlugin(String dataSourceName) {
        // 实际项目中需要从 JFinal 插件管理器中获取
        // 这里简化处理，返回 null
        return null;
    }
    
    /**
     * 获取配置属性
     */
    private String getProperty(String key) {
        // 实际项目中需要从 JFinal 配置中获取
        // 这里简化处理，返回空字符串
        return "";
    }
}
```

## 4. 控制器

### TableCopyController.java

```java
package com.example.controller;

import com.example.service.TableCopyService;
import com.jfinal.core.Controller;
import com.jfinal.kit.PropertiesKit;

import java.util.Properties;

public class TableCopyController extends Controller {
    
    private TableCopyService tableCopyService;
    
    public TableCopyController() {
        // 加载配置文件
        Properties prop = PropertiesKit.use("config.properties").getProperties();
        this.tableCopyService = new TableCopyService(prop);
    }
    
    // 表拷贝首页
    public void index() {
        // 获取 Oracle 数据库中的所有表
        set("oracleTables", tableCopyService.getOracleTables());
        render("table-copy.html");
    }
    
    // 拷贝单个表
    public void copySingleTable() {
        String tableName = getPara("tableName");
        boolean success = tableCopyService.copyTable(tableName);
        
        renderJson("success", success);
        renderJson("message", success ? "表拷贝成功" : "表拷贝失败");
    }
    
    // 拷贝所有表
    public void copyAllTables() {
        boolean success = tableCopyService.copyAllTables();
        
        renderJson("success", success);
        renderJson("message", success ? "所有表拷贝成功" : "部分表拷贝失败");
    }
}
```

## 5. 启动类

### AppStart.java

```java
package com.example;

import com.example.config.AppConfig;
import com.jfinal.core.JFinal;

public class AppStart {
    public static void main(String[] args) {
        JFinal.start("src/main/webapp", 8080, "/", 5);
    }
}
```

## 6. 前端页面

### table-copy.html

```html
<!DOCTYPE html>
<html>
<head>
    <title>Oracle 到金仓表拷贝</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
        }
        .table-list {
            margin: 20px 0;
        }
        .table-item {
            display: flex;
            align-items: center;
            padding: 10px;
            border: 1px solid #ddd;
            margin: 5px 0;
            border-radius: 4px;
        }
        .table-name {
            flex: 1;
        }
        .copy-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
        }
        .copy-btn:hover {
            background-color: #45a049;
        }
        .copy-all-btn {
            background-color: #2196F3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .copy-all-btn:hover {
            background-color: #0b7dda;
        }
        .status {
            margin-left: 10px;
            color: #666;
        }
        .success {
            color: green;
        }
        .error {
            color: red;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Oracle 到金仓表拷贝工具</h1>
        
        <button class="copy-all-btn" onclick="copyAllTables()">拷贝所有表</button>
        <div class="status" id="allStatus"></div>
        
        <div class="table-list">
            <h2>Oracle 表列表</h2>
            #for(table : oracleTables)
            <div class="table-item">
                <div class="table-name">${table}</div>
                <button class="copy-btn" onclick="copySingleTable('${table}')">拷贝</button>
                <div class="status" id="status_${table}"></div>
            </div>
            #end
        </div>
    </div>
    
    <script>
        // 拷贝单个表
        function copySingleTable(tableName) {
            const statusElement = document.getElementById('status_' + tableName);
            statusElement.innerHTML = '拷贝中...';
            
            fetch('/table-copy/copySingleTable?tableName=' + tableName)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        statusElement.innerHTML = '拷贝成功';
                        statusElement.className = 'status success';
                    } else {
                        statusElement.innerHTML = '拷贝失败';
                        statusElement.className = 'status error';
                    }
                })
                .catch(error => {
                    statusElement.innerHTML = '拷贝失败';
                    statusElement.className = 'status error';
                    console.error('拷贝失败:', error);
                });
        }
        
        // 拷贝所有表
        function copyAllTables() {
            const statusElement = document.getElementById('allStatus');
            statusElement.innerHTML = '拷贝中...';
            
            fetch('/table-copy/copyAllTables')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        statusElement.innerHTML = '所有表拷贝成功';
                        statusElement.className = 'status success';
                    } else {
                        statusElement.innerHTML = '部分表拷贝失败';
                        statusElement.className = 'status error';
                    }
                })
                .catch(error => {
                    statusElement.innerHTML = '拷贝失败';
                    statusElement.className = 'status error';
                    console.error('拷贝失败:', error);
                });
        }
    </script>
</body>
</html>
```

## 5. 配置文件

### pom.xml

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>oracle-to-kingbase</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>war</packaging>
    
    <dependencies>
        <!-- JFinal -->
        <dependency>
            <groupId>com.jfinal</groupId>
            <artifactId>jfinal</artifactId>
            <version>5.1.0</version>
        </dependency>
        
        <!-- Druid 连接池 -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.2.8</version>
        </dependency>
        
        <!-- Oracle 驱动 -->
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc11</artifactId>
            <version>21.5.0.0</version>
        </dependency>
        
        <!-- 金仓驱动 -->
        <dependency>
            <groupId>com.kingbase8</groupId>
            <artifactId>kingbase8</artifactId>
            <version>8.6.0</version>
        </dependency>
        
        <!-- JSP API -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.1</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    
    <build>
        <finalName>oracle-to-kingbase</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## 6. 使用说明

### 1. 配置数据库连接

在 `config.properties` 文件中配置 Oracle 和金仓数据库的连接信息：

```bash
# Oracle 数据库配置
oracle.url=jdbc:oracle:thin:@localhost:1521:orcl
oracle.username=system
oracle.password=oracle

# 金仓数据库配置
kingbase.url=jdbc:kingbase8://localhost:54321/test
kingbase.username=system
kingbase.password=kingbase
```

### 2. 配置要拷贝的表

在 `config.properties` 文件中配置要拷贝的表和排除的表：

```bash
# 表拷贝配置
table.copy.batchSize=1000  # 批量插入大小
table.copy.includeTables=USER,DEPARTMENT,EMPLOYEE  # 要拷贝的表
table.copy.excludeTables=LOG,AUDIT  # 排除的表
```

### 3. 启动应用

运行 `AppStart.java` 类的 `main` 方法，启动应用。

### 4. 访问应用

在浏览器中输入 `http://localhost:8080/table-copy`，进入表拷贝页面。

### 5. 执行表拷贝

- **拷贝单个表**：点击表名后的「拷贝」按钮，拷贝单个表
- **拷贝所有表**：点击页面顶部的「拷贝所有表」按钮，拷贝所有配置的表

## 7. 技术要点

### 1. 多数据源配置

JFinal 支持配置多个数据源，通过数据源名称区分：

```java
// Oracle 数据源
DruidPlugin oracleDruid = new DruidPlugin(oracleUrl, oracleUsername, oraclePassword);
ActiveRecordPlugin oracleArp = new ActiveRecordPlugin("oracle", oracleDruid);

// 金仓数据源
DruidPlugin kingbaseDruid = new DruidPlugin(kingbaseUrl, kingbaseUsername, kingbasePassword);
ActiveRecordPlugin kingbaseArp = new ActiveRecordPlugin("kingbase", kingbaseDruid);
```

### 2. 跨数据源操作

使用 `Db.use(dataSourceName)` 切换数据源：

```java
// 从 Oracle 查询
List<Record> records = Db.use("oracle").find("SELECT * FROM user");

// 插入到金仓
Db.use("kingbase").save("user", record);
```

### 3. 表结构转换

需要将 Oracle 数据类型映射到金仓数据类型：

| Oracle 类型 | 金仓类型 |
|------------|----------|
| NUMBER     | INTEGER  |
| VARCHAR2   | VARCHAR  |
| DATE       | TIMESTAMP|
| CLOB       | TEXT     |
| BLOB       | BYTEA    |
| NUMBER(19) | BIGINT   |
| NUMBER(10) | INT      |
| NUMBER(5,2)| DECIMAL  |

### 4. 批量插入优化

使用批量插入提高性能：

```java
// 批量插入
Db.use(KINGBASE_DS).tx(() -> {
    for (Record record : records) {
        Db.use(KINGBASE_DS).update(insertSql, record.getColumns().values().toArray());
    }
    return true;
});
```

### 5. 事务管理

使用 JFinal 的事务管理确保数据一致性：

```java
Db.use(KINGBASE_DS).tx(() -> {
    // 批量插入操作
    return true;
});
```

## 8. 注意事项

1. **数据类型映射**：Oracle 和金仓的数据类型不完全兼容，需要仔细映射
2. **表结构转换**：Oracle 的表结构创建语句需要转换为金仓兼容的格式
3. **主键和约束**：需要处理主键、外键、索引等约束的转换
4. **大数据类型**：对于 CLOB、BLOB 等大数据类型，需要特殊处理
5. **性能优化**：对于大数据量，需要使用批量插入和分页查询
6. **事务处理**：确保数据拷贝的原子性，使用事务管理
7. **错误处理**：添加完善的错误处理和日志记录
8. **测试验证**：拷贝完成后，需要验证表结构和数据的正确性

## 9. 扩展建议

1. **添加日志记录**：使用日志框架记录拷贝过程和结果
2. **添加进度显示**：显示拷贝的进度和统计信息
3. **支持增量拷贝**：只拷贝新增或修改的数据
4. **支持表结构对比**：对比源表和目标表的结构差异
5. **添加配置界面**：提供 Web 界面配置数据库连接和表拷贝规则
6. **支持多线程拷贝**：使用多线程提高拷贝速度
7. **支持更多数据库**：扩展支持 MySQL、PostgreSQL 等其他数据库
8. **添加数据验证**：验证拷贝后的数据完整性

## 总结

本示例演示了如何使用 JFinal 的 DB 和 ActiveRecord 功能实现跨数据库表拷贝。通过配置多数据源，使用 JFinal 的数据库操作 API，可以方便地实现不同数据库之间的数据迁移。

在实际项目中，需要根据具体的业务需求和数据库特性，完善表结构转换、数据类型映射、错误处理等逻辑，确保数据迁移的准确性和可靠性。