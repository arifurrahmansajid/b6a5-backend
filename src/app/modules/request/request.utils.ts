const setExpiresAt = (expiresAt?: Date | null): Date => {
  if (expiresAt instanceof Date && !isNaN(expiresAt.getTime())) return expiresAt;

  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

export const requestUtils = {
  setExpiresAt,
};
