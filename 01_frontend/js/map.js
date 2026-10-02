// AI 제공: 3시간 기준으로 지도 설정/마커 처리 보조를 준비했습니다.
// A/B는 await createMap(지도요소, { key }) 후 검색/등록 결과를 updatePlaces에 전달합니다.
// 키가 없거나 SDK가 실패하면 null을 반환하므로 컨트롤러가 있을 때만 호출합니다.
// 학습 확인: lat/lng 순서, 기존 마커 삭제, 비동기 완료 시점을 설명해 보세요.
export { createPlaceMap as createMap, addressToCoordinate } from "./helpers/map.js";
