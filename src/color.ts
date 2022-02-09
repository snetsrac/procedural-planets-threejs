// TYPES

interface ColorSettings {
  color: THREE.ColorRepresentation
}

// CONSTANTS/DEFAULTS

const DEFAULT_COLOR = 0x009900;

// FUNCTIONS

function createColorSettings(): ColorSettings {
  return {
    color: DEFAULT_COLOR
  };
}

export { createColorSettings, ColorSettings };
