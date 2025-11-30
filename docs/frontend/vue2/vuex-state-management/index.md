# Vue2 Vuex 状态管理

## 1. Vuex 概述

Vuex 是一个专为 Vue.js 应用程序开发的**状态管理模式 + 库**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

## 2. Vuex 核心概念

Vuex 包含以下核心概念：
- **State**：存储应用状态
- **Getters**：从 State 中派生出新状态
- **Mutations**：修改 State 的唯一方式，必须是同步函数
- **Actions**：处理异步操作，可以提交 Mutations
- **Modules**：将 Store 分割成模块，便于管理

## 3. Vuex 安装与配置

### 3.1 安装 Vuex

```bash
# 使用 npm 安装
npm install vuex@3

# 使用 yarn 安装
yarn add vuex@3
```

### 3.2 创建 Vuex Store

**创建 store/index.js 文件**：
```javascript
import Vue from 'vue'
import Vuex from 'vuex'

// 注册 Vuex
Vue.use(Vuex)

// 创建 Store 实例
const store = new Vuex.Store({
  // 状态
  state: {
    count: 0,
    user: null,
    todos: [
      { id: 1, text: '学习 Vuex', done: false },
      { id: 2, text: '使用 Vuex', done: false }
    ]
  },
  
  // Getters
  getters: {
    // 计算已完成的任务数量
    completedTodosCount: state => {
      return state.todos.filter(todo => todo.done).length
    },
    
    // 根据 ID 获取任务
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    }
  },
  
  // Mutations
  mutations: {
    // 增加计数
    increment(state) {
      state.count++
    },
    
    // 设置用户信息
    setUser(state, user) {
      state.user = user
    },
    
    // 添加任务
    addTodo(state, todo) {
      state.todos.push(todo)
    },
    
    // 切换任务状态
    toggleTodo(state, todoId) {
      const todo = state.todos.find(todo => todo.id === todoId)
      if (todo) {
        todo.done = !todo.done
      }
    }
  },
  
  // Actions
  actions: {
    // 异步增加计数
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('increment')
      }, 1000)
    },
    
    // 异步获取用户信息
    fetchUser({ commit }) {
      // 模拟 API 请求
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = { id: 1, name: '张三', age: 25 }
          commit('setUser', user)
          resolve(user)
        }, 1500)
      })
    },
    
    // 异步添加任务
    addTodoAsync({ commit }, todoText) {
      // 模拟 API 请求
      return new Promise((resolve) => {
        setTimeout(() => {
          const newTodo = {
            id: Date.now(),
            text: todoText,
            done: false
          }
          commit('addTodo', newTodo)
          resolve(newTodo)
        }, 1000)
      })
    }
  }
})

export default store
```

### 3.3 在 main.js 中使用 Vuex

```javascript
import Vue from 'vue'
import App from './App.vue'
import store from './store' // 引入 Vuex Store

new Vue({
  store, // 注册 Store
  render: h => h(App)
}).$mount('#app')
```

## 4. 在组件中使用 Vuex

### 4.1 访问 State

**方式一：直接访问**
```vue
<template>
  <div>
    <p>计数：{{ $store.state.count }}</p>
    <p>用户名：{{ $store.state.user?.name }}</p>
  </div>
</template>
```

**方式二：使用 mapState 辅助函数**
```vue
<template>
  <div>
    <p>计数：{{ count }}</p>
    <p>用户名：{{ user?.name }}</p>
    <p>任务列表：{{ todos }}</p>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    // 映射 state 到计算属性
    ...mapState(['count', 'user', 'todos'])
    
    // 或使用对象形式，重命名属性
    /*
    ...mapState({
      counter: 'count',
      currentUser: 'user',
      taskList: 'todos'
    })
    */
  }
}
</script>
```

### 4.2 使用 Getters

**方式一：直接访问**
```vue
<template>
  <div>
    <p>已完成任务数：{{ $store.getters.completedTodosCount }}</p>
    <p>任务 ID 为 1 的任务：{{ $store.getters.getTodoById(1) }}</p>
  </div>
</template>
```

**方式二：使用 mapGetters 辅助函数**
```vue
<template>
  <div>
    <p>已完成任务数：{{ completedTodosCount }}</p>
    <p>任务 ID 为 1 的任务：{{ getTodoById(1) }}</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    // 映射 getters 到计算属性
    ...mapGetters(['completedTodosCount', 'getTodoById'])
    
    // 或使用对象形式，重命名属性
    /*
    ...mapGetters({
      doneCount: 'completedTodosCount',
      findTodo: 'getTodoById'
    })
    */
  }
}
</script>
```

### 4.3 提交 Mutations

**方式一：直接提交**
```vue
<template>
  <div>
    <button @click="$store.commit('increment')">增加计数</button>
    <button @click="addTodo">添加任务</button>
  </div>
</template>

<script>
export default {
  methods: {
    addTodo() {
      this.$store.commit('addTodo', {
        id: Date.now(),
        text: '新任务',
        done: false
      })
    }
  }
}
</script>
```

**方式二：使用 mapMutations 辅助函数**
```vue
<template>
  <div>
    <button @click="increment">增加计数</button>
    <button @click="addTodo(newTodo)">添加任务</button>
    <input v-model="newTodo" placeholder="输入任务内容">
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      newTodo: ''
    }
  },
  methods: {
    // 映射 mutations 到方法
    ...mapMutations(['increment', 'addTodo']),
    
    // 或使用对象形式，重命名方法
    /*
    ...mapMutations({
      increase: 'increment',
      addTask: 'addTodo'
    })
    */
  }
}
</script>
```

### 4.4 分发 Actions

**方式一：直接分发**
```vue
<template>
  <div>
    <button @click="$store.dispatch('incrementAsync')">异步增加计数</button>
    <button @click="fetchUser">获取用户信息</button>
  </div>
</template>

<script>
export default {
  methods: {
    fetchUser() {
      this.$store.dispatch('fetchUser')
        .then(user => {
          console.log('获取用户信息成功：', user)
        })
    }
  }
}
</script>
```

**方式二：使用 mapActions 辅助函数**
```vue
<template>
  <div>
    <button @click="incrementAsync">异步增加计数</button>
    <button @click="fetchUser">获取用户信息</button>
    <button @click="addTodoAsync(newTodo)">异步添加任务</button>
    <input v-model="newTodo" placeholder="输入任务内容">
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      newTodo: ''
    }
  },
  methods: {
    // 映射 actions 到方法
    ...mapActions(['incrementAsync', 'fetchUser', 'addTodoAsync']),
    
    // 或使用对象形式，重命名方法
    /*
    ...mapActions({
      asyncIncrease: 'incrementAsync',
      loadUser: 'fetchUser',
      asyncAddTask: 'addTodoAsync'
    })
    */
  }
}
</script>
```

## 5. Vuex Modules

### 5.1 创建模块

**创建 store/modules/user.js**：
```javascript
export default {
  // 命名空间，避免模块间命名冲突
  namespaced: true,
  
  state: {
    userInfo: null,
    token: null
  },
  
  getters: {
    isLoggedIn: state => !!state.token,
    getUserInfo: state => state.userInfo
  },
  
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
    },
    setToken(state, token) {
      state.token = token
    },
    clearUser(state) {
      state.userInfo = null
      state.token = null
    }
  },
  
  actions: {
    login({ commit }, credentials) {
      // 模拟登录请求
      return new Promise((resolve) => {
        setTimeout(() => {
          const token = 'mock-token-123'
          const userInfo = { id: 1, name: '张三', role: 'admin' }
          
          // 保存到 localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          
          // 提交 mutations
          commit('setToken', token)
          commit('setUserInfo', userInfo)
          
          resolve({ token, userInfo })
        }, 1000)
      })
    },
    
    logout({ commit }) {
      // 清除 localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      
      // 提交 mutation
      commit('clearUser')
    },
    
    initUser({ commit }) {
      // 从 localStorage 初始化用户信息
      const token = localStorage.getItem('token')
      const userInfoStr = localStorage.getItem('userInfo')
      
      if (token && userInfoStr) {
        commit('setToken', token)
        commit('setUserInfo', JSON.parse(userInfoStr))
      }
    }
  }
}
```

**创建 store/modules/todo.js**：
```javascript
export default {
  namespaced: true,
  
  state: {
    todos: []
  },
  
  getters: {
    allTodos: state => state.todos,
    completedTodos: state => state.todos.filter(todo => todo.done),
    pendingTodos: state => state.todos.filter(todo => !todo.done)
  },
  
  mutations: {
    setTodos(state, todos) {
      state.todos = todos
    },
    addTodo(state, todo) {
      state.todos.push(todo)
    },
    toggleTodo(state, todoId) {
      const todo = state.todos.find(todo => todo.id === todoId)
      if (todo) {
        todo.done = !todo.done
      }
    }
  },
  
  actions: {
    fetchTodos({ commit }) {
      // 模拟获取任务列表
      return new Promise((resolve) => {
        setTimeout(() => {
          const todos = [
            { id: 1, text: '学习 Vuex Modules', done: false },
            { id: 2, text: '使用 Vuex Modules', done: false },
            { id: 3, text: '掌握 Vuex', done: false }
          ]
          commit('setTodos', todos)
          resolve(todos)
        }, 1000)
      })
    }
  }
}
```

### 5.2 在 Store 中使用模块

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import userModule from './modules/user'
import todoModule from './modules/todo'

Vue.use(Vuex)

const store = new Vuex.Store({
  // 根 state
  state: {
    appName: 'Vuex Demo'
  },
  
  // 模块
  modules: {
    user: userModule,
    todo: todoModule
  }
})

export default store
```

### 5.3 在组件中使用命名空间模块

```vue
<template>
  <div>
    <h2>{{ appName }}</h2>
    
    <!-- 使用用户模块 -->
    <div>
      <h3>用户信息</h3>
      <p>是否登录：{{ isLoggedIn ? '是' : '否' }}</p>
      <p v-if="isLoggedIn">用户名：{{ getUserInfo.name }}</p>
      <button @click="login">登录</button>
      <button @click="logout" v-if="isLoggedIn">退出</button>
    </div>
    
    <!-- 使用任务模块 -->
    <div>
      <h3>任务列表</h3>
      <button @click="fetchTodos">获取任务</button>
      <ul>
        <li v-for="todo in allTodos" :key="todo.id">
          <input type="checkbox" v-model="todo.done" @change="toggleTodo(todo.id)">
          <span>{{ todo.text }}</span>
        </li>
      </ul>
      <p>已完成任务数：{{ completedTodos.length }}</p>
      <p>待完成任务数：{{ pendingTodos.length }}</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    // 根 state
    appName() {
      return this.$store.state.appName
    },
    
    // 用户模块的 getters
    ...mapGetters('user', ['isLoggedIn', 'getUserInfo']),
    
    // 任务模块的 getters
    ...mapGetters('todo', ['allTodos', 'completedTodos', 'pendingTodos'])
  },
  
  methods: {
    // 用户模块的 actions
    ...mapActions('user', ['login', 'logout']),
    
    // 任务模块的 actions 和 mutations
    ...mapActions('todo', ['fetchTodos']),
    ...mapMutations('todo', ['toggleTodo'])
  },
  
  created() {
    // 初始化用户信息
    this.$store.dispatch('user/initUser')
  }
}
</script>
```

## 6. Vuex 最佳实践

1. **单一数据源**：所有组件的状态都应该集中在一个 Store 中
2. **State 是只读的**：唯一修改 State 的方式是提交 Mutation
3. **Mutations 是同步函数**：异步操作应该放在 Actions 中
4. **使用 Modules 分割 Store**：对于大型应用，将 Store 分割成多个模块，提高可维护性
5. **使用命名空间**：为模块开启命名空间，避免命名冲突
6. **持久化存储**：将重要状态（如 token、用户信息）保存到 localStorage 或 sessionStorage
7. **合理使用辅助函数**：使用 mapState、mapGetters、mapMutations、mapActions 简化组件中的代码
8. **避免过度使用 Vuex**：只有需要在多个组件间共享的状态才放入 Vuex，组件内部状态使用组件自身的 data

## 7. Vuex 调试

### 7.1 使用 Vue DevTools

Vue DevTools 是调试 Vue 应用的强大工具，支持 Vuex 调试：
- 查看 State 变化
- 追踪 Mutations 和 Actions 的调用
- 时间旅行：可以回溯到之前的状态

### 7.2 开启严格模式

在开发环境下，可以开启严格模式，有助于发现错误：

```javascript
const store = new Vuex.Store({
  // ...
  strict: process.env.NODE_ENV !== 'production' // 只在开发环境开启严格模式
})
```

严格模式下，任何直接修改 State 的行为都会抛出错误，确保所有 State 修改都通过 Mutation 提交。

## 8. 总结

Vuex 是 Vue.js 应用的状态管理方案，适用于中大型应用。它提供了集中式状态管理，确保状态的可预测性和可维护性。

核心概念包括：
- State：存储应用状态
- Getters：派生新状态
- Mutations：同步修改状态
- Actions：处理异步操作
- Modules：分割 Store

在实际开发中，我们应该根据项目规模和需求，合理使用 Vuex，遵循最佳实践，编写可维护、可扩展的状态管理代码。

Vuex 虽然强大，但也增加了项目的复杂度。对于小型应用，可能不需要使用 Vuex，使用简单的状态管理方案（如 Event Bus 或 Provide/Inject）即可。