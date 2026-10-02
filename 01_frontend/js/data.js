import { ATTRACTIONS_URL } from "./config.js";
import { TOUR_API_KEY } from "./settings.js";
import { readArray, writeJSON } from "./storage.js";
const BASE = "https://apis.data.go.kr/B551011/KorService2/";
const CACHE_KEY = "enjoytrip:v1:attractions";
export async function tourRequest(endpoint, params = {}) {
  if (!TOUR_API_KEY) throw new Error("keys.js에 한국관광공사 서비스 키를 설정해주세요.");
  let key = TOUR_API_KEY;
  try { key = decodeURIComponent(key); } catch { /* 일반 키 그대로 사용 */ }
  const url = new URL(endpoint, BASE);
  url.search = new URLSearchParams({ serviceKey: key, MobileOS: "ETC", MobileApp: "EnjoyTrip", _type: "json", numOfRows: "24", pageNo: "1", ...params });
  let response;
  try { response = await fetch(url, { signal: AbortSignal.timeout(20000) }); }
  catch { throw new Error("관광 API에 연결하지 못했습니다. 네트워크·키·이용 승인을 확인해주세요."); }
  if (!response.ok) throw new Error(`관광 API 응답 오류 (${response.status})`);
  let data;
  try { data = await response.json(); } catch { throw new Error("관광 API가 JSON을 반환하지 않았습니다. 서비스 키·이용 승인을 확인해주세요."); }
  const { header, body } = data.response || {};
  if (!header || !["0000", "00"].includes(String(header.resultCode))) throw new Error(`관광 API 처리 실패 (코드 ${header?.resultCode || "없음"})`);
  const raw = body?.items?.item || [];
  return { items: Array.isArray(raw) ? raw : [raw], total: Number(body?.totalCount || 0) };
}
function plainText(value) {
  return new DOMParser().parseFromString(String(value || ""), "text/html").body.textContent.trim();
}
function normalize(item) {
  return { id: String(item.contentid), name: item.title || "이름 없음", region: "", areaCode: String(item.areacode || ""), contentTypeId: String(item.contenttypeid || ""), address: [item.addr1, item.addr2].filter(Boolean).join(" "), lat: item.mapy ? Number(item.mapy) : null, lng: item.mapx ? Number(item.mapx) : null, description: plainText(item.overview) || "상세 소개가 제공되지 않는 장소입니다.", image: item.firstimage || item.firstimage2 || "", source: "한국관광공사 TourAPI", isSample: false };
}
export function rememberPlace(place) {
  const cached = readArray(localStorage, CACHE_KEY).filter(item => item.id !== place.id);
  cached.push(place); writeJSON(localStorage, CACHE_KEY, cached.slice(-200));
}
export async function getAttraction(id) {
  const cached = readArray(localStorage, CACHE_KEY).find(item => item.id === id);
  if (cached) return cached;
  if (id.startsWith("sample-")) return (await loadSampleAttractions()).find(item => item.id === id);
  const result = await tourRequest("detailCommon2", { contentId: id });
  if (!result.items.length) throw new Error("해당 관광지를 더 이상 조회할 수 없습니다.");
  return normalize(result.items[0]);
}
export async function loadRegions() { return (await tourRequest("areaCode2", { numOfRows: "30" })).items; }
export async function searchAttractions({ areaCode = "", contentTypeId = "", keyword = "", page = 1 } = {}) {
  const params = { pageNo: String(page), arrange: "A" };
  if (areaCode) params.areaCode = areaCode;
  if (contentTypeId) params.contentTypeId = contentTypeId;
  if (keyword.trim()) params.keyword = keyword.trim();
  const result = await tourRequest(keyword.trim() ? "searchKeyword2" : "areaBasedList2", params);
  return { places: result.items.map(normalize), total: result.total };
}
export async function loadAttractions(options = {}) { return (await searchAttractions(options)).places; }
export async function loadDetail(place) {
  if (place.isSample) return place;
  const result = await tourRequest("detailCommon2", { contentId: place.id });
  return result.items.length ? { ...place, ...normalize(result.items[0]) } : place;
}
// medAndro의 JSON fetch 학습 흐름은 명시적 샘플 모드로 유지합니다.
export async function loadSampleAttractions() {
  const response = await fetch(ATTRACTIONS_URL);
  if (!response.ok) throw new Error("샘플 데이터를 읽지 못했습니다.");
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("데이터가 배열 형식이 아닙니다.");
  return data;
}
