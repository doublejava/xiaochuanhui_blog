# JFinal Deploy

JFinal Deploy（部署）是将 JFinal 应用部署到生产环境的过程。JFinal 应用可以部署到各种 Web 容器中，如 Tomcat、Jetty、Undertow 等，也可以作为独立应用运行。

## 部署方式

### 1. 独立应用部署

JFinal 应用可以作为独立应用运行，不需要依赖外部 Web 容器：

```java
public class DemoConfig extends JFinalConfig {
    // 配置方法...
    
    public static void main(String[] args) {
        // 启动 JFinal 应用
        JFinal.start("src/main/webapp", 8080, "/", 5);
    }
}
```

启动参数说明：
- 第一个参数：webapp 目录路径
- 第二个参数：端口号
- 第三个参数：上下文路径
- 第四个参数：扫描间隔时间（秒），0 表示不扫描

### 2. War 包部署

将 JFinal 应用打包成 War 包，部署到外部 Web 容器中：

#### 配置 Web.xml

```xml
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">
    
    <filter>
        <filter-name>jfinal</filter-name>
        <filter-class>com.jfinal.core.JFinalFilter</filter-class>
        <init-param>
            <param-name>configClass</param-name>
            <param-value>com.example.config.DemoConfig</param-value>
        </init-param>
    </filter>
    
    <filter-mapping>
        <filter-name>jfinal</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
</web-app>
```

#### 打包 War 包

使用 Maven 打包 War 包：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    
    <packaging>war</packaging>
    
    <!-- 依赖配置 -->
    
    <build>
        <finalName>demo</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.3.2</version>
                <configuration>
                    <webResources>
                        <resource>
                            <directory>src/main/webapp</directory>
                        </resource>
                    </webResources>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

执行打包命令：

```bash
mvn clean package -DskipTests
```

#### 部署到 Tomcat

将生成的 War 包复制到 Tomcat 的 webapps 目录下，启动 Tomcat 即可自动解压和部署。

### 3. Docker 部署

使用 Docker 部署 JFinal 应用：

#### 创建 Dockerfile

```bash
# 使用 OpenJDK 作为基础镜像
FROM openjdk:11-jre-slim

# 设置工作目录
WORKDIR /app

# 复制 War 包到容器中
COPY target/demo.war /app/demo.war

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["java", "-jar", "demo.war"]
```

#### 构建 Docker 镜像

```bash
docker build -t demo-jfinal .
```

#### 运行 Docker 容器

```bash
docker run -d -p 8080:8080 --name demo-jfinal demo-jfinal
```

## 部署配置

### 生产环境配置

在生产环境中，需要调整以下配置：

```java
public class DemoConfig extends JFinalConfig {
    @Override
    public void configConstant(Constants me) {
        // 关闭开发模式
        me.setDevMode(false);
        
        // 关闭 SQL 显示
        // arp.setShowSql(false);
        
        // 配置错误页面
        me.setError404View("/error/404.html");
        me.setError500View("/error/500.html");
        
        // 配置文件上传路径
        me.setBaseUploadPath("/data/upload");
        
        // 配置缓存
        // engine.setCacheTime(3600);
    }
}
```

### 数据库配置

生产环境中，数据库连接信息应该放在外部配置文件中：

```java
public class DemoConfig extends JFinalConfig {
    @Override
    public void configPlugin(Plugins me) {
        // 从配置文件中读取数据库连接信息
        Properties prop = loadPropertyFile("config.properties");
        String url = prop.getProperty("jdbc.url");
        String username = prop.getProperty("jdbc.username");
        String password = prop.getProperty("jdbc.password");
        
        // 配置数据库连接池
        DruidPlugin druidPlugin = new DruidPlugin(url, username, password);
        me.add(druidPlugin);
        
        // 配置 ActiveRecord 插件
        ActiveRecordPlugin arp = new ActiveRecordPlugin(druidPlugin);
        me.add(arp);
    }
}
```

### 日志配置

生产环境中，需要配置合适的日志级别和输出方式：

```xml
<!-- log4j2.xml -->
<Configuration status="INFO">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
        </Console>
        <RollingFile name="RollingFile" fileName="logs/demo.log" 
                     filePattern="logs/demo-%d{yyyy-MM-dd}-%i.log.gz">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="1" modulate="true"/>
                <SizeBasedTriggeringPolicy size="10 MB"/>
            </Policies>
            <DefaultRolloverStrategy max="10"/>
        </RollingFile>
    </Appenders>
    <Loggers>
        <Root level="info">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="RollingFile"/>
        </Root>
        <Logger name="com.jfinal" level="warn"/>
        <Logger name="com.example" level="debug"/>
    </Loggers>
</Configuration>
```

## 部署最佳实践

1. **使用独立应用部署**：对于简单的应用，使用独立应用部署可以减少外部依赖，简化部署流程
2. **使用 War 包部署**：对于复杂的应用，使用 War 包部署可以更好地集成到现有 Web 容器中
3. **使用 Docker 部署**：Docker 部署可以提高应用的可移植性和一致性，便于扩展和管理
4. **配置外部化**：将数据库连接信息、缓存配置等敏感信息放在外部配置文件中，便于维护和更新
5. **关闭开发模式**：生产环境中关闭开发模式、SQL 显示等功能，提高性能和安全性
6. **配置错误页面**：为不同的错误码配置友好的错误页面，提高用户体验
7. **配置日志**：配置合适的日志级别和输出方式，便于监控和调试
8. **使用 HTTPS**：生产环境中使用 HTTPS 协议，提高数据传输的安全性
9. **配置防火墙**：配置防火墙规则，限制对应用的访问
10. **定期备份**：定期备份数据库和应用数据，防止数据丢失

## 监控和维护

### 应用监控

可以使用以下工具监控 JFinal 应用：

1. **Druid 监控**：Druid 连接池内置了监控功能，可以监控数据库连接、SQL 执行等情况
2. **JMX 监控**：使用 JMX 监控 JVM 运行情况
3. **Prometheus + Grafana**：监控应用的各项指标
4. **ELK Stack**：收集和分析日志

### 应用维护

1. **定期更新依赖**：定期更新 JFinal 和其他依赖库，修复安全漏洞
2. **定期优化数据库**：定期优化数据库表结构和索引
3. **定期清理日志**：定期清理过期日志，释放磁盘空间
4. **定期备份数据**：定期备份数据库和应用数据
5. **监控应用性能**：监控应用的响应时间、吞吐量等性能指标

## 总结

JFinal 应用可以通过多种方式部署，包括独立应用部署、War 包部署和 Docker 部署。在部署过程中，需要注意配置生产环境的各项参数，如关闭开发模式、配置错误页面、配置日志等。

合理的部署方式和配置可以提高应用的性能、安全性和可维护性，因此在部署过程中应该重视这些方面的设计和管理。