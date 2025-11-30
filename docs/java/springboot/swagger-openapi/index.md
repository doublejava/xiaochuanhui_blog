# Spring Boot Swagger/OpenAPI 集成

发布于：2025-11-27

## 什么是 Swagger/OpenAPI

Swagger 是一个用于设计、构建、文档化和使用 RESTful API 的开源框架。OpenAPI 是 Swagger 规范的正式名称，它定义了 RESTful API 的描述格式。通过 Swagger/OpenAPI，开发者可以自动生成 API 文档，方便前端和后端开发者协作，同时也可以用于 API 测试和客户端代码生成。

## Swagger/OpenAPI 的优势

1. **自动生成文档**：根据代码自动生成 API 文档，减少手动编写文档的工作量
2. **交互式 API 测试**：提供交互式的 API 测试界面，方便开发者测试 API
3. **客户端代码生成**：可以根据 API 文档自动生成各种语言的客户端代码
4. **标准化 API 描述**：使用标准化的格式描述 API，提高 API 的可读性和可维护性
5. **团队协作**：方便前端和后端开发者协作，减少沟通成本

## Swagger/OpenAPI 集成方案

### 1. Springdoc OpenAPI

Springdoc OpenAPI 是 Spring Boot 3.x 推荐的 Swagger/OpenAPI 集成方案，它基于 OpenAPI 3.0 规范。

**代码示例**：

```xml
<!-- 添加依赖 -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

```java
// 配置类
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API 文档")
                        .version("1.0.0")
                        .description("这是一个基于 Spring Boot 的 API 文档")
                        .contact(new Contact()
                                .name("开发者")
                                .email("developer@example.com")
                                .url("https://example.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
```

```java
// 控制器示例
@RestController
@RequestMapping("/api/users")
@Tag(name = "用户管理", description = "用户相关的 API 接口")
public class UserController {

    @GetMapping
    @Operation(summary = "获取用户列表", description = "获取所有用户的列表")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功获取用户列表",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = User.class)))),
            @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = new ArrayList<>();
        // ...
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据 ID 获取用户", description = "根据用户 ID 获取用户详情")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "成功获取用户详情",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "404", description = "用户不存在"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = new User();
        // ...
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @Operation(summary = "创建用户", description = "创建一个新用户")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "成功创建用户",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = User.class))),
            @ApiResponse(responseCode = "400", description = "请求参数错误"),
            @ApiResponse(responseCode = "500", description = "服务器内部错误")
    })
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        // ...
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
```

```java
// 实体类示例
@Schema(name = "用户", description = "用户实体类")
public class User {
    @Schema(description = "用户 ID", example = "1")
    private Long id;
    
    @Schema(description = "用户名", example = "admin", required = true)
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    @Schema(description = "密码", example = "123456", required = true)
    @NotBlank(message = "密码不能为空")
    private String password;
    
    @Schema(description = "邮箱", example = "admin@example.com")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Schema(description = "创建时间", example = "2025-11-27T15:00:00")
    private LocalDateTime createTime;
    
    // getter 和 setter
}
```

### 2. Springfox Swagger 2

Springfox Swagger 2 是 Spring Boot 2.x 常用的 Swagger 集成方案，它基于 Swagger 2.0 规范。

**代码示例**：

```xml
<!-- 添加依赖 -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
    <version>3.0.0</version>
</dependency>
```

```java
// 配置类
@Configuration
@EnableOpenApi
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.OAS_30)
                .apiInfo(apiInfo())
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
                .paths(PathSelectors.any())
                .build();
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("API 文档")
                .version("1.0.0")
                .description("这是一个基于 Spring Boot 的 API 文档")
                .contact(new Contact("开发者", "https://example.com", "developer@example.com"))
                .license("MIT License")
                .licenseUrl("https://opensource.org/licenses/MIT")
                .build();
    }
}
```

```java
// 控制器示例
@RestController
@RequestMapping("/api/users")
@Api(tags = "用户管理", description = "用户相关的 API 接口")
public class UserController {

    @GetMapping
    @ApiOperation(value = "获取用户列表", notes = "获取所有用户的列表")
    @ApiResponses({
            @ApiResponse(code = 200, message = "成功获取用户列表", response = User.class, responseContainer = "List"),
            @ApiResponse(code = 500, message = "服务器内部错误")
    })
    public ResponseEntity<List<User>> getUsers() {
        List<User> users = new ArrayList<>();
        // ...
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "根据 ID 获取用户", notes = "根据用户 ID 获取用户详情")
    @ApiResponses({
            @ApiResponse(code = 200, message = "成功获取用户详情", response = User.class),
            @ApiResponse(code = 404, message = "用户不存在"),
            @ApiResponse(code = 500, message = "服务器内部错误")
    })
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = new User();
        // ...
        return ResponseEntity.ok(user);
    }
}
```

### 3. 访问 Swagger UI

**Springdoc OpenAPI**：
- API 文档地址：`http://localhost:8080/swagger-ui.html`
- OpenAPI 描述文件：`http://localhost:8080/v3/api-docs`

**Springfox Swagger 2**：
- API 文档地址：`http://localhost:8080/swagger-ui/`
- Swagger 描述文件：`http://localhost:8080/v2/api-docs`

### 4. 配置 Swagger/OpenAPI

**代码示例**：

```yaml
# Springdoc OpenAPI 配置
springdoc:
  api-docs:
    path: /v3/api-docs
    enabled: true
  swagger-ui:
    path: /swagger-ui.html
    enabled: true
    operationsSorter: alpha
    tagsSorter: alpha
  group-configs:
    - group: public
      paths-to-match: /**
      packages-to-scan: com.example.controller

# Springfox Swagger 2 配置
springfox:
  documentation:
    swagger-ui:
      enabled: true
      path: /swagger-ui.html
    open-api:
      v3:
        path: /v3/api-docs
    swagger:
      v2:
        path: /v2/api-docs
```

## Swagger/OpenAPI 注解说明

### Springdoc OpenAPI 注解

- **@Tag**：用于描述控制器或 API 组
- **@Operation**：用于描述 API 操作
- **@ApiResponses**：用于描述 API 响应
- **@ApiResponse**：用于描述单个 API 响应
- **@Content**：用于描述响应内容
- **@Schema**：用于描述数据模型
- **@Parameter**：用于描述请求参数

### Springfox Swagger 2 注解

- **@Api**：用于描述控制器或 API 组
- **@ApiOperation**：用于描述 API 操作
- **@ApiResponses**：用于描述 API 响应
- **@ApiResponse**：用于描述单个 API 响应
- **@ApiModel**：用于描述数据模型
- **@ApiModelProperty**：用于描述数据模型的属性
- **@ApiParam**：用于描述请求参数

## Swagger/OpenAPI 最佳实践

1. **添加详细的描述**：为 API 操作、参数和响应添加详细的描述
2. **使用标准化的命名**：使用标准化的命名规范，提高 API 的可读性
3. **分组 API**：根据功能模块分组 API，方便用户查找
4. **版本控制**：为不同版本的 API 生成不同的文档
5. **生产环境关闭 Swagger UI**：在生产环境中关闭 Swagger UI，提高安全性
6. **使用 JSR-303/JSR-380 注解**：结合 JSR-303/JSR-380 注解，自动生成参数校验规则

## 总结

Swagger/OpenAPI 是一个强大的 API 文档生成工具，它可以帮助开发者自动生成 API 文档，方便前端和后端开发者协作，同时也可以用于 API 测试和客户端代码生成。本文介绍了两种常用的 Swagger/OpenAPI 集成方案：Springdoc OpenAPI 和 Springfox Swagger 2。

在实际项目中，需要根据 Spring Boot 版本选择合适的集成方案：
- Spring Boot 3.x 推荐使用 Springdoc OpenAPI
- Spring Boot 2.x 可以使用 Springfox Swagger 2 或 Springdoc OpenAPI

合理使用 Swagger/OpenAPI 可以提高 API 的可读性和可维护性，减少团队协作成本，提高开发效率。