# Blitzcrown Web — 프로젝트 기획

## 프로젝트 목적

**Blitzcrown** B2B iGaming 스튜디오를 위한 **운영사(오퍼레이터) 대상 공식 웹사이트**입니다.

- 소비자용 카지노/플레이 사이트가 아니라, **파트너·운영사에게 게임 포트폴리오와 스튜디오 신뢰도를 전달**하는 마케팅·세일즈 채널입니다.
- **17종 instant-win 게임**(crash, plinko, tower, cards) 카탈로그, About, Contact, 법적 고지(MGA)를 한곳에서 제공합니다.
- 시각·인터랙션은 프리미엄 포트폴리오 사이트 수준을 목표로 하되, **브랜드·카피·게임 자산은 Blitzcrown 전용**입니다.

---

## 레퍼런스 사이트 (무엇을 카피하는가)

이 프로젝트는 **두 개의 레퍼런스**를 분리해서 사용합니다.

| 구분 | URL | 역할 |
|------|-----|------|
| **비주얼·인터랙션 레퍼런스** | [ricardochance.com](https://www.ricardochance.com/) | 레이아웃, 스크롤, WebGL 파티클, 프리로더, 섹션 구조, 모션 타이밍 등 **껍데기(UX/UI)** |
| **콘텐츠·브랜드 레퍼런스** | [blitzcrown.massivegaming.io](https://blitzcrown.massivegaming.io/) | 캐치프레이즈, About 카피, 연락처, MGA 법적 문구, B2B 톤 등 **내용(IA·카피)** |

### 카피하는 것 (ricardochance.com 기준)

- 풀스크린 WebGL 배경(그라데이션 blob + 파티클 필드)
- Lenis 스무스 스크롤 + GSAP ScrollTrigger 스크럽
- 히어로 입장 애니메이션(프리로더 → 파티클 응집 + 타이포 리빌)
- 스크롤에 따른 파티클 **dissolve / morph**(intro에서 흩어짐 → Latest games에서 번개 형상으로 재응집)
- Featured work형 **Latest games** 카드 스택·스크롤 연동 타이틀
- 코너 프레임, 커스텀 커서, 햄버거 네비, CTA·푸터 레이아웃
- 타이포 스케일·브레이크포인트·spacing 토큰(`heading-*`, `body-*`, `c-*` 간격)

### 카피하지 않는 것

- Ricardo Chance 이름, 프로젝트 사례(nk.studio / Flixxo 등), 원본 사진·영상
- 원본의 Services / Process 9카드 구조(Blitzcrown은 **파트너 근거 4열**로 대체)
- 소비자 카지노 UX, 다국어(en/es) — **영문 단일** 유지

로컬 미러본: `_reference/site/` (원본 사이트 정적 미러, 비교·추출용)

---

## 브랜드·기획 방향 (확정 사항)

| 항목 | 내용 |
|------|------|
| **언어** | English only |
| **내비게이션** | Games · About Us · Contact |
| **캐치프레이즈** | `BEYOND MORE, ORIGINAL GAMES.` |
| **포지셔닝** | Not more games, **better games** — instant-win 특화 B2B 프로바이더 |
| **폰트** | Barlow (전역) |
| **연락처** | sales@blitzcrown.io · hello@blitzcrown.io |
| **법인·라이선스** | MVG Malta C109221 · MGA/B2B/1088/2025 |
| **게임 수** | 17 titles (썸네일 `public/thumbnails/`, 772×1032) |

---

## 정보 구조 (IA)

```
/                 홈 — Hero, Intro, Latest games, Partner proofs, CTA, Footer
/games            게임 카탈로그 (장르 필터: Plinko / Crash / Tower / Cards)
/games/[slug]     게임 상세 (17종 SSG)
/about            스튜디오 소개, RG, 파트너 근거
/contact          문의
/privacy          개인정보 처리방침
```

### 홈 섹션 흐름

1. **Hero** — 캐치프레이즈 + 번개 파티클
2. **Intro** — “Not more games, better games.” + About CTA
3. **Latest games** — 대표 3종 썸네일 + `catchphraseLine` (원본 Featured work 위치·애니메이션)
4. **Built for operators** — B2B 근거 4항
5. **CTA** — partnership / Get in touch
6. **Footer** — 이메일 + MGA 법적 문구

---

## 기술 스택

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (`@theme` 디자인 토큰)
- **GSAP** + ScrollTrigger + SplitText
- **Lenis** 스무스 스크롤
- **Three.js** / React Three Fiber — blob 배경, ambient·shape 파티클
- **Zustand** — 글로벌·스크롤·파티클 상태

---

## 주요 디렉터리

| 경로 | 설명 |
|------|------|
| `src/app/` | 라우트·레이아웃 |
| `src/components/sections/` | 페이지 섹션 (hero, featured-work, …) |
| `src/components/gl/` | WebGL·파티클·스크롤 컨트롤러 |
| `src/config/site.ts` | 사이트 카피·법적 문구·네비 |
| `src/config/games.ts` | 17종 게임 메타·슬러그 |
| `public/thumbnails/` | 게임 썸네일 |
| `_reference/` | 원본 사이트 미러·셰이더 추출·캡처 스크립트 |

---

## 로컬 개발

```bash
npm install
npm run dev -- -p 3002
```

- `npm run build` — 정적 생성(게임 상세 17페이지 포함)
- `/games` **hard refresh** 시 `/`로 리다이렉트 (의도된 동작, 클라이언트 네비는 정상)

---

## 의도적으로 다르게 둔 부분 (기획 메모)

- **히어로** Talk to sales / Explore games 버튼 제거
- **헤더** 좌상단 Blitzcrown 로고 텍스트 제거 (메뉴만)
- **파티클 morph** 홈 Latest games 구간은 **번개(lightning)** 유지 (원본 diamond 대신)
- **Footer** `data-dissolve="in"` 제거 — Latest games 이후 번개가 **한 번만** 응집
- **Partner proofs / About** 반투명 카드 그리드 밴드 제거 (배경만 보이도록)

---

## 한 줄 요약

> **ricardochance.com의 몰입형 웹 경험을 재현하고, blitzcrown.massivegaming.io의 B2B 브랜드·게임·컴플라이언스 내용을 채운 Blitzcrown 운영사용 공식 사이트.**
