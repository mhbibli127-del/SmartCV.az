// Advanced AI Service with Database Integration
import { DatabaseOperations } from './models';
import { logger, performanceMonitor } from './logger';

export interface AIRecommendation {
  templateId: number;
  confidence: number;
  reason: string;
  factors: {
    industryMatch: number;
    experienceLevel: number;
    skillAlignment: number;
    atsScore: number;
  };
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async getPersonalizedRecommendations(userProfile: any): Promise<AIRecommendation[]> {
    const startTime = performanceMonitor.startMeasure('ai-recommendations');
    
    try {
      logger.info('Generating AI recommendations', 'ai-service', { userId: userProfile.userId });

      // Get all templates from database
      const templates = await DatabaseOperations.getTemplates();
      
      // Get user's historical interactions
      const interactions = await DatabaseOperations.getUserInteractions(userProfile.userId, 50);
      
      // Analyze user preferences from interactions
      const userPreferences = this.analyzeUserPreferences(interactions);
      
      // Score each template based on multiple factors
      const scoredTemplates = templates.map(template => {
        const score = this.calculateTemplateScore(template, userProfile, userPreferences);
        return {
          templateId: template.id,
          confidence: score.confidence,
          reason: score.reason,
          factors: score.factors
        };
      });

      // Sort by confidence and return top recommendations
      const recommendations = scoredTemplates
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      performanceMonitor.endMeasure('ai-recommendations', startTime);
      
      logger.info('AI recommendations generated', 'ai-service', { 
        userId: userProfile.userId,
        count: recommendations.length 
      });

      return recommendations;
    } catch (error) {
      logger.error('Failed to generate AI recommendations', 'ai-service', error as Error);
      throw error;
    }
  }

  private analyzeUserPreferences(interactions: any[]) {
    const preferences = {
      categories: {} as Record<string, number>,
      styles: {} as Record<string, number>,
      avgRating: 0,
      viewCount: 0
    };

    interactions.forEach(interaction => {
      if (interaction.metadata?.category) {
        preferences.categories[interaction.metadata.category] = 
          (preferences.categories[interaction.metadata.category] || 0) + 1;
      }
      if (interaction.metadata?.style) {
        preferences.styles[interaction.metadata.style] = 
          (preferences.styles[interaction.metadata.style] || 0) + 1;
      }
      if (interaction.action === 'view') {
        preferences.viewCount++;
      }
    });

    return preferences;
  }

  private calculateTemplateScore(template: any, userProfile: any, userPreferences: any) {
    let industryMatch = 0;
    let experienceLevel = 0;
    let skillAlignment = 0;
    let atsScore = template.rating * 20; // Base score from rating

    // Industry matching
    if (userProfile.targetIndustry) {
      const industryKeywords: Record<string, string[]> = {
        'tech': ['Tech', 'Software', 'Developer', 'Engineer'],
        'creative': ['Creative', 'Designer', 'Artist', 'Marketing'],
        'healthcare': ['Healthcare', 'Medical', 'Nurse', 'Doctor'],
        'finance': ['Finance', 'Analyst', 'Banking', 'Accounting'],
        'academic': ['Academic', 'Research', 'Professor', 'Education']
      };

      const keywords = industryKeywords[userProfile.targetIndustry.toLowerCase()] || [];
      const templateKeywords = [template.title, template.category, template.style, ...template.features].join(' ').toLowerCase();
      
      const matchCount = keywords.filter((keyword: string) => templateKeywords.includes(keyword.toLowerCase())).length;
      industryMatch = keywords.length > 0 ? (matchCount / keywords.length) * 100 : 0;
    }

    // Experience level matching
    if (userProfile.experienceLevel) {
      const experienceMap: Record<string, string[]> = {
        'entry': ['Entry Level', 'Internship', 'First Job'],
        'mid': ['Professional', 'Manager', 'Specialist'],
        'senior': ['Executive', 'Senior', 'Lead', 'Director']
      };

      const levelKeywords = experienceMap[userProfile.experienceLevel] || [];
      const templateKeywords = [template.title, template.category, template.description].join(' ').toLowerCase();
      
      const matchCount = levelKeywords.filter((keyword: string) => templateKeywords.includes(keyword.toLowerCase())).length;
      experienceLevel = levelKeywords.length > 0 ? (matchCount / levelKeywords.length) * 100 : 0;
    }

    // Skill alignment based on user preferences
    if (userPreferences.categories[template.category]) {
      skillAlignment = Math.min((userPreferences.categories[template.category] / userPreferences.viewCount) * 100, 100);
    }

    // Calculate overall confidence
    const confidence = (industryMatch * 0.3) + (experienceLevel * 0.3) + (skillAlignment * 0.2) + (atsScore * 0.2);

    // Generate reason
    const reasons = [];
    if (industryMatch > 50) reasons.push(`matches your ${userProfile.targetIndustry} industry`);
    if (experienceLevel > 50) reasons.push(`fits your ${userProfile.experienceLevel} experience level`);
    if (skillAlignment > 50) reasons.push(`aligns with your preferences`);
    if (atsScore > 70) reasons.push(`has excellent ATS optimization`);
    
    const reason = reasons.length > 0 
      ? `This template ${reasons.join(', ')}.`
      : `This template has a ${template.rating} star rating and is popular among users.`;

    return {
      confidence,
      reason,
      factors: {
        industryMatch,
        experienceLevel,
        skillAlignment,
        atsScore
      }
    };
  }

  async analyzeCVQuality(cvData: any): Promise<{
    overallScore: number;
    sections: {
      summary: number;
      experience: number;
      education: number;
      skills: number;
    };
    suggestions: string[];
    atsOptimization: number;
  }> {
    const startTime = performanceMonitor.startMeasure('cv-analysis');

    try {
      logger.info('Analyzing CV quality', 'ai-service');

      const scores = {
        summary: 0,
        experience: 0,
        education: 0,
        skills: 0
      };

      const suggestions: string[] = [];

      // Analyze summary
      if (cvData.rawExperience) {
        const wordCount = cvData.rawExperience.split(' ').length;
        scores.experience = wordCount > 50 ? 90 : wordCount > 30 ? 70 : 50;
        
        if (wordCount < 30) {
          suggestions.push('Add more detail to your experience section');
        }
      } else {
        scores.experience = 0;
        suggestions.push('Missing experience section');
      }

      // Analyze education
      if (cvData.rawEducation) {
        scores.education = 80;
      } else {
        scores.education = 40;
        suggestions.push('Consider adding education details');
      }

      // Analyze skills
      if (cvData.rawSkills) {
        const skillCount = cvData.rawSkills.split(',').length;
        scores.skills = skillCount > 5 ? 90 : skillCount > 3 ? 70 : 50;
        
        if (skillCount < 5) {
          suggestions.push('Add more relevant skills to stand out');
        }
      } else {
        scores.skills = 0;
        suggestions.push('Missing skills section');
      }

      // Calculate overall score
      const overallScore = (scores.experience * 0.4) + (scores.education * 0.2) + (scores.skills * 0.4);

      // ATS optimization score
      const atsOptimization = overallScore * 0.9; // Slightly lower than overall

      performanceMonitor.endMeasure('cv-analysis', startTime);

      logger.info('CV analysis completed', 'ai-service', { overallScore, atsOptimization });

      return {
        overallScore,
        sections: scores,
        suggestions,
        atsOptimization
      };
    } catch (error) {
      logger.error('Failed to analyze CV', 'ai-service', error as Error);
      throw error;
    }
  }

  async generateJobMatchScore(cvData: any, jobDescription: string): Promise<{
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  }> {
    const startTime = performanceMonitor.startMeasure('job-match');

    try {
      logger.info('Calculating job match score', 'ai-service');

      // Extract skills from CV
      const cvSkills = cvData.rawSkills ? cvData.rawSkills.split(',').map((s: string) => s.trim().toLowerCase()) : [];
      
      // Extract required skills from job description (simplified)
      const jobSkills = this.extractSkillsFromJobDescription(jobDescription);
      
      // Find matches
      const matchedSkills = cvSkills.filter((skill: string) => jobSkills.includes(skill));
      const missingSkills = jobSkills.filter((skill: string) => !cvSkills.includes(skill));
      
      // Calculate match score
      const matchScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 0;

      // Generate recommendations
      const recommendations: string[] = [];
      if (missingSkills.length > 0) {
        recommendations.push(`Consider highlighting these skills: ${missingSkills.join(', ')}`);
      }
      if (matchScore > 70) {
        recommendations.push('Your CV is a strong match for this position');
      } else if (matchScore > 40) {
        recommendations.push('Your CV has moderate alignment with this role');
      } else {
        recommendations.push('Consider tailoring your CV more specifically to this role');
      }

      performanceMonitor.endMeasure('job-match', startTime);

      logger.info('Job match score calculated', 'ai-service', { matchScore });

      return {
        matchScore,
        matchedSkills,
        missingSkills,
        recommendations
      };
    } catch (error) {
      logger.error('Failed to calculate job match', 'ai-service', error as Error);
      throw error;
    }
  }

  private extractSkillsFromJobDescription(jobDescription: string): string[] {
    // Simplified skill extraction - in production, use NLP
    const commonSkills = [
      'javascript', 'python', 'react', 'node.js', 'typescript', 'java', 'sql',
      'project management', 'leadership', 'communication', 'analytics', 'marketing',
      'design', 'sales', 'customer service', 'problem solving', 'teamwork'
    ];

    const lowerDescription = jobDescription.toLowerCase();
    return commonSkills.filter(skill => lowerDescription.includes(skill));
  }

  async getMarketInsights(category?: string): Promise<{
    trendingTemplates: number[];
    popularCategories: Record<string, number>;
    industryTrends: string[];
    salaryInsights: Record<string, number>;
  }> {
    const startTime = performanceMonitor.startMeasure('market-insights');

    try {
      logger.info('Fetching market insights', 'ai-service', { category });

      // Get analytics data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const analytics = await DatabaseOperations.getAnalytics(today);
      
      // Get templates
      const templates = await DatabaseOperations.getTemplates();
      
      // Calculate trending templates (most viewed in recent period)
      const trendingTemplates = templates
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(t => t.id);

      // Popular categories
      const popularCategories = analytics?.popularCategories || {};

      // Industry trends (simulated based on category data)
      const industryTrends = [
        'Remote work preferences increasing',
        'AI and automation skills in high demand',
        'Soft skills becoming more important',
        'Portfolio-based hiring growing',
        'Cross-functional roles trending'
      ];

      // Salary insights (simulated)
      const salaryInsights = {
        'Tech': 95000,
        'Healthcare': 78000,
        'Finance': 89000,
        'Creative': 65000,
        'Marketing': 72000
      };

      performanceMonitor.endMeasure('market-insights', startTime);

      logger.info('Market insights fetched', 'ai-service');

      return {
        trendingTemplates,
        popularCategories,
        industryTrends,
        salaryInsights
      };
    } catch (error) {
      logger.error('Failed to fetch market insights', 'ai-service', error as Error);
      throw error;
    }
  }
}

export const aiService = AIService.getInstance();
