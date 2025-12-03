# 🏔️ 山高路远，码海行舟


```python
在代码的海洋里，我以键盘为桨，以屏幕为帆，探索着技术的星辰大海。

拥有多年企业级系统开发经验，专注于构建高效、可靠的技术解决方案，
在分布式架构、性能优化、数据库设计等领域深耕不辍。
```
---


<style scoped>
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

/* 背景效果 */
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121e;
  --accent-primary: #667eea;
  --accent-secondary: #764ba2;
  --text-primary: #ffffff;
  --text-secondary: #c0c0c0;
  --text-muted: #888888;
  --border-color: rgba(255, 255, 255, 0.1);
}

body {
  background: var(--bg-primary);
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.05) 0%, transparent 50%);
  background-attachment: fixed;
}

/* 标题样式优化 */
h1 {
  font-size: 3.2rem;
  font-weight: 800;
  text-align: center;
  margin: 40px 0 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  letter-spacing: -0.5px;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from {
    text-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  }
  to {
    text-shadow: 0 8px 40px rgba(102, 126, 234, 0.6), 0 0 20px rgba(118, 75, 162, 0.3);
  }
}

h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 32px 0 20px;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 12px;
  text-align: center;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
}

/* 段落样式 */
p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0 0 24px;
  text-align: center;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 300;
}

/* 分隔线样式 */
hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
  margin: 40px 0;
  position: relative;
}

hr::before {
  content: '✨';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-primary);
  padding: 0 20px;
  color: var(--accent-primary);
  font-size: 1.2rem;
}

/* 技术栈样式 */
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 32px 0;
  justify-content: center;
}

.tech-item {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  padding: 20px 24px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 150px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

.tech-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.tech-item:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 16px 40px rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.4);
}

.tech-item:hover::before {
  left: 100%;
}

.tech-badge {
  font-weight: bold;
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 1;
  position: relative;
}

.tech-desc {
  font-size: 14px;
  color: var(--text-muted);
  z-index: 1;
  position: relative;
  text-align: center;
  line-height: 1.4;
}

/* 专栏卡片样式 */
.column-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin: 32px 0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.column-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.column-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), #f093fb);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.column-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.4);
}

.column-card:hover::before {
  transform: scaleX(1);
}

.column-card h4 {
  margin: 0 0 20px;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-card ul {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.column-card li {
  margin: 0 0 12px;
  color: var(--text-secondary);
  position: relative;
  padding-left: 28px;
  line-height: 1.6;
  font-size: 1rem;
  font-weight: 300;
}

.column-card li::before {
  content: '▶';
  position: absolute;
  left: 8px;
  color: var(--accent-primary);
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.column-card li:hover::before {
  transform: translateX(4px);
  color: var(--accent-secondary);
}

/* 统计数据样式 */
.stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin: 40px 0;
  flex-wrap: wrap;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.stat-item {
  text-align: center;
  position: relative;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
}

.stat-item:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 16px 48px rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.4);
}

.stat-number {
  display: block;
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px;
  line-height: 1;
  animation: countUp 2s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-label {
  display: block;
  font-size: 16px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 引用样式 */
blockquote {
  margin: 32px 0;
  padding: 24px 32px;
  background: rgba(102, 126, 234, 0.08);
  border-left: 4px solid var(--accent-primary);
  border-radius: 0 12px 12px 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.8;
  font-style: italic;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

blockquote::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 12px;
  font-size: 4rem;
  color: var(--accent-primary);
  opacity: 0.2;
  font-family: serif;
}

/* 按钮链接样式 */
.card-link {
  display: inline-block;
  margin: 16px 0 0;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.4s ease;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  padding: 12px 24px;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.card-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.45);
  letter-spacing: 1px;
}

.card-link:hover::before {
  left: 100%;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .column-cards {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 0 20px;
  }
  
  .stats {
    gap: 40px;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.4rem;
    margin: 30px 0 16px;
  }
  
  h2 {
    font-size: 1.6rem;
  }
  
  p {
    font-size: 1rem;
    padding: 0 20px;
  }
  
  .tech-stack {
    gap: 16px;
    padding: 0 20px;
  }
  
  .tech-item {
    min-width: 130px;
    padding: 16px 20px;
  }
  
  .tech-badge {
    font-size: 16px;
  }
  
  .column-cards {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 20px;
  }
  
  .column-card {
    padding: 24px;
  }
  
  .stats {
    gap: 30px;
    padding: 0 20px;
  }
  
  .stat-item {
    min-width: 120px;
    padding: 20px;
  }
  
  .stat-number {
    font-size: 36px;
  }
  
  .stat-label {
    font-size: 14px;
  }
  
  blockquote {
    padding: 20px 24px;
    margin: 24px 20px;
  }
  
  .card-link {
    padding: 10px 20px;
    font-size: 0.9rem;
    margin: 8px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.4rem;
  }
  
  .tech-stack {
    flex-direction: column;
    align-items: center;
  }
  
  .tech-item {
    width: 100%;
    max-width: 280px;
  }
  
  .stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-item {
    width: 100%;
    max-width: 260px;
  }
  
  .column-card {
    padding: 20px;
  }
}
</style>