import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Code, Palette, Calculator, Globe, Briefcase } from "lucide-react";

const popularFields = [
  { name: "Web Development", icon: Code, color: "bg-blue-100 text-blue-800" },
  { name: "Digital Marketing", icon: Globe, color: "bg-green-100 text-green-800" },
  { name: "Data Science", icon: Calculator, color: "bg-purple-100 text-purple-800" },
  { name: "Graphic Design", icon: Palette, color: "bg-pink-100 text-pink-800" },
  { name: "Business Strategy", icon: Briefcase, color: "bg-orange-100 text-orange-800" },
  { name: "Machine Learning", icon: BookOpen, color: "bg-indigo-100 text-indigo-800" },
];

interface FieldSelectionProps {
  onFieldSelect: (field: string) => void;
}

export const FieldSelection = ({ onFieldSelect }: FieldSelectionProps) => {
  const [customField, setCustomField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFields = popularFields.filter(field =>
    field.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomFieldSubmit = () => {
    if (customField.trim()) {
      onFieldSelect(customField.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Learning Field</h2>
        <p className="text-muted-foreground">Select a field you'd like to learn about, or enter your own</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Popular Fields */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Popular Fields</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFields.map((field) => {
            const IconComponent = field.icon;
            return (
              <Card 
                key={field.name}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                onClick={() => onFieldSelect(field.name)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{field.name}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Field Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enter Custom Field</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="e.g., Quantum Physics, Ancient History, Cooking..."
            value={customField}
            onChange={(e) => setCustomField(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomFieldSubmit()}
          />
          <Button 
            onClick={handleCustomFieldSubmit}
            disabled={!customField.trim()}
            className="w-full"
          >
            Start Learning {customField && `"${customField}"`}
          </Button>
        </CardContent>
      </Card>

      {/* Examples */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {["Photography", "Python Programming", "Spanish Language", "Blockchain", "Psychology"].map((example) => (
            <Badge 
              key={example}
              variant="secondary" 
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => onFieldSelect(example)}
            >
              {example}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};