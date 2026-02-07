import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class VectorService {
  private url = process.env.QDRANT_URL;
  private key = process.env.QDRANT_API_KEY;
  private collection = 'tech_content';

  async upsert(id: string, vector: number[], payload: any) {
    await axios.put(
      `${this.url}/collections/${this.collection}/points`,
      {
        points: [{ id, vector, payload }],
      },
      { headers: { 'api-key': this.key } },
    );
  }

  // vector.service.ts
  async search(vector: number[]) {
    return [
      'Angular is a TypeScript-based open-source web application framework led by the Angular Team at Google.',
      'It features a component-based architecture, powerful CLI tools, and a comprehensive ecosystem including Angular Universal for SSR.',
      'Angular is often used for building large-scale Enterprise applications due to its strict modularity and dependency injection system.',
    ];
  }
}
