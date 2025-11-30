# JFinal Template Engine

JFinal Template Engine（模板引擎）是 JFinal 框架中的重要组件，用于生成动态 HTML 页面。JFinal 内置了 Enjoy 模板引擎，同时也支持 JSP、Freemarker 等第三方模板引擎。

## Enjoy 模板引擎

Enjoy 是 JFinal 内置的模板引擎，具有高性能、语法简洁、功能强大等特点。

### 基本语法

#### 变量输出

```html
<!-- 输出变量 -->
<h1>${title}</h1>

<!-- 输出带默认值的变量 -->
<h2>${subtitle ?: '默认副标题'}</h2>

<!-- 输出 HTML 内容（不转义） -->
<div>#(content)</div>

<!-- 输出对象属性 -->
<p>${user.name}</p>
<p>${user.age}</p>

<!-- 输出集合元素 -->
<p>${list[0]}</p>
<p>${map['key']}</p>
```

#### 条件判断

```html
<!-- if 条件 -->
#if(user.age >= 18)
    <p>成年人</p>
#else
    <p>未成年人</p>
#end

<!-- if-elseif-else 条件 -->
#if(user.role == 'admin')
    <p>管理员</p>
#elseif(user.role == 'user')
    <p>普通用户</p>
#else
    <p>游客</p>
#end

<!-- 多重条件 -->
#if(user.age > 20 && user.gender == 'male')
    <p>成年男性</p>
#end
```

#### 循环遍历

```html
<!-- 遍历集合 -->
<ul>
    #for(item : list)
    <li>${item}</li>
    #end
</ul>

<!-- 遍历集合带索引 -->
<ul>
    #for(item : list; index)
    <li>${index + 1}. ${item}</li>
    #end
</ul>

<!-- 遍历 Map -->
<table>
    #for(key : map)
    <tr>
        <td>${key}</td>
        <td>${map[key]}</td>
    </tr>
    #end
</table>

<!-- 遍历数组 -->
<div>
    #for(item : array)
    <span>${item}</span>
    #end
</div>
```

#### 模板继承

```html
<!-- 定义父模板 _layout.html -->
<!DOCTYPE html>
<html>
<head>
    <title>#(title ?: '默认标题')</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header>
        <h1>网站标题</h1>
    </header>
    
    <nav>
        <ul>
            <li><a href="/">首页</a></li>
            <li><a href="/user/list">用户列表</a></li>
        </ul>
    </nav>
    
    <main>
        #block(content)
        <p>默认内容</p>
        #end
    </main>
    
    <footer>
        <p>© 2025 网站版权</p>
    </footer>
</body>
</html>

<!-- 继承父模板 -->
#extend("_layout.html")

#block(title)
    用户列表
#end

#block(content)
    <h2>用户列表</h2>
    <table>
        #for(user : userList)
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
        </tr>
        #end
    </table>
#end
```

#### 宏定义

```html
<!-- 定义宏 -->
#macro(userItem user)
    <div class="user-item">
        <h3>${user.name}</h3>
        <p>${user.email}</p>
    </div>
#end

<!-- 使用宏 -->
#for(user : userList)
    #userItem(user)
#end

<!-- 带参数默认值的宏 -->
#macro(button text, type="primary")
    <button class="btn btn-${type}">${text}</button>
#end

<!-- 使用带默认值的宏 -->
#button("提交")
#button("取消", "secondary")
```

#### 包含模板

```html
<!-- 包含其他模板 -->
#include("header.html")

<div class="content">
    <!-- 页面内容 -->
</div>

#include("footer.html")
```

#### 注释

```html
<!-- HTML 注释 -->

#-- Enjoy 模板注释 --#
```

## 模板引擎配置

### 基本配置

在 JFinalConfig 中配置模板引擎：

```java
public class DemoConfig extends JFinalConfig {
    @Override
    public void configEngine(Engine engine) {
        // 设置模板文件编码
        engine.setEncoding("UTF-8");
        
        // 设置模板文件后缀
        engine.setViewExtension(".html");
        
        // 设置模板基础路径
        engine.setBaseTemplatePath("/view");
        
        // 开启开发模式，修改模板后不需要重启服务器
        engine.setDevMode(true);
        
        // 设置模板缓存时间（秒），0 表示不缓存
        engine.setCacheTime(0);
    }
}
```

### 自定义函数

```java
// 定义自定义函数
public class CustomFunctions {
    public static String hello(String name) {
        return "Hello, " + name + "!";
    }
    
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static boolean isEmpty(String str) {
        return str == null || str.isEmpty();
    }
}

// 注册自定义函数
public class DemoConfig extends JFinalConfig {
    @Override
    public void configEngine(Engine engine) {
        // 注册单个函数
        engine.addFunction("hello", CustomFunctions::hello);
        
        // 注册多个函数
        engine.addFunctions("com.example.util.CustomFunctions");
    }
}

// 在模板中使用自定义函数
<p>${hello(user.name)}</p>
<p>${add(1, 2)}</p>
#if(isEmpty(user.email))
    <p>邮箱为空</p>
#end
```

### 自定义指令

```java
// 定义自定义指令
public class CustomDirective extends Directive {
    @Override
    public void exec(Env env, Scope scope, Writer writer) {
        // 获取指令参数
        Expr expr = exprList.getExpr(0);
        String value = expr.eval(scope).toString();
        
        // 生成输出内容
        try {
            writer.write("<div class='custom'>" + value + "</div>");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}

// 注册自定义指令
public class DemoConfig extends JFinalConfig {
    @Override
    public void configEngine(Engine engine) {
        engine.addDirective("custom", CustomDirective.class);
    }
}

// 在模板中使用自定义指令
#custom("自定义内容")
```

## 模板渲染

### Controller 中渲染模板

```java
public class UserController extends Controller {
    public void list() {
        List<User> userList = User.dao.find("select * from user");
        set("userList", userList);
        set("title", "用户列表");
        
        // 渲染模板
        render("user/list.html");
        
        // 或者使用 renderTemplate
        renderTemplate("user/list.html");
    }
    
    public void add() {
        // 渲染添加页面
        render("user/add.html");
    }
}
```

### 直接渲染字符串模板

```java
public class UserController extends Controller {
    public void direct() {
        String template = "<h1>${title}</h1><p>${content}</p>";
        set("title", "直接渲染");
        set("content", "这是直接渲染的模板内容");
        
        // 直接渲染字符串模板
        renderTemplate(template);
    }
}
```

## 模板引擎的高级用法

### 模板缓存

```java
public class DemoConfig extends JFinalConfig {
    @Override
    public void configEngine(Engine engine) {
        // 生产环境开启模板缓存
        engine.setDevMode(false);
        engine.setCacheTime(3600); // 缓存 1 小时
    }
}
```

### 模板热加载

```java
public class DemoConfig extends JFinalConfig {
    @Override
    public void configEngine(Engine engine) {
        // 开发环境开启模板热加载
        engine.setDevMode(true);
        engine.setCacheTime(0); // 不缓存
    }
}
```

### 国际化支持

```java
// 配置国际化
public class DemoConfig extends JFinalConfig {
    @Override
    public void configEngine(Engine engine) {
        // 添加国际化资源文件
        engine.addI18nByBaseName("i18n/messages");
        
        // 设置默认语言
        engine.setI18nDefaultLocale(Locale.CHINA);
    }
}

// 在模板中使用国际化
<p>${i18n('welcome')}</p>
<p>${i18n('hello', user.name)}</p>
```

### 模板压缩

```java
public class DemoConfig extends JFinalConfig {
    @Override
    public void configEngine(Engine engine) {
        // 开启模板压缩，去除空格和换行
        engine.setCompressorOn(true);
    }
}
```

## 其他模板引擎支持

### JSP 支持

```java
public class UserController extends Controller {
    public void list() {
        List<User> userList = User.dao.find("select * from user");
        set("userList", userList);
        
        // 渲染 JSP 模板
        renderJsp("user/list.jsp");
    }
}
```

### Freemarker 支持

```java
// 配置 Freemarker 模板引擎
public class DemoConfig extends JFinalConfig {
    @Override
    public void configPlugin(Plugins me) {
        // 添加 Freemarker 插件
        me.add(new FreemarkerPlugin());
    }
}

// 在 Controller 中渲染 Freemarker 模板
public class UserController extends Controller {
    public void list() {
        List<User> userList = User.dao.find("select * from user");
        set("userList", userList);
        
        // 渲染 Freemarker 模板
        renderFreeMarker("user/list.ftl");
    }
}
```

## 模板引擎最佳实践

1. **合理使用模板继承**：使用模板继承可以减少代码重复，提高代码复用性
2. **使用宏定义**：将重复的 HTML 片段封装为宏，提高代码复用性
3. **避免在模板中编写复杂逻辑**：复杂逻辑应该在 Controller 或 Service 中处理，模板只负责展示数据
4. **使用自定义函数**：将常用的逻辑封装为自定义函数，提高模板的可读性
5. **开启开发模式**：开发过程中开启模板引擎的开发模式，修改模板后不需要重启服务器
6. **关闭生产环境的开发模式**：生产环境中关闭开发模式，开启模板缓存，提高性能
7. **使用国际化**：对于多语言网站，使用模板引擎的国际化支持
8. **合理使用注释**：在模板中添加适当的注释，提高代码可维护性

## 总结

JFinal 模板引擎具有以下优点：

- **高性能**：Enjoy 模板引擎采用编译型设计，性能优异
- **语法简洁**：语法设计简洁明了，易于学习和使用
- **功能强大**：支持模板继承、宏定义、条件判断、循环遍历等功能
- **易于扩展**：支持自定义函数、自定义指令等扩展方式
- **多模板引擎支持**：除了内置的 Enjoy 模板引擎，还支持 JSP、Freemarker 等第三方模板引擎
- **与框架深度集成**：与 JFinal MVC 框架深度集成，使用方便

JFinal 模板引擎非常适合快速开发 Web 应用，同时也能满足大型项目的需求。