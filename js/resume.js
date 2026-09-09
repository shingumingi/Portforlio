"use strict";

const STORAGE_KEY = "game-portfolio-editor-draft-v1";
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[character]));
const safeLink = value => {
  const link = String(value || "").trim();
  if (/^https?:\/\//i.test(link)) return link;
  if (/^[a-z0-9_./-]+$/i.test(link) && !link.startsWith("//")) return link;
  return "";
};

function normalize(data) {
  if (data.projects?.[0]?.team) return data;
  return {
    profile: data.profile || {}, skills: data.skills || [],
    projects: (data.projects || []).map((project, index) => ({
      id: `project-${index + 1}`, title: project.title, description: project.description,
      genre: project.genre, platform: project.platform, period: project.period,
      team: { size: project.teamSize, myRole: project.role },
      contributions: String(project.contributions || "").split("\n").map(item => item.trim()).filter(Boolean),
      links: { github: project.github || "", play: project.play || "" }
    }))
  };
}

function renderResume(rawData) {
  const data = normalize(rawData);
  const profile = data.profile || {};
  document.title = `${profile.name || "게임 개발자"} 이력서`;
  const projects = (data.projects || []).map(project => `
    <article class="resume-project">
      <div><strong>${escapeHtml(project.period || "기간 미입력")}</strong><div class="project-period">${escapeHtml(project.platform || "")} · ${escapeHtml(project.genre || "")}</div></div>
      <div class="project-main">
        <h3>${escapeHtml(project.title || "프로젝트")}</h3>
        <p class="project-meta">${escapeHtml(project.team?.myRole || "담당 역할 미입력")} · ${escapeHtml(project.team?.size || 1)}명</p>
        <p class="project-summary">${escapeHtml(project.description || "")}</p>
        <ul>${(project.contributions || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    </article>`).join("");

  const github = safeLink(profile.github);
  document.getElementById("resume-app").innerHTML = `
    <header class="resume-head">
      <div>
        <h1>${escapeHtml(profile.name || "이름")}</h1>
        <p class="resume-job">${escapeHtml(profile.job || "희망 직무")}</p>
        <div class="resume-contact"><span>${escapeHtml(profile.email || "")}</span>${github ? `<a href="${escapeHtml(github)}">${escapeHtml(github.replace(/^https?:\/\//, ""))}</a>` : ""}</div>
      </div>
      <img class="resume-photo" src="${escapeHtml(safeLink(profile.profileImage) || "images/profile.png")}" alt="${escapeHtml(profile.name || "학생")} 프로필 사진">
    </header>
    <section class="resume-section"><h2>PROFILE</h2><p class="resume-intro">${escapeHtml(profile.introduction || "")}</p></section>
    <section class="resume-section"><h2>SKILLS</h2><div class="resume-skills">${(data.skills || []).map(skill => `<span class="resume-skill">${escapeHtml(skill)}</span>`).join("")}</div></section>
    <section class="resume-section"><h2>PROJECT EXPERIENCE</h2>${projects || "<p>등록된 프로젝트가 없습니다.</p>"}</section>`;
}

function showError(error) {
  document.getElementById("resume-app").innerHTML = `<div class="resume-error"><strong>이력서를 만들 수 없습니다.</strong><p>${escapeHtml(error.message)}</p></div>`;
}

document.getElementById("save-pdf").addEventListener("click", () => window.print());

const isDraft = new URLSearchParams(location.search).get("draft") === "1";
if (isDraft) {
  try {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (!draft) throw new Error("작성기에서 저장된 내용이 없습니다.");
    renderResume(JSON.parse(draft));
  } catch (error) { showError(error); }
} else {
  fetch("data/portfolio.json", { cache: "no-store" })
    .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
    .then(renderResume)
    .catch(showError);
}
