import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Headphones, BookOpen, Activity } from "lucide-react";
import { LearningStyle } from "./LearningDashboard";

const learningStyles = [
  {
    id: "visual" as LearningStyle,
    name: "Visual Learner",
    icon: Eye,
    description: "Learn best through images, diagrams, and visual representations",
    characteristics: ["Charts & graphs", "Colorful notes", "Mind maps", "Visual analogies"],
    color: "border-blue-200 hover:border-blue-400"
  },
  {
    id: "auditory" as LearningStyle,
    name: "Auditory Learner", 
    icon: Headphones,
    description: "Learn best through listening and verbal explanations",
    characteristics: ["Discussions", "Audio content", "Mnemonics", "Verbal repetition"],
    color: "border-green-200 hover:border-green-400"
  },
  {
    id: "reading" as LearningStyle,
    name: "Reading/Writing Learner",
    icon: BookOpen,
    description: "Learn best through reading text and taking notes",
    characteristics: ["Detailed text", "Lists & outlines", "Written summaries", "Note-taking"],
    color: "border-purple-200 hover:border-purple-400"
  },
  {
    id: "kinesthetic" as LearningStyle,
    name: "Kinesthetic Learner",
    icon: Activity,
    description: "Learn best through hands-on activities and practice",
    characteristics: ["Interactive examples", "Step-by-step guides", "Real-world applications", "Practice exercises"],
    color: "border-orange-200 hover:border-orange-400"
  }
];

interface LearningStyleSelectionProps {
  selectedField: string;
  onStyleSelect: (style: LearningStyle) => void;
}

export const LearningStyleSelection = ({ selectedField, onStyleSelect }: LearningStyleSelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Learning Style</h2>
        <p className="text-muted-foreground">
          How would you like to learn about <Badge variant="outline">{selectedField}</Badge>?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {learningStyles.map((style) => {
          const IconComponent = style.icon;
          return (
            <Card 
              key={style.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${style.color}`}
              onClick={() => onStyleSelect(style.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  {style.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{style.description}</p>
                
                <div>
                  <p className="font-medium text-sm mb-2">Perfect for learners who prefer:</p>
                  <div className="space-y-1">
                    {style.characteristics.map((char, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-sm text-muted-foreground">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  Select This Style
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> You can always change your learning style later to see different content formats
        </p>
      </div>
    </div>
  );
};