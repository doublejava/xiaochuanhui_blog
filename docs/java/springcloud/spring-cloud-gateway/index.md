# Spring Cloud Gateway API网关

Spring Cloud Gateway是Spring官方推出的API网关，基于Spring 5、Spring Boot 2和Project Reactor开发，具有高性能、响应式、异步非阻塞等特点。它可以帮助我们实现请求路由、负载均衡、限流熔断、认证授权等功能。

## 1. Spring Cloud Gateway的基本概念

Spring Cloud Gateway主要包含以下核心组件：

- **路由（Route）**：路由是网关的基本构建块，由ID、目标URI、谓词集合和过滤器集合组成
- **谓词（Predicate）**：谓词用于匹配请求，只有当请求满足谓词条件时，才会被转发到目标URI
- **过滤器（Filter）**：过滤器用于修改请求和响应，可以分为全局过滤器和局部过滤器
- **网关过滤器工厂**：用于创建网关过滤器的工厂类
- **全局过滤器**：对所有路由生效的过滤器

## 2. Spring Cloud Gateway的工作原理

Spring Cloud Gateway的工作原理可以分为以下几个步骤：

1. **请求到达网关**：客户端发送请求到Spring Cloud Gateway
2. **谓词匹配**：根据配置的谓词匹配请求
3. **过滤器链执行**：执行路由的过滤器链，包括前置过滤器和后置过滤器
4. **请求转发**：将请求转发到目标URI
5. **响应处理**：处理目标服务的响应，执行后置过滤器
6. **返回响应**：将响应返回给客户端

## 3. Spring Cloud Gateway的集成

### 3.1 添加依赖

```xml
<!-- Spring Cloud Gateway依赖 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<!-- 服务发现依赖 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<!-- 负载均衡依赖 -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>

<!-- 健康检查依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 3.2 配置文件

```yaml
spring:
  application:
    name: gateway-service
  cloud:
    gateway:
      # 路由配置
      routes:
        # 用户服务路由
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1
            - AddRequestHeader=X-Request-From, gateway
        # 订单服务路由
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/order/**
          filters:
            - StripPrefix=1
            - AddResponseHeader=X-Response-From, gateway
      # 全局过滤器配置
      default-filters:
        - AddResponseHeader=X-Gateway-Version, 1.0
      # 跨域配置
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: [GET, POST, PUT, DELETE, OPTIONS]
            allowedHeaders: "*"
            allowCredentials: true

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

# 暴露健康检查端点
management:
  endpoints:
    web:
      exposure:
        include: health,info,gateway
```

### 3.3 启动类

```java
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
```

## 4. Spring Cloud Gateway的路由配置

### 4.1 基于配置文件的路由配置

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1
```

### 4.2 基于Java代码的路由配置

```java
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // 用户服务路由
                .route("user-service", r -> r
                        .path("/api/user/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://user-service"))
                // 订单服务路由
                .route("order-service", r -> r
                        .path("/api/order/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://order-service"))
                .build();
    }
}
```

## 5. Spring Cloud Gateway的谓词

Spring Cloud Gateway支持多种谓词，用于匹配请求：

### 5.1 Path谓词

```yaml
predicates:
  - Path=/api/user/**
```

### 5.2 Method谓词

```yaml
predicates:
  - Method=GET,POST
```

### 5.3 Header谓词

```yaml
predicates:
  - Header=X-Request-Id, \d+
```

### 5.4 Query谓词

```yaml
predicates:
  - Query=version, v1
```

### 5.5 Cookie谓词

```yaml
predicates:
  - Cookie=sessionId, \w+
```

### 5.6 Host谓词

```yaml
predicates:
  - Host=**.example.com
```

### 5.7 After谓词

```yaml
predicates:
  - After=2023-01-01T00:00:00+08:00[Asia/Shanghai]
```

### 5.8 Before谓词

```yaml
predicates:
  - Before=2024-01-01T00:00:00+08:00[Asia/Shanghai]
```

### 5.9 Between谓词

```yaml
predicates:
  - Between=2023-01-01T00:00:00+08:00[Asia/Shanghai], 2024-01-01T00:00:00+08:00[Asia/Shanghai]
```

## 6. Spring Cloud Gateway的过滤器

### 6.1 内置过滤器

Spring Cloud Gateway提供了多种内置过滤器，用于修改请求和响应：

#### 6.1.1 StripPrefix过滤器

去除请求路径的前缀：

```yaml
filters:
  - StripPrefix=1
```

#### 6.1.2 PrefixPath过滤器

添加请求路径的前缀：

```yaml
filters:
  - PrefixPath=/api
```

#### 6.1.3 AddRequestHeader过滤器

添加请求头：

```yaml
filters:
  - AddRequestHeader=X-Request-From, gateway
```

#### 6.1.4 AddResponseHeader过滤器

添加响应头：

```yaml
filters:
  - AddResponseHeader=X-Response-From, gateway
```

#### 6.1.5 RewritePath过滤器

重写请求路径：

```yaml
filters:
  - RewritePath=/api/(?<segment>.*), /$\{segment}
```

#### 6.1.6 SetPath过滤器

设置请求路径：

```yaml
filters:
  - SetPath=/${segment}
```

#### 6.1.7 RequestRateLimiter过滤器

请求限流：

```yaml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 10
      redis-rate-limiter.burstCapacity: 20
      redis-rate-limiter.requestedTokens: 1
      key-resolver: "#{@userKeyResolver}"
```

### 6.2 自定义过滤器

#### 6.2.1 自定义局部过滤器

```java
@Component
public class CustomFilter implements GatewayFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        logger.info("CustomFilter executed before request");
        
        // 修改请求
        ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-Custom-Header", "custom-value")
                .build();
        
        // 继续执行过滤器链
        return chain.filter(exchange.mutate().request(request).build())
                .then(Mono.fromRunnable(() -> {
                    logger.info("CustomFilter executed after response");
                    // 修改响应
                    exchange.getResponse().getHeaders().add("X-Custom-Response-Header", "custom-response-value");
                }));
    }
}
```

#### 6.2.2 自定义全局过滤器

```java
@Component
public class CustomGlobalFilter implements GlobalFilter, Ordered {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomGlobalFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        
        return chain.filter(exchange)
                .then(Mono.fromRunnable(() -> {
                    long endTime = System.currentTimeMillis();
                    long duration = endTime - startTime;
                    logger.info("Request URL: {}, Duration: {}ms", 
                            exchange.getRequest().getURI(), duration);
                    exchange.getResponse().getHeaders().add("X-Response-Time", String.valueOf(duration));
                }));
    }
    
    @Override
    public int getOrder() {
        return -1;
    }
}
```

## 7. Spring Cloud Gateway的限流配置

### 7.1 基于Redis的限流

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
```

```yaml
spring:
  redis:
    host: localhost
    port: 6379

spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@userKeyResolver}"
```

```java
@Component
public class UserKeyResolver implements KeyResolver {
    
    @Override
    public Mono<String> resolve(ServerWebExchange exchange) {
        // 基于用户ID限流
        return Mono.just(exchange.getRequest().getHeaders().getFirst("X-User-Id"));
    }
}
```

## 8. Spring Cloud Gateway的熔断配置

### 8.1 基于Resilience4j的熔断

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1
            - name: CircuitBreaker
              args:
                name: userServiceCircuitBreaker
                fallbackUri: forward:/fallback/user

# Resilience4j配置
resilience4j:
  circuitbreaker:
    instances:
      userServiceCircuitBreaker:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
        waitDurationInOpenState: 5s
        failureRateThreshold: 50
```

```java
@RestController
@RequestMapping("/fallback")
public class FallbackController {
    
    @GetMapping("/user")
    public ResponseEntity<String> userFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("User service is unavailable, please try again later");
    }
}
```

## 9. Spring Cloud Gateway的认证授权

### 9.1 集成Spring Security

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-resource-server</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-jose</artifactId>
</dependency>
```

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8081/auth/realms/myrealm
```

```java
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/api/public/**").permitAll()
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );
        return http.build();
    }
    
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new JwtGrantedAuthoritiesConverter());
        return converter;
    }
}
```

## 10. Spring Cloud Gateway的最佳实践

1. **合理设计路由规则**：路由规则应该清晰、易于维护，避免复杂的嵌套和重叠
2. **使用服务发现**：结合服务发现组件，实现动态路由和负载均衡
3. **配置限流熔断**：保护微服务免受请求过载的影响
4. **实现认证授权**：确保只有合法的请求才能访问资源
5. **添加监控日志**：记录请求日志，监控系统运行状态
6. **使用缓存**：缓存热点数据，提高系统响应速度
7. **部署多个网关实例**：确保网关的高可用性

## 11. 常见问题与解决方案

### 11.1 路由配置不生效

**问题**：配置了路由规则，但请求没有被正确转发

**解决方案**：
- 检查路由规则是否正确
- 检查谓词配置是否正确
- 检查服务是否已注册到服务注册中心

### 11.2 限流不生效

**问题**：配置了限流规则，但限流没有生效

**解决方案**：
- 检查是否添加了Redis依赖
- 检查Redis配置是否正确
- 检查限流规则配置是否正确

### 11.3 熔断不触发

**问题**：配置了熔断规则，但熔断没有触发

**解决方案**：
- 检查是否添加了Resilience4j依赖
- 检查熔断规则配置是否正确
- 检查是否有足够的请求触发熔断

## 12. 总结

Spring Cloud Gateway是一个功能强大的API网关，它可以帮助我们实现请求路由、负载均衡、限流熔断、认证授权等功能。Spring Cloud Gateway基于Spring 5、Spring Boot 2和Project Reactor开发，具有高性能、响应式、异步非阻塞等特点。

在实际应用中，我们可以使用Spring Cloud Gateway作为微服务系统的入口，统一管理所有的请求，保护微服务系统免受流量冲击，提高系统的可用性和稳定性。

与Netflix Zuul相比，Spring Cloud Gateway具有以下优势：

- 基于响应式编程，性能更高
- 支持异步非阻塞
- 支持Spring Boot 2.x
- 提供了更丰富的过滤器和谓词
- 与Spring Cloud生态系统集成更好