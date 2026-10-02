// 담당 A — F104. 여행 계획 CRUD와 배열 순서 변경을 직접 구현합니다.
// 1. session.js의 getCurrentUser()로 로그인 회원을 확인한다.
// 2. 관광지 검색 결과에서 선택한 attractionId를 임시 일정 배열에 추가한다.
// 3. 일자/시간/경비/메모를 입력하고 선택 순서대로 화면에 표시한다.
// 4. 위/아래 버튼으로 배열 순서를 바꾼다. drag/drop은 3시간 이후 확장이다.
// 5. 회원 ID와 함께 localStorage에 저장하고 새로고침 뒤 다시 불러온다.
// 6. 회원당 1개 계획만 저장하고 불러오기/덮어쓰기/삭제를 연결한다.
// 수도코드와 데이터 계약은 docs/TEAM_ROLES.md 및 docs/DATA_CONTRACT.md 참고.

import { loadAttractions } from "./data.js";

init();

async function init() {
    try {
        const attractions = await loadAttractions();
        // TODO(B 통합): getCurrentUser()로 회원을 확인하고 readJSON()으로 planDraft를 읽어 임시 ID를 교체합니다.
        const sampleIds = ["sample-1-12", "sample-6-12"];
        // TODO(B 통합): 현재 회원의 저장 계획에서 items를 가져와 아래 임시 기존 일정을 교체합니다.
        // 초안을 합친 결과를 저장한 뒤 반영한 초안을 정리합니다. 저장 실패 시 초안을 지우지 않습니다.
        const items = [
            {
                attractionId: "sample-1-12",
                visitDate: "2026-10-03",
                visitTime: "10:00",
                cost: 10000,
                memo: "기존 메모"
            }
        ];
        document.querySelector("#schedule-list").replaceChildren();

        sampleIds.forEach(sampleId => {
            const attr = attractions.find(attr => sampleId === attr.id);
            if (attr) {
                if (items.some(item => item.attractionId === sampleId)) {
                    return;
                }
                if (items.length >= 5) {
                    return;
                }

                items.push({
                    attractionId: attr.id,
                    visitDate: "",
                    visitTime: "",
                    cost: 0,
                    memo: ""
                })


                console.log(attr.name);
            }

        })
        console.log(items);
        items.forEach(item => {
            const attr = attractions.find(attr => item.attractionId === attr.id);
            if (!attr) {
                return;
            }
            const card = document.createElement("li");
            card.classList.add("schedule-item");
            const title = document.createElement("h3");
            title.textContent = attr.name;

            card.append(title);
            document.querySelector("#schedule-list").append(card);
        })
    } catch (e) {
        console.log(e);
        alert("관광지 조회에 실패했습니다");
    }



}
