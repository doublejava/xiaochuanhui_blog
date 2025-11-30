# Vue3 reactive 和 ref 响应式 API

## 1. 响应式 API 概述

Vue3 提供了两种创建响应式数据的方式：`reactive` 和 `ref`。这两种 API 是 Vue3 响应式系统的核心，用于创建可响应的数据，当数据变化时，依赖该数据的组件会自动更新。

## 2. reactive API

### 2.1 基本用法

`reactive` 用于创建**对象类型**的响应式数据，返回一个响应式代理对象。

**示例**：
```vue
<template>
  <div>
    <h2>reactive API</h2>
    <p>姓名：{{ user.name }}</p>
    <p>年龄：{{ user.age }}</p>
    <p>地址：{{ user.address.city }} - {{ user.address.street }}</p>
    <button @click="updateUser">更新用户信息</button>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  setup() {
    // 使用 reactive 创建响应式对象
    const user = reactive({
      name: '张三',
      age: 25,
      address: {
        city: '北京',
        street: '朝阳区'
      }
    })
    
    // 更新用户信息
    const updateUser = () => {
      // 直接修改对象属性，会触发响应式更新
      user.name = '李四'
      user.age = 26
      user.address.city = '上海'
      user.address.street = '浦东新区'
    }
    
    return {
      user,
      updateUser
    }
  }
}
</script>
```

### 2.2 reactive 的特点

1. **只能用于对象类型**：`reactive` 只能用于创建对象、数组、Map、Set 等复杂类型的响应式数据，不能用于基本类型（string、number、boolean 等）
2. **深层响应式**：`reactive` 创建的响应式对象是深层响应式的，修改嵌套属性也会触发更新
3. **返回代理对象**：`reactive` 返回的是一个 Proxy 对象，不是原始对象
4. **引用透明**：可以直接修改对象属性，不需要像 Vue2 那样使用 `this.$set`

### 2.3 reactive 的局限性

1. **不能直接替换整个对象**：直接替换整个对象会失去响应性
2. **不能解构赋值**：直接解构会失去响应性
3. **不能用于基本类型**：基本类型需要使用 `ref`

**示例**：
```javascript
// 错误示例：直接替换整个对象，会失去响应性
const user = reactive({ name: '张三' })
user = { name: '李四' } // 错误！user 不再是响应式的

// 错误示例：直接解构会失去响应性
const { name } = reactive({ name: '张三' })
name = '李四' // 不会触发更新

// 正确示例：修改对象属性
const user = reactive({ name: '张三' })
user.name = '李四' // 正确，会触发更新

// 正确示例：使用 toRefs 解构
import { reactive, toRefs } from 'vue'
const user = reactive({ name: '张三' })
const { name } = toRefs(user)
name.value = '李四' // 正确，会触发更新
```

## 3. ref API

### 3.1 基本用法

`ref` 用于创建**基本类型**的响应式数据，返回一个包含 `value` 属性的响应式对象。

**示例**：
```vue
<template>
  <div>
    <h2>ref API</h2>
    <p>字符串：{{ stringValue }}</p>
    <p>数字：{{ numberValue }}</p>
    <p>布尔值：{{ booleanValue ? '是' : '否' }}</p>
    <button @click="updateValues">更新值</button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    // 使用 ref 创建响应式数据
    const stringValue = ref('Hello')
    const numberValue = ref(100)
    const booleanValue = ref(true)
    
    // 更新值
    const updateValues = () => {
      // 需要通过 .value 属性访问和修改 ref 值
      stringValue.value = 'World'
      numberValue.value = 200
      booleanValue.value = false
    }
    
    return {
      stringValue,
      numberValue,
      booleanValue,
      updateValues
    }
  }
}
</script>
```

### 3.2 ref 的特点

1. **可用于基本类型**：`ref` 可以用于创建基本类型的响应式数据
2. **也可用于对象类型**：`ref` 也可以用于创建对象类型的响应式数据，内部会自动调用 `reactive`
3. **需要通过 .value 访问**：在 JavaScript 中需要通过 `.value` 属性访问和修改 `ref` 值，但在模板中可以直接使用，不需要 `.value`
4. **返回响应式对象**：`ref` 返回的是一个包含 `value` 属性的响应式对象

### 3.3 ref 用于对象类型

```vue
<template>
  <div>
    <h2>ref 用于对象类型</h2>
    <p>姓名：{{ user.value.name }}</p>
    <p>年龄：{{ user.value.age }}</p>
    <button @click="updateUser">更新用户信息</button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    // 使用 ref 创建对象类型的响应式数据
    const user = ref({
      name: '张三',
      age: 25
    })
    
    // 更新用户信息
    const updateUser = () => {
      // 需要通过 .value 访问对象，然后修改属性
      user.value.name = '李四'
      user.value.age = 26
    }
    
    return {
      user,
      updateUser
    }
  }
}
</script>
```

## 4. reactive vs ref

| 特性 | reactive | ref |
|------|----------|-----|
| 适用类型 | 对象类型 | 基本类型和对象类型 |
| 返回值 | Proxy 对象 | 包含 .value 的响应式对象 |
| 访问方式 | 直接访问属性 | JavaScript 中需通过 .value 访问，模板中直接访问 |
| 深层响应式 | 是 | 是 |
| 替换整个对象 | 不支持 | 支持（通过修改 .value） |
| 解构赋值 | 不支持（直接解构会失去响应性） | 支持（通过 toRefs） |
| 类型支持 | 对 TypeScript 友好 | 对 TypeScript 友好 |

## 5. 响应式 API 相关函数

### 5.1 toRefs

`toRefs` 用于将 `reactive` 创建的响应式对象转换为普通对象，其中每个属性都是一个 `ref` 对象。

**示例**：
```vue
<template>
  <div>
    <h2>toRefs API</h2>
    <p>姓名：{{ name }}</p>
    <p>年龄：{{ age }}</p>
    <button @click="updateUser">更新用户信息</button>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'

export default {
  setup() {
    const user = reactive({
      name: '张三',
      age: 25
    })
    
    // 使用 toRefs 解构
    const { name, age } = toRefs(user)
    
    const updateUser = () => {
      // 通过 .value 修改 ref 值
      name.value = '李四'
      age.value = 26
    }
    
    return {
      name,
      age,
      updateUser
    }
  }
}
</script>
```

### 5.2 toRef

`toRef` 用于从 `reactive` 对象中创建单个 `ref` 对象。

**示例**：
```javascript
import { reactive, toRef } from 'vue'

const user = reactive({
  name: '张三',
  age: 25
})

// 从 reactive 对象中创建单个 ref
const nameRef = toRef(user, 'name')
const ageRef = toRef(user, 'age')

nameRef.value = '李四' // 会更新 user.name
console.log(user.name) // 李四
```

### 5.3 isRef

`isRef` 用于检查一个值是否是 `ref` 对象。

**示例**：
```javascript
import { ref, isRef } from 'vue'

const count = ref(0)
const user = { name: '张三' }

console.log(isRef(count)) // true
console.log(isRef(user)) // false
```

### 5.4 isReactive

`isReactive` 用于检查一个值是否是 `reactive` 创建的响应式对象。

**示例**：
```javascript
import { reactive, isReactive } from 'vue'

const user = reactive({ name: '张三' })
const count = 100

console.log(isReactive(user)) // true
console.log(isReactive(count)) // false
```

### 5.5 unref

`unref` 用于获取 `ref` 对象的 `value`，如果不是 `ref` 对象则直接返回原值。

**示例**：
```javascript
import { ref, unref } from 'vue'

const countRef = ref(100)
const count = 200

console.log(unref(countRef)) // 100
console.log(unref(count)) // 200

// 等价于
// const value = isRef(x) ? x.value : x
```

### 5.6 shallowReactive

`shallowReactive` 用于创建**浅层响应式**对象，只对对象的第一层属性进行响应式处理。

**示例**：
```javascript
import { shallowReactive } from 'vue'

const user = shallowReactive({
  name: '张三',
  address: {
    city: '北京'
  }
})

user.name = '李四' // 会触发更新
user.address.city = '上海' // 不会触发更新，因为是嵌套属性
```

### 5.7 shallowRef

`shallowRef` 用于创建**浅层响应式**的 `ref` 对象，只对 `.value` 的变更进行响应式处理，不对 `.value` 内部的属性变更进行响应式处理。

**示例**：
```javascript
import { shallowRef } from 'vue'

const user = shallowRef({
  name: '张三',
  age: 25
})

user.value = { name: '李四' } // 会触发更新
user.value.age = 26 // 不会触发更新，因为是 .value 内部的属性变更
```

### 5.8 triggerRef

`triggerRef` 用于手动触发 `shallowRef` 对象的更新。

**示例**：
```javascript
import { shallowRef, triggerRef } from 'vue'

const user = shallowRef({
  name: '张三',
  age: 25
})

user.value.age = 26 // 不会触发更新

triggerRef(user) // 手动触发更新
```

## 6. 响应式 API 最佳实践

1. **根据数据类型选择 API**：
   - 基本类型：使用 `ref`
   - 对象类型：优先使用 `reactive`，如果需要替换整个对象则使用 `ref`

2. **避免直接替换 reactive 对象**：
   ```javascript
   // 错误示例
   const user = reactive({ name: '张三' })
   user = { name: '李四' } // 失去响应性
   
   // 正确示例
   const user = reactive({ name: '张三' })
   user.name = '李四' // 修改属性，保持响应性
   
   // 或使用 ref
   const user = ref({ name: '张三' })
   user.value = { name: '李四' } // 修改 .value，保持响应性
   ```

3. **使用 toRefs 进行解构**：
   ```javascript
   import { reactive, toRefs } from 'vue'
   
   const user = reactive({ name: '张三', age: 25 })
   const { name, age } = toRefs(user) // 解构后仍保持响应性
   ```

4. **避免在模板中使用 .value**：
   ```vue
   <template>
     <!-- 正确：模板中直接使用 ref 值，不需要 .value -->
     <p>{{ count }}</p>
     
     <!-- 错误：模板中不需要 .value -->
     <p>{{ count.value }}</p>
   </template>
   ```

5. **合理使用 shallowReactive 和 shallowRef**：
   - 对于大型对象，使用 `shallowReactive` 可以提高性能
   - 对于不需要深层响应式的场景，使用 `shallowRef` 可以提高性能

6. **使用 TypeScript 增强类型安全**：
   ```typescript
   import { ref, reactive } from 'vue'
   
   // 基本类型
   const count = ref<number>(0)
   const message = ref<string>('Hello')
   
   // 对象类型
   interface User {
     name: string
     age: number
   }
   
   const user = reactive<User>({ name: '张三', age: 25 })
   const userRef = ref<User>({ name: '张三', age: 25 })
   ```

## 7. 响应式原理

Vue3 的响应式系统基于 **ES6 Proxy** 实现，与 Vue2 的 Object.defineProperty 相比，具有以下优势：

1. **支持所有对象类型**：包括对象、数组、Map、Set 等
2. **自动处理新增属性**：不需要像 Vue2 那样使用 `this.$set`
3. **自动处理删除属性**：不需要像 Vue2 那样使用 `this.$delete`
4. **自动处理数组索引和长度变化**：不需要像 Vue2 那样重写数组方法
5. **更好的性能**：Proxy 是浏览器原生支持的，性能更好
6. **更好的类型支持**：对 TypeScript 更友好

### 7.1 响应式系统工作流程

1. **创建响应式数据**：使用 `reactive` 或 `ref` 创建响应式数据
2. **依赖收集**：当组件渲染时，访问响应式数据会触发 getter，收集依赖
3. **数据变化**：修改响应式数据会触发 setter
4. **通知更新**：通知所有依赖该数据的组件重新渲染

## 8. 总结

Vue3 的响应式 API（`reactive` 和 `ref`）是构建 Vue 应用的核心，它们提供了灵活的方式来创建响应式数据。

- `reactive` 适用于对象类型，返回 Proxy 对象，直接访问属性
- `ref` 适用于基本类型和对象类型，返回包含 .value 的响应式对象
- `toRefs` 用于将 reactive 对象转换为 ref 对象集合，方便解构
- `shallowReactive` 和 `shallowRef` 用于创建浅层响应式数据，提高性能

掌握这些响应式 API 是 Vue3 开发的基础，合理使用它们可以提高代码的可维护性和性能。在实际开发中，我们应该根据数据类型和使用场景选择合适的响应式 API，并遵循最佳实践。