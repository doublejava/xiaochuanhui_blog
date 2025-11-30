# Vue2 组件通信

## 1. 组件通信概述

在 Vue2 中，组件是构建应用的基本单位。组件之间的通信是 Vue 开发中的核心知识点之一。Vue2 提供了多种组件通信方式，适用于不同的场景。

## 2. 组件通信方式

### 2.1 父组件向子组件传递数据（Props）

**Props** 是父组件向子组件传递数据的主要方式。

**父组件**：
```vue
<template>
  <div>
    <h2>父组件</h2>
    <child-component :message="parentMessage" :user="userInfo"></child-component>
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      parentMessage: 'Hello from Parent',
      userInfo: {
        name: '张三',
        age: 25
      }
    }
  }
}
</script>
```

**子组件**：
```vue
<template>
  <div>
    <h3>子组件</h3>
    <p>{{ message }}</p>
    <p>用户：{{ user.name }}，年龄：{{ user.age }}</p>
  </div>
</template>

<script>
export default {
  // 声明接收的 props
  props: {
    message: {
      type: String,
      default: ''
    },
    user: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
```

### 2.2 子组件向父组件传递数据（$emit 事件）

**子组件**：
```vue
<template>
  <div>
    <h3>子组件</h3>
    <button @click="sendMessage">向父组件发送消息</button>
    <input type="text" v-model="inputValue" @keyup.enter="sendInputValue">
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputValue: ''
    }
  },
  methods: {
    sendMessage() {
      // 使用 $emit 触发自定义事件
      this.$emit('child-event', 'Message from Child')
    },
    sendInputValue() {
      this.$emit('input-change', this.inputValue)
      this.inputValue = ''
    }
  }
}
</script>
```

**父组件**：
```vue
<template>
  <div>
    <h2>父组件</h2>
    <p>子组件消息：{{ childMessage }}</p>
    <p>输入值：{{ inputValue }}</p>
    <child-component 
      @child-event="handleChildEvent" 
      @input-change="handleInputChange"
    ></child-component>
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      childMessage: '',
      inputValue: ''
    }
  },
  methods: {
    handleChildEvent(message) {
      this.childMessage = message
    },
    handleInputChange(value) {
      this.inputValue = value
    }
  }
}
</script>
```

### 2.3 兄弟组件通信（Event Bus）

**创建事件总线**：
```javascript
// eventBus.js
import Vue from 'vue'
export default new Vue()
```

**组件 A**：
```vue
<template>
  <div>
    <h3>组件 A</h3>
    <button @click="sendMessage">向组件 B 发送消息</button>
  </div>
</template>

<script>
import eventBus from './eventBus'

export default {
  methods: {
    sendMessage() {
      eventBus.$emit('brother-event', 'Message from Component A')
    }
  }
}
</script>
```

**组件 B**：
```vue
<template>
  <div>
    <h3>组件 B</h3>
    <p>组件 A 消息：{{ message }}</p>
  </div>
</template>

<script>
import eventBus from './eventBus'

export default {
  data() {
    return {
      message: ''
    }
  },
  mounted() {
    // 监听事件
    this.eventBusListener = eventBus.$on('brother-event', (message) => {
      this.message = message
    })
  },
  beforeDestroy() {
    // 移除事件监听，防止内存泄漏
    eventBus.$off('brother-event', this.eventBusListener)
  }
}
</script>
```

### 2.4 父组件访问子组件（$refs）

**父组件**：
```vue
<template>
  <div>
    <h2>父组件</h2>
    <child-component ref="childRef"></child-component>
    <button @click="accessChildMethod">调用子组件方法</button>
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  methods: {
    accessChildMethod() {
      // 访问子组件的方法
      this.$refs.childRef.childMethod()
      // 访问子组件的数据
      console.log(this.$refs.childRef.childData)
    }
  }
}
</script>
```

**子组件**：
```vue
<template>
  <div>
    <h3>子组件</h3>
    <p>{{ childData }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      childData: 'Child Data'
    }
  },
  methods: {
    childMethod() {
      alert('子组件方法被调用')
    }
  }
}
</script>
```

### 2.5 子组件访问父组件（$parent）

**子组件**：
```vue
<template>
  <div>
    <h3>子组件</h3>
    <button @click="accessParentData">访问父组件数据</button>
  </div>
</template>

<script>
export default {
  methods: {
    accessParentData() {
      // 访问父组件的数据
      console.log(this.$parent.parentData)
      // 调用父组件的方法
      this.$parent.parentMethod()
    }
  }
}
</script>
```

### 2.6 跨级组件通信（provide/inject）

**祖先组件**：
```vue
<template>
  <div>
    <h2>祖先组件</h2>
    <parent-component></parent-component>
  </div>
</template>

<script>
import ParentComponent from './ParentComponent.vue'

export default {
  components: {
    ParentComponent
  },
  // 提供数据
  provide() {
    return {
      ancestorMessage: 'Hello from Ancestor',
      ancestorMethod: this.ancestorMethod
    }
  },
  methods: {
    ancestorMethod() {
      console.log('Ancestor method called')
    }
  }
}
</script>
```

**孙组件**：
```vue
<template>
  <div>
    <h4>孙组件</h4>
    <p>{{ ancestorMessage }}</p>
    <button @click="callAncestorMethod">调用祖先组件方法</button>
  </div>
</template>

<script>
export default {
  // 注入数据
  inject: ['ancestorMessage', 'ancestorMethod'],
  methods: {
    callAncestorMethod() {
      this.ancestorMethod()
    }
  }
}
</script>
```

## 3. 组件通信方式比较

| 通信方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| Props | 父向子传递数据 | 简单、直观 | 只能单向传递 |
| $emit 事件 | 子向父传递数据 | 灵活、解耦 | 需要手动触发事件 |
| Event Bus | 兄弟组件或跨级组件 | 简单、灵活 | 事件管理复杂，容易内存泄漏 |
| $refs | 父访问子组件 | 直接、方便 | 破坏组件封装性 |
| $parent | 子访问父组件 | 直接、方便 | 破坏组件封装性，耦合度高 |
| provide/inject | 跨级组件 | 简化跨级通信 | 不适用于频繁变化的数据 |
| Vuex | 复杂应用状态管理 | 集中管理、可预测 | 增加项目复杂度 |

## 4. 最佳实践

1. **优先使用 Props 和 $emit**：这是 Vue 推荐的父子组件通信方式，符合单向数据流原则
2. **复杂状态使用 Vuex**：对于需要在多个组件间共享的复杂状态，使用 Vuex 进行集中管理
3. **Event Bus 谨慎使用**：使用 Event Bus 时，务必在组件销毁前移除事件监听，防止内存泄漏
4. **避免过度使用 $refs 和 $parent**：这会破坏组件的封装性，增加组件间的耦合度
5. **provide/inject 用于固定数据**：适用于提供不频繁变化的全局配置或服务

## 5. 总结

Vue2 提供了多种组件通信方式，每种方式都有其适用场景。在实际开发中，我们需要根据具体情况选择合适的通信方式，遵循单向数据流原则，保持组件的独立性和可维护性。

掌握组件通信是 Vue 开发的基础，合理使用各种通信方式可以构建出结构清晰、易于维护的 Vue 应用。