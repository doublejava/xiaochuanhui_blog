# Vue3 依赖注入 (Provide/Inject)

## 什么是依赖注入

依赖注入是 Vue3 中用于组件间通信的一种机制，它允许父组件向其所有子组件提供数据，无论组件层级有多深。

## 基本用法

### 父组件使用 provide 提供数据

```vue
<template>
  <div class="parent">
    <h2>父组件</h2>
    <ChildComponent />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 提供响应式数据
const count = ref(0)
provide('count', count)

// 提供普通数据
provide('appName', 'Vue3 App')

// 提供方法
provide('increment', () => {
  count.value++
})
</script>
```

### 子组件使用 inject 注入数据

```vue
<template>
  <div class="child">
    <h3>子组件</h3>
    <p>App Name: {{ appName }}</p>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <GrandchildComponent />
  </div>
</template>

<script setup>
import { inject } from 'vue'
import GrandchildComponent from './GrandchildComponent.vue'

// 注入数据
const appName = inject('appName')
const count = inject('count')
const increment = inject('increment')
</script>
```

### 孙组件也可以注入数据

```vue
<template>
  <div class="grandchild">
    <h4>孙组件</h4>
    <p>Count from Grandparent: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

// 注入来自祖父组件的数据
const count = inject('count')
const increment = inject('increment')
</script>
```

## 注入默认值

当注入的数据不存在时，可以提供默认值：

```javascript
// 基本类型默认值
const defaultValue = inject('nonExistentKey', 'default value')

// 函数类型默认值，使用工厂函数避免不必要的计算
const complexDefault = inject('nonExistentKey', () => {
  return { message: 'complex default' }
})
```

## 响应式数据的传递

当使用 `provide` 传递响应式数据（如 `ref` 或 `reactive`）时，子组件注入的数据也会保持响应式：

```javascript
import { ref, provide, inject } from 'vue'

// 父组件
const count = ref(0)
provide('count', count)

// 子组件
const injectedCount = inject('count')
console.log(injectedCount.value) // 0

// 父组件中修改数据
count.value++
// 子组件中的数据也会更新
console.log(injectedCount.value) // 1
```

## 非响应式数据的传递

如果需要传递非响应式数据，可以使用 `readonly` 或直接传递普通值：

```javascript
import { ref, provide, readonly } from 'vue'

// 传递非响应式数据
const count = ref(0)
provide('readonlyCount', readonly(count))

// 或者直接传递普通值
provide('staticCount', count.value)
```

## Provide/Inject vs Props/Events

| 特性 | Provide/Inject | Props/Events |
|------|----------------|--------------|
| 组件层级 | 支持跨多层级通信 | 主要用于父子组件通信 |
| 代码复杂度 | 简单，无需逐层传递 | 多层级时需要逐层传递（props drilling） |
| 类型安全 | 需要额外配置 TypeScript 类型 | 天然支持 TypeScript 类型 |
| 适用场景 | 全局状态管理、主题配置、工具函数 | 父子组件间的直接通信 |
| 响应式 | 支持响应式数据 | 支持响应式数据 |

## 实际应用场景

1. **全局状态管理**：在根组件提供全局状态，所有子组件可以访问
2. **主题配置**：提供主题相关的颜色、字体等配置
3. **工具函数**：提供全局可用的工具函数
4. **国际化**：提供国际化相关的数据和方法
5. **路由和导航**：提供路由相关的信息和方法
6. **用户信息**：提供当前登录用户的信息

## 示例：主题切换

```vue
<!-- App.vue -->
<template>
  <div :class="`app ${theme}`">
    <button @click="toggleTheme">切换主题</button>
    <ThemedComponent />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ThemedComponent from './ThemedComponent.vue'

const theme = ref('light')

// 提供主题相关的数据和方法
provide('theme', theme)
provide('toggleTheme', () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
})
</script>

<style>
.app {
  padding: 20px;
  transition: background-color 0.3s, color 0.3s;
}

.app.light {
  background-color: white;
  color: black;
}

.app.dark {
  background-color: #333;
  color: white;
}
</style>
```

```vue
<!-- ThemedComponent.vue -->
<template>
  <div class="themed-component">
    <h2>主题组件</h2>
    <p>当前主题：{{ theme }}</p>
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const theme = inject('theme')
const toggleTheme = inject('toggleTheme')
</script>
```

## 示例：国际化

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <button @click="switchLanguage('en')">English</button>
    <button @click="switchLanguage('zh')">中文</button>
    <I18nComponent />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import I18nComponent from './I18nComponent.vue'

// 语言包
const messages = {
  en: {
    hello: 'Hello',
    welcome: 'Welcome to Vue3'
  },
  zh: {
    hello: '你好',
    welcome: '欢迎使用 Vue3'
  }
}

const currentLanguage = ref('en')

// 提供国际化相关的数据和方法
provide('currentLanguage', currentLanguage)
provide('t', (key) => {
  return messages[currentLanguage.value][key] || key
})
provide('switchLanguage', (lang) => {
  currentLanguage.value = lang
})
</script>
```

```vue
<!-- I18nComponent.vue -->
<template>
  <div class="i18n-component">
    <h2>{{ t('hello') }}</h2>
    <p>{{ t('welcome') }}</p>
    <p>Current Language: {{ currentLanguage }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const currentLanguage = inject('currentLanguage')
const t = inject('t')
</script>
```

## Provide/Inject 的注意事项

1. **类型安全**：在 TypeScript 中，需要额外配置类型，否则注入的数据类型为 `any`
2. **命名冲突**：避免使用相同的 key 提供不同的数据，可能导致意外覆盖
3. **响应式问题**：确保提供的响应式数据在需要时保持响应式
4. **组件耦合**：过度使用 provide/inject 可能导致组件间耦合度增加
5. **调试困难**：多层级的依赖注入可能使调试变得困难
6. **默认值的使用**：为注入的数据提供合理的默认值，增强组件的健壮性

## TypeScript 支持

在 TypeScript 中，可以使用 `InjectionKey` 来提供类型安全：

```typescript
// keys.ts
import type { InjectionKey } from 'vue'
import type { CountStore } from './types'

export const countKey: InjectionKey<CountStore> = Symbol('count')
```

```typescript
// ParentComponent.vue
import { ref, provide } from 'vue'
import { countKey } from './keys'

const count = ref(0)
const increment = () => count.value++

provide(countKey, {
  count,
  increment
})
```

```typescript
// ChildComponent.vue
import { inject } from 'vue'
import { countKey } from './keys'

const countStore = inject(countKey) // 类型安全，countStore 的类型为 CountStore | undefined
```

## 与 Pinia 的结合使用

Provide/Inject 可以与 Pinia 结合使用，提供全局状态管理：

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup>
import { provide } from 'vue'
import { useUserStore } from './stores/user'

// 提供 Pinia store
const userStore = useUserStore()
provide('userStore', userStore)
</script>
```

```vue
<!-- AnyComponent.vue -->
<template>
  <div class="component">
    <p>User: {{ userStore.user?.name }}</p>
  </div>
</template>

<script setup>
import { inject } from 'vue'

const userStore = inject('userStore')
</script>
```

## 总结

Provide/Inject 是 Vue3 中用于组件间通信的强大机制，它解决了 props drilling 问题，允许跨多层级组件传递数据。

在实际开发中，Provide/Inject 常用于提供全局状态、主题配置、工具函数等。与 Props/Events 相比，它更适合跨多层级的组件通信，但需要注意避免过度使用导致组件耦合度增加。

通过合理使用 Provide/Inject，可以使组件结构更加清晰，代码更加简洁，同时提高组件的复用性和可维护性。