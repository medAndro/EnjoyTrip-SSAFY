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

init();

async function init() {
    try {
        const attractions = await loadAttractions();
        console.log(attractions, attractions.length);
    } catch (e) {
        console.log(e);
    }

}

