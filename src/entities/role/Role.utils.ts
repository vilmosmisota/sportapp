export const formatPermissionName = (permission: string): string => {
  return permission
    .replace("view_", "")
    .replace("manage_", "")
    .replace("family_", "")
    .replace("_", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
