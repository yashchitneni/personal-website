import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const notesDirectory = path.join(process.cwd(), 'app/noting/notes');

export interface Note {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  content?: string;
}

export function getAllNotes(): Note[] {
  const fileNames = fs.readdirSync(notesDirectory).filter(f => f.endsWith('.md'));
  const notes = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(notesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    return {
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      description: data.description || '',
    };
  });
  return notes.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getNoteBySlug(slug: string): Promise<Note & { content: string }> {
  const fullPath = path.join(notesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).process(content);
  return {
    slug,
    title: data.title,
    date: data.date,
    tags: data.tags || [],
    description: data.description || '',
    content: processedContent.toString(),
  };
}

export function getAllNoteSlugs(): string[] {
  return fs.readdirSync(notesDirectory)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}
