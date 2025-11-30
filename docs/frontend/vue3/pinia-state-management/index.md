# Vue3 Pinia 状态管理

## 1. Pinia 概述

Pinia 是 Vue3 的官方状态管理库，它是 Vuex 的继任者，提供了更简洁的 API、更好的 TypeScript 支持和更灵活的架构。Pinia 支持 Vue2 和 Vue3，但在 Vue3 中表现最佳。

## 2. Pinia 核心概念

Pinia 包含以下核心概念：
- **Store**：存储状态的容器
- **State**：存储数据的地方
- **Getters**：从 State 中派生出新状态
- **Actions**：处理异步操作，可以修改 State

## 3. Pinia 安装与配置

### 3.1 安装 Pinia

```bash
# 使用 npm 安装
npm install pinia

# 使用 yarn 安装
yarn add pinia
```

### 3.2 在 main.js 中配置 Pinia

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 创建 Pinia 实例
const pinia = createPinia()

// 创建 Vue 应用
const app = createApp(App)

// 使用 Pinia
app.use(pinia)

// 挂载应用
app.mount('#app')
```

## 4. 创建 Store

### 4.1 基本 Store

**创建 stores/counter.js 文件**：
```javascript
import { defineStore } from 'pinia'

// 定义并导出 Store
export const useCounterStore = defineStore('counter', {
  // State：存储数据
  state: () => ({
    count: 0,
    name: 'Pinia Counter'
  }),
  
  // Getters：从 State 中派生出新状态
  getters: {
    // 计算双倍计数
    doubleCount: (state) => state.count * 2,
    
    // 使用其他 getters
    doubleCountPlusOne: (state, getters) => getters.doubleCount + 1
  },
  
  // Actions：处理异步操作，可以修改 State
  actions: {
    // 增加计数
    increment() {
      this.count++
    },
    
    // 减少计数
    decrement() {
      this.count--
    },
    
    // 重置计数
    reset() {
      this.count = 0
    },
    
    // 异步操作
    async incrementAsync(delay = 1000) {
      // 模拟异步请求
      await new Promise(resolve => setTimeout(resolve, delay))
      this.count++
    },
    
    // 带参数的 action
    incrementBy(amount) {
      this.count += amount
    }
  }
})
```

### 4.2 使用 Composition API 创建 Store

**创建 stores/user.js 文件**：
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 使用 ref 定义 State
  const user = ref(null)
  const token = ref('')
  const loading = ref(false)
  
  // 使用 computed 定义 Getters
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.name || 'Guest')
  
  // 定义 Actions
  function login(credentials) {
    loading.value = true
    
    // 模拟登录请求
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockToken = 'mock-token-123'
        const mockUser = { id: 1, name: '张三', role: 'admin' }
        
        // 保存到 localStorage
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))
        
        // 更新状态
        token.value = mockToken
        user.value = mockUser
        loading.value = false
        
        resolve({ token: mockToken, user: mockUser })
      }, 1000)
    })
  }
  
  function logout() {
    // 清除 localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // 重置状态
    token.value = ''
    user.value = null
  }
  
  function initUser() {
    // 从 localStorage 初始化用户信息
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }
  
  // 返回需要暴露的状态和方法
  return {
    // State
    user,
    token,
    loading,
    
    // Getters
    isLoggedIn,
    username,
    
    // Actions
    login,
    logout,
    initUser
  }
})
```

## 5. 在组件中使用 Pinia

### 5.1 在 Options API 中使用

**示例**：
```vue
<template>
  <div>
    <h2>Options API 使用 Pinia</h2>
    <p>计数：{{ count }}</p>
    <p>双倍计数：{{ doubleCount }}</p>
    <button @click="increment">增加计数</button>
    <button @click="decrement">减少计数</button>
    <button @click="reset">重置计数</button>
    <button @click="incrementAsync">异步增加计数</button>
    <button @click="incrementBy(5)">增加 5</button>
  </div>
</template>

<script>
import { useCounterStore } from '../stores/counter'

export default {
  // 使用 mapState 映射 State
  computed: {
    // 手动映射
    count() {
      return this.counterStore.count
    },
    doubleCount() {
      return this.counterStore.doubleCount
    }
  },
  
  // 在 created 钩子中初始化 Store
  created() {
    this.counterStore = useCounterStore()
  },
  
  // 映射 Actions 到 methods
  methods: {
    increment() {
      this.counterStore.increment()
    },
    decrement() {
      this.counterStore.decrement()
    },
    reset() {
      this.counterStore.reset()
    },
    incrementAsync() {
      this.counterStore.incrementAsync()
    },
    incrementBy(amount) {
      this.counterStore.incrementBy(amount)
    }
  }
}
</script>
```

### 5.2 在 Composition API 中使用

**示例**：
```vue
<template>
  <div>
    <h2>Composition API 使用 Pinia</h2>
    <p>计数：{{ counterStore.count }}</p>
    <p>双倍计数：{{ counterStore.doubleCount }}</p>
    <p>双倍计数+1：{{ counterStore.doubleCountPlusOne }}</p>
    <button @click="counterStore.increment">增加计数</button>
    <button @click="counterStore.decrement">减少计数</button>
    <button @click="counterStore.reset">重置计数</button>
    <button @click="handleAsyncIncrement">异步增加计数</button>
    <button @click="counterStore.incrementBy(10)">增加 10</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '../stores/counter'

// 创建 Store 实例
const counterStore = useCounterStore()

// 处理异步增加计数
const handleAsyncIncrement = async () => {
  await counterStore.incrementAsync(2000) // 延迟 2 秒
  console.log('异步增加计数完成')
}
</script>
```

### 5.3 使用 user Store 示例

```vue
<template>
  <div>
    <h2>用户信息</h2>
    <div v-if="userStore.isLoggedIn">
      <p>用户名：{{ userStore.username }}</p>
      <p>用户角色：{{ userStore.user.role }}</p>
      <button @click="userStore.logout">退出登录</button>
    </div>
    <div v-else>
      <p>您尚未登录</p>
      <button @click="handleLogin" :disabled="userStore.loading">
        {{ userStore.loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '../stores/user'

// 创建 Store 实例
const userStore = useUserStore()

// 初始化用户信息
onMounted(() => {
  userStore.initUser()
})

// 处理登录
const handleLogin = async () => {
  try {
    await userStore.login({
      username: 'admin',
      password: 'password'
    })
    console.log('登录成功')
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>
```

## 6. Pinia 核心特性

### 6.1 多个 Store

Pinia 允许创建多个 Store，每个 Store 都是独立的：

```javascript
// 创建多个 Store
export const useCounterStore = defineStore('counter', {
  // ...
})

export const useUserStore = defineStore('user', {
  // ...
})

export const useProductStore = defineStore('product', {
  // ...
})
```

### 6.2 修改 State

**直接修改**：
```javascript
const counterStore = useCounterStore()
counterStore.count++
counterStore.name = 'New Name'
```

**使用 $patch 批量修改**：
```javascript
// 使用对象形式
counterStore.$patch({
  count: counterStore.count + 1,
  name: 'Updated Name'
})

// 使用函数形式
counterStore.$patch((state) => {
  state.count++
  state.name = 'Updated Name'
})
```

**替换整个 State**：
```javascript
counterStore.$state = {
  count: 100,
  name: 'Reset Name'
}
```

### 6.3 监听 State 变化

```javascript
// 监听整个 Store
const unsubscribe = counterStore.$subscribe((mutation, state) => {
  console.log('State 变化:', mutation, state)
  // mutation.type: 'direct' | 'patch object' | 'patch function'
  // mutation.storeId: 'counter'
  // mutation.payload: 变化的内容
})

// 停止监听
unsubscribe()

// 监听特定属性
const stopWatch = watch(
  () => counterStore.count,
  (newValue, oldValue) => {
    console.log('count 变化:', oldValue, '→', newValue)
  }
)
```

### 6.4 重置 State

```javascript
// 重置 Store 到初始状态
counterStore.$reset()
```

## 7. Pinia 与 Vuex 的对比

| 特性 | Pinia | Vuex 3 | Vuex 4 |
|------|-------|--------|--------|
| API 风格 | 简洁，无 mutations | 复杂，需要 mutations | 复杂，需要 mutations |
| TypeScript 支持 | 优秀 | 有限 | 良好 |
| 模块化 | 天然支持，每个 Store 都是独立的 | 需要 modules | 需要 modules |
| 异步操作 | 在 actions 中直接处理 | 需要在 actions 中提交 mutations | 需要在 actions 中提交 mutations |
| DevTools 支持 | 支持 | 支持 | 支持 |
| Vue2 支持 | 是 | 是 | 是 |
| Vue3 支持 | 是 | 否 | 是 |
| 代码分割 | 自动支持 | 需要手动配置 | 需要手动配置 |
| 嵌套模块 | 不需要，使用组合式 Store | 需要 | 需要 |

## 8. Pinia 最佳实践

1. **按功能划分 Store**：每个 Store 负责一个功能模块
2. **使用 TypeScript**：充分利用 Pinia 的 TypeScript 支持
3. **使用 Composition API**：在 Vue3 中优先使用 Composition API 创建 Store
4. **保持 Store 简洁**：Store 只存储共享状态，组件内部状态使用组件自身的状态管理
5. **使用 actions 处理异步操作**：所有异步操作都应该放在 actions 中
6. **使用 getters 派生状态**：避免在组件中重复计算
7. **合理使用 $patch**：批量修改状态时使用 $patch，提高性能
8. **监听 State 变化**：在需要时监听 State 变化，执行副作用
9. **初始化 Store**：在应用启动时初始化必要的 Store 数据
10. **测试 Store**：编写单元测试，确保 Store 功能正确

## 9. Pinia 高级用法

### 9.1 Store 组合

可以在一个 Store 中使用另一个 Store：

```javascript
import { defineStore } from 'pinia'
import { useCounterStore } from './counter'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: []
  }),
  actions: {
    async fetchProducts() {
      const counterStore = useCounterStore()
      counterStore.increment() // 使用其他 Store 的 action
      // 模拟异步请求
      this.products = [{ id: 1, name: 'Product 1' }]
    }
  }
})
```

### 9.2 使用插件

Pinia 支持插件，可以扩展其功能：

```javascript
// 创建插件
const myPlugin = (context) => {
  context.store.$subscribe((mutation, state) => {
    console.log('Plugin: State 变化:', mutation, state)
  })
  
  // 添加自定义方法
  context.store.$customMethod = () => {
    console.log('自定义方法被调用')
  }
}

// 使用插件
const pinia = createPinia()
pinia.use(myPlugin)
```

### 9.3 持久化存储

可以使用插件实现持久化存储：

**安装持久化插件**：
```bash
npm install pinia-plugin-persistedstate
```

**使用持久化插件**：
```javascript
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

**配置持久化**：
```javascript
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Pinia Counter'
  }),
  // 配置持久化
  persist: {
    key: 'counter-store', // 存储的键名
    storage: localStorage, // 存储方式：localStorage 或 sessionStorage
    paths: ['count'] // 只持久化 count 属性
  }
})
```

## 10. 总结

Pinia 是 Vue3 的官方状态管理库，提供了简洁的 API、更好的 TypeScript 支持和更灵活的架构。它是 Vuex 的继任者，推荐在 Vue3 项目中使用。

Pinia 的主要特点：
- 简洁的 API，无 mutations
- 更好的 TypeScript 支持
- 天然支持多个 Store
- 支持 Composition API
- 自动代码分割
- 支持 Vue2 和 Vue3

掌握 Pinia 是 Vue3 开发的重要技能，它可以帮助我们更好地管理应用状态，提高代码的可维护性和可扩展性。

在实际开发中，我们应该根据项目需求，合理使用 Pinia，遵循最佳实践，编写高质量的状态管理代码。