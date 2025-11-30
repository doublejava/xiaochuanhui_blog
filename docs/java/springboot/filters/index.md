# Spring Boot 过滤器使用

发布于：2025-11-27

## 过滤器概述

过滤器（Filter）是 Java Servlet 规范中的一种组件，它可以在请求到达 Servlet 之前或响应离开 Servlet 之后进行拦截，用于实现日志记录、权限验证、字符编码转换、跨域处理等功能。过滤器是基于 Servlet API 实现的，对所有请求起作用。

## 过滤器的工作原理

过滤器的工作原理是基于责任链设计模式，它可以在以下两个时机进行拦截：

1. **请求前**：在请求到达 Servlet 之前拦截
2. **响应后**：在响应离开 Servlet 之后拦截

## 过滤器的实现

### 1. 创建过滤器类

创建一个过滤器类，实现 Filter 接口：

```java
@Component
public class LoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    // 初始化方法，过滤器创建时调用
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.info("LoggingFilter 初始化");
    }

    // 过滤方法，处理请求和响应
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 请求前处理
        logger.info("请求开始: {} {}", request.getMethod(), request.getRequestURI());
        long startTime = System.currentTimeMillis();

        // 继续执行过滤器链
        filterChain.doFilter(request, response);

        // 响应后处理
        long endTime = System.currentTimeMillis();
        logger.info("请求结束: {} {}，耗时: {}ms，状态码: {}", 
                request.getMethod(), request.getRequestURI(), (endTime - startTime), response.getStatus());
    }

    // 销毁方法，过滤器销毁时调用
    @Override
    public void destroy() {
        logger.info("LoggingFilter 销毁");
    }
}
```

### 2. 注册过滤器

在 Spring Boot 中，有两种方式可以注册过滤器：

#### 方式一：使用 @WebFilter 注解

在过滤器类上添加 @WebFilter 注解，并在启动类上添加 @ServletComponentScan 注解：

```java
@WebFilter(urlPatterns = "/*", filterName = "loggingFilter")
public class LoggingFilter implements Filter {
    // ...
}
```

在启动类上添加 @ServletComponentScan 注解：

```java
@SpringBootApplication
@ServletComponentScan
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

#### 方式二：使用 FilterRegistrationBean

在配置类中使用 FilterRegistrationBean 注册过滤器：

```java
@Configuration
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<LoggingFilter> loggingFilterRegistration() {
        FilterRegistrationBean<LoggingFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new LoggingFilter());
        registration.addUrlPatterns("/*"); // 拦截所有请求
        registration.setName("loggingFilter");
        registration.setOrder(1); // 执行顺序，数字越小，执行顺序越靠前
        return registration;
    }
}
```

## 过滤器的使用场景

### 1. 字符编码转换

统一设置请求和响应的字符编码：

```java
@Component
public class CharacterEncodingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 设置字符编码
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");

        // 继续执行过滤器链
        filterChain.doFilter(request, response);
    }
}
```

### 2. 权限验证

在请求到达 Servlet 之前验证用户是否有权限访问该资源：

```java
@Component
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 从请求中获取用户信息
        User user = (User) request.getSession().getAttribute("user");
        String requestURI = request.getRequestURI();

        // 排除登录和注册页面
        if (requestURI.startsWith("/login") || requestURI.startsWith("/register")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 验证用户是否登录
        if (user == null) {
            // 未登录，重定向到登录页面
            response.sendRedirect("/login");
            return;
        }

        // 已登录，继续执行过滤器链
        filterChain.doFilter(request, response);
    }
}
```

### 3. 跨域处理

处理跨域请求：

```java
@Component
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 设置允许跨域的域名
        response.setHeader("Access-Control-Allow-Origin", "*");
        // 设置允许的请求方法
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        // 设置允许的请求头
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        // 设置是否允许携带凭证
        response.setHeader("Access-Control-Allow-Credentials", "true");
        // 设置预检请求的缓存时间
        response.setHeader("Access-Control-Max-Age", "3600");

        // 处理 OPTIONS 请求
        if (request.getMethod().equals("OPTIONS")) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 继续执行过滤器链
        filterChain.doFilter(request, response);
    }
}
```

### 4. 防止 XSS 攻击

过滤请求中的恶意脚本：

```java
@Component
public class XssFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // 使用包装后的请求对象，过滤恶意脚本
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        XssHttpServletRequestWrapper xssRequest = new XssHttpServletRequestWrapper(request);

        // 继续执行过滤器链
        filterChain.doFilter(xssRequest, servletResponse);
    }

    // XSS 请求包装类
    private static class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

        public XssHttpServletRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            String value = super.getParameter(name);
            return value != null ? cleanXss(value) : null;
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values != null) {
                for (int i = 0; i < values.length; i++) {
                    values[i] = cleanXss(values[i]);
                }
            }
            return values;
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            Map<String, String[]> parameterMap = super.getParameterMap();
            Map<String, String[]> cleanMap = new LinkedHashMap<>();
            for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
                String[] values = entry.getValue();
                for (int i = 0; i < values.length; i++) {
                    values[i] = cleanXss(values[i]);
                }
                cleanMap.put(entry.getKey(), values);
            }
            return cleanMap;
        }

        @Override
        public String getHeader(String name) {
            String value = super.getHeader(name);
            return value != null ? cleanXss(value) : null;
        }

        // 过滤恶意脚本
        private String cleanXss(String value) {
            // 使用正则表达式过滤恶意脚本
            value = value.replaceAll("<script.*?>.*?</script>", "");
            value = value.replaceAll("<.*?>", "");
            value = value.replaceAll("javascript:", "");
            value = value.replaceAll("onload=", "");
            return value;
        }
    }
}
```

## 多个过滤器的执行顺序

当存在多个过滤器时，它们的执行顺序取决于注册顺序。可以通过以下方式指定执行顺序：

1. **使用 @Order 注解**：在过滤器类上添加 @Order 注解，数字越小，执行顺序越靠前
2. **使用 FilterRegistrationBean 的 setOrder 方法**：设置数字越小，执行顺序越靠前
3. **使用 @WebFilter 注解**：执行顺序取决于类名的字典顺序

## 过滤器与拦截器的区别

| 特性 | 过滤器（Filter） | 拦截器（Interceptor） |
|------|------------------|----------------------|
| 实现方式 | 基于 Servlet API | 基于 Java 反射机制 |
| 适用范围 | 对所有请求起作用 | 只对控制器请求起作用 |
| 拦截时机 | 两个时机（请求前、响应后） | 三个时机（请求前、请求后、视图渲染后） |
| 注入 Bean | 不能直接注入 Spring Bean | 可以注入 Spring Bean |
| 执行顺序 | 可以通过 Order 注解或 FilterRegistrationBean 指定 | 可以通过 Order 注解或 Ordered 接口指定 |
| 配置方式 | 使用 @WebFilter 或 FilterRegistrationBean | 实现 HandlerInterceptor 接口并注册 |

## 总结

过滤器是 Java Servlet 规范中的一种重要组件，它可以在请求到达 Servlet 之前或响应离开 Servlet 之后进行拦截，用于实现日志记录、权限验证、字符编码转换、跨域处理等功能。过滤器的实现比较简单，只需要创建过滤器类并注册即可。

在实际项目中，过滤器可以帮助我们实现很多通用功能，提高代码的复用性和可维护性。合理使用过滤器可以使我们的应用程序更加健壮和安全。