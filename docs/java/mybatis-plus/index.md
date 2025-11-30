# MyBatis-Plus

欢迎来到MyBatis-Plus技术专栏！这里记录了MyBatis-Plus相关的技术文章、学习笔记以及工作中常用的知识点和容易出错的问题。

## 常用知识点及容易出错的问题

### 1. 自动填充功能的正确使用
**知识点**：MyBatis-Plus提供了`@TableField(fill = FieldFill.INSERT)`和`@TableField(fill = FieldFill.INSERT_UPDATE)`注解，用于自动填充创建时间、更新时间等字段。
**容易出错点**：
- 忘记实现`MetaObjectHandler`接口并注册为Spring Bean
- 填充逻辑中没有正确区分`insertFill`和`updateFill`方法
- 字段类型不匹配（如使用`java.util.Date`而非`java.time.LocalDateTime`）

### 2. 乐观锁的实现
**知识点**：通过`@Version`注解和乐观锁插件实现并发控制。
**容易出错点**：
- 没有在配置类中注册`OptimisticLockerInterceptor`或`MybatisPlusInterceptor`（3.4.0+版本）
- 更新操作时没有先查询获取版本号
- 版本字段类型错误（应为整型或长整型）

### 3. 逻辑删除的配置
**知识点**：使用`@TableLogic`注解实现逻辑删除，而非物理删除。
**容易出错点**：
- 没有在配置文件中配置逻辑删除的全局值（deleted=1, undeleted=0）
- 自定义SQL时忘记添加逻辑删除条件
- 关联查询时没有考虑关联表的逻辑删除状态

### 4. Wrapper查询的正确使用
**知识点**：使用`QueryWrapper`、`LambdaQueryWrapper`等进行条件查询。
**容易出错点**：
- 链式调用时忘记赋值给原变量（如`wrapper.eq(...)`应改为`wrapper = wrapper.eq(...)`）
- Lambda表达式中使用了非数据库字段
- 复杂条件组合时括号使用不当导致逻辑错误

### 5. 分页插件的配置与使用
**知识点**：通过分页插件实现物理分页。
**容易出错点**：
- 3.4.0+版本配置方式变更，需要使用`MybatisPlusInterceptor`而非`PaginationInterceptor`
- 忘记在查询前创建`Page`对象并传入
- 自定义SQL时没有使用`${ew.customSqlSegment}`占位符

### 6. 代码生成器的使用
**知识点**：使用MyBatis-Plus Generator快速生成实体类、Mapper、Service等代码。
**容易出错点**：
- 依赖版本不匹配导致生成失败
- 模板配置错误导致生成的代码不符合规范
- 没有正确配置数据源信息

### 7. 多表关联查询
**知识点**：MyBatis-Plus原生支持单表操作，多表关联需要自定义SQL。
**容易出错点**：
- 试图使用Wrapper进行复杂多表关联查询
- 自定义SQL时没有使用MyBatis-Plus的条件构造器
- 关联查询结果映射错误

### 8. 主键生成策略
**知识点**：MyBatis-Plus支持多种主键生成策略，如AUTO、INPUT、ASSIGN_ID等。
**容易出错点**：
- 使用`ASSIGN_ID`时数据库字段类型不是`bigint`或`varchar(32)`
- 混合使用不同的主键生成策略导致主键冲突
- 手动设置主键值时没有关闭自动生成

### 9. 批量操作的注意事项
**知识点**：使用`saveBatch`、`updateBatchById`等方法进行批量操作。
**容易出错点**：
- 批量操作的默认批次大小（1000）可能导致内存溢出
- 没有考虑数据库的批量插入限制
- 批量更新时没有正确设置条件

### 10. 自定义SQL与MyBatis-Plus的结合
**知识点**：在Mapper.xml中编写自定义SQL，同时结合MyBatis-Plus的条件构造器。
**容易出错点**：
- 自定义SQL中没有正确引用MyBatis-Plus的条件参数
- 忘记在Mapper接口中添加`@Param(Constants.WRAPPER)`注解
- 自定义SQL与MyBatis-Plus方法名冲突

## 文章列表

目前暂无文章，敬请期待！