# Spring Boot 数据校验

发布于：2025-11-27

## 数据校验概述

数据校验是Web应用中的重要环节，它可以确保用户输入的数据符合预期格式和规则，防止无效数据进入系统。Spring Boot 提供了强大的数据校验支持，基于 JSR-303/JSR-380 规范，可以通过注解轻松实现数据校验。

## JSR-303/JSR-380 规范

JSR-303 是 Java  EE 6 中的一项规范，定义了 Bean Validation API，用于对 Java Bean 进行验证。JSR-380 是 JSR-303 的升级版，定义了 Bean Validation 2.0 API，增加了一些新的注解和功能。

常用的校验注解包括：

- **@NotNull**：不能为 null
- **@NotEmpty**：不能为 null 且长度大于 0
- **@NotBlank**：不能为 null 且不能只包含空白字符
- **@Size**：字符串长度或集合大小在指定范围内
- **@Min**：数值最小值
- **@Max**：数值最大值
- **@DecimalMin**：十进制数值最小值
- **@DecimalMax**：十进制数值最大值
- **@Digits**：数值的整数位数和小数位数在指定范围内
- **@Email**：邮箱格式
- **@Pattern**：正则表达式匹配
- **@Past**：日期必须是过去的时间
- **@Future**：日期必须是将来的时间

## 实现数据校验

### 1. 添加依赖

在 pom.xml 文件中添加数据校验依赖（通常已包含在 spring-boot-starter-web 中）：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

如果需要使用 Hibernate Validator（JSR-303/JSR-380 的参考实现），可以添加以下依赖：

```xml
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
</dependency>
```

### 2. 创建实体类

创建一个实体类，使用校验注解标记需要校验的字段：

```java
public class User {

    @NotNull(message = "ID 不能为空")
    private Long id;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名长度必须在 2-20 个字符之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度不能少于 6 个字符")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @Min(value = 18, message = "年龄不能小于 18 岁")
    @Max(value = 100, message = "年龄不能大于 100 岁")
    private Integer age;

    @Past(message = "生日必须是过去的时间")
    private LocalDate birthday;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    // getter 和 setter
    // ...
}
```

### 3. 在控制器中使用

在控制器方法中使用 @Valid 或 @Validated 注解来触发数据校验：

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping
    public ResponseEntity<String> createUser(@Valid @RequestBody User user) {
        // 业务逻辑
        return ResponseEntity.ok("用户创建成功");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        // 业务逻辑
        return ResponseEntity.ok("用户更新成功");
    }
}
```

### 4. 处理校验结果

当数据校验失败时，Spring Boot 会抛出 MethodArgumentNotValidException 异常，我们可以通过全局异常处理器来处理该异常，返回友好的错误信息：

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        // 获取所有校验错误
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            // 获取字段名
            String fieldName = ((FieldError) error).getField();
            // 获取错误信息
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return ResponseEntity.badRequest().body(errors);
    }
}
```

### 5. 使用 @Validated 注解

@Validated 是 Spring 提供的注解，它是 @Valid 的扩展，可以支持分组校验和方法级别的校验。

#### 5.1 分组校验

创建分组接口：

```java
public interface CreateGroup {}

public interface UpdateGroup {}
```

在实体类中指定字段的校验分组：

```java
public class User {

    @NotNull(message = "ID 不能为空", groups = UpdateGroup.class)
    private Long id;

    @NotBlank(message = "用户名不能为空", groups = {CreateGroup.class, UpdateGroup.class})
    @Size(min = 2, max = 20, message = "用户名长度必须在 2-20 个字符之间", groups = {CreateGroup.class, UpdateGroup.class})
    private String username;

    @NotBlank(message = "密码不能为空", groups = CreateGroup.class)
    @Size(min = 6, message = "密码长度不能少于 6 个字符", groups = CreateGroup.class)
    private String password;

    // getter 和 setter
    // ...
}
```

在控制器中指定校验分组：

```java
@RestController
@RequestMapping("/users")
@Validated // 启用方法级别的校验
public class UserController {

    @PostMapping
    public ResponseEntity<String> createUser(@Validated(CreateGroup.class) @RequestBody User user) {
        // 业务逻辑
        return ResponseEntity.ok("用户创建成功");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @Validated(UpdateGroup.class) @RequestBody User user) {
        // 业务逻辑
        return ResponseEntity.ok("用户更新成功");
    }

    // 方法级别的校验
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@Validated @Min(value = 1, message = "ID 必须大于 0") @PathVariable Long id) {
        // 业务逻辑
        return ResponseEntity.ok(new User());
    }
}
```

## 自定义校验注解

如果内置的校验注解不能满足需求，我们可以创建自定义校验注解。

### 1. 创建自定义校验注解

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = {GenderValidator.class}) // 指定校验器
public @interface Gender {
    // 错误信息
    String message() default "性别必须是男或女";

    // 分组
    Class<?>[] groups() default {};

    // 负载
    Class<? extends Payload>[] payload() default {};

    // 可选值
    String[] value() default {"男", "女"};
}
```

### 2. 创建校验器

```java
public class GenderValidator implements ConstraintValidator<Gender, String> {

    private String[] values;

    // 初始化方法
    @Override
    public void initialize(Gender constraintAnnotation) {
        this.values = constraintAnnotation.value();
    }

    // 校验方法
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // 如果值为 null，返回 true（可以配合 @NotNull 注解使用）
        if (value == null) {
            return true;
        }

        // 检查值是否在可选值列表中
        for (String v : values) {
            if (v.equals(value)) {
                return true;
            }
        }

        return false;
    }
}
```

### 3. 使用自定义校验注解

```java
public class User {

    // ...

    @Gender(message = "性别必须是男或女")
    private String gender;

    // getter 和 setter
    // ...
}
```

## 总结

Spring Boot 提供了强大的数据校验支持，基于 JSR-303/JSR-380 规范，可以通过注解轻松实现数据校验。常用的校验注解包括 @NotNull、@NotEmpty、@NotBlank、@Size、@Min、@Max、@Email 等。

在实际项目中，我们可以使用 @Valid 或 @Validated 注解来触发数据校验，通过全局异常处理器来处理校验失败的情况。如果内置的校验注解不能满足需求，我们还可以创建自定义校验注解。

合理使用数据校验可以确保系统接收到的数据符合预期格式和规则，提高系统的可靠性和安全性。