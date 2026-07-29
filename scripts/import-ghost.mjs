import fs from 'node:fs';
import path from 'node:path';

const GHOST_EXPORT_PATH = process.argv[2] || './ghost-export.json';
const OUTPUT_DIR = './_posts';

if (!fs.existsSync(GHOST_EXPORT_PATH)) {
  console.log(`❌ Ghost export file not found at "${GHOST_EXPORT_PATH}".`);
  console.log(`👉 Please place your Ghost JSON export file in the project root as "ghost-export.json" and run: node scripts/import-ghost.mjs`);
  process.exit(0);
}

try {
  const rawData = fs.readFileSync(GHOST_EXPORT_PATH, 'utf-8');
  const data = JSON.parse(rawData);
  const posts = data?.db?.[0]?.data?.posts || data?.posts || [];

  if (!posts.length) {
    console.log('⚠️ No posts found in Ghost export file.');
    process.exit(0);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let count = 0;
  for (const post of posts) {
    if (post.status !== 'published') continue;

    const title = post.title || 'Untitled Post';
    const slug = post.slug || `post-${post.id}`;
    const pubDate = post.published_at ? new Date(post.published_at) : new Date();
    
    // Format YYYY-MM-DD for Jekyll filename
    const year = pubDate.getFullYear();
    const month = String(pubDate.getMonth() + 1).padStart(2, '0');
    const day = String(pubDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const description = (post.custom_excerpt || post.excerpt || '').replace(/"/g, '\\"');
    const featureImage = post.feature_image || '';
    
    let bodyContent = post.html || post.markdown || post.plaintext || '';

    const frontmatter = `---
layout: post
title: "${title.replace(/"/g, '\\"')}"
date: ${pubDate.toISOString()}
description: "${description}"
${featureImage ? `image: "${featureImage}"\n` : ''}---

${bodyContent}
`;

    const fileName = `${dateStr}-${slug}.md`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), frontmatter, 'utf-8');
    count++;
  }

  console.log(`✅ Successfully imported ${count} posts into ${OUTPUT_DIR}/!`);
} catch (err) {
  console.error('❌ Error processing Ghost export:', err.message);
}
