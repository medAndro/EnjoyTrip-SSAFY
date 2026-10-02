import { preparePhoto } from "./helpers/image.js";
import { createMap, addressToCoordinate } from "./map.js";
import { KAKAO_MAP_KEY } from "./settings.js";
import { getCurrentUser } from "./session.js";
import { readArray, writeJSON } from "./storage.js";
import { STORAGE_KEYS, CONTENT_TYPES } from "./config.js";
import { status, element, safeImage } from "./ui.js";
const form = document.querySelector("#hotplace-form"), message = form.querySelector('[role="status"]'), list = document.querySelector("#hotplace-list");
let user, controller, photo = "", preparing = false, photoRevision = 0;
const value = id => form.querySelector(`#${id}`).value.trim();
init();
async function init() {
  try {
    user = getCurrentUser();
    if (!user) { form.querySelectorAll("input, textarea, select, button").forEach(node => { node.disabled = true; }); status(message, "로그인 후 Hotplace를 등록해주세요.", true); list.replaceChildren(element("p", "내 기록은 로그인 후 확인할 수 있습니다.", "empty-state")); return; }
    render();
    controller = await createMap(document.querySelector("#hotplace-map"), { key: KAKAO_MAP_KEY });
    render();
    controller?.onClick((lat, lng) => { form.querySelector("#latitude").value = lat.toFixed(6); form.querySelector("#longitude").value = lng.toFixed(6); status(message, "지도에서 장소 위치를 선택했습니다."); });
  } catch (error) { status(message, error.message, true); }
}
form.querySelector("#photo").addEventListener("change", async event => {
  const token = ++photoRevision; photo = ""; preparing = true;
  document.querySelector("#photo-preview").replaceChildren(); status(message, "사진을 준비하는 중입니다…");
  try { const file = event.target.files[0]; if (!file) { status(message, "사진을 선택해주세요."); return; } const result = await preparePhoto(file); if (token !== photoRevision) return; photo = result; const image = document.createElement("img"); image.src = photo; image.alt = "선택한 사진 미리보기"; document.querySelector("#photo-preview").append(image); status(message, "사진이 준비되었습니다."); }
  catch (error) { if (token === photoRevision) status(message, error.message, true); }
  finally { if (token === photoRevision) preparing = false; }
});
document.querySelector("#find-address").addEventListener("click", async () => {
  try { const coordinate = await addressToCoordinate(value("address")); form.querySelector("#latitude").value = coordinate.lat; form.querySelector("#longitude").value = coordinate.lng; controller?.focusPlace(coordinate); status(message, "주소의 좌표를 찾았습니다. 지도에서 위치를 확인해주세요."); }
  catch (error) { status(message, error.message, true); }
});
form.addEventListener("submit", event => {
  event.preventDefault();
  try {
    if (!user || getCurrentUser()?.id !== user.id) throw new Error("로그인 후 이용해주세요.");
    if (preparing || !photo) throw new Error("사진 준비가 끝난 뒤 등록해주세요.");
    const lat = Number(value("latitude")), lng = Number(value("longitude"));
    if (!value("place-name") || !value("address") || !value("visited-date") || !value("latitude") || !value("longitude") || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error("필수 정보와 좌표를 확인해주세요.");
    const records = readArray(localStorage, STORAGE_KEYS.hotplaces);
    if (records.filter(item => item.ownerId === user.id).length >= 3) throw new Error("회원당 최대 3개까지 등록할 수 있습니다.");
    records.push({ id: crypto.randomUUID(), ownerId: user.id, name: value("place-name"), address: value("address"), contentTypeId: value("place-type"), visitedDate: value("visited-date"), description: value("description"), lat, lng, photoDataUrl: photo });
    writeJSON(localStorage, STORAGE_KEYS.hotplaces, records); form.reset(); photo = ""; photoRevision++; document.querySelector("#photo-preview").textContent = "사진 미리보기"; render(); status(message, "Hotplace를 등록했습니다.");
  } catch (error) { status(message, error.message, true); }
});
list.addEventListener("click", event => {
  const button = event.target.closest('[data-delete]'); if (!button || !confirm("이 Hotplace를 삭제할까요?")) return;
  try { if (getCurrentUser()?.id !== user.id) throw new Error("로그인 상태를 확인해주세요."); const records = readArray(localStorage, STORAGE_KEYS.hotplaces).filter(item => !(item.id === button.dataset.delete && item.ownerId === user.id)); writeJSON(localStorage, STORAGE_KEYS.hotplaces, records); render(); status(message, "Hotplace를 삭제했습니다."); } catch (error) { status(message, error.message, true); }
});
function render() {
  const mine = readArray(localStorage, STORAGE_KEYS.hotplaces).filter(item => item.ownerId === user.id); list.replaceChildren();
  if (!mine.length) list.append(element("p", "등록한 Hotplace가 없습니다.", "empty-state"));
  mine.forEach(item => { const card = element("article", "", "place-card"); const image = document.createElement("img"); image.src = safeImage(item.photoDataUrl); image.alt = item.name; image.className = "place-photo";
    card.append(image, element("h3", item.name), element("p", `${CONTENT_TYPES.find(type => type.code === item.contentTypeId)?.label || "여행지"} · ${item.visitedDate}`, "hint"), element("p", item.address), element("p", item.description));
    const button = element("button", "삭제", "secondary"); button.type = "button"; button.dataset.delete = item.id; card.append(button); list.append(card);
  });
  controller?.updatePlaces(mine); document.querySelector("#hotplace-status").textContent = `${mine.length} / 3개 등록`;
}
