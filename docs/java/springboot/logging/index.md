# Spring Boot 日志配置

发布于：2025-11-27

## 日志框架介绍

Spring Boot 默认使用 SLF4J 作为日志门面，配合 Logback 作为日志实现。SLF4J 是一个日志门面框架，它提供了统一的日志 API，允许在运行时切换不同的日志实现。

常用的日志框架组合：
- SLF4J + Logback（Spring Boot 默认）
- SLF4J + Log4j2
- SLF4J + JUL（Java Util Logging）

## 日志级别

日志级别从低到高依次为：
- **TRACE**：最详细的日志信息，通常只在开发阶段使用
- **DEBUG**：调试信息，用于开发和测试阶段
- **INFO**：普通信息，用于记录应用程序的运行状态
- **WARN**：警告信息，表示可能存在的问题
- **ERROR**：错误信息，表示发生了错误
- **FATAL**：致命错误，导致应用程序终止

Spring Boot 默认的日志级别是 INFO，也就是说，INFO 级别及以上的日志会被输出。

## 基本日志配置

### 1. 通过配置文件配置

在 application.properties 或 application.yml 文件中，可以配置日志相关的属性：

```ini
# 配置日志级别
logging.level.root=INFO
logging.level.com.example=DEBUG
logging.level.org.springframework=WARN

# 配置日志输出格式
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n

# 配置日志文件
logging.file.name=myapp.log
logging.file.path=./logs

# 配置日志文件大小和滚动策略
logging.logback.rollingpolicy.max-file-size=10MB
logging.logback.rollingpolicy.max-history=7
```

### 2. 通过 logback-spring.xml 配置

Spring Boot 支持使用 logback-spring.xml 文件进行更详细的日志配置，该文件需要放在 classpath 根目录下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 文件输出 -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>./logs/myapp.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <!-- 日志文件名称格式 -->
            <fileNamePattern>./logs/myapp.%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <!-- 日志文件最大大小 -->
            <maxFileSize>10MB</maxFileSize>
            <!-- 日志文件保留天数 -->
            <maxHistory>7</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 根日志配置 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </root>

    <!-- 包级别的日志配置 -->
    <logger name="com.example" level="DEBUG" additivity="false">
        <appender-ref ref="CONSOLE" />
        <appender-ref ref="FILE" />
    </logger>

    <!-- Spring 框架的日志配置 -->
    <logger name="org.springframework" level="WARN" />
</configuration>
```

## 使用 Log4j2

如果需要使用 Log4j2 作为日志实现，可以按照以下步骤配置：

### 1. 排除默认的 Logback 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### 2. 添加 Log4j2 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

### 3. 配置 log4j2-spring.xml

创建 log4j2-spring.xml 文件并放在 classpath 根目录下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <Appenders>
        <!-- 控制台输出 -->
        <Console name="CONSOLE" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n" />
        </Console>

        <!-- 文件输出 -->
        <RollingFile name="FILE" fileName="./logs/myapp.log" 
                     filePattern="./logs/myapp.%d{yyyy-MM-dd}.%i.log">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n" />
            <Policies>
                <SizeBasedTriggeringPolicy size="10MB" />
                <TimeBasedTriggeringPolicy />
            </Policies>
            <DefaultRolloverStrategy max="7" />
        </RollingFile>
    </Appenders>

    <Loggers>
        <!-- 根日志配置 -->
        <Root level="INFO">
            <AppenderRef ref="CONSOLE" />
            <AppenderRef ref="FILE" />
        </Root>

        <!-- 包级别的日志配置 -->
        <Logger name="com.example" level="DEBUG" additivity="false">
            <AppenderRef ref="CONSOLE" />
            <AppenderRef ref="FILE" />
        </Logger>
    </Loggers>
</Configuration>
```

## 在代码中使用日志

在代码中，可以通过 SLF4J 的 API 来记录日志：

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class MyController {

    // 获取日志记录器
    private static final Logger logger = LoggerFactory.getLogger(MyController.class);

    @GetMapping("/")
    public String hello() {
        // 记录不同级别的日志
        logger.trace("这是一条 TRACE 级别的日志");
        logger.debug("这是一条 DEBUG 级别的日志");
        logger.info("这是一条 INFO 级别的日志");
        logger.warn("这是一条 WARN 级别的日志");
        logger.error("这是一条 ERROR 级别的日志");

        return "Hello World";
    }
}
```

## 使用 Lombok 简化日志记录

如果项目中使用了 Lombok，可以通过 @Slf4j 注解来简化日志记录器的创建：

```java
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
public class MyController {

    @GetMapping("/")
    public String hello() {
        // 直接使用 log 变量记录日志
        log.trace("这是一条 TRACE 级别的日志");
        log.debug("这是一条 DEBUG 级别的日志");
        log.info("这是一条 INFO 级别的日志");
        log.warn("这是一条 WARN 级别的日志");
        log.error("这是一条 ERROR 级别的日志");

        return "Hello World";
    }
}
```

## 总结

Spring Boot 提供了灵活的日志配置方式，可以通过配置文件或专门的日志配置文件来配置日志。默认情况下，Spring Boot 使用 SLF4J + Logback 作为日志框架，也支持切换到 Log4j2 等其他日志框架。

合理配置日志对于应用程序的开发、测试和运维非常重要，它可以帮助我们了解应用程序的运行状态，排查问题，监控性能等。