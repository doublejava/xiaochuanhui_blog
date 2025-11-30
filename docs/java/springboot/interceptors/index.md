# Spring Boot 拦截器使用

发布于：2025-11-27

## 拦截器概述

拦截器（Interceptor）是 Spring MVC 中的一种组件，它可以在请求处理前后进行拦截，用于实现日志记录、权限验证、性能监控等功能。拦截器是基于 Java 反射机制实现的，只对控制器请求起作用。

## 拦截器的工作原理

拦截器的工作原理是基于 AOP（面向切面编程）思想，它可以在以下三个时机进行拦截：

1. **请求处理前**：在控制器方法执行前拦截
2. **请求处理后**：在控制器方法执行后、视图渲染前拦截
3. **视图渲染后**：在视图渲染后拦截

## 拦截器的实现

### 1. 创建拦截器类

创建一个拦截器类，实现 HandlerInterceptor 接口：

```java
@Component
public class LoggingInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(LoggingInterceptor.class);

    // 请求处理前拦截
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        logger.info("请求开始: {} {}", request.getMethod(), request.getRequestURI());
        request.setAttribute("startTime", System.currentTimeMillis());
        return true; // 返回 true 表示继续执行，返回 false 表示中断执行
    }

    // 请求处理后拦截
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        logger.info("请求处理后: {} {}", request.getMethod(), request.getRequestURI());
    }

    // 视图渲染后拦截
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        long startTime = (long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        logger.info("请求结束: {} {}，耗时: {}ms", request.getMethod(), request.getRequestURI(), (endTime - startTime));
    }
}
```

### 2. 注册拦截器

创建一个配置类，实现 WebMvcConfigurer 接口，并重写 addInterceptors 方法来注册拦截器：

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private LoggingInterceptor loggingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册拦截器
        registry.addInterceptor(loggingInterceptor)
                // 拦截所有请求
                .addPathPatterns("/**")
                // 排除某些请求
                .excludePathPatterns("/static/**", "/error");
    }
}
```

## 拦截器的使用场景

### 1. 日志记录

记录请求的详细信息，包括请求方法、请求 URI、请求参数、响应状态码、处理时间等。

### 2. 权限验证

在请求处理前验证用户是否有权限访问该资源：

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 从请求中获取用户信息
        User user = (User) request.getSession().getAttribute("user");
        if (user == null) {
            // 未登录，重定向到登录页面
            response.sendRedirect("/login");
            return false;
        }
        // 已登录，继续执行
        return true;
    }
}
```

### 3. 性能监控

监控请求的处理时间，用于分析系统性能：

```java
@Component
public class PerformanceInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        long startTime = (long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        long elapsedTime = endTime - startTime;
        
        // 如果处理时间超过 500ms，记录警告日志
        if (elapsedTime > 500) {
            logger.warn("请求处理时间过长: {} {}，耗时: {}ms", request.getMethod(), request.getRequestURI(), elapsedTime);
        }
    }
}
```

### 4. 跨域处理

处理跨域请求：

```java
@Component
public class CorsInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 设置允许跨域的域名
        response.setHeader("Access-Control-Allow-Origin", "*");
        // 设置允许的请求方法
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        // 设置允许的请求头
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        // 设置是否允许携带凭证
        response.setHeader("Access-Control-Allow-Credentials", "true");
        
        // 处理 OPTIONS 请求
        if (request.getMethod().equals("OPTIONS")) {
            response.setStatus(HttpServletResponse.SC_OK);
            return false;
        }
        
        return true;
    }
}
```

## 多个拦截器的执行顺序

当存在多个拦截器时，它们的执行顺序取决于注册顺序。可以通过 Order 注解或 Ordered 接口来指定执行顺序：

### 1. 使用 Order 注解

```java
@Component
@Order(1) // 数字越小，执行顺序越靠前
public class FirstInterceptor implements HandlerInterceptor {
    // ...
}

@Component
@Order(2)
public class SecondInterceptor implements HandlerInterceptor {
    // ...
}
```

### 2. 实现 Ordered 接口

```java
@Component
public class FirstInterceptor implements HandlerInterceptor, Ordered {
    // ...
    @Override
    public int getOrder() {
        return 1; // 数字越小，执行顺序越靠前
    }
}

@Component
public class SecondInterceptor implements HandlerInterceptor, Ordered {
    // ...
    @Override
    public int getOrder() {
        return 2;
    }
}
```

### 多个拦截器的执行流程

当存在多个拦截器时，它们的执行流程如下：

1. 第一个拦截器的 preHandle 方法
2. 第二个拦截器的 preHandle 方法
3. 控制器方法执行
4. 第二个拦截器的 postHandle 方法
5. 第一个拦截器的 postHandle 方法
6. 视图渲染
7. 第二个拦截器的 afterCompletion 方法
8. 第一个拦截器的 afterCompletion 方法

## 拦截器与过滤器的区别

| 特性 | 拦截器（Interceptor） | 过滤器（Filter） |
|------|----------------------|------------------|
| 实现方式 | 基于 Java 反射机制 | 基于 Servlet API |
| 适用范围 | 只对控制器请求起作用 | 对所有请求起作用 |
| 拦截时机 | 三个时机（请求前、请求后、视图渲染后） | 两个时机（请求前、响应后） |
| 注入 Bean | 可以注入 Spring Bean | 不能直接注入 Spring Bean |
| 执行顺序 | 可以通过 Order 注解或 Ordered 接口指定 | 取决于 web.xml 中的配置顺序 |

## 总结

拦截器是 Spring MVC 中的一种重要组件，它可以在请求处理前后进行拦截，用于实现日志记录、权限验证、性能监控等功能。拦截器的实现比较简单，只需要创建拦截器类并注册即可。

在实际项目中，拦截器可以帮助我们实现很多通用功能，提高代码的复用性和可维护性。合理使用拦截器可以使我们的应用程序更加健壮和安全。