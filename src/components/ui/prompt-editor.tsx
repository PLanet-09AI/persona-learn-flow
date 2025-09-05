import React, { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_PROMPT = `You are an AI learning assistant for the Persona Learning System.
Your goal is to help students understand their learning materials better.
When asked about the content, provide clear, concise explanations that are helpful and educational.
Reference specific parts of the content when answering questions.
Use examples to illustrate concepts when appropriate.
If you don't know the answer or if it's not related to the content, be honest about it.`;

const PROMPT_TEMPLATES = {
  educational: DEFAULT_PROMPT,
  socratic: `You are a Socratic tutor who helps students understand by asking guiding questions.
When a student asks about a concept, respond primarily with thoughtful questions that lead them toward discovering the answer themselves.
Only provide direct explanations after guiding them to think through the problem.
Reference specific parts of the learning material in your questions.
Your goal is to develop critical thinking skills, not just deliver information.`,
  simple: `You are a learning assistant who explains concepts in the simplest possible terms.
Use plain language, avoid jargon, and explain as if talking to someone with no background in the subject.
Use everyday analogies and examples to make concepts more relatable.
Break down complex ideas into small, easy-to-understand parts.
Always check if your explanation was clear enough.`,
  technical: `You are a technical expert providing in-depth explanations on the subject matter.
Include technical details, precise terminology, and underlying principles in your answers.
Refer to advanced concepts when relevant and explain how things work under the hood.
Support explanations with technical reasoning and evidence from the learning material.
Answer in a structured, systematic way that demonstrates expert knowledge.`
};

interface PromptEditorProps {
  systemPrompt: string;
  onChange: (newPrompt: string) => void;
}

export const PromptEditor = ({ systemPrompt, onChange }: PromptEditorProps) => {
  const [open, setOpen] = useState(false);
  const [promptText, setPromptText] = useState(systemPrompt || DEFAULT_PROMPT);
  const [template, setTemplate] = useState<string>("custom");

  const handleTemplateChange = (value: string) => {
    setTemplate(value);
    if (value !== "custom") {
      setPromptText(PROMPT_TEMPLATES[value as keyof typeof PROMPT_TEMPLATES]);
    }
  };

  const handleSave = () => {
    onChange(promptText);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Customize AI</span>
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Customize AI Behavior</DialogTitle>
          <DialogDescription>
            Customize how the AI responds to your questions about the learning content.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or create your own" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational">Educational Assistant</SelectItem>
                <SelectItem value="socratic">Socratic Tutor</SelectItem>
                <SelectItem value="simple">Simple Explainer</SelectItem>
                <SelectItem value="technical">Technical Expert</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            className="min-h-[200px]"
            value={promptText}
            onChange={(e) => {
              setPromptText(e.target.value);
              if (template !== "custom") {
                setTemplate("custom");
              }
            }}
            placeholder="Enter system instructions for the AI..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
