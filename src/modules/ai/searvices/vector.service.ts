import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content } from '../../content/content.schema';
import { Blog } from '../../blogs/blog.schema';
import { Technology } from '../../technolgoies/technologies.schema';

export interface SearchResult {
  text: string;
  type: 'content' | 'blog' | 'technology';
  title: string;
  score: number;
}

@Injectable()
export class VectorService {
  private readonly logger = new Logger(VectorService.name);

  constructor(
    @InjectModel(Content.name) private contentModel: Model<Content>,
    @InjectModel(Blog.name) private blogModel: Model<Blog>,
    @InjectModel(Technology.name) private techModel: Model<Technology>,
  ) { }

  /**
   * Text-based search across all collections (NO EMBEDDINGS NEEDED)
   * Uses MongoDB text indexes for search
   */
  async search(query: string, limit = 5): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      // Search in Content collection using text search
      const contentResults = await this.contentModel
        .find(
          {
            $text: { $search: query },
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      for (const doc of contentResults) {
        results.push({
          text: `${doc.title}\n${doc.description || ''}\n${doc.body.substring(0, 500)}`,
          type: 'content',
          title: doc.title,
          score: (doc as any).score || 1,
        });
      }

      // Search in Blogs collection using text search
      const blogResults = await this.blogModel
        .find(
          {
            $text: { $search: query },
          },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      for (const doc of blogResults) {
        results.push({
          text: `${doc.title}\n${doc.description || ''}\n${doc.content.substring(0, 500)}`,
          type: 'blog',
          title: doc.title,
          score: (doc as any).score || 1,
        });
      }

      // Search in Technologies collection using text search
      const techResults = await this.techModel
        .find(
          { $text: { $search: query } },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(3)
        .lean();

      for (const doc of techResults) {
        results.push({
          text: `Technology: ${doc.name}\n${doc.description || ''}`,
          type: 'technology',
          title: doc.name,
          score: (doc as any).score || 1,
        });
      }

      // Sort by score and return top results
      this.logger.log(`Found ${results.length} results for query: "${query}"`);
      return results.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error: any) {
      this.logger.warn('Text search error:', error.message);
      return [];
    }
  }
}
