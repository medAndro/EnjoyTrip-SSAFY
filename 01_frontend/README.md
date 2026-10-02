# EnjoyTrip — 2인 · 3시간 프런트엔드 실습

HTML·CSS·순수 JavaScript로 관광지 조회, 회원 기능, 간단한 여행 계획, Hotplace 등록을 연결하는 프로젝트입니다. 자체 서버 없이 localStorage/sessionStorage를 가상 백엔드로 사용합니다.

## 현재 상태

**현재는 7개 정적 화면 레퍼런스와 구현 TODO가 있는 골격입니다. 검색·회원·일정·Hotplace 기능은 아직 구현되지 않았습니다.** 페이지 이동과 브라우저 기본 폼 검증만 동작합니다. 실제 기능은 두 사람이 작성합니다.

- AI 준비 완료: 페이지별 샘플 HTML/CSS, 로컬 SVG 아이콘·일러스트, 21개 가상 관광지 JSON, 파일/데이터 계약, 지도 연결 및 사진 축소 helper.
- 두 사람이 작성: 이벤트, 입력 검증, DOM 갱신, fetch, 배열 처리, 회원/세션, Storage CRUD.
- 관광지는 학습용 가상 데이터입니다. 실제 관광 API 연동이나 실제 관광지 정보로 표시하지 않습니다.

## 시작하기

1. VS Code에서 저장소를 열고 Live Server로 `01_frontend/index.html`을 실행합니다.
2. [3시간 역할 분담표](docs/TEAM_ROLES.md)를 읽고 A/B를 정합니다.
3. A는 `js/data.js`, B는 `js/storage.js`부터 작성합니다.
4. 실제 submit 리스너에 `preventDefault()`를 작성한 뒤 폼의 `data-preview-form` 속성을 제거합니다. 버튼의 `disabled`는 동작 구현 후 제거합니다.

HTML 더블클릭 대신 HTTP 서버를 사용합니다. npm 설치와 빌드는 없습니다. 두 사람의 PC에 있는 Storage는 공유되지 않으며, 한 PC에서는 같은 서버 주소/포트를 사용해야 데이터가 유지됩니다.

## 문서

- [범위·교안 분석·완료 기준](docs/PROJECT_SCOPE.md)
- [담당 파일·180분 일정·첫 작업](docs/TEAM_ROLES.md)
- [데이터 형식·함수 연결 약속](docs/DATA_CONTRACT.md)

## 화면

| 파일 | 용도 | 담당 |
| --- | --- | --- |
| `index.html` | 메인 레퍼런스 | 공통, 변경 최소화 |
| `attractions.html` | 검색·목록·상세·지도 | A |
| `plans.html` | 회원당 1개 여행 계획 | A |
| `signup.html` | 회원가입 | B |
| `login.html` | 로그인·데모 비밀번호 재설정 | B |
| `mypage.html` | 회원 조회·수정·탈퇴 | B |
| `hotplaces.html` | 사진·위치·방문 기록 | B |

CSS는 `css/`, 학습 TODO는 `js/`, 데이터는 `data/`, 제출 캡처는 `screenshots/`에 있습니다. 공통 CSS와 메인 레이아웃은 그대로 활용하고 기능 화면에서 작은 스타일 개선을 직접 해 봅니다.

## 지도 및 사진 보조

지도 helper는 키를 인자로 받아 SDK를 준비하고 마커를 관리합니다. `js/keys.example.js`를 복사해 `js/keys.js`에 자신의 키를 설정하면 됩니다. 실제 키 파일은 ignore 대상입니다. 키가 없으면 지도 기능을 완료했다고 기록하지 않습니다. 키의 허용 도메인 설정은 [카카오 공식 가이드](https://apis.map.kakao.com/web/guide/)를 참고합니다.

`preparePhoto(file)`은 작은 JPEG data URL을 반환합니다. 파일 선택 이벤트·미리보기·저장은 B가 연결합니다. 회원에는 가상의 이메일과 데모 비밀번호만 사용합니다.

## 명세와 3시간 범위의 차이

3시간 안에는 로컬 JSON으로 F101~F103의 조회 흐름을 연습하고 F107~F108, 단순 F104~F105를 연결합니다. 실제 관광 API, 일정 드래그앤드롭, 주소 검색/지도 클릭으로 위치 선택은 후속 작업입니다. PDF 명세 전체를 완료했다고 보고하지 않습니다.

PDF에는 Bootstrap 활용이 명시되어 있으나 현재 레퍼런스는 사용자 요청에 따라 직접 CSS로 작성했습니다. Bootstrap이 제출 조건이면 추가 적용이 필요합니다. 심화·Spring·Vue·DB는 현재 범위에서 제외합니다.

## 제출 기록

- [ ] 두 사람 실명 및 실제 기여 내용
- [ ] 직접 확인한 기능과 남은 TODO
- [ ] 완성된 실행 화면 캡처 (레퍼런스 화면과 구분)
- [ ] 샘플/API/지도 모드와 Bootstrap 반영 여부
- [ ] AI 요청 내용 / 학습한 점 / 직접 적용한 부분
