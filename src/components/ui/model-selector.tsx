import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const modelOptions: ModelOption[] = [
  {
    id: "qwen/qwen3-14b:free",
    name: "Qwen3",
    description: "Default model with good balance between quality and speed."
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4",
    description: "Higher quality responses but might be slower and more expensive."
  },
  {
    id: "anthropic/claude-3-opus:beta",
    name: "Claude-3",
    description: "Excellent for nuanced explanations and creative content."
  },
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama-3",
    description: "Open source model with good performance for general queries."
  }
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const ModelSelector = ({ value, onChange }: ModelSelectorProps) => {
  const selectedModel = modelOptions.find(model => model.id === value) || modelOptions[0];
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent>
            <p>{selectedModel.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
