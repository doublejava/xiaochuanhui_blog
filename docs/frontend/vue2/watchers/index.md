# Vue2 监听器 (Watchers)

## 什么是监听器

监听器是 Vue2 中用于观察和响应数据变化的一种机制。当你需要在数据变化时执行异步或开销较大的操作时，监听器是最有用的。

## 基本用法

```javascript
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!',
    count: 0
  },
  watch: {
    // 监听 message 的变化
    message: function (newValue, oldValue) {
      console.log('message 从', oldValue, '变为', newValue)
    },
    // 监听 count 的变化
    count: function (newValue, oldValue) {
      console.log('count 从', oldValue, '变为', newValue)
    }
  }
})
```

## 深度监听

对于对象或数组，默认情况下监听器只监听引用的变化，而不监听内部属性的变化。要监听内部属性的变化，需要使用 `deep: true` 选项。

```javascript
new Vue({
  el: '#app',
  data: {
    user: {
      name: 'John',
      age: 30
    }
  },
  watch: {
    user: {
      handler: function (newValue, oldValue) {
        console.log('user 对象发生了变化')
      },
      deep: true
    }
  }
})
```

## 立即执行

默认情况下，监听器只会在数据变化时执行。如果需要在组件初始化时立即执行监听器，可以使用 `immediate: true` 选项。

```javascript
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  watch: {
    message: {
      handler: function (newValue, oldValue) {
        console.log('message:', newValue)
      },
      immediate: true
    }
  }
})
```

## 监听对象的单个属性

可以使用点路径语法来监听对象的单个属性：

```javascript
new Vue({
  el: '#app',
  data: {
    user: {
      name: 'John',
      age: 30
    }
  },
  watch: {
    'user.name': function (newValue, oldValue) {
      console.log('user.name 从', oldValue, '变为', newValue)
    }
  }
})
```

## 监听数组变化

监听器可以监听数组的变化，包括：
- 数组元素的修改
- 数组长度的变化
- 数组方法的调用（push, pop, shift, unshift, splice, sort, reverse）

```javascript
new Vue({
  el: '#app',
  data: {
    items: ['a', 'b', 'c']
  },
  watch: {
    items: function (newValue, oldValue) {
      console.log('items 数组发生了变化')
    }
  }
})
```

## 监听器 vs 计算属性

| 特性 | 监听器 | 计算属性 |
|------|--------|----------|
| 用途 | 执行异步或开销较大的操作 | 计算派生值 |
| 缓存 | 无缓存 | 有缓存 |
| 语法 | 函数形式 | 属性形式 |
| 适用场景 | 数据变化时的副作用 | 数据转换和组合 |

## 实际应用场景

1. **异步数据获取**：当搜索关键词变化时，调用 API 获取数据
2. **表单验证**：实时验证表单输入
3. **数据格式化**：将用户输入格式化为指定格式
4. **动画触发**：当数据变化时触发动画效果
5. **本地存储同步**：将数据变化同步到 localStorage

## 示例：搜索功能

```javascript
new Vue({
  el: '#app',
  data: {
    searchQuery: '',
    searchResults: []
  },
  watch: {
    searchQuery: function (newQuery) {
      // 清除之前的定时器
      clearTimeout(this.searchTimer)
      // 设置新的定时器，实现防抖
      this.searchTimer = setTimeout(() => {
        this.fetchSearchResults(newQuery)
      }, 300)
    }
  },
  methods: {
    fetchSearchResults: function (query) {
      // 模拟 API 调用
      console.log('搜索:', query)
      // 实际项目中这里会调用 axios 或 fetch
      this.searchResults = [`结果 1 for ${query}`, `结果 2 for ${query}`]
    }
  }
})
```

## 注意事项

1. 避免在监听器中修改被监听的数据，可能导致无限循环
2. 对于复杂的逻辑，考虑使用计算属性
3. 深度监听可能会影响性能，谨慎使用
4. 监听器的名称必须与 data 或 props 中的属性名匹配

## 总结

监听器是 Vue2 中处理数据变化副作用的强大工具，特别适合处理异步操作和复杂的副作用逻辑。合理使用监听器可以使代码更加清晰、可维护，并且能够更好地响应数据变化。