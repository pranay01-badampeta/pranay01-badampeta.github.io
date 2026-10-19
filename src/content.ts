// Everything the portfolio says, in one place. Edit here and rebuild.

export const PROFILE = {
  name: "Pranay Badampeta",
  fullName: "Badampeta Pranay Kumar",
  role: "AI & Full-Stack Developer",
  tagline: "I build machine-learning models and the web apps that put them in people's hands.",
  email: "pranaybadampeta@gmail.com",
  linkedin: "https://www.linkedin.com/in/pranay-badampeta",
  github: "https://github.com/pranay01-badampeta",
  resume: "Pranay-Badampeta-Resume.pdf",
  photo: "media/pranay.webp",
};

export const ABOUT = [
  "I'm a Computer Science and Engineering graduate from Woxsen University, Hyderabad. I work where machine learning meets real products: training models in Python, then shipping them behind clean, fast interfaces.",
  "My research on detecting solar-panel defects with CNNs was published at IEEE CICT 2025, and I built Cuisine.AI, a food-safety and stock app for restaurants that reads supplier invoices with AI.",
];

export const STATS = [
  { value: "1", label: "IEEE publication" },
  { value: "3", label: "internships & programs" },
  { value: "5", label: "projects shipped" },
  { value: "2024", label: "NASA Space Apps" },
];

export type Job = { role: string; org: string; place: string; when: string; points: string[] };

export const EXPERIENCE: Job[] = [
  {
    role: "Space Internship Program",
    org: "AGNIRVA",
    place: "National-level program, India",
    when: "2025",
    points: ["Worked on satellite data, space analytics and AI-driven applications."],
  },
  {
    role: "Application Development Intern",
    org: "Tricode Solutions",
    place: "Hyderabad",
    when: "Mar 2024 – Jun 2024",
    points: [
      "Developed responsive web applications with React.js and reusable components built on hooks.",
      "Integrated REST APIs with Axios and Fetch, managing state with useState and useEffect.",
      "Improved UI performance, fixed frontend bugs and collaborated through Git.",
    ],
  },
  {
    role: "Social Internship",
    org: "Vishwa Bharathi High School",
    place: "Zaheerabad",
    when: "Jun 2023 – Aug 2023",
    points: [
      "Analysed internet usage on Android smartphones: app usage, screen time and data consumption.",
      "Presented the findings to students and staff to promote safe, responsible internet use.",
    ],
  },
];

export type Project = {
  title: string;
  kind: string;
  summary: string;
  points: string[];
  tags: string[];
  links?: { label: string; href: string }[];
  badge?: string;
};

export const FEATURED: Project = {
  title: "Cuisine.AI",
  kind: "Product · Full-stack + AI",
  summary:
    "A food-safety (HACCP), stock and supplier-invoice app for restaurants and bars, with AI that does the typing. Built with Rayyan Ahmed and Rithvik RS.",
  points: [
    "Invoices read by AI: snap a supplier invoice and stock, prices and products update themselves.",
    "HACCP made easy: temperatures by voice or sensors, cleaning checklists, traceability and inspection-ready PDF reports.",
    "Secure by design: passkeys (Face ID / Touch ID), email reset codes, device limits, sign-in alerts and a strict content-security policy.",
    "Subscriptions with Stripe Checkout, and a separate marketing website in English and French.",
  ],
  tags: ["Next.js", "React", "TypeScript", "Tailwind CSS", "libSQL / Turso", "Claude AI", "Stripe", "Passkeys"],
  links: [
    { label: "Open the app", href: "https://cuisine-ai-app.onrender.com/login" },
    { label: "Website", href: "https://pranay01-badampeta.github.io/cuisine-ai-website/" },
  ],
};

export const PROJECTS: Project[] = [
  {
    title: "Solar PV Defect Detection",
    kind: "Research · Computer vision + IoT",
    summary: "A web interface that detects and classifies solar-panel defects in real time.",
    points: [
      "CNN models classify panel images; Random Forest and SVM detect faults from live sensor data.",
      "Deployed behind a web interface for real-time monitoring and maintenance decisions.",
    ],
    tags: ["CNN", "Random Forest", "SVM", "IoT", "Python"],
    badge: "IEEE CICT 2025",
  },
  {
    title: "Stock Price Prediction",
    kind: "Machine learning · Time series",
    summary: "Forecasting stock prices with Linear Regression and LSTM networks.",
    points: [
      "Data preprocessing, feature scaling and time-series analysis.",
      "Evaluated with RMSE and MAE; trends and predictions visualised with Matplotlib.",
    ],
    tags: ["LSTM", "Linear Regression", "Pandas", "Matplotlib"],
  },
  {
    title: "Credit Card Fraud Detection",
    kind: "Machine learning · Classification",
    summary: "Catching fraudulent transactions in a heavily imbalanced dataset.",
    points: [
      "Logistic Regression, Random Forest and XGBoost models.",
      "Class imbalance handled with SMOTE; judged on precision, recall, F1 and the confusion matrix.",
    ],
    tags: ["XGBoost", "SMOTE", "Scikit-learn"],
  },
  {
    title: "Digital Signature System",
    kind: "Security · Cryptography",
    summary: "Signing and verifying messages with SHA-256 hashing and RSA.",
    points: [
      "Secure key generation, signing and verification.",
      "Guarantees data integrity and authenticates the sender.",
    ],
    tags: ["SHA-256", "RSA", "Python"],
  },
];

export const PUBLICATION = {
  title: "Web-based Interface for Detecting and Classifying Solar PV Panel Defects Using CNN Model",
  venue: "2025 IEEE 9th International Conference on Information and Communication Technology (CICT)",
  points: [
    "A CNN-based system that detects and classifies solar PV panel defects.",
    "Deployed through a web interface for real-time monitoring and analysis.",
  ],
};

export const SKILLS: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "Java", "SQL", "JavaScript", "TypeScript"] },
  { group: "Machine learning", items: ["PyTorch", "TensorFlow", "Scikit-learn", "OpenCV", "YOLO", "XGBoost"] },
  { group: "Data", items: ["NumPy", "Pandas", "Matplotlib", "MySQL", "Jupyter"] },
  { group: "Web", items: ["React", "Next.js", "Tailwind CSS", "REST APIs", "Axios"] },
  { group: "Tools", items: ["Git", "GitHub", "Render", "Stripe"] },
];

export const EDUCATION = [
  { school: "Woxsen University, Hyderabad", degree: "B.Tech, Computer Science and Engineering", when: "2021 – 2025", score: "65%" },
  { school: "Sri Gayatri Educational Institutions, Hyderabad", degree: "Intermediate (MPC)", when: "2019 – 2021", score: "89%" },
  { school: "Aruna High School, Hyderabad", degree: "Matriculation", when: "2009 – 2019", score: "88%" },
];

export const CERTIFICATIONS = [
  { name: "NASA International Space Apps Challenge 2024 – Galactic Problem Solver", when: "Oct 2024" },
  { name: "Data Visualization with Python", when: "Mar 2023" },
  { name: "AI for Everyone", when: "Apr 2023" },
  { name: "Data Analysis with Python", when: "Dec 2022" },
  { name: "Programming Foundations with JavaScript, HTML and CSS", when: "Jun 2022" },
];
