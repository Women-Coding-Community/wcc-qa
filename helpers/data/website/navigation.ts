const mentorshipItems = [
  ['Overview', '/mentorship', 'Mentorship Programme'],
  ['Mentors', '/mentorship/mentors', 'Meet Our Mentors'],
  ['Study Groups', '/mentorship/study-groups', 'Study Groups'],
  ['Resources', '/mentorship/resources', 'Mentorship Resources'],
  [
    'Code of Conduct',
    '/mentorship/code-of-conduct',
    'Mentorship Code of Conduct',
  ],
  ['FAQs', '/mentorship/faqs', 'Mentorship FAQ'],
  [
    'Long-Term Timeline',
    '/mentorship/long-term-timeline',
    'Long-Term Mentorship Timeline',
  ],
  [
    'Ad-Hoc Timeline',
    '/mentorship/ad-hoc-timeline',
    'Ad-Hoc Mentorship Timeline',
  ],
];

export const mentorshipMenuItems = mentorshipItems.map(
  ([name, url, expectedHeading]) => ({
    name,
    expectedURL: url,
    expectedHeading,
  }),
);
