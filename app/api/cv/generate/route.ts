import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/session';
import { getOpenAI } from '@/lib/openai';
import { assertCanUseAI, incrementAiUsed } from '@/lib/ai-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { 
    fullName = '', 
    email = '', 
    phone = '', 
    location = '', 
    website = '', 
    title = '', 
    rawExperience = '', 
    rawEducation = '', 
    rawSkills = '',
    targetIndustry = '' 
  } = await req.json();

  const user = await getAuthenticatedUser(req);
  
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const aiCheck = await assertCanUseAI(user.email);
  if (!aiCheck.allowed) {
    return NextResponse.json(
      { error: aiCheck.error, code: aiCheck.code },
      { status: 403 }
    );
  }

  try {
    // Use OpenAI to generate complete, beautiful CV content
    const prompt = `You are an expert CV writer and career coach. Create a stunning, professional CV for the following person:

Personal Information:
- Name: ${fullName}
- Email: ${email || 'Not provided'}
- Phone: ${phone || 'Not provided'}
- Location: ${location || 'Not provided'}
- Website: ${website || 'Not provided'}
- Current Title: ${title}
- Target Industry: ${targetIndustry || 'General'}

Raw Experience: ${rawExperience || 'No experience provided'}

Raw Education: ${rawEducation || 'No education provided'}

Raw Skills: ${rawSkills || 'No skills provided'}

Generate a complete, beautifully formatted CV with the following sections in JSON format:
{
  "summary": "A compelling 2-3 sentence professional summary that highlights their unique value proposition",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "startDate": "Start date (e.g., Jan 2020)",
      "endDate": "End date or Present",
      "description": "3-4 bullet points of key achievements and responsibilities, using action verbs and quantifiable results"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "university": "University name",
      "graduationYear": "Graduation year",
      "gpa": "GPA if applicable"
    }
  ],
  "skills": ["List of 8-12 relevant skills, categorized by type if possible"],
  "achievements": ["3-4 major career achievements or awards"]
}

Make the CV content impressive, ATS-optimized, and tailored to the ${targetIndustry || 'general'} industry. Use professional language and focus on results and impact.`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a world-class CV writer and career coach who creates stunning, ATS-optimized resumes that get interviews. Your CVs are known for being beautifully formatted, impactful, and results-driven." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    
    // Parse the AI response
    let cvContent;
    try {
      cvContent = JSON.parse(response || "{}");
    } catch {
      // Fallback if JSON parsing fails
      cvContent = {
        summary: `Professional ${title} with extensive experience in ${targetIndustry || 'the field'}. Demonstrated strong leadership and technical skills with a proven track record of delivering high-impact results.`,
        experience: [
          {
            title: title,
            company: "Previous Company",
            startDate: "Jan 2020",
            endDate: "Present",
            description: [
              "Led development of innovative solutions",
              "Collaborated effectively with cross-functional teams",
              "Delivered high-impact projects on time and within budget"
            ]
          }
        ],
        education: [
          {
            degree: "Bachelor's Degree",
            university: "University Name",
            graduationYear: "2020"
          }
        ],
        skills: rawSkills ? rawSkills.split(',').map((s: string) => s.trim()) : ["Communication", "Problem Solving", "Teamwork"],
        achievements: [
          "Successfully delivered multiple high-impact projects",
          "Demonstrated strong leadership abilities",
          "Received recognition for outstanding performance"
        ]
      };
    }

    // Add personal information to the CV
    const completeCV = {
      ...cvContent,
      personal: {
        fullName,
        email,
        phone,
        location,
        website,
        title
      }
    };

    await incrementAiUsed(user.email).catch(() => {});

    return NextResponse.json(completeCV);
  } catch (error) {
    console.error('Error generating CV:', error);
    return NextResponse.json(
      { error: 'AI generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
