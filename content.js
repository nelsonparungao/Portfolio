/* Public content loader + renderer.
 * Reads site_content from Supabase when configured, otherwise renders
 * the built-in default content. Sets window.CONTENT_READY so script.js
 * initializes interactions only after all editable markup exists.
 */
(() => {
  "use strict";

  const CFG = window.PORTFOLIO_CONFIG || {};
  const DEFAULTS = window.PORTFOLIO_DEFAULT_CONTENT || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const arr = v => Array.isArray(v) ? v : [];
  const tel = v => "tel:" + String(v || "").replace(/[^\d+]/g, "");
  const mail = v => "mailto:" + String(v || "").trim();
  const isLink = v => !!v && String(v).trim() !== "" && String(v).trim() !== "N/A";

  const deepMerge = (base, saved) => {
    if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
    if (base && typeof base === "object") {
      const out = { ...base };
      if (saved && typeof saved === "object") {
        Object.keys(saved).forEach(k => {
          out[k] = k in base ? deepMerge(base[k], saved[k]) : saved[k];
        });
      }
      return out;
    }
    return saved === undefined || saved === null ? base : saved;
  };

  const setText = (sel, value, root = document) => {
    const el = $(sel, root);
    if (el) el.textContent = value ?? "";
  };

  const icon = (id, cls = "ic") => `<svg class="${cls}" aria-hidden="true"><use href="#${esc(id)}"/></svg>`;
  const tags = list => `<ul class="tags">${arr(list).map(t => `<li>${esc(t)}</li>`).join("")}</ul>`;

  const buttonHTML = (btn, fallbackStyle = "lime", arrow = true) => {
    const b = btn || {};
    if (!isLink(b.href)) return "";
    const cls = `btn ${esc(b.style || fallbackStyle)}`;
    const label = esc(String(b.label || "").replace(/\s*:\s*N\/A\s*$/i, ""));
    return `<a class="${cls}" href="${esc(b.href)}">${label}${arrow ? icon("i-arrow") : ""}</a>`;
  };

  const socialLinksHTML = s => {
    s = s || {};
    return [
      { key: "github", label: "GitHub", icon: "i-github" },
      { key: "linkedin", label: "LinkedIn", icon: "i-linkedin" },
      { key: "phone", label: "Call", icon: "i-phone", href: tel(s.phone) },
      { key: "email", label: "Email", icon: "i-mail", href: mail(s.email) }
    ]
      .map(item => {
        const value = s[item.key];
        const url = item.href ? (isLink(value) ? item.href : "") : value;
        return { ...item, url };
      })
      .filter(item => isLink(item.url))
      .map(item => {
        const href = item.url;
        const external = /^https?:/i.test(href);
        return `<a class="sq" href="${esc(href)}" aria-label="${esc(item.label)}"${external ? ' target="_blank" rel="noopener"' : ""}>${icon(item.icon)}</a>`;
      }).join("");
  };

  /* ---------------------------------------------------------------- */
  /* Individual section renderers                                      */
  /* ---------------------------------------------------------------- */

  function renderBrand(c) {
    document.title = c.meta.title || c.brand.name;
    const md = $('meta[name="description"]');
    if (md) md.setAttribute("content", c.meta.description || "");
    const full = c.brand.name || c.brand.logo || "";
    $$(".logo").forEach((logo, i) => {
      logo.textContent = c.brand.logo || c.brand.monogram || "";
      logo.setAttribute("aria-label", i === 0
        ? `${c.brand.monogram || full}, home`
        : `${c.brand.monogram || full}, back to top`);
    });
  }

  function renderNav(c) {
    const links = arr(c.nav && c.nav.links);
    $("#links").innerHTML = links.map(l =>
      `<li${l.mobileOnly ? ' class="mob"' : ""}><a href="${esc(l.href || "#")}">${esc(l.label)}</a></li>`
    ).join("");

    const cta = $(".head .cta-h");
    if (cta && c.nav.cta) {
      cta.href = c.nav.cta.href || "#contact";
      cta.className = `cell cta-h ${c.nav.cta.style || "purple"}`;
      cta.innerHTML = `${esc(c.nav.cta.label)} ${icon("i-arrow")}`;
    }
  }

  function renderHero(c) {
    const h = c.hero;

    const tag = $(".hero .tag.wave");
    if (tag) tag.innerHTML = `${esc(h.greet)} <i class="wv" aria-hidden="true">${esc(h.wave)}</i>`;

    const h1 = $(".hero h1");
    if (h1) {
      h1.setAttribute("aria-label", `${h.firstName || ""} ${h.lastName || ""}`.trim());
      const lines = $$(".ln span", h1);
      if (lines[0]) lines[0].textContent = h.firstName || "";
      if (lines[1]) lines[1].textContent = h.lastName || "";
    }

    const sub = $(".hero .sub");
    if (sub) sub.innerHTML = arr(h.roles).map(r => `<span>${esc(r)}</span>`).join("");

    setText(".hero .lead", h.lead);

    const btns = $$(".hero .btns a");
    if (btns[0]) {
      btns[0].href = h.primaryBtn.href || "#projects";
      btns[0].className = `btn ${h.primaryBtn.style || "lime"}`;
      btns[0].innerHTML = `${esc(h.primaryBtn.label)} ${icon("i-ur")}`;
    }
    if (btns[1]) {
      const resumeHref = h.resumeFile || h.resumeBtn.href || "#";
      btns[1].href = resumeHref;
      btns[1].className = `btn ${h.resumeBtn.style || "white"}`;
      if (/\.pdf($|\?)/i.test(resumeHref)) {
        btns[1].setAttribute("download", resumeHref.split("/").pop().split("?")[0] || "resume.pdf");
      } else {
        btns[1].removeAttribute("download");
      }
      btns[1].innerHTML = `${esc(h.resumeBtn.label)} ${icon("i-down")}`;
    }

    setText(".hero .cw", h.connectLabel);

    const socs = $(".hero .socs");
    if (socs) socs.innerHTML = socialLinksHTML(h.socials);

    const avail = $(".hero .avail");
    if (avail) avail.innerHTML = `<i class="dot"></i> ${esc(h.availability)}`;

    const img = $(".hero .pimg");
    if (img) {
      img.src = h.portrait || "";
      img.alt = h.portraitAlt || "";
    }

    const code = $(".hero .code");
    if (code) {
      const rows = [
        { key: "role", value: h.codeRole },
        { key: "focus", value: h.codeFocus },
        { key: "stack", value: h.codeStack },
        { key: "status", value: h.codeStatus }
      ].filter(r => r.value);
      const lines = [
        `<span class="cl" style="--n:${16 + (h.codeName || "").length};--d:.9s"><i class="g">&gt;</i> <i class="w">const</i> <i class="y">${esc(h.codeName || "jnp")}</i> = {</span>`,
        ...rows.map((r, i) => {
          const text = `  ${r.key}: '${r.value}',`;
          return `<span class="cl" style="--n:${text.length + 4};--d:${(1.4 + i * .8).toFixed(1)}s">&nbsp; <i class="p">${esc(r.key)}</i>: <i class="y">'${esc(r.value)}'</i>,</span>`;
        }),
        `<span class="cl cur" style="--n:1;--d:${(1.6 + rows.length * .8).toFixed(1)}s">}</span>`
      ];
      code.innerHTML = lines.join("");
    }
  }

  function renderAbout(c) {
    const a = c.about;
    const head = $(".about > .cell:first-child .h");
    if (head) head.innerHTML = `${esc(a.heading)}${a.headingAccent ? ` <span class="hl2">${esc(a.headingAccent)}</span>` : ""}`;

    const cell = $(".about > .cell:first-child");
    if (cell) {
      $$("p", cell).forEach(p => p.remove());
      const paras = arr(a.paragraphs).filter(Boolean);
      const html = paras.map((p, i) => `<p${i === 0 ? ' class="p1"' : ""}>${esc(p)}</p>`).join("");
      head ? head.insertAdjacentHTML("afterend", html) : cell.insertAdjacentHTML("beforeend", html);
    }

    const e = a.education || {};
    setText(".about .edu .h3", e.heading);
    setText(".about .edu .school small", e.eyebrow);
    setText(".about .edu .school-meta strong", e.school);

    const logo = $(".about .school-logo");
    if (logo) logo.classList.remove("no-img");
    const logoImg = $(".about .school-logo img");
    if (logoImg) {
      logoImg.src = e.logo || "";
      logoImg.alt = e.logoAlt || "";
    }

    const card = $(".about .edu .card");
    if (card) {
      card.innerHTML = arr(e.rows).map(row =>
        `<div><dt>${esc(row.label)}</dt><dd>${esc(row.value)}</dd></div>`
      ).join("");
    }
  }

  function renderMarquee(c) {
    const mq = $("#mq");
    if (!mq) return;
    mq.innerHTML = arr(c.marquee && c.marquee.items).map(item =>
      `<li><svg class="lg" aria-hidden="true"><use href="#${esc(item.icon || "l-html")}"/></svg><span>${esc(item.label)}</span></li>`
    ).join("");

    const sk = $(".strip .sk-l");
    if (sk && c.marquee) {
      sk.href = c.marquee.href || "#skills-all";
      sk.innerHTML = `${esc(c.marquee.label || "SKILLS")} ${icon("i-arrow")}`;
    }
  }

  function renderSkills(c) {
    const s = c.skills;
    const head = $(".skills-all .sk-head .h");
    if (head) head.innerHTML = `${esc(s.heading)}${s.headingAccent ? ` <span class="hl2">${esc(s.headingAccent)}</span>` : ""}`;
    setText(".skills-all .sk-sub", s.sub);
    setText(".skills-all .count", s.count);

    const section = $(".skills-all");
    if (!section) return;
    $$(".skc", section).forEach(el => el.remove());

    const groups = arr(s.groups);
    groups.forEach((g, i) => {
      const size = groups.length > 1 && i === groups.length - 1 ? "full" : "wide";
      const html = `
        <div class="skc a-${esc(g.color || "pink")} ${size}">
          <div class="skc-head">
            <span class="skc-n">${String(i + 1).padStart(2, "0")}</span>
            <h3 class="chip ${esc(g.color || "pink")}">${esc(g.title)}</h3>
          </div>
          ${tags(g.items)}
        </div>`;
      section.insertAdjacentHTML("beforeend", html);
    });
  }

  function renderProjects(c) {
    const p = c.projects;
    setText(".proj .ph-head .h", p.heading);
    setText(".proj .ph-head .count", p.count);

    const folders = $("#folders");
    if (!folders) return;
    const items = arr(p.items);

    const tabs = items.map((item, i) => `
      <button class="f-tab ${esc(item.color || "pink")}${i === 0 ? " open" : ""}" type="button"
        id="fold-${i}-tab" aria-expanded="${i === 0}" aria-controls="fold-${i}">
        <span class="f-i">${String(i + 1).padStart(2, "0")}</span>
        <span class="f-n">${esc(item.title)}</span>
      </button>`).join("");

    const panels = items.map((item, i) => {
      const d = item.details || {};
      const color = item.color || "pink";
      const cover = item.cover
        ? `<span><img src="${esc(item.cover)}" alt="${esc(item.coverAlt || item.title)}"></span>`
        : `<span>${esc(item.coverAlt || `Upload ${item.title} screenshot`)}</span>`;

      const shots = arr(d.shots).filter(s => s && (s.image || s.caption));
      const frames = ["desktop", "mobile", "tablet", "natural"];
      const shotsHTML = shots.length ? `
        <div class="m-shots">
          ${shots.map(s => {
            const frame = frames.includes(s.frame) ? s.frame : "desktop";
            const caption = s.caption || "";
            const media = s.image
              ? `<img src="${esc(s.image)}" alt="${esc(caption || "Project screenshot")}">`
              : `<span class="mshot-ph">${icon("i-image")}<b>${esc(caption || "Screenshot coming soon")}</b></span>`;
            return `
              <figure class="mshot is-${frame}">
                <div class="mshot-view">
                  <span class="mshot-bar" aria-hidden="true"></span>
                  <div class="mshot-media">${media}</div>
                </div>
                ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}
              </figure>`;
          }).join("")}
        </div>` : "";

      const objectiveItems = arr(d.objectives && d.objectives.items);
      const contributionItems = arr(d.contributions && d.contributions.items);
      const listsHTML = (objectiveItems.length || contributionItems.length) ? `
        <div class="m-lists"${(!objectiveItems.length || !contributionItems.length) ? ' style="grid-template-columns:1fr"' : ""}>
          ${objectiveItems.length ? `<div><h4>${esc(d.objectives.title || "Objectives")}</h4><ul class="list">${objectiveItems.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
          ${contributionItems.length ? `<div><h4>${esc(d.contributions.title || "My contribution")}</h4><ul class="list">${contributionItems.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        </div>` : "";

      const links = arr(d.links).filter(l => l && isLink(l.href));
      const linksHTML = links.length ? `<div class="btns">${links.map(l => buttonHTML(l, "lime", false)).join("")}</div>` : "";
      const detailsLabel = /^view details$/i.test(p.detailsLabel || "") ? "View Project" : (p.detailsLabel || "View Project");

      return `
        <article class="folder${i === 0 ? " open" : ""}" id="fold-${i}" role="region" aria-labelledby="fold-${i}-tab"
          data-title="${esc(item.title)}" data-col="${esc(color)}"${i === 0 ? "" : " hidden inert"}>
          <div class="pframe ${esc(color)}">
            <div class="shot ph" role="img" aria-label="${esc(item.coverAlt || `${item.title} screenshot`)}">
              ${icon("i-image", "ic lg")}
              ${cover}
            </div>
          </div>

          <div class="sinfo">
            ${item.kicker ? `<p class="f-kicker">${esc(item.kicker)}</p>` : ""}
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.description)}</p>
            ${tags(item.tags)}
            <button class="btn lime more-btn" type="button">
              ${esc(detailsLabel)} ${icon("i-arrow")}
            </button>
          </div>

          <div class="more" hidden>
            ${d.fullTitle ? `<p class="full">${esc(d.fullTitle)}</p>` : ""}
            ${d.description ? `<p class="d2">${esc(d.description)}</p>` : ""}
            ${tags(item.tags)}
            ${shotsHTML}
            ${listsHTML}
            ${linksHTML}
          </div>
        </article>`;
    }).join("");

    folders.innerHTML = `
      <div class="f-tabs" role="tablist" aria-label="Featured projects">${tabs}</div>
      <div class="f-panels">${panels}</div>`;
  }

  function renderCertifications(c) {
    const certs = c.certifications;
    setText("#certifications .h", certs.heading);
    setText("#certifications .cnote", certs.note);

    const gal = $("#certifications .cgal");
    if (!gal) return;
    gal.innerHTML = arr(certs.items).map(cert => {
      const img = cert.image
        ? `<img src="${esc(cert.image)}" alt="${esc(cert.title)} certificate" loading="lazy">`
        : "";
      return `
        <button class="cshot${cert.image ? "" : " no-img"}" type="button"
          aria-label="${esc(cert.title)}${cert.year ? `, ${esc(cert.year)}` : ""}"
          data-title="${esc(cert.title)}"
          data-issuer="${esc(cert.issuer)}"
          data-year="${esc(cert.year)}"
          data-image="${esc(cert.image || "")}"
          data-link="${esc(cert.link || "")}">
          ${img}
          <span class="cph" aria-hidden="true">${icon("i-award")}</span>
        </button>`;
    }).join("");
  }

  function renderExperience(c) {
    const e = c.experience;
    const head = $(".exp .exl .h");
    if (head) head.innerHTML = `${esc(e.heading)} ${icon("i-arrow")}`;

    const tl = $(".exp .timeline");
    if (tl) {
      tl.innerHTML = arr(e.timeline).map(item => {
        const title = item.subtitle
          ? `${esc(item.title)} <i class="bu">•</i> ${esc(item.subtitle)}`
          : esc(item.title);
        return `
          <li>
            <h3>${title}</h3>
            ${item.tag ? `<p class="tag lime">${esc(item.tag)}</p>` : ""}
            ${item.text ? `<p class="obj">${esc(item.text)}</p>` : ""}
            ${arr(item.items).length ? `<ul class="list">${arr(item.items).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
          </li>`;
      }).join("");
    }

    const cta = e.cta || {};
    setText(".exp .cta .h", cta.heading);
    setText(".exp .cta p", cta.text);
    const ctaBtn = $(".exp .cta .btn");
    if (ctaBtn) {
      ctaBtn.href = cta.button.href || "#contact";
      ctaBtn.innerHTML = `${esc(cta.button.label)} ${icon("i-arrow")}`;
    }
  }

  function renderContact(c) {
    const ct = c.contact;
    setText(".contact .ci > .h", ct.heading);

    const list = $(".contact .clist2");
    if (list) {
      list.innerHTML = arr(ct.items).filter(item => item && isLink(item.value)).map(item => {
        const value = item.value || "";
        let content = esc(value);
        if (item.type === "email" && isLink(value)) content = `<a href="${esc(mail(value))}">${esc(value)}</a>`;
        else if (item.type === "phone" && isLink(value)) content = `<a href="${esc(tel(value))}">${esc(value)}</a>`;
        else if (item.type === "url" && isLink(value)) {
          content = /^https?:/i.test(value)
            ? `<a href="${esc(value)}" target="_blank" rel="noopener">${esc(value.replace(/^https?:\/\//, ""))}</a>`
            : `<a href="${esc(value)}">${esc(value)}</a>`;
        }
        return `
          <li>
            <span class="sq sm">${icon(item.icon || "i-link")}</span>
            <div><small>${esc(item.label)}</small><span>${content}</span></div>
          </li>`;
      }).join("");
    }

    const btns = $(".contact .ci .btns");
    if (btns) {
      btns.innerHTML = buttonHTML(ct.primaryBtn, "lime") + buttonHTML(ct.secondaryBtn, "white", false);
    }

    const f = ct.form || {};
    setText(".contact .form .h", f.heading);
    const map = [
      ["nameLabel", 0], ["emailLabel", 1], ["subjectLabel", 2], ["messageLabel", 3]
    ];
    const labels = $$(".contact .form label");
    map.forEach(([key, i]) => {
      const label = labels[i];
      if (!label) return;
      const node = [...label.childNodes].find(n => n.nodeType === 3 && n.nodeValue.trim());
      if (node) node.nodeValue = `\n                    ${f[key] || ""}\n                    `;
    });
    const submit = $(".contact .form button[type=submit]");
    if (submit) submit.innerHTML = `${esc(f.buttonLabel)} ${icon("i-send")}`;
    setText(".contact .form .fnote", f.note);
  }

  function renderFooter(c) {
    const f = c.footer;
    setText(".foot .fc > p", f.copyright);
    setText(".foot .fc .ft", f.tagline);
    const nav = $(".foot .fc nav");
    if (nav) nav.innerHTML = arr(f.links).map(l => `<a href="${esc(l.href || "#")}">${esc(l.label)}</a>`).join("");
    const socials = $(".foot .fs");
    if (socials) socials.innerHTML = socialLinksHTML(f.socials);
  }

  function applyTheme(t) {
    if (!t) return;
    const hex = v => /^#[0-9a-f]{3,8}$/i.test(String(v || "")) ? String(v) : null;
    const rootRules = [["--pink", t.pink], ["--lime", t.lime], ["--purple", t.purple]]
      .filter(([, v]) => hex(v))
      .map(([k, v]) => `${k}:${v}`);
    const lightRules = [["--page", t.page], ["--paper", t.paper], ["--ink", t.ink], ["--bd", t.ink]]
      .filter(([, v]) => hex(v))
      .map(([k, v]) => `${k}:${v}`);

    let el = document.getElementById("content-theme");
    if (!el) {
      el = document.createElement("style");
      el.id = "content-theme";
      document.head.appendChild(el);
    }
    el.textContent = [
      rootRules.length ? `:root{${rootRules.join(";")}}` : "",
      lightRules.length ? `:root:not([data-theme="dark"]){${lightRules.join(";")}}` : ""
    ].filter(Boolean).join("\n");
  }

  function render(c) {
    applyTheme(c.theme);
    renderBrand(c);
    renderNav(c);
    renderHero(c);
    renderAbout(c);
    renderMarquee(c);
    renderSkills(c);
    renderProjects(c);
    renderCertifications(c);
    renderExperience(c);
    renderContact(c);
    renderFooter(c);
  }

  async function loadContent() {
    const url = String(CFG.SUPABASE_URL || "").replace(/\/+$/, "");
    const key = CFG.SUPABASE_ANON_KEY || "";
    const table = CFG.TABLE || "site_content";
    if (!url || !key) return { content: DEFAULTS, source: "defaults" };

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      let res;
      try {
        res = await fetch(`${url}/rest/v1/${table}?id=eq.1&select=data`, {
          headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
          signal: controller.signal
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) throw new Error(`Supabase returned ${res.status}`);
      const rows = await res.json();
      const saved = rows && rows[0] && rows[0].data;
      if (saved && typeof saved === "object" && Object.keys(saved).length) {
        return { content: deepMerge(DEFAULTS, saved), source: "supabase" };
      }
      return { content: DEFAULTS, source: "defaults" };
    } catch (err) {
      console.warn("[portfolio] Could not load Supabase content, using defaults.", err);
      return { content: DEFAULTS, source: "error" };
    }
  }

  applyTheme(DEFAULTS.theme);

  window.CONTENT_READY = loadContent().then(({ content, source }) => {
    try {
      render(content);
      window.PORTFOLIO_CONTENT = content;
      window.PORTFOLIO_CONTENT_SOURCE = source;
    } catch (err) {
      console.error("[portfolio] Content render failed.", err);
      try { render(DEFAULTS); } catch (e) {}
    }
  });
})();
