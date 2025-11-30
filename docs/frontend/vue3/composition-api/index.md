# Vue3 Composition API

## 1. Composition API 概述

Composition API 是 Vue3 引入的新特性，它提供了一种更灵活的方式来组织组件逻辑，使代码更易于维护和复用。与 Vue2 的 Options API 相比，Composition API 允许我们根据逻辑功能组织代码，而不是根据选项类型。

## 2. Composition API 核心概念

### 2.1 setup 函数

`setup` 函数是 Composition API 的入口点，在组件创建之前执行，用于设置组件的状态、方法等。

**示例**：
```vue
<template>
  <div>
    <h2>{{ message }}</h2>
    <button @click="increment">增加计数</button>
    <p>计数：{{ count }}</p>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  // setup 函数在组件创建之前执行
  setup() {
    // 使用 ref 创建响应式数据
    const message = ref('Hello Composition API')
    const count = ref(0)
    
    // 定义方法
    const increment = () => {
      count.value++
    }
    
    // 返回需要在模板中使用的数据和方法
    return {
      message,
      count,
      increment
    }
  }
}
</script>
```

### 2.2 响应式系统

Composition API 提供了两种创建响应式数据的方式：

**ref**：用于创建基本类型的响应式数据
**reactive**：用于创建对象类型的响应式数据

**示例**：
```vue
<template>
  <div>
    <h2>响应式系统</h2>
    <p>基本类型：{{ count }}</p>
    <p>对象类型：{{ user.name }} - {{ user.age }}</p>
    <button @click="updateData">更新数据</button>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  setup() {
    // 使用 ref 创建基本类型响应式数据
    const count = ref(0)
    
    // 使用 reactive 创建对象类型响应式数据
    const user = reactive({
      name: '张三',
      age: 25
    })
    
    // 更新数据的方法
    const updateData = () => {
      count.value++ // ref 需要通过 .value 访问和修改
      user.name = '李四' // reactive 直接访问和修改属性
      user.age++
    }
    
    return {
      count,
      user,
      updateData
    }
  }
}
</script>
```

### 2.3 生命周期钩子

Composition API 提供了与 Options API 对应的生命周期钩子，但需要从 Vue 中导入：

| Options API | Composition API |
|------------|----------------|
| beforeCreate | setup (替代) |
| created | setup (替代) |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |
| errorCaptured | onErrorCaptured |
| renderTracked | onRenderTracked |
| renderTriggered | onRenderTriggered |

**示例**：
```vue
<template>
  <div>
    <h2>生命周期钩子</h2>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const message = ref('生命周期钩子示例')
    let timer = null
    
    // 组件挂载后执行
    onMounted(() => {
      console.log('组件挂载完成')
      timer = setInterval(() => {
        console.log('定时器执行')
      }, 1000)
    })
    
    // 组件卸载前执行
    onUnmounted(() => {
      console.log('组件即将卸载')
      clearInterval(timer) // 清理定时器
    })
    
    return {
      message
    }
  }
}
</script>
```

### 2.4 计算属性和监听器

**computed**：创建计算属性
**watch**：创建监听器
**watchEffect**：创建自动跟踪依赖的监听器

**示例**：
```vue
<template>
  <div>
    <h2>计算属性和监听器</h2>
    <div>
      <label>输入：</label>
      <input type="text" v-model="inputValue">
    </div>
    <p>输入值：{{ inputValue }}</p>
    <p>计算属性（反转）：{{ reversedValue }}</p>
    <p>计算属性（长度）：{{ inputLength }}</p>
    <p>监听器输出：{{ watchOutput }}</p>
    <p>watchEffect 输出：{{ watchEffectOutput }}</p>
  </div>
</template>

<script>
import { ref, computed, watch, watchEffect } from 'vue'

export default {
  setup() {
    const inputValue = ref('')
    const watchOutput = ref('')
    const watchEffectOutput = ref('')
    
    // 计算属性：反转输入值
    const reversedValue = computed(() => {
      return inputValue.value.split('').reverse().join('')
    })
    
    // 计算属性：输入值长度
    const inputLength = computed(() => {
      return inputValue.value.length
    })
    
    // 监听器：监听输入值变化
    watch(inputValue, (newValue, oldValue) => {
      watchOutput.value = `输入值从 "${oldValue}" 变为 "${newValue}"`
    })
    
    // watchEffect：自动跟踪依赖
    watchEffect(() => {
      watchEffectOutput.value = `输入值：${inputValue.value}，长度：${inputValue.value.length}`
    })
    
    return {
      inputValue,
      reversedValue,
      inputLength,
      watchOutput,
      watchEffectOutput
    }
  }
}
</script>
```

### 2.5 依赖注入

**provide**：提供数据给子组件
**inject**：从父组件或祖先组件获取数据

**父组件**：
```vue
<template>
  <div>
    <h2>父组件</h2>
    <p>主题颜色：{{ themeColor }}</p>
    <button @click="changeTheme">切换主题</button>
    <child-component></child-component>
  </div>
</template>

<script>
import { ref, provide } from 'vue'
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  setup() {
    const themeColor = ref('blue')
    
    // 提供数据给子组件
    provide('themeColor', themeColor)
    provide('appName', 'Vue3 Demo')
    
    const changeTheme = () => {
      themeColor.value = themeColor.value === 'blue' ? 'red' : 'blue'
    }
    
    return {
      themeColor,
      changeTheme
    }
  }
}
</script>
```

**子组件**：
```vue
<template>
  <div :style="{ color: themeColor }">
    <h3>子组件</h3>
    <p>应用名称：{{ appName }}</p>
    <p>当前主题：{{ themeColor }}</p>
    <grandchild-component></grandchild-component>
  </div>
</template>

<script>
import { inject } from 'vue'
import GrandchildComponent from './GrandchildComponent.vue'

export default {
  components: {
    GrandchildComponent
  },
  setup() {
    // 从父组件获取数据
    const themeColor = inject('themeColor')
    const appName = inject('appName')
    
    return {
      themeColor,
      appName
    }
  }
}
</script>
```

### 2.6 模板引用

使用 `ref` 可以访问 DOM 元素或组件实例：

**示例**：
```vue
<template>
  <div>
    <h2>模板引用</h2>
    <input ref="inputRef" type="text" placeholder="请输入内容">
    <button @click="focusInput">聚焦输入框</button>
    <child-component ref="childRef"></child-component>
    <button @click="callChildMethod">调用子组件方法</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  setup() {
    // 创建模板引用
    const inputRef = ref(null)
    const childRef = ref(null)
    
    // 组件挂载后访问 DOM 元素
    onMounted(() => {
      inputRef.value.focus()
    })
    
    // 聚焦输入框
    const focusInput = () => {
      inputRef.value.focus()
    }
    
    // 调用子组件方法
    const callChildMethod = () => {
      childRef.value.childMethod()
    }
    
    return {
      inputRef,
      childRef,
      focusInput,
      callChildMethod
    }
  }
}
</script>
```

## 3. Composition API 优势

1. **更好的逻辑组织**：根据功能组织代码，而不是根据选项类型
2. **更好的逻辑复用**：可以将逻辑提取到独立的组合函数中
3. **更好的类型支持**：对 TypeScript 更友好
4. **更小的打包体积**：Tree-shakeable，只打包使用的 API
5. **更灵活的代码结构**：适合大型复杂组件

## 4. 组合函数（Composables）

组合函数是使用 Composition API 编写的可复用逻辑函数，以 "use" 开头命名。

**示例**：创建一个计数器组合函数

```javascript
// useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => {
    count.value++
  }
  
  const decrement = () => {
    count.value--
  }
  
  const reset = () => {
    count.value = initialValue
  }
  
  const doubleCount = computed(() => {
    return count.value * 2
  })
  
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
}
```

**使用组合函数**：
```vue
<template>
  <div>
    <h2>使用组合函数</h2>
    <p>计数：{{ count }}</p>
    <p>双倍计数：{{ doubleCount }}</p>
    <button @click="increment">增加</button>
    <button @click="decrement">减少</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script>
import { useCounter } from './useCounter'

export default {
  setup() {
    // 使用组合函数
    const { count, doubleCount, increment, decrement, reset } = useCounter(10)
    
    return {
      count,
      doubleCount,
      increment,
      decrement,
      reset
    }
  }
}
</script>
```

## 5. Composition API 与 Options API 对比

| 特性 | Options API | Composition API |
|------|-------------|----------------|
| 代码组织 | 按选项类型组织 | 按逻辑功能组织 |
| 逻辑复用 | Mixins、HOC、Scoped Slots | 组合函数 |
| TypeScript 支持 | 有限 | 良好 |
| 打包体积 | 固定 | Tree-shakeable |
| 学习曲线 | 平缓 | 较陡 |
| 适合场景 | 小型组件 | 大型复杂组件 |

## 6. 最佳实践

1. **使用组合函数复用逻辑**：将通用逻辑提取到组合函数中
2. **按功能组织代码**：将相关的状态和方法放在一起
3. **使用 TypeScript**：充分利用 Composition API 的类型支持
4. **合理使用响应式 API**：根据数据类型选择 ref 或 reactive
5. **避免过度使用 ref**：对于对象类型，优先使用 reactive
6. **使用 watchEffect 简化监听**：对于自动跟踪依赖的场景，使用 watchEffect
7. **正确处理生命周期**：在适当的生命周期钩子中执行副作用
8. **使用模板引用访问 DOM**：避免直接操作 DOM

## 7. 总结

Composition API 是 Vue3 的重要特性，它提供了一种更灵活、更强大的方式来组织组件逻辑。通过 Composition API，我们可以根据功能组织代码，提高代码的可维护性和复用性。

虽然 Composition API 的学习曲线较陡，但对于大型复杂组件，它可以显著提高开发效率和代码质量。在实际开发中，我们可以根据项目需求选择使用 Options API 或 Composition API，或者两者结合使用。

掌握 Composition API 是 Vue3 开发的关键，它将帮助我们构建更高效、更可维护的 Vue 应用。