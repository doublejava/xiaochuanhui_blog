# Java Function 函数式接口详解

## 什么是函数式接口

函数式接口是Java 8引入的一种特殊接口，它只包含一个抽象方法。函数式接口是Java支持函数式编程的基础，允许将函数作为方法参数传递，或者作为返回值返回。

函数式接口的核心特点：
- 只包含一个抽象方法
- 可以包含多个默认方法和静态方法
- 可以使用`@FunctionalInterface`注解进行标记（可选，但推荐）

## Java Function 接口家族

Java 8在`java.util.function`包中提供了一系列内置的函数式接口，用于不同场景的函数式编程。其中最核心的是Function接口家族。

### 1. Function<T, R> - 一元函数

**定义**：接收一个类型为T的参数，返回一个类型为R的结果。

**抽象方法**：`R apply(T t)`

**示例**：
```java
// 将字符串转换为整数
Function<String, Integer> strToInt = Integer::parseInt;
int number = strToInt.apply("123"); // 123

// 计算字符串长度
Function<String, Integer> strLength = String::length;
int length = strLength.apply("Hello"); // 5
```

**默认方法**：
- `andThen(Function<? super R, ? extends V> after)`：先执行当前函数，再执行after函数
- `compose(Function<? super V, ? extends T> before)`：先执行before函数，再执行当前函数

**示例**：
```java
// andThen：先转换为整数，再加10
Function<String, Integer> strToInt = Integer::parseInt;
Function<Integer, Integer> addTen = n -> n + 10;
Function<String, Integer> strToIntAddTen = strToInt.andThen(addTen);
int result = strToIntAddTen.apply("123"); // 133

// compose：先加10，再转换为字符串
Function<Integer, Integer> addTen = n -> n + 10;
Function<Integer, String> intToString = String::valueOf;
Function<Integer, String> addTenToString = intToString.compose(addTen);
String result2 = addTenToString.apply(123); // "133"
```

### 2. BiFunction<T, U, R> - 二元函数

**定义**：接收两个参数（类型为T和U），返回一个类型为R的结果。

**抽象方法**：`R apply(T t, U u)`

**示例**：
```java
// 计算两个数的和
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
int sum = add.apply(10, 20); // 30

// 拼接两个字符串
BiFunction<String, String, String> concat = (s1, s2) -> s1 + s2;
String result = concat.apply("Hello", " World"); // "Hello World"
```

**默认方法**：
- `andThen(Function<? super R, ? extends V> after)`：先执行当前函数，再执行after函数

**示例**：
```java
// 先求和，再加10
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
Function<Integer, Integer> addTen = n -> n + 10;
BiFunction<Integer, Integer, Integer> addAndAddTen = add.andThen(addTen);
int result = addAndAddTen.apply(10, 20); // 40
```

### 3. UnaryOperator<T> - 一元操作符

**定义**：接收一个类型为T的参数，返回一个类型为T的结果（输入输出类型相同）。

**抽象方法**：`T apply(T t)`

**说明**：UnaryOperator是Function的子接口，当输入输出类型相同时可以使用。

**示例**：
```java
// 整数加1
UnaryOperator<Integer> increment = n -> n + 1;
int result = increment.apply(10); // 11

// 字符串转大写
UnaryOperator<String> toUpperCase = String::toUpperCase;
String result2 = toUpperCase.apply("hello"); // "HELLO"
```

### 4. BinaryOperator<T> - 二元操作符

**定义**：接收两个类型为T的参数，返回一个类型为T的结果（输入输出类型相同）。

**抽象方法**：`T apply(T t1, T t2)`

**说明**：BinaryOperator是BiFunction的子接口，当输入输出类型相同时可以使用。

**示例**：
```java
// 计算两个数的和
BinaryOperator<Integer> add = (a, b) -> a + b;
int sum = add.apply(10, 20); // 30

// 计算两个数的最大值
BinaryOperator<Integer> max = Integer::max;
int maximum = max.apply(10, 20); // 20
```

**静态方法**：
- `minBy(Comparator<? super T> comparator)`：返回两个元素的最小值
- `maxBy(Comparator<? super T> comparator)`：返回两个元素的最大值

**示例**：
```java
// 使用静态方法获取最大值
BinaryOperator<Integer> max = BinaryOperator.maxBy(Integer::compareTo);
int maximum = max.apply(10, 20); // 20

// 使用静态方法获取最小值
BinaryOperator<Integer> min = BinaryOperator.minBy(Integer::compareTo);
int minimum = min.apply(10, 20); // 10
```

### 5. 其他常用函数式接口

| 接口 | 描述 | 抽象方法 | 示例 |
|------|------|----------|------|
| `Supplier<T>` | 无参数，返回T类型结果 | `T get()` | `Supplier<String> hello = () -> "Hello";` |
| `Consumer<T>` | 接收T类型参数，无返回值 | `void accept(T t)` | `Consumer<String> print = System.out::println;` |
| `BiConsumer<T, U>` | 接收T和U类型参数，无返回值 | `void accept(T t, U u)` | `BiConsumer<String, Integer> printWithLength = (s, len) -> System.out.println(s + " (" + len + ")");` |
| `Predicate<T>` | 接收T类型参数，返回boolean | `boolean test(T t)` | `Predicate<String> isEmpty = String::isEmpty;` |
| `BiPredicate<T, U>` | 接收T和U类型参数，返回boolean | `boolean test(T t, U u)` | `BiPredicate<String, Integer> hasLength = (s, len) -> s.length() == len;` |

## Function接口的实际应用场景

### 1. 作为方法参数

```java
// 定义一个方法，接收Function作为参数
public <T, R> List<R> map(List<T> list, Function<T, R> mapper) {
    List<R> result = new ArrayList<>();
    for (T item : list) {
        result.add(mapper.apply(item));
    }
    return result;
}

// 使用示例
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
List<Integer> nameLengths = map(names, String::length); // [5, 3, 7]
```

### 2. 作为返回值

```java
// 根据条件返回不同的Function
public Function<Integer, Integer> getMathOperation(String operation) {
    switch (operation) {
        case "add":
            return n -> n + 10;
        case "multiply":
            return n -> n * 10;
        case "square":
            return n -> n * n;
        default:
            throw new IllegalArgumentException("Unknown operation: " + operation);
    }
}

// 使用示例
Function<Integer, Integer> addOperation = getMathOperation("add");
int result = addOperation.apply(5); // 15
```

### 3. 在Stream API中的应用

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");

// map操作使用Function接口
List<Integer> nameLengths = names.stream()
    .map(String::length) // 使用Function<String, Integer>
    .collect(Collectors.toList());

// sorted操作使用Comparator，也是函数式接口
List<String> sortedNames = names.stream()
    .sorted(String::compareTo) // 使用Comparator<String>
    .collect(Collectors.toList());
```

### 4. 在Optional类中的应用

```java
Optional<String> optionalName = Optional.ofNullable("Alice");

// map操作使用Function接口
Optional<Integer> nameLength = optionalName.map(String::length);

// flatMap操作也使用Function接口
Optional<String> upperCaseName = optionalName.flatMap(name -> Optional.of(name.toUpperCase()));
```

## 自定义函数式接口

除了使用Java内置的函数式接口外，我们还可以自定义函数式接口。

**示例**：
```java
// 自定义函数式接口
@FunctionalInterface
interface Calculator<T> {
    T calculate(T a, T b, String operation);
}

// 使用自定义函数式接口
Calculator<Integer> intCalculator = (a, b, operation) -> {
    switch (operation) {
        case "add":
            return a + b;
        case "subtract":
            return a - b;
        case "multiply":
            return a * b;
        case "divide":
            return a / b;
        default:
            throw new IllegalArgumentException("Unknown operation: " + operation);
    }
};

int result = intCalculator.calculate(10, 5, "add"); // 15
```

**注意事项**：
- 自定义函数式接口时，建议使用`@FunctionalInterface`注解，这样编译器会检查接口是否只包含一个抽象方法
- 函数式接口的方法名应该具有描述性，便于理解其功能
- 避免创建过于复杂的函数式接口，尽量使用Java内置的函数式接口

## 函数式接口的最佳实践

1. **优先使用Java内置函数式接口**：Java 8提供了丰富的内置函数式接口，覆盖了大多数使用场景
2. **合理使用注解**：使用`@FunctionalInterface`注解标记自定义函数式接口
3. **使用方法引用简化代码**：当函数式接口的实现与现有方法签名匹配时，使用方法引用可以简化代码
4. **避免过度使用函数式接口**：对于简单的场景，传统的方法调用可能更直观
5. **注意线程安全**：函数式接口的实现应该是无副作用的，避免修改共享状态
6. **使用Lambda表达式保持简洁**：Lambda表达式是实现函数式接口的简洁方式

## 方法引用 vs Lambda表达式

| 场景 | Lambda表达式 | 方法引用 |
|------|--------------|----------|
| 静态方法 | `(args) -> ClassName.staticMethod(args)` | `ClassName::staticMethod` |
| 实例方法 | `(instance, args) -> instance.instanceMethod(args)` | `ClassName::instanceMethod` |
| 对象方法 | `(args) -> obj.instanceMethod(args)` | `obj::instanceMethod` |
| 构造方法 | `(args) -> new ClassName(args)` | `ClassName::new` |

**示例**：
```java
// Lambda表达式
Function<String, Integer> strToInt1 = (s) -> Integer.parseInt(s);

// 方法引用
Function<String, Integer> strToInt2 = Integer::parseInt;
```

## 函数式接口的类型推断

Java 8引入了类型推断机制，允许编译器根据上下文自动推断Lambda表达式的类型。

**示例**：
```java
// 完整写法
Function<String, Integer> strToInt1 = (String s) -> { return Integer.parseInt(s); };

// 类型推断：省略参数类型
Function<String, Integer> strToInt2 = (s) -> Integer.parseInt(s);

// 更简洁：省略括号（单参数）和return关键字
Function<String, Integer> strToInt3 = s -> Integer.parseInt(s);

// 最简洁：使用方法引用
Function<String, Integer> strToInt4 = Integer::parseInt;
```

## 函数式接口的局限性

1. **只能有一个抽象方法**：这是函数式接口的定义，限制了其灵活性
2. **不支持检查异常**：Lambda表达式中抛出的检查异常需要显式处理
3. **性能考虑**：Lambda表达式和方法引用会带来一定的性能开销，尤其是在频繁调用的场景
4. **调试困难**：Lambda表达式的调试比传统方法调用更困难

## 总结

Java Function接口家族是Java支持函数式编程的核心，它们提供了一种灵活、简洁的方式来处理函数作为一等公民的场景。

通过Function接口，我们可以：
- 将函数作为方法参数传递
- 将函数作为返回值返回
- 实现函数的组合和链式调用
- 简化代码，提高可读性和可维护性

在实际开发中，我们应该充分利用Java内置的函数式接口，合理使用Lambda表达式和方法引用，编写简洁、高效、易维护的代码。

函数式编程是Java发展的重要方向，掌握Function接口家族的使用，对于提高Java开发水平具有重要意义。