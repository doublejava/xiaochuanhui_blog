# Spring Boot API 版本控制

发布于：2025-11-27

## 什么是 API 版本控制

API 版本控制是指在 API 演进过程中，通过不同的版本标识来区分不同阶段的 API，确保旧版本 API 仍然可用，同时支持新版本 API 的发布。API 版本控制是 API 设计中的重要环节，它可以帮助开发者平滑过渡到新版本，同时保证向后兼容性。

## API 版本控制的必要性

1. **向后兼容性**：确保旧版本客户端仍然可以正常使用
2. **平滑升级**：允许客户端逐步迁移到新版本
3. **功能隔离**：不同版本的 API 可以有不同的功能和行为
4. **错误修复**：可以针对特定版本修复问题，而不影响其他版本
5. **API 演进**：支持 API 的持续改进和演进

## API 版本控制方案

### 1. URL 路径版本控制

**原理**：
在 URL 路径中添加版本号，如 `/api/v1/users`、`/api/v2/users`。

**代码示例**：

```java
// v1 版本控制器
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {

    @GetMapping
    public ResponseEntity<List<User>> getUsers() {
        // v1 版本的实现
        List<User> users = new ArrayList<>();
        // ...
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        // v1 版本的实现
        User user = new User();
        // ...
        return ResponseEntity.ok(user);
    }
}

// v2 版本控制器
@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {

    @GetMapping
    public ResponseEntity<List<UserDto>> getUsers() {
        // v2 版本的实现，返回 DTO 对象
        List<UserDto> userDtos = new ArrayList<>();
        // ...
        return ResponseEntity.ok(userDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        // v2 版本的实现，返回 DTO 对象
        UserDto userDto = new UserDto();
        // ...
        return ResponseEntity.ok(userDto);
    }
}
```

### 2. 请求头版本控制

**原理**：
在请求头中添加版本信息，如 `Accept-Version: v1` 或 `X-Api-Version: v2`。

**代码示例**：

```java
// 自定义版本注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ApiVersion {
    String value() default "v1";
}

// 版本拦截器
@Component
public class ApiVersionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 获取请求头中的版本信息
        String version = request.getHeader("X-Api-Version");
        if (version != null) {
            // 将版本信息存储到请求属性中
            request.setAttribute("apiVersion", version);
        } else {
            // 默认使用 v1 版本
            request.setAttribute("apiVersion", "v1");
        }
        return true;
    }
}

// 版本路由配置
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private ApiVersionInterceptor apiVersionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiVersionInterceptor);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 版本路由映射
        registry.addViewController("/api/users").setViewName("forward:/api/v1/users");
    }
}

// 统一控制器，根据版本处理请求
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public ResponseEntity<?> getUsers(HttpServletRequest request) {
        String version = (String) request.getAttribute("apiVersion");
        if ("v1".equals(version)) {
            // v1 版本的实现
            List<User> users = new ArrayList<>();
            // ...
            return ResponseEntity.ok(users);
        } else if ("v2".equals(version)) {
            // v2 版本的实现
            List<UserDto> userDtos = new ArrayList<>();
            // ...
            return ResponseEntity.ok(userDtos);
        }
        return ResponseEntity.badRequest().body("不支持的版本");
    }
}
```

### 3. 请求参数版本控制

**原理**：
在请求参数中添加版本号，如 `/api/users?version=v1`。

**代码示例**：

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public ResponseEntity<?> getUsers(@RequestParam(defaultValue = "v1") String version) {
        if ("v1".equals(version)) {
            // v1 版本的实现
            List<User> users = new ArrayList<>();
            // ...
            return ResponseEntity.ok(users);
        } else if ("v2".equals(version)) {
            // v2 版本的实现
            List<UserDto> userDtos = new ArrayList<>();
            // ...
            return ResponseEntity.ok(userDtos);
        }
        return ResponseEntity.badRequest().body("不支持的版本");
    }
}
```

### 4. 媒体类型版本控制

**原理**：
在 `Accept` 请求头中添加版本信息，如 `Accept: application/vnd.example.v1+json`。

**代码示例**：

```java
// 配置内容协商
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
                .favorParameter(false)
                .favorPathExtension(false)
                .parameterName("version")
                .ignoreAcceptHeader(false)
                .useRegisteredExtensionsOnly(false)
                .defaultContentType(MediaType.APPLICATION_JSON)
                .mediaType("v1", MediaType.valueOf("application/vnd.example.v1+json"))
                .mediaType("v2", MediaType.valueOf("application/vnd.example.v2+json"));
    }
}

// v1 版本控制器
@RestController
@RequestMapping("/api/users")
public class UserControllerV1 {

    @GetMapping(produces = "application/vnd.example.v1+json")
    public ResponseEntity<List<User>> getUsers() {
        // v1 版本的实现
        List<User> users = new ArrayList<>();
        // ...
        return ResponseEntity.ok(users);
    }
}

// v2 版本控制器
@RestController
@RequestMapping("/api/users")
public class UserControllerV2 {

    @GetMapping(produces = "application/vnd.example.v2+json")
    public ResponseEntity<List<UserDto>> getUsers() {
        // v2 版本的实现
        List<UserDto> userDtos = new ArrayList<>();
        // ...
        return ResponseEntity.ok(userDtos);
    }
}
```

### 5. 基于包路径的版本控制

**原理**：
根据包路径来区分不同版本的 API，如 `com.example.controller.v1`、`com.example.controller.v2`。

**代码示例**：

```java
// 配置类
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // 配置 API 路径前缀
        configurer.addPathPrefix("/api", c -> {
            // 根据包路径添加版本前缀
            String packageName = c.getDeclaringClass().getPackage().getName();
            if (packageName.contains(".v1.")) {
                return true;
            }
            return false;
        });
    }
}

// v1 版本控制器，包路径：com.example.controller.v1
@RestController
@RequestMapping("/users")
public class UserControllerV1 {
    // ...
}

// v2 版本控制器，包路径：com.example.controller.v2
@RestController
@RequestMapping("/users")
public class UserControllerV2 {
    // ...
}
```

## API 版本控制最佳实践

1. **保持简单**：选择一种简单直观的版本控制方案
2. **向后兼容**：尽量保持新版本对旧版本的兼容
3. **清晰的版本策略**：制定清晰的版本发布和废弃策略
4. **文档化**：为每个版本的 API 提供详细的文档
5. **版本号管理**：使用语义化版本号（如 v1.0.0）
6. **逐步废弃**：旧版本 API 应该有明确的废弃计划
7. **监控和分析**：监控不同版本 API 的使用情况

## 总结

API 版本控制是 API 设计中的重要环节，它可以帮助开发者平滑过渡到新版本，同时保证向后兼容性。本文介绍了 5 种常用的 API 版本控制方案：

1. **URL 路径版本控制**：在 URL 路径中添加版本号
2. **请求头版本控制**：在请求头中添加版本信息
3. **请求参数版本控制**：在请求参数中添加版本号
4. **媒体类型版本控制**：在 Accept 请求头中添加版本信息
5. **基于包路径的版本控制**：根据包路径区分不同版本

在实际项目中，需要根据具体业务场景选择合适的版本控制方案。例如：
- 对于 RESTful API，推荐使用 URL 路径版本控制或媒体类型版本控制
- 对于需要频繁更新的 API，推荐使用请求头版本控制
- 对于简单的 API，可以使用请求参数版本控制

合理的 API 版本控制策略可以提高 API 的可用性和可维护性，支持 API 的持续演进。