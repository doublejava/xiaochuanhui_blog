# JFinal Validator

JFinal Validator（验证器）是 JFinal 框架中的重要组件，用于验证请求参数的合法性，确保数据的完整性和正确性。

## 验证器的定义

验证器需要继承 `Validator` 类，并重写相关方法：

```java
public class UserValidator extends Validator {
    @Override
    protected void validate(Controller c) {
        // 验证规则
        validateRequiredString("name", "nameMsg", "用户名不能为空");
        validateEmail("email", "emailMsg", "邮箱格式不正确");
        validateInteger("age", 1, 150, "ageMsg", "年龄必须在1-150之间");
        validateRequiredString("password", "passwordMsg", "密码不能为空");
        validateEqualField("password", "confirmPassword", "confirmPasswordMsg", "两次输入的密码不一致");
    }
    
    @Override
    protected void handleError(Controller c) {
        // 验证失败后的处理
        c.keepPara(); // 保留提交的参数
        c.render("add.html"); // 渲染添加页面
    }
}
```

## 验证器的配置

### 方法级别的验证器

在 Controller 方法上添加 `@Before` 注解，使用验证器：

```java
public class UserController extends Controller {
    @Before(UserValidator.class)
    public void save() {
        User user = getModel(User.class);
        user.save();
        redirect("/user/list");
    }
}
```

### 类级别的验证器

在 Controller 类上添加 `@Before` 注解，对该类的所有方法生效：

```java
@Before(UserValidator.class)
public class UserController extends Controller {
    // 所有方法都会被 UserValidator 验证
}
```

## 内置验证规则

JFinal 提供了丰富的内置验证规则：

### 必填项验证

```java
// 验证字符串必填
validateRequiredString("name", "nameMsg", "用户名不能为空");

// 验证整数必填
validateRequiredInteger("age", "ageMsg", "年龄不能为空");

// 验证长整型必填
validateRequiredLong("id", "idMsg", "ID不能为空");

// 验证双精度浮点型必填
validateRequiredDouble("salary", "salaryMsg", "薪资不能为空");
```

### 长度验证

```java
// 验证字符串长度范围
validateString("name", 2, 20, "nameMsg", "用户名长度必须在2-20之间");

// 验证字符串最小长度
validateMinLength("password", 6, "passwordMsg", "密码长度不能少于6位");

// 验证字符串最大长度
validateMaxLength("email", 50, "emailMsg", "邮箱长度不能超过50位");
```

### 数值范围验证

```java
// 验证整数范围
validateInteger("age", 1, 150, "ageMsg", "年龄必须在1-150之间");

// 验证长整型范围
validateLong("id", 1, 1000000, "idMsg", "ID必须在1-1000000之间");

// 验证双精度浮点型范围
validateDouble("salary", 0, 100000, "salaryMsg", "薪资必须在0-100000之间");

// 验证最小值
validateMin("age", 1, "ageMsg", "年龄不能小于1");

// 验证最大值
validateMax("age", 150, "ageMsg", "年龄不能大于150");
```

### 格式验证

```java
// 验证邮箱格式
validateEmail("email", "emailMsg", "邮箱格式不正确");

// 验证URL格式
validateUrl("website", "websiteMsg", "网站URL格式不正确");

// 验证手机号格式
validateMobile("phone", "phoneMsg", "手机号格式不正确");

// 验证身份证号格式
validateIdCard("idCard", "idCardMsg", "身份证号格式不正确");

// 验证IP地址格式
validateIp("ip", "ipMsg", "IP地址格式不正确");

// 验证正则表达式
validateRegex("name", "^[a-zA-Z0-9_]+$", "nameMsg", "用户名只能包含字母、数字和下划线");
```

### 比较验证

```java
// 验证两个字段相等
validateEqualField("password", "confirmPassword", "confirmPasswordMsg", "两次输入的密码不一致");

// 验证两个字段不相等
validateNotEqualField("oldPassword", "newPassword", "newPasswordMsg", "新密码不能与旧密码相同");

// 验证字段大于指定值
validateGreaterThan("age", "18", "ageMsg", "年龄必须大于18岁");

// 验证字段小于指定值
validateLessThan("age", "60", "ageMsg", "年龄必须小于60岁");
```

### 日期验证

```java
// 验证日期格式
validateDate("birthday", "yyyy-MM-dd", "birthdayMsg", "生日格式不正确，应为yyyy-MM-dd");

// 验证日期范围
validateDateRange("startDate", "endDate", "dateRangeMsg", "开始日期不能晚于结束日期");
```

### 自定义验证

```java
// 自定义验证规则
validate("name", "nameMsg", "用户名已存在", new IValidator() {
    @Override
    public boolean validate(Controller c, String field) {
        String name = c.getPara(field);
        return User.dao.findFirst("select * from user where name = ?", name) == null;
    }
});
```

## 验证器的高级用法

### 条件验证

```java
@Override
protected void validate(Controller c) {
    String userType = c.getPara("userType");
    if ("admin".equals(userType)) {
        // 只有管理员需要验证权限字段
        validateRequiredString("permission", "permissionMsg", "权限不能为空");
    }
    
    // 其他验证规则
    validateRequiredString("name", "nameMsg", "用户名不能为空");
    validateEmail("email", "emailMsg", "邮箱格式不正确");
}
```

### 多场景验证

```java
public class UserValidator extends Validator {
    @Override
    protected void validate(Controller c) {
        String action = c.getPara("action");
        
        if ("add".equals(action)) {
            // 添加场景的验证规则
            validateRequiredString("name", "nameMsg", "用户名不能为空");
            validateRequiredString("password", "passwordMsg", "密码不能为空");
        } else if ("update".equals(action)) {
            // 更新场景的验证规则
            validateRequiredString("name", "nameMsg", "用户名不能为空");
            // 更新场景不需要验证密码
        }
    }
    
    @Override
    protected void handleError(Controller c) {
        c.keepPara();
        c.render("form.html");
    }
}
```

### AJAX 验证

```java
public class AjaxValidator extends Validator {
    @Override
    protected void validate(Controller c) {
        validateRequiredString("name", "nameMsg", "用户名不能为空");
        validateEmail("email", "emailMsg", "邮箱格式不正确");
    }
    
    @Override
    protected void handleError(Controller c) {
        // AJAX 验证失败，返回 JSON 格式的错误信息
        Map<String, Object> result = new HashMap<>();
        result.put("success", false);
        result.put("errors", c.getAttrs());
        c.renderJson(result);
    }
}
```

### 验证结果处理

```java
@Override
protected void handleError(Controller c) {
    // 方式1：渲染错误页面
    c.render("error.html");
    
    // 方式2：重定向到错误页面
    c.redirect("/error");
    
    // 方式3：返回 JSON 格式的错误信息
    c.renderJson("error", "验证失败");
    
    // 方式4：保留提交的参数，渲染原页面
    c.keepPara();
    c.render("add.html");
    
    // 方式5：保留指定的参数
    c.keepPara("name", "email", "age");
    c.render("add.html");
}
```

## 自定义验证器

### 继承 Validator 类

```java
public class CustomValidator extends Validator {
    @Override
    protected void validate(Controller c) {
        // 自定义验证逻辑
        String name = c.getPara("name");
        if (name != null && name.contains("admin")) {
            addError("nameMsg", "用户名不能包含'admin'关键字");
        }
        
        // 调用父类的验证方法
        super.validate(c);
    }
    
    @Override
    protected void handleError(Controller c) {
        c.keepPara();
        c.render("add.html");
    }
}
```

### 实现 IValidator 接口

```java
public class CustomIValidator implements IValidator {
    @Override
    public boolean validate(Controller c, String field) {
        String value = c.getPara(field);
        // 自定义验证逻辑
        return value != null && value.matches("^[a-zA-Z0-9_]+$");
    }
}

// 使用自定义 IValidator
validate("username", "usernameMsg", "用户名只能包含字母、数字和下划线", new CustomIValidator());
```

## 验证器的最佳实践

1. **验证规则全面**：确保所有必填字段和重要字段都有验证规则
2. **错误信息友好**：错误信息应该清晰、明确，便于用户理解
3. **验证逻辑集中**：将验证逻辑集中到验证器中，保持 Controller 简洁
4. **使用 AJAX 验证**：对于表单提交，建议使用 AJAX 进行实时验证，提高用户体验
5. **保留提交参数**：验证失败时，保留用户提交的参数，避免用户重新输入
6. **合理使用条件验证**：根据不同场景使用不同的验证规则
7. **避免过度验证**：只验证必要的字段，避免影响性能
8. **测试验证规则**：确保所有验证规则都能正确工作

## 总结

JFinal Validator 是一个功能强大、使用简单的验证框架，具有以下优点：

- **API 简洁**：提供了丰富的内置验证规则，使用简单
- **配置灵活**：支持方法级别和类级别的验证器配置
- **扩展性强**：支持自定义验证规则和验证器
- **错误处理友好**：提供了多种错误处理方式
- **与框架深度集成**：与 JFinal MVC 框架深度集成，使用方便

JFinal Validator 适用于各种 Web 应用的表单验证场景，可以确保数据的完整性和正确性，提高应用的安全性和可靠性。