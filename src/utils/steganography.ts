
/**
 * Steganography Utility Functions
 * These functions help embed and extract hidden data from images
 */

/**
 * Embeds a message into an image using the LSB (Least Significant Bit) method via Canvas API
 * 
 * @param originalImage - The original image as an HTMLImageElement
 * @param message - The message to hide in the image
 * @param password - Optional password to encrypt the message
 * @returns Promise with the watermarked image as a data URL
 */
export const embedMessageInImage = async (
  originalImage: HTMLImageElement,
  message: string,
  password?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions to match image
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      
      // Draw image on canvas
      ctx.drawImage(originalImage, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // If password is provided, "encrypt" the message (simple XOR encryption)
      let processedMessage = message;
      if (password) {
        processedMessage = encryptMessage(message, password);
      }
      
      // Prepare message: add metadata with original length for extraction
      const messageWithHeader = `${processedMessage.length}:${processedMessage}`;
      const messageBits = stringToBinary(messageWithHeader);
      
      // Check if image is large enough to store the message
      if (messageBits.length > data.length / 4 * 3) {
        throw new Error('Message too large for this image');
      }
      
      // Embed message bits into LSB of image data
      let bitIndex = 0;
      
      // Modify only what we need to
      while (bitIndex < messageBits.length) {
        const pixelIndex = bitIndex * 4; // each pixel has 4 values (RGBA)
        
        // We only modify the RGB channels, not the alpha
        for (let offset = 0; offset < 3 && bitIndex < messageBits.length; offset++) {
          // Set least significant bit
          data[pixelIndex + offset] = (data[pixelIndex + offset] & 0xFE) | parseInt(messageBits[bitIndex], 10);
          bitIndex++;
        }
      }
      
      // Put modified data back to canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Return data URL of the modified image
      const watermarkedImage = canvas.toDataURL('image/png');
      resolve(watermarkedImage);
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Extracts a hidden message from an image using the LSB method
 * 
 * @param watermarkedImage - The watermarked image as an HTMLImageElement
 * @param password - Optional password to decrypt the message
 * @returns Promise with the extracted message
 */
export const extractMessageFromImage = async (
  watermarkedImage: HTMLImageElement,
  password?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas dimensions to match image
      canvas.width = watermarkedImage.width;
      canvas.height = watermarkedImage.height;
      
      // Draw image on canvas
      ctx.drawImage(watermarkedImage, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Extract header to determine message length
      let headerBinary = '';
      let messageBinary = '';
      let colonFound = false;
      let messageLength = 0;
      
      // Read bits from image
      let bitIndex = 0;
      let byteIndex = 0;
      let currentByte = '';
      
      while (byteIndex < data.length / 4) {
        const pixelIndex = byteIndex * 4;
        
        // Extract from RGB channels
        for (let offset = 0; offset < 3 && pixelIndex + offset < data.length; offset++) {
          // Get least significant bit
          const bit = (data[pixelIndex + offset] & 0x01).toString();
          
          if (!colonFound) {
            // Still reading header
            headerBinary += bit;
            
            if (headerBinary.length % 8 === 0) {
              // Convert each byte to ASCII
              const char = String.fromCharCode(parseInt(headerBinary.slice(-8), 2));
              
              if (char === ':') {
                colonFound = true;
                messageLength = parseInt(binaryToString(headerBinary.slice(0, -8)), 10);
                headerBinary = '';
              }
            }
          } else {
            // Reading message content
            messageBinary += bit;
            
            if (messageBinary.length === messageLength * 8) {
              // We have the complete message
              let extractedMessage = binaryToString(messageBinary);
              
              // Decrypt if password provided
              if (password) {
                extractedMessage = decryptMessage(extractedMessage, password);
              }
              
              resolve(extractedMessage);
              return;
            }
          }
          
          bitIndex++;
        }
        
        byteIndex++;
      }
      
      throw new Error('Could not find a valid message in this image');
      
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Convert a string to its binary representation
 */
function stringToBinary(str: string): string {
  let binary = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const charBinary = charCode.toString(2).padStart(8, '0');
    binary += charBinary;
  }
  return binary;
}

/**
 * Convert binary back to string
 */
function binaryToString(binary: string): string {
  let text = '';
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    text += String.fromCharCode(parseInt(byte, 2));
  }
  return text;
}

/**
 * Simple XOR encryption with password
 */
function encryptMessage(message: string, password: string): string {
  let result = '';
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i) ^ password.charCodeAt(i % password.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

/**
 * Decrypt XOR encrypted message
 */
function decryptMessage(encryptedMessage: string, password: string): string {
  // XOR is symmetric, so encryption and decryption use the same function
  return encryptMessage(encryptedMessage, password);
}
