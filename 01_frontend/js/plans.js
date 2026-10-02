// medAndro의 중복 병합·목록 표시를 기반으로 AI가 편집·저장·복원·드래그앤드롭을 완성했습니다.
import { getAttraction } from "./data.js";
import { readArray, writeJSON } from "./storage.js";
import { getCurrentUser } from "./session.js";
import { STORAGE_KEYS } from "./config.js";
import { createMap } from "./map.js";
import { KAKAO_MAP_KEY } from "./settings.js";
import { element, status } from "./ui.js";
const form = document.querySelector("#plan-form"), list = document.querySelector("#schedule-list"), message = form.querySelector('[role="status"]');
let user, plan, controller, draggedId;
const places = new Map();
init();
async function init() {
  list.replaceChildren();
  try {
    user = getCurrentUser();
    if (!user) { form.querySelectorAll("input, textarea, button").forEach(node => { node.disabled = true; }); status(message, "로그인 후 여행 계획을 이용해주세요.", true); return; }
    const saved = readArray(localStorage, STORAGE_KEYS.plans).find(item => item.ownerId === user.id);
    plan = saved || { ownerId: user.id, title: "", startDate: "", endDate: "", memo: "", items: [] };
    if (!Array.isArray(plan.items)) throw new Error("일정 데이터 형식이 올바르지 않습니다.");
    for (const item of plan.items) { const place = item.place || await getAttraction(item.attractionId); if (place) places.set(item.attractionId, place); }
    const draft = readArray(sessionStorage, STORAGE_KEYS.planDraft), remaining = [];
    let added = 0;
    for (const id of draft) {
      if (plan.items.some(item => item.attractionId === id)) continue;
      if (plan.items.length >= 5) { remaining.push(id); continue; }
      const place = await getAttraction(id); if (!place) throw new Error("초안 관광지를 찾지 못했습니다.");
      places.set(id, place); plan.items.push({ attractionId: id, visitDate: "", visitTime: "", cost: 0, memo: "", place }); added++;
    }
    if (draft.length) {
      // 먼저 회원 계획을 저장한 뒤 초안을 소비합니다. 실패하면 초안은 남습니다.
      persist();
      if (remaining.length) writeJSON(sessionStorage, STORAGE_KEYS.planDraft, remaining);
      else sessionStorage.removeItem(STORAGE_KEYS.planDraft);
    }
    setForm(); bindEvents(); render();
    status(message, remaining.length ? "일정은 최대 5개입니다. 미반영 관광지는 초안에 남겨두었습니다." : added ? `${added}개 관광지를 추가했습니다. 날짜·경비를 입력하고 저장하세요.` : "일정을 편집한 뒤 여행 저장을 눌러주세요.");
    controller = await createMap(document.querySelector("#plan-map"), { key: KAKAO_MAP_KEY }); renderMap();
  } catch (error) { status(message, error.message, true); }
}
function persist() {
  if (getCurrentUser()?.id !== user.id) throw new Error("로그인 상태가 변경되었습니다. 다시 로그인해주세요.");
  const plans = readArray(localStorage, STORAGE_KEYS.plans);
  const next = plans.filter(item => item.ownerId !== user.id); next.push(plan); writeJSON(localStorage, STORAGE_KEYS.plans, next);
}
function setForm() {
  for (const [id, key] of [["plan-title", "title"], ["start-date", "startDate"], ["end-date", "endDate"], ["plan-memo", "memo"]]) form.querySelector(`#${id}`).value = plan[key] || "";
}
function readForm() {
  plan.title = form.querySelector("#plan-title").value.trim(); plan.startDate = form.querySelector("#start-date").value; plan.endDate = form.querySelector("#end-date").value; plan.memo = form.querySelector("#plan-memo").value.trim();
}
function validate() {
  if (!plan.title || !plan.startDate || !plan.endDate) throw new Error("여행 제목과 기간을 입력해주세요.");
  if (plan.startDate > plan.endDate) throw new Error("시작일은 종료일보다 늦을 수 없습니다.");
  if (!plan.items.length) throw new Error("관광지를 하나 이상 추가해주세요.");
  for (const item of plan.items) {
    if (!item.visitDate || item.visitDate < plan.startDate || item.visitDate > plan.endDate) throw new Error("모든 방문일을 여행 기간 안으로 입력해주세요.");
    if (!Number.isFinite(item.cost) || item.cost < 0) throw new Error("경비는 0 이상의 숫자로 입력해주세요.");
  }
}
function render() {
  list.replaceChildren();
  if (!plan.items.length) list.append(element("li", "여행지 탐색에서 관광지를 추가하세요.", "empty-state"));
  plan.items.forEach((item, index) => {
    const card = element("li", "", "schedule-item"); card.dataset.id = item.attractionId;
    const handle = element("span", `${index + 1}번째 방문 · 끌어서 순서 변경`, "badge drag-handle");
    handle.draggable = true; handle.title = "이 영역을 다른 방문의 순서 표시로 끌어 순서를 변경하세요.";
    card.append(handle, element("h3", places.get(item.attractionId)?.name || "관광지"));
    const fields = element("div", "", "form-grid");
    for (const [key, label, type] of [["visitDate", "방문일", "date"], ["visitTime", "방문 시간", "time"], ["cost", "예상 경비 (원)", "number"], ["memo", "방문 메모", "text"]]) {
      const field = element("div", "", "field"), input = document.createElement("input"), labelNode = element("label", label);
      input.id = `${key}-${index}`; labelNode.htmlFor = input.id; input.type = type; input.value = item[key]; input.dataset.field = key;
      if (key === "cost") { input.min = "0"; input.step = "1"; } if (key === "memo") input.maxLength = 200;
      field.append(labelNode, input); fields.append(field);
    }
    card.append(fields); const actions = element("div", "", "actions section");
    for (const [action, label] of [["up", "위로"], ["down", "아래로"], ["remove", "제외"]]) {
      const button = element("button", label, "secondary"); button.type = "button"; button.dataset.action = action;
      button.disabled = action === "up" && index === 0 || action === "down" && index === plan.items.length - 1;
      actions.append(button);
    }
    card.append(actions); list.append(card);
  });
  updateTotal(); renderMap();
  document.querySelector("#delete-plan").disabled = false;
  document.querySelector("#saved-plan-list").replaceChildren(element("li", plan.title || "편집 중인 여행", "place-card"));
}
function updateTotal() { document.querySelector("#total-cost").textContent = `${plan.items.reduce((sum, item) => sum + (Number.isFinite(item.cost) ? item.cost : 0), 0).toLocaleString()}원`; }
function renderMap() {
  const route = plan.items.map(item => places.get(item.attractionId)).filter(Boolean);
  controller?.updatePlaces(route); controller?.drawRoute(route);
}
function move(from, to) { if (from < 0 || to < 0 || to >= plan.items.length) return; const [item] = plan.items.splice(from, 1); plan.items.splice(to, 0, item); render(); }
function bindEvents() {
  form.addEventListener("submit", event => { event.preventDefault(); try { readForm(); validate(); persist(); render(); status(message, "여행 계획을 저장했습니다."); } catch (error) { status(message, error.message, true); } });
  list.addEventListener("input", event => {
    const input = event.target.closest('[data-field]'); if (!input) return;
    const item = plan.items.find(item => item.attractionId === input.closest('[data-id]').dataset.id);
    item[input.dataset.field] = input.dataset.field === "cost" ? (input.value === "" ? NaN : Number(input.value)) : input.value; updateTotal();
  });
  list.addEventListener("click", event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const index = plan.items.findIndex(item => item.attractionId === button.closest('[data-id]').dataset.id);
    if (button.dataset.action === "remove") { plan.items.splice(index, 1); render(); }
    else move(index, index + (button.dataset.action === "up" ? -1 : 1));
  });
  list.addEventListener("dragstart", event => { const card = event.target.closest('[data-id]'); if (!card || event.target.matches("input")) { event.preventDefault(); return; } draggedId = card.dataset.id; event.dataTransfer.setData("text/plain", draggedId); });
  list.addEventListener("dragover", event => { if (event.target.closest('[data-id]')) event.preventDefault(); });
  list.addEventListener("drop", event => { event.preventDefault(); const target = event.target.closest('[data-id]'); if (target && draggedId) move(plan.items.findIndex(item => item.attractionId === draggedId), plan.items.findIndex(item => item.attractionId === target.dataset.id)); draggedId = null; });
  document.querySelector("#delete-plan").addEventListener("click", () => {
    if (!confirm("현재 회원의 여행 계획을 삭제할까요?")) return;
    try { if (getCurrentUser()?.id !== user.id) throw new Error("로그인 상태를 확인해주세요."); writeJSON(localStorage, STORAGE_KEYS.plans, readArray(localStorage, STORAGE_KEYS.plans).filter(item => item.ownerId !== user.id)); sessionStorage.removeItem(STORAGE_KEYS.planDraft); plan = { ownerId: user.id, title: "", startDate: "", endDate: "", memo: "", items: [] }; setForm(); render(); status(message, "여행 계획을 삭제했습니다."); } catch (error) { status(message, error.message, true); }
  });
}
