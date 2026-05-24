import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getOpenAI } from '@/lib/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to text (simplified - in production, use a PDF parsing library)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // For now, we'll use OpenAI to extract information from the PDF content
    // In production, you'd use a library like pdf-parse or pdf.js
    const prompt = `Extract the following information from this CV/resume and format it as JSON:
    {
      "fullName": "Full name",
      "email": "Email address",
      "phone": "Phone number",
      "location": "Location",
      "website": "Website/Portfolio",
      "title": "Current job title",
      "targetIndustry": "Industry",
      "rawExperience": "Work experience summary",
      "rawEducation": "Education summary",
      "rawSkills": "Skills separated by commas"
    }

    If any field is not found, use an empty string.`;

    try {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          { role: "system", content: "You are an expert at extracting information from CVs and resumes." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      const extractedData = JSON.parse(response || "{}");

      return NextResponse.json(extractedData);
    } catch (aiError) {
      // Fallback if AI extraction fails
      console.error('AI extraction failed:', aiError);
      return NextResponse.json({
        fullName: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        title: "",
        targetIndustry: "",
        rawExperience: "",
        rawEducation: "",
        rawSkills: ""
      });
    }
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}
