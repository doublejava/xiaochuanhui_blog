# Spring Boot 事务管理

发布于：2025-11-27

## 事务概述

事务是数据库操作的基本单元，它具有 ACID 特性：

- **原子性（Atomicity）**：事务中的所有操作要么全部成功，要么全部失败
- **一致性（Consistency）**：事务执行前后，数据库的状态保持一致
- **隔离性（Isolation）**：多个事务并发执行时，它们之间不会互相干扰
- **持久性（Durability）**：事务一旦提交，其结果就会永久保存到数据库中

## Spring Boot 中的事务管理

Spring Boot 提供了两种事务管理方式：

1. **编程式事务管理**：通过编写代码来管理事务
2. **声明式事务管理**：通过注解或 XML 配置来管理事务

其中，声明式事务管理是最常用的方式，它可以通过 @Transactional 注解来实现。

## 声明式事务管理

### 1. 添加依赖

在 pom.xml 文件中添加 Spring Boot 事务依赖（通常已包含在 spring-boot-starter-data-jpa 或 spring-boot-starter-jdbc 中）：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

### 2. 启用事务管理

Spring Boot 默认已经启用了事务管理，我们只需要在需要事务的方法上添加 @Transactional 注解即可。

### 3. 使用 @Transactional 注解

#### 3.1 在方法上使用

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    // 在方法上添加 @Transactional 注解
    @Transactional
    public void createUserAndOrder(User user, Order order) {
        // 保存用户
        userRepository.save(user);
        // 保存订单
        orderService.saveOrder(order);
    }
}
```

#### 3.2 在类上使用

```java
@Service
@Transactional // 在类上添加 @Transactional 注解，所有方法都会应用事务
public class UserService {
    // ...
}
```

## @Transactional 注解的属性

@Transactional 注解有以下常用属性：

- **value/transactionManager**：指定事务管理器
- **propagation**：指定事务传播行为
- **isolation**：指定事务隔离级别
- **timeout**：指定事务超时时间
- **readOnly**：指定事务是否为只读
- **rollbackFor**：指定哪些异常会导致事务回滚
- **rollbackForClassName**：指定哪些异常类名会导致事务回滚
- **noRollbackFor**：指定哪些异常不会导致事务回滚
- **noRollbackForClassName**：指定哪些异常类名不会导致事务回滚

### 1. 事务传播行为

事务传播行为定义了当一个事务方法被另一个事务方法调用时，事务如何传播。Spring 支持以下7种事务传播行为：

| 传播行为 | 描述 |
|----------|------|
| REQUIRED | 如果当前存在事务，则加入该事务；否则，创建一个新事务 |
| SUPPORTS | 如果当前存在事务，则加入该事务；否则，以非事务方式执行 |
| MANDATORY | 如果当前存在事务，则加入该事务；否则，抛出异常 |
| REQUIRES_NEW | 创建一个新事务，无论当前是否存在事务 |
| NOT_SUPPORTED | 以非事务方式执行，如果当前存在事务，则挂起该事务 |
| NEVER | 以非事务方式执行，如果当前存在事务，则抛出异常 |
| NESTED | 如果当前存在事务，则创建一个嵌套事务；否则，创建一个新事务 |

示例：

```java
@Transactional(propagation = Propagation.REQUIRED)
public void methodA() {
    // ...
    methodB();
    // ...
}

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void methodB() {
    // ...
}
```

### 2. 事务隔离级别

事务隔离级别定义了多个事务并发执行时的隔离程度。Spring 支持以下5种事务隔离级别：

| 隔离级别 | 描述 |
|----------|------|
| DEFAULT | 使用数据库默认的隔离级别 |
| READ_UNCOMMITTED | 允许读取未提交的数据（脏读、不可重复读、幻读） |
| READ_COMMITTED | 只允许读取已提交的数据（避免脏读，但可能出现不可重复读、幻读） |
| REPEATABLE_READ | 确保同一事务中多次读取同一数据时结果一致（避免脏读、不可重复读，但可能出现幻读） |
| SERIALIZABLE | 完全串行化执行，避免所有并发问题（性能最低） |

示例：

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void method() {
    // ...
}
```

### 3. 事务超时时间

事务超时时间指定了事务执行的最大时间，如果超过该时间，事务会自动回滚。

示例：

```java
@Transactional(timeout = 30) // 30秒超时
public void method() {
    // ...
}
```

### 4. 只读事务

只读事务指定了事务只能读取数据，不能修改数据。只读事务可以提高性能，因为数据库可以对只读事务进行优化。

示例：

```java
@Transactional(readOnly = true)
public User getUserById(Long id) {
    // ...
}
```

### 5. 异常回滚规则

默认情况下，Spring 会对 RuntimeException 和 Error 异常进行回滚，而对检查异常不会回滚。我们可以通过 rollbackFor 和 noRollbackFor 属性来修改回滚规则。

示例：

```java
// 对所有异常都回滚
@Transactional(rollbackFor = Exception.class)
public void method() {
    // ...
}

// 对特定异常不回滚
@Transactional(noRollbackFor = BusinessException.class)
public void method() {
    // ...
}
```

## 编程式事务管理

编程式事务管理需要通过编写代码来管理事务，它提供了更细粒度的事务控制。

### 1. 使用 TransactionTemplate

```java
@Service
public class UserService {

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Autowired
    private UserRepository userRepository;

    public void createUser(User user) {
        transactionTemplate.execute(new TransactionCallbackWithoutResult() {
            @Override
            protected void doInTransactionWithoutResult(TransactionStatus status) {
                try {
                    // 保存用户
                    userRepository.save(user);
                    // 其他操作
                } catch (Exception e) {
                    // 手动回滚事务
                    status.setRollbackOnly();
                    throw e;
                }
            }
        });
    }
}
```

### 2. 使用 PlatformTransactionManager

```java
@Service
public class UserService {

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private UserRepository userRepository;

    public void createUser(User user) {
        // 定义事务属性
        DefaultTransactionDefinition transactionDefinition = new DefaultTransactionDefinition();
        transactionDefinition.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRED);

        // 获取事务状态
        TransactionStatus status = transactionManager.getTransaction(transactionDefinition);

        try {
            // 保存用户
            userRepository.save(user);
            // 其他操作

            // 提交事务
            transactionManager.commit(status);
        } catch (Exception e) {
            // 回滚事务
            transactionManager.rollback(status);
            throw e;
        }
    }
}
```

## 事务管理的注意事项

### 1. 事务方法必须是 public

@Transactional 注解只能应用于 public 方法，否则事务不会生效。

### 2. 事务方法必须通过代理调用

事务方法必须通过 Spring 代理调用，否则事务不会生效。例如，在同一个类中调用事务方法，事务不会生效：

```java
@Service
public class UserService {

    @Transactional
    public void methodA() {
        // ...
    }

    public void methodB() {
        // 同一个类中调用事务方法，事务不会生效
        this.methodA();
    }
}
```

### 3. 正确处理异常

默认情况下，Spring 只会对 RuntimeException 和 Error 异常进行回滚，对检查异常不会回滚。如果需要对检查异常进行回滚，需要设置 rollbackFor 属性。

### 4. 合理设置事务传播行为

根据业务需求，合理设置事务传播行为，避免出现事务嵌套问题。

### 5. 合理设置事务隔离级别

根据业务需求，合理设置事务隔离级别，平衡并发性能和数据一致性。

## 总结

Spring Boot 提供了强大的事务管理功能，支持编程式事务管理和声明式事务管理。其中，声明式事务管理是最常用的方式，它可以通过 @Transactional 注解来实现。

在实际项目中，我们需要根据业务需求，合理设置事务的传播行为、隔离级别、超时时间等属性，确保事务的正确性和性能。

事务管理是保证数据一致性和完整性的重要手段，合理使用事务管理可以提高系统的可靠性和稳定性。