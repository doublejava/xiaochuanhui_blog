# Vue3 setup 函数

## 1. setup 函数概述

`setup` 函数是 Vue3 Composition API 的核心，它是组件的入口点，在组件创建之前执行。`setup` 函数的主要作用是设置组件的状态、方法、计算属性等，并将它们暴露给模板使用。

## 2. setup 函数的基本用法

### 2.1 基本语法

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
    // 定义响应式数据
    const message = ref('Hello setup function')
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

### 2.2 setup 函数的参数

`setup` 函数接收两个参数：

**props**：组件的属性，是响应式的
**context**：上下文对象，包含以下属性：
- `attrs`：非响应式的属性对象
- `slots`：插槽对象
- `emit`：触发事件的函数
- `expose`：暴露公共属性和方法的函数

**示例**：
```vue
<template>
  <div>
    <h2>setup 函数参数</h2>
    <p>父组件传递的属性：{{ title }}</p>
    <p>当前计数：{{ count }}</p>
    <button @click="increment">增加计数</button>
    <button @click="sendMessage">向父组件发送消息</button>
    <slot></slot>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  // 定义组件属性
  props: {
    title: {
      type: String,
      default: 'Default Title'
    }
  },
  
  // setup 函数接收 props 和 context 参数
  setup(props, context) {
    const count = ref(0)
    
    // 访问 props
    console.log('props:', props.title)
    
    // 访问 context 属性
    console.log('attrs:', context.attrs)
    console.log('slots:', context.slots)
    
    const increment = () => {
      count.value++
    }
    
    // 使用 emit 向父组件发送事件
    const sendMessage = () => {
      context.emit('custom-event', { message: 'Hello from child', count: count.value })
    }
    
    // 使用 expose 暴露公共方法
    context.expose({
      resetCount: () => {
        count.value = 0
      }
    })
    
    return {
      count,
      increment,
      sendMessage
    }
  }
}
</script>
```

**父组件使用**：
```vue
<template>
  <div>
    <h1>父组件</h1>
    <child-component 
      title="来自父组件的标题" 
      @custom-event="handleCustomEvent"
      ref="childRef"
    >
      <p>这是插槽内容</p>
    </child-component>
    <button @click="callChildMethod">调用子组件方法</button>
    <p>子组件发送的消息：{{ childMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  setup() {
    const childRef = ref(null)
    const childMessage = ref('')
    
    const handleCustomEvent = (data) => {
      childMessage.value = `消息：${data.message}，计数：${data.count}`
    }
    
    const callChildMethod = () => {
      // 调用子组件暴露的方法
      childRef.value.resetCount()
    }
    
    return {
      childRef,
      childMessage,
      handleCustomEvent,
      callChildMethod
    }
  }
}
</script>
```

## 3. setup 函数的执行时机

`setup` 函数在组件生命周期中的执行时机：

1. 在 `beforeCreate` 之前执行
2. 在组件实例创建之前执行
3. 此时组件的 `this` 还未创建，因此在 `setup` 函数中无法使用 `this`

**生命周期执行顺序**：
```
setup() → beforeCreate() → created() → beforeMount() → mounted()
```

## 4. setup 函数与响应式系统

### 4.1 使用 ref 创建响应式数据

`ref` 用于创建基本类型的响应式数据，返回一个包含 `value` 属性的响应式对象。

**示例**：
```vue
<template>
  <div>
    <h2>使用 ref 创建响应式数据</h2>
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
    
    const updateValues = () => {
      // 更新 ref 值需要通过 .value 属性
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

### 4.2 使用 reactive 创建响应式数据

`reactive` 用于创建对象类型的响应式数据，返回一个响应式对象。

**示例**：
```vue
<template>
  <div>
    <h2>使用 reactive 创建响应式数据</h2>
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
    
    const updateUser = () => {
      // 直接更新对象属性
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

### 4.3 使用 computed 创建计算属性

`computed` 用于创建计算属性，接收一个 getter 函数，返回一个只读的响应式对象。

**示例**：
```vue
<template>
  <div>
    <h2>使用 computed 创建计算属性</h2>
    <div>
      <label>输入：</label>
      <input type="text" v-model="inputValue">
    </div>
    <p>输入值：{{ inputValue }}</p>
    <p>计算属性（反转）：{{ reversedValue }}</p>
    <p>计算属性（长度）：{{ inputLength }}</p>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const inputValue = ref('')
    
    // 创建计算属性：反转输入值
    const reversedValue = computed(() => {
      return inputValue.value.split('').reverse().join('')
    })
    
    // 创建计算属性：输入值长度
    const inputLength = computed(() => {
      return inputValue.value.length
    })
    
    return {
      inputValue,
      reversedValue,
      inputLength
    }
  }
}
</script>
```

## 5. setup 函数与生命周期钩子

在 `setup` 函数中，可以使用 Composition API 提供的生命周期钩子，这些钩子需要从 Vue 中导入。

**示例**：
```vue
<template>
  <div>
    <h2>setup 函数与生命周期钩子</h2>
    <p>{{ message }}</p>
    <p>当前时间：{{ currentTime }}</p>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const message = ref('生命周期钩子示例')
    const currentTime = ref(new Date().toLocaleTimeString())
    let timer = null
    
    // 组件挂载后执行
    onMounted(() => {
      console.log('组件挂载完成')
      
      // 每秒更新时间
      timer = setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString()
      }, 1000)
    })
    
    // 组件卸载前执行
    onUnmounted(() => {
      console.log('组件即将卸载')
      
      // 清理定时器
      clearInterval(timer)
    })
    
    return {
      message,
      currentTime
    }
  }
}
</script>
```

## 6. setup 函数与 watch

### 6.1 使用 watch 监听数据变化

`watch` 用于监听数据变化，接收三个参数：
- 要监听的数据
- 回调函数
- 配置选项

**示例**：
```vue
<template>
  <div>
    <h2>使用 watch 监听数据变化</h2>
    <div>
      <label>输入：</label>
      <input type="text" v-model="inputValue">
    </div>
    <p>输入值：{{ inputValue }}</p>
    <p>监听输出：{{ watchOutput }}</p>
    <div>
      <label>计数器：</label>
      <button @click="count++">增加计数</button>
      <span>{{ count }}</span>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  setup() {
    const inputValue = ref('')
    const count = ref(0)
    const watchOutput = ref('')
    
    // 监听单个数据
    watch(inputValue, (newValue, oldValue) => {
      watchOutput.value = `输入值从 "${oldValue}" 变为 "${newValue}"`
      console.log('inputValue 变化：', oldValue, '→', newValue)
    })
    
    // 监听多个数据
    watch([inputValue, count], ([newInput, newCount], [oldInput, oldCount]) => {
      console.log('多个数据变化：')
      console.log('inputValue:', oldInput, '→', newInput)
      console.log('count:', oldCount, '→', newCount)
    })
    
    // 监听对象属性
    const user = ref({ name: '张三', age: 25 })
    watch(
      () => user.value.age, // 监听 user.age 属性
      (newAge, oldAge) => {
        console.log('user.age 变化：', oldAge, '→', newAge)
      }
    )
    
    return {
      inputValue,
      count,
      watchOutput
    }
  }
}
</script>
```

### 6.2 使用 watchEffect 自动跟踪依赖

`watchEffect` 用于自动跟踪依赖，当依赖变化时执行回调函数。

**示例**：
```vue
<template>
  <div>
    <h2>使用 watchEffect 自动跟踪依赖</h2>
    <div>
      <label>输入1：</label>
      <input type="text" v-model="input1">
    </div>
    <div>
      <label>输入2：</label>
      <input type="text" v-model="input2">
    </div>
    <p>输入1：{{ input1 }}</p>
    <p>输入2：{{ input2 }}</p>
    <p>watchEffect 输出：{{ watchEffectOutput }}</p>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue'

export default {
  setup() {
    const input1 = ref('')
    const input2 = ref('')
    const watchEffectOutput = ref('')
    
    // watchEffect 自动跟踪依赖
    watchEffect(() => {
      watchEffectOutput.value = `输入1：${input1.value}，输入2：${input2.value}`
      console.log('watchEffect 执行：', input1.value, input2.value)
    })
    
    return {
      input1,
      input2,
      watchEffectOutput
    }
  }
}
</script>
```

## 7. setup 函数的最佳实践

1. **按功能组织代码**：将相关的状态和方法放在一起
2. **使用组合函数复用逻辑**：将通用逻辑提取到组合函数中
3. **避免在 setup 函数中使用 this**：setup 函数中 this 指向 undefined
4. **合理使用响应式 API**：根据数据类型选择 ref 或 reactive
5. **正确处理生命周期**：在适当的生命周期钩子中执行副作用
6. **使用 TypeScript**：充分利用 TypeScript 的类型支持
7. **使用 expose 暴露公共方法**：需要被父组件调用的方法应该使用 expose 暴露
8. **避免过度使用 ref**：对于对象类型，优先使用 reactive
9. **使用 watchEffect 简化监听**：对于自动跟踪依赖的场景，使用 watchEffect
10. **保持 setup 函数简洁**：复杂逻辑应该提取到组合函数中

## 8. setup 函数与 Options API 的对比

| 特性 | Options API | setup 函数 |
|------|-------------|------------|
| 代码组织 | 按选项类型组织 | 按逻辑功能组织 |
| 响应式数据 | data 选项 | ref、reactive |
| 方法 | methods 选项 | 直接在 setup 中定义 |
| 计算属性 | computed 选项 | computed 函数 |
| 生命周期 | 生命周期钩子选项 | onMounted、onUpdated 等函数 |
| 监听数据 | watch 选项 | watch、watchEffect 函数 |
| 组件通信 | props、$emit | props、context.emit |
| 代码复用 | mixins、HOC | 组合函数 |

## 9. 总结

`setup` 函数是 Vue3 Composition API 的核心，它提供了一种更灵活的方式来组织组件逻辑。通过 `setup` 函数，我们可以根据功能组织代码，提高代码的可维护性和复用性。

`setup` 函数的主要特点：
- 在组件创建之前执行
- 接收 props 和 context 两个参数
- 返回需要在模板中使用的数据和方法
- 支持使用 ref、reactive 创建响应式数据
- 支持使用 computed 创建计算属性
- 支持使用 watch、watchEffect 监听数据变化
- 支持使用生命周期钩子
- 支持使用 expose 暴露公共方法

掌握 `setup` 函数是 Vue3 开发的关键，它将帮助我们构建更高效、更可维护的 Vue 应用。