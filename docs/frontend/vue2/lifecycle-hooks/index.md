# Vue2 生命周期钩子

## 1. 生命周期概述

Vue 实例从创建到销毁的过程称为 Vue 的生命周期。在这个过程中，Vue 会自动调用一些函数，这些函数被称为生命周期钩子。通过这些钩子，我们可以在不同阶段执行自定义逻辑。

## 2. Vue2 生命周期钩子

Vue2 提供了 8 个主要的生命周期钩子，按照执行顺序依次为：

### 2.1 beforeCreate

**执行时机**：Vue 实例初始化之后，数据观测 (data observer) 和 event/watcher 事件配置之前。

**使用场景**：可以在此时做一些初始化工作，如加载动画等。

**示例**：
```javascript
export default {
  beforeCreate() {
    console.log('beforeCreate 钩子执行')
    console.log('data:', this.message) // undefined
    console.log('methods:', this.sayHello) // undefined
  }
}
```

### 2.2 created

**执行时机**：Vue 实例创建完成后立即调用。在这一步，实例已完成以下配置：数据观测 (data observer)，属性和方法的运算，watch/event 事件回调。然而，挂载阶段还未开始，$el 属性目前不可见。

**使用场景**：
- 发送异步请求获取数据
- 初始化非响应式数据
- 监听事件

**示例**：
```javascript
export default {
  data() {
    return {
      message: 'Hello Vue'
    }
  },
  created() {
    console.log('created 钩子执行')
    console.log('data:', this.message) // Hello Vue
    console.log('methods:', this.sayHello) // 函数定义
    
    // 发送异步请求
    this.fetchData()
  },
  methods: {
    sayHello() {
      return 'Hello'
    },
    fetchData() {
      // 模拟异步请求
      setTimeout(() => {
        this.message = 'Data loaded'
      }, 1000)
    }
  }
}
```

### 2.3 beforeMount

**执行时机**：在挂载开始之前被调用：相关的 render 函数首次被调用。

**使用场景**：可以在此时访问 DOM 元素，但还未渲染。

**示例**：
```javascript
export default {
  beforeMount() {
    console.log('beforeMount 钩子执行')
    console.log('$el:', this.$el) // undefined 或虚拟 DOM
  }
}
```

### 2.4 mounted

**执行时机**：el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用。

**使用场景**：
- 访问和操作 DOM 元素
- 初始化第三方库
- 启动定时器

**示例**：
```javascript
export default {
  mounted() {
    console.log('mounted 钩子执行')
    console.log('$el:', this.$el) // 真实 DOM 元素
    
    // 初始化第三方库
    this.initChart()
    
    // 启动定时器
    this.timer = setInterval(() => {
      console.log('Timer tick')
    }, 1000)
  },
  methods: {
    initChart() {
      // 初始化图表库
      console.log('Chart initialized')
    }
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.timer)
  }
}
```

### 2.5 beforeUpdate

**执行时机**：数据更新时调用，发生在虚拟 DOM 重新渲染和打补丁之前。

**使用场景**：可以在此时访问更新前的 DOM 状态。

**示例**：
```javascript
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  beforeUpdate() {
    console.log('beforeUpdate 钩子执行')
    console.log('DOM before update:', this.$el.textContent) // Hello
  }
}
```

### 2.6 updated

**执行时机**：由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。

**使用场景**：
- 操作更新后的 DOM
- 执行依赖于 DOM 的操作

**示例**：
```javascript
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  updated() {
    console.log('updated 钩子执行')
    console.log('DOM after update:', this.$el.textContent) // 新内容
    
    // 操作更新后的 DOM
    this.resizeHandler()
  },
  methods: {
    resizeHandler() {
      console.log('DOM resized')
    }
  }
}
```

### 2.7 beforeDestroy

**执行时机**：实例销毁之前调用。在这一步，实例仍然完全可用。

**使用场景**：
- 清除定时器
- 解绑事件监听器
- 取消网络请求
- 清理第三方库实例

**示例**：
```javascript
export default {
  mounted() {
    // 绑定事件监听器
    window.addEventListener('resize', this.resizeHandler)
    
    // 启动定时器
    this.timer = setInterval(() => {
      console.log('Timer tick')
    }, 1000)
  },
  beforeDestroy() {
    console.log('beforeDestroy 钩子执行')
    
    // 清除定时器
    clearInterval(this.timer)
    
    // 解绑事件监听器
    window.removeEventListener('resize', this.resizeHandler)
    
    // 取消网络请求
    if (this.axiosCancelToken) {
      this.axiosCancelToken.cancel('Component destroyed')
    }
  },
  methods: {
    resizeHandler() {
      console.log('Window resized')
    }
  }
}
```

### 2.8 destroyed

**执行时机**：Vue 实例销毁后调用。调用后，Vue 实例指示的所有东西都会解绑定，所有的事件监听器会被移除，所有的子实例也会被销毁。

**使用场景**：可以做一些最终的清理工作，但一般很少使用。

**示例**：
```javascript
export default {
  destroyed() {
    console.log('destroyed 钩子执行')
    console.log('实例已销毁')
  }
}
```

## 3. 生命周期流程图

```
┌─────────────────────────────────────────────────────────┐
│                      Vue 实例创建                        │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     beforeCreate                        │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     created                              │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     beforeMount                         │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     mounted                              │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     beforeUpdate                         │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     updated                              │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     beforeDestroy                        │
└─────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────┐
│                     destroyed                            │
└─────────────────────────────────────────────────────────┘
```

## 4. 生命周期钩子的使用原则

1. **数据初始化**：在 `created` 钩子中进行数据初始化和异步请求
2. **DOM 操作**：在 `mounted` 钩子中进行 DOM 操作
3. **资源清理**：在 `beforeDestroy` 钩子中进行资源清理
4. **避免在生命周期钩子中使用箭头函数**：箭头函数会绑定父级作用域的上下文，导致 `this` 指向错误
5. **不要在 `updated` 钩子中修改数据**：这可能导致无限循环

## 5. 常见使用场景

### 5.1 异步数据加载

```javascript
export default {
  data() {
    return {
      userList: []
    }
  },
  created() {
    // 发送异步请求获取用户列表
    this.$axios.get('/api/users')
      .then(response => {
        this.userList = response.data
      })
      .catch(error => {
        console.error('Failed to fetch users:', error)
      })
  }
}
```

### 5.2 第三方库初始化

```javascript
export default {
  mounted() {
    // 初始化 jQuery 插件
    $(this.$el).find('.datepicker').datepicker()
    
    // 初始化图表库
    this.chart = new Chart(this.$el.querySelector('#myChart'), {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{ data: [12, 19, 3] }]
      }
    })
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
```

### 5.3 监听窗口大小变化

```javascript
export default {
  data() {
    return {
      windowWidth: window.innerWidth
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    }
  }
}
```

## 6. 总结

Vue2 的生命周期钩子提供了在不同阶段执行自定义逻辑的能力，是 Vue 开发中的重要知识点。理解和掌握生命周期钩子的执行时机和使用场景，有助于我们更好地控制 Vue 实例的行为，提高应用的性能和可维护性。

在实际开发中，我们应该根据具体需求选择合适的生命周期钩子，并遵循最佳实践，避免常见的错误用法。