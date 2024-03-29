export function canAuthenticate() {
  return !!process.env.METADATA_API_CROWDIN_API_KEY;
}

export const crowdinAuth = {
  headers: {
    Authorization: `Bearer ${process.env.METADATA_API_CROWDIN_API_KEY}`,
  },
};
