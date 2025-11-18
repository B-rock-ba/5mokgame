# 🚀 GitHub Codespaces에서 실행하기

GitHub Codespaces 환경에서 오목 게임을 실행할 때 필요한 설정입니다.

## ⚠️ 중요: 포트 설정

WebSocket 연결이 작동하려면 **포트 8080을 Public으로 설정**해야 합니다!

### 포트를 Public으로 변경하는 방법

1. VS Code 하단의 **PORTS** 탭을 클릭합니다
2. 포트 목록에서 **8080** (WebSocket Server)을 찾습니다
3. 포트 8080을 **우클릭**합니다
4. **Port Visibility** → **Public** 선택합니다

> 💡 **팁**: 포트 3000 (Vite Dev Server)도 Public으로 설정하는 것을 권장합니다.

## 🔍 연결 테스트

연결이 제대로 되는지 확인하려면 디버그 페이지를 사용하세요:

```
http://localhost:3000/debug.html
```

이 페이지에서:
- 현재 페이지 정보 확인
- 생성된 WebSocket URL 확인
- "WebSocket 연결 테스트" 버튼으로 연결 테스트

## 연결 문제 해결

### 증상: "Start Game" 버튼 클릭 후 몇 초 뒤 초기화됨

**원인**: WebSocket 서버에 연결하지 못함

**해결 방법**:
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 에러 메시지 확인:
   - `WebSocket connection to 'ws://...' failed` → 포트 공개 필요
   - `❌ WebSocket connection closed` → 서버 재시작 필요

3. WebSocket URL 확인:
   ```javascript
   console.log(window.location.host)
   ```
   
4. 포트 8080이 forwarded되었는지 PORTS 탭에서 확인

### 빠른 해결책

터미널에서:
```bash
# 모든 프로세스 종료
pkill -f node

# 서버 재시작
npm run server &

# 프론트엔드 재시작
npm run dev
```

## 자동 포트 공개 설정

`.devcontainer/devcontainer.json` 파일에 추가:
```json
{
  "forwardPorts": [3000, 8080],
  "portsAttributes": {
    "8080": {
      "label": "WebSocket Server",
      "onAutoForward": "notify"
    },
    "3000": {
      "label": "Vite Dev Server",
      "onAutoForward": "openBrowser"
    }
  }
}
```
