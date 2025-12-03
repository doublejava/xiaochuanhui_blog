import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  title: '我的博客',
  description: '这是一个使用 VitePress 搭建的博客',
  // 引入自定义样式
  css: ['/style.css'],
  // Netlify 基础路径
  base: '/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Java', link: '/java/' },
      { text: '前端', link: '/frontend/' },
      { text: 'Linux', link: '/linux/' },
      { text: 'Nginx', link: '/nginx/' },
      { text: '数据库', link: '/数据库/' },
      { text: '动态库', link: '/动态库/' },
      { text: '项目管理', link: '/项目管理/' },
      { text: 'AI系统', link: '/ai/' },
      { text: '信创国产化', link: '/信创国产化/' },
      { text: '博客部署', link: '/博客部署/' },
      { text: '关于', link: '/about/' }
    ],
    sidebar: {
      '/java/': [
        {
          text: 'Java',
          items: [
            { text: 'Java 首页', link: '/java/' }
          ]
        },
        {
          text: 'Spring Boot',
          items: [
            { text: 'Spring Boot 首页', link: '/java/springboot/' },
            { text: '文件上传和下载', link: '/java/springboot/file-upload-download/' },
            { text: '自动配置原理', link: '/java/springboot/auto-configuration/' },
            { text: '配置文件详解', link: '/java/springboot/configuration-files/' },
            { text: '日志配置', link: '/java/springboot/logging/' },
            { text: '异常处理', link: '/java/springboot/exception-handling/' },
            { text: '拦截器使用', link: '/java/springboot/interceptors/' },
            { text: '过滤器使用', link: '/java/springboot/filters/' },
            { text: 'AOP应用', link: '/java/springboot/aop/' },
            { text: '事务管理', link: '/java/springboot/transaction-management/' },
            { text: '数据校验', link: '/java/springboot/validation/' },
            { text: '缓存使用', link: '/java/springboot/caching/' }
          ]
        },
        {
          text: 'MyBatis-Plus',
          items: [
            { text: 'MyBatis-Plus 首页', link: '/java/mybatis-plus/' },
            { text: '工作中常见问题记录', link: '/java/mybatis-plus/common-issues/' }
          ]
        },
        {
          text: 'Spring Cloud',
          items: [
            { text: 'Spring Cloud 首页', link: '/java/springcloud/' },
            { text: 'Eureka 服务注册与发现', link: '/java/springcloud/eureka/' },
            { text: 'Consul 服务网格', link: '/java/springcloud/consul/' },
            { text: 'Nacos 服务发现与配置', link: '/java/springcloud/nacos/' },
            { text: 'Spring Cloud Config 配置中心', link: '/java/springcloud/spring-cloud-config/' },
            { text: 'Ribbon 客户端负载均衡', link: '/java/springcloud/ribbon/' },
            { text: 'OpenFeign 声明式服务调用', link: '/java/springcloud/openfeign/' },
            { text: 'Hystrix 服务熔断与降级', link: '/java/springcloud/hystrix/' },
            { text: 'Sentinel 流量控制与熔断', link: '/java/springcloud/sentinel/' },
            { text: 'Spring Cloud Gateway API网关', link: '/java/springcloud/spring-cloud-gateway/' },
            { text: 'Spring Cloud Bus 消息总线', link: '/java/springcloud/spring-cloud-bus/' },
            { text: 'Spring Cloud Sleuth 分布式链路追踪', link: '/java/springcloud/spring-cloud-sleuth/' },
            { text: 'Spring Cloud Stream 消息驱动', link: '/java/springcloud/spring-cloud-stream/' },
            { text: 'Spring Cloud Security 安全认证', link: '/java/springcloud/spring-cloud-security/' },
            { text: 'Consul Config 配置管理', link: '/java/springcloud/consul-config/' },
            { text: 'Spring Cloud Kubernetes 云原生集成', link: '/java/springcloud/spring-cloud-kubernetes/' },
            { text: '生产环境常见问题及解决方案', link: '/java/springcloud/production-issues/' }
          ]
        },
        {
          text: 'JFinal',
          items: [
            { text: 'JFinal 首页', link: '/java/jfinal/' },
            { text: 'MVC 架构', link: '/java/jfinal/mvc/' },
            { text: 'ActiveRecord ORM', link: '/java/jfinal/activerecord/' },
            { text: 'AOP 编程', link: '/java/jfinal/aop/' },
            { text: '拦截器使用', link: '/java/jfinal/interceptor/' },
            { text: '数据验证器', link: '/java/jfinal/validator/' },
            { text: '模板引擎', link: '/java/jfinal/template-engine/' },
            { text: '缓存机制', link: '/java/jfinal/cache/' },
            { text: '事务管理', link: '/java/jfinal/transaction/' },
            { text: '框架配置', link: '/java/jfinal/config/' },
            { text: '插件开发', link: '/java/jfinal/plugin/' },
            { text: '部署方式', link: '/java/jfinal/deploy/' }
          ]
        }
      ],
      '/frontend/': [
        {
          text: '前端',
          items: [
            { text: '前端首页', link: '/frontend/' }
          ]
        },
        {
          text: 'Vue2',
          items: [
            { text: '组件通信', link: '/frontend/vue2/component-communication/' },
            { text: '生命周期钩子', link: '/frontend/vue2/lifecycle-hooks/' },
            { text: '路由配置', link: '/frontend/vue2/router-config/' },
            { text: 'Vuex 状态管理', link: '/frontend/vue2/vuex-state-management/' },
            { text: '表单处理', link: '/frontend/vue2/form-handling/' },
            { text: '计算属性', link: '/frontend/vue2/computed-properties/' },
            { text: '监听器', link: '/frontend/vue2/watchers/' },
            { text: '自定义指令', link: '/frontend/vue2/directives/' },
            { text: '过滤器', link: '/frontend/vue2/filters/' },
            { text: '过渡与动画', link: '/frontend/vue2/transition-animations/' }
          ]
        },
        {
          text: 'Vue3',
          items: [
            { text: '组合式 API', link: '/frontend/vue3/composition-api/' },
            { text: 'Setup 函数', link: '/frontend/vue3/setup-function/' },
            { text: '响应式系统', link: '/frontend/vue3/reactive-ref/' },
            { text: 'Vue Router 4', link: '/frontend/vue3/vue-router-4/' },
            { text: 'Pinia 状态管理', link: '/frontend/vue3/pinia-state-management/' },
            { text: '计算属性与 Ref', link: '/frontend/vue3/computed-ref/' },
            { text: '响应式监听器', link: '/frontend/vue3/watch-effect/' },
            { text: '依赖注入', link: '/frontend/vue3/provide-inject/' },
            { text: '传送门', link: '/frontend/vue3/teleport/' },
            { text: '异步组件与 Suspense', link: '/frontend/vue3/suspense/' }
          ]
        }
      ],
      '/信创国产化/': [
        {
          text: '信创国产化',
          items: [
            { text: '国家信创政策文件简要及访问链接', link: '/信创国产化/国家信创政策文件简要及访问链接/' },
            { text: '国产化操作系统选型指南', link: '/信创国产化/国产化操作系统选型指南/' },
            { text: '国产化数据库迁移实践', link: '/信创国产化/国产化数据库迁移实践/' },
            { text: '国产化中间件部署与调优', link: '/信创国产化/国产化中间件部署与调优/' },
            { text: '国产化CPU架构适配', link: '/信创国产化/国产化CPU架构适配/' },
            { text: '国产化安全解决方案', link: '/信创国产化/国产化安全解决方案/' },
            { text: '国产化开发工具链推荐', link: '/信创国产化/国产化开发工具链推荐/' },
            { text: '国产化软件测试策略', link: '/信创国产化/国产化软件测试策略/' },
            { text: '国产化项目实施经验分享', link: '/信创国产化/国产化项目实施经验分享/' },
            { text: '国产化生态发展趋势分析', link: '/信创国产化/国产化生态发展趋势分析/' }
          ]
        }
      ],
      '/linux/': [
        {
          text: 'Linux',
          items: [
            { text: 'Linux 首页', link: '/linux/' },
            { text: 'cat 命令', link: '/linux/cat/' },
            { text: 'cd 命令', link: '/linux/cd/' },
            { text: 'chmod 命令', link: '/linux/chmod/' },
            { text: 'chown 命令', link: '/linux/chown/' },
            { text: 'cp 命令', link: '/linux/cp/' },
            { text: 'df 命令', link: '/linux/df/' },
            { text: 'du 命令', link: '/linux/du/' },
            { text: 'find 命令', link: '/linux/find/' },
            { text: 'grep 命令', link: '/linux/grep/' },
            { text: 'head 命令', link: '/linux/head/' },
            { text: 'kill 命令', link: '/linux/kill/' },
            { text: 'less 命令', link: '/linux/less/' },
            { text: 'ls 命令', link: '/linux/ls/' },
            { text: 'mkdir 命令', link: '/linux/mkdir/' },
            { text: 'mv 命令', link: '/linux/mv/' },
            { text: 'ps 命令', link: '/linux/ps/' },
            { text: 'pwd 命令', link: '/linux/pwd/' },
            { text: 'rm 命令', link: '/linux/rm/' },
            { text: 'tail 命令', link: '/linux/tail/' },
            { text: 'top 命令', link: '/linux/top/' },
            { text: '根据端口号查找并杀死进程', link: '/linux/port-process-kill/' }
          ]
        }
      ],
      '/ai/': [
        {
          text: 'AI系统',
          items: [
            { text: 'AI系统首页', link: '/ai/' },
            { text: '本地大模型部署', link: '/ai/local-llm/' },
            { text: 'LangChain SpringBoot集成', link: '/ai/langchain-springboot/' },
            { text: '知识库调用', link: '/ai/knowledge-base/' },
            { text: '聊天对话系统', link: '/ai/chat/' },
            { text: '提示词工程', link: '/ai/prompt/' }
          ]
        }
      ],
      '/nginx/': [
        {
          text: 'Nginx',
          items: [
            { text: 'Nginx 首页', link: '/nginx/' }
          ]
        }
      ],
      '/数据库/': [
        {
          text: '数据库',
          items: [
            { text: '数据库首页', link: '/数据库/' },
            { text: 'MySQL 高级配置与调优', link: '/数据库/mysql/' },
            { text: 'Oracle 高级配置与调优', link: '/数据库/oracle/' },
            { text: '金仓数据库 高级配置与调优', link: '/数据库/金仓/' }
          ]
        }
      ],
      '/动态库/': [
        {
          text: '动态库',
          items: [
            { text: '动态库首页', link: '/动态库/' },
            { text: 'DLL 动态库', link: '/动态库/dll/' },
            { text: 'SO 动态库', link: '/动态库/so/' },
            { text: 'Java NIO 动态库', link: '/动态库/java/' }
          ]
        }
      ],
      '/项目管理/': [
        {
          text: '项目管理',
          items: [
            { text: '项目管理首页', link: '/项目管理/' },
            { text: '项目管理的核心原则与实践', link: '/项目管理/core-principles/' },
            { text: '敏捷项目管理的高级技巧', link: '/项目管理/agile-advanced/' },
            { text: '项目风险管理的系统化方法', link: '/项目管理/risk-management/' },
            { text: '项目沟通管理的最佳实践', link: '/项目管理/communication-management/' },
            { text: '项目绩效评估与持续改进', link: '/项目管理/performance-improvement/' }
          ]
        }
      ]
    }
  }
})
