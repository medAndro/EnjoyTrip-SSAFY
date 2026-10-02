// wonandonly의 JSON 함수에 저장소 인자를 추가. 기존 두 인자 호출도 지원합니다.
export function readJSON(storage, key, fallback) {
  if (typeof storage === "string") [storage, key, fallback] = [localStorage, storage, key];
  try {
    const json = storage.getItem(key);
    return json === null ? fallback : JSON.parse(json);
  } catch (cause) { throw new Error("저장된 데이터를 읽지 못했습니다. 브라우저 저장소를 확인해주세요.", { cause }); }
}
export function writeJSON(storage, key, value) {
  if (typeof storage === "string") [storage, key, value] = [localStorage, storage, key];
  try { storage.setItem(key, JSON.stringify(value)); }
  catch (cause) { throw new Error("저장에 실패했습니다. 저장 공간 또는 브라우저 설정을 확인해주세요.", { cause }); }
}
export function readArray(storage, key) {
  const value = readJSON(storage, key, []);
  if (!Array.isArray(value)) throw new Error("저장된 목록 형식이 올바르지 않습니다.");
  return value;
}
