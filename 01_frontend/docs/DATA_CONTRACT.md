> 최종 통합: 회원 키는 wonandonly의 members를 유지합니다. 일정 항목에는 API 장애 시에도 복원할 수 있도록 관광지 정보 사본 place를 함께 저장합니다. 공통 JSON 함수는 저장소 지정과 기존 두 인자 호출을 모두 지원합니다. 관광지 기본 조회는 실제 TourAPI이며 자세한 실행 계약은 [README](../README.md)를 확인하세요.

# 최소 데이터 계약

구현을 쉽게 하기 위한 합의안이다. 아래 함수는 최종 통합에서 구현되었으며 상세 실행 구조는 README를 따른다. 일반 JS 객체/배열로 처리하고 클래스·서비스/DAO 계층을 만들지 않는다.

## 저장 키 (config.js)

| 저장소 | 키 | 기본값 |
| --- | --- | --- |
| localStorage | enjoytrip:v1:members | [] |
| localStorage | enjoytrip:v1:plans | [] |
| localStorage | enjoytrip:v1:hotplaces | [] |
| sessionStorage | enjoytrip:v1:session | null |
| sessionStorage | enjoytrip:v1:plan-draft | [] (관광지 ID 배열) |

localStorage.clear()로 전체를 지우지 않는다. 자신의 기능 키 또는 현재 회원의 항목만 바꾼다. 초안은 회원 전환/로그아웃/탈퇴 시 제거한다.

## 공통 함수 — B가 먼저 작성

```text
readJSON(storage, key, fallback)
  getItem → 값 없으면 fallback → JSON.parse → 반환
  손상된 JSON은 오류로 알리기
writeJSON(storage, key, value)
  JSON.stringify → setItem (실패는 호출자에게 알리기)
getCurrentUser()
  세션 userId → users 배열에서 찾기
  없으면 null, 있으면 { id, nickname, email }
setSession(userId)
  { userId } 저장, 이전 계획 초안 정리
clearSession()
  session과 planDraft 키만 삭제
```

다른 화면에서 회원 저장 배열을 직접 수정하지 않는다. 필요 함수 구현 전에는 import하지 않는다.

## 관광지 — JSON 그대로 활용 / A

```js
{
  id: "sample-1-12", name: "서울 관광지 샘플",
  region: "서울", areaCode: "1", contentTypeId: "12",
  address: "서울 · 학습용 가상 주소",
  lat: 37.5665, lng: 126.978,
  description: "학습용 가상 데이터", image: "로컬 이미지 경로",
  source: "AI 학습용 샘플", isSample: true
}
```

`loadAttractions()`는 Promise<배열>을 반환한다. 직접 fetch/response.ok/json을 작성한다. id/코드는 문자열, 위도/경도는 숫자다. region과 contentTypeId를 filter 조건으로 사용한다. API 실제 연동 시 이 공통 형식으로 변환한다.

## 회원

```js
{ id: "demo-a", nickname: "여행자 A", email: "demo-a@example.com", password: "샘플 전용 값" }
// sessionStorage: { userId: "demo-a" }
```

가입 때 ID 중복과 비밀번호 확인을 검사한다. 수정은 닉네임/샘플 이메일만 한다. 데모 재설정은 ID+샘플 이메일 대조 후 새 값을 저장한다. 실제 비밀번호/민감 정보를 사용하지 않는 모의 인증이다. 메뉴나 세션에 password를 복사하지 않는다.

## 여행 계획 — 회원당 1개 / A

```js
{
  ownerId: "demo-a", title: "주말 여행",
  startDate: "2026-10-03", endDate: "2026-10-04", memo: "전체 메모",
  items: [
    { attractionId: "sample-1-12", visitDate: "2026-10-03", visitTime: "10:00", cost: 10000, memo: "방문 메모" }
  ]
}
```

같은 관광지는 계획 안에 중복 추가하지 않는다. 최대 5개 방문, 순서는 items 배열 순서다. cost는 숫자로 변환해 합산한다. 방문일은 기간 안에 있어야 한다. 저장은 현재 ownerId 항목이 있으면 덮어쓰고 없으면 추가한다. 다른 회원 항목은 보존한다. 별도 계획 ID/여러 여행 목록/정렬 order 필드는 필요 없다.

검색 상세에서 `planDraft`에 ID 배열을 저장한다. 계획 화면에서는 기존 저장 계획에 초안의 새 ID만 추가한 뒤 초안을 지운다. 기존 계획의 날짜/메모를 덮어쓰지 않는다.

## Hotplace — 회원당 최대 3개 / B

```js
{
  id: "등록 고유 문자열", ownerId: "demo-a",
  name: "내 장소", address: "장소 주소", contentTypeId: "12",
  visitedDate: "2026-10-02", description: "장소 소개",
  lat: 37.5665, lng: 126.978, photoDataUrl: "data:image/jpeg;base64,..."
}
```

고유 문자열은 현재 시간 등을 이용해 생성한다. 저장할 사진은 preparePhoto 반환값만 사용한다. 파일당 5MB 이하 입력을 받아 최대 800px JPEG로 축소하며 반환 길이 제한은 400,000자다. 이 제한 안에서도 Storage 예외는 발생할 수 있으므로 실패를 알려야 한다.

위도/경도는 빈 문자열을 먼저 검사하고 숫자로 변환한다. 위도 -90~90, 경도 -180~180을 확인한다. 목록은 현재 ownerId로 필터한다. 사진/설명은 사용자 입력이므로 textContent/value/src에 넣는다.

## 지도/사진 helper — AI 준비 완료

```text
createMap(container, { key }) → Promise<컨트롤러 | null>
  키가 없거나 SDK가 실패하면 지도 영역에 이유 표시, null 반환
controller.updatePlaces([{ name, lat, lng }, ...])
  이전 마커 제거 → 유효 좌표 마커 → 전체 범위 조절
controller.focusPlace(place) / controller.clear()
addressToCoordinate(address) → Promise<{ lat, lng }> (지도 준비 후; 후속 확장)
preparePhoto(file) → Promise<string> (축소 JPEG data URL)
```

map.js에서 createMap/addressToCoordinate를 import한다. 지도마다 컨트롤러를 하나 만들고 존재할 때만 호출한다. 사진 helper는 helpers/image.js에서 import한다. helper 코드는 자동 초기화되지 않으며 페이지 담당자가 호출해야 한다.

지도 SDK와 키/도메인은 [공식 가이드](https://apis.map.kakao.com/web/guide/) 기준이다. 현재 실제 발급 키가 없어 실 지도 네트워크 성공은 확인하지 않았다. 목록/저장은 지도 유무와 별개로 구현한다.

## 레퍼런스 제거와 초기화

실제 렌더링할 때 정적 샘플 카드는 지운다. 계획의 `data-sample` 항목도 지우고 items로 다시 만든다. 폼에 submit 리스너를 작성하고 preventDefault를 적용한 뒤 data-preview-form을 제거한다. 관련 disabled도 그때 제거한다.

회원 코드는 body.dataset.page를 보고 signup/login/mypage를 구분한다. 없는 DOM 요소를 읽지 않는다. 각 페이지는 자신의 js만 불러오고 common.js는 메뉴 상태만 담당한다.
