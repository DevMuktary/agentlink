import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// --- Helper Functions ---

const loadFile = (filePath: string) => {
  // Resolves path relative to the project root (process.cwd())
  const absolutePath = path.resolve(process.cwd(), filePath);
  return fs.promises.readFile(absolutePath);
};

// Generate QR code with a transparent background
const createQrCodeBuffer = async (data: any): Promise<Buffer> => {
  // Construct QR data string
  const qrText = `surname: ${data.surname} | givenNames: ${data.firstname} ${data.middlename} | dob: ${data.birthdate} | nin: ${data.nin}`;
  
  return QRCode.toBuffer(qrText, {
    color: {
      dark: '#000000', // Black dots
      light: '#0000'   // Transparent background
    }
  });
};

const formatNin = (nin: string) => {
  if (!nin || nin.length !== 11) return nin;
  return `${nin.slice(0, 4)}   ${nin.slice(4, 7)}   ${nin.slice(7)}`;
};

const displayField = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return ''; 
  }
  return value.toString();
};

const getIssueDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];
  const monthAbbr = months[today.getMonth()]; 
  return `${day}-${monthAbbr}-${year}`; // Format: 09-NOV-2025
};

/**
 * Main function to generate the PDF
 */
export async function generateNinSlipPdf(slipType: string, data: any): Promise<Buffer> {
  // Ensure we map 'improved' to 'regular' just in case legacy calls come in
  let templateType = slipType.toLowerCase();
  if (templateType === 'improved') templateType = 'regular';
  
  // 1. Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // 2. Load the PNG template
  let templateImage;
  let userPhoto;

  try {
    // Looks for files in public/templates/nin_regular.png, nin_standard.png, etc.
    const templatePath = `public/templates/nin_${templateType}.png`;
    
    // Debug check (Optional, helps with logs)
    if (!fs.existsSync(path.resolve(process.cwd(), templatePath))) {
        throw new Error(`File not found: ${templatePath}`);
    }

    const templateBuffer = await loadFile(templatePath);
    templateImage = await pdfDoc.embedPng(templateBuffer);
  } catch (error: any) {
    console.error(`Failed to load template: nin_${templateType}.png`, error.message);
    throw new Error(`Service configuration error: Could not load template file for ${slipType}.`);
  }

  // 3. Load User Photo
  try {
    // Clean base64 string if it has prefix
    const photoBase64 = data.photo.replace(/^data:image\/\w+;base64,/, "");
    const photoBuffer = Buffer.from(photoBase64, 'base64');
    userPhoto = await pdfDoc.embedJpg(photoBuffer);
  } catch (error: any) {
    console.error("Failed to embed user photo:", error.message);
    // Return a specific error so we can refund the user in the route handler
    throw new Error("Failed to generate slip: Invalid or Corrupt User Photo.");
  }

  // 4. Add a page to the PDF matching template dimensions
  const { width, height } = templateImage.scale(1);
  const page = pdfDoc.addPage([width, height]);
  
  // 5. Draw the template as the background
  page.drawImage(templateImage, { x: 0, y: 0, width: width, height: height });

  // 6. Load Fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // 7. Draw Data based on Template Type
  if (templateType === 'regular') {
    // --- REGULAR LAYOUT ---
    page.drawText(displayField(data.nin), {
      x: 122, y: height - 170, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.trackingId || data.tracking_id), {
      x: 105, y: height - 133, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 296, y: height - 130, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname), {
      x: 296, y: height - 170, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 296, y: height - 203, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.gender?.toUpperCase()), {
      x: 296, y: height - 232, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.residence_AdressLine1 || data.residence_address), {
      x: 437, y: height - 140, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2), maxWidth: 160
    });
    
    // Photo Position for Regular
    page.drawImage(userPhoto, { x: 615, y: height - (112 + 115), width: 105, height: 115 });
  } 
  
  else if (templateType === 'standard') {
    // --- STANDARD LAYOUT ---
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    page.drawText(formatNin(data.nin), {
      x: 322, y: height - 247, size: 23, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 320, y: height - 110, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname) + ',', {
      x: 320, y: height - 150, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 393, y: height - 150, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 320, y: height - 185, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    
    // Images
    page.drawImage(userPhoto, { x: 207, y: height - (87 + 100), width: 90, height: 100 });
    page.drawImage(qrImage, { x: 498, y: height - (90 + 90), width: 90, height: 90 });
    
    // Issue Date
    page.drawText("ISSUE DATE", {
      x: 518, y: height - 187, size: 8, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(getIssueDate(), {
      x: 518, y: height - 197, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
  } 
  
  else if (templateType === 'premium') {
    // --- PREMIUM LAYOUT ---
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    // Bold NIN
    page.drawText(formatNin(data.nin), {
      x: 445, y: height - 1048, size: 56, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    
    // Watermark
    page.drawText(displayField(data.nin), {
      x: 270, y: height - 570, size: 18, font: helveticaBold, color: rgb(0.8, 0.8, 0.8), opacity: 0.3
    });
    
    // Text Fields
    page.drawText(displayField(data.surname), {
      x: 475, y: height - 695, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname), {
      x: 470, y: height - 792, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 632, y: height - 792, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 465, y: height - 880, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.gender?.toUpperCase()), {
      x: 714, y: height - 880, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    
    // Issue Date
    page.drawText(getIssueDate(), {
      x: 955, y: height - 935, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    
    // Images
    page.drawImage(userPhoto, { x: 169, y: height - 929, width: 260, height: 324 });
    page.drawImage(qrImage, { x: 870, y: height - 814, width: 344, height: 326 });
  }

  // 8. Serialize
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
