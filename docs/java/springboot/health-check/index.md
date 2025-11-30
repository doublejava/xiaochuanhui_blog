# Spring Boot 健康检查与监控

在生产环境中，对Spring Boot应用进行健康检查和监控是非常重要的。Spring Boot提供了强大的监控功能，通过Actuator模块可以轻松实现应用的健康检查、指标收集和审计等功能。本文将详细介绍Spring Boot健康检查与监控的实现方式和最佳实践。

## 1. Spring Boot Actuator简介

Spring Boot Actuator是Spring Boot提供的一个监控和管理生产环境的模块，它提供了一系列HTTP或JMX端点，用于监控应用的运行状态、收集指标、审计日志等。

## 2. 集成Actuator

### 2.1 添加依赖

在pom.xml中添加Actuator依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 2.2 基本配置

在application.properties中配置Actuator：

```ini
# 暴露所有端点
management.endpoints.web.exposure.include=*
# 健康检查显示详情
management.endpoint.health.show-details=always
# 自定义Actuator基础路径
management.endpoints.web.base-path=/actuator
```

## 3. 常用端点

Actuator提供了多个端点，用于监控和管理应用。以下是一些常用的端点：

| 端点 | 描述 | HTTP方法 |
|------|------|----------|
| `/actuator/health` | 应用健康状态 | GET |
| `/actuator/info` | 应用信息 | GET |
| `/actuator/metrics` | 应用指标 | GET |
| `/actuator/env` | 环境变量 | GET |
| `/actuator/configprops` | 配置属性 | GET |
| `/actuator/beans` | Spring Bean信息 | GET |
| `/actuator/loggers` | 日志配置 | GET/POST |
| `/actuator/threaddump` | 线程转储 | GET |
| `/actuator/heapdump` | 堆转储 | GET |
| `/actuator/shutdown` | 关闭应用 | POST |

## 4. 健康检查

### 4.1 内置健康指示器

Spring Boot Actuator内置了多种健康指示器，用于检查应用的各个组件是否健康：

- **DiskSpaceHealthIndicator**：检查磁盘空间
- **DataSourceHealthIndicator**：检查数据库连接
- **RedisHealthIndicator**：检查Redis连接
- **MongoHealthIndicator**：检查MongoDB连接
- **RabbitHealthIndicator**：检查RabbitMQ连接
- **ElasticsearchHealthIndicator**：检查Elasticsearch连接

### 4.2 自定义健康指示器

创建自定义健康指示器，实现`HealthIndicator`接口：

```java
@Component
public class CustomHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        // 检查自定义健康状态的逻辑
        boolean isHealthy = checkCustomHealth();
        
        if (isHealthy) {
            return Health.up()
                    .withDetail("custom-status", "OK")
                    .withDetail("timestamp", LocalDateTime.now().toString())
                    .build();
        } else {
            return Health.down()
                    .withDetail("custom-status", "ERROR")
                    .withDetail("error", "Custom health check failed")
                    .build();
        }
    }
    
    private boolean checkCustomHealth() {
        // 实际的健康检查逻辑
        return true;
    }
}
```

### 4.3 健康组

Spring Boot 2.2+支持健康组，可以将多个健康指示器分组：

```ini
# 定义健康组
management.endpoint.health.group.custom.include=custom,db
management.endpoint.health.group.custom.show-details=always
```

访问`/actuator/health/custom`可以查看自定义健康组的状态。

## 5. 指标监控

### 5.1 内置指标

Actuator内置了多种指标，包括：

- JVM指标：内存使用、GC次数、线程数等
- HTTP指标：请求次数、响应时间、状态码等
- 应用指标：启动时间、加载的类数量等
- 数据源指标：连接池使用情况等

### 5.2 自定义指标

使用Micrometer创建自定义指标：

```java
@Component
public class CustomMetrics {
    
    private final Counter requestCounter;
    private final Timer requestTimer;
    private final Gauge customGauge;
    
    public CustomMetrics(MeterRegistry meterRegistry) {
        // 计数器：统计请求次数
        this.requestCounter = Counter.builder("custom.request.count")
                .description("Number of custom requests")
                .register(meterRegistry);
        
        // 计时器：统计请求耗时
        this.requestTimer = Timer.builder("custom.request.duration")
                .description("Duration of custom requests")
                .register(meterRegistry);
        
        // 仪表盘：统计自定义值
        AtomicInteger customValue = new AtomicInteger(0);
        this.customGauge = Gauge.builder("custom.value", customValue, AtomicInteger::get)
                .description("Custom gauge value")
                .register(meterRegistry);
    }
    
    public void incrementRequestCount() {
        requestCounter.increment();
    }
    
    public <T> T recordRequestTime(Supplier<T> supplier) {
        return requestTimer.record(supplier);
    }
}
```

## 6. 集成Prometheus

Prometheus是一款流行的监控系统，可以与Spring Boot Actuator集成，用于收集和分析指标。

### 6.1 添加依赖

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

### 6.2 配置Prometheus

在application.properties中添加配置：

```ini
# 配置Prometheus
management.metrics.export.prometheus.enabled=true
```

访问`/actuator/prometheus`可以获取Prometheus格式的指标数据。

### 6.3 Prometheus配置文件

创建prometheus.yml配置文件：

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'spring-boot'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['localhost:8080']
```

## 7. 集成Grafana

Grafana是一款可视化监控工具，可以与Prometheus集成，用于展示指标数据。

1. 启动Grafana服务
2. 添加Prometheus数据源
3. 导入Spring Boot监控仪表盘（可以使用ID为10280的官方仪表盘）
4. 查看监控数据

## 8. 审计日志

Actuator提供了审计日志功能，可以记录应用的重要操作。

### 8.1 启用审计

创建审计配置类：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
            .anyRequest().authenticated()
            .and()
            .httpBasic();
    }
}
```

### 8.2 自定义审计事件

创建自定义审计事件：

```java
@Component
public class CustomAuditEventPublisher {
    
    @Autowired
    private AuditEventRepository auditEventRepository;
    
    public void publishCustomEvent(String principal, String type, Map<String, Object> data) {
        AuditEvent event = new AuditEvent(principal, type, data);
        auditEventRepository.save(event);
    }
}
```

## 9. 最佳实践

1. **只暴露必要的端点**：在生产环境中，不要暴露所有端点，只暴露必要的端点
2. **添加安全认证**：为Actuator端点添加安全认证，防止未授权访问
3. **监控关键指标**：重点监控应用的关键指标，如响应时间、错误率、内存使用等
4. **设置合理的告警阈值**：根据应用的实际情况，设置合理的告警阈值
5. **定期分析监控数据**：定期分析监控数据，发现潜在的问题
6. **集成分布式追踪**：结合Zipkin或Jaeger等分布式追踪系统，实现全链路监控

## 10. 常见问题

1. **Actuator端点无法访问**：检查是否正确配置了端点暴露规则，以及是否有防火墙或安全组限制
2. **健康检查显示DOWN**：检查对应的健康指示器，查看具体的错误信息
3. **指标数据不准确**：检查指标的收集逻辑，确保指标的准确性
4. **Prometheus无法获取指标**：检查Prometheus的配置是否正确，以及应用是否正常运行

通过合理使用Spring Boot Actuator和相关监控工具，可以实现对Spring Boot应用的全面监控和管理，提高应用的可靠性和可维护性。