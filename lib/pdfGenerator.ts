import jsPDF from 'jspdf';

interface CVData {
  fullName: string;
  title: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string | string[];
  }>;
  education?: Array<{
    degree: string;
    university: string;
    graduationYear: string;
    gpa?: string;
  }>;
  skills?: string[];
  achievements?: string[];
  personal?: {
    fullName: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    title: string;
  };
}

export function generatePDF(cvData: CVData, color: string = '#000000'): { pdfBase64: string; fileName: string } {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb = hexToRgb(color);

  // Header with color bar
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Name and Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const fullName = cvData.fullName || cvData.personal?.fullName || '';
  doc.text(fullName, margin, yPosition + 15);

  yPosition += 25;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  const title = cvData.title || cvData.personal?.title || '';
  doc.text(title, margin, yPosition);

  yPosition += 15;

  // Contact Information
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const contactInfo = [
    cvData.email || cvData.personal?.email,
    cvData.phone || cvData.personal?.phone,
    cvData.location || cvData.personal?.location,
    cvData.website || cvData.personal?.website
  ].filter(Boolean);

  if (contactInfo.length > 0) {
    doc.text(contactInfo.join(' | '), margin, yPosition);
    yPosition += 20;
  }

  // Professional Summary
  if (cvData.summary) {
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Professional Summary', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(cvData.summary, pageWidth - margin * 2);
    doc.text(summaryLines, margin, yPosition);
    yPosition += summaryLines.length * 5 + 10;
  }

  // Work Experience
  if (cvData.experience && cvData.experience.length > 0) {
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Work Experience', margin, yPosition);
    yPosition += 10;

    cvData.experience.forEach((exp) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(exp.title, margin, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.text(`${exp.company} | ${exp.startDate} - ${exp.endDate}`, margin, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const description = Array.isArray(exp.description) 
        ? exp.description.join('\n• ')
        : exp.description;
      const descLines = doc.splitTextToSize(`• ${description}`, pageWidth - margin * 2);
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * 5 + 10;
    });
  }

  // Education
  if (cvData.education && cvData.education.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Education', margin, yPosition);
    yPosition += 10;

    cvData.education.forEach((edu) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(edu.degree, margin, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      const eduInfo = `${edu.university} | ${edu.graduationYear}`;
      if (edu.gpa) {
        doc.text(`${eduInfo} | GPA: ${edu.gpa}`, margin, yPosition);
      } else {
        doc.text(eduInfo, margin, yPosition);
      }
      yPosition += 10;
    });
  }

  // Skills
  if (cvData.skills && cvData.skills.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Skills', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    // Split skills into two columns
    const midPoint = Math.ceil(cvData.skills.length / 2);
    const leftSkills = cvData.skills.slice(0, midPoint);
    const rightSkills = cvData.skills.slice(midPoint);
    const columnWidth = (pageWidth - margin * 3) / 2;

    leftSkills.forEach((skill, index) => {
      doc.text(`• ${skill}`, margin, yPosition);
      if (rightSkills[index]) {
        doc.text(`• ${rightSkills[index]}`, margin + columnWidth, yPosition);
      }
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Key Achievements
  if (cvData.achievements && cvData.achievements.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 8, 'F');
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Key Achievements', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    cvData.achievements.forEach((achievement) => {
      const achievementLines = doc.splitTextToSize(`• ${achievement}`, pageWidth - margin * 2);
      doc.text(achievementLines, margin, yPosition);
      yPosition += achievementLines.length * 5 + 5;
    });
  }

  // Generate PDF as base64
  const pdfBase64 = doc.output('datauristring').split(',')[1];
  const fileName = `${fullName.replace(/\s+/g, '_')}_CV.pdf`;

  return { pdfBase64, fileName };
}
