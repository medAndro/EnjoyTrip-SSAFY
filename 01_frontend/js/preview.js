// AI 제공: 기능 연결 전, 레퍼런스 폼이 입력값을 URL로 제출하지 않도록 하는 임시 보호 코드.
// 해당 폼의 실제 submit 리스너를 작성할 때 data-preview-form 속성을 제거하세요.
document.querySelectorAll("form[data-preview-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector('[role="status"]');
    if (status) status.textContent = "화면 레퍼런스입니다. 아직 저장하거나 조회하지 않습니다.";
  });
});
