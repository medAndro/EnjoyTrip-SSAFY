// AI 제공: 파일 간 합의가 필요한 상수만 정의합니다. CRUD와 fetch는 직접 구현합니다.
export const STORAGE_KEYS = Object.freeze({
  users: "enjoytrip:v1:users",
  session: "enjoytrip:v1:session",
  plans: "enjoytrip:v1:plans",
  hotplaces: "enjoytrip:v1:hotplaces",
  planDraft: "enjoytrip:v1:plan-draft",
});
export const ATTRACTIONS_URL = "./data/attractions.json";
export const CONTENT_TYPES = Object.freeze([
  { code: "12", label: "관광지" },
  { code: "32", label: "숙박" },
  { code: "39", label: "음식점" },
  { code: "14", label: "문화시설" },
  { code: "15", label: "공연·행사" },
  { code: "25", label: "여행코스" },
  { code: "38", label: "쇼핑" },
]);
