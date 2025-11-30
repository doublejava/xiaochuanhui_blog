# Spring Boot 文件上传和下载功能实现

发布于：2025-11-27

## 简介

在现代Web应用中，文件上传和下载是常见的功能需求。Spring Boot提供了简洁易用的API来实现这些功能。本文将详细介绍如何使用Spring Boot实现文件上传和下载功能。

## 项目准备

### 依赖配置

首先，我们需要创建一个Spring Boot项目，并添加必要的依赖。在`pom.xml`文件中添加以下依赖：

```xml
<dependencies>
    <!-- Spring Boot Web Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Thymeleaf模板引擎（用于前端页面） -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
    
    <!-- Spring Boot DevTools（用于开发热部署） -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>
    
    <!-- Spring Boot Test Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 配置文件设置

在`application.properties`文件中添加以下配置：

```ini
# 应用端口
server.port=8080

# 文件上传配置
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# 文件存储路径
file.upload-dir=./uploads

# Thymeleaf配置
spring.thymeleaf.cache=false
```

## 文件上传功能实现

### 控制器实现

创建一个控制器类，实现文件上传功能：

```java
package com.example.fileupload.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Controller
public class FileUploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/")
    public String index() {
        return "upload";
    }

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file, RedirectAttributes redirectAttributes) {
        if (file.isEmpty()) {
            redirectAttributes.addFlashAttribute("message", "请选择一个文件上传");
            return "redirect:/";
        }

        try {
            // 确保上传目录存在
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 生成唯一文件名
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            // 保存文件
            Files.copy(file.getInputStream(), filePath);

            redirectAttributes.addFlashAttribute("message", 
                    "文件上传成功: " + file.getOriginalFilename());
            redirectAttributes.addFlashAttribute("fileName", fileName);

        } catch (IOException e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("message", 
                    "文件上传失败: " + e.getMessage());
        }

        return "redirect:/";
    }
}
```

### 前端页面

创建一个Thymeleaf模板文件`src/main/resources/templates/upload.html`：

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>文件上传</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
    <div class="container mt-5">
        <h2>Spring Boot 文件上传</h2>
        
        <!-- 显示消息 -->
        <div th:if="${message}" class="alert alert-info mt-3">
            <p th:text="${message}"></p>
        </div>
        
        <!-- 上传表单 -->
        <form method="post" enctype="multipart/form-data" action="/upload" class="mt-4">
            <div class="form-group">
                <label for="file">选择文件</label>
                <input type="file" class="form-control-file" id="file" name="file" required>
            </div>
            <button type="submit" class="btn btn-primary">上传</button>
        </form>
        
        <!-- 显示下载链接 -->
        <div th:if="${fileName}" class="mt-4">
            <h3>下载链接</h3>
            <a th:href="@{/download/{fileName}(fileName=${fileName})}" 
               th:text="${fileName}" class="btn btn-success"></a>
        </div>
    </div>
</body>
</html>
```

## 文件下载功能实现

### 控制器实现

在控制器中添加文件下载功能：

```java
package com.example.fileupload.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
public class FileDownloadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            // 构建文件路径
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 设置响应头
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=" + resource.getFilename());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

## 测试和运行

### 运行项目

使用以下命令运行Spring Boot项目：

```bash
mvn spring-boot:run
```

或者直接运行主类：

```java
package com.example.fileupload;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FileUploadApplication {
    public static void main(String[] args) {
        SpringApplication.run(FileUploadApplication.class, args);
    }
}
```

### 访问应用

在浏览器中访问 `http://localhost:8080`，您将看到文件上传页面。选择一个文件并点击"上传"按钮，文件将被上传到服务器的`./uploads`目录中。上传成功后，页面将显示下载链接，您可以点击该链接下载文件。

## 高级功能扩展

### 多文件上传

修改控制器，支持多文件上传：

```java
@PostMapping("/upload-multiple")
public String uploadMultipleFiles(@RequestParam("files") MultipartFile[] files, 
                                 RedirectAttributes redirectAttributes) {
    if (files.length == 0) {
        redirectAttributes.addFlashAttribute("message", "请选择至少一个文件上传");
        return "redirect:/";
    }

    int uploadedCount = 0;
    for (MultipartFile file : files) {
        if (!file.isEmpty()) {
            try {
                // 确保上传目录存在
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // 生成唯一文件名
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(fileName);

                // 保存文件
                Files.copy(file.getInputStream(), filePath);
                uploadedCount++;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    redirectAttributes.addFlashAttribute("message", 
            "成功上传 " + uploadedCount + " 个文件");
    return "redirect:/";
}
```

### 文件列表展示

添加一个方法来展示上传的文件列表：

```java
@GetMapping("/files")
public String listFiles(Model model) {
    try {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 获取文件列表
        List<String> fileNames = Files.list(uploadPath)
                .map(Path::getFileName)
                .map(Path::toString)
                .collect(Collectors.toList());

        model.addAttribute("files", fileNames);
    } catch (IOException e) {
        e.printStackTrace();
        model.addAttribute("message", "获取文件列表失败: " + e.getMessage());
    }

    return "files";
}
```

## 总结

本文详细介绍了如何使用Spring Boot实现文件上传和下载功能，包括：

1. 项目依赖配置
2. 配置文件设置
3. 单文件上传实现
4. 文件下载实现
5. 前端页面设计
6. 高级功能扩展（多文件上传、文件列表展示）

Spring Boot提供了简洁易用的API，使得文件上传和下载功能的实现变得非常简单。您可以根据实际需求，进一步扩展和优化这些功能，例如添加文件类型验证、文件大小限制、文件预览等功能。

希望本文对您有所帮助！