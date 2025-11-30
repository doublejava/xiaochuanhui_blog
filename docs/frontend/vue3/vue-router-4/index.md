# Vue3 Vue Router 4

## 1. Vue Router 4 概述

Vue Router 4 是 Vue3 的官方路由管理器，它与 Vue3 深度集成，提供了强大的路由功能，包括路由导航、路由参数、嵌套路由、路由守卫、路由懒加载等。

## 2. Vue Router 4 基本配置

### 2.1 安装 Vue Router 4

```bash
# 使用 npm 安装
npm install vue-router@4

# 使用 yarn 安装
yarn add vue-router@4
```

### 2.2 创建路由实例

**创建 router/index.js 文件**：
```javascript
import { createRouter, createWebHistory } from 'vue-router'

// 导入组件
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'

// 定义路由规则
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // 使用 HTML5 History 模式
  routes // 路由规则
})

export default router
```

### 2.3 在 main.js 中使用路由

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入路由实例

// 创建 Vue 应用
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
```

### 2.4 在 App.vue 中添加路由出口

```vue
<template>
  <div id="app">
    <!-- 路由导航 -->
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于我们</router-link>
      <router-link to="/contact">联系我们</router-link>
    </nav>
    
    <!-- 路由出口 -->
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
  </div>
</template>
```

## 3. 路由导航

### 3.1 声明式导航

使用 `router-link` 组件进行声明式导航：

**基本用法**：
```vue
<router-link to="/">首页</router-link>
<router-link to="/about">关于我们</router-link>
```

**命名路由**：
```vue
<router-link :to="{ name: 'About' }">关于我们</router-link>
```

**带查询参数**：
```vue
<router-link :to="{ path: '/search', query: { keyword: 'vue' } }">搜索 Vue</router-link>
```

**带动态参数**：
```vue
<router-link :to="{ name: 'User', params: { id: 1 } }">用户 1</router-link>
```

### 3.2 编程式导航

使用 `router` 实例的方法进行编程式导航：

**基本导航**：
```javascript
// 字符串路径
router.push('/home')

// 对象
router.push({ path: '/home' })

// 命名路由
router.push({ name: 'User', params: { id: 1 } })

// 带查询参数
router.push({ path: '/search', query: { keyword: 'vue' } })
```

**替换当前路由**：
```javascript
// 替换当前路由，不会向 history 添加新记录
router.replace('/home')
```

**前进后退**：
```javascript
// 后退一步
router.go(-1)

// 前进一步
router.go(1)

// 前进两步
router.go(2)
```

## 4. 路由参数

### 4.1 动态路由匹配

**定义带参数的路由**：
```javascript
const routes = [
  {
    path: '/user/:id', // :id 是动态参数
    name: 'User',
    component: () => import('../views/User.vue')
  }
]
```

**在组件中获取参数**：
```vue
<template>
  <div>
    <h2>用户详情</h2>
    <p>用户ID：{{ $route.params.id }}</p>
  </div>
</template>

<script>
export default {
  watch: {
    // 监听路由参数变化
    '$route.params': {
      handler(newParams) {
        // 当路由参数变化时，重新获取数据
        this.fetchUserData(newParams.id)
      },
      immediate: true
    }
  },
  methods: {
    fetchUserData(userId) {
      // 根据用户ID获取用户数据
      console.log('Fetching data for user:', userId)
    }
  }
}
</script>
```

### 4.2 使用 Composition API 获取路由参数

**示例**：
```vue
<template>
  <div>
    <h2>用户详情</h2>
    <p>用户ID：{{ userId }}</p>
    <p>用户名：{{ username }}</p>
  </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    // 使用 useRoute 获取路由实例
    const route = useRoute()
    
    const userId = ref(route.params.id)
    const username = ref('')
    
    // 监听路由参数变化
    watch(
      () => route.params.id,
      (newId) => {
        userId.value = newId
        fetchUserData(newId)
      }
    )
    
    const fetchUserData = (id) => {
      // 模拟获取用户数据
      setTimeout(() => {
        username.value = `用户 ${id}`
      }, 500)
    }
    
    onMounted(() => {
      fetchUserData(userId.value)
    })
    
    return {
      userId,
      username
    }
  }
}
</script>
```

## 5. 嵌套路由

### 5.1 定义嵌套路由

**示例**：
```javascript
const routes = [
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue'),
    children: [
      {
        // 当 /user/profile 匹配成功，UserProfile 会被渲染在 User 的 <router-view> 中
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../views/UserProfile.vue')
      },
      {
        // 当 /user/posts 匹配成功，UserPosts 会被渲染在 User 的 <router-view> 中
        path: 'posts',
        name: 'UserPosts',
        component: () => import('../views/UserPosts.vue')
      }
    ]
  }
]
```

### 5.2 父组件中添加子路由出口

**User.vue**：
```vue
<template>
  <div>
    <h2>用户中心</h2>
    <div class="user-nav">
      <router-link to="/user/profile">个人资料</router-link>
      <router-link to="/user/posts">我的文章</router-link>
    </div>
    <!-- 子路由出口 -->
    <router-view></router-view>
  </div>
</template>
```

## 6. 路由守卫

### 6.1 全局守卫

**全局前置守卫**：
```javascript
router.beforeEach((to, from, next) => {
  // to: 即将要进入的目标路由对象
  // from: 当前导航正要离开的路由
  // next: 一定要调用该方法来 resolve 这个钩子
  
  // 验证用户是否登录
  const isLoggedIn = localStorage.getItem('token')
  
  // 如果访问的是需要登录的页面，且用户未登录，则跳转到登录页
  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // 保存当前路径，登录后跳转回来
    })
  } else {
    next() // 继续导航
  }
})
```

**全局后置钩子**：
```javascript
router.afterEach((to, from) => {
  // 可以在这里做一些统计、日志记录等
  console.log(`从 ${from.path} 跳转到 ${to.path}`)
  
  // 改变页面标题
  document.title = to.meta.title || 'My App'
})
```

### 6.2 路由独享守卫

```javascript
const routes = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    beforeEnter: (to, from, next) => {
      // 路由独享的守卫，只在进入该路由时触发
      const isAdmin = localStorage.getItem('isAdmin')
      if (isAdmin) {
        next()
      } else {
        next('/403') // 没有权限，跳转到 403 页面
      }
    }
  }
]
```

### 6.3 组件内守卫

```vue
<template>
  <div>
    <h2>编辑文章</h2>
    <!-- 组件内容 -->
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  data() {
    return {
      formChanged: false
    }
  },
  
  // 进入组件前触发
  beforeRouteEnter(to, from, next) {
    // 此时组件实例还未创建，无法访问 this
    next(vm => {
      // vm 是组件实例，可以访问 this
      vm.checkPermission()
    })
  },
  
  // 路由更新时触发（组件复用）
  beforeRouteUpdate(to, from, next) {
    // 可以访问 this
    this.fetchData(to.params.id)
    next()
  },
  
  // 离开组件前触发
  beforeRouteLeave(to, from, next) {
    // 可以访问 this
    if (this.formChanged && !confirm('表单已修改，确定要离开吗？')) {
      next(false) // 取消导航
    } else {
      next() // 继续导航
    }
  },
  
  methods: {
    checkPermission() {
      // 检查权限
    },
    fetchData(id) {
      // 获取数据
    }
  }
}
</script>
```

### 6.4 使用 Composition API 的路由守卫

```vue
<template>
  <div>
    <h2>使用 Composition API 的路由守卫</h2>
    <p>当前页面：{{ currentPage }}</p>
  </div>
</template>

<script>
import { ref, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const currentPage = ref(route.path)
    const formChanged = ref(false)
    
    // 路由更新时触发
    onBeforeRouteUpdate((to, from) => {
      currentPage.value = to.path
      console.log('路由更新：', from.path, '→', to.path)
    })
    
    // 离开组件前触发
    onBeforeRouteLeave((to, from, next) => {
      if (formChanged.value && !confirm('表单已修改，确定要离开吗？')) {
        next(false) // 取消导航
      } else {
        next() // 继续导航
      }
    })
    
    return {
      currentPage
    }
  }
}
</script>
```

## 7. 路由懒加载

### 7.1 基本用法

```javascript
const routes = [
  {
    path: '/about',
    name: 'About',
    // 使用懒加载
    component: () => import('../views/About.vue')
  }
]
```

### 7.2 按组懒加载

```javascript
const routes = [
  {
    path: '/user/profile',
    component: () => import(/* webpackChunkName: "user" */ '../views/UserProfile.vue')
  },
  {
    path: '/user/posts',
    component: () => import(/* webpackChunkName: "user" */ '../views/UserPosts.vue')
  }
]
```

## 8. 路由元信息

### 8.1 定义元信息

```javascript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: '仪表盘',
      roles: ['admin', 'editor']
    }
  }
]
```

### 8.2 使用元信息

```javascript
// 在路由守卫中使用
router.beforeEach((to, from, next) => {
  // 检查用户角色
  const userRole = localStorage.getItem('userRole')
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    next('/403')
  } else {
    next()
  }
})

// 在组件中使用
computed: {
  isAdmin() {
    return this.$route.meta.roles && this.$route.meta.roles.includes('admin')
  }
}
```

## 9. 路由滚动行为

```javascript
const router = createRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    // savedPosition 只有在 popstate 导航时才可用（如浏览器后退按钮）
    if (savedPosition) {
      return savedPosition
    } else {
      // 滚动到顶部
      return { top: 0 }
    }
  }
})
```

## 10. 常见问题与解决方案

### 10.1 路由跳转后页面不刷新

**问题**：使用 `router.push()` 跳转后，组件数据没有更新。

**解决方案**：
- 监听路由参数变化
- 使用 `key` 属性强制组件重新渲染

```vue
<template>
  <div :key="$route.fullPath">
    <!-- 组件内容 -->
  </div>
</template>
```

### 10.2 嵌套路由不显示

**问题**：配置了嵌套路由，但子组件不显示。

**解决方案**：
- 确保父组件中包含 `<router-view>` 标签
- 检查子路由的路径是否正确，子路由路径不要以 `/` 开头

### 10.3 404 页面配置

```javascript
const routes = [
  // 其他路由
  {
    // 匹配所有路径
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]
```

## 11. 最佳实践

1. **使用命名路由**：提高代码的可维护性
2. **使用路由懒加载**：优化首屏加载速度
3. **使用路由元信息**：统一管理路由的权限、标题等信息
4. **合理使用路由守卫**：实现权限控制、导航拦截等功能
5. **使用 Composition API**：在 Vue3 中优先使用 Composition API
6. **避免过度使用嵌套路由**：嵌套层级不宜过深，建议不超过 3 层
7. **使用 TypeScript**：提高代码的类型安全性
8. **统一管理路由配置**：将路由配置集中管理，便于维护
9. **实现 404 页面**：提供友好的错误页面
10. **测试路由功能**：确保路由在各种情况下都能正常工作

## 12. 总结

Vue Router 4 是 Vue3 的官方路由管理器，提供了强大的路由功能，包括路由导航、路由参数、嵌套路由、路由守卫、路由懒加载等。

掌握 Vue Router 4 是构建 Vue3 单页面应用的基础，合理使用路由功能可以提高应用的性能和用户体验。在实际开发中，我们应该根据项目需求选择合适的路由配置，遵循最佳实践，编写可维护、可扩展的路由代码。

Vue Router 4 与 Vue3 深度集成，支持 Composition API，提供了更好的类型支持和性能优化，是构建现代 Vue 应用的重要工具。