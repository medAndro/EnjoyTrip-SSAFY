// 담당 A — 관광지 데이터 읽기 및 API 응답 정규화.
// 함수 계약: export async function loadAttractions() → Attraction[]
// 수도코드: fetch(ATTRACTIONS_URL) → response.ok 확인 → response.json() → 배열 확인 → 반환.
// 관광 API 키와 실제 요청 주소는 공식 명세를 확인한 후 연결합니다.
// 실제 API 실패를 샘플 성공으로 숨기지 말고 데이터 모드를 표시합니다.

import { ATTRACTIONS_URL } from "./config.js"

export async function loadAttractions() {
    const response = await fetch(ATTRACTIONS_URL);
    if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        } else {
            throw new Error("데이터가 배열 형식이 아닙니다")
        }
    } else {
        throw new Error("잠시 후 다시 시도해주세요")
    }
}

