# Vue2 路由配置

## 1. Vue Router 概述

Vue Router 是 Vue.js 官方的路由管理器。它和 Vue.js 的核心深度集成，让构建单页面应用变得易如反掌。

## 2. 路由基本配置

### 2.1 安装 Vue Router

```bash
# 使用 npm 安装
npm install vue-router@3

# 使用 yarn 安装
yarn add vue-router@3
```

### 2.2 创建路由实例

**创建 router/index.js 文件**：
```javascript
import Vue from 'vue'
import VueRouter from 'vue-router'

// 引入组件
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'

// 注册路由插件
Vue.use(VueRouter)

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
const router = new VueRouter({
  mode: 'history', // 使用 history 模式，去掉 URL 中的 #
  base: process.env.BASE_URL,
  routes
})

export default router
```

### 2.3 在 main.js 中使用路由

```javascript
import Vue from 'vue'
import App from './App.vue'
import router from './router' // 引入路由实例

new Vue({
  router, // 注册路由
  render: h => h(App)
}).$mount('#app')
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

## 3. 路由参数

### 3.1 动态路由匹配

**定义带参数的路由**：
```javascript
const routes = [
  {
    path: '/user/:id', // :id 是动态参数
    name: 'User',
    component: () => import('../views/User.vue') // 懒加载组件
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

### 3.2 路由查询参数

**使用查询参数**：
```vue
<!-- 在模板中 -->
<router-link :to="{ path: '/search', query: { keyword: 'vue' } }">搜索 Vue</router-link>

<!-- 或在 JavaScript 中 -->
this.$router.push({
  path: '/search',
  query: { keyword: 'vue' }
})
```

**获取查询参数**：
```vue
<template>
  <div>
    <h2>搜索结果</h2>
    <p>搜索关键词：{{ $route.query.keyword }}</p>
  </div>
</template>
```

## 4. 嵌套路由

**定义嵌套路由**：
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

**父组件 User.vue**：
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

## 5. 路由守卫

### 5.1 全局前置守卫

**在 router/index.js 中配置**：
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

**定义需要登录的路由**：
```javascript
const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      requiresAuth: true // 添加元信息，标记需要登录
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  }
]
```

### 5.2 全局后置钩子

```javascript
router.afterEach((to, from) => {
  // 可以在这里做一些统计、日志记录等
  console.log(`从 ${from.path} 跳转到 ${to.path}`)
  
  // 改变页面标题
  document.title = to.meta.title || 'My App'
})
```

### 5.3 路由独享守卫

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

### 5.4 组件内守卫

```vue
<template>
  <div>
    <h2>编辑文章</h2>
    <!-- 组件内容 -->
  </div>
</template>

<script>
export default {
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
  
  data() {
    return {
      formChanged: false
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

## 6. 路由懒加载

### 6.1 基本用法

```javascript
const routes = [
  {
    path: '/about',
    name: 'About',
    // 懒加载组件
    component: () => import('../views/About.vue')
  }
]
```

### 6.2 按组懒加载

```javascript
// 把相同路由的组件打包到同一个 chunk 中
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

## 7. 编程式导航

### 7.1 基本导航

```javascript
// 字符串路径
this.$router.push('/home')

// 对象
this.$router.push({ path: '/home' })

// 命名路由
this.$router.push({ name: 'User', params: { id: 123 } })

// 带查询参数
this.$router.push({ path: '/search', query: { keyword: 'vue' } })
```

### 7.2 替换当前路由

```javascript
// 替换当前路由，不会向 history 添加新记录
this.$router.replace('/home')
```

### 7.3 前进后退

```javascript
// 后退一步
this.$router.go(-1)

// 前进一步
this.$router.go(1)

// 前进两步
this.$router.go(2)
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
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    // savedPosition 只有在 popstate 导航时才可用（如浏览器后退按钮）
    if (savedPosition) {
      return savedPosition
    } else {
      // 滚动到顶部
      return { x: 0, y: 0 }
    }
  }
})
```

## 10. 常见问题与解决方案

### 10.1 路由跳转后页面不刷新

**问题**：使用 `this.$router.push()` 跳转后，组件数据没有更新。

**解决方案**：
- 使用 `watch` 监听路由变化
- 使用组件内守卫 `beforeRouteUpdate`
- 确保组件是唯一的，或使用 `:key` 属性

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
    path: '*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]
```

## 11. 总结

Vue Router 是 Vue.js 官方的路由管理器，提供了强大的路由功能，包括：

- 动态路由匹配
- 嵌套路由
- 路由参数
- 路由守卫
- 路由懒加载
- 编程式导航
- 路由元信息

掌握 Vue Router 是构建单页面应用的基础，合理使用路由功能可以提高应用的性能和用户体验。在实际开发中，我们应该根据项目需求选择合适的路由配置，遵循最佳实践，编写可维护、可扩展的路由代码。