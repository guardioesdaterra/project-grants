import { ProjectData } from "./types";

// Define color constants for better maintainability and readability
const COLOR_BLUE = "#3b82f6"; // Example: Tailwind's blue-500
const COLOR_GREEN = "#22c55e"; // Example: Tailwind's green-500
const COLOR_YELLOW = "#eab308"; // Example: Tailwind's yellow-500
const COLOR_RED = "#ef4444"; // Example: Tailwind's red-500
const COLOR_DEFAULT = "#6b7280"; // Example: Tailwind's gray-500

/**
 * @typedef {object} ProjectData
 * @property {number} direct_beneficiaries - The number of direct beneficiaries.
 * @property {number} indirect_beneficiaries - The number of indirect beneficiaries.
 */

/**
 * Determines the color category for a project based on the total number of beneficiaries.
 *
 * @param {number} totalBeneficiaries - The sum of direct and indirect beneficiaries.
 * @returns {string} The hex color code corresponding to the beneficiary category.
 */
const getProjectColorByCategory = (totalBeneficiaries: number): string => {
  if (totalBeneficiaries <= 0) {
    return COLOR_DEFAULT; // Default color for no beneficiaries or invalid data
  }
  if (totalBeneficiaries <= 1000) {
    return COLOR_BLUE;
  }
  if (totalBeneficiaries <= 5000) {
    return COLOR_GREEN;
  }
  if (totalBeneficiaries <= 10000) {
    return COLOR_YELLOW;
  }
  return COLOR_RED; // For more than 10000 beneficiaries
};

/**
 * Calculates the total beneficiaries and returns the corresponding color for a project.
 *
 * @param {ProjectData} project - The project data object.
 * @returns {string} The hex color code for the project.
 * @throws {Error} If project.direct_beneficiaries or project.indirect_beneficiaries is not a number.
 */
export const getProjectColor = (project: ProjectData): string => {
  if (
    typeof project.direct_beneficiaries !== 'number' ||
    typeof project.indirect_beneficiaries !== 'number'
  ) {
    console.error("Invalid project data: beneficiaries must be numbers.", project);
    // Fallback to a default color or throw a more specific error
    return COLOR_DEFAULT; 
  }

  const totalBeneficiaries =
    project.direct_beneficiaries + project.indirect_beneficiaries;
  return getProjectColorByCategory(totalBeneficiaries);
}; 