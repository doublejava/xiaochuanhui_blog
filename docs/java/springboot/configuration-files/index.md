# Spring Boot 配置文件详解

发布于：2025-11-27

## 配置文件类型

Spring Boot 支持多种格式的配置文件，主要包括：

1. **application.properties**
2. **application.yml**（或 application.yaml）
3. **application.env**

其中，properties 和 yml 是最常用的两种格式。

## 配置文件位置

Spring Boot 会从以下位置加载配置文件：

1. **项目根目录下的 config 目录**：`file:./config/`
2. **项目根目录**：`file:./`
3. **classpath 下的 config 目录**：`classpath:/config/`
4. **classpath 根目录**：`classpath:/`

配置文件的加载顺序是从高到低，后面加载的配置会覆盖前面的配置。

## properties 格式

properties 格式是传统的键值对格式，使用 `=` 分隔键和值：

```ini
# 应用名称
spring.application.name=myapp

# 应用端口
server.port=8080

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=123456
```

## yml 格式

yml 格式是一种简洁的分层格式，使用缩进表示层级关系，使用 `:` 分隔键和值：

```yaml
# 应用配置
spring:
  application:
    name: myapp
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 123456

# 服务器配置
server:
  port: 8080
```

## 配置文件优先级

当存在多个配置文件时，Spring Boot 会按照以下优先级加载：

1. **application-{profile}.properties/yml**：指定环境的配置文件
2. **application.properties/yml**：默认配置文件

其中，profile 可以通过 `spring.profiles.active` 属性指定。

## 多环境配置

Spring Boot 支持多环境配置，可以通过以下方式实现：

### 1. 使用不同的配置文件

创建多个配置文件，每个文件对应一个环境：

- `application-dev.properties/yml`：开发环境配置
- `application-test.properties/yml`：测试环境配置
- `application-prod.properties/yml`：生产环境配置

然后在主配置文件中指定激活的环境：

```ini
# 激活开发环境
spring.profiles.active=dev
```

### 2. 在同一个文件中使用多文档块

在 yml 文件中，可以使用 `---` 分隔不同的文档块，每个文档块对应一个环境：

```yaml
# 默认配置
spring:
  profiles:
    active: dev

---
# 开发环境配置
spring:
  profiles: dev
server:
  port: 8080

---
# 生产环境配置
spring:
  profiles: prod
server:
  port: 80
```

## 配置属性注入

Spring Boot 提供了多种方式将配置属性注入到 Bean 中：

### 1. @Value 注解

使用 @Value 注解可以将单个配置属性注入到 Bean 中：

```java
@Component
public class MyComponent {

    @Value("${spring.application.name}")
    private String appName;

    @Value("${server.port:8080}") // 带默认值
    private int port;

    // getter 和 setter
}
```

### 2. @ConfigurationProperties 注解

使用 @ConfigurationProperties 注解可以将一组相关的配置属性注入到一个 Bean 中：

```java
@Component
@ConfigurationProperties(prefix = "spring.datasource")
public class DataSourceProperties {

    private String url;
    private String username;
    private String password;

    // getter 和 setter
}
```

### 3. @EnableConfigurationProperties 注解

使用 @EnableConfigurationProperties 注解可以启用指定的配置属性类：

```java
@Configuration
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceConfig {
    // ...
}
```

## 类型安全的配置属性

Spring Boot 支持类型安全的配置属性，可以通过以下方式实现：

1. 创建一个配置属性类，并添加 @ConfigurationProperties 注解
2. 在配置类中添加相应的属性和 getter/setter 方法
3. 确保类路径下存在 spring-boot-configuration-processor 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

## 外部配置源

除了配置文件，Spring Boot 还支持从以下外部源加载配置：

1. **命令行参数**：使用 `--key=value` 格式
2. **环境变量**：所有环境变量都会被加载
3. **Java 系统属性**：使用 `System.getProperties()` 获取
4. **JNDI 属性**：从 Java EE 容器中获取
5. **ServletContext 初始化参数**：从 web.xml 中获取
6. **ServletConfig 初始化参数**：从 Servlet 配置中获取
7. **@PropertySource 注解**：从指定的属性文件中获取

## 配置文件加密

在生产环境中，配置文件中的敏感信息（如数据库密码、API 密钥等）需要加密。Spring Boot 支持使用 Jasypt 进行配置文件加密：

1. 添加 Jasypt 依赖
2. 配置加密密钥
3. 使用加密后的属性值

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.4</version>
</dependency>
```

加密命令：

```bash
java -cp jasypt-1.9.3.jar org.jasypt.intf.cli.JasyptPBEStringEncryptionCLI \
--algorithm PBEWITHHMACSHA512ANDAES_256 \
--password mySecretKey \
--text myPassword
```

使用加密后的属性：

```ini
spring.datasource.password=ENC(encryptedPassword)
```

## 总结

Spring Boot 提供了灵活强大的配置机制，支持多种配置文件格式、多环境配置、类型安全的配置属性等特性。合理使用这些特性可以大大简化应用程序的配置管理，提高开发效率和运维便利性。