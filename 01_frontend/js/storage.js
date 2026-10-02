// 담당 B — 공통 JSON 저장/복원, A도 같은 함수를 사용합니다.
// readJSON(storage, key, fallback) → getItem → 없으면 fallback → JSON.parse.
// writeJSON(storage, key, value) → JSON.stringify → setItem.
// 잘못된 JSON/용량 초과를 조용히 덮지 말고 명확한 오류로 전달합니다.
// 회원/일정/Hotplace의 필터·CRUD 규칙은 각 담당 기능 파일에 둡니다.
// localStorage.clear()로 다른 기능/프로젝트의 데이터까지 지우지 않습니다.
