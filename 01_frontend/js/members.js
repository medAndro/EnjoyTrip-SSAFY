// 담당 B — F107/F108. 페이지별 body.dataset.page 값으로 초기화를 구분합니다.
// signup: 폼 검증 → ID 중복 확인 → 샘플 회원 저장.
// login: 샘플 회원 대조 → sessionStorage에 userId 저장 → 화면 이동.
// recover: ID+샘플 이메일 확인 → 새 데모 비밀번호 설정(실제 메일 발송 없음).
// mypage: 로그인 확인 → 내 정보 표시 → 수정/탈퇴.
// 탈퇴: 현재 회원을 지우고 계획/Hotplace 배열에서 ownerId가 같은 항목을 제거합니다.
// 사용자 입력은 innerHTML 대신 textContent/value로 반영합니다.
// 실제 submit 리스너 연결 시 data-preview-form 속성과 해당 disabled를 제거합니다.
