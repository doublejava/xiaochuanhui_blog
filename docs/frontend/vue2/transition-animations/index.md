# Vue2 过渡与动画 (Transition Animations)

## 什么是过渡与动画

Vue2 提供了内置的过渡系统，可以在元素插入、更新或移除 DOM 时应用过渡效果。这使得在 Vue 应用中实现流畅的动画效果变得简单。

## 过渡系统的工作原理

当元素被包裹在 `<transition>` 组件中时，Vue 会自动：

1. 检测元素是否应用了 CSS 过渡或动画
2. 在适当的时机添加/移除 CSS 类名
3. 如果没有检测到 CSS 过渡/动画，会使用 JavaScript 钩子函数来执行过渡效果

## 基本用法

### 单元素/组件过渡

```html
<template>
  <div id="app">
    <button @click="show = !show">切换显示</button>
    <transition name="fade">
      <p v-if="show">这是一个过渡效果示例</p>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true
    }
  }
}
</script>

<style>
/* 淡入淡出过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## 过渡类名

Vue 过渡系统会在不同阶段添加不同的类名：

| 类名 | 描述 |
|------|------|
| `v-enter` | 进入过渡的开始状态，在元素被插入之前生效，插入之后移除 |
| `v-enter-active` | 进入过渡的生效状态，在整个进入过渡过程中应用 |
| `v-enter-to` | 进入过渡的结束状态，在元素插入之后下一帧生效，过渡完成后移除 |
| `v-leave` | 离开过渡的开始状态，在离开过渡被触发时生效，下一帧移除 |
| `v-leave-active` | 离开过渡的生效状态，在整个离开过渡过程中应用 |
| `v-leave-to` | 离开过渡的结束状态，在离开过渡被触发后下一帧生效，过渡完成后移除 |

## CSS 过渡

### 基本过渡

```css
/* 定义过渡效果 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
```

### 自定义过渡时间

```css
/* 进入和离开使用不同的过渡时间和曲线 */
.custom-enter-active {
  transition: all 0.5s ease-in;
}
.custom-leave-active {
  transition: all 0.3s ease-out;
}
.custom-enter,
.custom-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
```

## CSS 动画

CSS 动画与 CSS 过渡类似，但在类名应用上有一些差异：

```html
<transition name="bounce">
  <p v-if="show">这是一个动画效果示例</p>
</transition>
```

```css
/* 定义动画 */
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
```

## 自定义过渡类名

可以使用自定义类名来覆盖默认的类名，方便使用第三方 CSS 动画库：

```html
<transition
  name="custom"
  enter-active-class="animated tada"
  leave-active-class="animated bounceOutRight"
>
  <p v-if="show">使用 Animate.css 的过渡效果</p>
</transition>
```

## 列表过渡

使用 `<transition-group>` 组件可以实现列表的过渡效果：

```html
<template>
  <div id="app">
    <button @click="addItem">添加项目</button>
    <button @click="removeItem">移除项目</button>
    <transition-group name="list" tag="ul">
      <li v-for="item in items" :key="item.id">{{ item.text }}</li>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, text: '项目 1' },
        { id: 2, text: '项目 2' },
        { id: 3, text: '项目 3' }
      ],
      nextId: 4
    }
  },
  methods: {
    addItem() {
      this.items.push({ id: this.nextId++, text: `项目 ${this.nextId - 1}` })
    },
    removeItem() {
      this.items.shift()
    }
  }
}
</script>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 列表排序过渡 */
.list-move {
  transition: transform 0.5s ease;
}
</style>
```

## JavaScript 钩子函数

除了 CSS 过渡/动画，还可以使用 JavaScript 钩子函数来实现更复杂的过渡效果：

```html
<transition
  @before-enter="beforeEnter"
  @enter="enter"
  @after-enter="afterEnter"
  @enter-cancelled="enterCancelled"
  @before-leave="beforeLeave"
  @leave="leave"
  @after-leave="afterLeave"
  @leave-cancelled="leaveCancelled"
>
  <p v-if="show">使用 JavaScript 钩子的过渡效果</p>
</transition>
```

```javascript
export default {
  data() {
    return {
      show: true
    }
  },
  methods: {
    // 进入钩子
    beforeEnter(el) {
      el.style.opacity = 0
      el.style.transform = 'translateY(30px)'
    },
    enter(el, done) {
      // 使用 Velocity.js 实现动画
      Velocity(el, {
        opacity: 1,
        translateY: 0
      }, {
        duration: 500,
        complete: done
      })
    },
    afterEnter(el) {
      // 动画完成后的回调
      console.log('进入动画完成')
    },
    enterCancelled(el) {
      // 进入动画被取消时的回调
    },
    
    // 离开钩子
    beforeLeave(el) {
      el.style.opacity = 1
    },
    leave(el, done) {
      Velocity(el, {
        opacity: 0,
        translateY: -30px
      }, {
        duration: 500,
        complete: done
      })
    },
    afterLeave(el) {
      console.log('离开动画完成')
    },
    leaveCancelled(el) {
      // 离开动画被取消时的回调
    }
  }
}
```

## 过渡模式

对于进入和离开同时发生的过渡，可以使用过渡模式来控制它们的执行顺序：

| 模式 | 描述 |
|------|------|
| `in-out` | 新元素先进入，旧元素再离开 |
| `out-in` | 旧元素先离开，新元素再进入 |

```html
<transition name="fade" mode="out-in">
  <component :is="currentComponent"></component>
</transition>
```

## 动态过渡

可以通过动态绑定 `name` 属性来实现动态过渡：

```html
<transition :name="transitionName">
  <p v-if="show">动态过渡效果</p>
</transition>
```

```javascript
export default {
  data() {
    return {
      show: true,
      transitionName: 'fade'
    }
  },
  methods: {
    changeTransition() {
      this.transitionName = this.transitionName === 'fade' ? 'slide' : 'fade'
    }
  }
}
```

## 实际应用场景

1. **页面切换动画**：在路由切换时应用过渡效果
2. **模态框动画**：模态框的弹出和关闭动画
3. **下拉菜单动画**：下拉菜单的展开和收起动画
4. **列表项动画**：列表项的添加、移除和排序动画
5. **表单验证动画**：表单验证错误信息的显示和隐藏动画
6. **数据加载动画**：数据加载过程中的过渡效果

## 性能优化

1. **使用 CSS 过渡/动画**：CSS 动画由浏览器 GPU 加速，性能更好
2. **避免过度使用动画**：过多的动画会影响性能和用户体验
3. **使用 `will-change` 属性**：提前告知浏览器元素将要发生变化，优化渲染
4. **合理设置过渡时间**：过渡时间不宜过长或过短，建议在 0.2-0.5 秒之间
5. **使用 `appear` 属性**：只在初始渲染时应用过渡效果

## 示例：路由过渡

```html
<!-- App.vue -->
<template>
  <div id="app">
    <transition name="route" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<style>
.route-enter-active,
.route-leave-active {
  transition: all 0.3s ease;
}
.route-enter,
.route-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
```

## 总结

Vue2 的过渡系统提供了强大的动画支持，无论是简单的淡入淡出效果，还是复杂的列表排序动画，都可以轻松实现。通过合理使用 CSS 过渡/动画和 JavaScript 钩子函数，可以创建出流畅、美观的用户体验。

在实际开发中，建议优先使用 CSS 过渡/动画，因为它们性能更好，并且更容易维护。对于复杂的动画效果，可以考虑使用第三方动画库，如 Animate.css、Velocity.js 等。