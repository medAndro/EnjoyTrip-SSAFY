// medAndro의 목록·필터·상세·지도 흐름을 실제 API와 통합했습니다.
import { loadSampleAttractions, loadRegions, searchAttractions, loadDetail, rememberPlace } from "./data.js";
import { CONTENT_TYPES, STORAGE_KEYS } from "./config.js";
import { createMap } from "./map.js";
import { KAKAO_MAP_KEY } from "./settings.js";
import { getCurrentUser } from "./session.js";
import { readArray, writeJSON } from "./storage.js";
import { status, element, safeImage } from "./ui.js";
let mapController, selectedAttr, displayed = [], page = 1, total = 0, revision = 0, detailRevision = 0;
const form = document.querySelector("#search-form"), list = document.querySelector("#place-list"), dialog = document.querySelector("#detail-dialog"), message = document.querySelector("#search-status"), mode = document.querySelector("#data-mode"), region = document.querySelector("#region");
const regionLabels = new Map();
init();
async function init() {
  bindEvents();
  createMap(document.querySelector("#map"), { key: KAKAO_MAP_KEY }).then(controller => { mapController = controller; mapController?.updatePlaces(displayed); });
  try {
    const regions = await loadRegions(); region.replaceChildren(new Option("전체 지역", ""));
    regions.forEach(item => { regionLabels.set(String(item.code), item.name); region.add(new Option(item.name, item.code)); });
  } catch (error) { status(message, error.message, true); }
  await search();
}
async function search() {
  const current = ++revision; status(message, "관광지를 불러오는 중입니다…"); form.setAttribute("aria-busy", "true");
  try {
    const type = form.querySelector("#content-type").value, keyword = form.querySelector("#keyword").value.trim();
    let places;
    if (mode.value === "sample") {
      const all = await loadSampleAttractions();
      places = all.filter(item => (!region.value || item.areaCode === region.value) && (!type || item.contentTypeId === type) && (!keyword || item.name.includes(keyword)));
      if (current !== revision) return; total = places.length;
    } else {
      const result = await searchAttractions({ areaCode: region.value, contentTypeId: type, keyword, page });
      if (current !== revision) return; places = result.places; total = result.total;
    }
    renderAttractions(places);
    status(message, mode.value === "sample" ? "학습용 가상 데이터입니다. 실제 관광 정보가 아닙니다." : "한국관광공사 실시간 조회 결과입니다.");
  } catch (error) { if (current !== revision) return; total = 0; renderAttractions([]); status(message, error.message, true); }
  finally { if (current === revision) form.removeAttribute("aria-busy"); }
}
function renderAttractions(places) {
  displayed = places; list.replaceChildren();
  if (!places.length) list.append(element("li", "검색 결과가 없습니다.", "empty-state"));
  places.forEach(place => {
    const card = element("li", "", "place-card"); card.dataset.placeId = place.id;
    const image = document.createElement("img"); image.src = safeImage(place.image); image.alt = place.name; image.loading = "lazy"; image.className = "place-photo";
    card.append(image, element("span", CONTENT_TYPES.find(item => item.code === place.contentTypeId)?.label || "여행지", "badge"), element("h3", place.name), element("p", place.address || "주소 정보 없음", "muted"));
    const button = element("button", "상세 보기", "secondary"); button.type = "button"; button.dataset.action = "detail"; card.append(button); list.append(card);
  });
  document.querySelector("#result-count").textContent = `총 ${total.toLocaleString()}개 · 현재 ${places.length}개`;
  document.querySelector("#page-number").textContent = `${page} / ${Math.max(1, Math.ceil(total / 24))} 페이지`;
  document.querySelector("#previous-page").disabled = page <= 1 || mode.value === "sample";
  document.querySelector("#next-page").disabled = page * 24 >= total || mode.value === "sample";
  mapController?.updatePlaces(places);
}
function bindEvents() {
  form.addEventListener("submit", event => { event.preventDefault(); page = 1; search(); });
  mode.addEventListener("change", () => {
    region.replaceChildren(new Option("전체 지역", ""));
    const labels = mode.value === "sample" ? new Map([["1", "서울"], ["6", "부산"], ["39", "제주"]]) : regionLabels;
    labels.forEach((label, code) => region.add(new Option(label, code))); page = 1; search();
  });
  document.querySelector("#previous-page").addEventListener("click", () => { page--; search(); });
  document.querySelector("#next-page").addEventListener("click", () => { page++; search(); });
  list.addEventListener("click", async event => {
    const button = event.target.closest('[data-action="detail"]'); if (!button) return;
    const place = displayed.find(item => item.id === button.closest(".place-card").dataset.placeId); if (!place) return;
    const token = ++detailRevision; selectedAttr = place; fillDetail(place); status(document.querySelector("#detail-status"), "상세 정보를 불러오는 중…");
    if (!dialog.open) dialog.showModal();
    try {
      const detail = await loadDetail(place); if (token !== detailRevision || !dialog.open) return;
      selectedAttr = detail; fillDetail(detail); status(document.querySelector("#detail-status"), "");
    } catch (error) { if (token === detailRevision) status(document.querySelector("#detail-status"), error.message, true); }
    mapController?.focusPlace(place);
  });
  document.querySelector("#close-detail").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { detailRevision++; });
  document.querySelector("#add-to-plan").addEventListener("click", () => {
    try {
      if (!selectedAttr) return;
      if (!getCurrentUser()) throw new Error("로그인 후 이용해주세요.");
      const ids = readArray(sessionStorage, STORAGE_KEYS.planDraft);
      if (ids.includes(selectedAttr.id)) throw new Error("이미 초안에 추가한 관광지입니다.");
      if (ids.length >= 5) throw new Error("초안은 최대 5개까지 추가할 수 있습니다.");
      rememberPlace(selectedAttr); ids.push(selectedAttr.id); writeJSON(sessionStorage, STORAGE_KEYS.planDraft, ids);
      status(document.querySelector("#detail-status"), "초안에 추가했습니다. 여행 계획 화면에서 일정을 편집하세요.");
    } catch (error) { status(document.querySelector("#detail-status"), error.message, true); }
  });
}
function fillDetail(place) {
  document.querySelector("#detail-title").textContent = place.name;
  document.querySelector("#detail-description").textContent = place.description;
  document.querySelector("#detail-address").textContent = place.address;
  document.querySelector("#detail-source").textContent = place.source;
  const image = document.querySelector("#detail-image"); image.src = safeImage(place.image); image.alt = place.name;
}
