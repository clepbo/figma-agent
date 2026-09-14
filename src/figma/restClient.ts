import { FigmaRestFileResponse, FigmaRestNode } from './types';

export class FigmaRestClient {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.FIGMA_ACCESS_TOKEN || '';
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  public hasToken(): boolean {
    return Boolean(this.accessToken && this.accessToken.trim().length > 0);
  }

  private get headers() {
    return {
      'X-Figma-Token': this.accessToken,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch complete file tree metadata from Figma REST API
   */
  async getFile(fileKey: string, depth?: number): Promise<FigmaRestFileResponse> {
    if (!this.hasToken()) {
      throw new Error('Figma Access Token is missing. Provide FIGMA_ACCESS_TOKEN in environment or request.');
    }
    const url = `${this.baseUrl}/files/${fileKey}${depth ? `?depth=${depth}` : ''}`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Figma REST API error (${res.status}): ${errText}`);
    }
    return res.json() as Promise<FigmaRestFileResponse>;
  }

  /**
   * Fetch specific nodes by ID from a file
   */
  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<any> {
    if (!this.hasToken()) {
      throw new Error('Figma Access Token is missing.');
    }
    const ids = nodeIds.join(',');
    const url = `${this.baseUrl}/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Figma REST API error (${res.status}): ${errText}`);
    }
    return res.json();
  }

  /**
   * Render nodes or file frames as images (PNG, JPG, SVG, PDF)
   */
  async getImages(fileKey: string, nodeIds: string[], format: 'png' | 'jpg' | 'svg' | 'pdf' = 'png', scale = 1): Promise<{ images: Record<string, string> }> {
    if (!this.hasToken()) {
      throw new Error('Figma Access Token is missing.');
    }
    const ids = nodeIds.join(',');
    const url = `${this.baseUrl}/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=${format}&scale=${scale}`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Figma REST API error (${res.status}): ${errText}`);
    }
    return res.json() as Promise<{ images: Record<string, string> }>;
  }

  /**
   * Get file components
   */
  async getFileComponents(fileKey: string): Promise<any> {
    if (!this.hasToken()) {
      throw new Error('Figma Access Token is missing.');
    }
    const url = `${this.baseUrl}/files/${fileKey}/components`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Figma REST API error (${res.status}): ${errText}`);
    }
    return res.json();
  }

  /**
   * Helper to simplify and summarize a node tree for AI context
   */
  static summarizeTree(node: FigmaRestNode, depth = 0, maxDepth = 4): any {
    if (depth > maxDepth) return { id: node.id, name: node.name, type: node.type, truncated: true };
    
    const summary: any = {
      id: node.id,
      name: node.name,
      type: node.type,
      bounds: node.absoluteBoundingBox,
    };

    if (node.characters) {
      summary.text = node.characters;
    }

    if (node.children && node.children.length > 0) {
      summary.children = node.children.map(child => FigmaRestClient.summarizeTree(child, depth + 1, maxDepth));
    }

    return summary;
  }
}
