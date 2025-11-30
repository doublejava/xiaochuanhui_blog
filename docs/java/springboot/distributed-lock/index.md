# Spring Boot 分布式锁实现

在分布式系统中，分布式锁是一种重要的同步机制，用于解决多个节点之间的资源竞争问题。本文将详细介绍Spring Boot中分布式锁的实现方式和最佳实践。

## 1. 分布式锁的基本概念

分布式锁是指在分布式环境中，用于控制多个节点对共享资源访问的锁机制。它需要满足以下特性：

1. **互斥性**：同一时间只有一个节点可以持有锁
2. **可重入性**：同一节点可以多次获取同一把锁
3. **超时释放**：防止死锁，锁必须有超时机制
4. **高可用**：锁服务必须高可用，避免单点故障
5. **高性能**：锁的获取和释放操作必须高效

## 2. 分布式锁的实现方式

### 2.1 基于Redis的分布式锁

Redis是实现分布式锁的常用方案，通过SETNX命令（SET if Not eXists）可以实现原子性的锁获取操作。

#### 2.1.1 基本实现

```java
@Component
public class RedisDistributedLock {
    
    @Autowired
    private StringRedisTemplate redisTemplate;
    
    // 锁的过期时间，单位：毫秒
    private static final long LOCK_EXPIRE = 30000;
    
    // 获取锁的超时时间，单位：毫秒
    private static final long LOCK_TIMEOUT = 10000;
    
    /**
     * 获取分布式锁
     * @param lockKey 锁的key
     * @param requestId 请求ID，用于标识锁的持有者
     * @return 是否获取成功
     */
    public boolean lock(String lockKey, String requestId) {
        long start = System.currentTimeMillis();
        
        try {
            while (true) {
                // 尝试获取锁
                Boolean result = redisTemplate.opsForValue().setIfAbsent(lockKey, requestId, LOCK_EXPIRE, TimeUnit.MILLISECONDS);
                if (result != null && result) {
                    // 获取锁成功
                    return true;
                }
                
                // 计算已经等待的时间
                long end = System.currentTimeMillis();
                if (end - start > LOCK_TIMEOUT) {
                    // 获取锁超时
                    return false;
                }
                
                // 短暂休眠，避免频繁尝试
                Thread.sleep(100);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    /**
     * 释放分布式锁
     * @param lockKey 锁的key
     * @param requestId 请求ID，用于验证锁的持有者
     * @return 是否释放成功
     */
    public boolean unlock(String lockKey, String requestId) {
        // 使用Lua脚本确保释放锁的原子性
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
        
        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(script);
        redisScript.setResultType(Long.class);
        
        Long result = redisTemplate.execute(redisScript, Collections.singletonList(lockKey), requestId);
        
        return result != null && result > 0;
    }
}
```

#### 2.1.2 使用Redisson实现分布式锁

Redisson是一个功能强大的Redis客户端，提供了分布式锁的完整实现：

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson-spring-boot-starter</artifactId>
    <version>3.17.3</version>
</dependency>
```

```java
@Component
public class RedissonDistributedLock {
    
    @Autowired
    private RedissonClient redissonClient;
    
    /**
     * 获取分布式锁
     * @param lockKey 锁的key
     * @return 锁对象
     */
    public RLock getLock(String lockKey) {
        return redissonClient.getLock(lockKey);
    }
    
    /**
     * 使用分布式锁执行任务
     * @param lockKey 锁的key
     * @param task 要执行的任务
     * @param <T> 任务返回值类型
     * @return 任务执行结果
     */
    public <T> T executeWithLock(String lockKey, Callable<T> task) throws Exception {
        RLock lock = getLock(lockKey);
        try {
            // 尝试获取锁，最多等待10秒，锁过期时间30秒
            if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
                // 执行任务
                return task.call();
            } else {
                throw new RuntimeException("获取分布式锁失败");
            }
        } finally {
            // 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

### 2.2 基于ZooKeeper的分布式锁

ZooKeeper是一个分布式协调服务，可以用于实现分布式锁。通过创建临时顺序节点和监听机制，可以实现可靠的分布式锁。

#### 2.2.1 添加依赖

```xml
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>5.2.1</version>
</dependency>
```

#### 2.2.2 实现分布式锁

```java
@Configuration
public class CuratorConfig {
    
    @Value("${zookeeper.connect-string}")
    private String connectString;
    
    @Bean
    public CuratorFramework curatorFramework() {
        RetryPolicy retryPolicy = new ExponentialBackoffRetry(1000, 3);
        CuratorFramework client = CuratorFrameworkFactory.newClient(connectString, retryPolicy);
        client.start();
        return client;
    }
    
    @Bean
    public InterProcessMutex distributedLock(CuratorFramework curatorFramework) {
        // 锁的路径
        String lockPath = "/distributed-lock";
        return new InterProcessMutex(curatorFramework, lockPath);
    }
}

@Component
public class ZooKeeperDistributedLock {
    
    @Autowired
    private InterProcessMutex distributedLock;
    
    /**
     * 使用分布式锁执行任务
     * @param task 要执行的任务
     * @param <T> 任务返回值类型
     * @return 任务执行结果
     */
    public <T> T executeWithLock(Callable<T> task) throws Exception {
        try {
            // 尝试获取锁，最多等待10秒
            if (distributedLock.acquire(10, TimeUnit.SECONDS)) {
                // 执行任务
                return task.call();
            } else {
                throw new RuntimeException("获取分布式锁失败");
            }
        } finally {
            // 释放锁
            if (distributedLock.isAcquiredInThisProcess()) {
                distributedLock.release();
            }
        }
    }
}
```

### 2.3 基于数据库的分布式锁

数据库也是实现分布式锁的一种方案，通过唯一约束和事务可以实现分布式锁。

#### 2.3.1 创建锁表

```sql
CREATE TABLE `distributed_lock` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lock_key` varchar(255) NOT NULL COMMENT '锁的key',
  `request_id` varchar(255) NOT NULL COMMENT '请求ID',
  `expire_time` datetime NOT NULL COMMENT '过期时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lock_key` (`lock_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分布式锁表';
```

#### 2.3.2 实现分布式锁

```java
@Repository
public interface DistributedLockRepository extends JpaRepository<DistributedLock, Long> {
    
    Optional<DistributedLock> findByLockKey(String lockKey);
    
    @Modifying
    @Query("DELETE FROM DistributedLock WHERE expireTime < :now")
    void deleteExpiredLocks(@Param("now") LocalDateTime now);
}

@Component
public class DatabaseDistributedLock {
    
    @Autowired
    private DistributedLockRepository lockRepository;
    
    @Autowired
    private EntityManager entityManager;
    
    // 锁的过期时间，单位：秒
    private static final long LOCK_EXPIRE = 30;
    
    /**
     * 获取分布式锁
     * @param lockKey 锁的key
     * @param requestId 请求ID
     * @return 是否获取成功
     */
    @Transactional
    public boolean lock(String lockKey, String requestId) {
        // 清理过期的锁
        lockRepository.deleteExpiredLocks(LocalDateTime.now());
        
        try {
            // 创建锁记录
            DistributedLock lock = new DistributedLock();
            lock.setLockKey(lockKey);
            lock.setRequestId(requestId);
            lock.setExpireTime(LocalDateTime.now().plusSeconds(LOCK_EXPIRE));
            lockRepository.save(lock);
            return true;
        } catch (DataIntegrityViolationException e) {
            // 唯一约束冲突，说明锁已被其他节点持有
            return false;
        }
    }
    
    /**
     * 释放分布式锁
     * @param lockKey 锁的key
     * @param requestId 请求ID
     * @return 是否释放成功
     */
    @Transactional
    public boolean unlock(String lockKey, String requestId) {
        Optional<DistributedLock> lockOptional = lockRepository.findByLockKey(lockKey);
        if (lockOptional.isPresent()) {
            DistributedLock lock = lockOptional.get();
            if (lock.getRequestId().equals(requestId)) {
                lockRepository.delete(lock);
                return true;
            }
        }
        return false;
    }
}
```

## 3. 分布式锁的最佳实践

1. **选择合适的实现方案**：根据业务需求和系统架构选择合适的分布式锁实现方案
2. **设置合理的锁超时时间**：根据业务执行时间设置合理的锁超时时间，避免锁过期导致的数据不一致
3. **使用看门狗机制**：对于长时间运行的任务，可以使用看门狗机制自动续期锁
4. **避免锁粒度过大**：锁的粒度应该尽可能小，只锁定必要的资源
5. **处理锁获取失败的情况**：实现合理的重试机制和降级策略
6. **监控锁的使用情况**：监控锁的获取成功率、等待时间等指标，及时发现问题
7. **考虑锁的公平性**：根据业务需求选择公平锁或非公平锁

## 4. 分布式锁的应用场景

1. **库存扣减**：防止超卖
2. **订单创建**：防止重复下单
3. **分布式任务调度**：防止任务重复执行
4. **分布式事务**：确保事务的原子性
5. **共享资源访问**：如配置文件更新、缓存刷新等

## 5. 常见问题

1. **锁过期导致的数据不一致**：解决方法是使用看门狗机制自动续期锁，或优化业务逻辑减少执行时间
2. **死锁**：确保锁有超时机制，并且在获取锁失败时能够正确释放资源
3. **锁服务单点故障**：使用高可用的锁服务，如Redis集群、ZooKeeper集群
4. **锁竞争激烈导致性能下降**：优化锁粒度，或使用分段锁等技术减少锁竞争
5. **重入性问题**：确保分布式锁支持重入，或在设计时避免重入场景

通过合理使用分布式锁，可以解决分布式系统中的资源竞争问题，确保系统的正确性和一致性。在实际应用中，需要根据业务需求和系统架构选择合适的分布式锁实现方案，并遵循最佳实践。