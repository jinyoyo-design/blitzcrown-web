# Blitzcrown 웹사이트 리뉴얼 — 기획·설득 요약

> B2B 운영사·파트너를 위한 세일즈 사이트. 소비자 플레이 사이트가 아님.  
> 원본 콘텐츠: [blitzcrown.massivegaming.io](https://blitzcrown.massivegaming.io/) · 인터랙션 레퍼런스: ricardochance.com

---

## 1. 한 장 요약

| 질문 | 답 |
|------|-----|
| **왜 리뉴얼?** | 기존 사이트는 정보는 있으나 B2B 신뢰·포트폴리오 임팩트가 약함. 운영사가 3초 안에 “누구·무엇·다음 행동”을 못 잡으면 이탈. |
| **사이트 유형** | **Brand Hub + Conversion** — 브랜드 각 + 포트폴리오 탐색 + 파트너 문의 |
| **핵심 목표** | ① 스튜디오 신뢰 전달 ② 대표 게임 노출 ③ partnership 문의 전환 |
| **성공 지표** | Contact/메일 클릭, `/games` 진입, 체류·스크롤 완료율 (런칭 후 측정) |

---

## 2. 사이트는 층 — 무엇을 건드렸나

| 층 | 리뉴얼 내용 |
|----|-------------|
| **0 목적** | B2B instant-win 프로바이더 포지셔닝 고정 — “Not more games, **better games**” |
| **1 정보** | 홈 원페이지 스크롤 + `/games`·`/games/[slug]`·`/privacy`. 네비 3개로 단순화 |
| **2 콘텐츠** | 영문 단일, MGA·RG·파트너·12 originals 카피 반영 |
| **3 상호작용** | 프리로더 → 히어로 입장, 스크롤 연동 파티클, CTA·캐러셀·문의 |
| **4 시각** | 다크 + 민트(#00ffc2), Barlow, 프리미엄 포트폴리오 톤 |
| **5 기술** | Next.js, Lenis, GSAP, WebGL 파티클 — LCP·CLS 고려(이미지 치수·스크롤 고정) |
| **6 운영** | 정적 배포, `site.ts`·`games.ts` 중심 카피 관리 |

**원칙:** 시각·기술만 바꾸지 않음. IA·카피·CTA를 먼저 정하고 디자인은 그 위에 얹음.

---

## 3. 그대로 / 고친다 / 버린다

| 구분 | 항목 |
|------|------|
| **그대로** | BEYOND MORE 카피, B2B 톤, MGA 법적 문구, 게임 썸네일·슬러그, sales/hello 메일 |
| **고친다** | 홈 IA(원페이지), 히어로·Latest games 임팩트, 파트너·Contact 구조, 모바일 가독성 |
| **버린다** | 소비자 카지노 UX, 다국어, About/Contact 독립 페이지(→ 홈 앵커), ricardochance 전용 콘텐츠 |

---

## 4. 첫 화면 3초 규칙

| 요소 | 구현 |
|------|------|
| **누구** | Badge `B2B iGaming Studio · GLI-Ready` + Blitzcrown |
| **무엇** | 12 originals, Crash/Plinko 등 instant-win 한 줄 설명 |
| **증거** | Stats 4개 (12 games, 5 genres, 51,200x, 3 partners) |
| **다음 행동** | Primary `Explore the Portfolio` · Secondary `Talk to the Team` |

Primary CTA는 **하나** — 포트폴리오 탐색. 문의는 secondary·Contact 섹션.

---

## 5. 홈 IA (스크롤 순서)

```
Hero          → 브랜드 + 파티클 번개 + CTA
Intro         → 철학 “Not more games, better games”
Latest games  → 8종 캐러셀 + “Twelve originals, zero clones”
About         → 스튜디오·RG·운영사 4 proofs
Contact       → 파트너 로고 + “Let’s put your lobby ahead” + partners@ / LinkedIn
Footer        → 네비·법적 고지
```

**왜 원페이지?** B2B 방문자는 “한 번에 훑고 문의” 패턴. 깊은 메뉴 트리보다 스토리 한 줄이 전환에 유리.

---

## 6. 디자인·인터랙션 — 왜 이렇게?

| 결정 | 이유 |
|------|------|
| **번개 파티클** | Blitzcrown 시그니처. 스크롤 시 dissolve/morph로 “게임·스튜디오” 내러티브 |
| **프리로더 + 입장** | 프리미엄 스튜디오 인상, 로드 후 히어로에 집중 (스크롤 드리프트 방지 처리) |
| **Latest games 캐러셀** | 정적 그리드보다 포트폴리오 “살아 있음” — 대표 8종 루프 |
| **Contact 2열** | 왼쪽 파티클 / 오른쪽 CTA — 시각과 전환 분리 |
| **투명 Top Dock** | 콘텐츠 가리지 않음, 네비·Partner with Us만 유지 |
| **민트 CTA pill** | B2B에서도 partnership 버튼은 눈에 띄어야 함 — 브랜드 컬러로 강조 |

---

## 7. 피드백 네 칸 (완료 기준)

| 유지 | 변경 | 금지 | 완료 조건 |
|------|------|------|-----------|
| B2B 톤·MGA 푸터 | Contact CTA·파트너 로고 | 소비자 플레이 UI | `/` 로드 후 히어로 고정, `#contact`에서 CTA·파트너 노출 |
| 번개 파티클·프리로더 | Latest games 카피·캐러셀 | 카드 UI 남발 | 모바일 375px에서 Hero CTA·타이틀 가독 |
| Barlow·민트 토큰 | Header Group 5 로고 | ricardochance 사례 텍스트 | `/games` 17종 SSG·썸네일 정상 |

---

## 8. 성능도 디자인 (목표)

| 지표 | 목표 | 대응 |
|------|------|------|
| **LCP** | ≤ 2.5s | 히어로 WebGL·폰트 지연 최소, 정적 프리렌더 |
| **INP** | ≤ 200ms | Lenis·GSAP 분리, 무거운 JS 지연 로드 |
| **CLS** | ≤ 0.1 | 썸네일·로고 `object-contain`/고정 높이, ScrollReveal로 레이아웃 밀림 금지 |

---

## 9. 게이트 요약 (G0→G5)

| Gate | 통과 조건 |
|------|-----------|
| **G0** | B2B Hub 목표 + 영문 단일 + 게임 17종 범위 |
| **G1** | 홈 IA·`/games`·Contact 앵커 확정 |
| **G2** | Hero 카피·Primary CTA `Explore the Portfolio` |
| **G3** | Barlow, brand ramp, spacing 토큰 |
| **G4** | 모바일·데스크톱 프로토타입, 파티클·캐러셀 동작 |
| **G5** | Next.js SSG, 정적 배포 |

---

## 10. 한 줄 설득

> **예쁜 포트폴리오 껍데기가 아니라, 운영사가 3초에 Blitzcrown을 이해하고 포트폴리오를 보고 문의까지 가는 B2B 세일즈 퍼널을 설계했다.**

---

*작성 기준: blitzcrown_web 코드베이스 · 대화 중 확정 카피/UX · 웹 리뉴얼 방법론(층·순서·게이트·네 칸 피드백) 참고*
