# Vue3 计算属性与 ref (Computed & Ref)

## 什么是计算属性

计算属性是 Vue3 中用于声明式地计算复杂逻辑的属性。它们基于响应式依赖进行缓存，只有当依赖发生变化时才会重新计算，提高了性能。

## ref 与 computed 的关系

在 Vue3 的 Composition API 中，`ref` 用于创建响应式的基本类型数据，而 `computed` 用于创建基于响应式数据的计算属性。

## 基本用法

### 使用 ref 创建响应式数据

```javascript
import { ref } from 'vue'

const count = ref(0)
console.log(count.value) // 输出: 0

count.value++
console.log(count.value) // 输出: 1
```

### 使用 computed 创建计算属性

```javascript
import { ref, computed } from 'vue'

const count = ref(0)

// 创建一个只读的计算属性
const doubleCount = computed(() => count.value * 2)

console.log(doubleCount.value) // 输出: 0

count.value++
console.log(doubleCount.value) // 输出: 2
```

## 可写的计算属性

计算属性默认是只读的，但也可以提供 getter 和 setter 使其可写：

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed({
  // getter
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  // setter
  set(newValue) {
    const [newFirst, newLast] = newValue.split(' ')
    firstName.value = newFirst
    lastName.value = newLast
  }
})

// 使用 getter
console.log(fullName.value) // 输出: John Doe

// 使用 setter
fullName.value = 'Jane Smith'
console.log(firstName.value) // 输出: Jane
console.log(lastName.value) // 输出: Smith
```

## 计算属性的缓存机制

计算属性会基于它们的响应式依赖进行缓存。只有当依赖发生变化时，计算属性才会重新计算。

```javascript
import { ref, computed } from 'vue'

const count = ref(0)
let computeCount = 0

const expensiveComputation = computed(() => {
  computeCount++
  return count.value * 2
})

// 第一次访问，执行计算
console.log(expensiveComputation.value) // 输出: 0
console.log(computeCount) // 输出: 1

// 第二次访问，使用缓存
console.log(expensiveComputation.value) // 输出: 0
console.log(computeCount) // 输出: 1

// 依赖变化，重新计算
count.value++
console.log(expensiveComputation.value) // 输出: 2
console.log(computeCount) // 输出: 2
```

## 计算属性 vs 方法

| 特性 | 计算属性 | 方法 |
|------|----------|------|
| 缓存 | 有缓存，依赖不变时不重新计算 | 每次调用都会重新执行 |
| 语法 | 作为属性访问 | 作为方法调用 |
| 适用场景 | 复杂数据处理、数据转换 | 事件处理、命令式逻辑 |

```javascript
import { ref, computed } from 'vue'

const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
function getDoubleCount() {
  return count.value * 2
}

// 使用
console.log(doubleCount.value) // 有缓存
console.log(getDoubleCount()) // 每次调用都重新计算
```

## 计算属性的应用场景

1. **数据转换**：将原始数据转换为需要的格式
2. **数据过滤**：根据条件过滤数组或对象
3. **数据组合**：将多个数据属性组合成一个新属性
4. **复杂逻辑计算**：包含多个条件判断的复杂逻辑
5. **派生状态**：从多个状态派生新的状态

## 示例：过滤和排序列表

```javascript
import { ref, computed } from 'vue'

const items = ref([
  { name: 'Apple', price: 10 },
  { name: 'Banana', price: 5 },
  { name: 'Orange', price: 8 },
  { name: 'Grape', price: 15 }
])

const searchQuery = ref('')
const sortBy = ref('name')

// 过滤和排序的计算属性
const filteredAndSortedItems = computed(() => {
  let result = [...items.value]
  
  // 过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(query)
    )
  }
  
  // 排序
  result.sort((a, b) => {
    if (a[sortBy.value] < b[sortBy.value]) return -1
    if (a[sortBy.value] > b[sortBy.value]) return 1
    return 0
  })
  
  return result
})
```

## 示例：购物车总价计算

```javascript
import { ref, computed } from 'vue'

const cartItems = ref([
  { id: 1, name: 'Product 1', price: 100, quantity: 2 },
  { id: 2, name: 'Product 2', price: 50, quantity: 3 },
  { id: 3, name: 'Product 3', price: 200, quantity: 1 }
])

// 计算购物车总价
const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
})

// 计算购物车商品数量
const totalQuantity = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + item.quantity
  }, 0)
})
```

## 计算属性的注意事项

1. **计算属性的依赖必须是响应式的**：只有 `ref`、`reactive` 或其他计算属性才能作为计算属性的依赖
2. **避免在计算属性中执行异步操作**：计算属性应该是同步的，如果需要异步操作，应该使用 `watch` 或 `watchEffect`
3. **避免在计算属性中修改依赖数据**：这可能导致无限循环
4. **计算属性的名称不能与其他响应式数据冲突**：否则会导致命名冲突
5. **对于简单的逻辑，使用表达式更简洁**：对于复杂逻辑，使用计算属性

## 计算属性与 watch 的区别

| 特性 | 计算属性 | watch |
|------|----------|-------|
| 用途 | 计算派生值 | 监听数据变化并执行副作用 |
| 缓存 | 有缓存 | 无缓存 |
| 语法 | 声明式 | 命令式 |
| 适用场景 | 数据转换和组合 | 异步操作、DOM 更新 |

## 示例：响应式表单验证

```javascript
import { ref, computed } from 'vue'

const email = ref('')
const password = ref('')

// 邮箱验证规则
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

// 密码验证规则
const isPasswordValid = computed(() => {
  return password.value.length >= 8
})

// 表单是否可以提交
const isFormValid = computed(() => {
  return isEmailValid.value && isPasswordValid.value
})
```

## 总结

在 Vue3 的 Composition API 中，`ref` 和 `computed` 是构建响应式应用的核心工具。`ref` 用于创建响应式数据，而 `computed` 用于创建基于响应式数据的计算属性。

计算属性提供了缓存机制，只有当依赖发生变化时才会重新计算，提高了应用性能。合理使用计算属性可以使代码更加简洁、可维护，并且能够更好地利用 Vue 的响应式系统。

在实际开发中，建议优先使用计算属性来处理派生数据，而不是手动监听数据变化并更新派生值。