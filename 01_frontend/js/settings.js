// 키 파일이 없으면 각 화면에서 설정 안내를 제공합니다.
const keys = await import("./keys.js").catch(() => ({}));
export const KAKAO_MAP_KEY = keys.KAKAO_MAP_KEY || "";
export const TOUR_API_KEY = keys.TOUR_API_KEY || "";
