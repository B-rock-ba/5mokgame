# 🚀 빠른 시작 가이드

## Codespaces를 다시 열었을 때

### 1️⃣ 서버 시작 (필수)

터미널에서 다음 명령어 실행:

```bash
npm start
```

### 2️⃣ 포트 확인 (필수)

VS Code 하단의 **PORTS** 탭에서:
- ✅ 포트 **3000**: Public
- ✅ 포트 **8080**: Public

> 💡 포트가 Private이면 우클릭 → Port Visibility → Public 선택

### 3️⃣ 게임 시작

브라우저에서 접속:
- Codespaces가 자동으로 열어준 URL 사용
- 또는 PORTS 탭에서 포트 3000의 지구본 아이콘 클릭

---

## ⚡ 한 줄 요약

```bash
npm start
```

포트 Public 확인 → 게임 시작! 끝! 🎉

---

## 📋 체크리스트

- [ ] `npm start` 실행
- [ ] 포트 3000 Public 확인
- [ ] 포트 8080 Public 확인
- [ ] 브라우저에서 게임 페이지 열기
- [ ] "Start Game" 클릭
- [ ] QR 코드 확인

---

## 🆘 문제 해결

### 서버가 이미 실행 중이라는 메시지가 나올 때

```bash
# 기존 프로세스 종료
pkill -f "node.*server.js" && pkill -f "vite"

# 다시 시작
npm start
```

### 포트 확인

```bash
./check-ports.sh
```

---

## 💾 저장된 내용

다음 항목들은 Codespaces에 영구적으로 저장됩니다:
- ✅ 모든 코드 파일
- ✅ 설정 파일
- ✅ node_modules (npm install 했다면)
- ✅ 포트 설정 (devcontainer.json)

저장되지 **않는** 것:
- ❌ 실행 중인 서버 (재시작 필요)
- ❌ 게임 진행 상황 (새 게임 시작)

---

## 🎓 발표 당일 체크리스트

### 발표 30분 전

1. Codespaces 접속
2. `npm start` 실행
3. 포트 Public 확인
4. 테스트 게임 시작
5. 핸드폰으로 QR 코드 스캔 테스트
6. 투표 테스트

### 발표 시작 전

1. 게임 리셋 (Reset Game 버튼)
2. 새로운 게임 시작 (Start Game)
3. QR 코드를 프로젝터에 크게 표시
4. 학생들에게 접속 안내

### 발표 중

- 교수님: 흑돌 배치
- 학생들: QR 코드 스캔 → 투표
- 화면: 실시간 투표 현황 표시
- 90초 후: 자동으로 백돌 배치

---

## 🔗 유용한 링크

- [전체 문서](./README.md)
- [Codespaces 가이드](./CODESPACES.md)
- [디버그 페이지](http://localhost:3000/debug.html)
