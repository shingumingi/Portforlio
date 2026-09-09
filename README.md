# 게임 포트폴리오 템플릿

게임콘텐츠과 학생이 프로젝트 정보, 출시 링크, GitHub, 이력서와 프로젝트 문서를 하나의 주소로 보여주기 위한 정적 웹 템플릿입니다.

## 가장 빠른 테스트

`index.html`을 파일로 직접 열면 브라우저 보안 정책 때문에 JSON을 읽지 못할 수 있습니다. 아래 중 하나를 사용하세요.

1. VS Code에서 Live Server 확장으로 폴더를 실행합니다.
2. Python이 설치된 경우 이 폴더에서 `python -m http.server 8000`을 실행하고 `http://localhost:8000`으로 접속합니다.
3. GitHub 저장소에 업로드한 뒤 GitHub Pages에서 확인합니다.

## 학생 사용 순서

1. `editor.html`을 엽니다.
2. 기본 정보와 프로젝트 정보를 입력합니다.
3. `portfolio.json 다운로드`를 누릅니다.
4. 내려받은 파일로 `data/portfolio.json`을 교체합니다.
5. 프로필과 게임 이미지를 `images` 폴더에 올립니다.
6. 프로젝트 문서를 `documents` 폴더에 올립니다.
7. `resume.html`에서 `PDF로 저장`을 누르면 같은 JSON으로 이력서 PDF를 만들 수 있습니다.
8. 변경 내용을 GitHub에 커밋합니다.

## GitHub Pages

개인 페이지로 사용하려면 저장소 이름을 `본인아이디.github.io`로 만듭니다. 저장소의 Settings → Pages에서 배포 대상을 기본 브랜치의 루트 폴더로 설정합니다.

## 수정하는 파일

- 학생 필수 수정: `data/portfolio.json`, `images`, `documents`
- 학생 선택 수정: `css/portfolio.css`
- 기본적으로 수정하지 않음: `index.html`, `project.html`, `js/portfolio.js`, `js/project.js`

## 이력서 PDF 만들기

입력 도구에서 `이력서 미리보기·PDF`를 누르면 현재 입력한 내용으로 A4 이력서가 열립니다. `PDF로 저장` 버튼을 누른 뒤 브라우저 인쇄 화면에서 대상을 `PDF로 저장`으로 선택합니다. 별도의 이력서 PDF를 미리 만들어 업로드할 필요가 없습니다.

## 주의사항

- JSON의 마지막 항목 뒤에는 쉼표를 넣지 않습니다.
- 이미지와 문서 파일명은 영문 소문자와 하이픈을 권장합니다.
- 공개 저장소에 비밀번호, API 키, 주민등록번호, 집 주소를 올리지 않습니다.
- 팀 프로젝트는 팀 전체 작업과 본인 작업을 구분해서 작성합니다.
