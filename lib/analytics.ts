// Global event tracking utility
export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private userId: string | null = null;
  private sessionStartTime: number = Date.now();

  private constructor() {}

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async trackEvent(eventType: string, data: any = {}) {
    try {
      const payload = {
        eventType,
        data: {
          ...data,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          sessionDuration: Date.now() - this.sessionStartTime,
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        }
      };

      // Send to analytics API
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  trackPageView(page: string) {
    this.trackEvent('page_view', { page });
  }

  trackButtonClick(buttonName: string, buttonId: string, page: string) {
    this.trackEvent('button_click', {
      elementType: 'button',
      elementId: buttonId,
      buttonName,
      page
    });
  }

  trackTemplateView(templateId: number, templateTitle: string, category: string) {
    this.trackEvent('template_view', {
      elementType: 'template',
      elementId: templateId.toString(),
      templateId,
      templateTitle,
      category,
      page: '/dashboard/examples'
    });
  }

  trackTemplateDownload(templateId: number, templateTitle: string, category: string) {
    this.trackEvent('template_download', {
      elementType: 'template',
      elementId: templateId.toString(),
      templateId,
      templateTitle,
      category,
      page: '/dashboard/examples'
    });
  }

  trackTemplateSelect(templateId: number, templateTitle: string, category: string) {
    this.trackEvent('template_select', {
      elementType: 'template',
      elementId: templateId.toString(),
      templateId,
      templateTitle,
      category,
      page: '/dashboard/examples'
    });
  }

  trackCVCreation(templateId: number, cvData: any) {
    this.trackEvent('cv_created', {
      elementType: 'cv',
      templateId,
      cvData: {
        hasExperience: !!cvData.rawExperience,
        hasEducation: !!cvData.rawEducation,
        hasSkills: !!cvData.rawSkills,
        targetIndustry: cvData.targetIndustry
      },
      page: '/dashboard/builder'
    });
  }

  trackSearch(query: string, resultsCount: number) {
    this.trackEvent('search', {
      elementType: 'search',
      query,
      resultsCount,
      page: '/dashboard/examples'
    });
  }

  trackFilterChange(filterType: string, filterValue: string) {
    this.trackEvent('filter_change', {
      elementType: 'filter',
      filterType,
      filterValue,
      page: '/dashboard/examples'
    });
  }

  trackAIRecommendation(recommendation: string) {
    this.trackEvent('ai_recommendation', {
      elementType: 'ai',
      recommendation,
      page: '/dashboard/examples'
    });
  }

  trackError(error: Error, context: string) {
    this.trackEvent('error', {
      elementType: 'error',
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      page: window.location.pathname
    });
  }

  trackSessionStart() {
    this.sessionStartTime = Date.now();
    this.trackEvent('session_start', {
      elementType: 'session',
      page: window.location.pathname
    });
  }

  trackSessionEnd() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.trackEvent('session_end', {
      elementType: 'session',
      sessionDuration,
      page: window.location.pathname
    });
  }
}

// React hook for analytics
export function useAnalytics() {
  const tracker = AnalyticsTracker.getInstance();

  return {
    trackPageView: (page: string) => tracker.trackPageView(page),
    trackButtonClick: (buttonName: string, buttonId: string, page: string) => 
      tracker.trackButtonClick(buttonName, buttonId, page),
    trackTemplateView: (templateId: number, templateTitle: string, category: string) => 
      tracker.trackTemplateView(templateId, templateTitle, category),
    trackTemplateDownload: (templateId: number, templateTitle: string, category: string) => 
      tracker.trackTemplateDownload(templateId, templateTitle, category),
    trackTemplateSelect: (templateId: number, templateTitle: string, category: string) => 
      tracker.trackTemplateSelect(templateId, templateTitle, category),
    trackCVCreation: (templateId: number, cvData: any) => 
      tracker.trackCVCreation(templateId, cvData),
    trackSearch: (query: string, resultsCount: number) => 
      tracker.trackSearch(query, resultsCount),
    trackFilterChange: (filterType: string, filterValue: string) => 
      tracker.trackFilterChange(filterType, filterValue),
    trackAIRecommendation: (recommendation: string) => 
      tracker.trackAIRecommendation(recommendation),
    trackError: (error: Error, context: string) => 
      tracker.trackError(error, context),
    trackSessionStart: () => tracker.trackSessionStart(),
    trackSessionEnd: () => tracker.trackSessionEnd(),
    setUserId: (userId: string) => tracker.setUserId(userId)
  };
}
