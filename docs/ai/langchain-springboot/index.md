# LangChain SpringBoot集成

将LangChain与SpringBoot框架集成，构建企业级AI应用，实现从原型到生产的快速迭代，充分利用SpringBoot的成熟生态和LangChain的强大AI能力。

## 1. LangChain核心概念

在集成LangChain之前，需要了解其核心概念，这些概念是构建AI应用的基础。

### 1.1 Chain

Chain是LangChain的核心概念，代表一系列有序的操作，将输入传递给大模型，然后处理输出。

- **LLMChain**：最基本的Chain，将Prompt和LLM组合
- **SequentialChain**：按顺序执行多个Chain
- **RouterChain**：根据输入选择合适的Chain

### 1.2 Prompt

Prompt是传递给大模型的指令，指导模型生成期望的输出。

- **PromptTemplate**：模板化的Prompt，支持变量替换
- **FewShotPromptTemplate**：包含示例的Prompt，提高模型表现
- **ChatPromptTemplate**：用于聊天模型的Prompt

### 1.3 Agent

Agent是具有决策能力的AI实体，可以根据环境和任务选择合适的工具。

- **ZeroShotAgent**：基于零样本学习的Agent
- **ReActAgent**：思考-行动-观察循环的Agent
- **SelfAskWithSearchAgent**：自问自答的Agent

### 1.4 Memory

Memory用于保存对话历史，支持多轮对话。

- **ConversationBufferMemory**：保存完整对话历史
- **ConversationSummaryMemory**：保存对话摘要
- **ConversationBufferWindowMemory**：保存最近N轮对话

### 1.5 Tool

Tool是Agent可以使用的外部工具，扩展Agent的能力。

- **SerpAPI**：搜索引擎工具
- **Calculator**：计算器工具
- **CustomTool**：自定义工具

## 2. SpringBoot集成方案

### 2.1 依赖管理

在`pom.xml`中添加LangChain和相关依赖：

```xml
<dependencies>
    <!-- SpringBoot核心依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- LangChain依赖 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
        <version>0.27.0</version>
    </dependency>
    
    <!-- Ollama集成 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-ollama</artifactId>
        <version>0.27.0</version>
    </dependency>
    
    <!-- OpenAI集成（可选） -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai</artifactId>
        <version>0.27.0</version>
    </dependency>
    
    <!-- 向量数据库集成（可选） -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-chroma</artifactId>
        <version>0.27.0</version>
    </dependency>
    
    <!-- 异步支持 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
    
    <!-- 配置处理器 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-configuration-processor</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 2.2 配置文件

在`application.yml`中添加LangChain配置：

```yaml
spring:
  application:
    name: langchain-springboot-demo

# LangChain配置
langchain4j:
  ollama:
    base-url: http://localhost:11434
    model-name: llama3
    temperature: 0.7
    timeout: 30s
    max-retries: 3
  
# 自定义配置
ai:
  prompt:
    system: "You are a helpful assistant that speaks Chinese."
  
# 日志配置
logging:
  level:
    dev.langchain4j: debug
```

### 2.3 配置类

创建配置类，管理LangChain相关的Bean：

```java
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.model.ollama.OllamaChatModelBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChainConfig {
    
    @Value("${langchain4j.ollama.base-url}")
    private String ollamaBaseUrl;
    
    @Value("${langchain4j.ollama.model-name}")
    private String modelName;
    
    @Value("${langchain4j.ollama.temperature}")
    private Double temperature;
    
    @Value("${langchain4j.ollama.timeout}")
    private Duration timeout;
    
    @Bean
    public OllamaChatModel ollamaChatModel() {
        return OllamaChatModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName(modelName)
                .temperature(temperature)
                .timeout(timeout)
                .build();
    }
    
    @Bean
    public ChatMemory chatMemory() {
        return ConversationBufferMemory.builder()
                .maxMessages(20)
                .build();
    }
    
    @Bean
    public ChatLanguageModel chatLanguageModel(OllamaChatModel ollamaChatModel) {
        return ollamaChatModel;
    }
}
```

## 3. REST API设计

### 3.1 控制器设计

创建REST API控制器，提供AI服务接口：

```java
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    private final ChatLanguageModel chatLanguageModel;
    private final ChatMemory chatMemory;
    private final AiService aiService;
    
    public AiController(ChatLanguageModel chatLanguageModel, ChatMemory chatMemory) {
        this.chatLanguageModel = chatLanguageModel;
        this.chatMemory = chatMemory;
        this.aiService = AiServices.builder(AiService.class)
                .chatLanguageModel(chatLanguageModel)
                .chatMemory(chatMemory)
                .build();
    }
    
    /**
     * 单轮对话
     */
    @PostMapping("/chat/single")
    public String singleChat(@RequestBody ChatRequest request) {
        return aiService.chat(request.getMessage());
    }
    
    /**
     * 多轮对话
     */
    @PostMapping("/chat/multi")
    public String multiChat(@RequestBody ChatRequest request) {
        return aiService.chatWithMemory(request.getMessage());
    }
    
    /**
     * 清空对话历史
     */
    @DeleteMapping("/chat/memory")
    public void clearMemory() {
        chatMemory.clear();
    }
    
    /**
     * 生成文本
     */
    @PostMapping("/generate")
    public String generateText(@RequestBody GenerateRequest request) {
        return aiService.generate(request.getPrompt(), request.getMaxTokens());
    }
}
```

### 3.2 请求和响应模型

```java
public class ChatRequest {
    private String message;
    // getter and setter
}

public class GenerateRequest {
    private String prompt;
    private Integer maxTokens;
    // getter and setter
}

public class ChatResponse {
    private String response;
    private LocalDateTime timestamp;
    // getter and setter
}
```

### 3.3 AI服务接口

```java
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.AiService;

@AiService
public interface AiService {
    
    @SystemMessage("${ai.prompt.system}")
    String chat(@UserMessage String message);
    
    @SystemMessage("${ai.prompt.system}")
    String chatWithMemory(@UserMessage String message);
    
    @SystemMessage("${ai.prompt.system}")
    String generate(@UserMessage String prompt, int maxTokens);
}
```

## 4. 异步处理

对于长时间运行的AI任务，使用异步处理可以提高系统吞吐量。

### 4.1 异步控制器

```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.DeferredResult;

@RestController
@RequestMapping("/api/ai/async")
public class AsyncAiController {
    
    private final AiService aiService;
    
    public AsyncAiController(AiService aiService) {
        this.aiService = aiService;
    }
    
    /**
     * 异步聊天
     */
    @PostMapping("/chat")
    public DeferredResult<String> asyncChat(@RequestBody ChatRequest request) {
        DeferredResult<String> deferredResult = new DeferredResult<>();
        
        CompletableFuture.supplyAsync(() -> aiService.chat(request.getMessage()))
                .thenAccept(deferredResult::setResult)
                .exceptionally(ex -> {
                    deferredResult.setErrorResult(ex.getMessage());
                    return null;
                });
        
        return deferredResult;
    }
    
    /**
     * 异步生成文本
     */
    @PostMapping("/generate")
    public CompletableFuture<String> asyncGenerate(@RequestBody GenerateRequest request) {
        return CompletableFuture.supplyAsync(() -> 
                aiService.generate(request.getPrompt(), request.getMaxTokens())
        );
    }
}
```

### 4.2 启用异步支持

在SpringBoot主类中启用异步支持：

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LangChainSpringBootApplication {
    public static void main(String[] args) {
        SpringApplication.run(LangChainSpringBootApplication.class, args);
    }
}
```

## 5. 示例应用

### 5.1 单轮对话示例

```bash
# 请求
curl -X POST http://localhost:8080/api/ai/chat/single \
  -H "Content-Type: application/json" \
  -d '{"message": "请解释什么是大语言模型？"}'

# 响应
"大语言模型（Large Language Model，LLM）是一种基于深度学习的人工智能模型，通过训练海量文本数据，能够理解和生成人类语言..."
```

### 5.2 多轮对话示例

```bash
# 第一轮请求
curl -X POST http://localhost:8080/api/ai/chat/multi \
  -H "Content-Type: application/json" \
  -d '{"message": "我想学习Java，有什么建议？"}'

# 第一轮响应
"学习Java的建议包括：1. 掌握基础语法；2. 学习面向对象编程；3. 熟悉常用框架..."

# 第二轮请求
curl -X POST http://localhost:8080/api/ai/chat/multi \
  -H "Content-Type: application/json" \
  -d '{"message": "具体怎么学习Spring Boot？"}'

# 第二轮响应
"学习Spring Boot的步骤：1. 了解Spring Boot的核心概念；2. 搭建开发环境；3. 学习自动配置..."
```

### 5.3 文本生成示例

```bash
# 请求
curl -X POST http://localhost:8080/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "写一篇关于AI未来发展的短文", "maxTokens": 500}'

# 响应
"AI未来发展将呈现以下趋势：1. 更强大的模型能力；2. 更好的多模态支持；3. 更广泛的行业应用..."
```

## 6. 最佳实践

### 6.1 错误处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                e.getMessage(),
                "INTERNAL_SERVER_ERROR"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<ErrorResponse> handleTimeoutException(TimeoutException e) {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                "AI请求超时，请稍后重试",
                "REQUEST_TIMEOUT"
        );
        return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT).body(error);
    }
}
```

### 6.2 日志记录

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    private static final Logger logger = LoggerFactory.getLogger(AiController.class);
    
    @PostMapping("/chat/single")
    public String singleChat(@RequestBody ChatRequest request) {
        logger.info("收到单轮对话请求: {}", request.getMessage());
        try {
            String response = aiService.chat(request.getMessage());
            logger.info("生成响应: {}", response);
            return response;
        } catch (Exception e) {
            logger.error("单轮对话失败: {}", e.getMessage(), e);
            throw e;
        }
    }
}
```

### 6.3 性能监控

使用Spring Boot Actuator监控AI服务性能：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    tags:
      application: ${spring.application.name}
```

### 6.4 缓存策略

对于频繁请求的相同内容，使用缓存提高性能：

```java
@Cacheable(value = "aiResponses", key = "#request.message", unless = "#result == null")
@PostMapping("/chat/single")
public String singleChat(@RequestBody ChatRequest request) {
    return aiService.chat(request.getMessage());
}
```

## 7. 常见问题与解决方案

### 7.1 依赖冲突

- **问题**：不同版本的LangChain依赖冲突
- **解决方案**：使用dependencyManagement统一管理依赖版本

### 7.2 超时问题

- **问题**：AI请求超时
- **解决方案**：调整timeout配置，使用异步处理，实现重试机制

### 7.3 内存泄漏

- **问题**：对话历史占用过多内存
- **解决方案**：使用ConversationBufferWindowMemory，限制对话历史长度

### 7.4 性能瓶颈

- **问题**：并发请求处理能力不足
- **解决方案**：使用异步处理，增加线程池大小，使用缓存

### 7.5 模型响应质量

- **问题**：模型响应质量不佳
- **解决方案**：优化Prompt，调整temperature参数，使用更好的模型

## 8. 总结

LangChain与SpringBoot的集成，为构建企业级AI应用提供了强大的支持。通过合理的设计和最佳实践，可以构建高性能、高可用的AI服务。

集成的核心优势包括：

1. **快速开发**：利用SpringBoot的成熟生态和LangChain的简化API
2. **企业级支持**：SpringBoot提供的安全、监控、部署等功能
3. **灵活扩展**：支持多种模型和工具集成
4. **良好的可维护性**：基于SpringBoot的模块化设计
5. **高性能**：支持异步处理和并发请求

随着AI技术的不断发展，LangChain与SpringBoot的集成将在更多领域得到应用，为企业数字化转型提供强大的AI能力支持。