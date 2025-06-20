
// UUID validation utilities
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isLegacyId = (id: string): boolean => {
  // Check if it's a timestamp-based ID (numeric string)
  return /^\d+$/.test(id) && id.length >= 10;
};

export const generateId = (): string => {
  // Generate a simple timestamp-based ID for now
  return Date.now().toString();
};
