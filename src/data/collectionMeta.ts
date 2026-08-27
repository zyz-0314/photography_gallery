/**
 * Fallback Chinese display names for the known collection slugs, used when a
 * category row has no `nameZh` in the archive yet. The admin can override
 * these by saving a 中文名称 in the Collections manager.
 */
export const COLLECTION_NAME_ZH: Record<string, string> = {
  landscape: "风光摄影",
  "street-humanistic": "街头摄影",
  portrait: "人像摄影",
  wildlife: "野生动物摄影",
  sports: "体育摄影",
};

export const collectionNameZh = (slug: string): string =>
  COLLECTION_NAME_ZH[slug] ?? "";
