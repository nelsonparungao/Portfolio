/* Supabase admin editor. */
(() => {
  "use strict";

  const CFG = window.PORTFOLIO_CONFIG || {};
  const DEFAULTS = window.PORTFOLIO_DEFAULT_CONTENT || {};
  const SCHEMA = window.CMS_SCHEMA || [];

  const url = String(CFG.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = CFG.SUPABASE_ANON_KEY || "";
  const bucket = CFG.MEDIA_BUCKET || "media";
  const table = CFG.TABLE || "site_content";
  const configured = !!(url && key);
  const SESSION_KEY = "portfolio-admin-session";

  const $ = id => document.getElementById(id);
  const setupEl = $("setup"), loginEl = $("login"), editorEl = $("editor");
  const loginForm = $("loginForm"), loginError = $("loginError"), loginBtn = $("loginBtn");
  const statusEl = $("status"), formEl = $("editorForm"), navEl = $("sectionNav");
  const savebar = $("savebar"), saveBtn = $("saveBtn"), dirtyText = $("dirtyText");
  const toastEl = $("toast"), logoutBtn = $("logout");

  let content = null;
  let session = null;
  let demo = false;
  let dirty = false;
  let navObserver = null;
  let toastTimer = 0;

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const clone = obj => JSON.parse(JSON.stringify(obj));
  const optVal = o => (o && typeof o === "object") ? o.value : o;
  const optLabel = o => (o && typeof o === "object") ? (o.label ?? o.value) : o;

  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const set = (obj, path, value) => {
    const parts = path.split(".");
    const last = parts.pop();
    let cur = obj;
    parts.forEach(k => {
      if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
      cur = cur[k];
    });
    cur[last] = value;
  };

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

  /* -------------------------------------------------------------- */
  /* Session                                                         */
  /* -------------------------------------------------------------- */

  const readSession = () => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; }
  };
  const writeSession = s => {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  };
  const clearSession = () => {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    session = null;
  };

  const sessionUser = async token => {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return res.json();
  };

  const refreshSession = async () => {
    if (!session || !session.refresh) return false;
    try {
      const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh })
      });
      if (!res.ok) return false;
      const d = await res.json();
      session = {
        access: d.access_token,
        refresh: d.refresh_token || session.refresh,
        email: d.user ? d.user.email : session.email,
        userId: d.user ? d.user.id : session.userId
      };
      writeSession(session);
      return true;
    } catch (e) {
      return false;
    }
  };

  const authFetch = async (path, options = {}, retry = true) => {
    if (!session) throw new Error("Not signed in.");
    const headers = {
      ...(options.headers || {}),
      apikey: key,
      Authorization: `Bearer ${session.access}`
    };
    const res = await fetch(path, { ...options, headers });
    if (res.status === 401 && retry && session.refresh) {
      if (await refreshSession()) return authFetch(path, options, false);
    }
    return res;
  };

  const isAdmin = async () => {
    if (!session || !session.userId) return false;
    const res = await authFetch(`${url}/rest/v1/admins?select=user_id&user_id=eq.${encodeURIComponent(session.userId)}`);
    if (!res.ok) return false;
    const rows = await res.json();
    return Array.isArray(rows) && rows.length > 0;
  };

  /* -------------------------------------------------------------- */
  /* UI helpers                                                      */
  /* -------------------------------------------------------------- */

  const show = panel => {
    setupEl.hidden = panel !== "setup";
    loginEl.hidden = panel !== "login";
    editorEl.hidden = panel !== "editor";
    logoutBtn.hidden = panel !== "editor" || demo;
    if (panel !== "editor") savebar.hidden = true;
  };

  const setStatus = (text, kind = "") => {
    statusEl.textContent = text;
    statusEl.className = "adm-status" + (kind ? ` is-${kind}` : "");
  };

  const toast = (message, isError = false) => {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.className = "adm-toast" + (isError ? " is-error" : "");
    toastEl.hidden = false;
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4500);
  };

  const markDirty = message => {
    dirty = true;
    savebar.hidden = false;
    savebar.classList.toggle("is-demo", demo);
    dirtyText.textContent = message || "Unsaved changes";
    saveBtn.disabled = demo;
    saveBtn.textContent = demo ? "Demo only" : "Save & publish";
  };

  const clean = () => {
    dirty = false;
    savebar.hidden = true;
    saveBtn.disabled = false;
    saveBtn.textContent = "Save & publish";
  };

  const rerender = () => {
    const y = window.scrollY;
    renderEditor();
    requestAnimationFrame(() => window.scrollTo(0, y));
  };

  const errorText = async res => {
    try {
      const j = await res.json();
      return j.message || j.error_description || j.hint || j.details || `Request failed (${res.status})`;
    } catch (e) {
      return `Request failed (${res.status})`;
    }
  };

  /* -------------------------------------------------------------- */
  /* Content loading                                                 */
  /* -------------------------------------------------------------- */

  const fetchContent = async () => {
    const res = await fetch(`${url}/rest/v1/${table}?id=eq.1&select=data,updated_at`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${session ? session.access : key}`,
        Accept: "application/json"
      }
    });
    if (!res.ok) throw new Error(await errorText(res));
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    const hasData = !!(row && row.data && Object.keys(row.data).length);
    return {
      content: hasData ? deepMerge(DEFAULTS, row.data) : clone(DEFAULTS),
      hasData,
      updatedAt: row ? row.updated_at : null
    };
  };

  const openEditor = async () => {
    try {
      const data = await fetchContent();
      content = data.content;
      demo = false;
      renderEditor();
      show("editor");

      if (data.hasData) {
        const when = data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "previously";
        setStatus(`Published content loaded · last saved ${when}`, "ok");
        clean();
      } else {
        setStatus("No published content yet. Defaults are loaded — click Save to publish them.", "warn");
        markDirty("Defaults ready to publish");
      }
    } catch (err) {
      show("login");
      setLoginError(err.message || "Could not load content.");
    }
  };

  const setLoginError = message => {
    if (!message) {
      loginError.hidden = true;
      loginError.textContent = "";
      return;
    }
    loginError.hidden = false;
    loginError.textContent = message;
  };

  /* -------------------------------------------------------------- */
  /* Editor rendering                                                */
  /* -------------------------------------------------------------- */

  function renderEditor() {
    formEl.innerHTML = "";
    navEl.innerHTML = "";

    const sections = SCHEMA.map((section, index) => {
      const sec = document.createElement("section");
      sec.className = "adm-section";
      sec.id = `sec-${section.id}`;
      sec.innerHTML = `
        <div class="adm-sec-head">
          <h2>${esc(section.title)}</h2>
          <span class="adm-count">${String(index + 1).padStart(2, "0")}</span>
        </div>
        <div class="adm-fields"></div>`;
      renderFields(sec.querySelector(".adm-fields"), section.fields, content);
      formEl.appendChild(sec);
      return sec;
    });

    navEl.innerHTML = SCHEMA.map(section =>
      `<a href="#sec-${esc(section.id)}">${esc(section.title)}</a>`
    ).join("");

    navEl.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        navEl.querySelectorAll("a").forEach(x => x.classList.toggle("active", x === a));
      });
    });

    if (navObserver) navObserver.disconnect();
    if ("IntersectionObserver" in window) {
      navObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navEl.querySelectorAll("a").forEach(a =>
            a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      }, { rootMargin: "-15% 0px -70% 0px" });
      sections.forEach(s => navObserver.observe(s));
    }

    savebar.classList.toggle("is-demo", demo);
    saveBtn.disabled = demo;
    saveBtn.textContent = demo ? "Demo only" : "Save & publish";
  }

  function renderFields(container, fields, obj) {
    fields.forEach(field => {
      if (field.type === "group") {
        const group = document.createElement("fieldset");
        group.className = "adm-group";
        const legend = document.createElement("legend");
        legend.textContent = field.label || "";
        group.appendChild(legend);
        renderFields(group, field.fields, obj);
        container.appendChild(group);
        return;
      }
      if (field.type === "list") {
        renderList(container, field, obj);
        return;
      }
      container.appendChild(renderField(field, obj));
    });
  }

  function fieldShell(field, wide) {
    const wrap = document.createElement("div");
    wrap.className = "adm-field" + (wide ? " is-wide" : "");
    if (field.type === "list") wrap.classList.add("is-list");

    const label = document.createElement("label");
    label.textContent = field.label || field.path;
    wrap.appendChild(label);

    if (field.help) {
      const help = document.createElement("span");
      help.className = "adm-help";
      help.textContent = field.help;
      wrap.appendChild(help);
    }
    return wrap;
  }

  function renderField(field, obj) {
    if (field.type === "image") return renderImageField(field, obj);
    if (field.type === "file") return renderFileField(field, obj);

    const wide = field.type === "textarea" || field.type === "tags";
    const wrap = fieldShell(field, wide);
    const value = get(obj, field.path);

    let input;
    if (field.type === "textarea" || field.type === "tags") {
      input = document.createElement("textarea");
      input.rows = field.type === "tags" ? 4 : 3;
      input.value = field.type === "tags"
        ? (Array.isArray(value) ? value.join("\n") : "")
        : (value || "");
      input.addEventListener("input", () => {
        const v = field.type === "tags"
          ? input.value.split(/\r?\n/).map(x => x.trim()).filter(Boolean)
          : input.value;
        set(obj, field.path, v);
        markDirty();
      });
    } else if (field.type === "select") {
      input = document.createElement("select");
      const options = field.options || [];
      options.forEach(option => {
        const o = document.createElement("option");
        o.value = String(optVal(option));
        o.textContent = optLabel(option);
        if (String(optVal(option)) === String(value)) o.selected = true;
        input.appendChild(o);
      });
      input.addEventListener("change", () => {
        const picked = options.find(o => String(optVal(o)) === input.value);
        set(obj, field.path, picked === undefined ? input.value : optVal(picked));
        markDirty();
      });
    } else {
      input = document.createElement("input");
      input.type = field.type === "url" ? "url" : field.type === "email" ? "email" : "text";
      input.value = value == null ? "" : String(value);
      input.addEventListener("input", () => {
        set(obj, field.path, input.value);
        markDirty();
      });
    }

    wrap.appendChild(input);
    return wrap;
  }

  function renderImageField(field, obj) {
    const wrap = fieldShell(field, true);
    const value = get(obj, field.path) || "";

    const row = document.createElement("div");
    row.className = "adm-image-row";

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.placeholder = "Image URL or upload";
    urlInput.value = value;
    row.appendChild(urlInput);

    const upload = document.createElement("label");
    upload.className = "adm-upload";
    upload.textContent = "Upload";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    upload.appendChild(file);
    row.appendChild(upload);

    const thumb = document.createElement("img");
    thumb.className = "adm-thumb";
    thumb.alt = "Preview";
    thumb.hidden = !value;
    if (value) thumb.src = value;

    urlInput.addEventListener("input", () => {
      set(obj, field.path, urlInput.value.trim());
      thumb.hidden = !urlInput.value.trim();
      thumb.src = urlInput.value.trim();
      markDirty();
    });

    file.addEventListener("change", async () => {
      const picked = file.files && file.files[0];
      if (!picked) return;
      if (!configured || demo) {
        toast("Demo mode cannot upload images. Configure Supabase first.", true);
        file.value = "";
        return;
      }
      if (picked.size > 20 * 1024 * 1024) {
        toast("That image is larger than 20 MB.", true);
        file.value = "";
        return;
      }
      upload.textContent = "Uploading…";
      upload.appendChild(file);
      try {
        const publicUrl = await uploadFile(picked);
        set(obj, field.path, publicUrl);
        urlInput.value = publicUrl;
        thumb.src = publicUrl;
        thumb.hidden = false;
        markDirty();
        toast("Image uploaded.");
      } catch (err) {
        toast(err.message || "Image upload failed.", true);
      } finally {
        upload.textContent = "Upload";
        upload.appendChild(file);
        file.value = "";
      }
    });

    wrap.appendChild(row);
    wrap.appendChild(thumb);
    return wrap;
  }

  function renderFileField(field, obj) {
    const wrap = fieldShell(field, true);
    const value = get(obj, field.path) || "";

    const row = document.createElement("div");
    row.className = "adm-image-row";

    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.placeholder = "File URL or upload";
    urlInput.value = value;
    row.appendChild(urlInput);

    const upload = document.createElement("label");
    upload.className = "adm-upload";
    upload.textContent = "Upload";
    const file = document.createElement("input");
    file.type = "file";
    file.accept = field.accept || "*/*";
    upload.appendChild(file);
    row.appendChild(upload);

    urlInput.addEventListener("input", () => {
      set(obj, field.path, urlInput.value.trim());
      markDirty();
    });

    file.addEventListener("change", async () => {
      const picked = file.files && file.files[0];
      if (!picked) return;
      if (!configured || demo) {
        toast("Demo mode cannot upload files. Configure Supabase first.", true);
        file.value = "";
        return;
      }
      if (picked.size > 20 * 1024 * 1024) {
        toast("That file is larger than 20 MB.", true);
        file.value = "";
        return;
      }
      upload.textContent = "Uploading…";
      upload.appendChild(file);
      try {
        const publicUrl = await uploadFile(picked);
        set(obj, field.path, publicUrl);
        urlInput.value = publicUrl;
        markDirty();
        toast("File uploaded.");
      } catch (err) {
        toast(err.message || "File upload failed.", true);
      } finally {
        upload.textContent = "Upload";
        upload.appendChild(file);
        file.value = "";
      }
    });

    wrap.appendChild(row);
    return wrap;
  }

  function renderList(container, field, obj) {
    let items = get(obj, field.path);
    if (!Array.isArray(items)) {
      items = [];
      set(obj, field.path, items);
    }

    const wrap = document.createElement("div");
    wrap.className = "adm-field is-list";

    const head = document.createElement("label");
    head.textContent = field.label || field.path;
    wrap.appendChild(head);

    const list = document.createElement("div");
    list.className = "adm-list";

    items.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "adm-item";

      const itemHead = document.createElement("div");
      itemHead.className = "adm-item-head";
      const title = field.itemLabel ? get(item, field.itemLabel) : "";
      itemHead.innerHTML = `
        <span class="adm-item-n">${String(index + 1).padStart(2, "0")}</span>
        <strong>${esc(title || `Item ${index + 1}`)}</strong>
        <div class="adm-item-actions">
          <button class="adm-mini" type="button" data-move="up" title="Move up" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="adm-mini" type="button" data-move="down" title="Move down" ${index === items.length - 1 ? "disabled" : ""}>↓</button>
          <button class="adm-mini is-danger" type="button" data-remove title="Remove">✕</button>
        </div>`;
      card.appendChild(itemHead);

      const body = document.createElement("div");
      body.className = "adm-item-body";
      renderFields(body, field.fields, item);
      card.appendChild(body);

      itemHead.querySelector("[data-move=up]").addEventListener("click", () => {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        markDirty();
        rerender();
      });
      itemHead.querySelector("[data-move=down]").addEventListener("click", () => {
        [items[index + 1], items[index]] = [items[index], items[index + 1]];
        markDirty();
        rerender();
      });
      itemHead.querySelector("[data-remove]").addEventListener("click", () => {
        if (!confirm(`Remove "${title || `item ${index + 1}`}"?`)) return;
        items.splice(index, 1);
        markDirty();
        rerender();
      });

      list.appendChild(card);
    });

    wrap.appendChild(list);

    const add = document.createElement("button");
    add.className = "adm-add";
    add.type = "button";
    add.textContent = field.addLabel || "Add item";
    add.addEventListener("click", () => {
      items.push(clone(field.template || {}));
      markDirty();
      rerender();
    });
    wrap.appendChild(add);

    container.appendChild(wrap);
  }

  /* -------------------------------------------------------------- */
  /* Upload + save                                                   */
  /* -------------------------------------------------------------- */

  async function uploadFile(file) {
    const rawExt = (file.name.split(".").pop() || "bin").toLowerCase();
    const ext = rawExt.replace(/[^a-z0-9]/g, "") || "bin";
    const base = file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "image";
    const path = `uploads/${Date.now()}-${base}.${ext}`;
    const encoded = path.split("/").map(encodeURIComponent).join("/");

    const res = await authFetch(`${url}/storage/v1/object/${bucket}/${encoded}`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
        "cache-control": "3600"
      },
      body: file
    });
    if (!res.ok) throw new Error(await errorText(res));
    return `${url}/storage/v1/object/public/${bucket}/${encoded}`;
  }

  async function save() {
    if (demo) return toast("Demo mode does not save. Connect Supabase to publish.", true);
    if (!configured) return toast("Add your Supabase URL and anon key first.", true);
    if (!session) return show("login");

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";
    try {
      const res = await authFetch(`${url}/rest/v1/${table}?on_conflict=id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify([{ id: 1, data: content, updated_at: new Date().toISOString() }])
      });
      if (!res.ok) throw new Error(await errorText(res));
      clean();
      setStatus(`Published successfully · ${new Date().toLocaleString()}`, "ok");
      toast("Published. Refresh your live site to see the changes.");
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save & publish";
      setStatus(err.message || "Save failed.", "error");
      toast(err.message || "Save failed.", true);
    }
  }

  /* -------------------------------------------------------------- */
  /* Login / boot                                                    */
  /* -------------------------------------------------------------- */

  const finishLogin = async (data, email) => {
    session = {
      access: data.access_token,
      refresh: data.refresh_token,
      email: data.user ? data.user.email : email,
      userId: data.user ? data.user.id : ""
    };
    writeSession(session);

    if (!(await isAdmin())) {
      clearSession();
      throw new Error("This account is not in the admins table. Add its user ID in Supabase.");
    }
    await openEditor();
  };

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!configured) return;
    setLoginError("");
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in…";
    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;
    try {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: key, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(await errorText(res));
      const data = await res.json();
      await finishLogin(data, email);
      loginForm.reset();
    } catch (err) {
      setLoginError(err.message || "Sign in failed.");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign in";
    }
  });

  logoutBtn.addEventListener("click", () => {
    if (dirty && !demo && !confirm("Discard unsaved changes and sign out?")) return;
    clearSession();
    demo = false;
    clean();
    setLoginError("");
    show("login");
  });

  $("demoBtn").addEventListener("click", () => {
    demo = true;
    content = clone(DEFAULTS);
    renderEditor();
    show("editor");
    setStatus("Demo mode: you can explore every field, but nothing is saved.", "warn");
    markDirty("Demo only — nothing will be saved");
  });

  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "portfolio-content.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Exported portfolio-content.json");
  });

  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Not a content object.");
      content = deepMerge(DEFAULTS, parsed);
      renderEditor();
      markDirty("Imported JSON — review and publish");
      toast("JSON imported. Review the fields, then save.");
    } catch (err) {
      toast(err.message || "Could not import that file.", true);
    } finally {
      e.target.value = "";
    }
  });

  saveBtn.addEventListener("click", save);

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (dirty && !demo) save();
    }
  });

  window.addEventListener("beforeunload", e => {
    if (!dirty || demo) return;
    e.preventDefault();
    e.returnValue = "";
  });

  formEl.addEventListener("submit", e => e.preventDefault());

  async function boot() {
    if (!configured) {
      show("setup");
      return;
    }

    const saved = readSession();
    if (!saved || !saved.access) {
      show("login");
      return;
    }

    session = saved;
    let user = await sessionUser(saved.access);
    if (!user && await refreshSession()) {
      user = await sessionUser(session.access);
    }

    if (!user) {
      clearSession();
      show("login");
      return;
    }

    session.userId = user.id || session.userId;
    session.email = user.email || session.email;
    writeSession(session);

    if (await isAdmin()) {
      await openEditor();
    } else {
      clearSession();
      show("login");
      setLoginError("This account is not in the admins table. Add its user ID in Supabase.");
    }
  }

  boot();
})();
