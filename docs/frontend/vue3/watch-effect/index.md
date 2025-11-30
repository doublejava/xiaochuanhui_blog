# Vue3 响应式监听器 (Watch Effect)

## 什么是 Watch Effect

`watchEffect` 是 Vue3 中用于监听响应式数据变化的一种机制。它会自动追踪依赖，并在依赖发生变化时重新执行。

## 基本用法

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

// 创建一个监听器
const stop = watchEffect(() => {
  console.log(`Count is: ${count.value}`)
})

// 输出: Count is: 0

count.value++
// 输出: Count is: 1

// 停止监听
stop()

count.value++
// 没有输出，因为监听器已停止
```

## Watch Effect vs Watch

| 特性 | watchEffect | watch |
|------|-------------|-------|
| 依赖追踪 | 自动追踪依赖 | 需要显式指定依赖 |
| 执行时机 | 初始时立即执行 | 默认只在依赖变化时执行 |
| 适用场景 | 自动响应多个依赖的变化 | 精确控制监听的依赖和执行时机 |
| 回调参数 | 无 | 新值、旧值和清理函数 |

## Watch Effect 的清理函数

`watchEffect` 可以返回一个清理函数，用于在监听器重新执行或停止时清理副作用：

```javascript
import { ref, watchEffect } from 'vue'

const searchQuery = ref('')

watchEffect((onCleanup) => {
  // 模拟 API 调用
  const timer = setTimeout(() => {
    console.log(`Searching for: ${searchQuery.value}`)
  }, 300)
  
  // 清理函数，在监听器重新执行或停止时调用
  onCleanup(() => {
    clearTimeout(timer)
  })
})

// 当 searchQuery 变化时，会先执行清理函数清除之前的定时器，再执行新的监听器
searchQuery.value = 'Vue3'
searchQuery.value = 'Watch Effect'
```

## Watch Effect 的执行时机

### 初始执行

`watchEffect` 会在创建时立即执行一次，用于收集依赖：

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

console.log('Before watchEffect')

watchEffect(() => {
  console.log(`Count is: ${count.value}`)
})

console.log('After watchEffect')

// 输出顺序：
// Before watchEffect
// Count is: 0
// After watchEffect
```

### 响应式更新

当依赖发生变化时，`watchEffect` 会重新执行：

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)
const name = ref('Vue')

watchEffect(() => {
  console.log(`${name.value} count is: ${count.value}`)
})

// 输出: Vue count is: 0

count.value++
// 输出: Vue count is: 1

name.value = 'React'
// 输出: React count is: 1
```

## Watch Effect 的调度器

可以通过 `flush` 选项来控制 `watchEffect` 的执行时机：

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

// 默认：'pre' - 在组件更新前执行
watchEffect(() => {
  console.log('Default (pre):', count.value)
})

// 'post' - 在组件更新后执行
watchEffect(() => {
  console.log('Post:', count.value)
}, { flush: 'post' })

// 'sync' - 同步执行
watchEffect(() => {
  console.log('Sync:', count.value)
}, { flush: 'sync' })
```

## Watch Effect 的调试

可以通过 `onTrack` 和 `onTrigger` 选项来调试 `watchEffect`：

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  console.log(`Count is: ${count.value}`)
}, {
  // 追踪依赖时调用
  onTrack(e) {
    console.log('Tracked:', e)
  },
  // 依赖变化触发更新时调用
  onTrigger(e) {
    console.log('Triggered:', e)
  }
})
```

## Watch Effect 的应用场景

1. **数据持久化**：将响应式数据同步到 localStorage 或 sessionStorage
2. **API 调用**：根据搜索关键词自动调用 API
3. **DOM 更新**：根据响应式数据更新 DOM 元素
4. **事件监听**：根据响应式数据添加或移除事件监听器
5. **动画控制**：根据响应式数据控制动画效果

## 示例：数据持久化

```javascript
import { ref, watchEffect } from 'vue'

// 从 localStorage 初始化数据
const savedCount = localStorage.getItem('count')
const count = ref(savedCount ? parseInt(savedCount) : 0)

// 当 count 变化时，同步到 localStorage
watchEffect(() => {
  localStorage.setItem('count', count.value.toString())
  console.log('Count saved to localStorage:', count.value)
})
```

## 示例：自动搜索

```javascript
import { ref, watchEffect } from 'vue'

const searchQuery = ref('')
const searchResults = ref([])
const isLoading = ref(false)

watchEffect(async (onCleanup) => {
  // 如果搜索关键词为空，清空结果
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  
  isLoading.value = true
  
  // 模拟 API 调用
  const controller = new AbortController()
  const signal = controller.signal
  
  try {
    const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(searchQuery.value)}`, {
      signal
    })
    const data = await response.json()
    searchResults.value = data.results
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Search error:', error)
    }
  } finally {
    isLoading.value = false
  }
  
  // 清理函数，在监听器重新执行或停止时取消之前的请求
  onCleanup(() => {
    controller.abort()
  })
})
```

## 示例：DOM 元素交互

```javascript
import { ref, watchEffect, onMounted } from 'vue'

const isDarkMode = ref(false)

onMounted(() => {
  watchEffect(() => {
    // 根据 isDarkMode 状态切换 CSS 类
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  })
})

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
}
```

## Watch Effect 的注意事项

1. **避免无限循环**：不要在 `watchEffect` 中直接修改其依赖的数据
2. **清理副作用**：对于异步操作、事件监听器等副作用，务必使用清理函数
3. **合理使用调度器**：根据实际需求选择合适的执行时机
4. **避免过度使用**：只在需要自动响应多个依赖变化时使用 `watchEffect`
5. **注意初始执行**：`watchEffect` 会在创建时立即执行，确保初始状态的正确性

## Watch Effect 与组件生命周期

`watchEffect` 会在组件挂载时创建，在组件卸载时自动停止：

```vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>

<script setup>
import { ref, watchEffect, onUnmounted } from 'vue'

const count = ref(0)

// 组件挂载时创建，卸载时自动停止
watchEffect(() => {
  console.log(`Count is: ${count.value}`)
})

// 手动停止示例（通常不需要，组件卸载时会自动停止）
onUnmounted(() => {
  // stop() // 如果保存了 stop 函数，可以手动停止
})
</script>
```

## 总结

`watchEffect` 是 Vue3 中用于自动响应式监听的强大工具，它可以自动追踪依赖，并在依赖发生变化时重新执行。与 `watch` 相比，`watchEffect` 更适合处理需要自动响应多个依赖变化的场景。

在实际开发中，`watchEffect` 常用于数据持久化、API 调用、DOM 更新等场景。通过合理使用清理函数和调度器，可以创建出高效、可靠的响应式监听器。

需要注意的是，`watchEffect` 会在创建时立即执行，并且会自动追踪所有在其回调函数中使用的响应式数据。因此，在使用 `watchEffect` 时，需要确保回调函数的副作用是可控的，避免出现无限循环或其他意外行为。