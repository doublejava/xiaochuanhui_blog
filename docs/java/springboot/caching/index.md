# Spring Boot 缓存使用

发布于：2025-11-27

## 缓存概述

缓存是提高应用程序性能的重要手段之一，它可以将频繁访问的数据存储在内存中，减少对数据库或其他外部资源的访问，从而提高应用程序的响应速度。Spring Boot 提供了强大的缓存支持，可以轻松集成各种缓存实现。

## Spring Boot 缓存支持

Spring Boot 支持多种缓存实现，包括：

- **ConcurrentMapCacheManager**：基于 Java 并发 Map 的缓存实现，适用于开发和测试环境
- **EhCacheCacheManager**：基于 EhCache 的缓存实现
- **RedisCacheManager**：基于 Redis 的缓存实现，适用于分布式环境
- **CaffeineCacheManager**：基于 Caffeine 的缓存实现，性能优秀
- **HazelcastCacheManager**：基于 Hazelcast 的缓存实现，适用于分布式环境

## 实现缓存

### 1. 添加依赖

在 pom.xml 文件中添加 Spring Boot 缓存依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

如果需要使用特定的缓存实现，还需要添加相应的依赖，例如：

- **Redis**：
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-redis</artifactId>
  </dependency>
  ```

- **Caffeine**：
  ```xml
  <dependency>
      <groupId>com.github.ben-manes.caffeine</groupId>
      <artifactId>caffeine</artifactId>
  </dependency>
  ```

### 2. 启用缓存

在启动类上添加 @EnableCaching 注解，启用缓存功能：

```java
@SpringBootApplication
@EnableCaching
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 3. 配置缓存

可以在 application.properties 或 application.yml 文件中配置缓存：

#### 3.1 使用 ConcurrentMapCacheManager（默认）

不需要额外配置，Spring Boot 会自动配置 ConcurrentMapCacheManager。

#### 3.2 使用 CaffeineCacheManager

```ini
# 配置 Caffeine 缓存
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=60s
```

#### 3.3 使用 RedisCacheManager

```ini
# 配置 Redis 连接
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.password=

# 配置 Redis 缓存
spring.cache.type=redis
spring.cache.redis.time-to-live=60000
```

### 4. 在方法上使用缓存注解

Spring Boot 提供了以下缓存注解：

- **@Cacheable**：将方法的返回值缓存起来
- **@CachePut**：更新缓存
- **@CacheEvict**：删除缓存
- **@Caching**：组合多个缓存操作
- **@CacheConfig**：类级别的缓存配置

#### 4.1 @Cacheable 注解

@Cacheable 注解用于将方法的返回值缓存起来，当再次调用该方法时，如果缓存中存在该数据，则直接返回缓存中的数据，否则执行方法并将结果缓存起来。

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 将方法的返回值缓存到名为 "users" 的缓存中，缓存的 key 是方法的参数 id
    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        // 模拟数据库查询延迟
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return userRepository.findById(id).orElse(null);
    }
}
```

#### 4.2 @CachePut 注解

@CachePut 注解用于更新缓存，它会执行方法并将结果缓存起来，适用于更新操作。

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 更新缓存，缓存的 key 是方法的参数 user.id
    @CachePut(value = "users", key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

#### 4.3 @CacheEvict 注解

@CacheEvict 注解用于删除缓存，可以删除单个缓存或清空整个缓存。

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 删除指定 key 的缓存
    @CacheEvict(value = "users", key = "#id")
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    // 清空整个 "users" 缓存
    @CacheEvict(value = "users", allEntries = true)
    public void deleteAllUsers() {
        userRepository.deleteAll();
    }
}
```

#### 4.4 @Caching 注解

@Caching 注解用于组合多个缓存操作。

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 组合多个缓存操作
    @Caching(
        cacheable = {
            @Cacheable(value = "users", key = "#id")
        },
        evict = {
            @CacheEvict(value = "userList", allEntries = true)
        }
    )
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}
```

#### 4.5 @CacheConfig 注解

@CacheConfig 注解用于类级别的缓存配置，可以指定缓存名称等。

```java
@Service
@CacheConfig(cacheNames = "users") // 类级别的缓存配置
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 不需要再指定 value 属性
    @Cacheable(key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // 不需要再指定 value 属性
    @CachePut(key = "#user.id")
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}
```

### 5. 自定义缓存 key

可以通过 SpEL 表达式自定义缓存 key，例如：

```java
@Cacheable(value = "users", key = "#user.username + '-' + #user.email")
public User getUserByUsernameAndEmail(User user) {
    return userRepository.findByUsernameAndEmail(user.getUsername(), user.getEmail());
}

@Cacheable(value = "users", key = "#root.methodName + '-' + #root.args[0]")
public List<User> getUsersByAge(Integer age) {
    return userRepository.findByAge(age);
}
```

### 6. 条件缓存

可以通过 condition 属性指定条件，只有满足条件时才会缓存：

```java
@Cacheable(value = "users", key = "#id", condition = "#id > 0")
public User getUserById(Long id) {
    return userRepository.findById(id).orElse(null);
}

@Cacheable(value = "users", key = "#id", unless = "#result == null")
public User getUserById(Long id) {
    return userRepository.findById(id).orElse(null);
}
```

## 缓存的使用场景

1. **频繁访问的数据**：例如，系统配置、热门商品、用户信息等
2. **计算密集型操作**：例如，复杂的计算结果、报表数据等
3. **外部资源访问**：例如，调用第三方 API 的结果等
4. **数据库查询**：减少数据库查询次数，提高系统性能

## 缓存的注意事项

1. **缓存的一致性**：确保缓存数据与数据库数据的一致性，避免出现脏数据
2. **缓存的过期时间**：合理设置缓存的过期时间，避免缓存数据过期不更新
3. **缓存的容量**：合理设置缓存的容量，避免缓存占用过多内存
4. **缓存的穿透**：处理缓存中不存在的数据，避免频繁查询数据库
5. **缓存的雪崩**：避免大量缓存同时过期，导致系统压力骤增
6. **缓存的击穿**：处理热点数据的缓存过期问题，避免大量请求同时查询数据库

## 总结

Spring Boot 提供了强大的缓存支持，可以轻松集成各种缓存实现。通过使用 @Cacheable、@CachePut、@CacheEvict 等注解，可以方便地实现缓存功能，提高应用程序的性能。

在实际项目中，需要根据业务需求选择合适的缓存实现，并合理配置缓存的过期时间、容量等参数，确保缓存的一致性和性能。