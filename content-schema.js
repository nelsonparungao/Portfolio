/* Admin editor schema.
 * Each section becomes a sidebar entry and a group of fields.
 * Types: text, textarea, tags, select, image, group, list.
 */
(() => {
  const color = { type: "select", options: ["pink", "lime", "purple"] };
  const button = (label, prefix) => ({
    type: "group", label,
    fields: [
      { path: `${prefix}.label`, label: "Label", type: "text" },
      { path: `${prefix}.href`, label: "Link", type: "text", help: "Leave blank to show a disabled button." },
      { path: `${prefix}.style`, label: "Style", ...color }
    ]
  });

  const projectLink = () => ({
    path: "details.links",
    type: "list", label: "Detail buttons", itemLabel: "label", addLabel: "Add button",
    template: { label: "View Project", href: "", style: "lime" },
    fields: [
      { path: "label", label: "Label", type: "text" },
      { path: "href", label: "Link", type: "text", help: "Blank = disabled." },
      { path: "style", label: "Style", ...color }
    ]
  });

  window.CMS_SCHEMA = [
    {
      id: "site",
      title: "Site & SEO",
      icon: "i-user",
      fields: [
        { path: "brand.logo", label: "Logo text", type: "text", help: "Shown in the header and footer." },
        { path: "brand.name", label: "Full name", type: "text" },
        { path: "brand.monogram", label: "Monogram / initials", type: "text" },
        { path: "meta.title", label: "Browser tab title", type: "text" },
        { path: "meta.description", label: "SEO description", type: "textarea" },
        {
          path: "nav.links", label: "Navigation links", type: "list", itemLabel: "label",
          addLabel: "Add navigation link",
          template: { label: "New link", href: "#", mobileOnly: false },
          fields: [
            { path: "label", label: "Label", type: "text" },
            { path: "href", label: "Link", type: "text" },
            { path: "mobileOnly", label: "Mobile menu only", type: "select", options: [{ value: false, label: "No" }, { value: true, label: "Yes" }] }
          ]
        },
        button("Header contact button", "nav.cta")
      ]
    },
    {
      id: "hero",
      title: "Hero",
      icon: "i-ur",
      fields: [
        { path: "hero.greet", label: "Greeting", type: "text" },
        { path: "hero.wave", label: "Greeting emoji", type: "text" },
        { path: "hero.firstName", label: "Name — line 1", type: "text" },
        { path: "hero.lastName", label: "Name — line 2", type: "text" },
        { path: "hero.roles", label: "Role lines", type: "tags" },
        { path: "hero.lead", label: "Intro paragraph", type: "textarea" },
        button("Primary button", "hero.primaryBtn"),
        button("Resume button", "hero.resumeBtn"),
        { path: "hero.resumeFile", label: "Resume PDF upload", type: "file", accept: ".pdf,application/pdf", help: "Optional. Uploading a PDF overrides the resume link." },
        { path: "hero.connectLabel", label: "Social heading", type: "text" },
        { path: "hero.availability", label: "Availability badge", type: "text" },
        { path: "hero.portrait", label: "Portrait image", type: "image" },
        { path: "hero.portraitAlt", label: "Portrait alt text", type: "text" },
        {
          type: "group", label: "Social links",
          fields: [
            { path: "hero.socials.github", label: "GitHub URL", type: "url" },
            { path: "hero.socials.linkedin", label: "LinkedIn URL", type: "url" },
            { path: "hero.socials.phone", label: "Phone", type: "text" },
            { path: "hero.socials.email", label: "Email", type: "email" }
          ]
        },
        {
          type: "group", label: "Profile code card",
          fields: [
            { path: "hero.codeName", label: "Variable name", type: "text" },
            { path: "hero.codeRole", label: "role", type: "text" },
            { path: "hero.codeFocus", label: "focus", type: "text" },
            { path: "hero.codeStack", label: "stack", type: "text" },
            { path: "hero.codeStatus", label: "status", type: "text" }
          ]
        }
      ]
    },
    {
      id: "about",
      title: "About & Education",
      icon: "i-school",
      fields: [
        { path: "about.heading", label: "Heading", type: "text" },
        { path: "about.headingAccent", label: "Highlighted word", type: "text" },
        { path: "about.paragraphs", label: "About paragraphs", type: "tags", help: "One paragraph per line." },
        { path: "about.education.heading", label: "Education heading", type: "text" },
        { path: "about.education.eyebrow", label: "School eyebrow", type: "text" },
        { path: "about.education.school", label: "School name", type: "text" },
        { path: "about.education.logo", label: "School logo", type: "image" },
        { path: "about.education.logoAlt", label: "Logo alt text", type: "text" },
        {
          path: "about.education.rows", label: "Education details", type: "list", itemLabel: "label",
          addLabel: "Add detail",
          template: { label: "Label", value: "Value" },
          fields: [
            { path: "label", label: "Label", type: "text" },
            { path: "value", label: "Value", type: "text" }
          ]
        }
      ]
    },
    {
      id: "marquee",
      title: "Skills Marquee",
      icon: "i-arrow",
      fields: [
        { path: "marquee.label", label: "Marquee button label", type: "text" },
        { path: "marquee.href", label: "Marquee button link", type: "text" },
        {
          path: "marquee.items", label: "Marquee items", type: "list", itemLabel: "label",
          addLabel: "Add tech item",
          template: { icon: "l-html", label: "New skill" },
          fields: [
            { path: "label", label: "Label", type: "text" },
            {
              path: "icon", label: "Logo", type: "select",
              options: [
                "l-html", "l-css", "l-js", "l-php", "l-python", "l-mysql", "l-figma",
                "l-git", "l-github", "l-vscode", "l-office"
              ]
            }
          ]
        }
      ]
    },
    {
      id: "skills",
      title: "Technical Skills",
      icon: "i-award",
      fields: [
        { path: "skills.heading", label: "Heading", type: "text" },
        { path: "skills.headingAccent", label: "Highlighted word", type: "text" },
        { path: "skills.sub", label: "Subtitle", type: "textarea" },
        { path: "skills.count", label: "Count badge", type: "text" },
        {
          path: "skills.groups", label: "Skill groups", type: "list", itemLabel: "title",
          addLabel: "Add skill group",
          template: { title: "New group", color: "pink", items: ["New skill"] },
          fields: [
            { path: "title", label: "Group title", type: "text" },
            { path: "color", label: "Color", ...color },
            { path: "items", label: "Skills", type: "tags", help: "One skill per line." }
          ]
        }
      ]
    },
    {
      id: "projects",
      title: "Projects",
      icon: "i-image",
      fields: [
        { path: "projects.heading", label: "Heading", type: "text" },
        { path: "projects.count", label: "Count badge", type: "text" },
        { path: "projects.detailsLabel", label: "Details button label", type: "text" },
        {
          path: "projects.items", label: "Project folders", type: "list", itemLabel: "title",
          addLabel: "Add project",
          template: {
            title: "New Project", kicker: "", color: "pink", cover: "", coverAlt: "",
            description: "", tags: [], details: {
              fullTitle: "", description: "", shots: [], objectives: { title: "Objectives", items: [] },
              contributions: { title: "My contribution", items: [] }, links: []
            }
          },
          fields: [
            { path: "title", label: "Project title", type: "text" },
            { path: "kicker", label: "Kicker", type: "text", help: "Example: Capstone Project" },
            { path: "color", label: "Folder color", ...color },
            { path: "cover", label: "Cover image", type: "image" },
            { path: "coverAlt", label: "Cover alt text", type: "text" },
            { path: "description", label: "Short description", type: "textarea" },
            { path: "tags", label: "Tags", type: "tags" },
            {
              type: "group", label: "Details modal",
              fields: [
                { path: "details.fullTitle", label: "Full title", type: "text" },
                { path: "details.description", label: "Long description", type: "textarea" },
                {
                  path: "details.shots", label: "Screenshots", type: "list", itemLabel: "caption",
                  addLabel: "Add screenshot",
                  template: { image: "", caption: "Screenshot description" },
                  fields: [
                    { path: "image", label: "Image", type: "image" },
                    { path: "caption", label: "Caption / alt text", type: "text" }
                  ]
                },
                {
                  path: "details.objectives", type: "group", label: "Objectives",
                  fields: [
                    { path: "details.objectives.title", label: "Heading", type: "text" },
                    { path: "details.objectives.items", label: "Items", type: "tags", help: "One item per line." }
                  ]
                },
                {
                  path: "details.contributions", type: "group", label: "Contributions",
                  fields: [
                    { path: "details.contributions.title", label: "Heading", type: "text" },
                    { path: "details.contributions.items", label: "Items", type: "tags", help: "One item per line." }
                  ]
                },
                projectLink()
              ]
            }
          ]
        }
      ]
    },
    {
      id: "certifications",
      title: "Certifications",
      icon: "i-award",
      fields: [
        { path: "certifications.heading", label: "Heading", type: "text" },
        { path: "certifications.note", label: "Footer note", type: "text" },
        { path: "certifications.modalTitle", label: "Modal title", type: "text" },
        { path: "certifications.viewLabel", label: "Modal button label", type: "text" },
        {
          path: "certifications.items", label: "Certificates", type: "list", itemLabel: "title",
          addLabel: "Add certificate",
          template: { title: "New certificate", issuer: "", year: "", image: "", link: "" },
          fields: [
            { path: "title", label: "Certificate title", type: "text" },
            { path: "issuer", label: "Issuer", type: "text" },
            { path: "year", label: "Year", type: "text" },
            { path: "image", label: "Certificate image", type: "image" },
            { path: "link", label: "Certificate link", type: "url", help: "Optional. Adds a View Certificate button in the modal." }
          ]
        }
      ]
    },
    {
      id: "experience",
      title: "Experience",
      icon: "i-award",
      fields: [
        { path: "experience.heading", label: "Heading", type: "text" },
        {
          path: "experience.timeline", label: "Timeline entries", type: "list", itemLabel: "title",
          addLabel: "Add timeline entry",
          template: { title: "New entry", subtitle: "", tag: "", text: "", items: [] },
          fields: [
            { path: "title", label: "Title", type: "text" },
            { path: "subtitle", label: "Subtitle", type: "text" },
            { path: "tag", label: "Badge text", type: "text", help: "Optional." },
            { path: "text", label: "Paragraph", type: "textarea", help: "Optional." },
            { path: "items", label: "Bullet points", type: "tags" }
          ]
        },
        {
          type: "group", label: "Call to action",
          fields: [
            { path: "experience.cta.heading", label: "Heading", type: "text" },
            { path: "experience.cta.text", label: "Text", type: "textarea" },
            { path: "experience.cta.button.label", label: "Button label", type: "text" },
            { path: "experience.cta.button.href", label: "Button link", type: "text" }
          ]
        }
      ]
    },
    {
      id: "contact",
      title: "Contact",
      icon: "i-mail",
      fields: [
        { path: "contact.heading", label: "Heading", type: "text" },
        {
          path: "contact.items", label: "Contact details", type: "list", itemLabel: "label",
          addLabel: "Add contact detail",
          template: { icon: "i-link", label: "LABEL", value: "", type: "text" },
          fields: [
            { path: "label", label: "Label", type: "text" },
            { path: "value", label: "Value", type: "text" },
            {
              path: "type", label: "Link type", type: "select",
              options: [{ value: "text", label: "Text only" }, { value: "email", label: "Email" }, { value: "phone", label: "Phone" }, { value: "url", label: "URL" }]
            },
            {
              path: "icon", label: "Icon", type: "select",
              options: ["i-user", "i-mail", "i-phone", "i-pin", "i-link", "i-github", "i-linkedin"]
            }
          ]
        },
        button("Primary button", "contact.primaryBtn"),
        button("Secondary button", "contact.secondaryBtn"),
        {
          type: "group", label: "Message form",
          fields: [
            { path: "contact.form.heading", label: "Heading", type: "text" },
            { path: "contact.form.nameLabel", label: "Name label", type: "text" },
            { path: "contact.form.emailLabel", label: "Email label", type: "text" },
            { path: "contact.form.subjectLabel", label: "Subject label", type: "text" },
            { path: "contact.form.messageLabel", label: "Message label", type: "text" },
            { path: "contact.form.buttonLabel", label: "Button label", type: "text" },
            { path: "contact.form.note", label: "Note", type: "textarea" }
          ]
        }
      ]
    },
    {
      id: "footer",
      title: "Footer",
      icon: "i-down",
      fields: [
        { path: "footer.copyright", label: "Copyright", type: "text" },
        { path: "footer.tagline", label: "Tagline", type: "text" },
        {
          type: "group", label: "Footer social icons",
          fields: [
            { path: "footer.socials.github", label: "GitHub URL", type: "url" },
            { path: "footer.socials.linkedin", label: "LinkedIn URL", type: "url" },
            { path: "footer.socials.phone", label: "Phone", type: "text" },
            { path: "footer.socials.email", label: "Email", type: "email" }
          ]
        },
        {
          path: "footer.links", label: "Footer links", type: "list", itemLabel: "label",
          addLabel: "Add footer link",
          template: { label: "New link", href: "#" },
          fields: [
            { path: "label", label: "Label", type: "text" },
            { path: "href", label: "Link", type: "text" }
          ]
        }
      ]
    }
  ];
})();
