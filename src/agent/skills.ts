import fs from 'fs';
import path from 'path';

export interface SkillMetadata {
  name: string;
  description: string;
  category: 'generation' | 'research' | 'editing' | 'review' | 'brand' | 'other';
  command: string; // e.g. /translate-prd-brief
  instructions: string; // Full markdown body instructions
  filePath?: string;
}

export class SkillRegistry {
  private skills = new Map<string, SkillMetadata>();

  constructor(skillsDir?: string) {
    const dir = skillsDir || path.join(process.cwd(), 'skills');
    this.loadSkillsFromDirectory(dir);
  }

  /**
   * Load skills from markdown files in directory
   */
  public loadSkillsFromDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const fullPath = path.join(dirPath, file);
          const content = fs.readFileSync(fullPath, 'utf-8');
          const skill = this.parseSkillMarkdown(content, fullPath);
          if (skill) {
            this.skills.set(skill.command.toLowerCase(), skill);
            this.skills.set(skill.name.toLowerCase(), skill);
          }
        }
      }
    } catch (err) {
      console.error('Error loading skills directory:', err);
    }
  }

  /**
   * Parse frontmatter markdown format
   */
  public parseSkillMarkdown(content: string, filePath?: string): SkillMetadata | null {
    const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---\s*([\s\S]*)$/);
    let name = 'unnamed-skill';
    let description = 'Custom design skill';
    let category: any = 'other';
    let command = '/custom-skill';
    let instructions = content;

    if (frontmatterMatch) {
      const yamlHeader = frontmatterMatch[1];
      instructions = frontmatterMatch[2].trim();

      yamlHeader.split('\n').forEach(line => {
        const [key, ...valParts] = line.split(':');
        if (key && valParts.length > 0) {
          const val = valParts.join(':').trim();
          if (key.trim() === 'name') name = val;
          if (key.trim() === 'description') description = val;
          if (key.trim() === 'category') category = val;
          if (key.trim() === 'command') command = val.startsWith('/') ? val : `/${val}`;
        }
      });
    }

    return {
      name,
      description,
      category,
      command,
      instructions,
      filePath
    };
  }

  /**
   * Register a custom skill dynamically
   */
  public registerSkill(skill: SkillMetadata) {
    const cmd = skill.command.startsWith('/') ? skill.command.toLowerCase() : `/${skill.command.toLowerCase()}`;
    this.skills.set(cmd, skill);
    this.skills.set(skill.name.toLowerCase(), skill);
  }

  public getSkill(nameOrCommand: string): SkillMetadata | undefined {
    const key = nameOrCommand.toLowerCase();
    return this.skills.get(key) || this.skills.get(`/${key}`);
  }

  public getAllSkills(): SkillMetadata[] {
    const unique = new Map<string, SkillMetadata>();
    for (const skill of this.skills.values()) {
      unique.set(skill.name, skill);
    }
    return Array.from(unique.values());
  }

  /**
   * Detects if prompt starts with a slash command or matches a skill
   */
  public matchSkillInPrompt(prompt: string): { skill?: SkillMetadata; cleanPrompt: string } {
    const trimmed = prompt.trim();
    if (trimmed.startsWith('/')) {
      const spaceIdx = trimmed.indexOf(' ');
      const cmd = spaceIdx > -1 ? trimmed.substring(0, spaceIdx) : trimmed;
      const cleanPrompt = spaceIdx > -1 ? trimmed.substring(spaceIdx + 1).trim() : '';
      const matched = this.getSkill(cmd);
      if (matched) {
        return { skill: matched, cleanPrompt };
      }
    }
    return { cleanPrompt: prompt };
  }
}
