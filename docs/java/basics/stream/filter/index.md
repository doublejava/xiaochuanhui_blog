# Java Stream Filter 操作详解

## 什么是Stream Filter操作

`filter`是Java Stream API中最常用的中间操作之一，它用于根据指定的条件过滤流中的元素，只保留满足条件的元素，生成一个新的流。`filter`操作接收一个`Predicate`函数式接口作为参数，该函数定义了过滤条件。

## Filter操作的核心概念

- **过滤**：根据条件保留或丢弃流中的元素
- **条件判断**：每个元素都会被应用到过滤函数，返回布尔值
- **中间操作**：返回新的流，需要终端操作触发执行
- **惰性求值**：只有在终端操作被调用时才会执行
- **无状态**：过滤操作不会改变原有的流元素

## Filter操作的语法

```java
Stream<T> filter(Predicate<? super T> predicate)
```

- **参数**：`predicate` - 应用于每个元素的过滤函数
- **返回值**：包含满足条件元素的新流
- **类型参数**：`T` - 流中元素的类型
- **Predicate接口**：接收一个输入参数，返回布尔值的函数式接口

## Filter操作的基本用法

### 1. 基本条件过滤

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 过滤出偶数
List<Integer> evenNumbers = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

// 输出：[2, 4, 6, 8, 10]
System.out.println(evenNumbers);
```

### 2. 字符串过滤

```java
List<String> words = Arrays.asList("apple", "banana", "orange", "grape", "watermelon");

// 过滤出长度大于5的水果
List<String> longWords = words.stream()
    .filter(word -> word.length() > 5)
    .collect(Collectors.toList());

// 输出：[banana, orange, watermelon]
System.out.println(longWords);
```

### 3. 对象属性过滤

```java
class Person {
    private String name;
    private int age;
    
    // 构造函数、getter、setter省略
}

List<Person> people = Arrays.asList(
    new Person("Alice", 25),
    new Person("Bob", 30),
    new Person("Charlie", 35),
    new Person("David", 40)
);

// 过滤出年龄大于30的人
List<Person> olderPeople = people.stream()
    .filter(person -> person.getAge() > 30)
    .collect(Collectors.toList());

// 输出：[Charlie, David]
System.out.println(olderPeople.stream().map(Person::getName).collect(Collectors.toList()));
```

## Filter操作的高级用法

### 1. 复合条件过滤

```java
List<Person> people = Arrays.asList(
    new Person("Alice", 25),
    new Person("Bob", 30),
    new Person("Charlie", 35),
    new Person("David", 40),
    new Person("Eve", 22)
);

// 过滤出年龄在25-35之间且名字长度大于3的人
List<Person> filteredPeople = people.stream()
    .filter(person -> person.getAge() >= 25 && person.getAge() <= 35)
    .filter(person -> person.getName().length() > 3)
    .collect(Collectors.toList());

// 输出：[Alice, Bob, Charlie]
System.out.println(filteredPeople.stream().map(Person::getName).collect(Collectors.toList()));
```

### 2. 使用Predicate组合

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 创建Predicate
Predicate<Integer> isEven = n -> n % 2 == 0;
Predicate<Integer> isGreaterThan5 = n -> n > 5;

// 组合Predicate：偶数且大于5
List<Integer> result = numbers.stream()
    .filter(isEven.and(isGreaterThan5))
    .collect(Collectors.toList());

// 输出：[6, 8, 10]
System.out.println(result);

// 组合Predicate：偶数或大于8
List<Integer> result2 = numbers.stream()
    .filter(isEven.or(n -> n > 8))
    .collect(Collectors.toList());

// 输出：[2, 4, 6, 8, 9, 10]
System.out.println(result2);

// 取反：不是偶数
List<Integer> result3 = numbers.stream()
    .filter(isEven.negate())
    .collect(Collectors.toList());

// 输出：[1, 3, 5, 7, 9]
System.out.println(result3);
```

### 3. 使用方法引用

```java
List<String> words = Arrays.asList("apple", "", "banana", "", "orange", "grape");

// 过滤出非空字符串
List<String> nonEmptyWords = words.stream()
    .filter(String::isEmpty)  // 过滤出空字符串
    .collect(Collectors.toList());

// 输出：[, ]
System.out.println(nonEmptyWords);

// 过滤出非空字符串（使用negate）
List<String> nonEmptyWords2 = words.stream()
    .filter(((Predicate<String>) String::isEmpty).negate())
    .collect(Collectors.toList());

// 输出：[apple, banana, orange, grape]
System.out.println(nonEmptyWords2);

// 或者更简洁的写法
List<String> nonEmptyWords3 = words.stream()
    .filter(word -> !word.isEmpty())
    .collect(Collectors.toList());
```

## Filter操作与其他Stream操作结合

### 1. Filter + Map

```java
List<String> words = Arrays.asList("hello", "world", "java", "stream", "filter");

// 先过滤长度大于5的单词，再转换为大写
List<String> result = words.stream()
    .filter(word -> word.length() > 5)
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// 输出：[HELLO, WORLD, STREAM]
System.out.println(result);
```

### 2. Filter + Sorted

```java
List<Person> people = Arrays.asList(
    new Person("Alice", 25),
    new Person("Bob", 30),
    new Person("Charlie", 35),
    new Person("David", 40)
);

// 先过滤年龄大于30的人，再按年龄排序
List<Person> sortedPeople = people.stream()
    .filter(person -> person.getAge() > 30)
    .sorted(Comparator.comparing(Person::getAge))
    .collect(Collectors.toList());

// 输出：[Charlie, David]
System.out.println(sortedPeople.stream().map(p -> p.getName() + "(" + p.getAge() + ")").collect(Collectors.toList()));
```

### 3. Filter + Reduce

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 计算所有偶数的和
int sumOfEvens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .reduce(0, Integer::sum);

// 输出：30
System.out.println(sumOfEvens);
```

### 4. Filter + Collect

```java
List<String> words = Arrays.asList("apple", "banana", "orange", "grape", "watermelon");

// 过滤出长度大于5的水果，然后收集到Set中
Set<String> longFruitsSet = words.stream()
    .filter(word -> word.length() > 5)
    .collect(Collectors.toSet());

// 输出：[banana, orange, watermelon]
System.out.println(longFruitsSet);

// 过滤出长度大于5的水果，然后收集到Map中（水果名称 -> 长度）
Map<String, Integer> fruitLengthMap = words.stream()
    .filter(word -> word.length() > 5)
    .collect(Collectors.toMap(Function.identity(), String::length));

// 输出：{banana=6, orange=6, watermelon=10}
System.out.println(fruitLengthMap);
```

## Filter操作的性能考虑

1. **过滤条件的复杂性**：过滤条件越复杂，filter操作的性能开销越大
2. **过滤顺序**：将更严格的过滤条件放在前面，可以减少后续操作的元素数量
3. **中间操作链**：多个中间操作链在一起时，会形成流水线，只有终端操作触发时才会执行
4. **并行流**：对于大数据量，可以考虑使用并行流 `parallelStream()` 提高性能
5. **避免副作用**：filter操作应该是无副作用的，不要修改外部状态

### 并行流中的Filter操作

```java
List<String> largeList = new ArrayList<>();
// 假设largeList包含大量元素

// 并行流处理
List<String> result = largeList.parallelStream()
    .filter(word -> word.length() > 5)
    .collect(Collectors.toList());
```

## Filter操作的常见误区

### 1. 过滤条件错误

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 错误：使用赋值操作符=而不是相等操作符==
List<Integer> result = numbers.stream()
    .filter(n -> n = 3) // 编译错误：意外的类型，需要布尔值
    .collect(Collectors.toList());

// 正确：使用相等操作符==
List<Integer> result = numbers.stream()
    .filter(n -> n == 3)
    .collect(Collectors.toList());
```

### 2. 修改共享状态

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> evenNumbers = new ArrayList<>();

// 错误：修改共享状态，不是线程安全的
numbers.stream()
    .filter(n -> n % 2 == 0)
    .forEach(n -> evenNumbers.add(n)); // 错误：修改共享状态

// 正确：使用collect收集结果
List<Integer> evenNumbers = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

### 3. 过滤后不使用终端操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 错误：filter是中间操作，不会执行
numbers.stream().filter(n -> n % 2 == 0); // 无效，没有终端操作

// 正确：添加终端操作
List<Integer> result = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

## Filter操作的最佳实践

1. **保持过滤条件简洁**：过滤条件应该只做一件事，保持简洁明了
2. **使用Predicate组合**：对于复杂条件，使用Predicate的and、or、negate方法组合
3. **合理的过滤顺序**：将更严格的过滤条件放在前面，减少后续操作的元素数量
4. **考虑并行流**：对于大数据量，使用并行流提高性能
5. **避免副作用**：过滤函数应该是无副作用的，不要修改外部状态
6. **使用collect收集结果**：使用collect方法将流转换为所需的集合类型
7. **使用方法引用**：当过滤逻辑与现有方法匹配时，优先使用方法引用
8. **避免空指针**：在过滤条件中处理可能的空值

## 空值处理

```java
List<String> words = Arrays.asList("hello", null, "world", null, "java");

// 过滤掉空值
List<String> nonNullWords = words.stream()
    .filter(Objects::nonNull)
    .collect(Collectors.toList());

// 输出：[hello, world, java]
System.out.println(nonNullWords);

// 过滤掉空值和空字符串
List<String> validWords = words.stream()
    .filter(word -> word != null && !word.isEmpty())
    .collect(Collectors.toList());
```

## Filter操作在实际开发中的应用

### 1. 数据查询

```java
List<User> users = getUserList(); // 从数据库获取用户列表

// 查询活跃用户
List<User> activeUsers = users.stream()
    .filter(User::isActive)
    .collect(Collectors.toList());

// 查询年龄大于18岁的用户
List<User> adultUsers = users.stream()
    .filter(user -> user.getAge() >= 18)
    .collect(Collectors.toList());
```

### 2. 数据验证

```java
List<String> emails = Arrays.asList(
    "user1@example.com",
    "invalid-email",
    "user2@example.com",
    "another-invalid-email"
);

// 验证邮箱格式
Pattern emailPattern = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
List<String> validEmails = emails.stream()
    .filter(email -> emailPattern.matcher(email).matches())
    .collect(Collectors.toList());

// 输出：[user1@example.com, user2@example.com]
System.out.println(validEmails);
```

### 3. 日志分析

```java
List<LogEntry> logs = getLogEntries(); // 从日志文件获取日志条目

// 过滤出错误日志
List<LogEntry> errorLogs = logs.stream()
    .filter(log -> log.getLevel() == LogLevel.ERROR)
    .collect(Collectors.toList());

// 过滤出特定时间范围内的日志
LocalDateTime startTime = LocalDateTime.now().minusHours(1);
LocalDateTime endTime = LocalDateTime.now();
List<LogEntry> recentLogs = logs.stream()
    .filter(log -> log.getTimestamp().isAfter(startTime) && log.getTimestamp().isBefore(endTime))
    .collect(Collectors.toList());
```

## Filter操作 vs Other Filtering Methods

| 方法 | 描述 | 适用场景 | 示例 |
|------|------|----------|------|
| `filter` | Stream API方法，用于过滤流中的元素 | 函数式编程，复杂数据处理 | `stream.filter(n -> n % 2 == 0)` |
| `removeIf` | Collection方法，用于移除集合中满足条件的元素 | 直接修改集合 | `list.removeIf(n -> n % 2 == 0)` |
| 传统for循环 | 使用for循环和if条件过滤 | 简单过滤场景 | `for (int n : list) { if (n % 2 == 0) { result.add(n); } }` |

## 总结

`filter`操作是Java Stream API中最强大、最常用的中间操作之一，它提供了一种简洁、高效的方式来过滤流中的元素。通过`filter`操作，我们可以：

- 根据各种条件过滤流中的元素
- 组合多个过滤条件
- 与其他Stream操作结合使用，实现复杂的数据处理逻辑
- 提高代码的可读性和可维护性
- 充分利用函数式编程的优势

掌握`filter`操作的使用，对于充分利用Java Stream API的强大功能至关重要。在实际开发中，我们应该根据具体需求，合理使用`filter`操作，编写简洁、高效、易维护的代码。