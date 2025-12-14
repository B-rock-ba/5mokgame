# 🎮 실시간 투표 오목 게임

수업 시간에 학생들과 실시간으로 상호작용하며 즐길 수 있는 오목 게임입니다!

> ⚡ **빠른 시작**: Codespaces를 다시 열었나요? → [QUICKSTART.md](./QUICKSTART.md) 참고!
> 
> 💡 **GitHub Codespaces 사용 중이신가요?** → [CODESPACES.md](./CODESPACES.md)에서 포트 설정 및 문제 해결 방법을 확인하세요!

## 🎯 Project Overview (EN)

### What is This Project?

An **interactive real-time voting Omok (Five-in-a-Row) game** designed for classroom presentations, where students collectively compete against the professor through live voting.

### Key Features

- **Real-time Collaboration**: 26 students vote simultaneously via QR code
- **Live Data Visualization**: Vote percentages displayed with color gradients (red >50%, orange >30%, amber ≤30%)
- **Statistical Analysis**: Track individual alignment with collective decisions
- **Gamification**: Awards for "Big Data Master" (highest match rate) and "Unique Thinker" (lowest match rate)
- **AI-Powered Development**: Entire project built collaboratively with Claude AI

### How It Works

```
Professor places stone → Voting starts (30 sec timer) → Students vote via QR code
→ Real-time vote aggregation → Automatic placement at majority position
→ Game continues → Statistics calculated → Awards announced
```

### Technical Architecture

**Frontend (Port 3000)**
- React 18 + TypeScript for type-safe UI components
- Vite for fast development and optimized builds
- Tailwind CSS for responsive, mobile-first design

**Backend (Port 8080)**
- Node.js WebSocket server for real-time bidirectional communication
- In-memory game state management
- Vote aggregation and statistical analysis

**Data Flow**
1. **Connection**: Students scan QR → Enter nickname → WebSocket connection established
2. **Voting**: Each vote sent via WebSocket → Server aggregates in real-time → Broadcasts to all clients
3. **Analysis**: Individual votes tracked → Compared with majority decision → Match/mismatch calculated
4. **Visualization**: Percentages computed → Color-coded overlays rendered → Live updates every 100ms

### AI Collaboration Process

This project demonstrates effective AI-assisted development:

1. **Ideation**: Human provides concept ("interactive Omok game with student voting")
2. **Architecture**: AI designs full-stack architecture (React + WebSocket + Node.js)
3. **Iteration**: Human requests features → AI implements and refines
4. **Optimization**: Progressive enhancement (timer adjustments, duplicate prevention, statistics)

**Development Timeline**: Completed in 1 day with AI assistance (vs. 2-3 weeks traditional development)

### Educational Value

- **Data Science**: Real-time data collection, aggregation, and visualization
- **Collective Intelligence**: Analyzing individual vs. group decision-making patterns
- **Web Technologies**: Understanding client-server architecture, WebSockets, real-time systems
- **AI Tools**: Demonstrating practical AI collaboration in software development

---

## 📋 프로젝트 설명 (KR)

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

## 📁 파일 구조 및 역할

### 🔵 **핵심 파일** (Core Files)

#### **App.tsx**
- **역할**: 교수님용 메인 게임 페이지
- **기능**:
  - 15×15 오목판 표시
  - 교수님이 직접 돌 배치
  - 실시간 투표 현황 확인
  - WebSocket으로 서버와 통신
  - 게임 상태 관리 (교수님 차례 ↔ 투표 시간 ↔ 게임 종료)

#### **VotePage.tsx**
- **역할**: 학생용 투표 페이지
- **기능**:
  - 닉네임 입력 모달
  - 투표 가능한 위치 선택
  - 실시간 투표 현황 표시
  - 30초 타이머 표시
  - 개인 통계 확인 (일치율, 일치/불일치 횟수)
  - 승/패 메시지 표시

#### **server.js**
- **역할**: WebSocket 실시간 서버 (포트 8080)
- **기능**:
  - 교수님 클라이언트 관리
  - 학생 클라이언트 관리 (닉네임 중복 체크)
  - 게임 상태 관리 및 동기화
  - 투표 집계 (실시간)
  - 승리 조건 체크 (5개 연속)
  - 개인별 통계 계산 (다수결 일치/불일치)
  - 수상자 선정 (빅데이터인, 아이덴티티인)

#### **types.ts**
- **역할**: TypeScript 타입 정의
- **내용**:
  - `Player`, `CellState`, `BoardState`: 게임판 관련 타입
  - `GameStatus`: 게임 상태 (준비, 교수님 차례, 투표 중, 종료)
  - `Vote`: 투표 데이터 구조
  - `PlayerStats`: 개인 통계 (닉네임, 일치/불일치, 일치율)
  - `VoteRecord`: 투표 기록

---

### 🟢 **컴포넌트** (Components)

#### **components/Header.tsx**
- **역할**: 게임 정보 패널 (교수님 화면 우측)
- **기능**:
  - QR 코드 생성 및 표시
  - 30초 투표 타이머
  - 참여자 현황 프로그레스 바 (n/26)
  - 상위 3개 투표 순위 표시
  - 게임 종료 시 수상자 발표
    - 🏅 빅데이터인 (Big Data Master)
    - ✨ 아이덴티티인 (Unique Thinker)
  - 게임 시작/리셋 버튼

#### **components/ProjectCard.tsx**
- **역할**: 오목판 렌더링
- **기능**:
  - 15×15 그리드 표시
  - 행/열 라벨 (A-O, 1-15)
  - 돌 배치 (검은색 = 교수님, 흰색 = 학생)
  - 투표 시간에 실시간 투표율 오버레이
  - 색상 그라데이션 (빨강 >50%, 주황 >30%, 노랑 ≤30%)
  - 클릭 이벤트 처리

---

### 🟡 **설정 및 상수** (Configuration)

#### **constants/projects.ts**
- **역할**: 게임 설정 상수
- **내용**:
  - `BOARD_SIZE = 15`: 바둑판 크기
  - `VOTE_DURATION_SECONDS = 30`: 투표 시간
  - `PLAYER`: 플레이어 구분 (교수님, 학생)
  - `GAME_STATUS`: 게임 상태 정의
  - `PLAYER_NAME`: 플레이어 이름

#### **constants/icons.tsx** ⚠️ **(미사용)**
- **상태**: 현재 프로젝트에서 사용되지 않음
- **원래 용도**: 아이콘 컴포넌트 저장용

#### **contexts/LanguageContext.tsx** ⚠️ **(미사용)**
- **상태**: 현재 프로젝트에서 사용되지 않음
- **원래 용도**: 다국어 지원 (한국어/영어 전환)
- **참고**: 학생 페이지는 영어로 고정되어 있음

---

### 🔧 **빌드 및 설정** (Build & Config)

#### **vite.config.ts**
- **역할**: Vite 빌드 도구 설정
- **내용**:
  - React 플러그인 설정
  - 개발 서버 포트 3000
  - 네트워크 노출 설정 (host: true)

#### **tsconfig.json**
- **역할**: TypeScript 컴파일러 설정
- **내용**: JSX 지원, 모듈 해석 규칙 등

#### **tailwind.config.js**
- **역할**: Tailwind CSS 설정
- **내용**: 커스텀 색상, 그라데이션, 반응형 breakpoint

#### **postcss.config.js**
- **역할**: PostCSS 설정 (Tailwind 처리용)

#### **package.json**
- **역할**: 프로젝트 의존성 및 스크립트
- **주요 스크립트**:
  - `npm start`: 서버 + 클라이언트 동시 실행
  - `npm run dev`: Vite 개발 서버만 실행
  - `npm run server`: WebSocket 서버만 실행

---

### 🌐 **엔트리 포인트** (Entry Points)

#### **index.html**
- **역할**: HTML 엔트리 포인트
- **내용**: React 앱이 마운트될 `<div id="root">`

#### **index.tsx**
- **역할**: React 앱 엔트리 포인트
- **기능**:
  - React Router 설정 (`/` → App, `/vote` → VotePage)
  - React 앱을 DOM에 렌더링

#### **index.css**
- **역할**: 전역 CSS 스타일
- **내용**: Tailwind 기본 스타일, 커스텀 폰트 등

---

### 🔍 **디버깅 및 유틸리티** (Debugging)

#### **debug.html** ⚠️ **(개발용)**
- **용도**: WebSocket 연결 테스트용 페이지
- **상태**: 개발/디버깅 시에만 사용

#### **check-ports.sh** ⚠️ **(개발용)**
- **용도**: 포트 3000, 8080 상태 확인 스크립트
- **상태**: 개발/디버깅 시에만 사용

---

### 📦 **기타 파일**

#### **metadata.json** ⚠️ **(미사용)**
- **상태**: 현재 프로젝트에서 사용되지 않음
- **원래 용도**: 프로젝트 메타데이터 저장

#### **.devcontainer/** 
- **역할**: GitHub Codespaces 설정
- **내용**: 포트 포워딩 설정 (3000, 8080 public)

#### **CODESPACES.md**
- **역할**: Codespaces 사용자용 가이드
- **내용**: 포트 설정, 문제 해결 방법

#### **QUICKSTART.md**
- **역할**: 빠른 시작 가이드
- **내용**: Codespaces 재시작 시 따라할 절차

---

### 📊 **파일 요약**

| 카테고리 | 사용 중 | 미사용/개발용 |
|---------|---------|--------------|
| 핵심 로직 | App.tsx, VotePage.tsx, server.js, types.ts | - |
| 컴포넌트 | Header.tsx, ProjectCard.tsx | - |
| 설정 | projects.ts, vite.config.ts, tailwind.config.js | icons.tsx ⚠️, LanguageContext.tsx ⚠️ |
| 엔트리 | index.html, index.tsx, index.css | - |
| 유틸리티 | - | debug.html ⚠️, check-ports.sh ⚠️, metadata.json ⚠️ |

---

## 📁 구조 다이어그램

```
/workspaces/5mokgame/
├── 🔵 App.tsx                     # 교수님 페이지
├── 🔵 VotePage.tsx                # 학생 투표 페이지
├── 🔵 server.js                   # WebSocket 서버 (포트 8080)
├── 🔵 types.ts                    # TypeScript 타입 정의
├── 🟢 components/
│   ├── Header.tsx                # 게임 정보 패널 (QR, 타이머, 통계)
│   └── ProjectCard.tsx           # 오목판 렌더링
├── 🟡 constants/
│   ├── projects.ts               # 게임 설정 (보드 크기, 타이머)
│   └── ⚠️ icons.tsx              # (미사용)
├── ⚠️ contexts/
│   └── LanguageContext.tsx       # (미사용 - 다국어 지원)
├── 🌐 index.html                  # HTML 엔트리
├── 🌐 index.tsx                   # React 엔트리 (라우터 설정)
├── 🌐 index.css                   # 전역 CSS
├── 🔧 vite.config.ts              # Vite 설정
├── 🔧 tsconfig.json               # TypeScript 설정
├── 🔧 tailwind.config.js          # Tailwind CSS 설정
├── 🔧 postcss.config.js           # PostCSS 설정
├── 🔧 package.json                # 의존성 및 스크립트
├── 🔍 debug.html                  # (개발용 - WebSocket 테스트)
├── 🔍 check-ports.sh              # (개발용 - 포트 확인)
├── ⚠️ metadata.json               # (미사용)
├── 📚 README.md                   # 이 파일
├── 📚 CODESPACES.md               # Codespaces 가이드
└── 📚 QUICKSTART.md               # 빠른 시작 가이드
```

---

## 🎮 사용 방법
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
