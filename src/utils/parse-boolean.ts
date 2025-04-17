export const parseBoolean = (val?: string | boolean): boolean | undefined => {
  if (typeof val === 'undefined') return;
  if (typeof val === 'boolean') return val;
  return val === 'true'
    ? (val = true)
    : val === 'false'
      ? (val = false)
      : (val = undefined);
};
