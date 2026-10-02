// AI 제공: 3시간 실습을 위한 지도 SDK 접착 코드.
// 학생은 검색/등록 결과를 이 함수에 전달하는 이벤트·데이터 흐름을 구현합니다.
// 참고: https://apis.map.kakao.com/web/guide/
let sdkPromise;

function loadSdk(key) {
  if (!key) return Promise.reject(new Error("지도 키를 설정하면 실제 지도를 사용할 수 있습니다."));
  if (globalThis.kakao?.maps?.Map) return Promise.resolve(globalThis.kakao.maps);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = setTimeout(() => fail(), 12000);
    function fail() {
      clearTimeout(timeout);
      script.remove();
      reject(new Error("지도를 불러오지 못했습니다. 키·허용 도메인·네트워크를 확인해 주세요."));
    }
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
    script.onerror = fail;
    script.onload = () => {
      if (!globalThis.kakao?.maps?.load) return fail();
      globalThis.kakao.maps.load(() => {
        clearTimeout(timeout);
        resolve(globalThis.kakao.maps);
      });
    };
    document.head.append(script);
  }).catch((error) => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

function hasCoordinate(place) {
  return typeof place.lat === "number" && typeof place.lng === "number"
    && Number.isFinite(place.lat) && Number.isFinite(place.lng)
    && Math.abs(place.lat) <= 90 && Math.abs(place.lng) <= 180;
}

export async function createPlaceMap(container, { key = "" } = {}) {
  if (!container) throw new Error("지도 영역을 찾을 수 없습니다.");
  let maps;
  try {
    maps = await loadSdk(key);
  } catch (error) {
    container.textContent = error.message;
    return null; // 키가 없더라도 나머지 실습을 진행할 수 있습니다.
  }
  container.replaceChildren();
  container.classList.remove("map-placeholder");
  container.style.height = "360px";
  const map = new maps.Map(container, { center: new maps.LatLng(37.5665, 126.978), level: 7 });
  let markers = [];
  return {
    updatePlaces(places) {
      this.clear();
      const valid = places.filter(hasCoordinate);
      if (!valid.length) return;
      const bounds = new maps.LatLngBounds();
      markers = valid.map((place) => {
        const position = new maps.LatLng(place.lat, place.lng);
        bounds.extend(position);
        return new maps.Marker({ map, position, title: place.name });
      });
      map.relayout();
      map.setBounds(bounds);
    },
    focusPlace(place) {
      if (hasCoordinate(place)) map.panTo(new maps.LatLng(place.lat, place.lng));
    },
    clear() {
      markers.forEach((marker) => marker.setMap(null));
      markers = [];
    },
  };
}

export function addressToCoordinate(address) {
  return new Promise((resolve, reject) => {
    const maps = globalThis.kakao?.maps;
    if (!maps?.services || !address.trim()) {
      reject(new Error("지도를 먼저 준비하고 주소를 입력해 주세요."));
      return;
    }
    new maps.services.Geocoder().addressSearch(address, (result, status) => {
      if (status !== maps.services.Status.OK || !result[0]) {
        reject(new Error("주소의 위치를 찾지 못했습니다."));
        return;
      }
      resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
    });
  });
}
