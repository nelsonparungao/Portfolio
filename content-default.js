/* Default portfolio content.
 * The public site uses this until Supabase has a published row,
 * and the admin uses it for the "Load defaults" button.
 */
window.PORTFOLIO_DEFAULT_CONTENT = {
  brand: {
    logo: "</> JNP",
    name: "John Nelson L. Parungao",
    monogram: "JNP"
  },
  meta: {
    title: "John Nelson L. Parungao | Portfolio",
    description: "Information Technology student specializing in Web Systems Technology. Web development, UI/UX design, and practical technology solutions."
  },
  nav: {
    links: [
      { label: "About", href: "#about", mobileOnly: false },
      { label: "Skills", href: "#skills", mobileOnly: false },
      { label: "Projects", href: "#projects", mobileOnly: false },
      { label: "Experience", href: "#experience", mobileOnly: false },
      { label: "Certifications", href: "#certifications", mobileOnly: false },
      { label: "Contact", href: "#contact", mobileOnly: true }
    ],
    cta: { label: "Contact Me", href: "#contact", style: "purple" }
  },
  hero: {
    greet: "HELLO, I'M",
    wave: "👋",
    firstName: "JOHN NELSON",
    lastName: "PARUNGAO",
    roles: ["ASPIRING IT PROFESSIONAL", "BSIT STUDENT", "WEB SYSTEMS TECHNOLOGY"],
    lead: "A passionate Information Technology student specializing in Web Systems Technology, interested in web development, UI/UX design, and creating practical technology solutions.",
    primaryBtn: { label: "View My Projects", href: "#projects", style: "lime" },
    resumeBtn: { label: "Download Resume", href: "John_Nelson_Parungao_CV.pdf", style: "white" },
    resumeFile: "",
    connectLabel: "CONNECT WITH ME",
    availability: "OPEN TO OJT OPPORTUNITIES",
    portrait: "images/portrait.jpg",
    portraitAlt: "Portrait of John Nelson L. Parungao",
    socials: {
      github: "",
      linkedin: "",
      phone: "+639164011481",
      email: "nelsonparungao03@gmail.com"
    },
    codeName: "jnp",
    codeRole: "BSIT Student",
    codeFocus: "Web Systems",
    codeStack: "HTML, CSS, JS, PHP",
    codeStatus: "Open to OJT"
  },
  about: {
    heading: "ABOUT",
    headingAccent: "ME",
    paragraphs: [
      "I am a fourth-year Bachelor of Science in Information Technology student specializing in Web Systems Technology at Nueva Ecija University of Science and Technology.",
      "I have developed practical experience in web development, UI/UX design, database management, software testing, and technical documentation through academic projects and collaborative development.",
      "I enjoy creating user-friendly interfaces and developing technology solutions that address real-world needs. I am continuously improving my technical knowledge and looking forward to gaining hands-on experience in the IT industry."
    ],
    education: {
      heading: "EDUCATION",
      eyebrow: "UNIVERSITY",
      school: "Nueva Ecija University of Science and Technology",
      logo: "images/school-logo.png",
      logoAlt: "Nueva Ecija University of Science and Technology logo",
      rows: [
        { label: "Degree", value: "Bachelor of Science in Information Technology" },
        { label: "Specialization", value: "Web Systems Technology" },
        { label: "Expected Graduation", value: "2027" }
      ]
    }
  },
  marquee: {
    label: "SKILLS",
    href: "#skills-all",
    items: [
      { icon: "l-html", label: "HTML" },
      { icon: "l-css", label: "CSS" },
      { icon: "l-js", label: "JavaScript" },
      { icon: "l-php", label: "PHP" },
      { icon: "l-python", label: "Python" },
      { icon: "l-mysql", label: "MySQL" },
      { icon: "l-figma", label: "Figma" },
      { icon: "l-git", label: "Git" },
      { icon: "l-github", label: "GitHub" },
      { icon: "l-vscode", label: "VS Code" },
      { icon: "l-office", label: "Office" }
    ]
  },
  skills: {
    heading: "TECHNICAL",
    headingAccent: "SKILLS",
    sub: "The tools and practices I use to design, build, and test web systems.",
    count: "05 AREAS / 22 SKILLS",
    groups: [
      { title: "Programming", color: "pink", items: ["HTML", "CSS", "JavaScript", "PHP", "Python"] },
      { title: "Database", color: "lime", items: ["MySQL", "SQL", "Database Design"] },
      { title: "Design", color: "purple", items: ["Figma", "UI/UX Design", "Wireframing", "Prototyping"] },
      { title: "Tools", color: "pink", items: ["Visual Studio Code", "Git", "GitHub", "Microsoft Office"] },
      { title: "Other Skills", color: "lime", items: ["Software Testing", "Technical Documentation", "System Analysis", "Problem-Solving", "Team Collaboration", "Project Leadership"] }
    ]
  },
  projects: {
    heading: "FEATURED PROJECTS",
    count: "03 FOLDERS",
    detailsLabel: "View Details",
    items: [
      {
        title: "SIERRA",
        kicker: "Capstone Project",
        color: "pink",
        cover: "images/sierra-cover.png",
        coverAlt: "SIERRA environmental reporting system",
        description: "A web-based environmental reporting system that allows residents to report environmental issues with geotagged locations and supporting evidence.",
        tags: ["PHP", "HTML", "CSS", "JavaScript", "MySQL"],
        details: {
          fullTitle: "San Isidro Environmental Reporting and Response Application",
          description: "SIERRA is a web-based environmental reporting and response application developed for the Municipality of San Isidro, Nueva Ecija. Residents submit environmental concerns using geotagged reports with photo or video evidence. Barangay officials and MENRO personnel review, investigate, monitor, and resolve environmental reports.",
          shots: [
            { image: "", caption: "SIERRA landing page and resident dashboard" },
            { image: "", caption: "Environmental reporting and geotagging interface" },
            { image: "", caption: "Barangay and MENRO management dashboard" }
          ],
          objectives: {
            title: "Objectives",
            items: [
              "Provide an accessible environmental reporting platform.",
              "Improve environmental report monitoring and management.",
              "Enable location-based reporting through geotagging.",
              "Support decision-making through dashboards and analytics.",
              "Improve coordination between residents, barangay officials, and MENRO."
            ]
          },
          contributions: {
            title: "My contribution",
            items: [
              "Served as project team leader.",
              "Participated in UI/UX design.",
              "Contributed to programming and system implementation.",
              "Prepared technical documentation and design-phase diagrams.",
              "Participated in system testing and evaluation."
            ]
          },
          links: [
            { label: "View Project: N/A", href: "", style: "lime" },
            { label: "View Source Code: N/A", href: "", style: "white" }
          ]
        }
      },
      {
        title: "Cinema Ticketing System",
        kicker: "Academic Project",
        color: "lime",
        cover: "",
        coverAlt: "Cinema Ticketing System screenshot",
        description: "A ticketing application designed to manage movie ticket reservations and booking transactions.",
        tags: ["Python"],
        details: {
          fullTitle: "Academic programming project",
          description: "A Python-based academic programming project designed to organize movie ticket reservations and booking activities.",
          shots: [
            { image: "", caption: "Main system interface" },
            { image: "", caption: "Movie selection or booking interface" }
          ],
          objectives: {
            title: "Objectives",
            items: [
              "Develop a functional cinema ticketing system.",
              "Organize movie ticket reservation processes.",
              "Demonstrate programming and problem-solving skills.",
              "Provide a structured approach to managing bookings."
            ]
          },
          contributions: {
            title: "My contribution",
            items: ["Participated in system development and programming, including booking-related functionalities."]
          },
          links: [
            { label: "View Project: N/A", href: "", style: "lime" },
            { label: "View Source Code: N/A", href: "", style: "white" }
          ]
        }
      },
      {
        title: "NovoBank",
        kicker: "UI/UX Design",
        color: "purple",
        cover: "",
        coverAlt: "NovoBank screenshot",
        description: "A conceptual digital banking application focused on providing a clean and user-friendly banking interface.",
        tags: ["Figma"],
        details: {
          fullTitle: "Banking Application UI/UX Design",
          description: "NovoBank is a conceptual digital banking application design project focused on creating a clean, organized, and user-friendly banking interface.",
          shots: [
            { image: "", caption: "NovoBank main dashboard design" },
            { image: "", caption: "Banking interface or transaction screen" }
          ],
          objectives: {
            title: "Objectives",
            items: [
              "Design an intuitive digital banking interface.",
              "Apply UI/UX design principles.",
              "Organize banking information and features.",
              "Develop a visual prototype illustrating the application's layout and user flow."
            ]
          },
          contributions: {
            title: "My contribution",
            items: [
              "Participated in conceptualization and visual design.",
              "Worked on interface layouts and visual consistency.",
              "Applied UI/UX principles to improve user experience.",
              "Contributed to the banking application prototype."
            ]
          },
          links: [
            { label: "View Project: N/A", href: "", style: "lime" },
            { label: "View Source Code: N/A", href: "", style: "white" }
          ]
        }
      }
    ]
  },
  certifications: {
    heading: "CERTIFICATIONS",
    note: "TAP A CERTIFICATE TO VIEW",
    modalTitle: "Certificate",
    viewLabel: "View Certificate",
    items: [
      {
        title: "Information Technology Specialist: HTML and CSS",
        issuer: "Certiport",
        year: "2026",
        image: "images/certificates/html-css.png",
        link: ""
      },
      {
        title: "Database 101: Data Storage, SQL and Query Optimization",
        issuer: "Issuer not listed",
        year: "2026",
        image: "images/certificates/database-101.jpg",
        link: ""
      },
      {
        title: "Data-Driven Crisis Management: AI and Predictive Analytics for Emergency Preparedness",
        issuer: "Issuer not listed",
        year: "2026",
        image: "images/certificates/crisis-management.jpg",
        link: ""
      },
      {
        title: "Learning Advocate 2026 Series: Emerging IT Innovations",
        issuer: "Issuer not listed",
        year: "2026",
        image: "images/certificates/emerging-it-innovations.jpg",
        link: ""
      },
      {
        title: "InfoDiscover 2026",
        issuer: "Issuer not listed",
        year: "2026",
        image: "images/certificates/infodiscover-2026.jpg",
        link: ""
      },
      {
        title: "AI Tools 101: How to Use Google Gemini Like a Pro",
        issuer: "Issuer not listed",
        year: "2026",
        image: "images/certificates/google-gemini-ai-tools-101.jpg",
        link: ""
      }
    ]
  },
  experience: {
    heading: "EXPERIENCE",
    timeline: [
      {
        title: "TEAM LEADER",
        subtitle: "SIERRA CAPSTONE PROJECT",
        tag: "",
        text: "",
        items: [
          "Led and coordinated the capstone development team.",
          "Participated in UI/UX design, system development, technical documentation, and system testing.",
          "Participated in project presentation and evaluation."
        ]
      },
      {
        title: "ACCOMPLISHMENTS",
        subtitle: "",
        tag: "",
        text: "",
        items: [
          "Successfully completed the SIERRA capstone project defense.",
          "Participated in system evaluation involving residents, barangay officials, and MENRO representatives.",
          "Gained experience in ISO/IEC 25010 software quality evaluation.",
          "Earned the Information Technology Specialist: HTML and CSS certification from Certiport."
        ]
      },
      {
        title: "CURRENT STATUS",
        subtitle: "OJT APPLICANT",
        tag: "CURRENTLY SEEKING OJT OPPORTUNITIES",
        text: "Seeking an opportunity to gain hands-on experience, strengthen technical competencies, and contribute to an organization's IT operations.",
        items: []
      }
    ],
    cta: {
      heading: "LET'S WORK TOGETHER.",
      text: "Interested in collaborating or offering an OJT opportunity? Feel free to reach out.",
      button: { label: "Get in Touch", href: "#contact" }
    }
  },
  contact: {
    heading: "GET IN TOUCH",
    items: [
      { icon: "i-user", label: "NAME", value: "John Nelson L. Parungao", type: "text" },
      { icon: "i-mail", label: "EMAIL", value: "nelsonparungao03@gmail.com", type: "email" },
      { icon: "i-phone", label: "PHONE", value: "09164011481", type: "phone" },
      { icon: "i-pin", label: "LOCATION", value: "Nueva Ecija, Philippines", type: "text" },
      { icon: "i-link", label: "LINKEDIN", value: "N/A", type: "url" },
      { icon: "i-link", label: "GITHUB", value: "N/A", type: "url" }
    ],
    primaryBtn: { label: "Email Me", href: "mailto:nelsonparungao03@gmail.com", style: "lime" },
    secondaryBtn: { label: "Call Me", href: "tel:+639164011481", style: "white" },
    form: {
      heading: "SEND A MESSAGE",
      nameLabel: "NAME",
      emailLabel: "EMAIL",
      subjectLabel: "SUBJECT",
      messageLabel: "MESSAGE",
      buttonLabel: "Send Message",
      note: "Frontend-only form: sending opens your email app with the message prefilled."
    }
  },
  footer: {
    copyright: "© 2026 John Nelson L. Parungao. All Rights Reserved.",
    tagline: "Designed with simplicity and purpose.",
    socials: {
      github: "",
      linkedin: "",
      phone: "+639164011481",
      email: "nelsonparungao03@gmail.com"
    },
    links: [
      { label: "About", href: "#about" },
      { label: "Skills", href: "#skills" },
      { label: "Projects", href: "#projects" },
      { label: "Experience", href: "#experience" },
      { label: "Certifications", href: "#certifications" }
    ]
  }
};
