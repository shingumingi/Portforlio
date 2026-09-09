"use strict";

const STORAGE_KEY = "game-portfolio-editor-draft-v1";
const form = document.getElementById("portfolio-form");
const projectForms = document.getElementById("project-forms");
const projectTemplate = document.getElementById("project-template");
const preview = document.getElementById("portfolio-preview");
const message = document.getElementById("validation-message");
const saveState = document.getElementById("save-state");

const EMPTY_PROJECT = {
  title: "", genre: "", platform: "", period: "", teamSize: 1, role: "",
  description: "", contributions: "", problem: "", solution: "", result: "",
  thumbnail: "images/sample-game.svg", play: "", video: "", github: "", document: ""
};

const SAMPLE_DATA = {
  profile: {
    name: "김민준", job: "게임 클라이언트 프로그래머",
    introduction: "Unity와 C#을 활용해 게임 시스템과 UI를 구현합니다. 플레이 가능한 결과와 작업 문서로 개발 과정을 증명합니다.",
    email: "student@example.com", profileImage: "images/profile.png",
    resume: "resume.html", github: "https://github.com/"
  },
  skills: ["C#", "Unity", "GitHub", "JSON"],
  projects: [{
    title: "Star Puzzle", genre: "퍼즐", platform: "WebGL", period: "2026.03 ~ 2026.06",
    teamSize: 4, role: "클라이언트 프로그래밍", description: "별 배치 규칙을 활용한 논리 퍼즐 게임입니다.",
    contributions: "퍼즐 정답 판정 알고리즘 구현\n힌트 및 생명 시스템 구현\nJSON 기반 스테이지 데이터 구조 설계",
    problem: "새로운 스테이지를 추가할 때마다 코드를 수정해야 했습니다.",
    solution: "스테이지 규칙과 정답 데이터를 JSON 파일로 분리했습니다.",
    result: "코드 수정 없이 신규 스테이지를 추가할 수 있게 되었습니다.",
    thumbnail: "images/star-puzzle.svg", play: "https://example.com", video: "",
    github: "https://github.com/", document: "documents/project-document.html"
  }]
};

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[character]));
const lines = value => String(value || "").split("\n").map(item => item.trim()).filter(Boolean);
const slugify = (value, index) => {
  const slug = String(value || "").toLowerCase().trim().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "");
  return slug || `project-${index + 1}`;
};

function normalizedForEditor(data) {
  const profile = data.profile || {};
  return {
    profile,
    skills: Array.isArray(data.skills) ? data.skills : [],
    projects: (data.projects || []).map(project => ({
      title: project.title || "", genre: project.genre || "", platform: project.platform || "", period: project.period || "",
      teamSize: project.team?.size || 1, role: project.team?.myRole || "", description: project.description || "",
      contributions: (project.contributions || []).join("\n"), problem: project.problemSolving?.[0]?.problem || "",
      solution: project.problemSolving?.[0]?.solution || "", result: project.problemSolving?.[0]?.result || "",
      thumbnail: project.thumbnail || "", play: project.links?.play || "", video: project.links?.video || "",
      github: project.links?.github || "", document: project.links?.document || ""
    }))
  };
}

function populate(data) {
  const editorData = data.projects?.[0]?.team ? normalizedForEditor(data) : data;
  const profile = editorData.profile || {};
  ["name", "job", "introduction", "email", "github", "profileImage"].forEach(key => {
    form.elements[key].value = profile[key] || "";
  });
  form.elements.skills.value = (editorData.skills || []).join(", ");
  projectForms.innerHTML = "";
  const projects = editorData.projects?.length ? editorData.projects : [{ ...EMPTY_PROJECT }];
  projects.forEach(addProject);
  updateAll();
}

function addProject(project = EMPTY_PROJECT) {
  const fragment = projectTemplate.content.cloneNode(true);
  const article = fragment.querySelector(".project-form");
  article.querySelectorAll("[data-key]").forEach(input => {
    input.value = project[input.dataset.key] ?? "";
  });
  article.querySelector(".remove-project").addEventListener("click", () => {
    if (projectForms.children.length === 1) return;
    article.remove();
    updateAll();
  });
  projectForms.appendChild(fragment);
  renumberProjects();
}

function renumberProjects() {
  [...projectForms.children].forEach((article, index) => article.querySelector(".project-number").textContent = index + 1);
}

function collectEditorData() {
  return {
    profile: {
      name: form.elements.name.value.trim(), job: form.elements.job.value.trim(),
      introduction: form.elements.introduction.value.trim(), email: form.elements.email.value.trim(),
      github: form.elements.github.value.trim(), profileImage: form.elements.profileImage.value.trim(),
      resume: "resume.html"
    },
    skills: form.elements.skills.value.split(",").map(item => item.trim()).filter(Boolean),
    projects: [...projectForms.children].map(article => {
      const value = key => article.querySelector(`[data-key="${key}"]`).value.trim();
      return {
        title: value("title"), genre: value("genre"), platform: value("platform"), period: value("period"),
        teamSize: Number(value("teamSize")) || 1, role: value("role"), description: value("description"),
        contributions: value("contributions"), problem: value("problem"), solution: value("solution"),
        result: value("result"), thumbnail: value("thumbnail"), play: value("play"), video: value("video"),
        github: value("github"), document: value("document")
      };
    })
  };
}

function buildPortfolioJson(editorData) {
  return {
    profile: editorData.profile,
    skills: editorData.skills,
    projects: editorData.projects.map((project, index) => ({
      id: slugify(project.title, index), title: project.title, thumbnail: project.thumbnail,
      description: project.description, genre: project.genre, platform: project.platform, period: project.period,
      team: { size: project.teamSize, myRole: project.role },
      contributions: lines(project.contributions),
      problemSolving: (project.problem || project.solution || project.result) ? [{ problem: project.problem, solution: project.solution, result: project.result }] : [],
      links: { play: project.play, video: project.video, github: project.github, document: project.document }
    }))
  };
}

function renderPreview(editorData) {
  const profile = editorData.profile;
  preview.innerHTML = `
    <div class="preview-profile">
      <img src="${escapeHtml(profile.profileImage || "images/profile.png")}" alt="프로필 미리보기">
      <div><h2>${escapeHtml(profile.name || "이름")}</h2><p>${escapeHtml(profile.job || "희망 직무")}</p></div>
    </div>
    <p class="preview-intro">${escapeHtml(profile.introduction || "한 줄 소개를 입력하세요.")}</p>
    <div class="preview-tags">${editorData.skills.map(skill => `<span class="preview-tag">${escapeHtml(skill)}</span>`).join("")}</div>
    ${editorData.projects.map(project => `<div class="preview-project"><img src="${escapeHtml(project.thumbnail || "images/sample-game.svg")}" alt=""><div><strong>${escapeHtml(project.title || "프로젝트 제목")}</strong><p>${escapeHtml(project.description || "프로젝트 소개를 입력하세요.")}</p></div></div>`).join("")}`;
}

function validate(editorData) {
  const errors = [];
  if (!editorData.profile.name) errors.push("이름을 입력하세요.");
  if (!editorData.profile.job) errors.push("희망 직무를 입력하세요.");
  if (!editorData.profile.introduction) errors.push("한 줄 소개를 입력하세요.");
  if (!editorData.profile.email) errors.push("이메일을 입력하세요.");
  editorData.projects.forEach((project, index) => {
    if (!project.title) errors.push(`프로젝트 ${index + 1}의 제목을 입력하세요.`);
    if (!project.role) errors.push(`프로젝트 ${index + 1}의 담당 역할을 입력하세요.`);
    if (!project.description) errors.push(`프로젝트 ${index + 1}의 소개를 입력하세요.`);
    if (!lines(project.contributions).length) errors.push(`프로젝트 ${index + 1}의 담당 기능을 입력하세요.`);
  });
  return errors;
}

function updateAll() {
  renumberProjects();
  const data = collectEditorData();
  renderPreview(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  saveState.textContent = "자동 저장됨";
}

form.addEventListener("input", () => {
  saveState.textContent = "저장 중…";
  window.clearTimeout(window.editorSaveTimer);
  window.editorSaveTimer = window.setTimeout(updateAll, 180);
});
document.getElementById("add-project").addEventListener("click", () => { addProject({ ...EMPTY_PROJECT }); updateAll(); });
document.getElementById("preview-resume").addEventListener("click", () => {
  updateAll();
  window.open("resume.html?draft=1", "_blank", "noopener");
});

document.getElementById("json-import").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { populate(JSON.parse(reader.result)); message.textContent = "JSON을 불러왔습니다."; }
    catch { message.textContent = "올바른 JSON 파일이 아닙니다."; }
  };
  reader.readAsText(file, "utf-8");
});

document.getElementById("download-json").addEventListener("click", () => {
  const data = collectEditorData();
  const errors = validate(data);
  if (errors.length) { message.innerHTML = errors.map(error => `• ${escapeHtml(error)}`).join("<br>"); return; }
  message.textContent = "";
  const json = JSON.stringify(buildPortfolioJson(data), null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "portfolio.json"; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

try {
  const draft = localStorage.getItem(STORAGE_KEY);
  populate(draft ? JSON.parse(draft) : SAMPLE_DATA);
} catch {
  populate(SAMPLE_DATA);
}
