export function capitalizeFirstLetter(str) {
    if (!str || str.length === 0) {
      return ""; // Handle empty string case
    }

    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  }