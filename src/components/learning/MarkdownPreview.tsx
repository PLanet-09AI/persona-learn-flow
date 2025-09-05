import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { formatContent } from '@/utils/markdownUtils';
import '@/styles/markdown.css';
import '@/styles/markdown-premium.css';
import '@/styles/markdown-enhanced.css';

const sampleMarkdown = `# 📚 Digital Marketing Fundamentals

Welcome to the comprehensive guide on **digital marketing**! This course will transform your understanding of modern marketing strategies.

## 🎯 Learning Outcomes

After completing this course, you will be able to:

- Develop comprehensive digital marketing strategies aligned with business goals
- Analyze and optimize campaigns using data-driven insights and analytics
- Create engaging content across multiple digital channels
- Implement SEO and SEM tactics to improve online visibility
- Measure ROI of digital marketing efforts using key performance indicators

---

## 💡 Key Concepts

### 1. **Search Engine Optimization (SEO)**

SEO is the practice of optimizing your website to \`rank higher\` in search engine results pages (SERPs).

> **💡 Tip:** Focus on creating high-quality, relevant content that answers your audience's questions.

**Key SEO Elements:**
- **On-page SEO**: Content optimization, meta tags, headers
- **Technical SEO**: Site speed, mobile-friendliness, crawlability  
- **Off-page SEO**: Backlinks, social signals, brand mentions

### 2. **Content Marketing Strategy**

Content marketing involves creating and sharing valuable content to attract and engage your target audience.

\`\`\`javascript
// Example: Content performance tracking
const contentMetrics = {
  views: 15000,
  engagement: 0.08,
  conversions: 120,
  roi: 300
};

function calculateContentROI(metrics) {
  return (metrics.conversions * 100) / metrics.views;
}
\`\`\`

## 📊 Digital Marketing Channels Comparison

| Channel | Cost | Reach | Conversion Rate | Best For |
|---------|------|-------|-----------------|----------|
| SEO | Low | High | 14.6% | Long-term growth |
| PPC | High | Medium | 3.75% | Quick results |
| Social Media | Medium | High | 1.85% | Brand awareness |
| Email | Low | Medium | 6.05% | Customer retention |

## ⚠️ Common Mistakes to Avoid

> **⚠️ Warning:** Don't focus solely on vanity metrics like likes and shares. Always tie your metrics back to business objectives.

### Critical Errors:
1. **Ignoring mobile optimization** - 60% of searches happen on mobile
2. **Not tracking conversions** - Without tracking, you can't optimize
3. **Inconsistent branding** - Confuses your audience and dilutes your message
4. **Neglecting customer data** - Data-driven decisions outperform gut feelings

## 🚀 Next Steps

Ready to implement what you've learned? Here's your action plan:

1. **Audit your current digital presence**
   - Check your website's SEO score
   - Analyze your social media performance
   - Review your content strategy

2. **Set up tracking and analytics**
   - Install Google Analytics 4
   - Set up conversion tracking
   - Create custom dashboards

3. **Create your first campaign**
   - Define your target audience
   - Choose the right channels
   - Set measurable goals

---

*Remember: Digital marketing is not about being everywhere - it's about being where your customers are, with the right message, at the right time.*`;

export const MarkdownPreview: React.FC = () => {
  const enhancedMarkdownComponents = {
    // GitHub-style headings with visual hierarchy
    h1: ({children}: any) => (
      <h1 className="text-3xl font-bold mt-8 mb-6 pb-3 border-b-2 border-primary/30 text-primary flex items-center gap-3">
        {children}
      </h1>
    ),
    h2: ({children}: any) => (
      <h2 className="text-2xl font-semibold mt-6 mb-4 pb-2 border-b border-primary/20 text-primary flex items-center gap-2">
        {children}
      </h2>
    ),
    h3: ({children}: any) => (
      <h3 className="text-xl font-medium mt-5 mb-3 text-foreground flex items-center gap-2">
        {children}
      </h3>
    ),
    
    // Enhanced lists with proper GitHub styling
    ul: ({children}: any) => (
      <ul className="space-y-2 mb-4 ml-0 list-none">
        {children}
      </ul>
    ),
    ol: ({children}: any) => (
      <ol className="space-y-2 mb-4 ml-6 list-decimal list-outside">
        {children}
      </ol>
    ),
    li: ({children}: any) => (
      <li className="flex items-start gap-3 text-foreground/90 leading-relaxed">
        <span className="text-primary mt-1 text-sm font-bold">•</span>
        <span className="flex-1">{children}</span>
      </li>
    ),
    
    // Enhanced paragraphs
    p: ({children}: any) => (
      <p className="mb-4 text-foreground/90 leading-relaxed text-base">
        {children}
      </p>
    ),
    
    // Enhanced code styling
    code: ({inline, className, children, ...props}: any) => {
      if (inline) {
        return (
          <code 
            className="bg-secondary/80 text-primary px-2 py-1 rounded-md text-sm font-mono border border-border/50"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code 
          className={`block bg-secondary/40 p-4 rounded-lg font-mono text-sm border border-border/50 overflow-x-auto ${className || ''}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Enhanced pre blocks
    pre: ({children}: any) => (
      <pre className="bg-secondary/30 p-4 rounded-lg my-6 overflow-x-auto border border-border/50 shadow-sm">
        {children}
      </pre>
    ),
    
    // Enhanced blockquotes with better styling
    blockquote: ({children}: any) => (
      <blockquote className="border-l-4 border-primary/40 bg-secondary/30 pl-6 py-4 my-6 italic rounded-r-lg shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-primary text-2xl leading-none mt-1">"</span>
          <div className="flex-1 text-foreground/80">{children}</div>
        </div>
      </blockquote>
    ),
    
    // Enhanced links
    a: ({href, children}: any) => (
      <a 
        href={href}
        className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors decoration-primary/50 hover:decoration-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    
    // Enhanced tables
    table: ({children}: any) => (
      <div className="overflow-x-auto my-6 rounded-lg border border-border/50 shadow-sm">
        <table className="w-full border-collapse bg-background">
          {children}
        </table>
      </div>
    ),
    thead: ({children}: any) => (
      <thead className="bg-primary/10 border-b-2 border-primary/20">
        {children}
      </thead>
    ),
    th: ({children}: any) => (
      <th className="px-6 py-4 text-left font-semibold text-primary border-r border-primary/10 last:border-r-0">
        {children}
      </th>
    ),
    td: ({children}: any) => (
      <td className="px-6 py-4 border-r border-border/30 last:border-r-0 border-b border-border/20 text-foreground/90">
        {children}
      </td>
    ),
    tr: ({children}: any) => (
      <tr className="hover:bg-secondary/20 transition-colors">
        {children}
      </tr>
    ),
    
    // Enhanced emphasis
    strong: ({children}: any) => (
      <strong className="font-semibold text-primary">
        {children}
      </strong>
    ),
    em: ({children}: any) => (
      <em className="italic text-foreground/80">
        {children}
      </em>
    ),
    
    // Horizontal rules
    hr: () => (
      <hr className="my-8 border-none h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    ),
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 text-primary">Markdown Preview</h1>
        <p className="text-muted-foreground">
          This preview shows how all markdown elements (# headers, * bullets, etc.) are rendered with beautiful GitHub-style formatting.
        </p>
      </div>
      
      <div className="prose dark:prose-invert max-w-none markdown-body border border-border/50 rounded-lg p-8 bg-background shadow-sm">
        {(ReactMarkdown as any)({
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeRaw],
          components: enhancedMarkdownComponents,
          children: formatContent(sampleMarkdown)
        })}
      </div>
    </div>
  );
};
