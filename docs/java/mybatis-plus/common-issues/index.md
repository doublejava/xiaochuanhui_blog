# MyBatis-Plus 工作中常见问题记录

发布于：2025-11-27

## 1. 基本配置问题

### 1.1 问题：MyBatis-Plus 自动配置失效

**问题描述**：在 Spring Boot 项目中引入 MyBatis-Plus 依赖后，自动配置失效，无法正常使用 MyBatis-Plus 的功能。

**原因分析**：
- 可能是依赖版本不兼容
- 可能是配置文件有误
- 可能是没有正确扫描 Mapper 接口

**解决方案**：
1. 确保 Spring Boot 和 MyBatis-Plus 版本兼容
2. 检查 application.properties/yml 中的配置
3. 确保 Mapper 接口被正确扫描

**代码示例**：

```yaml
# application.yml 配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.example.entity
  configuration:
    map-underscore-to-camel-case: true
```

```java
// 启动类添加 @MapperScan 注解
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 1.2 问题：无法找到 Mapper 接口

**问题描述**：启动项目时，报 `No qualifying bean of type 'com.example.mapper.UserMapper' available` 错误。

**原因分析**：
- Mapper 接口没有被 Spring 扫描到
- 没有添加 @Mapper 注解
- 没有在启动类添加 @MapperScan 注解

**解决方案**：
1. 在 Mapper 接口上添加 @Mapper 注解
2. 或在启动类上添加 @MapperScan 注解，指定 Mapper 接口所在的包

**代码示例**：

```java
// 方式一：在 Mapper 接口上添加 @Mapper 注解
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // ...
}

// 方式二：在启动类上添加 @MapperScan 注解
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    // ...
}
```

## 2. 实体类配置问题

### 2.1 问题：实体类字段与数据库字段不匹配

**问题描述**：查询数据时，部分字段值为 null，或报字段不存在错误。

**原因分析**：
- 实体类字段名与数据库字段名不一致
- 没有开启驼峰命名转换
- 没有使用 @TableField 注解指定字段映射关系

**解决方案**：
1. 开启驼峰命名转换
2. 使用 @TableField 注解指定字段映射关系
3. 使用 @TableName 注解指定表名

**代码示例**：

```yaml
# 开启驼峰命名转换
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
```

```java
@TableName("sys_user") // 指定表名
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    @TableField("nick_name") // 指定字段名
    private String nickName;
    
    @TableField("create_time")
    private LocalDateTime createTime;
    
    // getter 和 setter
}
```

### 2.2 问题：主键生成策略失效

**问题描述**：插入数据时，主键没有按照预期生成。

**原因分析**：
- 没有正确配置主键生成策略
- 数据库表主键没有设置为自增
- 主键类型不匹配

**解决方案**：
1. 使用 @TableId 注解指定主键生成策略
2. 确保数据库表主键设置为自增（如果使用 AUTO 策略）
3. 确保主键类型匹配

**代码示例**：

```java
public class User {
    // AUTO：自增策略
    @TableId(type = IdType.AUTO)
    private Long id;
    
    // INPUT：手动输入
    // @TableId(type = IdType.INPUT)
    
    // ASSIGN_ID：雪花算法生成 ID
    // @TableId(type = IdType.ASSIGN_ID)
    
    // ASSIGN_UUID：UUID 生成
    // @TableId(type = IdType.ASSIGN_UUID)
    
    // getter 和 setter
}
```

## 3. CRUD 操作问题

### 3.1 问题：插入数据失败

**问题描述**：调用 `save()` 方法插入数据时失败，没有报错或报 SQL 语法错误。

**原因分析**：
- 实体类字段与数据库字段不匹配
- 没有设置必填字段
- SQL 语法错误

**解决方案**：
1. 检查实体类字段与数据库字段是否匹配
2. 确保所有必填字段都已设置
3. 开启 SQL 日志，查看生成的 SQL 语句

**代码示例**：

```yaml
# 开启 SQL 日志
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### 3.2 问题：更新数据失败

**问题描述**：调用 `updateById()` 或 `update()` 方法更新数据时失败。

**原因分析**：
- 没有指定更新条件
- 实体类中没有设置主键
- 乐观锁版本号不匹配

**解决方案**：
1. 确保指定了更新条件
2. 确保实体类中设置了主键
3. 检查乐观锁配置

**代码示例**：

```java
// 方式一：使用 updateById()
User user = new User();
user.setId(1L); // 必须设置主键
user.setUsername("newUsername");
userMapper.updateById(user);

// 方式二：使用 update() 带条件
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.eq("id", 1L);
wrapper.set("username", "newUsername");
userMapper.update(null, wrapper);
```

## 4. 条件查询问题

### 4.1 问题：条件查询不生效

**问题描述**：使用 QueryWrapper 或 LambdaQueryWrapper 构建条件查询时，部分条件不生效。

**原因分析**：
- 条件构建有误
- 字段名拼写错误
- 没有调用正确的条件方法

**解决方案**：
1. 检查条件构建是否正确
2. 检查字段名是否拼写正确
3. 确保调用了正确的条件方法

**代码示例**：

```java
// 正确示例
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("status", 1)
       .like("username", "admin")
       .between("age", 18, 30)
       .orderByDesc("create_time");
List<User> userList = userMapper.selectList(wrapper);

// Lambda 方式
LambdaQueryWrapper<User> lambdaWrapper = new LambdaQueryWrapper<>();
lambdaWrapper.eq(User::getStatus, 1)
             .like(User::getUsername, "admin")
             .between(User::getAge, 18, 30)
             .orderByDesc(User::getCreateTime);
List<User> userList = userMapper.selectList(lambdaWrapper);
```

### 4.2 问题：NULL 值条件处理

**问题描述**：当查询条件值为 NULL 时，查询结果不符合预期。

**原因分析**：
- 默认情况下，MyBatis-Plus 会忽略 NULL 值条件
- 没有使用正确的 NULL 值处理方法

**解决方案**：
1. 使用 `isNull()` 或 `isNotNull()` 方法处理 NULL 值
2. 使用 `apply()` 方法自定义 SQL 片段

**代码示例**：

```java
// 查询 status 为 NULL 的数据
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.isNull("status");
List<User> userList = userMapper.selectList(wrapper);

// 查询 status 不为 NULL 的数据
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.isNotNull("status");
List<User> userList = userMapper.selectList(wrapper);

// 自定义 NULL 处理
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.apply("status IS NULL OR status = {0}", status);
List<User> userList = userMapper.selectList(wrapper);
```

## 5. 分页查询问题

### 5.1 问题：分页查询失效

**问题描述**：使用 Page 对象进行分页查询时，返回的是全部数据，没有进行分页。

**原因分析**：
- 没有配置分页插件
- 分页插件配置有误
- 没有正确使用 Page 对象

**解决方案**：
1. 配置分页插件
2. 确保分页插件配置正确
3. 正确使用 Page 对象

**代码示例**：

```java
// 配置分页插件
@Configuration
public class MyBatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}

// 使用 Page 对象进行分页查询
Page<User> page = new Page<>(1, 10); // 第 1 页，每页 10 条数据
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("status", 1);
IPage<User> userPage = userMapper.selectPage(page, wrapper);

// 获取分页结果
List<User> userList = userPage.getRecords();
long total = userPage.getTotal();
long pages = userPage.getPages();
```

### 5.2 问题：联表查询分页失效

**问题描述**：自定义联表查询时，分页失效。

**原因分析**：
- 自定义 SQL 中没有使用分页参数
- 没有在 Mapper 接口中使用 Page 对象作为参数

**解决方案**：
1. 在 Mapper 接口中使用 Page 对象作为参数
2. 在自定义 SQL 中使用分页参数

**代码示例**：

```java
// Mapper 接口
public interface UserMapper extends BaseMapper<User> {
    
    // 自定义联表查询分页
    IPage<UserVo> selectUserVoPage(Page<UserVo> page, @Param("wrapper") QueryWrapper<UserVo> wrapper);
}

// XML 映射文件
<select id="selectUserVoPage" resultType="com.example.vo.UserVo">
    SELECT u.*, r.name AS role_name
    FROM sys_user u
    LEFT JOIN sys_user_role ur ON u.id = ur.user_id
    LEFT JOIN sys_role r ON ur.role_id = r.id
    <where>
        <if test="wrapper != null">
            ${wrapper.sqlSegment}
        </if>
    </where>
</select>

// 调用方式
Page<UserVo> page = new Page<>(1, 10);
QueryWrapper<UserVo> wrapper = new QueryWrapper<>();
wrapper.eq("u.status", 1);
IPage<UserVo> userVoPage = userMapper.selectUserVoPage(page, wrapper);
```

## 6. 自定义 SQL 问题

### 6.1 问题：自定义 SQL 无法使用 MyBatis-Plus 的条件构造器

**问题描述**：在自定义 SQL 中无法使用 MyBatis-Plus 的条件构造器。

**原因分析**：
- 没有在 Mapper 接口中使用 @Param 注解指定条件构造器参数名
- 没有在 XML 映射文件中使用条件构造器的 sqlSegment 属性

**解决方案**：
1. 在 Mapper 接口中使用 @Param 注解指定条件构造器参数名
2. 在 XML 映射文件中使用条件构造器的 sqlSegment 属性

**代码示例**：

```java
// Mapper 接口
public interface UserMapper extends BaseMapper<User> {
    
    List<User> selectCustomList(@Param("wrapper") QueryWrapper<User> wrapper);
}

// XML 映射文件
<select id="selectCustomList" resultType="com.example.entity.User">
    SELECT * FROM sys_user
    <where>
        <if test="wrapper != null">
            ${wrapper.sqlSegment}
        </if>
    </where>
</select>

// 调用方式
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("status", 1)
       .like("username", "admin");
List<User> userList = userMapper.selectCustomList(wrapper);
```

### 6.2 问题：自定义 SQL 中参数无法解析

**问题描述**：自定义 SQL 中使用 #{} 或 ${} 引用参数时，报参数无法解析错误。

**原因分析**：
- 参数名与 Mapper 接口中定义的参数名不一致
- 没有使用 @Param 注解指定参数名
- 使用了错误的参数引用方式

**解决方案**：
1. 确保参数名一致
2. 使用 @Param 注解指定参数名
3. 正确使用 #{} 和 ${} 引用参数

**代码示例**：

```java
// Mapper 接口
public interface UserMapper extends BaseMapper<User> {
    
    // 方式一：使用 @Param 注解
    User selectByUsername(@Param("username") String username);
    
    // 方式二：使用 Map 传递参数
    User selectByMap(Map<String, Object> map);
}

// XML 映射文件
<select id="selectByUsername" resultType="com.example.entity.User">
    SELECT * FROM sys_user WHERE username = #{username}
</select>

<select id="selectByMap" resultType="com.example.entity.User">
    SELECT * FROM sys_user WHERE username = #{username} AND status = #{status}
</select>

// 调用方式
// 方式一
User user = userMapper.selectByUsername("admin");

// 方式二
Map<String, Object> map = new HashMap<>();
map.put("username", "admin");
map.put("status", 1);
User user = userMapper.selectByMap(map);
```

## 7. 事务处理问题

### 7.1 问题：事务不生效

**问题描述**：使用 @Transactional 注解标记的方法，事务不生效。

**原因分析**：
- 方法不是 public 修饰的
- 方法内部调用，没有通过代理调用
- 异常类型不是 RuntimeException 或 Error
- 没有开启事务管理

**解决方案**：
1. 确保方法是 public 修饰的
2. 通过代理对象调用方法
3. 使用 rollbackFor 属性指定回滚的异常类型
4. 确保开启了事务管理

**代码示例**：

```java
// 正确的事务方法
@Service
public class UserServiceImpl implements UserService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RoleMapper roleMapper;
    
    // 指定回滚的异常类型
    @Transactional(rollbackFor = Exception.class)
    @Override
    public void saveUserAndRole(User user, List<Long> roleIds) {
        // 保存用户
        userMapper.insert(user);
        
        // 保存用户角色关系
        for (Long roleId : roleIds) {
            UserRole userRole = new UserRole();
            userRole.setUserId(user.getId());
            userRole.setRoleId(roleId);
            roleMapper.insert(userRole);
        }
    }
}
```

## 8. 性能优化问题

### 8.1 问题：查询性能差

**问题描述**：查询数据时，响应时间过长，性能差。

**原因分析**：
- 没有创建索引
- 查询条件不合理
- 一次性查询数据量过大
- 没有使用延迟加载

**解决方案**：
1. 为经常查询的字段创建索引
2. 优化查询条件
3. 使用分页查询，避免一次性查询大量数据
4. 合理使用延迟加载

**代码示例**：

```java
// 优化查询条件
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("status", 1)
       .eq("gender", 1)
       .between("age", 18, 30)
       .orderByDesc("create_time");

// 使用 select() 方法指定查询字段，避免查询不必要的字段
wrapper.select("id", "username", "nick_name", "age", "create_time");

List<User> userList = userMapper.selectList(wrapper);
```

### 8.2 问题：批量操作性能差

**问题描述**：批量插入或更新数据时，性能差。

**原因分析**：
- 没有使用 MyBatis-Plus 提供的批量操作方法
- 批量操作的数量过大
- 没有开启批量操作优化

**解决方案**：
1. 使用 MyBatis-Plus 提供的批量操作方法
2. 合理控制批量操作的数量
3. 开启批量操作优化

**代码示例**：

```java
// 使用 saveBatch() 批量插入
List<User> userList = new ArrayList<>();
// 添加用户数据...
userService.saveBatch(userList, 100); // 每次插入 100 条

// 使用 updateBatchById() 批量更新
userService.updateBatchById(userList, 100);

// 配置批量操作优化
@Configuration
public class MyBatisPlusConfig {
    
    @Bean
    public ConfigurationCustomizer configurationCustomizer() {
        return configuration -> {
            // 开启批量操作优化
            configuration.setDefaultExecutorType(ExecutorType.BATCH);
        };
    }
}
```

## 9. 版本兼容性问题

### 9.1 问题：Spring Boot 版本与 MyBatis-Plus 版本不兼容

**问题描述**：启动项目时，报类找不到或方法不存在错误。

**原因分析**：
- Spring Boot 版本与 MyBatis-Plus 版本不兼容
- 依赖冲突

**解决方案**：
1. 选择兼容的版本组合
2. 排除冲突的依赖
3. 使用 Spring Boot 官方推荐的依赖版本

**版本兼容参考**：
- Spring Boot 2.7.x + MyBatis-Plus 3.5.x
- Spring Boot 3.x + MyBatis-Plus 3.5.3.1+

**代码示例**：

```xml
<!-- Spring Boot 2.7.x + MyBatis-Plus 3.5.x -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>2.7.18</version>
</dependency>

<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.5</version>
</dependency>

<!-- Spring Boot 3.x + MyBatis-Plus 3.5.3.1+ -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.2.12</version>
</dependency>

<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.6</version>
</dependency>
```

## 10. 其他常见问题

### 10.1 问题：乐观锁失效

**问题描述**：使用乐观锁时，更新操作没有检查版本号。

**原因分析**：
- 没有配置乐观锁插件
- 实体类中没有添加版本号字段
- 没有使用 @Version 注解标记版本号字段

**解决方案**：
1. 配置乐观锁插件
2. 在实体类中添加版本号字段
3. 使用 @Version 注解标记版本号字段

**代码示例**：

```java
// 配置乐观锁插件
@Configuration
public class MyBatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        // 添加乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        // 添加分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}

// 实体类添加版本号字段
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    @Version // 乐观锁版本号
    private Integer version;
    
    // getter 和 setter
}

// 使用乐观锁
User user = userMapper.selectById(1L);
user.setUsername("newUsername");
userMapper.updateById(user); // 会自动检查版本号
```

### 10.2 问题：逻辑删除失效

**问题描述**：使用逻辑删除时，查询数据时没有自动过滤已删除的数据。

**原因分析**：
- 没有配置逻辑删除插件
- 实体类中没有添加逻辑删除字段
- 没有使用 @TableLogic 注解标记逻辑删除字段

**解决方案**：
1. 配置逻辑删除插件
2. 在实体类中添加逻辑删除字段
3. 使用 @TableLogic 注解标记逻辑删除字段

**代码示例**：

```yaml
# 配置逻辑删除
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted # 全局逻辑删除字段名
      logic-delete-value: 1 # 逻辑删除值
      logic-not-delete-value: 0 # 逻辑未删除值
```

```java
// 实体类添加逻辑删除字段
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    @TableLogic // 逻辑删除字段
    private Integer deleted;
    
    // getter 和 setter
}

// 使用逻辑删除
// 删除数据时，会自动更新 deleted 字段为 1
userMapper.deleteById(1L);

// 查询数据时，会自动过滤 deleted = 0 的数据
List<User> userList = userMapper.selectList(null);
```

## 总结

本文总结了 MyBatis-Plus 工作中常见的 10 类问题，包括基本配置问题、实体类配置问题、CRUD 操作问题、条件查询问题、分页查询问题、自定义 SQL 问题、事务处理问题、性能优化问题、版本兼容性问题和其他常见问题。

每个问题都包含了问题描述、原因分析和解决方案，并提供了详细的代码示例。希望这些内容能帮助开发者在使用 MyBatis-Plus 时，快速解决遇到的问题，提高开发效率。

在实际开发中，遇到问题时，建议：
1. 仔细查看错误日志
2. 检查配置是否正确
3. 查看官方文档
4. 搜索相关问题解决方案

MyBatis-Plus 是一个功能强大的 ORM 框架，合理使用可以大大提高开发效率，但也需要注意配置和使用方式，避免出现各种问题。