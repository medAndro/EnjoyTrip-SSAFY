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
import { CONTENT_TYPES } from "./config.js";


init();

async function init() {
    try {
        const attractions = await loadAttractions();
        // console.log(attractions, attractions.length);
        renderAttractions(attractions);
        bindSearchEvents(attractions);
        bindDetailEvents(attractions);
    } catch (e) {
        console.log(e);
    }

}

function renderAttractions(attractions) {
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
                dialog.querySelector("#detail-title").textContent = attr.name;
                dialog.querySelector("#detail-description").textContent = attr.description;
                dialog.querySelector("#detail-address").textContent = attr.address;
                dialog.querySelector("#detail-source").textContent = attr.source;
                dialog.showModal();
            }
        }


    });

    const dialogCloseBtn = document.querySelector("#close-detail");

    dialogCloseBtn.addEventListener("click", (e) => {
        dialog.close();
    })

}
