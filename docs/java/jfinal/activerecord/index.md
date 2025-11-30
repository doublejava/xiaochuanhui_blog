# JFinal ActiveRecord

JFinal ActiveRecord 是 JFinal 框架中的 ORM（对象关系映射）组件，采用 ActiveRecord 设计模式，具有无 XML 配置、API 简洁、性能优异等特点。

## ActiveRecord 核心特性

- **无 XML 配置**：无需编写任何 XML 配置文件
- **API 简洁**：提供链式调用 API，代码可读性高
- **性能优异**：底层采用 JDBC 直接操作数据库，性能接近原生 JDBC
- **支持多数据源**：支持配置多个数据库连接
- **事务支持**：提供声明式事务管理
- **自动映射**：自动映射数据库表到 Model 类

## Model 定义

Model 类对应数据库中的表，每个 Model 类需要定义一个静态的 dao 对象用于数据库操作。

```java
public class User extends Model<User> {
    public static final User dao = new User().dao();
}

public class Blog extends Model<Blog> {
    public static final Blog dao = new Blog().dao();
}
```

## 基本 CRUD 操作

### 创建（Create）

```java
// 方式1：使用 set 方法设置字段值
User user = new User();
user.set("name", "张三");
user.set("email", "zhangsan@example.com");
user.set("age", 25);
user.save();

// 方式2：使用构造方法传入字段值
User user = new User().set("name", "李四").set("email", "lisi@example.com").set("age", 30);
user.save();

// 方式3：批量保存
List<User> userList = new ArrayList<>();
// 添加用户到列表
Db.batchSave(userList, 100); // 每100条批量保存一次
```

### 查询（Read）

```java
// 根据 ID 查询
User user = User.dao.findById(1);

// 根据多个 ID 查询
List<User> userList = User.dao.findByIds("1,2,3");
List<User> userList = User.dao.findByIds(Arrays.asList(1, 2, 3));

// 条件查询
User user = User.dao.findFirst("select * from user where name = ?", "张三");

// 查询多条记录
List<User> userList = User.dao.find("select * from user where age > ?", 20);

// 分页查询
Page<User> userPage = User.dao.paginate(1, 10, "select *", "from user where age > ? order by id desc", 20);

// 使用链式 API 查询
List<User> userList = User.dao.where("age > ?", 20)
                          .and("status = ?", 1)
                          .orderBy("id desc")
                          .find();

// 查询记录数
Long count = User.dao.findFirst("select count(*) as count from user where age > ?", 20).getLong("count");
```

### 更新（Update）

```java
// 方式1：先查询后更新
User user = User.dao.findById(1);
user.set("name", "王五");
user.set("age", 35);
user.update();

// 方式2：直接更新
User.dao.findById(1).set("name", "赵六").update();

// 方式3：根据条件更新
User.dao.update("update user set age = age + 1 where id = ?", 1);

// 方式4：批量更新
List<User> userList = User.dao.find("select * from user where age < 18");
for (User user : userList) {
    user.set("status", 0);
}
Db.batchUpdate(userList, 100);
```

### 删除（Delete）

```java
// 根据 ID 删除
User.dao.deleteById(1);

// 根据多个 ID 删除
User.dao.deleteByIds("1,2,3");

// 根据条件删除
User.dao.delete("delete from user where age < 18");

// 先查询后删除
User user = User.dao.findById(1);
user.delete();
```

## 高级查询

### 关联查询

```java
// 一对一关联
public class User extends Model<User> {
    public static final User dao = new User().dao();
    
    public Profile getProfile() {
        return Profile.dao.findById(getInt("profile_id"));
    }
}

// 一对多关联
public class User extends Model<User> {
    public static final User dao = new User().dao();
    
    public List<Blog> getBlogs() {
        return Blog.dao.find("select * from blog where user_id = ?", getId());
    }
}

// 多对多关联
public class User extends Model<User> {
    public static final User dao = new User().dao();
    
    public List<Role> getRoles() {
        return Role.dao.find("select r.* from role r " +
                             "join user_role ur on r.id = ur.role_id " +
                             "where ur.user_id = ?", getId());
    }
}
```

### 子查询

```java
// 子查询示例
List<User> userList = User.dao.find("select * from user where id in (select user_id from blog where views > ?)", 1000);
```

### 聚合查询

```java
// 聚合查询示例
Record record = Db.findFirst("select count(*) as total, avg(age) as avg_age from user");
Long total = record.getLong("total");
Double avgAge = record.getDouble("avg_age");
```

## 事务管理

### 声明式事务

```java
@Before(Tx.class)
public void saveUserAndBlog() {
    User user = getModel(User.class);
    user.save();
    
    Blog blog = getModel(Blog.class);
    blog.set("user_id", user.getId());
    blog.save();
    
    renderJson("success", true);
}
```

### 编程式事务

```java
public void saveUserAndBlog() {
    boolean success = Db.tx(() -> {
        User user = getModel(User.class);
        user.save();
        
        Blog blog = getModel(Blog.class);
        blog.set("user_id", user.getId());
        blog.save();
        
        return true; // 返回 true 提交事务，返回 false 回滚事务
    });
    
    renderJson("success", success);
}
```

## 多数据源支持

```java
// 配置多数据源
public class DemoConfig extends JFinalConfig {
    public void configPlugin(Plugins me) {
        // 主数据源
        DruidPlugin mainDruidPlugin = new DruidPlugin("jdbc:mysql://localhost:3306/main_db", "root", "password");
        me.add(mainDruidPlugin);
        ActiveRecordPlugin mainArp = new ActiveRecordPlugin(mainDruidPlugin);
        mainArp.addMapping("user", User.class);
        me.add(mainArp);
        
        // 第二个数据源
        DruidPlugin secondDruidPlugin = new DruidPlugin("jdbc:mysql://localhost:3306/second_db", "root", "password");
        me.add(secondDruidPlugin);
        ActiveRecordPlugin secondArp = new ActiveRecordPlugin("second", secondDruidPlugin);
        secondArp.addMapping("blog", Blog.class);
        me.add(secondArp);
    }
}

// 使用指定数据源
Db.use("second").find("select * from blog");
Blog.dao.use("second").findById(1);
```

## 数据库迁移

JFinal 提供了 DbKit 工具类用于数据库迁移和初始化：

```java
// 执行 SQL 脚本
DbKit.runSql("init.sql");

// 执行单个 SQL 语句
Db.update("create table if not exists user (id int primary key auto_increment, name varchar(50), email varchar(100))");
```

## 最佳实践

1. **合理设计 Model 类**：每个 Model 类对应一个数据库表
2. **使用链式 API**：链式 API 使代码更简洁、可读性更高
3. **避免在 Model 中编写复杂业务逻辑**：复杂业务逻辑应封装到 Service 层
4. **使用事务管理**：对于涉及多个数据库操作的业务，必须使用事务管理
5. **合理使用索引**：根据查询需求创建合适的索引
6. **使用分页查询**：对于大数据量查询，必须使用分页查询
7. **避免 SELECT ***：只查询需要的字段，提高查询性能
8. **使用批量操作**：对于大量数据的插入、更新、删除，使用批量操作提高性能

## 总结

JFinal ActiveRecord 是一个简洁高效的 ORM 框架，具有以下优点：

- **开发效率高**：API 简洁，无需编写复杂配置
- **性能优异**：底层采用 JDBC 直接操作数据库
- **易于学习**：学习曲线平缓，上手快
- **功能强大**：支持 CRUD、关联查询、事务管理、多数据源等功能
- **易于扩展**：支持自定义 SQL 模板、插件等

JFinal ActiveRecord 非常适合快速开发 Web 应用，同时也能满足大型项目的需求。