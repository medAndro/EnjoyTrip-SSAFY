// 담당 B — 공통 JSON 저장/복원, A도 같은 함수를 사용합니다.
// readJSON(storage, key, fallback) → getItem → 없으면 fallback → JSON.parse.
// writeJSON(storage, key, value) → JSON.stringify → setItem.
// 잘못된 JSON/용량 초과를 조용히 덮지 말고 명확한 오류로 전달합니다.
// 회원/일정/Hotplace의 필터·CRUD 규칙은 각 담당 기능 파일에 둡니다.
// localStorage.clear()로 다른 기능/프로젝트의 데이터까지 지우지 않습니다.
//-> 삭제가 필요하면 localStorage.removeItem("키"); 로 지우기. 

// JSON 데이터를 localStorage에 저장하는 함수
export function writeJSON(key, value) {
  try{
  const json = JSON.stringify(value);
  localStorage.setItem(key, json);
  }catch(error){
    throw new Error(`JSON 저장 실패: ${key}`, {cause: error});
  }
}

// localStorage에서 JSON 데이터를 읽는 함수
export function readJSON(key, defaultValue) {
  const json = localStorage.getItem(key);

  if (json === null) {
    return defaultValue;
  }

  try {
    return JSON.parse(json);
  } catch (error) {
    throw new Error(`JSON 파싱 실패: ${key}`, { cause: error });
  }
}