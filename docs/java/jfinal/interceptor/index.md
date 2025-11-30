# JFinal Interceptor

JFinal Interceptor（拦截器）是 JFinal 框架中的重要组件，用于拦截 Controller 方法的调用，实现 AOP 功能。

## 拦截器的定义

拦截器需要实现 `Interceptor` 接口，并重写 `intercept` 方法：

```java
public class LogInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {
        // 拦截器逻辑
        System.out.println("Before method: " + inv.getMethodName());
        
        // 执行目标方法
        inv.invoke();
        
        // 目标方法执行后的逻辑
        System.out.println("After method: " + inv.getMethodName());
    }
}
```

## 拦截器的配置

### 类级别的拦截器

在 Controller 类上添加 `@Before` 注解，对该类的所有方法生效：

```java
@Before(LogInterceptor.class)
public class UserController extends Controller {
    // 所有方法都会被 LogInterceptor 拦截
}
```

### 方法级别的拦截器

在 Controller 方法上添加 `@Before` 注解，只对该方法生效：

```java
public class UserController extends Controller {
    @Before(LogInterceptor.class)
    public void save() {
        // 该方法会被 LogInterceptor 拦截
    }
    
    public void list() {
        // 该方法不会被 LogInterceptor 拦截
    }
}
```

### 全局拦截器

在 JFinalConfig 中配置全局拦截器，对所有 Controller 方法生效：

```java
public class DemoConfig extends JFinalConfig {
    @Override
    public void configInterceptor(Interceptors me) {
        // 添加全局拦截器
        me.add(new LogInterceptor());
        me.add(new AuthInterceptor());
    }
}
```

### 路由级别的拦截器

在 Routes 中配置路由级别的拦截器，对该路由下的所有 Controller 方法生效：

```java
public class AdminRoutes extends Routes {
    @Override
    public void config() {
        setBaseViewPath("/view/admin");
        
        // 添加路由级别的拦截器
        addInterceptor(new AdminAuthInterceptor());
        
        add("/admin", AdminController.class);
        add("/admin/user", AdminUserController.class);
    }
}
```

## 拦截器的执行顺序

### 多个拦截器的执行顺序

当一个方法被多个拦截器拦截时，拦截器的执行顺序与配置顺序一致：

```java
@Before({AuthInterceptor.class, LogInterceptor.class, ValidationInterceptor.class})
public void save() {
    // 业务逻辑
}
```

执行顺序：
1. AuthInterceptor.before
2. LogInterceptor.before
3. ValidationInterceptor.before
4. save() 方法执行
5. ValidationInterceptor.after
6. LogInterceptor.after
7. AuthInterceptor.after

### 不同级别拦截器的执行顺序

1. 全局拦截器
2. 路由级拦截器
3. 类级拦截器
4. 方法级拦截器

## 拦截器的高级用法

### 带参数的拦截器

```java
public class RoleInterceptor implements Interceptor {
    private String role;
    
    public RoleInterceptor(String role) {
        this.role = role;
    }
    
    @Override
    public void intercept(Invocation inv) {
        User user = inv.getController().getSessionAttr("user");
        if (user != null && user.hasRole(role)) {
            inv.invoke();
        } else {
            inv.getController().renderJson("error", "无权限访问");
        }
    }
}

// 使用带参数的拦截器
@Before({@Interceptor(RoleInterceptor.class, params = {"admin"})})
public void adminMethod() {
    // 只有管理员可以访问
}
```

### 注解式拦截器

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RequireLogin {
}

public class LoginInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {
        if (inv.getMethod().isAnnotationPresent(RequireLogin.class)) {
            User user = inv.getController().getSessionAttr("user");
            if (user == null) {
                inv.getController().redirect("/login");
                return;
            }
        }
        inv.invoke();
    }
}

// 配置注解拦截器
public class DemoConfig extends JFinalConfig {
    @Override
    public void configInterceptor(Interceptors me) {
        me.add(new LoginInterceptor());
    }
}

// 使用注解拦截器
@RequireLogin
public void userCenter() {
    // 需要登录才能访问
}
```

### 拦截器的排除

使用 `@Clear` 注解排除某些拦截器：

```java
@Before(LogInterceptor.class)
public class UserController extends Controller {
    // 该方法会被 LogInterceptor 拦截
    public void save() {
    }
    
    // 该方法不会被 LogInterceptor 拦截
    @Clear(LogInterceptor.class)
    public void list() {
    }
    
    // 清除所有拦截器
    @Clear
    public void publicMethod() {
    }
}
```

## 内置拦截器

JFinal 提供了一些内置的拦截器：

### Tx 拦截器

用于实现声明式事务管理：

```java
@Before(Tx.class)
public void saveUserAndBlog() {
    User user = getModel(User.class);
    user.save();
    
    Blog blog = getModel(Blog.class);
    blog.set("user_id", user.getId());
    blog.save();
}
```

### Cache 拦截器

用于实现方法缓存：

```java
@Before(CacheInterceptor.class)
@CacheName("user")
public void getUser() {
    Integer id = getInt("id");
    User user = User.dao.findById(id);
    renderJson(user);
}
```

### Validator 拦截器

用于实现数据验证：

```java
@Before(UserValidator.class)
public void saveUser() {
    User user = getModel(User.class);
    user.save();
    renderJson("success", true);
}
```

## 拦截器的应用场景

### 日志记录

```java
public class LogInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {
        Controller controller = inv.getController();
        String url = controller.getRequest().getRequestURI();
        String method = controller.getRequest().getMethod();
        String params = JSON.toJSONString(controller.getParaMap());
        
        System.out.println("Request: " + method + " " + url + " - Params: " + params);
        
        long startTime = System.currentTimeMillis();
        inv.invoke();
        long endTime = System.currentTimeMillis();
        
        System.out.println("Response: " + method + " " + url + " - Time: " + (endTime - startTime) + "ms");
    }
}
```

### 权限验证

```java
public class AuthInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {
        User user = inv.getController().getSessionAttr("user");
        if (user == null) {
            inv.getController().renderJson("error", "未登录");
            return;
        }
        
        // 检查用户是否有权限访问该方法
        String actionKey = inv.getActionKey();
        if (!hasPermission(user, actionKey)) {
            inv.getController().renderJson("error", "无权限访问");
            return;
        }
        
        inv.invoke();
    }
    
    private boolean hasPermission(User user, String actionKey) {
        // 权限检查逻辑
        return true;
    }
}
```

### 性能监控

```java
public class PerformanceInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {
        long startTime = System.nanoTime();
        inv.invoke();
        long endTime = System.nanoTime();
        
        long executionTime = (endTime - startTime) / 1000000; // 转换为毫秒
        if (executionTime > 1000) { // 执行时间超过1秒，记录警告
            System.out.println("警告: 方法 " + inv.getMethodName() + " 执行时间过长: " + executionTime + "ms");
        }
    }
}
```

### 异常处理

```java
public class ExceptionInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {
        try {
            inv.invoke();
        } catch (Exception e) {
            // 记录异常日志
            e.printStackTrace();
            
            // 返回友好的错误信息
            inv.getController().renderJson("error", "服务器内部错误");
        }
    }
}
```

### 跨域处理

```java
public class CorsInterceptor implements Interceptor {
    @Override
    public void intercept(Invocation inv) {
        HttpServletResponse response = inv.getController().getResponse();
        
        // 设置允许跨域的域名
        response.setHeader("Access-Control-Allow-Origin", "*");
        // 设置允许的请求方法
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        // 设置允许的请求头
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        // 设置是否允许携带凭证
        response.setHeader("Access-Control-Allow-Credentials", "true");
        
        // 处理 OPTIONS 请求
        if ("OPTIONS".equals(inv.getController().getRequest().getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        inv.invoke();
    }
}
```

## 拦截器的最佳实践

1. **单一职责原则**：每个拦截器只负责一个功能
2. **保持拦截器简洁**：拦截器逻辑应该简单高效，避免复杂业务逻辑
3. **合理使用不同级别的拦截器**：根据需求选择合适的拦截器级别
4. **注意拦截器的执行顺序**：合理安排拦截器的执行顺序
5. **使用注解式拦截器**：注解式拦截器更灵活，便于维护
6. **避免过度使用拦截器**：过度使用拦截器会增加系统复杂度和性能开销
7. **使用内置拦截器**：优先使用 JFinal 提供的内置拦截器
8. **测试拦截器**：确保拦截器逻辑正确，不会影响正常业务

## 总结

JFinal Interceptor 是实现 AOP 功能的重要组件，具有以下优点：

- **配置简单**：通过注解或配置类即可完成拦截器的配置
- **使用灵活**：支持类级别、方法级别、全局、路由级别等多种配置方式
- **性能优异**：基于代理实现，性能开销小
- **易于扩展**：可以自定义拦截器，实现各种功能
- **与框架深度集成**：与 JFinal MVC 框架深度集成，使用方便

JFinal Interceptor 适用于日志记录、权限验证、事务管理、性能监控、异常处理等多种场景，可以提高代码的模块化程度和可维护性。