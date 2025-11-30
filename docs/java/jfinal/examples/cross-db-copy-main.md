# JFinal 跨数据库数据拷贝示例（Main函数版）

## 概述

本示例展示如何使用 JFinal 的 ActiveRecord 插件，通过 Java Main 函数实现不同数据库之间的数据拷贝，无需前端页面。

## 技术栈

- JFinal 5.x
- JDK 8+
- ActiveRecord 插件
- 多数据源配置

## 实现步骤

### 1. 添加依赖

在 `pom.xml` 中添加 JFinal 依赖：

```xml
<dependency>
    <groupId>com.jfinal</groupId>
    <artifactId>jfinal</artifactId>
    <version>5.1.1</version>
</dependency>
<dependency>
    <groupId>com.jfinal</groupId>
    <artifactId>jfinal-jdbc</artifactId>
    <version>5.1.1</version>
</dependency>
<!-- 数据库驱动根据实际情况添加 -->
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <version>21.13.0.0</version>
</dependency>
<dependency>
    <groupId>com.kingbase8</groupId>
    <artifactId>kingbase8</artifactId>
    <version>8.6.0</version>
</dependency>
```

### 2. 编写配置类

创建 JFinal 配置类，配置多数据源：

```java
import com.jfinal.config.*;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.druid.DruidPlugin;

public class CrossDbConfig extends JFinalConfig {
    
    @Override
    public void configConstant(Constants me) {
        me.setDevMode(true);
    }
    
    @Override
    public void configRoute(Routes me) {
        // 无需配置路由，因为是 Main 函数运行
    }
    
    @Override
    public void configEngine(Engine me) {
        // 无需配置模板引擎
    }
    
    @Override
    public void configPlugin(Plugins me) {
        // 配置源数据库（Oracle）
        DruidPlugin sourceDruid = new DruidPlugin(
            "jdbc:oracle:thin:@localhost:1521:ORCL",
            "source_user",
            "source_password",
            "oracle.jdbc.driver.OracleDriver"
        );
        me.add(sourceDruid);
        
        // 配置目标数据库（Kingbase）
        DruidPlugin targetDruid = new DruidPlugin(
            "jdbc:kingbase8://localhost:54321/TEST",
            "target_user",
            "target_password",
            "com.kingbase8.Driver"
        );
        me.add(targetDruid);
        
        // 源数据库 ActiveRecord 插件
        ActiveRecordPlugin sourceArp = new ActiveRecordPlugin("source", sourceDruid);
        sourceArp.setDevMode(true);
        me.add(sourceArp);
        
        // 目标数据库 ActiveRecord 插件
        ActiveRecordPlugin targetArp = new ActiveRecordPlugin("target", targetDruid);
        targetArp.setDevMode(true);
        me.add(targetArp);
    }
    
    @Override
    public void configInterceptor(Interceptors me) {
        // 无需配置拦截器
    }
    
    @Override
    public void configHandler(Handlers me) {
        // 无需配置处理器
    }
}
```

### 3. 编写模型类

创建数据模型类，用于映射数据库表：

```java
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.TableMapping;

public class User extends Model<User> {
    public static final User dao = new User().dao();
    
    // 源数据库表名
    public static final String SOURCE_TABLE = "SOURCE_USER";
    // 目标数据库表名
    public static final String TARGET_TABLE = "TARGET_USER";
    
    // 静态初始化，设置表名映射
    static {
        // 为源数据库设置表名
        TableMapping.me().mapping(dao.getClass(), SOURCE_TABLE);
    }
    
    // 用于目标数据库的模型
    public static User getTargetDao() {
        User targetDao = new User();
        TableMapping.me().mapping(targetDao.getClass(), TARGET_TABLE);
        return targetDao;
    }
}
```

### 4. 编写数据拷贝工具类

创建数据拷贝工具类，实现核心拷贝逻辑：

```java
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.Page;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class DataCopyUtil {
    
    // 批量处理大小
    private static final int BATCH_SIZE = 1000;
    
    /**
     * 拷贝单表数据
     * @param sourceDb 源数据库别名
     * @param targetDb 目标数据库别名
     * @param sourceTable 源表名
     * @param targetTable 目标表名
     * @param primaryKey 主键字段名
     * @return 拷贝的数据条数
     */
    public static int copyTableData(String sourceDb, String targetDb, 
                                  String sourceTable, String targetTable, 
                                  String primaryKey) {
        
        AtomicInteger totalCount = new AtomicInteger(0);
        int pageNumber = 1;
        
        System.out.println("开始拷贝表数据：" + sourceTable + " -> " + targetTable);
        
        try {
            // 清空目标表
            Db.use(targetDb).update("TRUNCATE TABLE " + targetTable);
            System.out.println("已清空目标表：" + targetTable);
            
            // 分页查询源表数据
            while (true) {
                Page<Record> page = Db.use(sourceDb).paginate(pageNumber, BATCH_SIZE, 
                    "SELECT * FROM " + sourceTable,
                    "ORDER BY " + primaryKey
                );
                
                List<Record> records = page.getList();
                if (records.isEmpty()) {
                    break;
                }
                
                // 批量保存到目标表
                int batchResult = Db.use(targetDb).batchSave(targetTable, records, BATCH_SIZE);
                int currentCount = records.size();
                totalCount.addAndGet(currentCount);
                
                System.out.printf("已拷贝 %d 条数据，总计 %d 条\n", currentCount, totalCount.get());
                
                pageNumber++;
                
                // 如果是最后一页，退出循环
                if (pageNumber > page.getTotalPage()) {
                    break;
                }
            }
            
            System.out.println("表数据拷贝完成：" + sourceTable + " -> " + targetTable + ", 总计 " + totalCount.get() + " 条");
            return totalCount.get();
            
        } catch (Exception e) {
            System.err.println("表数据拷贝失败：" + e.getMessage());
            e.printStackTrace();
            return -1;
        }
    }
    
    /**
     * 拷贝指定条件的数据
     * @param sourceDb 源数据库别名
     * @param targetDb 目标数据库别名
     * @param sourceTable 源表名
     * @param targetTable 目标表名
     * @param whereClause 查询条件
     * @return 拷贝的数据条数
     */
    public static int copyTableDataWithCondition(String sourceDb, String targetDb, 
                                               String sourceTable, String targetTable, 
                                               String whereClause) {
        
        AtomicInteger totalCount = new AtomicInteger(0);
        int pageNumber = 1;
        
        System.out.println("开始拷贝表数据：" + sourceTable + " -> " + targetTable + "，条件：" + whereClause);
        
        try {
            // 分页查询源表数据
            while (true) {
                String sql = "SELECT * FROM " + sourceTable;
                if (whereClause != null && !whereClause.isEmpty()) {
                    sql += " WHERE " + whereClause;
                }
                sql += " ORDER BY id";
                
                Page<Record> page = Db.use(sourceDb).paginate(pageNumber, BATCH_SIZE, sql);
                
                List<Record> records = page.getList();
                if (records.isEmpty()) {
                    break;
                }
                
                // 批量保存到目标表
                int batchResult = Db.use(targetDb).batchSave(targetTable, records, BATCH_SIZE);
                int currentCount = records.size();
                totalCount.addAndGet(currentCount);
                
                System.out.printf("已拷贝 %d 条数据，总计 %d 条\n", currentCount, totalCount.get());
                
                pageNumber++;
                
                if (pageNumber > page.getTotalPage()) {
                    break;
                }
            }
            
            System.out.println("表数据拷贝完成：" + sourceTable + " -> " + targetTable + ", 总计 " + totalCount.get() + " 条");
            return totalCount.get();
            
        } catch (Exception e) {
            System.err.println("表数据拷贝失败：" + e.getMessage());
            e.printStackTrace();
            return -1;
        }
    }
}
```

### 5. 编写主程序

创建 Main 类，实现程序入口：

```java
import com.jfinal.core.JFinal;

public class CrossDbCopyMain {
    
    public static void main(String[] args) {
        System.out.println("JFinal 跨数据库数据拷贝程序启动");
        
        try {
            // 初始化 JFinal
            JFinal.start("src/main/webapp", 80, "/", 5);
            
            System.out.println("JFinal 初始化完成，开始数据拷贝");
            
            // 示例1：拷贝用户表
            int userCount = DataCopyUtil.copyTableData(
                "source", "target",
                "SOURCE_USER", "TARGET_USER",
                "ID"
            );
            
            // 示例2：拷贝订单表，带条件
            int orderCount = DataCopyUtil.copyTableDataWithCondition(
                "source", "target",
                "SOURCE_ORDER", "TARGET_ORDER",
                "STATUS = 'ACTIVE' AND CREATE_TIME > '2023-01-01'"
            );
            
            // 示例3：拷贝产品表
            int productCount = DataCopyUtil.copyTableData(
                "source", "target",
                "SOURCE_PRODUCT", "TARGET_PRODUCT",
                "PRODUCT_ID"
            );
            
            System.out.println("\n=== 数据拷贝完成 ===");
            System.out.println("用户表拷贝：" + userCount + " 条");
            System.out.println("订单表拷贝：" + orderCount + " 条");
            System.out.println("产品表拷贝：" + productCount + " 条");
            System.out.println("总计拷贝：" + (userCount + orderCount + productCount) + " 条");
            
        } catch (Exception e) {
            System.err.println("数据拷贝程序异常：" + e.getMessage());
            e.printStackTrace();
        } finally {
            // 退出程序
            System.out.println("\n程序执行完成，正在退出...");
            System.exit(0);
        }
    }
}
```

### 6. 编写简化版主程序（直接使用模型）

如果已经定义了模型类，可以使用模型类进行更简洁的数据拷贝：

```java
import com.jfinal.core.JFinal;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.Page;

public class ModelCopyMain {
    
    public static void main(String[] args) {
        System.out.println("JFinal 模型数据拷贝程序启动");
        
        try {
            // 初始化 JFinal
            JFinal.start("src/main/webapp", 80, "/", 5);
            
            System.out.println("JFinal 初始化完成，开始模型数据拷贝");
            
            // 使用模型类拷贝数据
            copyUserModelData();
            
            System.out.println("\n模型数据拷贝完成");
            
        } catch (Exception e) {
            System.err.println("模型数据拷贝程序异常：" + e.getMessage());
            e.printStackTrace();
        } finally {
            System.exit(0);
        }
    }
    
    /**
     * 使用模型类拷贝用户数据
     */
    private static void copyUserModelData() {
        int pageNumber = 1;
        int pageSize = 500;
        int totalCount = 0;
        
        System.out.println("开始拷贝用户模型数据");
        
        // 清空目标表
        Db.use("target").update("TRUNCATE TABLE TARGET_USER");
        
        // 分页查询源数据
        while (true) {
            // 从源数据库查询数据
            Page<User> page = User.dao.use("source").paginate(pageNumber, pageSize, "SELECT *", "FROM SOURCE_USER ORDER BY ID");
            
            if (page.getList().isEmpty()) {
                break;
            }
            
            // 批量保存到目标数据库
            for (User user : page.getList()) {
                // 创建目标模型
                User targetUser = new User();
                // 复制所有属性
                targetUser.setAttrs(user.getAttrs());
                // 保存到目标数据库
                targetUser.use("target").save();
            }
            
            totalCount += page.getList().size();
            System.out.printf("已拷贝 %d 条用户数据\n", totalCount);
            
            if (pageNumber >= page.getTotalPage()) {
                break;
            }
            
            pageNumber++;
        }
        
        System.out.println("用户模型数据拷贝完成，总计：" + totalCount + " 条");
    }
}
```

## 运行方式

1. **编译项目**：
   ```bash
   mvn clean compile
   ```

2. **运行主程序**：
   ```bash
   java -cp target/classes:lib/* com.example.CrossDbCopyMain
   ```

3. **或使用 IDE 运行**：
   - 在 IDE 中直接运行 `CrossDbCopyMain` 类的 `main` 方法

## 配置说明

### 数据源配置

在 `CrossDbConfig` 类中，需要根据实际情况修改数据源配置：

```java
// 源数据库配置
DruidPlugin sourceDruid = new DruidPlugin(
    "jdbc:oracle:thin:@localhost:1521:ORCL",  // 源数据库 URL
    "source_user",  // 源数据库用户名
    "source_password",  // 源数据库密码
    "oracle.jdbc.driver.OracleDriver"  // 源数据库驱动
);

// 目标数据库配置
DruidPlugin targetDruid = new DruidPlugin(
    "jdbc:kingbase8://localhost:54321/TEST",  // 目标数据库 URL
    "target_user",  // 目标数据库用户名
    "target_password",  // 目标数据库密码
    "com.kingbase8.Driver"  // 目标数据库驱动
);
```

### 拷贝参数配置

在 `CrossDbCopyMain` 类中，可以修改：
- 拷贝的表名
- 主键字段名
- 拷贝条件
- 批量处理大小

## 注意事项

1. **数据库驱动**：确保已添加正确的数据库驱动依赖
2. **表结构一致性**：源表和目标表的字段结构应保持一致
3. **主键冲突**：拷贝前建议清空目标表，避免主键冲突
4. **大数据量处理**：使用分页查询和批量插入，避免内存溢出
5. **事务处理**：对于重要数据，建议添加事务支持
6. **性能优化**：根据实际情况调整批量处理大小
7. **日志记录**：建议添加详细的日志记录，便于监控和调试

## 扩展功能

### 添加事务支持

```java
import com.jfinal.plugin.activerecord.tx.Tx;

// 使用事务包装拷贝操作
int result = new Tx(() -> {
    return DataCopyUtil.copyTableData(
        "source", "target",
        "SOURCE_TABLE", "TARGET_TABLE",
        "ID"
    );
}).execute();
```

### 添加多线程支持

```java
// 使用线程池并行拷贝多个表
ExecutorService executor = Executors.newFixedThreadPool(3);

Future<Integer> userFuture = executor.submit(() -> 
    DataCopyUtil.copyTableData("source", "target", "SOURCE_USER", "TARGET_USER", "ID")
);

Future<Integer> orderFuture = executor.submit(() -> 
    DataCopyUtil.copyTableData("source", "target", "SOURCE_ORDER", "TARGET_ORDER", "ORDER_ID")
);

Future<Integer> productFuture = executor.submit(() -> 
    DataCopyUtil.copyTableData("source", "target", "SOURCE_PRODUCT", "TARGET_PRODUCT", "PRODUCT_ID")
);

// 获取结果
int userCount = userFuture.get();
int orderCount = orderFuture.get();
int productCount = productFuture.get();

executor.shutdown();
```

### 添加进度监控

```java
public static int copyTableWithProgress(String sourceDb, String targetDb, 
                                      String sourceTable, String targetTable, 
                                      String primaryKey) {
    
    // 获取源表总条数
    Long totalRows = Db.use(sourceDb).queryLong("SELECT COUNT(*) FROM " + sourceTable);
    System.out.println("源表总条数：" + totalRows);
    
    AtomicInteger copiedCount = new AtomicInteger(0);
    
    // 拷贝逻辑...
    
    // 计算进度
    int progress = (int) ((copiedCount.get() * 100.0) / totalRows);
    System.out.printf("拷贝进度：%d%%\n", progress);
    
    return copiedCount.get();
}
```

## 总结

本示例展示了如何使用 JFinal 的 ActiveRecord 插件，通过 Java Main 函数实现不同数据库之间的数据拷贝。主要特点包括：

1. **多数据源配置**：支持配置多个数据库连接
2. **分页批量处理**：适合大数据量拷贝
3. **灵活的拷贝方式**：支持表拷贝和模型拷贝
4. **可扩展**：易于添加事务、多线程、进度监控等功能
5. **无需前端**：纯 Java 程序，直接运行

通过本示例，可以快速实现跨数据库的数据迁移和同步需求，适用于系统迁移、数据备份、报表生成等场景。