import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Target, RefreshCw, Play } from "lucide-react";
import { UserProfile } from "./LearningDashboard";

interface ContentViewerProps {
  userProfile: UserProfile;
  content: string;
  onStartQuiz: () => void;
  onContentGenerated: (content: string) => void;
}

export const ContentViewer = ({ userProfile, content, onStartQuiz, onContentGenerated }: ContentViewerProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");

  // Mock content generation based on learning style
  const generateContent = async (topic?: string) => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const targetTopic = topic || getRandomTopic();
    setCurrentTopic(targetTopic);
    
    let generatedContent = "";
    
    switch (userProfile.learningStyle) {
      case "visual":
        generatedContent = generateVisualContent(targetTopic);
        break;
      case "auditory":
        generatedContent = generateAuditoryContent(targetTopic);
        break;
      case "reading":
        generatedContent = generateReadingContent(targetTopic);
        break;
      case "kinesthetic":
        generatedContent = generateKinestheticContent(targetTopic);
        break;
    }
    
    onContentGenerated(generatedContent);
    setIsGenerating(false);
  };

  const getRandomTopic = () => {
    const topics = {
      "Web Development": ["HTML Basics", "CSS Flexbox", "JavaScript Functions", "React Components"],
      "Digital Marketing": ["SEO Fundamentals", "Social Media Strategy", "Email Marketing", "Content Creation"],
      "Data Science": ["Statistics Basics", "Data Visualization", "Machine Learning Intro", "Python Pandas"],
      "Graphic Design": ["Color Theory", "Typography", "Layout Principles", "Design Software"],
      "Business Strategy": ["SWOT Analysis", "Market Research", "Competitive Analysis", "Business Models"]
    };
    
    const fieldTopics = topics[userProfile.field as keyof typeof topics] || ["Introduction", "Key Concepts", "Best Practices", "Advanced Techniques"];
    return fieldTopics[Math.floor(Math.random() * fieldTopics.length)];
  };

  const generateVisualContent = (topic: string) => {
    return `# ${topic} in ${userProfile.field}

## Visual Overview 🎨

Imagine ${topic.toLowerCase()} as a **visual landscape**:

🔷 **Foundation Layer**: Think of this like the ground floor of a building - solid and essential
├── Core concepts form the base structure
├── Supporting elements add stability
└── Advanced features build upward

🔸 **Key Components** (Picture a flowchart):
• **Input** → **Process** → **Output**
• Like a factory assembly line, each step transforms the previous one
• Visual cue: Color-code each stage (Blue → Green → Gold)

## Mind Map Structure 🧠
\`\`\`
        ${topic}
         /  |  \\
    Basic   Core   Advanced
     /       |       \\
  Step1   Key Idea  Expert
  Step2   Method    Tricks
  Step3   Tools     Tips
\`\`\`

**Visual Analogy**: Think of ${topic.toLowerCase()} like a tree - roots (basics), trunk (core concepts), branches (applications), and leaves (specific techniques).

## Next Steps 👀
Ready to test your visual understanding? The quiz will include diagram-based questions!`;
  };

  const generateAuditoryContent = (topic: string) => {
    return `# ${topic} in ${userProfile.field}

## Listen Up! 🎧

**Say this out loud**: "${topic} is the key to mastering ${userProfile.field}"

### The Rhythm of Learning 🎵
Think of ${topic.toLowerCase()} like a song with three verses:

**Verse 1** - The Setup (Hum a low note)
- Foundation concepts (repeat 3 times)
- Core principles (say slowly)
- Basic terminology (emphasize each syllable)

**Verse 2** - The Development (Medium pitch)
- Advanced techniques (speak with confidence) 
- Practical applications (use examples)
- Common patterns (create a rhythm)

**Verse 3** - The Mastery (High, confident tone)
- Expert strategies (speak clearly)
- Problem-solving approaches (pause between points)
- Real-world implementation (tell a story)

### Memory Palace 🏰
**Repeat after me**: "I understand ${topic} because..."
1. **First**, I remember the main concept
2. **Then**, I connect it to what I know
3. **Finally**, I can teach it to others

### Discussion Points 💬
If you were explaining ${topic} to a friend, what would you say first?

**Ready to quiz yourself?** The questions will test what you can recall and explain verbally!`;
  };

  const generateReadingContent = (topic: string) => {
    return `# Comprehensive Guide: ${topic} in ${userProfile.field}

## Table of Contents
1. Introduction and Objectives
2. Core Concepts and Definitions  
3. Detailed Methodology
4. Practical Applications
5. Best Practices and Guidelines
6. Summary and Key Takeaways

---

## 1. Introduction and Objectives

**Definition**: ${topic} represents a fundamental aspect of ${userProfile.field} that encompasses multiple interconnected concepts and practical applications.

**Learning Objectives**:
- Understand the theoretical foundation of ${topic}
- Identify key components and their relationships
- Apply concepts to real-world scenarios
- Develop practical skills and expertise

## 2. Core Concepts and Definitions

**Primary Concept**: The foundation of ${topic} rests on three pillars:

- **Pillar A**: Theoretical Framework
  - Underlying principles and theories
  - Historical development and evolution
  - Current industry standards and practices

- **Pillar B**: Practical Implementation  
  - Step-by-step methodologies
  - Tools and technologies involved
  - Measurement and evaluation criteria

- **Pillar C**: Strategic Applications
  - Business impact and value creation
  - Integration with existing systems
  - Future trends and developments

## 3. Detailed Methodology

**Step-by-Step Process**:

1. **Assessment Phase**
   - Analyze current situation
   - Identify requirements and constraints
   - Define success criteria

2. **Planning Phase**
   - Develop comprehensive strategy
   - Allocate resources effectively
   - Create timeline and milestones

3. **Implementation Phase**
   - Execute planned activities
   - Monitor progress continuously
   - Adjust approach as needed

4. **Evaluation Phase**
   - Measure results against objectives
   - Document lessons learned
   - Plan for continuous improvement

## 4. Key Terminology

- **Term 1**: Specific definition and context
- **Term 2**: Usage examples and applications  
- **Term 3**: Relationship to other concepts

## 5. Summary and Key Takeaways

**Essential Points to Remember**:
• ${topic} is crucial for success in ${userProfile.field}
• Implementation requires systematic approach
• Continuous learning and adaptation is necessary
• Practical application reinforces theoretical knowledge

**Next Steps**: Test your comprehensive understanding with our detailed quiz!`;
  };

  const generateKinestheticContent = (topic: string) => {
    return `# Hands-On Guide: ${topic} in ${userProfile.field}

## Let's Get Started! 

**Action Item #1**: Stand up and walk around while reading this!

### Interactive Learning Experience

**Try This Now** (Do each step):

**Step 1** - Physical Warm-up
- Stretch your hands - you'll be working with ${topic}
- Look around your space - find 3 objects that relate to ${userProfile.field}
- Say out loud: "I'm about to master ${topic}!"

**Step 2** - Hands-On Practice
- BUILD: Create a simple example
- WRITE: Take notes with your own words  
- DRAW: Sketch the main concept
- TEACH: Explain it to an imaginary student

### Real-World Simulation

**Scenario**: You're working on a real ${userProfile.field} project...

**Your Mission** (Act this out):
1. **Problem**: You encounter a challenge with ${topic}
2. **Action**: Apply what you're learning step-by-step
3. **Result**: Measure your success

**Interactive Checklist**
- [ ] I can demonstrate the main concept
- [ ] I can solve a practice problem  
- [ ] I can teach this to someone else
- [ ] I can apply this in a real situation

### Practice Exercises

**Exercise 1**: Mini-Project (15 minutes)
Create something small using ${topic} principles

**Exercise 2**: Teaching Moment (5 minutes)  
Explain ${topic} to a friend, pet, or mirror

**Exercise 3**: Problem-Solving (10 minutes)
Find a real problem and apply your new knowledge

### Hands-On Assessment Ready?
The quiz will include practical scenarios where you apply ${topic}!

**Physical Prep**: Stretch your fingers - time to show what you can do!`;
  };

  useEffect(() => {
    if (!content) {
      generateContent();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Learning Content
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{userProfile.field}</Badge>
            <Badge variant="secondary">
              {userProfile.learningStyle.charAt(0).toUpperCase() + userProfile.learningStyle.slice(1)} Style
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => generateContent()}
          disabled={isGenerating}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          New Topic
        </Button>
      </div>

      {/* Content Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {currentTopic || "Loading Topic..."}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              ~10 min read
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="text-center py-12">
              <div className="animate-spin mx-auto mb-4 h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-muted-foreground">Generating personalized content for {userProfile.learningStyle} learners...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {content}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {content && !isGenerating && (
        <div className="flex gap-4 justify-center">
          <Button onClick={() => generateContent()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New Content
          </Button>
          <Button onClick={onStartQuiz} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Take Quiz
          </Button>
        </div>
      )}
    </div>
  );
};