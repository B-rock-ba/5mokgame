# 🎮 실시간 투표 오목 게임

수업 시간에 학생들과 실시간으로 상호작용하며 즐길 수 있는 오목 게임입니다!

> 💡 **GitHub Codespaces 사용 중이신가요?** [CODESPACES.md](./CODESPACES.md)에서 포트 설정 및 문제 해결 방법을 확인하세요!

## 📋 프로젝트 설명

15×15 바둑판에서 교수님과 학생들이 대결하는 오목 게임입니다:
- **교수님 차례**: 교수님이 직접 돌을 놓습니다
- **학생 차례**: 90초 동안 학생들이 QR 코드로 접속하여 투표합니다
- **실시간 투표**: 각 위치별 투표 현황이 실시간으로 백분율로 표시됩니다
- **자동 배치**: 90초 후 가장 많은 투표를 받은 위치에 돌이 놓입니다

## 🚀 설치 및 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 서버와 클라이언트 동시 실행
```bash
npm start
```

또는 개별 실행:
```bash
# 서버만 실행 (포트 8080)
npm run server

# 프론트엔드만 실행 (포트 3000)
npm run dev
```

### 3. 접속하기

- **교수님 페이지**: http://localhost:3000
- **학생 투표 페이지**: http://localhost:3000/vote

## 🎯 사용 방법

### 교수님 (호스트)

1. 브라우저에서 `http://localhost:3000` 접속
2. "Start Game" 버튼 클릭
3. 화면에 QR 코드가 나타남
4. 바둑판을 클릭하여 흑돌(교수님) 배치
5. 학생들의 투표 현황을 실시간으로 확인
6. 90초 후 자동으로 백돌(학생들) 배치

### 학생 (관객)

1. QR 코드 스캔 또는 `http://localhost:3000/vote` 접속
2. 투표 시간에 원하는 위치 클릭
3. "투표하기" 버튼 클릭
4. 투표 현황을 실시간으로 확인
5. 한 라운드당 1번만 투표 가능

## 🎨 주요 기능

- ✅ 15×15 오목판 (알파벳 열 A-O, 숫자 행 1-15)
- ✅ 90초 투표 타이머
- ✅ 실시간 투표 현황 (백분율 표시)
- ✅ QR 코드 자동 생성
- ✅ 중복 투표 방지
- ✅ WebSocket 실시간 통신
- ✅ 반응형 디자인

## 🛠 기술 스택

- **프론트엔드**: React + TypeScript + Tailwind CSS
- **백엔드**: Node.js + WebSocket (ws)
- **빌드 도구**: Vite
- **라우팅**: React Router

## 📁 파일 구조

```
/workspaces/5mokgame/
├── App.tsx                    # 교수님 페이지 (메인 게임)
├── VotePage.tsx              # 학생 투표 페이지
├── server.js                 # WebSocket 서버
├── types.ts                  # TypeScript 타입 정의
├── constants/
│   └── projects.ts           # 게임 상수
├── components/
│   ├── ProjectCard.tsx       # 게임 보드 컴포넌트
│   └── Header.tsx            # 게임 정보 컴포넌트
└── package.json
```

## 🔧 설정 변경

### 투표 시간 변경
`constants/projects.ts` 파일에서:
```typescript
export const VOTE_DURATION_SECONDS = 90; // 원하는 초로 변경
```

`server.js` 파일에서도 동일하게 변경:
```javascript
const VOTE_DURATION_SECONDS = 90; // 원하는 초로 변경
```

### 보드 크기 변경
`constants/projects.ts`에서:
```typescript
export const BOARD_SIZE = 15; // 원하는 크기로 변경 (15, 19 등)
```

## 📱 모바일 지원

학생 투표 페이지는 모바일 환경에 최적화되어 있습니다.

## 🎓 수업 발표 팁

1. **사전 준비**: 미리 게임을 시작해두고 QR 코드를 학생들에게 보여주세요
2. **네트워크 확인**: 같은 Wi-Fi 네트워크에 연결되어 있는지 확인하세요
3. **화면 공유**: 투표 현황을 프로젝터로 보여주면 더욱 흥미진진합니다
4. **규칙 설명**: 첫 라운드 전에 투표 방법을 간단히 설명하세요

## 🐛 문제 해결

### WebSocket 연결 실패
- 서버가 실행 중인지 확인: `npm run server`
- 포트 8080이 사용 가능한지 확인

### QR 코드가 보이지 않음
- 게임이 시작되었는지 확인 (Start Game 클릭)
- 인터넷 연결 확인 (QR 코드는 외부 API 사용)

### 학생 페이지 접속 안됨
- 프론트엔드 서버가 실행 중인지 확인: `npm run dev`
- URL이 정확한지 확인: `http://localhost:3000/vote`

## 📄 라이선스

ISC

---

즐거운 수업 되세요! 🎉
