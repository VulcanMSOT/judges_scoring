export const EVALUATION_PARAMETERS = [
  {
    id: 'param_innovation',
    key: 'innovation',
    name: 'Innovation & Originality',
    max: 10,
    shortDesc: 'Novelty, creative problem-solving, and uniqueness of approach',
    criteria: [
      'Is the idea novel or does it bring a distinct twist to an existing problem?',
      'Does it show genuine out-of-the-box thinking beyond standard tutorials?',
      'Is the problem addressed in a clever or unconventional manner?'
    ],
  },
  {
    id: 'param_technical',
    key: 'technical',
    name: 'Technical Complexity & Architecture',
    max: 10,
    shortDesc: 'System architecture, backend/AI rigor, code quality, and engineering depth',
    criteria: [
      'Is the technology stack chosen well and used effectively?',
      'How sophisticated is the backend, AI/ML pipeline, algorithm, or data layer?',
      'Did the team tackle difficult technical hurdles during the hackathon?'
    ],
  },
  {
    id: 'param_implementation',
    key: 'implementation',
    name: 'Working Implementation & Demo',
    max: 10,
    shortDesc: 'Functional completeness, live working prototype, and handling edge cases',
    criteria: [
      'Does the prototype actually work end-to-end during live demo?',
      'How much of the core vision is truly implemented versus mocked/faked?',
      'Did the demo run reliably without fatal crashes or showstopper bugs?'
    ],
  },
  {
    id: 'param_uiux',
    key: 'uiux',
    name: 'UI / UX & Design Polish',
    max: 10,
    shortDesc: 'Aesthetic design, user experience, responsiveness, and interaction flow',
    criteria: [
      'Is the interface intuitive, responsive, and visually appealing?',
      'Are error states, empty states, and user interactions thoughtfully handled?',
      'Does it feel like a polished, cohesive product rather than a rough prototype?'
    ],
  },
  {
    id: 'param_presentation',
    key: 'presentation',
    name: 'Impact, Viability & Presentation',
    max: 10,
    shortDesc: 'Problem-solution fit, real-world utility, pitch delivery, and Q&A answers',
    criteria: [
      'Is there clear real-world utility or market/user need for this solution?',
      'Did the team present their idea clearly within their allocated pitch time?',
      'Did they answer judge questions with confidence, technical depth, and honesty?'
    ],
  },
];

export const MAX_POSSIBLE_SCORE = 50;
