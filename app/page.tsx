"use client";

import { useState, useRef, useCallback } from "react";
import { getCards } from "./actions";
import InfoCard from "@/components/info-card";
import type { InfoCardType } from "@/types/info-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function Home() {
  const [cards, setCards] = useState<InfoCardType[]>([]);
  const [deepCards, setDeepCards] = useState<InfoCardType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepResearchLoading, setIsDeepResearchLoading] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("stream");
  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (topic: string) => {
    setIsLoading(true);
    setCurrentTopic(topic);
    setPage(1);
    const newCards = await getCards(topic, 1);
    setCards(newCards);
    setIsLoading(false);
  };

  const handleAction = async (
    cardId: string,
    action: "more" | "skip" | "custom" | "deep",
    question?: string
  ) => {
    if (action === "deep") {
      setIsDeepResearchLoading(true);
      const newCards = await getCards(
        currentTopic,
        page,
        cardId,
        undefined,
        true
      );
      setDeepCards((prevCards) => [...prevCards, ...newCards]);
      setIsDeepResearchLoading(false);
      setActiveTab("deeper");
      return;
    }

    if (action === "custom" && question) {
      const newCards = await getCards(currentTopic, page, cardId, question);
      setCards((prevCards) => [...prevCards, ...newCards]);
    } else if (action === "more") {
      const newCards = await getCards(currentTopic, page, cardId);
      setCards((prevCards) => [...prevCards, ...newCards]);
    } else if (action === "skip") {
      const newCards = await getCards(currentTopic, page + 1);
      setPage((prev) => prev + 1);
      setCards((prevCards) => [...prevCards, ...newCards]);
    }
  };

  const lastCardRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
          getCards(currentTopic, page + 1).then((newCards) => {
            setCards((prevCards) => [...prevCards, ...newCards]);
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, currentTopic, page]
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <input
            type="text"
            placeholder="Enter a topic..."
            className="w-full p-2 border rounded"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e.currentTarget.value);
              }
            }}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stream">Stream</TabsTrigger>
            <TabsTrigger value="deeper" className="flex items-center gap-2">
              Deeper
              {isDeepResearchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : deepCards.length > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stream">
            {isLoading ? (
              <div className="text-center">Loading initial content...</div>
            ) : (
              <div className="space-y-4">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    ref={index === cards.length - 1 ? lastCardRef : undefined}
                  >
                    <InfoCard
                      card={card}
                      onAction={handleAction}
                      isDeepResearchLoading={isDeepResearchLoading}
                    />
                  </div>
                ))}
                <div ref={loadingRef} className="h-4" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="deeper">
            <div className="space-y-4">
              {deepCards.map((card) => (
                <div key={card.id}>
                  <InfoCard
                    card={card}
                    onAction={handleAction}
                    isDeepResearchLoading={isDeepResearchLoading}
                  />
                </div>
              ))}
              {deepCards.length === 0 && !isDeepResearchLoading && (
                <div className="text-center text-gray-500">
                  Click "Go deeper" on any card to start deep research
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
