# JFinal Config

JFinal Config（配置）是 JFinal 框架中的核心组件，用于配置框架的各个方面，包括常量、路由、插件、AOP、拦截器、引擎等。

## 配置类的定义

JFinal 应用需要创建一个继承自 `JFinalConfig` 的配置类，并实现相关方法：

```java
public class DemoConfig extends JFinalConfig {
    // 配置常量
    @Override
    public void configConstant(Constants me) {
        // 配置开发模式
        me.setDevMode(true);
        
        // 配置字符集
        me.setEncoding("UTF-8");
        
        // 配置基础路径
        me.setBaseViewPath("/view");
        
        // 配置文件上传路径
        me.setBaseUploadPath("/upload");
        
        // 配置错误页面
        me.setError404View("/error/404.html");
        me.setError500View("/error/500.html");
    }
    
    // 配置路由
    @Override
    public void configRoute(Routes me) {
        // 配置首页路由
        me.add("/", IndexController.class);
        
        // 配置用户路由
        me.add("/user", UserController.class);
        
        // 配置带视图前缀的路由
        me.add("/blog", BlogController.class, "/view/blog");
        
        // 配置路由分组
        me.add(new AdminRoutes());
    }
    
    // 配置插件
    @Override
    public void configPlugin(Plugins me) {
        // 配置数据库连接池
        DruidPlugin druidPlugin = new DruidPlugin("jdbc:mysql://localhost:3306/test", "root", "password");
        me.add(druidPlugin);
        
        // 配置 ActiveRecord 插件
        ActiveRecordPlugin arp = new ActiveRecordPlugin(druidPlugin);
        arp.addMapping("user", User.class);
        arp.addMapping("blog", Blog.class);
        me.add(arp);
        
        // 配置缓存插件
        me.add(new EhCachePlugin());
        
        // 配置 Redis 插件
        // me.add(new RedisPlugin("redis", "localhost", 6379));
    }
    
    // 配置 AOP
    @Override
    public void configAop(Aop aop) {
        // 配置全局 AOP
        aop.add(LogInterceptor.class);
        aop.add(AuthInterceptor.class);
        
        // 配置带注解的 AOP
        aop.add(TransactionInterceptor.class, Tx.class);
    }
    
    // 配置拦截器
    @Override
    public void configInterceptor(Interceptors me) {
        // 添加全局拦截器
        me.add(new GlobalInterceptor());
        
        // 添加事务拦截器
        me.add(new TxInterceptor());
    }
    
    // 配置处理器
    @Override
    public void configHandler(Handlers me) {
        // 添加上下文路径处理器
        me.add(new ContextPathHandler("ctx"));
        
        // 添加资源处理器
        me.add(new ResourceHandler("/static/")
            .addSkip("/WEB-INF/")
            .addSkip("/META-INF/")
        );
    }
    
    // 配置引擎
    @Override
    public void configEngine(Engine engine) {
        // 设置模板文件编码
        engine.setEncoding("UTF-8");
        
        // 设置模板文件后缀
        engine.setViewExtension(".html");
        
        // 开启开发模式
        engine.setDevMode(true);
        
        // 注册自定义函数
        engine.addFunction("hello", (String name) -> "Hello, " + name + "!");
    }
    
    // 启动完成后的回调
    @Override
    public void afterJFinalStart() {
        System.out.println("JFinal 启动完成！");
    }
    
    // 关闭前的回调
    @Override
    public void beforeJFinalStop() {
        System.out.println("JFinal 即将关闭！");
    }
}
```

## 配置详解

### 常量配置

```java
public void configConstant(Constants me) {
    // 开发模式配置
    me.setDevMode(true); // 开发模式
    me.setDevMode(false); // 生产模式
    
    // 字符集配置
    me.setEncoding("UTF-8");
    
    // 基础路径配置
    me.setBaseViewPath("/view");
    me.setBaseUploadPath("/upload");
    me.setBaseDownloadPath("/download");
    
    // 错误页面配置
    me.setError404View("/error/404.html");
    me.setError500View("/error/500.html");
    me.setErrorView(403, "/error/403.html");
    
    // 超时配置
    me.setMaxPostSize(1024 * 1024 * 100); // 最大上传大小 100MB
    me.setSessionTimeout(3600); // Session 超时时间 1 小时
    
    // 其他配置
    me.setUrlParaSeparator(","); // URL 参数分隔符
    me.setJsonDatePattern("yyyy-MM-dd HH:mm:ss"); // JSON 日期格式
    me.setInjectDependency(true); // 开启依赖注入
    me.setInjectSuperClass(true); // 开启父类注入
}
```

### 路由配置

```java
public void configRoute(Routes me) {
    // 基础路由配置
    me.add("/", IndexController.class);
    me.add("/user", UserController.class);
    
    // 带视图前缀的路由
    me.add("/blog", BlogController.class, "/view/blog");
    
    // 路由分组
    me.add(new AdminRoutes());
    me.add(new ApiRoutes());
    
    // 路由优先级
    me.add("/api", ApiController.class).setPriority(1);
}

// 路由分组
public class AdminRoutes extends Routes {
    @Override
    public void config() {
        setBaseViewPath("/view/admin");
        addInterceptor(new AdminAuthInterceptor());
        add("/admin", AdminController.class);
        add("/admin/user", AdminUserController.class);
        add("/admin/blog", AdminBlogController.class);
    }
}
```

### 插件配置

```java
public void configPlugin(Plugins me) {
    // 配置数据库连接池
    DruidPlugin druidPlugin = new DruidPlugin("jdbc:mysql://localhost:3306/test", "root", "password");
    
    // 配置连接池参数
    druidPlugin.set("initialSize", "10");
    druidPlugin.set("maxActive", "100");
    druidPlugin.set("minIdle", "10");
    druidPlugin.set("maxWait", "60000");
    
    me.add(druidPlugin);
    
    // 配置 ActiveRecord 插件
    ActiveRecordPlugin arp = new ActiveRecordPlugin(druidPlugin);
    
    // 配置数据库方言
    arp.setDialect(new MysqlDialect());
    
    // 配置是否显示 SQL
    arp.setShowSql(true);
    
    // 配置表映射
    arp.addMapping("user", "id", User.class); // 指定主键
    arp.addMapping("blog", Blog.class); // 使用默认主键 id
    
    // 配置多数据源
    DruidPlugin secondDruidPlugin = new DruidPlugin("jdbc:mysql://localhost:3306/second_db", "root", "password");
    me.add(secondDruidPlugin);
    ActiveRecordPlugin secondArp = new ActiveRecordPlugin("second", secondDruidPlugin);
    secondArp.addMapping("product", Product.class);
    me.add(secondArp);
    
    // 配置缓存插件
    me.add(new EhCachePlugin());
    
    // 配置 Redis 插件
    // me.add(new RedisPlugin("redis", "localhost", 6379));
    
    // 配置 Quartz 定时任务插件
    // QuartzPlugin quartzPlugin = new QuartzPlugin("job.properties");
    // me.add(quartzPlugin);
}
```

### AOP 配置

```java
public void configAop(Aop aop) {
    // 配置全局 AOP
    aop.add(LogInterceptor.class);
    aop.add(AuthInterceptor.class);
    
    // 配置带注解的 AOP
    aop.add(TransactionInterceptor.class, Tx.class);
    aop.add(LogInterceptor.class, Log.class);
    
    // 配置针对特定类的 AOP
    aop.add(ServiceInterceptor.class, "com.example.service.*");
    
    // 配置针对特定方法的 AOP
    aop.add(MethodInterceptor.class, "com.example.service.UserService.find*");
    
    // 配置针对特定注解的 AOP
    aop.add(AnnotationInterceptor.class, "@com.example.annotation.CustomAnnotation");
}
```

### 拦截器配置

```java
public void configInterceptor(Interceptors me) {
    // 添加全局拦截器
    me.add(new GlobalInterceptor());
    
    // 添加事务拦截器
    me.add(new TxInterceptor());
    
    // 添加缓存拦截器
    me.add(new CacheInterceptor());
    
    // 添加跨域拦截器
    me.add(new CorsInterceptor());
    
    // 配置拦截器排除
    me.add(new AuthInterceptor()).exclude("/login", "/register");
}
```

### 处理器配置

```java
public void configHandler(Handlers me) {
    // 添加上下文路径处理器
    me.add(new ContextPathHandler("ctx"));
    
    // 添加资源处理器
    me.add(new ResourceHandler("/static/")
        .addSkip("/WEB-INF/")
        .addSkip("/META-INF/")
    );
    
    // 添加 Druid 监控处理器
    me.add(new DruidStatViewHandler("/druid", new IStatViewAuth() {
        @Override
        public boolean isPermitted(HttpServletRequest request) {
            // 配置 Druid 监控的访问权限
            return true;
        }
    }));
    
    // 添加自定义处理器
    me.add(new CustomHandler());
}
```

### 引擎配置

```java
public void configEngine(Engine engine) {
    // 设置模板文件编码
    engine.setEncoding("UTF-8");
    
    // 设置模板文件后缀
    engine.setViewExtension(".html");
    
    // 开启开发模式
    engine.setDevMode(true);
    
    // 设置模板缓存时间
    engine.setCacheTime(0); // 不缓存
    
    // 开启模板压缩
    engine.setCompressorOn(true);
    
    // 注册自定义函数
    engine.addFunction("hello", (String name) -> "Hello, " + name + "!");
    engine.addFunction("add", (int a, int b) -> a + b);
    
    // 注册自定义指令
    engine.addDirective("custom", CustomDirective.class);
    
    // 注册自定义标签
    engine.addTag("customTag", CustomTag.class);
    
    // 注册模板函数包
    engine.addFunctions("com.example.util.TemplateFunctions");
}
```

## 配置的最佳实践

1. **合理组织配置**：将不同类型的配置放在不同的方法中，保持配置的清晰性
2. **使用配置文件**：将数据库连接信息、缓存配置等敏感信息放在配置文件中，便于维护
3. **开启开发模式**：开发过程中开启开发模式，便于调试和开发
4. **关闭生产模式的开发功能**：生产环境中关闭开发模式、SQL 显示等功能，提高性能和安全性
5. **合理配置连接池**：根据项目需求配置合适的连接池参数，提高数据库访问性能
6. **使用路由分组**：对于大型项目，使用路由分组管理不同模块的路由，便于维护
7. **合理使用插件**：只添加项目需要的插件，避免不必要的性能开销
8. **配置错误页面**：为不同的错误码配置友好的错误页面，提高用户体验

## 总结

JFinal 配置是 JFinal 框架的核心，通过配置可以控制框架的各个方面。JFinal 提供了简洁易用的配置 API，使开发者能够快速配置和启动应用。

合理的配置可以提高应用的性能、安全性和可维护性，因此在开发过程中应该重视配置的设计和管理。