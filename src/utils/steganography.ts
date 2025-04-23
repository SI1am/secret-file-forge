/**
 * Utility functions for steganography
 * For embedding hidden watermarks in images
 */

// Convert text to a binary string
const textToBinary = (text: string): string => {
  return text.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');
};

// Convert binary string back to text
const binaryToText = (binary: string): string => {
  const chunks = binary.match(/.{1,8}/g) || [];
  return chunks.map(chunk => String.fromCharCode(parseInt(chunk, 2))).join('');
};

// Apply simple encryption to the watermark text
const encryptMessage = (message: string, password?: string): string => {
  if (!password) return message;
  
  // Simple XOR encryption with password
  let result = '';
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i);
    const passCharCode = password.charCodeAt(i % password.length);
    result += String.fromCharCode(charCode ^ passCharCode);
  }
  
  return result;
};

// Decrypt the watermark text
export const decryptMessage = (message: string, password?: string): string => {
  // XOR is symmetric, so encryption and decryption use the same function
  return password ? encryptMessage(message, password) : message;
};

// Embed a message in the least significant bits of image pixels
export const embedMessageInImage = async (
  image: HTMLImageElement,
  message: string,
  password?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Draw image on canvas
      ctx.drawImage(image, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Encrypt message if password provided
      const encryptedMessage = encryptMessage(message, password);
      
      // Convert message to binary
      let binaryMessage = textToBinary(encryptedMessage);
      
      // Add header with message length
      const header = encryptedMessage.length.toString(2).padStart(16, '0');
      binaryMessage = header + binaryMessage;
      
      // Check if the image has enough pixels to store the message
      if (binaryMessage.length > data.length / 4) {
        throw new Error('Message is too large for this image');
      }
      
      // Embed binary message in the least significant bit of each color channel
      let messageIndex = 0;
      
      // Only modify every 4th pixel to minimize visual impact
      for (let i = 0; i < data.length; i += 16) {
        if (messageIndex >= binaryMessage.length) break;
        
        // Embed in R, G, and B channels (skip alpha)
        for (let j = 0; j < 3; j++) {
          if (messageIndex < binaryMessage.length) {
            // Clear the least significant bit and set it to the message bit
            data[i + j] = (data[i + j] & 0xFE) | parseInt(binaryMessage[messageIndex]);
            messageIndex++;
          }
        }
      }
      
      // Put the modified image data back on the canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Convert canvas to data URL and return
      const watermarkedImage = canvas.toDataURL('image/png');
      resolve(watermarkedImage);
    } catch (error) {
      reject(error);
    }
  });
};

// Extract a message from a watermarked image
export const extractMessageFromImage = async (
  watermarkedImage: string,
  password?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('Failed to get canvas context');
          return;
        }
        
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract binary message from LSBs
        let binaryMessage = '';
        let headerComplete = false;
        let messageLength = 0;
        
        // Read from every 4th pixel
        for (let i = 0; i < data.length; i += 16) {
          // Extract from R, G, and B channels
          for (let j = 0; j < 3; j++) {
            // Get LSB
            const bit = data[i + j] & 1;
            binaryMessage += bit;
            
            if (!headerComplete && binaryMessage.length === 16) {
              // Parse header to get message length
              messageLength = parseInt(binaryMessage, 2) * 8;
              headerComplete = true;
              binaryMessage = '';
            }
            
            if (headerComplete && binaryMessage.length === messageLength) {
              // We've read the entire message
              const extractedText = binaryToText(binaryMessage);
              const decryptedMessage = decryptMessage(extractedText, password);
              resolve(decryptedMessage);
              return;
            }
          }
        }
        
        reject('No hidden message found or incorrect password');
      } catch (error) {
        reject(error);
      }
    };
    
    image.onerror = () => reject('Failed to load image');
    image.src = watermarkedImage;
  });
};

// Function to apply watermark to an image
export const applyWatermark = async (
  image: HTMLImageElement,
  options: {
    text: string;
    position: string;
    opacity: number;
    visible: boolean;
  }
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Draw image on canvas
      ctx.drawImage(image, 0, 0);
      
      // If visible watermark is requested, draw it
      if (options.visible) {
        ctx.save();
        
        // Set watermark text style
        ctx.globalAlpha = options.opacity;
        ctx.font = `${Math.max(24, Math.floor(image.width / 20))}px Arial`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        
        // Position the watermark text
        const text = options.text;
        const textWidth = ctx.measureText(text).width;
        let x = 0;
        let y = 0;
        
        switch (options.position) {
          case 'center':
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
            break;
          case 'top-left':
            x = 20;
            y = 40;
            break;
          case 'top-right':
            x = canvas.width - textWidth - 20;
            y = 40;
            break;
          case 'bottom-left':
            x = 20;
            y = canvas.height - 20;
            break;
          case 'bottom-right':
            x = canvas.width - textWidth - 20;
            y = canvas.height - 20;
            break;
          default:
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
        }
        
        // Draw text with stroke
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        
        ctx.restore();
      }
      
      // Also embed the watermark using steganography
      embedMessageInImage(image, options.text)
        .then(stegoImage => {
          // If steganography was successful, return the final watermarked image
          // Otherwise, return the visible watermarked image
          resolve(stegoImage || canvas.toDataURL('image/png'));
        })
        .catch(() => {
          // If steganography fails, just return the visible watermarked image
          resolve(canvas.toDataURL('image/png'));
        });
    } catch (error) {
      console.error('Error applying watermark:', error);
      reject(error);
    }
  });
};

// Verify if an image has a watermark and extract it
export const verifyWatermark = async (image: HTMLImageElement): Promise<string | null> => {
  try {
    // Try to extract the hidden message using steganography
    const watermarkText = await extractMessageFromImage(image.src);
    return watermarkText;
  } catch (error) {
    console.error('Error verifying watermark:', error);
    return null;
  }
};
