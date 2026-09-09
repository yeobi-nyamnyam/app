# Tokens Studio → GitHub 연동 설정 (디자이너용)

`packages/tokens/tokens.json`(DTCG 포맷)을 Figma의 Tokens Studio 플러그인과
연결하는 절차입니다. 이 문서의 값들은 실제 `.github/workflows/tokens-sync.yml`,
`packages/tokens/scripts/build-tokens.ts`가 기대하는 파일 경로/포맷과 맞춰져
있으니 임의로 바꾸지 마세요. 전체 흐름은 `docs/design-tokens-pipeline.md` 참고.

## 0. 사전 준비

- 이 저장소(`yeobi-nyamnyam/app`)에 **write 권한이 있는 GitHub 계정**이 필요합니다.
  (권한이 없으면 Tokens Studio가 브랜치에 push하거나 PR을 열 때 실패합니다.)
- 대상 Figma 파일 편집 권한.

## 1. Tokens Studio 플러그인 설치

Figma 파일 → 상단 메뉴 `Plugins` → `Browse plugins in Community` →
"Tokens Studio for Figma" 검색 후 설치.
(직접 링크: <https://www.figma.com/community/plugin/843461159747178978/tokens-studio-for-figma>)

## 2. GitHub Personal Access Token 발급

1. <https://github.com/settings/tokens> → **Generate new token (classic)**
2. Scope: `repo` 전체 체크 (private 저장소 push/PR 생성에 필요)
3. Note 예: `tokens-studio-yeobi-nyamnyam`
4. Expiration을 설정한 경우, 만료 전에 재발급해서 플러그인 설정을 갱신해야 합니다.
5. 생성된 토큰은 이 화면을 벗어나면 다시 볼 수 없으니 즉시 안전하게 복사해두세요.
   **절대 저장소에 커밋하거나 Slack/이슈 등에 붙여넣지 마세요.**

## 3. Tokens Studio에 DTCG 포맷 활성화 (중요)

Tokens Studio 기본 내보내기 포맷은 `type`/`value` 키를 쓰는 자체 레거시 포맷입니다.
`build-tokens.ts`는 W3C DTCG 표준(`$type`/`$value`)을 기준으로 파싱하므로, 반드시
**Settings → "Enable DTCG (Design Tokens Community Group) format"** 토글을 켜세요.
꺼진 상태로 동기화하면 워크플로우의 파싱 스크립트가 실패합니다.

## 4. GitHub Sync 설정

플러그인 좌측 하단 톱니바퀴(Settings) → **Sync** 탭 → **GitHub** 선택 →
"Add new credentials":

| 항목 | 값 |
| --- | --- |
| Personal Access Token | 2단계에서 발급한 토큰 |
| Repository | `yeobi-nyamnyam/app` |
| Branch | `design-token` (신규 브랜치 — `develop`에 직접 push 금지이므로 반드시 별도 브랜치 지정) |
| File path | `packages/tokens/tokens.json` (경로가 다르면 워크플로우가 변경을 감지하지 못함) |
| Base branch (PR 대상) | `develop` |

저장 후 **"Pull tokens"**를 눌러 현재 저장소에 커밋된 `tokens.json` 값을
Tokens Studio 편집기로 먼저 불러오세요 (기존 값과 어긋난 상태로 덮어쓰는 것을 방지).

## 5. 토큰 세트 구성 — Figma Variables/Styles에서 가져오기

값을 Tokens Studio 편집기에 직접 타이핑하지 말고, **Figma의 실제 Variables/Text
Styles를 가져와서** 쓰세요 (화면에 적용된 값이 곧 소스가 되도록).

1. `Tokens` 탭 하단 **`Styles & Variables`** 드롭다운 → **`Import variables`** →
   나오는 목록에서 **`Import all`** (색상 + spacing/radius/stroke/icon 계열의
   Figma Variable Collection을 전부 가져옵니다)
2. 같은 드롭다운에서 **`Import styles`** → Figma Text Style을 가져옵니다
   (타이포그래피 — 이건 fontFamily/fontWeight/fontSize/lineHeight/letterSpacing이
   이미 스타일별로 합쳐진 합성 토큰이라, Variables만으로는 얻을 수 없는 형태입니다)
3. 왼쪽 세트 목록에 새로 생기는 세트들(`Color Primitive/Light`, `Color Semantic/Light`,
   `Font/Default`, `Size/Default`, `Text Leading/Default`, `Dynamic Type/Small`,
   `Text styles` 등)을 **전부 체크(활성화)** 상태로 두세요. 타이포그래피 합성
   토큰은 다른 세트의 값을 alias(`{Group.Path}`)로 참조하기 때문에, 일부만
   체크 해제하면 참조가 끊겨 토큰에 빨간 경고가 뜹니다.
4. 예전에 손으로 만든 레거시 세트(`colors`, `typography`, `spacing`, `radius`,
   `stroke`, `icon`)가 남아있다면 삭제하세요 — 이제 안 씁니다.
5. Sync 방식은 **Single file**로 (여러 세트가 `tokens.json` 하나에 합쳐짐).

`build-tokens.ts`는 이 중 `Color Primitive/Light`, `Color Semantic/Light`,
`Size/Default`, `Text styles` 4개만 읽습니다. 나머지(`Font/Default` 등)는 alias
해석에 필요 없어 무시되지만, **Tokens Studio 편집기 자체의 참조가 깨지는 걸
막으려면 체크 해제하지 마세요.**

## 6. 값 수정 & Push

1. Tokens Studio 편집기(또는 연결해둔 Figma Variables)에서 값 수정
2. **"Push to GitHub Branch"** → 커밋 메시지 입력 → `design-token` 브랜치로 push
3. "Create Pull Request" 옵션을 켜두면 `develop`을 base로 PR이 자동 생성됩니다
   (안 켜져 있다면 GitHub에서 수동으로 PR을 열어야 합니다)

## 7. 이후 흐름 (자동화)

1. 개발자가 위 PR(원본 `tokens.json` diff)을 리뷰 & 머지
2. `.github/workflows/tokens-sync.yml`이 `develop` push를 감지해
   `packages/tokens/src/tokens.ts`를 재생성하고, lint/type-check 통과 시
   `bot/tokens-sync` 브랜치로 후속 PR을 자동으로 엽니다
3. 개발자가 생성물 PR을 리뷰 & 머지

## Figma 쪽 이름이 바뀌면

`build-tokens.ts`는 Figma 라벨(`Border 05`, `Radius 4-6`, `XLarge` 등)을
컴포넌트 코드가 쓰는 키(`stroke.hairline`, `radius['4.6']`, `icon.xlarge`)로
매핑합니다. Stroke 그룹처럼 이름 규칙이 기계적으로 변환되지 않는 곳은
`STROKE_KEY_MAP`에 명시적으로 등록돼 있어서, Figma에서 새 stroke 토큰을
추가하거나 이름을 바꾸면 스크립트가 (엉뚱한 값으로 조용히 매핑되는 대신)
에러로 바로 실패합니다 — 그러면 `packages/tokens/scripts/build-tokens.ts`의
해당 매핑 테이블에 새 이름을 추가해주면 됩니다.
