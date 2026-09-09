"use strict";

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
}[character]));

const safeLink = value => {
  const link = String(value || "").trim();
  if (!link) return "";
  if (/^(https?:\/\/|mailto:)/i.test(link)) return link;
  if (/^[a-z0-9_./-]+$/i.test(link) && !link.startsWith("//")) return link;
  return "";
};

const linkButton = (href, label, primary = false) => {
  const safe = safeLink(href);
  if (!safe) return "";
  const external = /^https?:\/\//i.test(safe) ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a class="button${primary ? " primary" : ""}" href="${escapeHtml(safe)}"${external}>${escapeHtml(label)}</a>`;
};

function renderPortfolio(data) {
  const profile = data.profile || {};
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];
  document.title = `${profile.name || "게임"} 포트폴리오`;
  document.getElementById("brand").textContent = `${profile.name || "GAME"} · PORTFOLIO`;
  document.getElementById("footer-text").textContent = `${profile.name || "Game Portfolio"} · ${profile.email || ""}`;

  const projectCards = projects.map((project, index) => {
    const image = safeLink(project.thumbnail) || "images/sample-game.svg";
    const id = encodeURIComponent(project.id || `project-${index + 1}`);
    return `
      <article class="project-card">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(project.title)} 대표 이미지">
        <div class="project-content">
          <span class="project-meta">${escapeHtml(project.genre || "게임")} · ${escapeHtml(project.platform || "플랫폼 미정")}</span>
          <h3>${escapeHtml(project.title || "프로젝트")}</h3>
          <p>${escapeHtml(project.description || "")}</p>
          <div class="project-role"><strong>담당</strong>${escapeHtml(project.team?.myRole || "")}</div>
          <div class="card-actions">
            ${linkButton(`project.html?id=${id}`, "상세 보기", true)}
            ${linkButton(project.links?.play, "게임 플레이")}
          </div>
        </div>
      </article>`;
  }).join("");

  const documents = [];
  if (safeLink(profile.resume)) documents.push({ label: "이력서", href: profile.resume, meta: "PDF 또는 문서" });
  projects.forEach(project => {
    if (safeLink(project.links?.document)) documents.push({ label: `${project.title} 프로젝트 문서`, href: project.links.document, meta: "프로젝트 자료" });
  });
  const documentLinks = documents.map(document => `<a class="document-link" href="${escapeHtml(safeLink(document.href))}" target="_blank" rel="noopener noreferrer">${escapeHtml(document.label)}<span>${escapeHtml(document.meta)} →</span></a>`).join("");

  document.getElementById("app").innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(profile.job || "GAME CREATOR")}</p>
        <h1>플레이 가능한 결과로<br>역량을 증명합니다.</h1>
        <p class="intro">${escapeHtml(profile.introduction || "")}</p>
        <div class="actions">
          <a class="button primary" href="#projects">출시 게임 보기</a>
          ${linkButton(profile.resume, "이력서 보기")}
          ${linkButton(profile.github, "GitHub")}
        </div>
      </div>
      <aside class="profile-card">
        <img src="${escapeHtml(safeLink(profile.profileImage) || "images/profile.png")}" alt="${escapeHtml(profile.name || "학생")} 프로필 사진">
        <h2>${escapeHtml(profile.name || "이름")}</h2>
        <p>${escapeHtml(profile.job || "희망 직무")}</p>
        <div class="skill-list">${skills.map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}</div>
      </aside>
    </section>
    <section class="section" id="projects">
      <div class="section-heading"><h2>출시 및 프로젝트</h2><p>게임을 선택하면 담당 기능과 문제 해결 과정을 확인할 수 있습니다.</p></div>
      <div class="project-grid">${projectCards || "<p>등록된 프로젝트가 없습니다.</p>"}</div>
    </section>
    ${documentLinks ? `<section class="section" id="documents"><div class="documents"><div><p class="eyebrow">DOCUMENTS</p><h2>작업 증거를 함께 보여줍니다.</h2><p>이력서와 프로젝트 설명을 실제 기획서, 구조도, 테스트 문서로 연결합니다.</p></div><div class="document-list">${documentLinks}</div></div></section>` : ""}`;
}

fetch("data/portfolio.json", { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(renderPortfolio)
  .catch(error => {
    console.error(error);
    document.getElementById("app").innerHTML = `<section class="error"><strong>포트폴리오를 불러오지 못했습니다.</strong><p>GitHub Pages 주소에서 열었는지 확인하고, <code>data/portfolio.json</code>의 쉼표·큰따옴표·중괄호를 확인하세요.</p></section>`;
  });
