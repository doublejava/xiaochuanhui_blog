# Vue2 过滤器 (Filters)

## 什么是过滤器

过滤器是 Vue2 中用于格式化文本的一种机制。它们可以在模板表达式中使用，用于对数据进行格式化处理。

## 过滤器的使用场景

1. **日期格式化**：将时间戳转换为可读的日期格式
2. **数字格式化**：添加千位分隔符、保留小数位数等
3. **文本处理**：大写转换、首字母大写、截断文本等
4. **货币格式化**：添加货币符号、格式化金额等
5. **数据转换**：将枚举值转换为对应的文本

## 基本用法

### 全局过滤器

```javascript
// 注册一个全局过滤器 formatDate
Vue.filter('formatDate', function (value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString()
})
```

### 局部过滤器

```javascript
new Vue({
  el: '#app',
  data: {
    message: 'hello world'
  },
  filters: {
    // 注册一个局部过滤器 capitalize
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
})
```

### 在模板中使用

```html
<div id="app">
  <!-- 使用全局过滤器 -->
  <p>{{ timestamp | formatDate }}</p>
  
  <!-- 使用局部过滤器 -->
  <p>{{ message | capitalize }}</p>
  
  <!-- 串联使用多个过滤器 -->
  <p>{{ message | capitalize | uppercase }}</p>
</div>
```

## 过滤器的参数

过滤器可以接收多个参数：

```javascript
Vue.filter('formatCurrency', function (value, currency = '¥', decimals = 2) {
  if (typeof value !== 'number') {
    return value
  }
  const formatted = value.toFixed(decimals)
  return `${currency}${formatted}`
})
```

在模板中使用：

```html
<!-- 使用默认参数 -->
<p>{{ price | formatCurrency }}</p>

<!-- 传递自定义参数 -->
<p>{{ price | formatCurrency('$', 0) }}</p>
```

## 示例：常用过滤器实现

### 1. 日期格式化

```javascript
Vue.filter('formatDate', function (value, format = 'YYYY-MM-DD') {
  if (!value) return ''
  const date = new Date(value)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
})
```

### 2. 数字格式化

```javascript
Vue.filter('formatNumber', function (value, decimals = 2, thousandsSeparator = ',', decimalSeparator = '.') {
  if (typeof value !== 'number') {
    return value
  }
  
  const parts = value.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
  
  return parts.join(decimalSeparator)
})
```

### 3. 文本截断

```javascript
Vue.filter('truncate', function (value, length = 100, suffix = '...') {
  if (!value) return ''
  if (value.length <= length) return value
  return value.substring(0, length) + suffix
})
```

### 4. 货币格式化

```javascript
Vue.filter('currency', function (value, currencySymbol = '¥', decimals = 2) {
  if (typeof value !== 'number') {
    return value
  }
  
  const formatted = value.toFixed(decimals)
  return `${currencySymbol}${formatted}`
})
```

### 5. 枚举转换

```javascript
Vue.filter('enum', function (value, enumMap) {
  if (value === undefined || value === null) return ''
  return enumMap[value] || value
})
```

在模板中使用枚举过滤器：

```html
<div id="app">
  <p>{{ status | enum({ 0: '待处理', 1: '处理中', 2: '已完成', 3: '已取消' }) }}</p>
</div>
```

## 过滤器的注意事项

1. **过滤器只能在模板中使用**：不能在 JavaScript 表达式或计算属性中直接使用
2. **过滤器是纯函数**：它们不应该修改原始数据，只应该返回格式化后的结果
3. **过滤器的执行顺序**：从左到右依次执行
4. **Vue3 中已移除过滤器**：Vue3 推荐使用计算属性或方法代替过滤器
5. **性能考虑**：对于复杂的格式化逻辑，建议使用计算属性，因为计算属性有缓存

## 过滤器 vs 计算属性

| 特性 | 过滤器 | 计算属性 |
|------|--------|----------|
| 用途 | 文本格式化 | 复杂数据处理 |
| 缓存 | 无缓存 | 有缓存 |
| 使用位置 | 只能在模板中使用 | 可在模板和 JavaScript 中使用 |
| 语法 | 使用管道符 `|` | 作为属性访问 |
| Vue3 支持 | 不支持 | 支持 |

## 示例：综合使用

```javascript
new Vue({
  el: '#app',
  data: {
    articles: [
      {
        title: 'Vue2 过滤器详解',
        content: '过滤器是 Vue2 中用于格式化文本的一种机制...',
        created_at: 1620000000000,
        views: 1234
      },
      {
        title: 'Vue2 组件通信',
        content: '组件通信是 Vue2 开发中的重要概念...',
        created_at: 1630000000000,
        views: 5678
      }
    ]
  },
  filters: {
    formatDate: function (value) {
      if (!value) return ''
      const date = new Date(value)
      return date.toLocaleDateString()
    },
    formatNumber: function (value) {
      if (typeof value !== 'number') return value
      return value.toLocaleString()
    },
    truncate: function (value, length = 100) {
      if (!value) return ''
      if (value.length <= length) return value
      return value.substring(0, length) + '...'
    }
  }
})
```

在模板中使用：

```html
<div id="app">
  <div v-for="article in articles" :key="article.title" class="article">
    <h3>{{ article.title }}</h3>
    <p class="content">{{ article.content | truncate(150) }}</p>
    <div class="meta">
      <span>发布时间：{{ article.created_at | formatDate }}</span>
      <span>浏览量：{{ article.views | formatNumber }}</span>
    </div>
  </div>
</div>
```

## Vue3 中的替代方案

由于 Vue3 已移除过滤器，推荐使用以下替代方案：

1. **计算属性**：对于复杂的格式化逻辑
2. **方法**：对于需要接收参数的格式化逻辑
3. **组合式函数**：对于可复用的格式化逻辑
4. **第三方库**：如 date-fns、numeral.js 等

## 总结

过滤器是 Vue2 中用于文本格式化的便捷工具，它们可以让模板代码更加清晰、简洁。虽然 Vue3 已移除过滤器，但在 Vue2 项目中，过滤器仍然是一种有效的文本处理方式。合理使用过滤器可以提高代码的可读性和可维护性，同时减少模板中的复杂表达式。