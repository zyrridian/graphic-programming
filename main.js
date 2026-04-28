function getBasePath() {
  const configuredBase = import.meta.env.BASE_URL || "/";

  // In GitHub Pages, this keeps links under /<repo>/ even if build base is not set.
  if (configuredBase !== "/") {
    return configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`;
  }

  const [firstSegment] = window.location.pathname.split("/").filter(Boolean);
  return firstSegment ? `/${firstSegment}/` : "/";
}

const base = getBasePath();

const sessions = [
  {
    id: 1,
    title: "Session 1",
    description: "Basic scene setup and a rotating cube.",
    href: `${base}src/session1/index.html`,
    tags: ["Scene", "Geometry", "Animation"],
  },
  {
    id: 2,
    title: "Session 2",
    description: "Indexed geometry and wireframe cube construction.",
    href: `${base}src/session2/index.html`,
    tags: ["BufferGeometry", "Indices", "Wireframe"],
  },
  {
    id: 3,
    title: "Session 3",
    description: "Textured primitives and material variety.",
    href: `${base}src/session3/index.html`,
    tags: ["Textures", "Materials", "Lighting"],
  },
  {
    id: 4,
    title: "Session 4",
    description: "Lighting controls with a small interactive demo.",
    href: `${base}src/session4/index.html`,
    tags: ["Lights", "GUI", "Interactivity"],
  },
  {
    id: 5,
    title: "Session 5",
    description: "Transforms, keyboard movement, and GUI-driven controls.",
    href: `${base}src/session5/index.html`,
    tags: ["Position", "Rotation", "Scale"],
  },
  {
    id: 6,
    title: "Session 6",
    description: "Camera modes, skybox background, and navigation patterns.",
    href: `${base}src/session6/index.html`,
    tags: ["Skybox", "Orbit", "First Person"],
  },
  {
    id: 7,
    title: "Mid Exam",
    description: "Midterm examination covering sessions 1-6 concepts.",
    href: `${base}src/exam-mid/index.html`,
    tags: ["Review", "Assessment", "Comprehensive"],
  },
  {
    id: 8,
    title: "████ █████",
    description: "██████████ █████████ ████ ███████ ████ ████████.",
    href: null,
    tags: ["██████", "███████", "███████"],
    locked: true,
  },
  {
    id: 9,
    title: "████ █████",
    description: "████ ██████ ███ ████ █████ ████████ ███ ████ ████████.",
    href: null,
    tags: ["████████", "████ ███████", "████ █████"],
    locked: true,
  },
];

const grid = document.querySelector("#session-grid");

if (grid) {
  grid.innerHTML = sessions
    .map(
      (session) => `
        <article class="card ${session.locked ? "locked" : ""}">
          <div class="meta">${String(session.id).padStart(2, "0")}</div>
          <h2>${session.title}</h2>
          <p>${session.description}</p>
          <div class="tags">
            ${session.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <div class="actions">
            <span class="meta">${session.locked ? "██████" : "Open practical"}</span>
            ${
              session.locked
                ? '<span class="button disabled" aria-disabled="true">██████</span>'
                : `<a class="button" href="${session.href}">Launch</a>`
            }
          </div>
        </article>
      `,
    )
    .join("");
}
