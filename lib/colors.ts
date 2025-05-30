import { ProjectData } from "./types";

// Define color constants for better maintainability and readability
const COLOR_BLUE = "#3b82f6"; // Example: Tailwind's blue-500
const COLOR_GREEN = "#22c55e"; // Example: Tailwind's green-500
const COLOR_YELLOW = "#eab308"; // Example: Tailwind's yellow-500
const COLOR_RED = "#ef4444"; // Example: Tailwind's red-500
const COLOR_DEFAULT = "#a855f7"; // Example: Tailwind's purple-500

/**
 * Determines the color for a project based on the total number of beneficiaries.
 *
 * @param {number} directBeneficiaries - The number of direct beneficiaries.
 * @param {number} indirectBeneficiaries - The number of indirect beneficiaries.
 * @returns {string} The hex color code corresponding to the beneficiary category.
 */
export const getProjectColorByBeneficiaries = (
  directBeneficiaries: number,
  indirectBeneficiaries: number
): string => {
  if (
    typeof directBeneficiaries !== 'number' ||
    typeof indirectBeneficiaries !== 'number'
  ) {
    console.error(
      "Invalid beneficiary data: direct and indirect beneficiaries must be numbers.",
      { directBeneficiaries, indirectBeneficiaries }
    );
    return COLOR_DEFAULT; // Fallback to a default color
  }

  const totalBeneficiaries = directBeneficiaries + indirectBeneficiaries;

  if (totalBeneficiaries <= 0) {
    return COLOR_DEFAULT; // Default color for no beneficiaries or invalid data
  }
  if (totalBeneficiaries <= 100) {
    return COLOR_BLUE;
  }
  if (totalBeneficiaries <= 500) {
    return COLOR_GREEN;
  }
  if (totalBeneficiaries <= 1000) {
    return COLOR_YELLOW;
  }
  return COLOR_RED; // For more than 1000 beneficiaries
};

/**
 * A convenience wrapper for getProjectColorByBeneficiaries that accepts a ProjectData object.
 *
 * @param {ProjectData} project - The project data object.
 * @returns {string} The hex color code for the project.
 */
export const getProjectColor = (project: ProjectData): string => {
  return getProjectColorByBeneficiaries(
    project.direct_beneficiaries,
    project.indirect_beneficiaries
  );
}; 