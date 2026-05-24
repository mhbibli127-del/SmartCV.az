import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

// Template Model
export interface Template {
  _id?: ObjectId;
  id: number;
  title: string;
  category: string;
  style: string;
  color: string;
  description: string;
  features: string[];
  imageUrl: string;
  views: number;
  downloads: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// User Interaction Model
export interface UserInteraction {
  _id?: ObjectId;
  userId: string;
  userEmail: string;
  action: string;
  elementType: string;
  elementId?: string;
  page: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Analytics Model
export interface Analytics {
  _id?: ObjectId;
  date: Date;
  totalViews: number;
  totalDownloads: number;
  totalUsers: number;
  activeUsers: number;
  templateViews: Record<string, number>;
  templateDownloads: Record<string, number>;
  popularCategories: Record<string, number>;
  conversionRate: number;
  avgSessionDuration: number;
}

// CV Model
export interface CV {
  _id?: ObjectId;
  userId: string;
  userEmail: string;
  templateId: number;
  data: any;
  status: 'draft' | 'completed';
  atsScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// User Profile Model
export interface UserProfile {
  _id?: ObjectId;
  userId: string;
  userEmail: string;
  name?: string;
  avatar?: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  stats: {
    cvsCreated: number;
    templatesUsed: number;
    lastActive: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Database Operations
export class DatabaseOperations {
  static async getTemplates() {
    const db = await getDatabase();
    return db.collection<Template>('templates').find({}).toArray();
  }

  static async getTemplateById(id: number) {
    const db = await getDatabase();
    return db.collection<Template>('templates').findOne({ id });
  }

  static async getTemplatesByCategory(category: string) {
    const db = await getDatabase();
    return db.collection<Template>('templates').find({ category }).toArray();
  }

  static async searchTemplates(query: string) {
    const db = await getDatabase();
    return db.collection<Template>('templates').find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { features: { $regex: query, $options: 'i' } }
      ]
    }).toArray();
  }

  static async updateTemplateStats(id: number, action: 'view' | 'download') {
    const db = await getDatabase();
    const updateField = action === 'view' ? 'views' : 'downloads';
    return db.collection<Template>('templates').updateOne(
      { id },
      { $inc: { [updateField]: 1 }, $set: { updatedAt: new Date() } }
    );
  }

  static async trackInteraction(interaction: Omit<UserInteraction, '_id' | 'timestamp'>) {
    const db = await getDatabase();
    return db.collection<UserInteraction>('interactions').insertOne({
      ...interaction,
      timestamp: new Date()
    });
  }

  static async getUserInteractions(userId: string, limit = 50) {
    const db = await getDatabase();
    return db.collection<UserInteraction>('interactions')
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  static async getAnalytics(date: Date) {
    const db = await getDatabase();
    return db.collection<Analytics>('analytics').findOne({ date });
  }

  static async upsertAnalytics(date: Date, analyticsData: Partial<Analytics>) {
    const db = await getDatabase();
    return db.collection<Analytics>('analytics').updateOne(
      { date },
      { $set: { ...analyticsData, date } },
      { upsert: true }
    );
  }

  static async saveCV(cv: Omit<CV, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDatabase();
    return db.collection<CV>('cvs').insertOne({
      ...cv,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  static async upsertUserCV(cv: Omit<CV, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDatabase();
    const existing = await db.collection<CV>('cvs').findOne({
      userId: cv.userId,
      status: cv.status,
    });

    if (existing?._id) {
      await db.collection<CV>('cvs').updateOne(
        { _id: existing._id },
        { $set: { ...cv, updatedAt: new Date() } }
      );
      return { insertedId: existing._id, updated: true };
    }

    const result = await this.saveCV(cv);
    return { insertedId: result.insertedId, updated: false };
  }

  static async completeUserCV(userId: string) {
    const db = await getDatabase();
    return db.collection<CV>('cvs').updateOne(
      { userId, status: 'draft' },
      { $set: { status: 'completed', updatedAt: new Date() } }
    );
  }

  static async getUserCVs(userId: string) {
    const db = await getDatabase();
    return db.collection<CV>('cvs').find({ userId }).toArray();
  }

  static async getUserCV(userId: string) {
    const db = await getDatabase();
    return db.collection<CV>('cvs').findOne({ userId, status: 'draft' });
  }

  static async updateCV(id: ObjectId, updates: Partial<CV>) {
    const db = await getDatabase();
    return db.collection<CV>('cvs').updateOne(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  static async getUserProfile(userId: string) {
    const db = await getDatabase();
    return db.collection<UserProfile>('profiles').findOne({ userId });
  }

  static async upsertUserProfile(profile: Omit<UserProfile, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await getDatabase();
    return db.collection<UserProfile>('profiles').updateOne(
      { userId: profile.userId },
      { 
        $set: { 
          ...profile, 
          updatedAt: new Date() 
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
  }

  static async initializeTemplates() {
    const db = await getDatabase();
    const existingCount = await db.collection<Template>('templates').countDocuments();
    
    if (existingCount === 0) {
      // Templates will be initialized via migration script
      console.log('Templates initialized');
    }
  }
}
