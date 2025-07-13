// FILE: utils/equipmentCodeGenerator.js

/**
 * Generate unique equipment codes
 * Format: EQ-[TYPE]-[SEQUENCE]-[WORKER_INITIALS][YEAR]
 */

const equipmentTypeMap = {
  'helmet': 'HTM',
  'vest': 'VST',
  'gloves': 'GLV',
  'boots': 'BTS',
  'goggles': 'GOG',
  'flashlight': 'FLT',
  'radio': 'RDO',
  'harness': 'HRN',
  'mask': 'MSK',
  'tool': 'TLN'
};

/**
 * Generate worker initials from name
 * @param {string} name - Worker's full name
 * @returns {string} - Worker's initials
 */
function getWorkerInitials(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Generate unique equipment code
 * @param {string} equipmentType - Type of equipment
 * @param {string} workerName - Worker's name
 * @param {number} sequence - Sequence number for the equipment
 * @param {number} year - Year of assignment (default: current year)
 * @returns {object} - Equipment code data
 */
export function generateEquipmentCode(equipmentType, workerName, sequence, year = new Date().getFullYear()) {
  const typeCode = equipmentTypeMap[equipmentType.toLowerCase()] || 'EQP';
  const workerInitials = getWorkerInitials(workerName);
  const sequenceStr = sequence.toString().padStart(3, '0');
  
  const uniqueId = `${typeCode}-${sequenceStr}-${workerInitials}${year}`;
  const qrCode = `EQ-${uniqueId}`;
  const serialNumber = `${typeCode}-${workerInitials}-${sequenceStr}`;
  
  return {
    qrCode,
    uniqueId,
    serialNumber,
    type: equipmentType,
    workerName,
    dateAssigned: new Date().toISOString().split('T')[0]
  };
}

/**
 * Generate multiple equipment codes for a worker
 * @param {string} workerName - Worker's name
 * @param {string} workerId - Worker's ID
 * @param {string[]} equipmentTypes - Array of equipment types
 * @returns {object[]} - Array of equipment objects
 */
export function generateWorkerEquipment(workerName, workerId, equipmentTypes) {
  return equipmentTypes.map((type, index) => {
    const codeData = generateEquipmentCode(type, workerName, index + 1);
    
    return {
      ...codeData,
      assignedToWorker: workerId,
      condition: 'good'
    };
  });
}

/**
 * Validate equipment QR code format
 * @param {string} qrCode - QR code to validate
 * @returns {boolean} - Whether the QR code is valid
 */
export function isValidEquipmentCode(qrCode) {
  const pattern = /^EQ-[A-Z]{3}-\d{3}-[A-Z]{2,4}\d{4}$/;
  return pattern.test(qrCode);
}

/**
 * Parse equipment QR code to extract information
 * @param {string} qrCode - QR code to parse
 * @returns {object|null} - Parsed information or null if invalid
 */
export function parseEquipmentCode(qrCode) {
  if (!isValidEquipmentCode(qrCode)) {
    return null;
  }
  
  const parts = qrCode.split('-');
  const [prefix, typeCode, sequence, workerYear] = parts;
  
  const year = workerYear.slice(-4);
  const workerInitials = workerYear.slice(0, -4);
  
  const equipmentType = Object.keys(equipmentTypeMap).find(
    key => equipmentTypeMap[key] === typeCode
  );
  
  return {
    prefix,
    typeCode,
    sequence: parseInt(sequence),
    workerInitials,
    year: parseInt(year),
    equipmentType
  };
}

// Example usage:
/*
const johnEquipment = generateWorkerEquipment('John Doe', 'W001', ['helmet', 'vest', 'gloves', 'boots']);
console.log(johnEquipment);

// Output:
// [
//   {
//     qrCode: "EQ-HTM-001-JD2024",
//     uniqueId: "HTM-001-JD2024",
//     serialNumber: "HTM-JD-001",
//     type: "helmet",
//     workerName: "John Doe",
//     assignedToWorker: "W001",
//     condition: "good",
//     dateAssigned: "2024-07-13"
//   },
//   ...
// ]
*/