# Spring Boot 接口幂等性设计

发布于：2025-11-27

## 什么是接口幂等性

幂等性是指同一个操作无论执行多少次，结果都是相同的。在分布式系统中，接口幂等性设计非常重要，因为网络请求可能会因为各种原因（如网络延迟、重试机制等）被重复发送。如果接口不具备幂等性，重复请求可能会导致数据不一致、资源重复创建等问题。

## 幂等性的适用场景

接口幂等性主要适用于以下场景：

1. **支付接口**：防止重复扣款
2. **订单创建**：防止重复创建订单
3. **数据更新**：确保多次更新结果一致
4. **消息推送**：防止重复推送
5. **API 调用**：防止重复调用第三方 API

## 幂等性实现方案

### 1. 基于 Token 的实现

**原理**：
1. 客户端请求获取 Token
2. 服务器生成唯一 Token 并存储（如 Redis）
3. 客户端携带 Token 调用接口
4. 服务器验证 Token 并执行操作
5. 执行成功后删除 Token

**代码示例**：

```java
@RestController
@RequestMapping("/api")
public class IdempotentController {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // 获取 Token
    @GetMapping("/token")
    public ResponseEntity<String> getToken() {
        // 生成唯一 Token
        String token = UUID.randomUUID().toString();
        // 存储 Token 到 Redis，设置过期时间 5 分钟
        redisTemplate.opsForValue().set("token:" + token, "1", 5, TimeUnit.MINUTES);
        return ResponseEntity.ok(token);
    }

    // 幂等接口
    @PostMapping("/idempotent")
    public ResponseEntity<String> idempotentOperation(@RequestHeader("X-Token") String token) {
        // 验证 Token
        String key = "token:" + token;
        Boolean exists = redisTemplate.delete(key);
        if (!exists) {
            return ResponseEntity.badRequest().body("无效的 Token 或已被使用");
        }

        // 执行业务逻辑
        // ...

        return ResponseEntity.ok("操作成功");
    }
}
```

### 2. 基于数据库唯一约束

**原理**：
在数据库表中添加唯一约束，确保某些字段的组合是唯一的。当重复插入时，数据库会抛出唯一约束异常，从而实现幂等性。

**代码示例**：

```java
@Entity
@Table(name = "orders", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"order_no"})
})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_no", nullable = false)
    private String orderNo;
    
    // 其他字段...
}

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Transactional
    public Order createOrder(Order order) {
        try {
            return orderRepository.save(order);
        } catch (DataIntegrityViolationException e) {
            // 唯一约束冲突，返回已存在的订单
            return orderRepository.findByOrderNo(order.getOrderNo()).orElse(null);
        }
    }
}
```

### 3. 基于乐观锁

**原理**：
在数据库表中添加版本号字段，每次更新时检查版本号是否匹配。如果匹配则更新并递增版本号，否则更新失败。

**代码示例**：

```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    private Integer stock;
    
    @Version // 乐观锁版本号
    private Integer version;
    
    // getter 和 setter
}

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Transactional
    public Product reduceStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("商品不存在"));
        
        if (product.getStock() < quantity) {
            throw new RuntimeException("库存不足");
        }
        
        product.setStock(product.getStock() - quantity);
        return productRepository.save(product); // 会自动检查版本号
    }
}
```

### 4. 基于分布式锁

**原理**：
使用分布式锁（如 Redis 锁、ZooKeeper 锁）确保同一时间只有一个请求能执行操作。

**代码示例**：

```java
@Service
public class RedisLockService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 获取锁
    public boolean tryLock(String key, long expireTime) {
        return redisTemplate.opsForValue().setIfAbsent(key, "1", expireTime, TimeUnit.SECONDS);
    }
    
    // 释放锁
    public void releaseLock(String key) {
        redisTemplate.delete(key);
    }
}

@Service
public class OrderService {
    
    @Autowired
    private RedisLockService redisLockService;
    
    @Autowired
    private OrderRepository orderRepository;
    
    public Order createOrder(Order order) {
        String lockKey = "lock:order:" + order.getOrderNo();
        try {
            // 尝试获取锁，过期时间 5 秒
            boolean locked = redisLockService.tryLock(lockKey, 5);
            if (!locked) {
                throw new RuntimeException("操作过于频繁，请稍后重试");
            }
            
            // 检查订单是否已存在
            if (orderRepository.existsByOrderNo(order.getOrderNo())) {
                return orderRepository.findByOrderNo(order.getOrderNo()).orElse(null);
            }
            
            // 创建订单
            return orderRepository.save(order);
        } finally {
            // 释放锁
            redisLockService.releaseLock(lockKey);
        }
    }
}
```

### 5. 基于状态机

**原理**：
通过状态机控制业务流程，确保每个状态只能按照规定的流程转换，从而实现幂等性。

**代码示例**：

```java
public enum OrderStatus {
    CREATED, PAID, SHIPPED, DELIVERED, CANCELLED
}

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String orderNo;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    // 其他字段...
}

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Transactional
    public Order payOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("订单不存在"));
        
        // 检查订单状态，只有 CREATED 状态才能支付
        if (order.getStatus() != OrderStatus.CREATED) {
            return order;
        }
        
        // 执行支付逻辑
        // ...
        
        // 更新订单状态
        order.setStatus(OrderStatus.PAID);
        return orderRepository.save(order);
    }
}
```

## 幂等性设计注意事项

1. **Token 过期时间**：设置合理的过期时间，避免 Token 长时间占用资源
2. **并发处理**：考虑并发场景下的性能和安全性
3. **异常处理**：确保异常情况下资源能正确释放
4. **分布式环境**：确保在分布式环境下幂等性依然有效
5. **性能影响**：评估幂等性实现对系统性能的影响
6. **日志记录**：记录关键操作日志，便于排查问题

## 总结

接口幂等性设计是分布式系统中的重要环节，它可以确保系统在面对重复请求时依然保持数据一致性。本文介绍了 5 种常用的幂等性实现方案：基于 Token 的实现、基于数据库唯一约束、基于乐观锁、基于分布式锁和基于状态机。

在实际项目中，需要根据具体业务场景选择合适的幂等性实现方案。例如：
- 支付接口可以使用基于 Token + 数据库唯一约束的方案
- 订单创建可以使用基于数据库唯一约束的方案
- 数据更新可以使用基于乐观锁的方案
- 并发场景可以使用基于分布式锁的方案

合理的幂等性设计可以提高系统的可靠性和稳定性，减少因重复请求导致的问题。