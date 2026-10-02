// 담당 A — F101~F103. 아래 순서대로 직접 구현합니다.
// 1. data.js의 loadAttractions()를 작성하고 await로 샘플 JSON을 읽는다.
// 2. search-form의 submit 기본 동작을 취소하고 지역/유형/키워드를 읽는다.
// 3. filter로 조건에 맞는 결과를 만든다. 목록과 지도에 같은 배열을 전달한다.
// 4. 샘플 카드는 지우고 createElement/textContent로 place-list를 갱신한다.
// 5. 상세 버튼 클릭 → ID로 관광지 찾기 → detail-dialog 채우기 → showModal().
// 6. 로딩/빈 결과/오류를 각각 표시한다. 공공 API 연동은 별도 단계로 진행한다.
// 7. 상세의 일정 추가는 plans.js와 합의한 draft 규칙에 따라 연결한다.
// 시작 전: 해당 폼의 data-preview-form 속성/버튼 disabled를 제거합니다.

import { loadAttractions } from "./data.js";
import { CONTENT_TYPES, STORAGE_KEYS } from "./config.js";
import { createMap } from "./map.js";
import { KAKAO_MAP_KEY } from "./keys.js";
// TODO(B 연동): session.js와 storage.js에 아래 함수가 export되면 주석을 해제합니다.
// import { getCurrentUser } from "./session.js";
// import { readJSON, writeJSON } from "./storage.js";


let mapController;
let currentDisplayedAttr = [];
let selectedAttr;
init();

async function init() {
    try {
        const attractions = await loadAttractions();
        const mapElement = document.querySelector("#map");
        // console.log(attractions, attractions.length);
        renderAttractions(attractions);
        bindSearchEvents(attractions);
        bindDetailEvents(attractions);
        mapController = await createMap(mapElement, { key: KAKAO_MAP_KEY });
        updatePlaces(currentDisplayedAttr);
        console.log(mapController)
    } catch (e) {
        console.log(e);
    }

}

function updatePlaces(attractions) {
    if (mapController) {
        mapController.updatePlaces(attractions);
    }

}

function renderAttractions(attractions) {
    currentDisplayedAttr = attractions;
    const placeList = document.querySelector("#place-list")
    placeList.replaceChildren()

    if (attractions.length > 0) {
        attractions.forEach(place => {
            // console.log(place)
            const card = document.createElement("li");
            card.classList.add("place-card");
            card.dataset.placeId = place.id;

            const attrType = CONTENT_TYPES.find(item => item.code === place.contentTypeId);
            card.innerHTML =
                `
        <span class="badge">
            ${attrType.label}
        </span>
        <h3>
            ${place.name}
        </h3>
        <p class="muted">
            ${place.address}
        </p>
        <button type="button" class="secondary" data-action="detail">
            상세 보기
        </button>
        `
            placeList.append(card);
        });
    } else {
        const card = document.createElement("li");
        card.classList.add("place-card");
        card.innerHTML = "<h3>검색 결과가 없습니다</h3>"
        placeList.append(card);
    }

    document.querySelector("#result-count").textContent = attractions.length + "개";
    updatePlaces(attractions);
}


function bindSearchEvents(attractions) {
    const searchForm = document.querySelector("#search-form");

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const region = searchForm.querySelector("#region").value;
        const contentType = searchForm.querySelector("#content-type").value;
        const keyword = searchForm.querySelector("#keyword").value.trim();

        console.log(region, contentType, keyword)

        let filtered = attractions.filter(item => region === "" || item.region === region);
        filtered = filtered.filter(item => contentType === "" || item.contentTypeId === contentType);
        filtered = filtered.filter(item => keyword === "" || item.name.includes(keyword));
        console.log(filtered.length);
        renderAttractions(filtered);
    });
}

function bindDetailEvents(attractions) {
    const placeList = document.querySelector("#place-list");
    const dialog = document.querySelector("#detail-dialog");
    placeList.addEventListener("click", (e) => {
        const detailButton = e.target.closest(`[data-action="detail"]`);

        if (detailButton) {
            const card = detailButton.closest(`.place-card`);
            const attr = attractions.find(item => item.id === card.dataset.placeId);
            console.log(attr)
            if (attr) {
                selectedAttr = attr;
                dialog.querySelector("#detail-title").textContent = attr.name;
                dialog.querySelector("#detail-description").textContent = attr.description;
                dialog.querySelector("#detail-address").textContent = attr.address;
                dialog.querySelector("#detail-source").textContent = attr.source;
                dialog.showModal();
            }
        }


    });

    const dialogCloseBtn = document.querySelector("#close-detail");
    const addPlanBtn = document.querySelector("#add-to-plan");

    dialogCloseBtn.addEventListener("click", (e) => {
        dialog.close();
    })

    // TODO(B 연동): 위 import와 아래 이벤트의 주석을 해제하고 버튼 비활성화 코드를 제거합니다.
    // 연결 후 비로그인 차단, 새로고침 후 중복 검사, 최대 5개 제한을 확인합니다.
    addPlanBtn.disabled = true;
    /*
    addPlanBtn.addEventListener("click", (e) => {
        if (selectedAttr) {
            try {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    alert("로그인 후 이용해주세요");
                    return;
                }
                const ids = readJSON(sessionStorage, STORAGE_KEYS.planDraft, []);
                if (ids.includes(selectedAttr.id)) {
                    alert("이미 추가한 관광지입니다!");
                    return;
                }

                if (ids.length >= 5) {
                    alert("최대 5개까지만 추가할 수 있습니다!");
                } else {

                    ids.push(selectedAttr.id);
                    writeJSON(sessionStorage, STORAGE_KEYS.planDraft, ids);
                    dialog.close();
                    console.log(ids);
                    alert("추가 되었습니다!");
                }
            } catch (e) {
                console.log(e);
                alert("일정 추가에 실패했습니다!");
            }
        } else {
            alert("선택한 관광지가 없습니다");
        }
    })
    */

}
