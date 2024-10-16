// utils/generateTaskNumber.js

export const generateTaskNumber = () => {
    // Generates a random number between 1 and 9999
    const randomNumber = Math.floor(1 + Math.random() * 9999);
    // Pads the number with leading zeros to ensure it's always 4 digits
    const taskNumber = `TN${randomNumber.toString().padStart(4, '0')}`;
  
    return taskNumber;
  };
  