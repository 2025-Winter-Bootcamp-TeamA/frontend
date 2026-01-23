# TeamA Frontend

Next.js 14 기반 프론트엔드 애플리케이션입니다.

## 기술 스택

- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- Zustand (상태 관리)
- React Query (서버 상태)
- Axios (HTTP 클라이언트)

---

## 사전 요구사항

### Node.js 20 설치

**macOS:**
```bash
# Homebrew 사용
brew install node@20

# 또는 nvm 사용 (권장)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 설치 확인
node --version
npm --version
```

**Windows:**
1. [Node.js 공식 사이트](https://nodejs.org/)에서 20 LTS 버전 다운로드
2. 또는 [nvm-windows](https://github.com/coreybutler/nvm-windows) 사용

**Linux (Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 설치 확인
node --version
npm --version
```

---

## 환경변수 설정

프로젝트는 환경별로 다른 환경변수 파일을 사용합니다:

### 환경변수 파일 구조

| 파일 | 용도 | 자동 적용 |
|------|------|----------|
| `.env.local` | 로컬 개발 환경 | `npm run dev` |
| `.env.production` | 프로덕션 배포 | `npm run build`, `npm start` |

### 로컬 개발 환경 (.env.local)

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-map-api-key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 프로덕션 환경 (.env.production)

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-map-api-key
NEXT_PUBLIC_API_URL=https://devroad.cloud
NEXT_PUBLIC_APP_URL=https://devroad.cloud
```

> **주의**: `.env.local`과 `.env.production` 파일은 민감한 정보를 포함하므로 Git에 커밋되지 않습니다.
>
> Next.js는 실행 환경에 따라 자동으로 적절한 환경변수 파일을 선택합니다.

---

## 빠른 시작

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 3. Backend 서버 실행 (별도 터미널)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.teamA.com` |

---

## 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 타입 검사
npm run type-check

# 코드 포맷팅
npm run format
```

---

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈페이지
│   │   ├── globals.css         # 전역 스타일
│   │   └── providers.tsx       # Context Providers
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                 # 기본 UI 컴포넌트
│   │   └── ...                 # 기능별 컴포넌트
│   ├── lib/                    # 유틸리티
│   │   ├── api.ts              # API 클라이언트
│   │   └── utils.ts            # 헬퍼 함수
│   ├── store/                  # Zustand 상태 관리
│   │   └── authStore.ts        # 인증 상태
│   └── types/                  # TypeScript 타입 정의
│       └── index.ts            # 공통 타입
├── public/                     # 정적 파일
├── package.json                # 패키지 설정
├── tsconfig.json               # TypeScript 설정
├── tailwind.config.ts          # Tailwind CSS 설정
└── next.config.js              # Next.js 설정
```

---

## 주요 기능

- **인증**: JWT 기반 로그인/회원가입
- **트렌드 대시보드**: 기술 트렌드 시각화
- **채용 공고**: 채용 정보 검색 및 필터링
- **이력서 관리**: 이력서 업로드 및 분석
- **면접 연습**: AI 기반 면접 질문 및 피드백

---

## 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. `frontend` 폴더를 Root Directory로 설정
5. 환경변수 설정:
   - `NEXT_PUBLIC_API_URL`: Backend API URL
6. Deploy 클릭

### 환경변수 설정 (Vercel)

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |
