#!/bin/bash

echo "=== 포트 상태 확인 ==="
netstat -tlnp 2>/dev/null | grep -E ":(3000|8080)"

echo ""
echo "=== 현재 Codespaces URL 확인 ==="
if [ -n "$CODESPACE_NAME" ]; then
    echo "Codespace Name: $CODESPACE_NAME"
    echo "3000 포트 URL: https://${CODESPACE_NAME}-3000.app.github.dev"
    echo "8080 포트 URL: https://${CODESPACE_NAME}-8080.app.github.dev"
    echo ""
    echo "⚠️  중요: VS Code 하단 PORTS 탭에서"
    echo "   - 포트 3000을 Public으로 설정"
    echo "   - 포트 8080을 Public으로 설정"
else
    echo "로컬 환경입니다."
    echo "3000 포트 URL: http://localhost:3000"
    echo "8080 포트 URL: http://localhost:8080"
fi
