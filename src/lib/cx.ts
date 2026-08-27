export type Cx = (string | false | null | undefined)[];

/** Tiny classnames joiner. */
export const cx = (...parts: Cx) => parts.filter(Boolean).join(" ");
