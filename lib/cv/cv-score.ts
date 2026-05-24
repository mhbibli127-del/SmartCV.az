export function scoreCv(parsed: any) {
  if (!parsed) return 0;

  let score = 20; // Lower base score to reward actual content detection
  
  // Safely extract fields regardless of input type
  const name = typeof parsed.name === 'string' ? parsed.name : '';
  const email = typeof parsed.email === 'string' ? parsed.email : '';
  const phone = typeof parsed.phone === 'string' ? parsed.phone : '';
  const skills = Array.isArray(parsed.skills) ? parsed.skills : [];
  const experience = Array.isArray(parsed.experience) ? parsed.experience : [];
  const education = Array.isArray(parsed.education) ? parsed.education : [];
  const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
  const links = Array.isArray(parsed.links) ? parsed.links : [];
  const languages = Array.isArray(parsed.languages) ? parsed.languages : [];
  const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
  const certifications = Array.isArray(parsed.certifications) ? parsed.certifications : [];
  const awards = Array.isArray(parsed.awards) ? parsed.awards : [];

  // Contact & Identity (40 points possible)
  if (name && name !== "Unknown") score += 10;
  if (email && email.includes('@')) score += 10;
  if (phone && phone.length > 5) score += 10;
  if (links.length > 0) score += 10;
  
  // Content Abundance (45 points possible)
  if (summary && summary.length > 50) score += 10;
  if (skills.length > 0) score += Math.min(skills.length, 10);
  if (experience.length > 0) score += 10;
  if (education.length > 0) score += 10;
  if (languages.length > 0) score += 5;
  if (projects.length > 0) score += 5;
  if (certifications.length > 0) score += 5;
  if (awards.length > 0) score += 5;
  
  // Structure (15 points possible)
  const sectionBonus = Array.isArray(parsed?.sections) ? Math.min(parsed.sections.length * 2, 15) : 0;
  
  return Math.min(100, score + sectionBonus);
}
