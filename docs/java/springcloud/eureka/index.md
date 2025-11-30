# Spring Cloud Eureka 服务注册与发现

Eureka是Netflix开源的服务注册与发现组件，是Spring Cloud Netflix套件中的核心组件之一。它提供了完整的服务注册和发现机制，帮助开发者构建可靠的分布式系统。

## 1. Eureka的基本概念

Eureka采用了CS（Client/Server）架构，主要包含两个组件：

- **Eureka Server**：服务注册中心，负责管理所有服务实例的注册和发现
- **Eureka Client**：服务客户端，负责向Eureka Server注册自身服务，并从Eureka Server获取其他服务实例的信息

## 2. Eureka Server的搭建

### 2.1 添加依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

### 2.2 配置文件

```yaml
spring:
  application:
    name: eureka-server

server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    # 表示是否向Eureka Server注册自己，默认为true
    register-with-eureka: false
    # 表示是否从Eureka Server获取注册信息，默认为true
    fetch-registry: false
    # Eureka Server的地址
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
  server:
    # 关闭自我保护机制
    enable-self-preservation: false
    # 清理无效节点的时间间隔，单位：毫秒
    eviction-interval-timer-in-ms: 30000
```

### 2.3 启动类

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

## 3. Eureka Client的搭建

### 3.1 添加依赖

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

### 3.2 配置文件

```yaml
spring:
  application:
    name: user-service

server:
  port: 8081

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    # 实例名称
    instance-id: ${spring.application.name}:${server.port}
    # 优先使用IP地址而非主机名
    prefer-ip-address: true
    # 心跳间隔，单位：秒
    lease-renewal-interval-in-seconds: 30
    # 服务失效时间，单位：秒
    lease-expiration-duration-in-seconds: 90
```

### 3.3 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

## 4. Eureka的高可用配置

在生产环境中，Eureka Server通常需要部署多个实例，形成集群，以提高可用性。

### 4.1 双节点Eureka Server配置

**eureka-server1配置**：

```yaml
spring:
  application:
    name: eureka-server

server:
  port: 8761

eureka:
  instance:
    hostname: eureka-server1
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka-server2:8762/eureka/
```

**eureka-server2配置**：

```yaml
spring:
  application:
    name: eureka-server

server:
  port: 8762

eureka:
  instance:
    hostname: eureka-server2
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka-server1:8761/eureka/
```

### 4.2 多节点Eureka Server配置

对于3个或更多节点的Eureka Server集群，每个节点的配置类似，只需要将所有其他节点的地址添加到`defaultZone`中即可。

## 5. Eureka的自我保护机制

Eureka Server具有自我保护机制，当它在短时间内丢失过多客户端时（网络分区故障），它会进入自我保护模式。在这种模式下，Eureka Server会保护注册表中的信息，不再删除注册表中的数据，以防止因网络问题导致服务实例被误删。

### 5.1 关闭自我保护机制

```yaml
eureka:
  server:
    enable-self-preservation: false
```

### 5.2 调整自我保护阈值

```yaml
eureka:
  server:
    # 自我保护阈值，默认值为0.85
    renewal-percent-threshold: 0.85
```

## 6. Eureka的健康检查

Eureka Client会定期向Eureka Server发送心跳，以表明自己仍然存活。默认情况下，Eureka使用客户端心跳来判断服务是否存活。我们也可以配置Eureka使用Spring Boot Actuator的健康检查端点来判断服务是否存活。

### 6.1 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 6.2 配置健康检查

```yaml
eureka:
  client:
    healthcheck:
      enabled: true
```

## 7. Eureka的元数据配置

Eureka允许我们为服务实例配置自定义元数据，这些元数据可以在服务调用时使用。

```yaml
eureka:
  instance:
    metadata-map:
      version: v1
      environment: production
      region: cn-east
```

## 8. Eureka的服务调用

在微服务架构中，服务之间的调用通常通过服务名来进行，而不是直接使用IP地址和端口号。

### 8.1 使用RestTemplate调用服务

```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class UserService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    public User getUserById(Long id) {
        // 通过服务名调用其他服务
        return restTemplate.getForObject("http://user-service/user/{id}", User.class, id);
    }
}
```

### 8.2 使用Feign调用服务

```java
@FeignClient(name = "user-service")
public interface UserFeignClient {
    
    @GetMapping("/user/{id}")
    User getUserById(@PathVariable("id") Long id);
}

@Service
public class UserService {
    
    @Autowired
    private UserFeignClient userFeignClient;
    
    public User getUserById(Long id) {
        return userFeignClient.getUserById(id);
    }
}
```

## 9. Eureka的常见问题与解决方案

### 9.1 服务注册慢

**问题**：服务启动后，需要等待一段时间才能在Eureka Server上看到注册的服务。

**解决方案**：调整Eureka Client的心跳间隔和服务失效时间。

```yaml
eureka:
  instance:
    lease-renewal-interval-in-seconds: 30
    lease-expiration-duration-in-seconds: 90
```

### 9.2 服务下线慢

**问题**：服务停止后，需要等待一段时间才能从Eureka Server上移除。

**解决方案**：确保服务在停止前向Eureka Server发送下线请求。

### 9.3 网络分区导致服务不可用

**问题**：网络分区导致Eureka Server无法与客户端通信，从而导致服务不可用。

**解决方案**：启用Eureka的自我保护机制，并配置合理的阈值。

## 10. Eureka与其他服务注册中心的比较

| 特性 | Eureka | Consul | Nacos |
|------|--------|--------|-------|
| 服务注册与发现 | 支持 | 支持 | 支持 |
| 健康检查 | 支持 | 支持 | 支持 |
| 多数据中心 | 支持 | 支持 | 支持 |
| 配置中心 | 不支持 | 支持 | 支持 |
| 动态DNS | 不支持 | 支持 | 支持 |
| 分布式锁 | 不支持 | 支持 | 支持 |
| 一致性协议 | AP | CP | AP/CP |
| 社区活跃度 | 低（已进入维护模式） | 中 | 高 |

## 11. 总结

Eureka是一个成熟的服务注册与发现组件，具有简单易用、高可用、可扩展等特点。虽然Eureka已经进入维护模式，但它仍然是许多企业构建微服务架构的首选组件之一。

在实际应用中，我们需要根据业务需求和系统架构选择合适的服务注册中心。对于需要高可用、AP一致性的场景，Eureka是一个不错的选择；对于需要CP一致性、配置中心等功能的场景，可以考虑使用Consul或Nacos。