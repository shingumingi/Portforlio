"use strict";

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[character]));
const safeLink = value => {
  const link = String(value || "").trim();
  if (/^(https?:\/\/|[a-z0-9_./-]+$)/i.test(link) && !link.startsWith("//")) return link;
  return "";
};
const detailButton = (href, label, primary = false) => {
  const safe = safeLink(href); if (!safe) return "";
  return `<a class="button${primary ? " primary" : ""}" href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
};

function renderProject(project) {
  document.title = `${project.title || "프로젝트"} · 프로젝트 상세`;
  const solve = Array.isArray(project.problemSolving) ? project.problemSolving[0] : null;
  document.getElementById("project-app").innerHTML = `
    <img class="detail-cover" src="${escapeHtml(safeLink(project.thumbnail) || "images/sample-game.svg")}" alt="${escapeHtml(project.title)} 대표 이미지">
    <p class="eyebrow">${escapeHtml(project.genre || "게임 프로젝트")}</p>
    <h1 class="detail-title">${escapeHtml(project.title || "프로젝트")}</h1>
    <p class="detail-summary">${escapeHtml(project.description || "")}</p>
    <div class="detail-facts">
      <div class="fact"><small>플랫폼</small><strong>${escapeHtml(project.platform || "-")}</strong></div>
      <div class="fact"><small>기간</small><strong>${escapeHtml(project.period || "-")}</strong></div>
      <div class="fact"><small>인원</small><strong>${escapeHtml(project.team?.size || "-")}명</strong></div>
      <div class="fact"><small>담당</small><strong>${escapeHtml(project.team?.myRole || "-")}</strong></div>
    </div>
    <div class="actions">${detailButton(project.links?.play, "게임 플레이", true)}${detailButton(project.links?.video, "플레이 영상")}${detailButton(project.links?.github, "GitHub")}${detailButton(project.links?.document, "문서 보기")}</div>
    <section class="detail-section"><h2>직접 담당한 작업</h2><ul class="contribution-list">${(project.contributions || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
    ${solve ? `<section class="detail-section"><h2>문제 해결 과정</h2><div class="solve-grid"><div class="solve-item"><small>문제</small><p>${escapeHtml(solve.problem)}</p></div><div class="solve-item"><small>해결</small><p>${escapeHtml(solve.solution)}</p></div><div class="solve-item"><small>결과</small><p>${escapeHtml(solve.result)}</p></div></div></section>` : ""}`;
}

const wantedId = new URLSearchParams(location.search).get("id");
fetch("data/portfolio.json", { cache: "no-store" })
  .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
  .then(data => {
    const project = (data.projects || []).find((item, index) => (item.id || `project-${index + 1}`) === wantedId);
    if (!project) throw new Error("프로젝트를 찾을 수 없습니다.");
    renderProject(project);
  })
  .catch(error => {
    document.getElementById("project-app").innerHTML = `<section class="error"><strong>프로젝트를 불러오지 못했습니다.</strong><p>${escapeHtml(error.message)}</p></section>`;
  });
