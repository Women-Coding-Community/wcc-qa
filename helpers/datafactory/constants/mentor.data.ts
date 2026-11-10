/** Mentor test data shared across API specs. */

/** Id far beyond the seeded range, guaranteed to have no mentor record. */
export const NON_EXISTENT_MENTOR_ID = 999999;

/** Path variable the backend cannot bind to a Long, used to assert 400 handling. */
export const NON_NUMERIC_MENTOR_ID = "not-a-number";

/** Backend rule (MentorshipService.validateMentorCommitment): long-term hours / numMentee must be ≥ 2 */
export const MIN_LONG_TERM_HOURS_PER_MENTEE = 2;
