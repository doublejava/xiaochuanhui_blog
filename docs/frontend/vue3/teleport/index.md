# Vue3 传送门 (Teleport)

## 什么是传送门

传送门（Teleport）是 Vue3 中用于将组件的 DOM 结构渲染到指定位置的一种机制，它允许组件的逻辑和 DOM 结构分离。

## 基本用法

### 基本语法

```vue
<template>
  <div class="component">
    <h2>组件内容</h2>
    <!-- 将模态框内容传送到 body 标签下 -->
    <Teleport to="body">
      <div class="modal">
        <h3>模态框标题</h3>
        <p>模态框内容</p>
      </div>
    </Teleport>
  </div>
</template>
```

### 示例：简单的模态框

```vue
<template>
  <div class="app">
    <h1>Vue3 Teleport 示例</h1>
    <button @click="showModal = true">打开模态框</button>
    
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal" @click.stop>
          <h2>模态框</h2>
          <p>这是一个使用 Teleport 的模态框示例</p>
          <button @click="showModal = false">关闭模态框</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
</style>
```

## Teleport 的 to 属性

`to` 属性用于指定传送的目标位置，可以是以下值：

1. **CSS 选择器**：如 `body`、`#app`、`.modal-container`
2. **DOM 元素**：直接传递 DOM 元素对象
3. **字符串 ID**：如 `#modal-root`

```vue
<!-- 使用 CSS 类选择器 -->
<Teleport to=".modal-container">
  <!-- 内容 -->
</Teleport>

<!-- 使用 DOM 元素 -->
<Teleport :to="document.getElementById('modal-root')">
  <!-- 内容 -->
</Teleport>
```

## Teleport 的 disabled 属性

可以使用 `disabled` 属性来禁用 Teleport，此时内容会渲染在原始位置：

```vue
<template>
  <div class="app">
    <button @click="useTeleport = !useTeleport">
      {{ useTeleport ? '禁用 Teleport' : '启用 Teleport' }}
    </button>
    
    <Teleport to="body" :disabled="!useTeleport">
      <div class="teleported-content">
        <p>这段内容是否使用 Teleport: {{ useTeleport ? '是' : '否' }}</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const useTeleport = ref(true)
</script>
```

## Teleport 与组件

Teleport 可以包裹任意组件，包括自定义组件：

```vue
<template>
  <div class="app">
    <button @click="showNotification = true">显示通知</button>
    
    <Teleport to="body">
      <Notification 
        v-if="showNotification" 
        message="这是一条通知消息" 
        @close="showNotification = false" 
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Notification from './Notification.vue'

const showNotification = ref(false)
</script>
```

### Notification.vue 组件

```vue
<template>
  <div class="notification">
    <p>{{ message }}</p>
    <button @click="$emit('close')">关闭</button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  }
})

defineEmits(['close'])
</script>

<style>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}
</style>
```

## Teleport 的实际应用场景

1. **模态框**：将模态框渲染到 body 标签下，避免 z-index 问题和样式冲突
2. **通知消息**：将通知消息渲染到页面的固定位置
3. **对话框**：将对话框渲染到独立的容器中
4. **悬浮组件**：将悬浮组件（如悬浮按钮、悬浮菜单）渲染到指定位置
5. **全屏组件**：将全屏组件渲染到 body 标签下，确保覆盖整个屏幕
6. **第三方库集成**：将 Vue 组件渲染到第三方库创建的 DOM 节点中

## Teleport 与 CSS 作用域

Teleport 包裹的内容仍然受父组件的 CSS 作用域影响：

```vue
<template>
  <div class="app">
    <Teleport to="body">
      <div class="teleported-content">
        <p>这段内容受父组件 CSS 作用域影响</p>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* 这段样式会影响 Teleport 包裹的内容 */
.teleported-content {
  color: red;
  font-size: 18px;
}
</style>
```

如果需要避免父组件 CSS 作用域的影响，可以使用 `:global` 或外部样式：

```vue
<style scoped>
/* 使用 :global 避免作用域限制 */
:global(.teleported-content) {
  color: blue;
  font-size: 20px;
}
</style>
```

## Teleport 与 Vue Router

Teleport 可以与 Vue Router 结合使用，实现路由级别的组件传送：

```vue
<template>
  <div class="app">
    <router-view />
    
    <!-- 将路由组件的模态框传送到 body -->
    <Teleport to="body">
      <router-view name="modal" />
    </Teleport>
  </div>
</template>
```

在路由配置中：

```javascript
const routes = [
  {
    path: '/',
    component: HomeComponent
  },
  {
    path: '/modal',
    components: {
      default: HomeComponent,
      modal: ModalComponent
    }
  }
]
```

## Teleport 的注意事项

1. **目标元素必须存在**：确保 `to` 属性指定的元素在 Teleport 渲染时已经存在于 DOM 中
2. **CSS 作用域**：Teleport 包裹的内容仍然受父组件 CSS 作用域影响
3. **事件冒泡**：Teleport 包裹的内容产生的事件会正常冒泡到父组件
4. **多个 Teleport 到同一目标**：多个 Teleport 可以传送到同一目标，它们的内容会按顺序渲染
5. **SSR 支持**：Teleport 在服务器端渲染 (SSR) 中也能正常工作
6. **性能考虑**：Teleport 只是改变了 DOM 结构，不会影响组件的生命周期和性能

## 示例：多层级 Teleport

```vue
<template>
  <div class="app">
    <h1>多层级 Teleport 示例</h1>
    
    <!-- 第一层 Teleport -->
    <Teleport to="#level-1">
      <div class="level-1">
        <h2>第一层内容</h2>
        
        <!-- 第二层 Teleport -->
        <Teleport to="#level-2">
          <div class="level-2">
            <h3>第二层内容</h3>
            
            <!-- 第三层 Teleport -->
            <Teleport to="#level-3">
              <div class="level-3">
                <h4>第三层内容</h4>
              </div>
            </Teleport>
          </div>
        </Teleport>
      </div>
    </Teleport>
    
    <!-- 目标容器 -->
    <div id="level-1" class="target-container"></div>
    <div id="level-2" class="target-container"></div>
    <div id="level-3" class="target-container"></div>
  </div>
</template>

<style>
.target-container {
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.level-1 { background-color: #f0f0f0; }
.level-2 { background-color: #e0e0e0; }
.level-3 { background-color: #d0d0d0; }
</style>
```

## Teleport 与其他框架的比较

| 框架 | 类似功能 | 语法 |
|------|----------|------|
| React | Portal | `ReactDOM.createPortal(child, container)` |
| Angular | ng-container + ViewContainerRef | 复杂的编程式 API |
| Vue3 | Teleport | `<Teleport to="selector">...</Teleport>` |

## 总结

Teleport 是 Vue3 中用于将组件 DOM 结构渲染到指定位置的强大机制，它解决了模态框、通知等组件的 z-index 和样式冲突问题。

通过使用 Teleport，可以将组件的逻辑和 DOM 结构分离，提高组件的复用性和可维护性。Teleport 支持动态启用/禁用，并且可以与任意组件结合使用。

在实际开发中，Teleport 常用于实现模态框、通知、对话框等需要脱离父组件 DOM 结构的组件。合理使用 Teleport 可以使组件结构更加清晰，避免不必要的样式冲突和 z-index 问题。