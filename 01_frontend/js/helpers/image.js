// AI 제공: 사진 파일 용량 조절은 교안의 핵심 범위를 넘어가는 보조 기능입니다.
// 반환된 data URL을 미리보기/Storage에 연결하는 이벤트와 CRUD는 B가 구현합니다.
export async function preparePhoto(file) {
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("JPG, PNG, WEBP 사진을 선택해 주세요.");
  }
  if (file.size > 5 * 1024 * 1024) throw new Error("5MB 이하의 사진을 선택해 주세요.");
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("사진을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("사진 형식을 확인해 주세요."));
    element.src = dataUrl;
  });
  const ratio = Math.min(1, 800 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("사진을 변환하지 못했습니다.");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const result = canvas.toDataURL("image/jpeg", .7);
  if (result.length > 400000) throw new Error("저장할 사진이 큽니다. 더 작은 사진을 선택해 주세요.");
  return result;
}
