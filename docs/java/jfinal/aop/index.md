# JFinal AOP

JFinal AOP（面向切面编程）是 JFinal 框架中的重要特性，提供了简洁易用的 AOP 实现，用于解决系统中的横切关注点问题。

## AOP 核心概念

### 切面（Aspect）

切面是横切关注点的模块化，包含了通知和切点的定义。

### 通知（Advice）

通知是切面的具体实现，定义了在何时、何处执行横切逻辑。JFinal 支持以下几种通知类型：

- **Before**：在目标方法执行前执行
- **After**：在目标方法执行后执行，无论方法是否抛出异常
- **AfterReturning**：在目标方法成功执行后执行
- **AfterThrowing**：在目标方法抛出异常后执行
- **Around**：环绕目标方法执行，可以控制目标方法的执行

### 切点（Pointcut）

切点定义了通知应该应用于哪些方法。JFinal 支持通过注解、类名、方法名等方式定义切点。

### 连接点（Join Point）

连接点是程序执行过程中的某个特定点，如方法调用、异常抛出等。

### 织入（Weaving）

织入是将切面应用到目标对象并创建代理对象的过程。

## AOP 配置

### 全局 AOP 配置

在 JFinalConfig 中配置 AOP：

```java
public class DemoConfig extends JFinalConfig {
    public void configAop(Aop aop) {
        // 配置全局 AOP
        aop.add(LogInterceptor.class);
        aop.add(AuthInterceptor.class);
        
        // 配置带注解的 AOP
        aop.add(TransactionInterceptor.class, Tx.class);
        
        // 配置针对特定类的 AOP
        aop.add(ServiceInterceptor.class, "com.example.service.*");
        
        // 配置针对特定方法的 AOP
        aop.add(MethodInterceptor.class, "com.example.service.UserService.find*");
    }
}
```

## 通知类型

### Before 通知

```java
@Before(LogInterceptor.class)
public void saveUser() {
    // 业务逻辑
}

public class LogInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        System.out.println("Before method: " + inv.getMethodName());
        inv.invoke(); // 执行目标方法
    }
}
```

### After 通知

```java
@After(LogInterceptor.class)
public void saveUser() {
    // 业务逻辑
}

public class LogInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        inv.invoke(); // 执行目标方法
        System.out.println("After method: " + inv.getMethodName());
    }
}
```

### Around 通知

```java
@Around(PerformanceInterceptor.class)
public void saveUser() {
    // 业务逻辑
}

public class PerformanceInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        long startTime = System.currentTimeMillis();
        
        inv.invoke(); // 执行目标方法
        
        long endTime = System.currentTimeMillis();
        System.out.println("Method " + inv.getMethodName() + " executed in " + (endTime - startTime) + "ms");
    }
}
```

## 注解式 AOP

### 自定义注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Log {
    String value() default "";
}
```

### 注解拦截器

```java
public class LogInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        Log log = inv.getMethod().getAnnotation(Log.class);
        if (log != null) {
            System.out.println("Log: " + log.value());
        }
        inv.invoke();
    }
}
```

### 配置注解 AOP

```java
public class DemoConfig extends JFinalConfig {
    public void configAop(Aop aop) {
        aop.add(LogInterceptor.class, Log.class);
    }
}
```

### 使用注解

```java
@Log("保存用户")
public void saveUser() {
    // 业务逻辑
}
```

## 多层 AOP

JFinal 支持多层 AOP，可以为同一个方法配置多个拦截器：

```java
@Before({AuthInterceptor.class, LogInterceptor.class, ValidationInterceptor.class})
public void saveUser() {
    // 业务逻辑
}
```

拦截器的执行顺序与配置顺序一致，先执行 AuthInterceptor，然后执行 LogInterceptor，最后执行 ValidationInterceptor。

## 全局 AOP

可以配置全局 AOP，对所有 Controller 方法生效：

```java
public class DemoConfig extends JFinalConfig {
    public void configAop(Aop aop) {
        // 对所有 Controller 方法生效
        aop.add(GlobalInterceptor.class, "com.example.controller.*");
    }
}
```

## AOP 应用场景

### 日志记录

```java
public class LogInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        String controller = inv.getController().getClass().getName();
        String method = inv.getMethodName();
        String params = JSON.toJSONString(inv.getController().getParaMap());
        
        System.out.println("Request: " + controller + "." + method + " - Params: " + params);
        
        long startTime = System.currentTimeMillis();
        inv.invoke();
        long endTime = System.currentTimeMillis();
        
        System.out.println("Response: " + controller + "." + method + " - Time: " + (endTime - startTime) + "ms");
    }
}
```

### 权限验证

```java
public class AuthInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        User user = inv.getController().getSessionAttr("user");
        if (user == null) {
            inv.getController().renderJson("error", "未登录");
            return;
        }
        
        // 检查用户权限
        if (!hasPermission(user, inv.getMethodName())) {
            inv.getController().renderJson("error", "无权限");
            return;
        }
        
        inv.invoke();
    }
    
    private boolean hasPermission(User user, String method) {
        // 权限检查逻辑
        return true;
    }
}
```

### 事务管理

```java
public class TransactionInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        try {
            Db.tx(() -> {
                inv.invoke();
                return true;
            });
        } catch (Exception e) {
            inv.getController().renderJson("error", "事务执行失败: " + e.getMessage());
        }
    }
}
```

### 性能监控

```java
public class PerformanceInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        long startTime = System.currentTimeMillis();
        inv.invoke();
        long endTime = System.currentTimeMillis();
        
        long executionTime = endTime - startTime;
        if (executionTime > 1000) { // 超过1秒记录警告
            System.out.println("警告: 方法 " + inv.getMethodName() + " 执行时间过长: " + executionTime + "ms");
        }
    }
}
```

### 参数验证

```java
public class ValidationInterceptor implements Interceptor {
    public void intercept(Invocation inv) {
        Controller controller = inv.getController();
        String method = inv.getMethodName();
        
        if ("saveUser".equals(method)) {
            String name = controller.getPara("name");
            String email = controller.getPara("email");
            
            if (StringUtils.isEmpty(name)) {
                controller.renderJson("error", "用户名不能为空");
                return;
            }
            
            if (!email.matches("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$")) {
                controller.renderJson("error", "邮箱格式不正确");
                return;
            }
        }
        
        inv.invoke();
    }
}
```

## AOP 最佳实践

1. **合理划分切面**：将不同类型的横切关注点划分为不同的切面
2. **保持切面简洁**：每个切面只负责一个横切关注点
3. **使用注解式 AOP**：注解式 AOP 更灵活，便于维护
4. **避免过度使用 AOP**：过度使用 AOP 会增加系统复杂度
5. **注意性能影响**：AOP 会带来一定的性能开销，应避免在高频方法上使用复杂的 AOP 逻辑
6. **合理设置拦截器顺序**：根据业务需求合理设置拦截器的执行顺序
7. **使用全局 AOP 谨慎**：全局 AOP 会影响所有方法，应谨慎使用

## 总结

JFinal AOP 具有以下优点：

- **简洁易用**：API 设计简洁，学习曲线平缓
- **性能优异**：基于代理实现，性能开销小
- **灵活性高**：支持多种通知类型和切点定义方式
- **易于扩展**：可以自定义拦截器和注解
- **与框架深度集成**：与 JFinal MVC 框架深度集成，使用方便

JFinal AOP 是解决系统横切关注点问题的重要工具，可以提高代码的模块化程度和可维护性，适用于日志记录、权限验证、事务管理、性能监控等场景。