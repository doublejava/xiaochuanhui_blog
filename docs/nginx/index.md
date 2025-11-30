# Nginx 高级配置与常用问题解决方案

Nginx 是一款高性能的 HTTP 和反向代理服务器，在现代 Web 架构中扮演着重要角色。本文将深入探讨 Nginx 的高级配置技巧、性能优化策略以及生产环境中常见问题的解决方案。

## 1. Nginx 架构与核心模块

### 1.1 模块化架构

Nginx 采用模块化设计，核心模块负责基本功能，第三方模块提供扩展能力。

```nginx
# 核心模块示例
load_module modules/ngx_http_ssl_module.so;
load_module modules/ngx_http_gzip_static_module.so;
load_module modules/ngx_http_v2_module.so;
```

### 1.2 进程模型

Nginx 使用多进程模型，包括：
- **Master 进程**：管理 Worker 进程，处理信号
- **Worker 进程**：处理客户端请求
- **Cache Manager 进程**：管理缓存
- **Cache Loader 进程**：加载缓存

```nginx
# 进程配置示例
worker_processes auto;  # 自动设置为 CPU 核心数
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;
```

## 2. 高级 HTTP 配置

### 2.1 虚拟主机配置

```nginx
# 基于域名的虚拟主机
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html;
}

# 基于 IP 的虚拟主机
server {
    listen 192.168.1.100:80;
    server_name example.com;
    root /var/www/example.com;
}

# 基于端口的虚拟主机
server {
    listen 8080;
    server_name example.com;
    root /var/www/example.com;
}
```

### 2.2 高级反向代理配置

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://backend_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 高级代理配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffer_size 16k;
        proxy_buffers 4 64k;
        proxy_busy_buffers_size 128k;
        proxy_temp_file_write_size 128k;
        
        # 启用代理缓存
        proxy_cache my_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
    }
}
```

## 3. 性能优化配置

### 3.1 核心性能参数

```nginx
# 事件模块配置
events {
    worker_connections 10240;  # 每个 Worker 进程的最大连接数
    use epoll;  # 使用高效的 epoll 事件驱动
    multi_accept on;  # 允许同时接受多个连接
}

# HTTP 核心优化
http {
    # 隐藏 Nginx 版本号
    server_tokens off;
    
    # 启用 sendfile
    sendfile on;
    
    # 启用 TCP_NOPUSH
    tcp_nopush on;
    
    # 启用 TCP_NODELAY
    tcp_nodelay on;
    
    # 连接超时设置
    keepalive_timeout 65;
    keepalive_requests 100;
    
    # 客户端请求头缓冲区
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # 客户端请求体缓冲区
    client_body_buffer_size 8k;
    client_max_body_size 10m;
}
```

### 3.2 Gzip 压缩优化

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_buffers 16 8k;
gzip_http_version 1.1;
```

### 3.3 缓存优化

```nginx
# 定义缓存路径
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;

# 响应缓存配置
server {
    location / {
        proxy_cache my_cache;
        proxy_cache_key $scheme$proxy_host$request_uri;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_bypass $http_pragma $http_authorization;
        proxy_no_cache $http_pragma $http_authorization;
    }
}
```

## 4. 负载均衡配置

### 4.1 基本负载均衡

```nginx
# 定义上游服务器组
upstream backend {
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
    server 192.168.1.103:8080;
}

server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://backend;
    }
}
```

### 4.2 高级负载均衡算法

```nginx
# 轮询算法（默认）
upstream backend {
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# 权重算法
upstream backend {
    server 192.168.1.101:8080 weight=3;
    server 192.168.1.102:8080 weight=1;
}

# IP Hash 算法
upstream backend {
    ip_hash;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# Least Connections 算法
upstream backend {
    least_conn;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# 健康检查
upstream backend {
    server 192.168.1.101:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.102:8080 max_fails=3 fail_timeout=30s;
}
```

## 5. SSL/TLS 高级配置

### 5.1 基本 SSL 配置

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # SSL 协议与密码套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
    # HSTS 配置
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}
```

### 5.2 证书自动化管理

结合 Let's Encrypt 和 Certbot 实现证书自动签发和续期：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 自动签发证书
sudo certbot --nginx -d example.com -d www.example.com

# 测试自动续期
sudo certbot renew --dry-run
```

## 6. 日志管理与分析

### 6.1 高级日志配置

```nginx
# 自定义日志格式
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for" '
                '$request_time $upstream_response_time $pipe';

# 访问日志配置
access_log /var/log/nginx/access.log main buffer=32k flush=1m;

# 错误日志配置
error_log /var/log/nginx/error.log warn;

# 禁用特定路径的日志
location /health {
    access_log off;
    return 200 "OK";
}
```

### 6.2 日志切割与归档

使用 logrotate 进行日志管理：

```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

## 7. 常用模块配置

### 7.1 限流模块（ngx_http_limit_req_module）

```nginx
# 定义限流区域
limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

server {
    location / {
        # 限流配置
        limit_req zone=mylimit burst=20 nodelay;
        
        # 限流后返回的状态码
        limit_req_status 429;
    }
}
```

### 7.2 访问控制模块

```nginx
# 基于 IP 的访问控制
location /admin {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
}

# 基于 HTTP 基本认证
location /private {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

### 7.3 重写模块（ngx_http_rewrite_module）

```nginx
# URL 重写示例
rewrite ^/old-path/(.*)$ /new-path/$1 permanent;

# 条件重写
if ($request_uri ~* \.(gif|jpg|png)$) {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# 反向代理重写
location /api {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://backend;
}
```

## 8. 监控与告警

### 8.1 Nginx 状态监控

```nginx
# 启用状态模块
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    allow 192.168.1.0/24;
    deny all;
}
```

状态页面输出示例：
```
Active connections: 291 
server accepts handled requests
 16630948 16630948 31070465 
Reading: 6 Writing: 179 Waiting: 106 
```

### 8.2 集成 Prometheus 和 Grafana

使用 nginx-prometheus-exporter 导出指标：

```bash
# 安装 exporter
docker run -d -p 9113:9113 nginx/nginx-prometheus-exporter:latest -nginx.scrape-uri=http://nginx:8080/nginx_status
```

Prometheus 配置：
```yaml
scrape_configs:
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']
```

## 9. 常见问题及解决方案

### 9.1 502 Bad Gateway

**原因**：
- 上游服务器不可用
- 连接超时
- 配置错误

**解决方案**：

```nginx
# 增加超时时间
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# 配置重试机制
proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
proxy_next_upstream_tries 3;
proxy_next_upstream_timeout 10s;
```

### 9.2 504 Gateway Timeout

**原因**：
- 上游服务器处理时间过长
- 网络延迟
- 连接数过多

**解决方案**：

```nginx
# 调整超时设置
proxy_read_timeout 120s;
fastcgi_read_timeout 120s;

# 优化上游服务器性能
# 增加 worker 进程数
worker_processes auto;

# 调整连接数
worker_connections 10240;
```

### 9.3 413 Request Entity Too Large

**原因**：客户端请求体超过 Nginx 配置的最大值

**解决方案**：

```nginx
# 调整客户端请求体大小
client_max_body_size 50m;
```

### 9.4 SSL 握手失败

**原因**：
- 证书过期或无效
- SSL 协议版本不兼容
- 密码套件不匹配

**解决方案**：

```nginx
# 启用 TLS 1.2 和 1.3
ssl_protocols TLSv1.2 TLSv1.3;

# 使用安全的密码套件
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;

# 验证证书链
ssl_verify_depth 2;
```

### 9.5 缓存失效问题

**原因**：
- 缓存配置不当
- 上游服务器返回的 Cache-Control 头
- 动态内容未正确缓存

**解决方案**：

```nginx
# 强制缓存某些动态内容
location /api/data {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    proxy_ignore_headers Cache-Control Expires Set-Cookie;
    proxy_hide_header Set-Cookie;
    proxy_pass http://backend;
}
```

## 10. 性能调优最佳实践

### 10.1 系统级优化

```bash
# 调整内核参数（/etc/sysctl.conf）
net.core.somaxconn = 65535
net.ipv4.tcp_max_tw_buckets = 10000
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 0
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.ip_local_port_range = 10000 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_syncookies = 1

# 应用内核参数
sysctl -p
```

### 10.2 Nginx 配置优化

```nginx
# 启用零拷贝
sendfile on;

# 启用 TCP 优化
tcp_nopush on;
tcp_nodelay on;

# 调整缓冲区大小
client_body_buffer_size 16k;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;

# 启用压缩
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# 优化 Worker 进程
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;
```

## 11. 部署与自动化

### 11.1 Docker 部署

```docker
# Dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
```

Docker Compose 配置：

```yaml
version: '3'
services:
  nginx:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./logs:/var/log/nginx
    restart: always
```

### 11.2 配置管理与自动化

使用 Ansible 管理 Nginx 配置：

```yaml
# nginx.yml
- name: Configure Nginx
  hosts: webservers
  become: yes
  tasks:
    - name: Install Nginx
      apt: name=nginx state=present
    
    - name: Copy Nginx configuration
      template: src=nginx.conf.j2 dest=/etc/nginx/nginx.conf
      notify: Restart Nginx
    
    - name: Ensure Nginx is running
      service: name=nginx state=started enabled=yes
  
  handlers:
    - name: Restart Nginx
      service: name=nginx state=restarted
```

## 12. 前端 CSS/JS 丢失解决方案

在使用 Nginx 部署前端应用时，经常会遇到 CSS 和 JavaScript 文件无法加载的问题。本节将详细分析常见原因及解决方案。

### 12.1 常见原因分析

| 原因 | 现象 | 解决方案 |
|------|------|----------|
| 路径配置错误 | 404 Not Found | 检查 root 和 alias 配置 |
| 静态资源缓存问题 | 资源无法更新 | 配置正确的缓存策略 |
| MIME 类型配置错误 | 资源被浏览器错误解析 | 检查 mime.types 配置 |
| 权限问题 | 403 Forbidden | 检查文件和目录权限 |
| 跨域配置问题 | 资源被浏览器跨域策略阻止 | 配置正确的 CORS 头 |
| 压缩配置问题 | 压缩后的资源无法正确解析 | 检查 gzip 配置 |

### 12.2 路径配置解决方案

#### 12.2.1 root 与 alias 区别

```nginx
# root 配置示例
location /static/ {
    root /var/www/html;
    # 访问 /static/css/style.css 会查找 /var/www/html/static/css/style.css
}

# alias 配置示例
location /static/ {
    alias /var/www/html/;
    # 访问 /static/css/style.css 会查找 /var/www/html/css/style.css
}
```

#### 12.2.2 正确的前端静态资源配置

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;

    # 处理 Vue/React 单页应用的路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源配置
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 12.3 MIME 类型配置

```nginx
# 确保 mime.types 被正确加载
include /etc/nginx/mime.types;

# 手动添加缺失的 MIME 类型
default_type application/octet-stream;
types {
    text/css css;
    application/javascript js;
    application/json json;
    image/png png;
    image/jpeg jpg jpeg;
    image/svg+xml svg;
    font/woff woff;
    font/woff2 woff2;
    font/ttf ttf;
    font/eot eot;
}
```

### 12.4 跨域资源共享 (CORS) 配置

```nginx
# 全局 CORS 配置
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
add_header Access-Control-Expose-Headers "Content-Length,Content-Range";

# 处理 OPTIONS 请求
if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
    add_header Access-Control-Max-Age 1728000;
    add_header Content-Type "text/plain; charset=utf-8";
    add_header Content-Length 0;
    return 204;
}
```

### 12.5 压缩配置优化

```nginx
# 确保压缩配置正确
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml application/font-woff application/font-woff2 application/font-ttf application/font-eot;
gzip_buffers 16 8k;
gzip_http_version 1.1;
```

### 12.6 权限配置

```bash
# 设置正确的文件权限
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
sudo find /var/www/html -type f -exec chmod 644 {} \;
sudo find /var/www/html -type d -exec chmod 755 {} \;
```

### 12.7 调试技巧

```nginx
# 启用详细日志进行调试
location / {
    access_log /var/log/nginx/access_detailed.log main;
    error_log /var/log/nginx/error_detailed.log debug;
    try_files $uri $uri/ /index.html;
}
```

### 12.8 常见框架的 Nginx 配置

#### 12.8.1 Vue.js 应用配置

```nginx
server {
    listen 80;
    server_name vue.example.com;
    root /var/www/vue-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

#### 12.8.2 React 应用配置

```nginx
server {
    listen 80;
    server_name react.example.com;
    root /var/www/react-app/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

## 13. 总结

Nginx 是一款功能强大的服务器软件，掌握其高级配置和优化技巧对于构建高性能、高可用的 Web 架构至关重要。本文涵盖了 Nginx 的核心架构、高级配置、性能优化、负载均衡、SSL 配置、日志管理、监控告警以及常见问题解决方案，特别是针对前端 CSS/JS 丢失问题提供了详细的分析和解决方案。

在实际生产环境中，应根据具体业务需求和服务器资源情况，灵活调整 Nginx 配置，持续监控和优化性能，确保系统的稳定性和可靠性。