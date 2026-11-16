# Portfolio Admin (Supabase)

Your portfolio now has an admin page where every section can be edited:
hero, about, education, marquee, technical skills, project folders, project
details, certifications, experience, contact details, form labels, footer,
navigation, and SEO.

The public site reads its content from Supabase. If Supabase is not configured
yet (or temporarily unavailable), it automatically falls back to the built-in
content in `content-default.js`, so the site never goes blank.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
   This creates:
   - `site_content` — one JSON row holding the whole portfolio
   - `admins` — the accounts allowed to publish
   - the public `media` bucket for uploaded images
   - row-level security policies

## 2. Create your admin login

1. In Supabase, open **Authentication → Users → Add user**.
2. Enter your email and a strong password.
3. Confirm the user (or turn off email confirmation for this project).
4. Copy the user's UUID.
5. In **SQL Editor**, run:

```sql
insert into public.admins (user_id, email)
values ('PASTE-YOUR-USER-UUID', 'you@example.com')
on conflict (user_id) do nothing;
```

6. Optional but recommended: **Authentication → Providers → Email** and disable
   public sign-ups, so nobody else can create an account.

## 3. Connect the site

Open `supabase-config.js` and paste:

```js
window.PORTFOLIO_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-PUBLIC-KEY",
  MEDIA_BUCKET: "media",
  TABLE: "site_content"
};
```

Find both values in **Project Settings → API**.

- The **anon key** is meant to be public. It is safe in a static site.
- **Never** put the `service_role` key in this file or anywhere in the browser.

## 4. Publish the first version

1. Open `admin.html` (for example `http://localhost:8000/admin.html`).
2. Sign in with the admin account.
3. The first sign-in loads the built-in defaults.
4. Click **Save & publish**.

Refresh `index.html` and the content now comes from Supabase.

---

## Editing

- **Sidebar** jumps between sections.
- **Text / textarea** fields save into the content object as you type.
- **Tags** fields are one item per line (skills, roles, bullet points, paragraphs).
- **Image** fields accept either a URL or an uploaded file. Uploads go to
  Supabase Storage and return a public URL.
- **Lists** (projects, certificates, timeline entries, nav links, etc.) have
  ↑ ↓ reorder and ✕ remove. Use the add button to append an item.
- **Save & publish** writes the whole content object to `site_content` row `1`.
- `Ctrl/Cmd + S` also saves.
- **Export JSON** downloads a backup of everything.
- **Import JSON** restores a backup into the editor (review, then publish).
- **Demo mode** opens the full editor without saving, useful for trying fields
  before connecting Supabase.

Changes are live for visitors as soon as you save and they reload the page.

---

## Deploying

Deploy the whole folder as a static site (GitHub Pages, Netlify, Vercel,
Cloudflare Pages, etc.):

```
index.html
admin.html
styles.css
admin.css
script.js
content.js
content-default.js
content-schema.js
supabase-config.js
images/
John_Nelson_Parungao_CV.pdf
```

`admin.html` is just a static page; Supabase handles login and storage. You can
rename it to `admin/index.html` if you prefer `/admin/` as the URL.

`README-ADMIN.md` and `supabase/` do not need to be deployed, but leaving them
in the repo is harmless.

---

## Security model

- Public visitors can only **read** `site_content` and the `media` bucket.
- Only users listed in `public.admins` can insert/update content or upload files.
- Login uses Supabase Auth; the browser stores a session token in `localStorage`.
- The admin page is `noindex`, but it is not hidden by obscurity — the RLS
  policies are what protect it.

To revoke access, delete the row from `public.admins` (or delete the auth user).
To rotate access, change the password in Supabase Authentication.

---

## Troubleshooting

**"This account is not in the admins table"**
Add the auth user's UUID to `public.admins` (step 2).

**Save fails with permission denied**
Re-run the policy section of `supabase/schema.sql`, and confirm the user exists
in both `auth.users` and `public.admins`.

**Image upload fails**
Confirm the `media` bucket exists and is public, and that the storage policies
from `schema.sql` were created.

**Site shows old content**
Hard-refresh the page. Browser caching can hold `content.js`, but content is
fetched from Supabase on every load, so a normal reload is usually enough.

**Site looks broken / blank content**
Open the browser console. If Supabase is unreachable, the site should fall back
to defaults automatically. If it does not, check that `content-default.js` and
`content.js` are present and load before `script.js`.

**Admin page says "Connect Supabase"**
`supabase-config.js` still has an empty URL or anon key. Use **Open demo
editor** to explore the interface meanwhile.

---

## Content fields worth knowing

- `hero.socials` — leave GitHub/LinkedIn blank to show a disabled icon.
- `projects.items[].details.links` — blank links render as disabled buttons.
- `certifications.items[].link` — optional; adds a **View Certificate** button.
- `projects.items[].details.shots` — each screenshot can have its own image and
  caption; without an image it shows a striped placeholder.
- `contact.items[].type` — controls whether the value becomes an email, phone,
  or URL link.
- `nav.links[].mobileOnly` — keeps an item inside the mobile menu only.
