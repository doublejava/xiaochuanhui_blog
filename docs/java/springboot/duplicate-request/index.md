# Spring Boot 接口重复请求处理

发布于：2025-11-27

## 什么是接口重复请求

接口重复请求是指客户端在短时间内对同一接口发送多次相同的请求。这种情况可能由以下原因导致：

1. **网络延迟**：客户端发送请求后，由于网络延迟没有及时收到响应，导致客户端重试
2. **用户误操作**：用户快速多次点击按钮
3. **前端框架问题**：前端框架或库的自动重试机制
4. **分布式系统**：分布式系统中的重试机制

接口重复请求可能会导致数据不一致、资源重复创建、业务逻辑错误等问题，因此需要进行处理。

## 重复请求处理方案

### 1. 前端处理

**原理**：
在前端层面防止重复请求，如禁用按钮、添加防抖/节流等。

**代码示例**：

```javascript
// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 使用防抖处理按钮点击
const button = document.getElementById('submit-btn');
button.addEventListener('click', debounce(() => {
    // 发送请求
    fetch('/api/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: 'test' })
    });
}, 1000));
```

### 2. 基于请求头的实现

**原理**：
1. 客户端在请求头中添加唯一标识（如请求ID）
2. 服务器存储请求ID到缓存（如 Redis）
3. 如果短时间内收到相同请求ID的请求，则直接返回之前的结果

**代码示例**：

```java
@RestController
@RequestMapping("/api")
public class DuplicateRequestController {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @PostMapping("/submit")
    public ResponseEntity<String> submit(@RequestHeader(value = "X-Request-ID", required = false) String requestId) {
        if (requestId != null) {
            // 检查请求是否已处理
            String key = "request:" + requestId;
            String result = redisTemplate.opsForValue().get(key);
            if (result != null) {
                // 返回之前的处理结果
                return ResponseEntity.ok(result);
            }
        }

        // 执行业务逻辑
        String result = "操作成功";

        if (requestId != null) {
            // 存储请求结果到 Redis，设置过期时间 1 分钟
            redisTemplate.opsForValue().set("request:" + requestId, result, 1, TimeUnit.MINUTES);
        }

        return ResponseEntity.ok(result);
    }
}
```

### 3. 基于 Spring AOP 的实现

**原理**：
使用 Spring AOP 拦截请求，通过请求签名（如 URL + 参数 + 用户ID）判断是否为重复请求。

**代码示例**：

```java
// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface NoRepeatSubmit {
    // 过期时间（秒）
    int expireTime() default 1;
}

// AOP 切面
@Aspect
@Component
public class NoRepeatSubmitAspect {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Pointcut("@annotation(com.example.annotation.NoRepeatSubmit)")
    public void noRepeatSubmit() {}

    @Around("noRepeatSubmit()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取请求对象
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        // 获取用户ID（假设已登录）
        Long userId = (Long) request.getSession().getAttribute("userId");
        // 获取请求URL
        String url = request.getRequestURI();
        // 获取请求参数
        String params = JSON.toJSONString(joinPoint.getArgs());
        // 生成请求签名
        String signature = userId + "_" + url + "_" + DigestUtils.md5DigestAsHex(params.getBytes());
        // 获取注解
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        NoRepeatSubmit annotation = methodSignature.getMethod().getAnnotation(NoRepeatSubmit.class);
        int expireTime = annotation.expireTime();

        // 检查是否为重复请求
        String key = "repeat:submit:" + signature;
        Boolean exists = redisTemplate.hasKey(key);
        if (exists) {
            throw new RuntimeException("操作过于频繁，请稍后重试");
        }

        // 存储请求签名到 Redis
        redisTemplate.opsForValue().set(key, "1", expireTime, TimeUnit.SECONDS);

        // 执行方法
        Object result = joinPoint.proceed();

        return result;
    }
}

// 使用注解
@RestController
@RequestMapping("/api")
public class SubmitController {

    @PostMapping("/submit")
    @NoRepeatSubmit(expireTime = 2) // 2秒内不允许重复请求
    public ResponseEntity<String> submit(@RequestBody SubmitRequest request) {
        // 执行业务逻辑
        return ResponseEntity.ok("操作成功");
    }
}
```

### 4. 基于 Redis + 拦截器的实现

**原理**：
1. 拦截所有请求
2. 生成请求唯一标识
3. 检查 Redis 中是否存在该标识
4. 如果存在则拒绝请求，否则允许请求并存储标识到 Redis

**代码示例**：

```java
// 重复请求拦截器
@Component
public class DuplicateRequestInterceptor implements HandlerInterceptor {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 只拦截 POST 请求
        if (!"POST".equals(request.getMethod())) {
            return true;
        }

        // 获取用户ID（假设已登录）
        Long userId = (Long) request.getSession().getAttribute("userId");
        // 获取请求URL
        String url = request.getRequestURI();
        // 获取请求参数
        String params = getRequestParams(request);
        // 生成请求签名
        String signature = userId + "_" + url + "_" + DigestUtils.md5DigestAsHex(params.getBytes());

        // 检查是否为重复请求
        String key = "repeat:request:" + signature;
        Boolean exists = redisTemplate.hasKey(key);
        if (exists) {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(JSON.toJSONString("操作过于频繁，请稍后重试"));
            return false;
        }

        // 存储请求签名到 Redis，设置过期时间 1 秒
        redisTemplate.opsForValue().set(key, "1", 1, TimeUnit.SECONDS);

        return true;
    }

    // 获取请求参数
    private String getRequestParams(HttpServletRequest request) throws IOException {
        if ("application/json".equals(request.getContentType())) {
            // JSON 请求体
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        } else {
            // 表单参数
            Map<String, String[]> parameterMap = request.getParameterMap();
            return JSON.toJSONString(parameterMap);
        }
    }
}

// 注册拦截器
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private DuplicateRequestInterceptor duplicateRequestInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(duplicateRequestInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/static/**", "/error");
    }
}
```

### 5. 基于令牌桶算法的实现

**原理**：
使用令牌桶算法控制请求速率，只允许一定速率的请求通过。

**代码示例**：

```java
// 令牌桶实现
@Component
public class TokenBucket {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    /**
     * 检查是否允许请求
     * @param key 令牌桶 key
     * @param capacity 令牌桶容量
     * @param rate 令牌生成速率（个/秒）
     * @return 是否允许请求
     */
    public boolean allowRequest(String key, int capacity, double rate) {
        String bucketKey = "token:bucket:" + key;
        String lastRefillTimeKey = "token:last:refill:" + key;
        String tokensKey = "token:count:" + key;

        // 获取当前时间
        long now = System.currentTimeMillis();
        // 获取上次填充时间
        String lastRefillTimeStr = redisTemplate.opsForValue().get(lastRefillTimeKey);
        long lastRefillTime = lastRefillTimeStr != null ? Long.parseLong(lastRefillTimeStr) : now;
        // 获取当前令牌数
        String tokensStr = redisTemplate.opsForValue().get(tokensKey);
        double currentTokens = tokensStr != null ? Double.parseDouble(tokensStr) : capacity;

        // 计算时间差
        double timeElapsed = (now - lastRefillTime) / 1000.0;
        // 计算新生成的令牌数
        double newTokens = Math.min(capacity, currentTokens + timeElapsed * rate);

        if (newTokens < 1) {
            // 令牌不足，拒绝请求
            return false;
        }

        // 消耗一个令牌
        newTokens -= 1;

        // 更新令牌数和上次填充时间
        redisTemplate.opsForValue().set(tokensKey, String.valueOf(newTokens));
        redisTemplate.opsForValue().set(lastRefillTimeKey, String.valueOf(now));

        return true;
    }
}

// 使用令牌桶
@RestController
@RequestMapping("/api")
public class RateLimitController {

    @Autowired
    private TokenBucket tokenBucket;

    @PostMapping("/submit")
    public ResponseEntity<String> submit(HttpServletRequest request) {
        // 获取用户ID（假设已登录）
        Long userId = (Long) request.getSession().getAttribute("userId");
        // 生成令牌桶 key
        String key = "user:" + userId;
        // 检查是否允许请求（令牌桶容量 10，速率 5 个/秒）
        boolean allowed = tokenBucket.allowRequest(key, 10, 5);
        if (!allowed) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("请求过于频繁，请稍后重试");
        }

        // 执行业务逻辑
        return ResponseEntity.ok("操作成功");
    }
}
```

## 重复请求处理注意事项

1. **请求标识生成**：确保请求标识的唯一性，避免误判
2. **过期时间设置**：根据业务场景设置合理的过期时间
3. **并发处理**：考虑并发场景下的性能和安全性
4. **分布式环境**：确保在分布式环境下处理机制依然有效
5. **用户体验**：给用户友好的提示信息
6. **日志记录**：记录重复请求日志，便于排查问题

## 总结

接口重复请求处理是保证系统稳定性和数据一致性的重要手段。本文介绍了 5 种常用的处理方案：

1. **前端处理**：通过禁用按钮、防抖/节流等方式防止重复请求
2. **基于请求头的实现**：使用请求ID标识请求，返回缓存结果
3. **基于 Spring AOP 的实现**：使用注解和 AOP 拦截重复请求
4. **基于 Redis + 拦截器的实现**：拦截所有请求，检查请求签名
5. **基于令牌桶算法的实现**：控制请求速率，只允许一定速率的请求通过

在实际项目中，需要根据具体业务场景选择合适的处理方案。例如：
- 对于支付、订单创建等关键接口，可以使用基于 AOP + Redis 的方案
- 对于一般接口，可以使用基于拦截器的方案
- 对于高并发接口，可以使用令牌桶算法控制请求速率

合理的重复请求处理机制可以提高系统的可靠性和稳定性，减少因重复请求导致的问题。