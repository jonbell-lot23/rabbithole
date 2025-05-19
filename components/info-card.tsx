"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Loader2 } from "lucide-react";
import type { InfoCardType } from "@/types/info-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface InfoCardProps {
  card: InfoCardType;
  onAction: (
    cardId: string,
    action: "more" | "skip" | "custom" | "deep",
    question?: string
  ) => void;
  isDeepResearchLoading: boolean;
}

export default function InfoCard({
  card,
  onAction,
  isDeepResearchLoading,
}: InfoCardProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestion.trim()) {
      onAction(card.id, "custom", customQuestion);
      setShowCustomInput(false);
      setCustomQuestion("");
    }
  };

  // Generate a random color for the dot
  const dotColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-red-500",
  ];
  const dotColor = dotColors[Math.floor(Math.random() * dotColors.length)];

  // Format deep research content with proper markdown styling
  const formatDeepResearchContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold mt-6 mb-4">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-semibold mt-5 mb-3">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-lg font-medium mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 mb-1">
            {line.slice(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <br key={index} />;
      }
      return (
        <p key={index} className="mb-3">
          {line}
        </p>
      );
    });
  };

  return (
    <Card className="relative">
      {isDeepResearchLoading && card.isDeepResearch && (
        <div className="absolute top-2 right-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${dotColor} mt-2`} />
          <h3 className="text-sm font-medium">{card.headline}</h3>
        </div>
        {card.isDeepResearch && (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            Deep Research
          </span>
        )}
      </CardHeader>
      <CardContent>
        {card.isDeepResearch ? (
          <div className="prose prose-sm max-w-none">
            {formatDeepResearchContent(card.detail)}
          </div>
        ) : (
          <p className="text-sm text-gray-600">{card.detail}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction(card.id, "more")}
            disabled={isDeepResearchLoading}
          >
            More like this
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction(card.id, "skip")}
            disabled={isDeepResearchLoading}
          >
            Skip
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(!showCustomInput)}
            disabled={isDeepResearchLoading}
          >
            Ask a question
          </Button>
          {!card.isDeepResearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(card.id, "deep")}
              disabled={isDeepResearchLoading}
            >
              Go deeper
            </Button>
          )}
        </div>
        {showCustomInput && (
          <form onSubmit={handleCustomSubmit} className="mt-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a follow-up question..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Ask
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
