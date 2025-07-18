#!/bin/bash

# 临时绕过CDN测试脚本

echo "🔧 临时绕过CDN，直接访问服务器测试"
echo ""

# 创建本地hosts文件条目
echo "添加临时hosts条目以绕过CDN..."
echo "47.92.208.198 todo.ylingtech.com" | sudo tee -a /etc/hosts

echo ""
echo "✅ 已添加hosts条目，现在可以直接访问服务器"
echo ""
echo "🧪 测试命令："
echo "curl -I http://todo.ylingtech.com"
echo "curl -I https://todo.ylingtech.com"
echo ""
echo "⚠️ 测试完成后记得清理hosts文件："
echo "sudo sed -i '/47.92.208.198 todo.ylingtech.com/d' /etc/hosts"
