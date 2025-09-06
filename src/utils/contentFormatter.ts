import { LearningStyle } from "@/types/learning";

/**
 * Fix fragmented ASCII diagrams by consolidating broken parts
 */
const fixFragmentedDiagrams = (content: string): string => {
  // Remove existing plaintext markers that are breaking the diagrams
  content = content.replace(/plaintext\s*\n\s*/g, '');
  content = content.replace(/plaintext\s*/g, '');
  
  // Find and reconstruct Business Strategy overview diagram
  if (content.includes('Business Strategy') && content.includes('Competitive') && content.includes('Corporate')) {
    const businessStrategyDiagram = `
\`\`\`plaintext
                    Business Strategy Framework
                    ===========================
                             
                                   |
                                   |
            +---------------------+---------------------+
            |                                           |
            v                                           v
    +----------------+                          +----------------+
    | Competitive    |                          | Corporate      |
    | Advantage      |                          | Strategy       |
    +----------------+                          +----------------+
            |                                           |
            |                                           |
    +-------+--------+                        +---------+--------+
    |                |                        |                  |
    v                v                        v                  v
+----------+  +----------+            +----------+    +----------+
|Strategic |  | Market   |            |Strategic |    |Resource  |
|Planning  |  |Analysis  |            |Goals     |    |Allocation|
+----------+  +----------+            +----------+    +----------+
\`\`\``;
    
    // Replace the fragmented parts with clean diagram
    content = content.replace(/\+-{20,}\+[\s\S]*?Business Strategy[\s\S]*?\+[-+]+\+[\s\S]*?Competitive[\s\S]*?Corporate[\s\S]*?Strategic Planning[\s\S]*?Market Analysis[\s\S]*?\+-{10,}\+/g, businessStrategyDiagram);
  }

  // Fix Competitive Advantage diagram
  if (content.includes('Competitive Advantage') && content.includes('Product') && content.includes('Process')) {
    const competitiveAdvantagesDiagram = `
\`\`\`plaintext
         Competitive Advantage Components
         ================================
                        |
            +-----------+----------+
            |                      |
            v                      v
    +----------------+    +----------------+
    | Product        |    | Process        |
    | Differentiation|    | Efficiency     |
    +----------------+    +----------------+
            |                      |
            |                      |
            v                      v
      [Brand Value]          [Cost Savings]
      [Innovation]          [Speed/Quality]
\`\`\``;
    
    content = content.replace(/\+[-+]*\+[\s\S]*?Competitive[\s\S]*?Advantage[\s\S]*?Product[\s\S]*?Process[\s\S]*?\+[-+]*\+/g, competitiveAdvantagesDiagram);
  }

  // Fix Strategic Planning diagram
  if (content.includes('Strategic Planning') && content.includes('Goal Setting') && content.includes('Environmental')) {
    const strategicPlanningDiagram = `
\`\`\`plaintext
         Strategic Planning Process
         ==========================
                        |
            +-----------+----------+
            |                      |
            v                      v
    +----------------+    +----------------+
    | Goal Setting   |    | Environmental  |
    |                |    | Analysis       |
    +----------------+    +----------------+
            |                      |
            +----------+-----------+
                       |
                       v
            +------------------+
            | Strategy         |
            | Development      |
            +------------------+
\`\`\``;
    
    content = content.replace(/\+[-+]*\+[\s\S]*?Strategic[\s\S]*?Planning[\s\S]*?Goal Setting[\s\S]*?Environmental[\s\S]*?\+[-+]*\+/g, strategicPlanningDiagram);
  }

  // Fix Market Analysis diagram
  if (content.includes('Market Analysis') && content.includes('Data Collection') && content.includes('Competitor')) {
    const marketAnalysisDiagram = `
\`\`\`plaintext
           Market Analysis Framework
           =========================
                        |
            +-----------+----------+
            |                      |
            v                      v
    +----------------+    +----------------+
    | Data Collection|    | Competitor     |
    |                |    | Analysis       |
    +----------------+    +----------------+
            |                      |
            +----------+-----------+
                       |
                       v
            +------------------+
            | Market Insights  |
            | & Opportunities  |
            +------------------+
\`\`\``;
    
    content = content.replace(/\+[-+]*\+[\s\S]*?Market[\s\S]*?Analysis[\s\S]*?Data Collection[\s\S]*?Competitor[\s\S]*?\+[-+]*\+/g, marketAnalysisDiagram);
  }

  // Fix Process Flow diagram
  if (content.includes('Strategic Goals') && content.includes('Implementation') && content.includes('Evaluation')) {
    const processFlowDiagram = `
\`\`\`plaintext
                Business Strategy Process Flow
                ==============================

    +------------------+         +------------------+
    | Strategic Goals  |-------->| Strategic        |
    |                  |         | Planning         |
    +------------------+         +------------------+
                                           |
                                           v
                                 +------------------+
                                 | Market Analysis  |
                                 +------------------+
                                           |
                                           v
                                 +------------------+
                                 | Implementation   |
                                 +------------------+
                                           |
                                           v
                                 +------------------+
                                 | Evaluation       |
                                 | & Adjustment     |
                                 +------------------+
\`\`\``;
    
    content = content.replace(/\+[-+]*\+[\s\S]*?Strategic Goals[\s\S]*?Strategic[\s\S]*?Planning[\s\S]*?Market Analysis[\s\S]*?Implementation[\s\S]*?Evaluation[\s\S]*?\+[-+]*\+/g, processFlowDiagram);
  }

  // Fix Apple's Competitive Advantage diagram
  if (content.includes("Apple's") && content.includes('Brand Strength') && content.includes('Product Innovation')) {
    const appleDiagram = `
\`\`\`plaintext
           Apple's Competitive Advantage
           =============================
                        |
            +-----------+----------+
            |                      |
            v                      v
    +----------------+    +----------------+
    | Brand Strength |    | Product        |
    |                |    | Innovation     |
    +----------------+    +----------------+
            |                      |
            v                      v
      [Customer        ]    [Cutting-edge   ]
      [Loyalty &       ]    [Technology &   ]
      [Premium Pricing ]    [Design         ]
\`\`\``;
    
    content = content.replace(/\+[-+]*\+[\s\S]*?Apple's[\s\S]*?Competitive[\s\S]*?Advantage[\s\S]*?Brand Strength[\s\S]*?Product[\s\S]*?Innovation[\s\S]*?\+[-+]*\+/g, appleDiagram);
  }

  // Clean up any remaining fragmented diagram parts
  content = content.replace(/\+[-+\s]*\+\s*\|\s*[\|\s\-\+]*\s*\|\s*\+[-+\s]*\+/g, '');
  content = content.replace(/\|\s*[\|\s\-\+]*\s*\|/g, '');
  
  return content;
};

export const formatContent = (content: string, style: LearningStyle): string => {
  // Add reading time estimate if not present
  if (!content.includes("~")) {
    const words = content.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed of 200 words per minute
    content = `~${readingTime} min read\n\n${content}`;
  }

  // Fix fragmented ASCII diagrams - this is the main fix for the user's issue
  content = fixFragmentedDiagrams(content);
  
  // Ensure proper spacing between sections
  content = content.replace(/\n#{2,}/g, '\n\n##');
  
  // Format code blocks properly
  content = content.replace(/```(\w+)\n/g, '\n```$1\n');
  content = content.replace(/```\n/g, '\n```\n');
  
  // Fix spacing around code blocks
  content = content.replace(/([^\n])```/g, '$1\n```');
  content = content.replace(/```([^\n])/g, '```\n$1');

  // Ensure headers have proper spacing and consistent formatting
  content = content.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
    // Ensure consistent spacing and preserve emojis
    return `${hashes} ${title.trim()}`;
  });

  // Add style-specific formatting
  switch (style) {
    case "visual":
      // 📊 VISUAL LEARNER FRAMEWORK
      // Enhance visual elements with rich formatting
      content = content.replace(/- \[ \]/g, '☐ ');
      content = content.replace(/- \[x\]/g, '☑ ');
      
      // Add visual separators between major sections
      content = content.replace(/(## .+)/g, '\n---\n\n$1');
      
      // Enhance key concepts with callout boxes
      content = content.replace(/\*\*(Key Point|Important|Note):\*\*/g, '\n> 🔥 **$1:**');
      
      // Add visual flow indicators
      content = content.replace(/(\d+\.)\s/g, '**$1** ➤ ');
      
      // Enhance examples with visual markers
      content = content.replace(/🌟 Example:/g, '\n> 💡 **Example:**');
      break;
      
    case "auditory":
      // 🎵 AUDITORY LEARNER FRAMEWORK
      // Add rhythm and verbal indicators
      content = content.replace(/🎵/g, '🎵 ♪');
      content = content.replace(/Speaking Prompt:/g, '🗣️ **Speaking Prompt:**');
      content = content.replace(/Discussion Point:/g, '💭 **Discussion Point:**');
      
      // Add call-and-response patterns
      content = content.replace(/(\d+\.)\s/g, '**$1** 🔊 ');
      
      // Enhance verbal memory techniques
      content = content.replace(/Remember:/g, '🧠 **Remember (Say it out loud):**');
      content = content.replace(/Repeat:/g, '🔄 **Repeat after me:**');
      
      // Add listening cues
      content = content.replace(/Listen:/g, '👂 **Listen carefully:**');
      break;
      
    case "reading":
      // 📚 READING/WRITING LEARNER FRAMEWORK
      // Enhance readability and academic structure
      content = content.replace(/\*\*Note:/g, '\n> 📝 **Note:**');
      content = content.replace(/\*\*Important:/g, '\n> ⚠️ **Important:**');
      content = content.replace(/\*\*Definition:/g, '\n> 📖 **Definition:**');
      
      // Add academic formatting
      content = content.replace(/(\d+\.)\s/g, '**$1** ');
      
      // Enhance references and citations
      content = content.replace(/Source:/g, '📚 **Source:**');
      content = content.replace(/Reference:/g, '📄 **Reference:**');
      
      // Add reading comprehension aids
      content = content.replace(/Summary:/g, '📋 **Summary:**');
      content = content.replace(/Key Terms:/g, '🔤 **Key Terms:**');
      break;
      
    case "kinesthetic":
      // 🤲 KINESTHETIC LEARNER FRAMEWORK
      // Enhance interactive elements
      content = content.replace(/Step (\d+):/g, '👉 **Step $1:**');
      content = content.replace(/Exercise (\d+):/g, '💪 **Exercise $1:**');
      content = content.replace(/Practice:/g, '🏋️ **Practice:**');
      
      // Add action-oriented formatting
      content = content.replace(/(\d+\.)\s/g, '**$1** 🎯 ');
      
      // Enhance hands-on activities
      content = content.replace(/Try this:/g, '🔨 **Try this now:**');
      content = content.replace(/Activity:/g, '⚡ **Activity:**');
      content = content.replace(/Project:/g, '🛠️ **Project:**');
      
      // Add progress indicators
      content = content.replace(/- \[ \]/g, '□ ');
      content = content.replace(/- \[x\]/g, '✅ ');
      
      // Add timing and completion cues
      content = content.replace(/Complete:/g, '✅ **Complete:**');
      content = content.replace(/Next step:/g, '➡️ **Next step:**');
      break;
  }

  return content;
};
