# Spring Boot 异常处理

发布于：2025-11-27

## 异常处理概述

在Web应用中，异常处理是非常重要的一部分。当应用程序发生异常时，我们需要向用户返回友好的错误信息，而不是默认的错误页面或堆栈跟踪。Spring Boot 提供了多种异常处理方式，可以根据实际需求选择合适的方式。

## 1. 默认异常处理

Spring Boot 默认提供了一个 BasicErrorController 来处理异常，当应用程序发生异常时，它会返回一个 JSON 格式的错误信息或一个错误页面，具体取决于请求的 Accept 头。

### 默认错误信息格式

当请求的 Accept 头包含 `application/json` 时，返回 JSON 格式的错误信息：

```json
{
  "timestamp": "2025-11-27T15:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "",
  "path": "/not-found"
}
```

当请求的 Accept 头包含 `text/html` 时，返回一个默认的错误页面。

## 2. 自定义错误页面

我们可以通过创建自定义错误页面来替换默认的错误页面。Spring Boot 会按照以下规则查找错误页面：

- `src/main/resources/templates/error/404.html`：处理 404 错误
- `src/main/resources/templates/error/500.html`：处理 500 错误
- `src/main/resources/templates/error/error.html`：处理所有错误

### 示例：自定义 404 错误页面

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>页面未找到</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>
    <div class="container mt-5">
        <div class="jumbotron">
            <h1 class="display-4">404 - 页面未找到</h1>
            <p class="lead">抱歉，您访问的页面不存在。</p>
            <hr class="my-4">
            <p>请检查您的网址是否正确，或返回首页。</p>
            <a class="btn btn-primary btn-lg" href="/" role="button">返回首页</a>
        </div>
    </div>
</body>
</html>
```

## 3. 自定义错误信息

我们可以通过实现 ErrorAttributes 接口来自定义错误信息：

```java
@Component
public class CustomErrorAttributes implements ErrorAttributes {

    @Override
    public Map<String, Object> getErrorAttributes(WebRequest webRequest, ErrorAttributeOptions options) {
        Map<String, Object> errorAttributes = new LinkedHashMap<>();
        errorAttributes.put("timestamp", new Date());
        errorAttributes.put("status", getStatus(webRequest));
        errorAttributes.put("error", "Custom Error");
        errorAttributes.put("message", "This is a custom error message");
        errorAttributes.put("path", webRequest.getDescription(false).substring(4));
        return errorAttributes;
    }

    private int getStatus(WebRequest webRequest) {
        Integer status = (Integer) webRequest.getAttribute("javax.servlet.error.status_code", RequestAttributes.SCOPE_REQUEST);
        return status != null ? status : 500;
    }

    @Override
    public Throwable getError(WebRequest webRequest) {
        return (Throwable) webRequest.getAttribute("javax.servlet.error.exception", RequestAttributes.SCOPE_REQUEST);
    }
}
```

## 4. 使用 @ControllerAdvice 和 @ExceptionHandler

@ControllerAdvice 是一个全局异常处理注解，它可以处理所有控制器抛出的异常。@ExceptionHandler 注解用于处理特定类型的异常。

### 示例：全局异常处理

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    // 处理所有异常
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                ex.getMessage(),
                request.getDescription(false).substring(4)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 处理特定类型的异常
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                "Resource Not Found",
                ex.getMessage(),
                request.getDescription(false).substring(4)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    // 处理参数验证异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        StringBuilder errors = new StringBuilder();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String errorMessage = error.getDefaultMessage();
            errors.append(errorMessage).append(", ");
        });

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation Error",
                errors.toString().substring(0, errors.length() - 2),
                request.getDescription(false).substring(4)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
```

### ErrorResponse 类

```java
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    // 构造函数、getter 和 setter
    // ...
}
```

### ResourceNotFoundException 类

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

## 5. 使用 @ResponseStatus 注解

@ResponseStatus 注解可以用于指定异常对应的 HTTP 状态码：

```java
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Resource not found")
public class ResourceNotFoundException extends RuntimeException {
    // ...
}
```

当抛出 ResourceNotFoundException 异常时，Spring Boot 会返回 404 状态码和指定的原因。

## 6. 自定义 ErrorController

我们可以通过实现 ErrorController 接口来完全自定义错误处理逻辑：

```java
@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<ErrorResponse> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        String path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI).toString();

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status != null ? Integer.parseInt(status.toString()) : 500,
                "Error",
                message != null ? message.toString() : "An unexpected error occurred",
                path
        );

        return new ResponseEntity<>(errorResponse, HttpStatus.valueOf(errorResponse.getStatus()));
    }

    @Override
    public String getErrorPath() {
        return "/error";
    }
}
```

## 7. 异常处理的优先级

Spring Boot 异常处理的优先级从高到低依次为：
1. 自定义 ErrorController
2. @ControllerAdvice + @ExceptionHandler
3. @ResponseStatus 注解的异常
4. 自定义错误页面
5. 默认异常处理

## 总结

Spring Boot 提供了多种异常处理方式，可以根据实际需求选择合适的方式。在实际项目中，推荐使用 @ControllerAdvice + @ExceptionHandler 的方式来处理异常，因为它可以统一处理所有控制器抛出的异常，并且可以返回自定义的错误信息格式。

合理的异常处理可以提高应用程序的用户体验，同时也方便开发人员排查问题。