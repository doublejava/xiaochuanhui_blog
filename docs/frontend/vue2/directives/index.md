# Vue2 自定义指令 (Directives)

## 什么是自定义指令

自定义指令是 Vue2 中用于对 DOM 进行底层操作的一种机制。它们允许你直接操作 DOM 元素，扩展 Vue 的模板功能。

## 内置指令 vs 自定义指令

Vue2 提供了多种内置指令，如 `v-if`、`v-for`、`v-bind`、`v-on` 等。自定义指令允许你创建自己的指令，以满足特定的业务需求。

## 自定义指令的生命周期钩子

| 钩子函数 | 描述 |
|----------|------|
| bind | 只调用一次，指令第一次绑定到元素时调用 |
| inserted | 被绑定元素插入父节点时调用 |
| update | 所在组件的 VNode 更新时调用，但可能发生在其子 VNode 更新之前 |
| componentUpdated | 指令所在组件的 VNode 及其子 VNode 全部更新后调用 |
| unbind | 只调用一次，指令与元素解绑时调用 |

## 基本用法

### 全局自定义指令

```javascript
// 注册一个全局自定义指令 v-focus
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时...
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})
```

### 局部自定义指令

```javascript
new Vue({
  el: '#app',
  directives: {
    // 注册一个局部自定义指令 v-focus
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  }
})
```

### 在模板中使用

```html
<div id="app">
  <input v-focus>
</div>
```

## 指令钩子函数的参数

指令钩子函数会接收以下参数：

1. **el**：指令所绑定的元素，可以用来直接操作 DOM
2. **binding**：一个对象，包含以下属性：
   - **name**：指令名，不包括 v- 前缀
   - **value**：指令的绑定值
   - **oldValue**：指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用
   - **expression**：字符串形式的指令表达式
   - **arg**：传给指令的参数
   - **modifiers**：一个包含修饰符的对象
3. **vnode**：Vue 编译生成的虚拟节点
4. **oldVnode**：上一个虚拟节点，仅在 update 和 componentUpdated 钩子中可用

## 示例：带参数的指令

```javascript
Vue.directive('color', {
  bind: function (el, binding) {
    el.style.color = binding.value
  }
})
```

在模板中使用：

```html
<div v-color="'red'">这段文字是红色的</div>
<div v-color="textColor">这段文字的颜色由 data 中的 textColor 决定</div>
```

## 示例：带参数和修饰符的指令

```javascript
Vue.directive('position', {
  bind: function (el, binding) {
    let position = binding.arg || 'top'
    let offset = binding.value || 0
    
    if (binding.modifiers.left) {
      position = 'left'
    } else if (binding.modifiers.right) {
      position = 'right'
    } else if (binding.modifiers.bottom) {
      position = 'bottom'
    }
    
    el.style[position] = offset + 'px'
  }
})
```

在模板中使用：

```html
<div v-position="100">距离顶部 100px</div>
<div v-position:left="50">距离左侧 50px</div>
<div v-position.right="20">距离右侧 20px</div>
<div v-position.bottom="30">距离底部 30px</div>
```

## 函数简写

如果你的指令只需要在 `bind` 和 `update` 时做同样的事情，可以使用函数简写：

```javascript
Vue.directive('color', function (el, binding) {
  el.style.color = binding.value
})
```

## 对象字面量

如果指令需要多个值，可以传入一个 JavaScript 对象字面量：

```javascript
Vue.directive('style', function (el, binding) {
  Object.keys(binding.value).forEach(key => {
    el.style[key] = binding.value[key]
  })
})
```

在模板中使用：

```html
<div v-style="{ color: 'red', fontSize: '20px' }">
  这段文字是红色的，字体大小为 20px
</div>
```

## 实际应用场景

1. **表单验证**：自定义指令用于表单验证
2. **权限控制**：根据用户权限显示或隐藏元素
3. **滚动监听**：监听元素滚动事件
4. **拖拽功能**：实现元素拖拽
5. **图片懒加载**：延迟加载图片
6. **数字格式化**：实时格式化数字输入

## 示例：图片懒加载指令

```javascript
Vue.directive('lazyload', {
  inserted: function (el) {
    // 检查元素是否在视口中
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 元素进入视口，加载图片
          el.src = el.dataset.src
          // 停止观察
          observer.unobserve(el)
        }
      })
    })
    
    // 开始观察元素
    observer.observe(el)
  }
})
```

在模板中使用：

```html
<img v-lazyload data-src="https://example.com/image.jpg" alt="懒加载图片">
```

## 注意事项

1. 自定义指令主要用于底层 DOM 操作，对于复杂的逻辑，建议使用组件
2. 避免在指令中进行复杂的业务逻辑处理
3. 指令名不要与 Vue 内置指令冲突
4. 指令的生命周期钩子函数中的 this 指向 window，而不是 Vue 实例
5. 对于需要响应式更新的指令，要在 update 钩子中处理

## 总结

自定义指令是 Vue2 中用于扩展模板功能的强大工具，它们允许你直接操作 DOM 元素，实现各种复杂的交互效果。合理使用自定义指令可以使代码更加简洁、可维护，并且能够更好地满足特定的业务需求。