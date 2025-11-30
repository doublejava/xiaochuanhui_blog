# JFinal MVC 架构

JFinal 采用经典的 MVC（Model-View-Controller）架构设计，具有清晰的分层结构和简洁的 API 设计。

## MVC 核心组件

### Controller

Controller 是 JFinal MVC 架构中的核心组件之一，负责处理 HTTP 请求、调用业务逻辑、返回响应结果。

```java
public class IndexController extends Controller {
    public void index() {
        renderText("Hello JFinal!");
    }
    
    public void getUser() {
        Integer id = getInt("id");
        User user = User.dao.findById(id);
        renderJson(user);
    }
    
    public void saveUser() {
        User user = getModel(User.class);
        user.save();
        renderJson("success", true);
    }
}
```

### Model

Model 对应数据库中的表，负责数据的存取操作。JFinal 的 Model 采用 ActiveRecord 设计模式，无需编写 XML 配置文件。

```java
public class User extends Model<User> {
    public static final User dao = new User().dao();
}
```

### View

View 负责页面渲染，JFinal 支持多种模板引擎，包括内置的 Enjoy 模板引擎、JSP、Freemarker 等。

```html
<!DOCTYPE html>
<html>
<head>
    <title>User List</title>
</head>
<body>
    <h1>User List</h1>
    <table>
        #for(user : userList)
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
        </tr>
        #end
    </table>
</body>
</html>
```

## 路由配置

JFinal 通过 Routes 配置类来管理 URL 路由，将请求映射到对应的 Controller 方法。

```java
public class DemoConfig extends JFinalConfig {
    public void configRoute(Routes me) {
        // 基础路由
        me.add("/", IndexController.class);
        
        // 带视图前缀的路由
        me.add("/user", UserController.class, "/view/user");
        
        // 路由分组
        me.add(new AdminRoutes());
    }
}

// 路由分组
public class AdminRoutes extends Routes {
    public void config() {
        setBaseViewPath("/view/admin");
        add("/admin", AdminController.class);
        add("/admin/user", AdminUserController.class);
    }
}
```

## 请求处理

### 请求参数获取

JFinal 提供了丰富的方法来获取请求参数：

```java
// 获取基本类型参数
String name = getPara("name");
Integer age = getInt("age");
Double salary = getDouble("salary");
Boolean active = getBoolean("active");

// 获取数组类型参数
String[] hobbies = getParaValues("hobbies");

// 获取文件上传
UploadFile file = getFile();

// 获取 JSON 请求体
String json = getRawData();

// 获取 Model 对象
User user = getModel(User.class);
User user = getModel(User.class, "user");

// 获取 Bean 对象
User user = getBean(User.class);
```

### 响应渲染

JFinal 支持多种响应渲染方式：

```java
// 渲染文本
renderText("Hello JFinal!");

// 渲染 HTML
renderHtml("<h1>Hello JFinal!</h1>");

// 渲染 JSON
renderJson(user);
renderJson("success", true);
renderJson("data", userList);

// 渲染视图
render("index.html");
renderTemplate("index.html");

// 渲染文件
renderFile("test.txt");

// 重定向
redirect("/user/list");

// 转发
forwardAction("/user/list");
```

## 视图渲染

### Enjoy 模板引擎

JFinal 内置了 Enjoy 模板引擎，具有高性能、语法简洁等特点：

```html
#extend("_layout.html")

#block("content")
    <h1>User List</h1>
    <table>
        #for(user : userList)
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>
                <a href="/user/edit?id=${user.id}">编辑</a>
                <a href="/user/delete?id=${user.id}">删除</a>
            </td>
        </tr>
        #end
    </table>
#end
```

### 模板布局

JFinal 支持模板布局功能，提高代码复用性：

```html
<!-- _layout.html -->
<!DOCTYPE html>
<html>
<head>
    <title>#(title ?: "JFinal Demo")</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <h1>JFinal Demo</h1>
    </header>
    
    <nav>
        <ul>
            <li><a href="/">首页</a></li>
            <li><a href="/user/list">用户列表</a></li>
        </ul>
    </nav>
    
    <main>
        #block("content")
        #end
    </main>
    
    <footer>
        <p>© 2025 JFinal Demo</p>
    </footer>
</body>
</html>
```

## MVC 工作流程

1. **请求接收**：Web 服务器接收客户端请求
2. **路由匹配**：JFinal 根据请求 URL 匹配对应的 Controller 和方法
3. **参数解析**：JFinal 自动解析请求参数并注入到 Controller 方法中
4. **业务处理**：Controller 调用业务逻辑处理请求
5. **视图渲染**：Controller 调用渲染方法生成响应内容
6. **响应返回**：Web 服务器将响应结果返回给客户端

## 最佳实践

1. **合理划分 Controller**：根据业务模块划分不同的 Controller
2. **保持 Controller 简洁**：Controller 只负责请求处理和响应渲染，复杂业务逻辑应封装到 Service 层
3. **使用路由分组**：对于大型项目，使用路由分组管理不同模块的路由
4. **统一响应格式**：定义统一的 JSON 响应格式，便于前端处理
5. **合理使用模板引擎**：根据项目需求选择合适的模板引擎

## 总结

JFinal 的 MVC 架构设计简洁高效，具有以下优点：

- **API 简洁**：Controller 方法直接对应 URL，无需复杂配置
- **开发高效**：内置多种参数获取和响应渲染方法
- **易于扩展**：支持自定义渲染器、拦截器等组件
- **性能优异**：采用轻量级设计，无反射、无 XML 解析

JFinal 的 MVC 架构非常适合快速开发 Web 应用，同时也能满足大型项目的需求。