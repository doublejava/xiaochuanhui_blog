# Java Stream Map 操作详解

## 什么是Stream Map操作

`map`是Java Stream API中最常用的中间操作之一，它用于将流中的每个元素转换为另一个元素，生成一个新的流。`map`操作接收一个`Function`函数式接口作为参数，该函数定义了如何将输入元素转换为输出元素。

## Map操作的核心概念

- **转换**：将流中的每个元素应用转换函数，生成新的元素
- **一对一**：每个输入元素对应一个输出元素
- **中间操作**：返回新的流，需要终端操作触发执行
- **惰性求值**：只有在终端操作被调用时才会执行

## Map操作的语法

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper)
```

- **参数**：`mapper` - 应用于每个元素的转换函数
- **返回值**：包含转换后元素的新流
- **类型参数**：`R` - 新流中元素的类型

## Map操作的基本用法

### 1. 基本类型转换

```java
List<String> strings = Arrays.asList("1", "2", "3", "4", "5");

// 将字符串转换为整数
List<Integer> numbers = strings.stream()
    .map(Integer::parseInt)
    .collect(Collectors.toList());

// 输出：[1, 2, 3, 4, 5]
System.out.println(numbers);
```

### 2. 对象属性提取

```java
class Person {
    private String name;
    private int age;
    
    // 构造函数、getter、setter省略
}

List<Person> people = Arrays.asList(
    new Person("Alice", 25),
    new Person("Bob", 30),
    new Person("Charlie", 35)
);

// 提取所有人的姓名
List<String> names = people.stream()
    .map(Person::getName)
    .collect(Collectors.toList());

// 输出：[Alice, Bob, Charlie]
System.out.println(names);
```

### 3. 字符串处理

```java
List<String> words = Arrays.asList("hello", "world", "java", "stream");

// 将所有字符串转换为大写
List<String> upperCaseWords = words.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// 输出：[HELLO, WORLD, JAVA, STREAM]
System.out.println(upperCaseWords);

// 计算每个字符串的长度
List<Integer> wordLengths = words.stream()
    .map(String::length)
    .collect(Collectors.toList());

// 输出：[5, 5, 4, 6]
System.out.println(wordLengths);
```

## Map操作的高级用法

### 1. 自定义转换函数

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 自定义转换：将数字转换为平方值
List<Integer> squares = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());

// 输出：[1, 4, 9, 16, 25]
System.out.println(squares);

// 自定义转换：将数字转换为字符串表示
List<String> numberStrings = numbers.stream()
    .map(n -> "Number: " + n)
    .collect(Collectors.toList());

// 输出：[Number: 1, Number: 2, Number: 3, Number: 4, Number: 5]
System.out.println(numberStrings);
```

### 2. 链式Map操作

```java
List<String> strings = Arrays.asList("  hello  ", "  world  ", "  java  ");

// 链式转换：先去除空格，再转换为大写，最后添加前缀
List<String> processedStrings = strings.stream()
    .map(String::trim)           // 去除空格
    .map(String::toUpperCase)    // 转换为大写
    .map(s -> "Processed: " + s) // 添加前缀
    .collect(Collectors.toList());

// 输出：[Processed: HELLO, Processed: WORLD, Processed: JAVA]
System.out.println(processedStrings);
```

### 3. 使用方法引用

```java
List<Date> dates = Arrays.asList(
    new Date(System.currentTimeMillis() - 86400000),
    new Date(),
    new Date(System.currentTimeMillis() + 86400000)
);

// 使用方法引用获取日期的时间戳
List<Long> timestamps = dates.stream()
    .map(Date::getTime)
    .collect(Collectors.toList());

// 输出：包含三个日期的时间戳
System.out.println(timestamps);
```

## Map操作与其他Stream操作结合

### 1. Map + Filter

```java
List<String> words = Arrays.asList("hello", "world", "java", "stream", "map", "filter");

// 先转换为大写，再过滤长度大于5的字符串
List<String> result = words.stream()
    .map(String::toUpperCase)
    .filter(s -> s.length() > 5)
    .collect(Collectors.toList());

// 输出：[HELLO, WORLD, STREAM]
System.out.println(result);
```

### 2. Map + Sorted

```java
List<String> words = Arrays.asList("hello", "world", "java", "stream");

// 先转换为长度，再排序
List<Integer> sortedLengths = words.stream()
    .map(String::length)
    .sorted()
    .collect(Collectors.toList());

// 输出：[4, 5, 5, 6]
System.out.println(sortedLengths);
```

### 3. Map + Reduce

```java
List<String> words = Arrays.asList("hello", "world", "java");

// 计算所有字符串的总长度
int totalLength = words.stream()
    .map(String::length)
    .reduce(0, Integer::sum);

// 输出：14
System.out.println(totalLength);
```

## Map操作的性能考虑

1. **转换函数的复杂性**：转换函数越复杂，map操作的性能开销越大
2. **中间操作链**：多个中间操作链在一起时，会形成流水线，只有终端操作触发时才会执行
3. **并行流**：对于大数据量，可以考虑使用并行流 `parallelStream()` 提高性能
4. **避免副作用**：map操作应该是无副作用的，不要修改外部状态

### 并行流中的Map操作

```java
List<String> largeList = new ArrayList<>();
// 假设largeList包含大量元素

// 并行流处理
List<Integer> result = largeList.parallelStream()
    .map(String::length)
    .collect(Collectors.toList());
```

## Map操作的常见误区

### 1. 忽略返回值

```java
// 错误：map操作返回新的流，原流不会被修改
List<String> words = Arrays.asList("hello", "world");
words.stream().map(String::toUpperCase); // 无效，没有使用返回的流

// 正确：使用返回的流
List<String> upperCaseWords = words.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

### 2. 修改共享状态

```java
// 错误：修改共享状态，不是线程安全的
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> result = new ArrayList<>();

numbers.stream()
    .map(n -> {
        result.add(n * 2); // 错误：修改共享状态
        return n * 2;
    })
    .collect(Collectors.toList());

// 正确：使用collect收集结果
List<Integer> result = numbers.stream()
    .map(n -> n * 2)
    .collect(Collectors.toList());
```

## Map操作 vs FlatMap操作

| 操作 | 描述 | 输入 | 输出 | 示例 |
|------|------|------|------|------|
| `map` | 将每个元素转换为另一个元素 | 单个元素 | 单个元素 | `stream.map(String::length)` |
| `flatMap` | 将每个元素转换为一个流，然后合并为一个流 | 单个元素 | 流 | `listOfLists.stream().flatMap(List::stream)` |

### FlatMap示例

```java
// 二维列表转换为一维列表
List<List<Integer>> listOfLists = Arrays.asList(
    Arrays.asList(1, 2, 3),
    Arrays.asList(4, 5, 6),
    Arrays.asList(7, 8, 9)
);

// 使用flatMap
List<Integer> flattenedList = listOfLists.stream()
    .flatMap(List::stream)
    .collect(Collectors.toList());

// 输出：[1, 2, 3, 4, 5, 6, 7, 8, 9]
System.out.println(flattenedList);
```

## Map操作的实际应用场景

### 1. 数据转换

```java
// JSON字符串转换为对象
List<String> jsonStrings = Arrays.asList(
    "{\"name\":\"Alice\",\"age\":25}",
    "{\"name\":\"Bob\",\"age\":30}"
);

// 使用Jackson库将JSON转换为Person对象
ObjectMapper objectMapper = new ObjectMapper();
List<Person> people = jsonStrings.stream()
    .map(json -> {
        try {
            return objectMapper.readValue(json, Person.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    })
    .collect(Collectors.toList());
```

### 2. 数据格式化

```java
List<Date> dates = Arrays.asList(new Date(), new Date(System.currentTimeMillis() + 86400000));
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

// 格式化日期
List<String> formattedDates = dates.stream()
    .map(sdf::format)
    .collect(Collectors.toList());
```

### 3. 数据提取

```java
List<Order> orders = getOrders(); // 假设从数据库获取订单

// 提取所有订单的商品ID
List<Long> productIds = orders.stream()
    .map(Order::getProductId)
    .collect(Collectors.toList());
```

## Map操作的最佳实践

1. **使用方法引用简化代码**：当转换逻辑与现有方法匹配时，优先使用方法引用
2. **保持转换函数简洁**：转换函数应该只做一件事，保持简洁明了
3. **链式调用**：合理使用链式调用，提高代码可读性
4. **考虑并行流**：对于大数据量，使用并行流提高性能
5. **避免副作用**：转换函数应该是无副作用的，不要修改外部状态
6. **使用collect收集结果**：使用collect方法将流转换为所需的集合类型
7. **异常处理**：在转换函数中妥善处理异常

## 总结

`map`操作是Java Stream API中最强大、最常用的中间操作之一，它提供了一种简洁、高效的方式来转换流中的元素。通过`map`操作，我们可以：

- 将一种类型的元素转换为另一种类型
- 提取对象的属性
- 对元素进行各种处理和转换
- 与其他Stream操作结合使用，实现复杂的数据处理逻辑

掌握`map`操作的使用，对于充分利用Java Stream API的强大功能至关重要。在实际开发中，我们应该根据具体需求，合理使用`map`操作，编写简洁、高效、易维护的代码。