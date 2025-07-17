#!/bin/bash

# iOS Safari 兼容性修复脚本
# 专门解决 iOS Safari 无法访问网站的问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

print_step() {
    echo -e "${PURPLE}[步骤]${NC} $1"
}

error_exit() {
    print_error "$1"
    exit 1
}

# 解析参数
DOMAIN_NAME=""
APP_NAME=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -a|--app)
            APP_NAME="$2"
            shift 2
            ;;
        -h|--help)
            echo "用法: $0 -d DOMAIN -a APP_NAME"
            echo "iOS Safari 兼容性修复脚本"
            echo ""
            echo "选项:"
            echo "  -d, --domain DOMAIN    域名 (例如: todo.ylingtech.com)"
            echo "  -a, --app APP_NAME     应用名称 (例如: todo-app)"
            echo "  -h, --help             显示帮助信息"
            exit 0
            ;;
        *)
            error_exit "未知选项: $1"
            ;;
    esac
done

# 交互式输入
if [ -z "$DOMAIN_NAME" ]; then
    read -p "请输入域名: " DOMAIN_NAME
fi

if [ -z "$APP_NAME" ]; then
    read -p "请输入应用名称: " APP_NAME
fi

if [ -z "$DOMAIN_NAME" ] || [ -z "$APP_NAME" ]; then
    error_exit "域名和应用名称不能为空"
fi

WEB_DIR="/var/www/$APP_NAME"
NGINX_CONFIG="/etc/nginx/conf.d/$APP_NAME.conf"

# 检测 Debian 系统的配置路径
if [ -d "/etc/nginx/sites-available" ]; then
    NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME.conf"
fi

print_step "🍎 iOS Safari 兼容性诊断和修复工具"
print_info "域名: $DOMAIN_NAME"
print_info "应用: $APP_NAME"
print_info "配置: $NGINX_CONFIG"
echo ""

# 1. SSL 证书诊断
print_step "1. SSL 证书诊断"

if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
    print_info "检查 SSL 证书..."
    
    # 证书有效期
    CERT_EXPIRY=$(sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem | cut -d= -f2)
    EXPIRY_DATE=$(date -d "$CERT_EXPIRY" +%s)
    CURRENT_DATE=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_DATE - CURRENT_DATE) / 86400 ))
    
    print_info "证书有效期: 剩余 $DAYS_LEFT 天"
    
    # 证书链验证
    if sudo openssl verify -CAfile /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem /etc/letsencrypt/live/$DOMAIN_NAME/cert.pem &>/dev/null; then
        print_success "✅ 证书链完整"
    else
        print_error "❌ 证书链不完整，iOS Safari 可能无法验证"
        print_info "尝试重新获取证书..."
        sudo certbot renew --force-renewal
    fi
    
    # 证书算法检查
    CERT_ALGORITHM=$(sudo openssl x509 -in /etc/letsencrypt/live/$DOMAIN_NAME/cert.pem -text -noout | grep "Signature Algorithm" | head -1)
    print_info "证书算法: $CERT_ALGORITHM"
    
    if [[ "$CERT_ALGORITHM" == *"sha256"* ]]; then
        print_success "✅ SHA-256 算法，iOS 兼容"
    else
        print_warning "⚠️ 证书算法可能不兼容 iOS"
    fi
else
    print_error "❌ 未找到 SSL 证书"
    print_info "请先运行主部署脚本获取 SSL 证书"
fi

# 2. Nginx 配置修复
print_step "2. Nginx 配置优化"

if [ -f "$NGINX_CONFIG" ]; then
    print_info "备份现有配置..."
    sudo cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    
    print_info "创建 iOS Safari 优化配置..."
    
    sudo tee "$NGINX_CONFIG" > /dev/null << EOF
# $APP_NAME Nginx 配置 - iOS Safari 优化版本
# 域名: $DOMAIN_NAME
# 修复时间: $(date)

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
    }
    
    # HTTP 重定向
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS 配置 - iOS Safari 专用优化
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    
    # iOS Safari 优化的 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    # 包含 iOS Safari 支持的所有加密套件
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets on;
    
    # OCSP Stapling - 提高 iOS Safari 连接速度
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;
    resolver 8.8.8.8 8.8.4.4 1.1.1.1 valid=300s;
    resolver_timeout 5s;
    
    # iOS Safari 兼容的安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    # 宽松的 CSP 策略，避免 iOS Safari 阻止内容
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:;" always;
    
    # 网站根目录
    root $WEB_DIR;
    index index.html;
    
    # 强制设置正确的字符编码
    charset utf-8;
    
    # iOS Safari 特定的 MIME 类型
    location ~* \.js$ {
        add_header Content-Type "application/javascript; charset=utf-8" always;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header Vary "Accept-Encoding" always;
        expires 1y;
        access_log off;
    }
    
    location ~* \.css$ {
        add_header Content-Type "text/css; charset=utf-8" always;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header Vary "Accept-Encoding" always;
        expires 1y;
        access_log off;
    }
    
    location ~* \.html$ {
        add_header Content-Type "text/html; charset=utf-8" always;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header Pragma "no-cache" always;
        add_header Expires "0" always;
    }
    
    # 字体文件 - iOS Safari 需要 CORS
    location ~* \.(woff|woff2|ttf|eot|otf)$ {
        add_header Access-Control-Allow-Origin "*" always;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        expires 1y;
        access_log off;
    }
    
    # SVG 文件特殊处理
    location ~* \.svg$ {
        add_header Content-Type "image/svg+xml; charset=utf-8" always;
        add_header Cache-Control "public, max-age=31536000" always;
        expires 1y;
        access_log off;
    }
    
    # 图片文件
    location ~* \.(ico|png|jpg|jpeg|gif|webp)$ {
        add_header Cache-Control "public, max-age=31536000" always;
        expires 1y;
        access_log off;
    }
    
    # JSON 文件
    location ~* \.json$ {
        add_header Content-Type "application/json; charset=utf-8" always;
        add_header Cache-Control "public, max-age=86400" always;
        expires 1d;
    }
    
    # Manifest 文件
    location ~* \.webmanifest$ {
        add_header Content-Type "application/manifest+json; charset=utf-8" always;
        add_header Cache-Control "public, max-age=86400" always;
    }
    
    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ @fallback;
    }
    
    location @fallback {
        add_header Content-Type "text/html; charset=utf-8" always;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        try_files /index.html =404;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type "text/plain; charset=utf-8";
    }
    
    # iOS 测试页面
    location /ios-test {
        try_files /ios-test.html =404;
    }
    
    # Gzip 压缩 - iOS Safari 优化
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        application/atom+xml
        image/svg+xml
        font/woff
        font/woff2
        application/manifest+json;
    
    # 安全配置
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~* \.(htaccess|htpasswd|ini|log|sh|inc|bak)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 日志配置
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;
}
EOF
    
    print_success "✅ Nginx 配置已更新"
else
    print_error "❌ 未找到 Nginx 配置文件: $NGINX_CONFIG"
fi

# 3. MIME 类型优化
print_step "3. MIME 类型优化"

print_info "检查 /etc/nginx/mime.types..."
if [ -f "/etc/nginx/mime.types" ]; then
    # 备份原始文件
    if [ ! -f "/etc/nginx/mime.types.backup" ]; then
        sudo cp /etc/nginx/mime.types /etc/nginx/mime.types.backup
    fi
    
    # 添加 iOS Safari 需要的 MIME 类型
    print_info "添加 iOS Safari 兼容的 MIME 类型..."
    
    # 检查并添加缺失的 MIME 类型
    if ! grep -q "font/woff2" /etc/nginx/mime.types; then
        sudo sed -i '/font\/woff/a\    font/woff2                        woff2;' /etc/nginx/mime.types
    fi
    
    if ! grep -q "application/manifest+json" /etc/nginx/mime.types; then
        sudo sed -i '/application\/json/a\    application/manifest+json         webmanifest;' /etc/nginx/mime.types
    fi
    
    print_success "✅ MIME 类型已优化"
fi

# 4. 测试 Nginx 配置
print_step "4. 测试 Nginx 配置"

print_info "测试 Nginx 配置语法..."
if sudo nginx -t; then
    print_success "✅ Nginx 配置语法正确"
    
    print_info "重新加载 Nginx..."
    sudo systemctl reload nginx
    
    if sudo systemctl is-active nginx &> /dev/null; then
        print_success "✅ Nginx 服务运行正常"
    else
        print_error "❌ Nginx 服务异常"
        sudo systemctl status nginx
    fi
else
    print_error "❌ Nginx 配置语法错误"
    sudo nginx -t
    
    print_info "恢复备份配置..."
    BACKUP_FILE=$(ls -t "$NGINX_CONFIG".backup.* 2>/dev/null | head -1)
    if [ -n "$BACKUP_FILE" ]; then
        sudo cp "$BACKUP_FILE" "$NGINX_CONFIG"
        sudo systemctl reload nginx
        print_info "已恢复备份配置"
    fi
fi

# 5. 连接测试
print_step "5. 连接测试"

print_info "测试 HTTPS 连接..."
if command -v openssl &> /dev/null; then
    print_info "检查 SSL 握手..."
    echo | sudo timeout 10 openssl s_client -connect $DOMAIN_NAME:443 -servername $DOMAIN_NAME 2>/dev/null | grep -E "(Verify return code|Protocol|Cipher)" || true
fi

print_info "测试 HTTP 响应..."
if command -v curl &> /dev/null; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://$DOMAIN_NAME/ || echo "000")
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://$DOMAIN_NAME/ || echo "000")
    
    print_info "HTTP 状态码: $HTTP_STATUS"
    print_info "HTTPS 状态码: $HTTPS_STATUS"
    
    if [ "$HTTPS_STATUS" = "200" ]; then
        print_success "✅ HTTPS 连接正常"
    elif [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
        print_success "✅ HTTP 重定向正常"
    else
        print_warning "⚠️ 连接状态异常"
    fi
fi

# 6. 创建 iOS 诊断页面
print_step "6. 创建 iOS 诊断页面"

if [ -d "$WEB_DIR" ]; then
    print_info "创建 iOS Safari 测试页面..."
    
    sudo tee "$WEB_DIR/ios-test.html" > /dev/null << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>iOS Safari 兼容性测试</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍎</text></svg>">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .test-grid {
            display: grid;
            gap: 15px;
        }
        
        .test-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .test-item h3 {
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .success {
            background: rgba(76, 175, 80, 0.3);
            border-color: rgba(76, 175, 80, 0.5);
        }
        
        .warning {
            background: rgba(255, 193, 7, 0.3);
            border-color: rgba(255, 193, 7, 0.5);
        }
        
        .error {
            background: rgba(244, 67, 54, 0.3);
            border-color: rgba(244, 67, 54, 0.5);
        }
        
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
            width: 100%;
            margin-top: 10px;
        }
        
        button:hover {
            background: #45a049;
        }
        
        button:disabled {
            background: #666;
            cursor: not-allowed;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 14px;
        }
        
        .info-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 10px;
            border-radius: 6px;
        }
        
        .status {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
        }
        
        .loading {
            opacity: 0.7;
        }
        
        @media (max-width: 480px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            body {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍎 iOS Safari 兼容性测试</h1>
            <p>诊断 iOS Safari 访问问题</p>
        </div>
        
        <div class="test-grid">
            <div class="test-item" id="deviceInfo">
                <h3>📱 设备信息</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>设备:</strong> <span id="deviceType">检测中...</span>
                    </div>
                    <div class="info-item">
                        <strong>浏览器:</strong> <span id="browserType">检测中...</span>
                    </div>
                    <div class="info-item">
                        <strong>iOS版本:</strong> <span id="iosVersion">检测中...</span>
                    </div>
                    <div class="info-item">
                        <strong>屏幕:</strong> <span id="screenInfo">检测中...</span>
                    </div>
                </div>
            </div>
            
            <div class="test-item" id="connectionTest">
                <h3>🔒 连接测试</h3>
                <p><strong>协议:</strong> <span id="protocol" class="status">检测中...</span></p>
                <p><strong>域名:</strong> <span id="hostname">检测中...</span></p>
                <p><strong>端口:</strong> <span id="port">检测中...</span></p>
                <p><strong>时间:</strong> <span id="timestamp">检测中...</span></p>
            </div>
            
            <div class="test-item" id="jsTest">
                <h3>📜 JavaScript 测试</h3>
                <p id="jsStatus">✅ JavaScript 正常工作</p>
                <p><strong>版本:</strong> <span id="jsVersion">检测中...</span></p>
            </div>
            
            <div class="test-item" id="networkTest">
                <h3>🌐 网络请求测试</h3>
                <p id="fetchStatus" class="loading">准备测试...</p>
                <button onclick="testNetwork()" id="networkBtn">开始网络测试</button>
            </div>
            
            <div class="test-item" id="storageTest">
                <h3>💾 存储测试</h3>
                <div id="storageResults">
                    <p>localStorage: <span id="localStorageStatus">测试中...</span></p>
                    <p>sessionStorage: <span id="sessionStorageStatus">测试中...</span></p>
                    <p>Cookie: <span id="cookieStatus">测试中...</span></p>
                </div>
            </div>
            
            <div class="test-item" id="fontTest">
                <h3>🔤 字体和CSS测试</h3>
                <p style="font-weight: bold;">粗体文字测试</p>
                <p style="font-style: italic;">斜体文字测试</p>
                <p style="text-decoration: underline;">下划线文字测试</p>
                <p id="cssStatus">CSS 样式正常</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="location.href='/'">返回主页</button>
            <button onclick="generateReport()" style="margin-left: 10px; background: #2196F3;">生成诊断报告</button>
        </div>
        
        <div id="reportModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000;">
            <div style="background: white; color: black; margin: 50px auto; padding: 20px; border-radius: 12px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                <h3>诊断报告</h3>
                <div id="reportContent"></div>
                <button onclick="closeReport()" style="background: #f44336; margin-top: 15px;">关闭</button>
            </div>
        </div>
    </div>

    <script>
        // 全局变量存储测试结果
        const testResults = {
            device: {},
            connection: {},
            network: {},
            storage: {},
            errors: []
        };
        
        // 设备检测
        function detectDevice() {
            const ua = navigator.userAgent;
            const isIOS = /iPad|iPhone|iPod/.test(ua);
            const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
            
            let deviceType = 'Unknown';
            if (/iPhone/.test(ua)) deviceType = 'iPhone';
            else if (/iPad/.test(ua)) deviceType = 'iPad';
            else if (/iPod/.test(ua)) deviceType = 'iPod';
            else if (isIOS) deviceType = 'iOS Device';
            else deviceType = 'Non-iOS Device';
            
            let browserType = 'Unknown';
            if (isSafari) browserType = 'Safari';
            else if (/Chrome|CriOS/.test(ua)) browserType = 'Chrome';
            else if (/FxiOS/.test(ua)) browserType = 'Firefox';
            else if (/Edge/.test(ua)) browserType = 'Edge';
            else browserType = 'Other';
            
            // iOS 版本检测
            let iosVersion = 'N/A';
            if (isIOS) {
                const match = ua.match(/OS (\d+)_(\d+)/);
                if (match) {
                    iosVersion = `${match[1]}.${match[2]}`;
                }
            }
            
            const screenInfo = `${screen.width}×${screen.height} (${window.devicePixelRatio}x)`;
            
            document.getElementById('deviceType').textContent = deviceType;
            document.getElementById('browserType').textContent = browserType;
            document.getElementById('iosVersion').textContent = iosVersion;
            document.getElementById('screenInfo').textContent = screenInfo;
            
            testResults.device = {
                type: deviceType,
                browser: browserType,
                iosVersion: iosVersion,
                screen: screenInfo,
                userAgent: ua
            };
            
            // 根据检测结果更新样式
            const deviceTest = document.getElementById('deviceInfo');
            if (isIOS && isSafari) {
                deviceTest.classList.add('success');
            } else if (isIOS) {
                deviceTest.classList.add('warning');
            } else {
                deviceTest.classList.add('error');
            }
        }
        
        // 连接信息检测
        function detectConnection() {
            const protocol = location.protocol;
            const hostname = location.hostname;
            const port = location.port || (protocol === 'https:' ? '443' : '80');
            const timestamp = new Date().toLocaleString();
            
            document.getElementById('protocol').textContent = protocol;
            document.getElementById('hostname').textContent = hostname;
            document.getElementById('port').textContent = port;
            document.getElementById('timestamp').textContent = timestamp;
            
            testResults.connection = {
                protocol: protocol,
                hostname: hostname,
                port: port,
                isHttps: protocol === 'https:'
            };
            
            // 更新连接测试状态
            const connectionTest = document.getElementById('connectionTest');
            const protocolSpan = document.getElementById('protocol');
            if (protocol === 'https:') {
                connectionTest.classList.add('success');
                protocolSpan.classList.add('success');
                protocolSpan.textContent = 'HTTPS ✅';
            } else {
                connectionTest.classList.add('warning');
                protocolSpan.classList.add('warning');
                protocolSpan.textContent = 'HTTP ⚠️';
            }
        }
        
        // JavaScript 测试
        function testJavaScript() {
            try {
                // 测试一些基本的 JavaScript 功能
                const version = 'ES' + (typeof Symbol !== 'undefined' ? '6+' : '5');
                document.getElementById('jsVersion').textContent = version;
                
                // 测试 Promise 支持
                if (typeof Promise !== 'undefined') {
                    document.getElementById('jsTest').classList.add('success');
                } else {
                    document.getElementById('jsTest').classList.add('warning');
                    document.getElementById('jsStatus').textContent = '⚠️ 部分 JavaScript 功能受限';
                }
            } catch (error) {
                document.getElementById('jsTest').classList.add('error');
                document.getElementById('jsStatus').textContent = '❌ JavaScript 错误: ' + error.message;
                testResults.errors.push('JavaScript: ' + error.message);
            }
        }
        
        // 存储测试
        function testStorage() {
            try {
                // localStorage 测试
                localStorage.setItem('test', 'value');
                localStorage.removeItem('test');
                document.getElementById('localStorageStatus').textContent = '✅ 正常';
            } catch (error) {
                document.getElementById('localStorageStatus').textContent = '❌ 失败';
                testResults.errors.push('localStorage: ' + error.message);
            }
            
            try {
                // sessionStorage 测试
                sessionStorage.setItem('test', 'value');
                sessionStorage.removeItem('test');
                document.getElementById('sessionStorageStatus').textContent = '✅ 正常';
            } catch (error) {
                document.getElementById('sessionStorageStatus').textContent = '❌ 失败';
                testResults.errors.push('sessionStorage: ' + error.message);
            }
            
            try {
                // Cookie 测试
                document.cookie = 'test=value';
                if (document.cookie.indexOf('test=value') !== -1) {
                    document.getElementById('cookieStatus').textContent = '✅ 正常';
                    // 清理测试 cookie
                    document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                } else {
                    document.getElementById('cookieStatus').textContent = '❌ 失败';
                }
            } catch (error) {
                document.getElementById('cookieStatus').textContent = '❌ 错误';
                testResults.errors.push('Cookie: ' + error.message);
            }
        }
        
        // 网络请求测试
        async function testNetwork() {
            const btn = document.getElementById('networkBtn');
            const status = document.getElementById('fetchStatus');
            const testDiv = document.getElementById('networkTest');
            
            btn.disabled = true;
            btn.textContent = '测试中...';
            status.textContent = '正在测试网络连接...';
            status.classList.remove('loading');
            
            try {
                // 测试健康检查端点
                const response = await fetch('/health', {
                    method: 'GET',
                    cache: 'no-cache'
                });
                
                if (response.ok) {
                    const text = await response.text();
                    status.textContent = `✅ 网络请求成功 (${response.status}) - ${text.trim()}`;
                    testDiv.classList.add('success');
                    testResults.network.health = 'success';
                } else {
                    status.textContent = `⚠️ 网络请求异常 (${response.status})`;
                    testDiv.classList.add('warning');
                    testResults.network.health = 'warning';
                }
                
                // 测试 CORS
                const corsResponse = await fetch(location.origin, {
                    method: 'HEAD',
                    mode: 'cors'
                });
                
                if (corsResponse.ok) {
                    testResults.network.cors = 'success';
                } else {
                    testResults.network.cors = 'failed';
                }
                
            } catch (error) {
                status.textContent = `❌ 网络请求失败: ${error.message}`;
                testDiv.classList.add('error');
                testResults.errors.push('Network: ' + error.message);
                testResults.network.health = 'failed';
            }
            
            btn.disabled = false;
            btn.textContent = '重新测试';
        }
        
        // 生成诊断报告
        function generateReport() {
            const report = `
诊断时间: ${new Date().toLocaleString()}

设备信息:
- 设备类型: ${testResults.device.type}
- 浏览器: ${testResults.device.browser}
- iOS版本: ${testResults.device.iosVersion}
- 屏幕信息: ${testResults.device.screen}

连接信息:
- 协议: ${testResults.connection.protocol}
- 域名: ${testResults.connection.hostname}
- 端口: ${testResults.connection.port}
- HTTPS: ${testResults.connection.isHttps ? '是' : '否'}

网络状态:
- 健康检查: ${testResults.network.health || '未测试'}
- CORS支持: ${testResults.network.cors || '未测试'}

错误信息:
${testResults.errors.length > 0 ? testResults.errors.join('\n') : '无错误'}

User Agent:
${testResults.device.userAgent}
            `.trim();
            
            document.getElementById('reportContent').innerHTML = '<pre style="white-space: pre-wrap; font-size: 12px;">' + report + '</pre>';
            document.getElementById('reportModal').style.display = 'block';
        }
        
        function closeReport() {
            document.getElementById('reportModal').style.display = 'none';
        }
        
        // 页面加载完成后执行所有测试
        document.addEventListener('DOMContentLoaded', function() {
            detectDevice();
            detectConnection();
            testJavaScript();
            testStorage();
            
            // 自动运行网络测试
            setTimeout(testNetwork, 1000);
        });
    </script>
</body>
</html>
EOF
    
    # 设置权限
    WEB_USER="nginx"
    if [ -d "/etc/nginx/sites-available" ]; then
        WEB_USER="www-data"
    fi
    
    sudo chown $WEB_USER:$WEB_USER "$WEB_DIR/ios-test.html"
    sudo chmod 644 "$WEB_DIR/ios-test.html"
    
    print_success "✅ iOS 测试页面已创建"
    print_info "测试地址: https://$DOMAIN_NAME/ios-test.html"
else
    print_warning "⚠️ Web 目录不存在，跳过创建测试页面"
fi

# 7. 总结和建议
print_step "7. 修复完成"

echo ""
echo "🎉 iOS Safari 兼容性修复完成！"
echo ""
echo "📋 修复内容："
echo "   ✅ 优化 SSL 配置，增加 iOS Safari 支持的加密套件"
echo "   ✅ 启用 OCSP Stapling，提高连接速度"
echo "   ✅ 添加正确的 MIME 类型和字符编码"
echo "   ✅ 优化字体文件的 CORS 配置"
echo "   ✅ 调整内容安全策略"
echo "   ✅ 创建 iOS Safari 专用测试页面"
echo ""
echo "🧪 测试方法："
echo "   1. 在 iOS Safari 中访问: https://$DOMAIN_NAME"
echo "   2. 测试页面: https://$DOMAIN_NAME/ios-test.html"
echo "   3. 检查测试页面中的所有项目是否显示绿色 ✅"
echo ""
echo "🔧 如果问题仍然存在："
echo "   1. 清除 iOS Safari 的缓存和数据"
echo "   2. 重启 iOS 设备"
echo "   3. 检查 iOS 设备的日期时间设置"
echo "   4. 尝试使用其他网络（如 4G/5G）"
echo "   5. 运行: sudo tail -f /var/log/nginx/$APP_NAME-error.log"
echo ""
echo "📞 技术支持："
echo "   如果问题持续存在，请将 iOS 测试页面的诊断报告"
echo "   发送给技术支持团队进行进一步分析。"
echo ""
print_success "✅ 修复脚本执行完成！"
