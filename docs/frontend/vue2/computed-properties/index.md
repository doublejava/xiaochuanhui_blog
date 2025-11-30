# Vue2 计算属性 (Computed Properties)

## 什么是计算属性

计算属性是 Vue2 中用于声明式地计算复杂逻辑的属性。它们基于响应式依赖进行缓存，只有当依赖发生变化时才会重新计算，提高了性能。

## 计算属性 vs 方法

| 特性 | 计算属性 | 方法 |
|------|----------|------|
| 缓存 | 有缓存，依赖不变时不重新计算 | 每次调用都会重新执行 |
| 语法 | 作为属性访问 | 作为方法调用 |
| 适用场景 | 复杂数据处理、数据转换 | 事件处理、命令式逻辑 |

## 基本用法

```javascript
new Vue({
  el: '#app',
  data: {
    firstName: 'John',
    lastName: 'Doe'
  },
  computed: {
    // 计算属性的 getter
    fullName: function () {
      return this.firstName + ' ' + this.lastName
    }
  }
})
```

在模板中使用：

```html
<div id="app">
  <p>{{ fullName }}</p>
</div>
```

## 计算属性的 setter

计算属性默认只有 getter，但也可以提供 setter：

```javascript
computed: {
  fullName: {
    // getter
    get: function () {
      return this.firstName + ' ' + this.lastName
    },
    // setter
    set: function (newValue) {
      var names = newValue.split(' ')
      this.firstName = names[0]
      this.lastName = names[names.length - 1]
    }
  }
}
```

## 计算属性的缓存机制

计算属性会基于它们的响应式依赖进行缓存。只有当依赖的数据发生变化时，计算属性才会重新计算。这意味着如果依赖没有变化，多次访问计算属性会立即返回之前的计算结果，而不会重新执行函数。

## 适用场景

1. **数据转换**：将原始数据转换为需要的格式
2. **数据过滤**：根据条件过滤数组或对象
3. **数据组合**：将多个数据属性组合成一个新属性
4. **复杂逻辑计算**：包含多个条件判断的复杂逻辑

## 示例：过滤列表

```javascript
new Vue({
  el: '#app',
  data: {
    items: [
      { name: 'Apple', category: 'fruit' },
      { name: 'Carrot', category: 'vegetable' },
      { name: 'Banana', category: 'fruit' },
      { name: 'Broccoli', category: 'vegetable' }
    ],
    selectedCategory: 'fruit'
  },
  computed: {
    filteredItems: function () {
      return this.items.filter(item => item.category === this.selectedCategory)
    }
  }
})
```

## 注意事项

1. 计算属性的依赖必须是响应式的（即 data 或 props 中的属性）
2. 不要在计算属性中执行异步操作或修改 DOM
3. 计算属性的名称不能与 data 或 props 中的属性名冲突
4. 对于简单的逻辑，使用表达式更简洁；对于复杂逻辑，使用计算属性

## 总结

计算属性是 Vue2 中处理复杂数据逻辑的强大工具，它们提供了缓存机制，提高了应用性能。合理使用计算属性可以使代码更加简洁、可维护，并且能够更好地利用 Vue 的响应式系统。