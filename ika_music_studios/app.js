(() => {
  const catalog = window.IKA_CATALOG || { albums: [], playlists: [] };
  const views = { albums: "grid", playlists: "grid" };
  const fallbackCover = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#101827"/><stop offset="1" stop-color="#123847"/></linearGradient></defs><rect width="500" height="500" fill="url(#g)"/><circle cx="250" cy="250" r="145" fill="none" stroke="#00f0ff" stroke-opacity=".55" stroke-width="3"/><circle cx="250" cy="250" r="70" fill="none" stroke="#ff007f" stroke-opacity=".65" stroke-width="3"/><text x="250" y="270" text-anchor="middle" fill="white" font-family="Arial" font-size="48" font-weight="bold">IKA</text></svg>`
  );

  function safeUrl(value) {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && (u.hostname === "suno.com" || u.hostname.endsWith(".suno.com")) ? u.href : null;
    } catch { return null; }
  }

  function render(kind) {
    const root = document.getElementById(`${kind}-grid`);
    const empty = document.getElementById(`${kind}-empty`);
    const query = document.getElementById("search").value.trim().toLowerCase();
    const items = (catalog[kind] || []).filter(item => {
      const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
      return text.includes(query);
    });
    root.classList.toggle("list-mode", views[kind] === "list");
    root.innerHTML = items.map(item => {
      const url = safeUrl(item.url);
      if (!url) return "";
      const title = escapeHtml(item.title || "Untitled");
      const description = escapeHtml(item.description || "");
      const cover = safeImage(item.cover);
      return `<article class="collection-card">
        <img class="cover" src="${cover}" alt="${title} cover" loading="lazy" onerror="this.src='${fallbackCover}'">
        <div class="card-body">
          <span class="card-type">${kind === "albums" ? "ALBUM" : "PLAYLIST"}</span>
          <h2 class="card-title">${title}</h2>
          <p class="card-description">${description}</p>
          <div class="card-actions"><a class="open-link" href="${url}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-play"></i> Open on Suno</a></div>
        </div>
      </article>`;
    }).join("");
    empty.hidden = items.length !== 0;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  }
  function safeImage(value) {
    try { const u = new URL(value); return u.protocol === "https:" ? escapeHtml(u.href) : fallbackCover; }
    catch { return fallbackCover; }
  }

  document.querySelectorAll(".nav-tab").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(x => x.classList.toggle("active", x === button));
    document.querySelectorAll(".library-section").forEach(x => x.classList.toggle("active", x.id === button.dataset.target));
  }));
  document.querySelectorAll(".view-btn").forEach(button => button.addEventListener("click", () => {
    const kind = button.dataset.kind;
    views[kind] = button.dataset.view;
    document.querySelectorAll(`.view-btn[data-kind="${kind}"]`).forEach(x => x.classList.toggle("active", x === button));
    render(kind);
  }));
  document.getElementById("search").addEventListener("input", () => { render("albums"); render("playlists"); });
  render("albums");
  render("playlists");
})();
