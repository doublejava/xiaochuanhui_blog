# Java Stream 详解与实践

## 什么是Java Stream

Java Stream是Java 8引入的一种处理集合数据的全新方式，它允许以声明式方式处理数据集合。Stream API提供了一种高效且易于使用的数据处理方式，可以进行过滤、映射、排序、聚合等操作。

## Stream的核心特点

- **声明式编程**：关注"做什么"而非"怎么做"
- **链式操作**：支持连续的操作调用
- **惰性求值**：只有当终端操作被调用时，中间操作才会执行
- **并行处理**：支持并行流，充分利用多核处理器
- **不可变性**：操作不会修改原始数据源

## Stream的创建方式

### 1. 从集合创建

```java
List<String> list = Arrays.asList("apple", "banana", "orange");
Stream<String> stream = list.stream();
Stream<String> parallelStream = list.parallelStream();
```

### 2. 从数组创建

```java
String[] array = {"apple", "banana", "orange"};
Stream<String> stream = Arrays.stream(array);
```

### 3. 使用Stream.of()

```java
Stream<String> stream = Stream.of("apple", "banana", "orange");
```

### 4. 创建空Stream

```java
Stream<String> emptyStream = Stream.empty();
```

### 5. 无限流

```java
// 生成无限流
Stream<Integer> infiniteStream = Stream.iterate(0, n -> n + 2);

// 生成随机数流
Stream<Double> randomStream = Stream.generate(Math::random);
```

## Stream的操作类型

### 1. 中间操作

- **filter**：过滤元素
- **map**：转换元素
- **flatMap**：将流中的每个元素转换为另一个流，然后合并成一个流
- **distinct**：去重
- **sorted**：排序
- **peek**：查看元素
- **limit**：限制元素数量
- **skip**：跳过元素

### 2. 终端操作

- **forEach**：遍历元素
- **collect**：收集流元素到集合
- **reduce**：归约操作
- **count**：计数
- **anyMatch**：任意匹配
- **allMatch**：全部匹配
- **noneMatch**：没有匹配
- **findFirst**：找到第一个元素
- **findAny**：找到任意元素
- **min**：最小值
- **max**：最大值

## Stream操作示例

### 1. 过滤和映射

```java
List<String> fruits = Arrays.asList("apple", "banana", "orange", "grape", "watermelon");

// 过滤出长度大于5的水果，并转换为大写
List<String> result = fruits.stream()
    .filter(fruit -> fruit.length() > 5)
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// 输出：[BANANA, ORANGE, WATERMELON]
System.out.println(result);
```

### 2. 排序和限制

```java
List<Integer> numbers = Arrays.asList(5, 3, 8, 1, 9, 2);

// 排序并取前3个
List<Integer> sortedNumbers = numbers.stream()
    .sorted()
    .limit(3)
    .collect(Collectors.toList());

// 输出：[1, 2, 3]
System.out.println(sortedNumbers);
```

### 3. 归约操作

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// 求和
int sum = numbers.stream()
    .reduce(0, Integer::sum);

// 输出：15
System.out.println(sum);
```

### 4. 分组和分区

```java
List<String> fruits = Arrays.asList("apple", "banana", "orange", "grape", "watermelon", "avocado");

// 按首字母分组
Map<Character, List<String>> groupedFruits = fruits.stream()
    .collect(Collectors.groupingBy(fruit -> fruit.charAt(0)));

// 输出：{A=[apple, avocado], B=[banana], G=[grape], O=[orange], W=[watermelon]}
System.out.println(groupedFruits);

// 按长度分区（长度大于5和小于等于5）
Map<Boolean, List<String>> partitionedFruits = fruits.stream()
    .collect(Collectors.partitioningBy(fruit -> fruit.length() > 5));

// 输出：{false=[apple, grape], true=[banana, orange, watermelon, avocado]}
System.out.println(partitionedFruits);
```

### 5. 并行流操作

```java
List<Integer> numbers = IntStream.range(1, 1000000).boxed().collect(Collectors.toList());

// 并行流求和
long startTime = System.currentTimeMillis();
long sum = numbers.parallelStream()
    .reduce(0L, Long::sum);
long endTime = System.currentTimeMillis();

// 输出：总和: 499999500000, 耗时: X ms
System.out.println("总和: " + sum + ", 耗时: " + (endTime - startTime) + " ms");
```

## Stream vs 传统集合操作

### 传统方式

```java
List<String> result = new ArrayList<>();
for (String fruit : fruits) {
    if (fruit.length() > 5) {
        result.add(fruit.toUpperCase());
    }
}
```

### Stream方式

```java
List<String> result = fruits.stream()
    .filter(fruit -> fruit.length() > 5)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

## Stream的最佳实践

1. **优先使用Stream API**：对于复杂的数据处理，Stream API更简洁易读
2. **注意惰性求值**：避免在中间操作中执行耗时操作
3. **合理使用并行流**：对于大数据量，并行流能提高性能，但小数据量可能会有 overhead
4. **避免修改外部状态**：Stream操作应该是无副作用的
5. **使用合适的收集器**：Collectors类提供了丰富的收集器，如toList、toSet、groupingBy等
6. **注意关闭资源流**：对于IO流，应该使用try-with-resources

## Stream的性能考虑

- **小数据量**：串行流可能比并行流更快
- **大数据量**：并行流能充分利用多核处理器
- **复杂操作**：并行流在复杂操作中优势更明显
- **避免频繁切换**：不要在串行流和并行流之间频繁切换

## 常见Stream操作汇总

### 1. 转换操作

| 操作 | 描述 | 示例 |
|------|------|------|
| map | 转换元素 | `stream.map(String::toUpperCase)` |
| flatMap | 转换为流并合并 | `listOfLists.stream().flatMap(List::stream)` |
| peek | 查看元素 | `stream.peek(System.out::println)` |

### 2. 过滤操作

| 操作 | 描述 | 示例 |
|------|------|------|
| filter | 过滤元素 | `stream.filter(fruit -> fruit.length() > 5)` |
| distinct | 去重 | `stream.distinct()` |
| limit | 限制数量 | `stream.limit(5)` |
| skip | 跳过元素 | `stream.skip(2)` |

### 3. 排序操作

| 操作 | 描述 | 示例 |
|------|------|------|
| sorted() | 自然排序 | `stream.sorted()` |
| sorted(Comparator) | 自定义排序 | `stream.sorted(Comparator.comparing(String::length))` |

### 4. 聚合操作

| 操作 | 描述 | 示例 |
|------|------|------|
| count | 计数 | `stream.count()` |
| sum | 求和 | `intStream.sum()` |
| average | 平均值 | `intStream.average()` |
| min | 最小值 | `stream.min(Comparator.naturalOrder())` |
| max | 最大值 | `stream.max(Comparator.naturalOrder())` |

### 5. 匹配操作

| 操作 | 描述 | 示例 |
|------|------|------|
| anyMatch | 任意匹配 | `stream.anyMatch(fruit -> fruit.startsWith("a"))` |
| allMatch | 全部匹配 | `stream.allMatch(fruit -> fruit.length() > 0)` |
| noneMatch | 没有匹配 | `stream.noneMatch(fruit -> fruit.isEmpty())` |

## Stream API的优势

1. **代码简洁**：减少了样板代码，提高了可读性
2. **易于并行**：只需调用parallelStream()即可实现并行处理
3. **丰富的操作**：提供了大量内置操作，满足各种数据处理需求
4. **函数式编程**：支持函数式编程风格，提高代码的可维护性
5. **类型安全**：编译时检查，减少运行时错误

## 总结

Java Stream API是Java 8引入的强大特性，它改变了我们处理集合数据的方式。通过Stream API，我们可以编写更简洁、更易读、更高效的数据处理代码。

Stream API的核心思想是声明式编程，关注"做什么"而非"怎么做"，这使得我们可以更加专注于业务逻辑，而不是底层的实现细节。

在实际开发中，我们应该充分利用Stream API的优势，合理使用各种操作，提高代码的质量和开发效率。