"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Loader2 } from "lucide-react";
import type { InfoCardType } from "@/types/info-card";

interface InfoCardProps {
  card: InfoCardType;
  onAction: (
    cardId: string,
    action: "more" | "skip" | "custom" | "deep",
    question?: string
  ) => void;
  isDeepResearchLoading?: boolean;
}

export default function InfoCard({
  card,
  onAction,
  isDeepResearchLoading,
}: InfoCardProps) {
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsSubmitting(true);
    await onAction(card.id, "custom", question);
    setIsSubmitting(false);
    setIsAskingQuestion(false);
    setQuestion("");
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

  return (
    <div
      className={`border-b border-gray-200 pb-3 ${
        card.isDeepResearch ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start space-x-3 pt-3">
        <div className={`h-2 w-2 rounded-full ${dotColor} mt-2`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-semibold text-sm">{card.topic}</span>
              {card.isDeepResearch && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  Deep Research
                </span>
              )}
            </div>
            <button className="text-gray-500">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <h3 className="font-semibold mt-1">{card.headline}</h3>

          {card.detail && (
            <p className="text-sm text-gray-700 mt-1 mb-2">{card.detail}</p>
          )}

          {card.parentCardId && card.followUpQuestion && (
            <div className="bg-gray-100 p-2 rounded-md text-sm text-gray-700 mb-2 italic">
              Re: {card.followUpQuestion}
            </div>
          )}

          <div className="flex items-center space-x-3 mt-3">
            <button
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => setIsAskingQuestion(!isAskingQuestion)}
              aria-label="Ask a question"
            >
              <span className="text-xs font-medium">X</span>
            </button>

            <button
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => onAction(card.id, "more")}
              aria-label="Tell me more"
            >
              <span className="text-xs font-medium">X</span>
            </button>

            <button
              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              onClick={() => onAction(card.id, "skip")}
              aria-label="Skip to next"
            >
              <span className="text-xs font-medium">X</span>
            </button>

            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-100 flex items-center space-x-1"
              onClick={() => onAction(card.id, "deep")}
              disabled={isDeepResearchLoading}
              aria-label="Go deeper"
            >
              {isDeepResearchLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Go deeper</span>
                  <span className="text-xs">→</span>
                </>
              )}
            </button>
          </div>

          {isAskingQuestion && (
            <div className="mt-2 flex">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 text-sm h-8"
              />
              <Button
                onClick={handleAskQuestion}
                disabled={isSubmitting || !question.trim()}
                size="sm"
                className="ml-2 h-8"
              >
                {isSubmitting ? "..." : "Ask"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
