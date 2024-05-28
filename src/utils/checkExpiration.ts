
export const checkExpiration = (expiresIn: string) => {
  return new Date(expiresIn).getTime() + 100 * 60 < new Date().getTime();
};
