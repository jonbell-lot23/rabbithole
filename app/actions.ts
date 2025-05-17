"use server";

import type { InfoCardType } from "@/types/info-card";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

interface CardParams {
  parentCardId?: string;
  userFeedback?: "more" | "skip" | "custom";
  followUpQuestion?: string;
  page?: number;
  isInitialLoad?: boolean;
}

// Enhanced mock data with more detailed content
const MOCK_DATA: Record<string, InfoCardType[]> = {
  china: [
    {
      id: "1",
      topic: "china",
      headline: "China is home to the world's largest high-speed rail network",
      detail:
        "With over 37,000 kilometers of high-speed rail lines, China's network is larger than all other countries' high-speed rail networks combined. The fastest trains can reach speeds of 350 km/h (217 mph).",
    },
    {
      id: "2",
      topic: "china",
      headline:
        "The Great Wall of China is not visible from space with the naked eye",
      detail:
        "Contrary to popular belief, the Great Wall is not visible from space without aid. This myth has been debunked by multiple astronauts, including Chinese astronaut Yang Liwei.",
    },
    {
      id: "3",
      topic: "china",
      headline: "China produces more than 1.4 billion tons of rice annually",
      detail:
        "Rice is a staple food for over 65% of the Chinese population. China accounts for nearly 30% of the world's total rice production, making it the largest rice producer globally.",
    },
    {
      id: "4",
      topic: "china",
      headline: "China has 56 recognized ethnic groups",
      detail:
        "While the Han Chinese make up about 92% of the population, China officially recognizes 55 other ethnic minorities, each with their own distinct cultures, languages, and traditions.",
    },
    {
      id: "5",
      topic: "china",
      headline:
        "The world's first paper money was created in China during the Tang Dynasty",
      detail:
        "Around the 7th century, merchants began using paper notes instead of heavy coins. By the Song Dynasty (960-1279), the government had taken over the system and was issuing official paper currency.",
    },
  ],
  space: [
    {
      id: "space-1",
      topic: "space",
      headline: "Space is completely silent",
      detail:
        "There is no atmosphere in space, which means that sound has no medium or way to travel to be heard. Astronauts use radios to communicate in space because radio waves can travel through the vacuum.",
    },
    {
      id: "space-2",
      topic: "space",
      headline: "The hottest planet in our solar system is Venus",
      detail:
        "Despite being farther from the Sun than Mercury, Venus has an average surface temperature of 462°C (864°F). This is due to its thick atmosphere of carbon dioxide that traps heat in a runaway greenhouse effect.",
    },
    {
      id: "space-3",
      topic: "space",
      headline: "One day on Venus is longer than one year on Earth",
      detail:
        "Venus rotates very slowly on its axis, taking 243 Earth days to complete one rotation. However, it only takes 225 Earth days to orbit the Sun, making a day longer than a year on Venus.",
    },
    {
      id: "space-4",
      topic: "space",
      headline: "The largest volcano in our solar system is on Mars",
      detail:
        "Olympus Mons on Mars is the largest volcano in our solar system, standing at 22 km (13.6 miles) high and 600 km (372 miles) in diameter. It's roughly the size of Arizona.",
    },
  ],
  history: [
    {
      id: "history-1",
      topic: "history",
      headline:
        "Cleopatra lived closer in time to the first Pizza Hut than to the building of the Great Pyramid",
      detail:
        "Cleopatra lived around 30 BCE, while the Great Pyramid of Giza was completed around 2560 BCE. The first Pizza Hut opened in 1958, about 1,988 years after Cleopatra's death.",
    },
    {
      id: "history-2",
      topic: "history",
      headline: "Oxford University is older than the Aztec Empire",
      detail:
        "Oxford University was founded around 1096, while the Aztec civilization began with the founding of Tenochtitlán in 1325, more than 200 years later.",
    },
    {
      id: "history-3",
      topic: "history",
      headline: "The fax machine was invented before the American Civil War",
      detail:
        "The first fax machine, or 'electric printing telegraph,' was patented by Alexander Bain in 1843, nearly two decades before the American Civil War began in 1861.",
    },
  ],
  default: [
    {
      id: "default-1",
      topic: "general",
      headline: "The Earth is the third planet from the Sun",
      detail:
        "It is the only astronomical object known to harbor life, with liquid water covering 71% of its surface. Earth orbits the Sun at an average distance of about 93 million miles.",
    },
    {
      id: "default-2",
      topic: "general",
      headline: "There are approximately 7,100 languages spoken worldwide",
      detail:
        "However, about 40% of these languages are at risk of extinction with fewer than 1,000 speakers remaining. The most widely spoken languages are Mandarin Chinese, Spanish, and English.",
    },
  ],
};

// Helper function to generate mock data for any topic
function generateMockData(
  topic: string,
  params: CardParams = {}
): InfoCardType[] {
  const id = uuidv4();
  const topics = {
    technology: [
      {
        headline: "The first computer programmer was a woman",
        detail:
          "Ada Lovelace, an English mathematician and writer, is considered the first computer programmer. In the 1840s, she wrote an algorithm for Charles Babbage's Analytical Engine, a proposed mechanical general-purpose computer.",
      },
      {
        headline: "The first computer bug was an actual insect",
        detail:
          "In 1947, Grace Hopper found a moth trapped in a relay of the Harvard Mark II computer. When she removed it, she remarked they were 'debugging' the system, popularizing the term we still use today.",
      },
    ],
    nature: [
      {
        headline: "Octopuses have three hearts",
        detail:
          "Two hearts pump blood through the gills, while the third pumps it through the rest of the body. Their blood is also blue because it contains a copper-based protein called hemocyanin.",
      },
      {
        headline: "Bananas are berries, but strawberries aren't",
        detail:
          "Botanically speaking, bananas are berries because they develop from a single flower with one ovary. Strawberries are actually 'aggregate accessory fruits' because they develop from multiple ovaries of a single flower.",
      },
    ],
    science: [
      {
        headline: "Humans share 50% of their DNA with bananas",
        detail:
          "This surprising fact demonstrates our common evolutionary ancestry with all living things. The shared DNA primarily consists of genes needed for basic cellular functions.",
      },
      {
        headline:
          "A teaspoonful of neutron star would weigh about 6 billion tons",
        detail:
          "Neutron stars are so dense that a single teaspoon of their material would weigh as much as a mountain on Earth. They're formed when massive stars collapse under their own gravity.",
      },
    ],
  };

  // Generate random content based on topic or use predefined content
  let content;
  if (topic.toLowerCase() in topics) {
    const topicContent = topics[topic.toLowerCase() as keyof typeof topics];
    content = topicContent[Math.floor(Math.random() * topicContent.length)];
  } else {
    // Generic content for any topic
    const randomFacts = [
      {
        headline: `Interesting fact about ${topic}`,
        detail: `${topic} has many fascinating aspects worth exploring. This is just one of many interesting facts you could learn about this subject.`,
      },
      {
        headline: `Did you know about ${topic}?`,
        detail: `There are many surprising things to discover about ${topic}. This is a generated placeholder since we're using mock data.`,
      },
    ];
    content = randomFacts[Math.floor(Math.random() * randomFacts.length)];
  }

  if (params.userFeedback === "more") {
    return [
      {
        id,
        topic,
        headline: `More about ${content.headline}`,
        detail: `Building on what we've learned, ${content.detail}`,
        parentCardId: params.parentCardId,
        userFeedback: params.userFeedback,
      },
    ];
  }

  if (params.userFeedback === "custom" && params.followUpQuestion) {
    return [
      {
        id,
        topic,
        headline: `About ${topic}: ${params.followUpQuestion.substring(0, 40)}${
          params.followUpQuestion.length > 40 ? "..." : ""
        }`,
        detail: `In response to your question, ${content.detail}`,
        parentCardId: params.parentCardId,
        userFeedback: params.userFeedback,
        followUpQuestion: params.followUpQuestion,
      },
    ];
  }

  // For skip or initial request
  return [
    {
      id,
      topic,
      headline: content.headline,
      detail: content.detail,
    },
  ];
}

// Optional search function that can be enabled later
async function trySearchWeb(query: string): Promise<string | null> {
  try {
    // Check for available search APIs
    if (process.env.SERP_API_KEY) {
      const response = await fetch(
        `https://serpapi.com/search.json?q=${encodeURIComponent(
          query
        )}&api_key=${process.env.SERP_API_KEY}`
      );
      const data = await response.json();
      const results = data.organic_results?.slice(0, 3) || [];
      return results
        .map((result: any) => `${result.title}: ${result.snippet}`)
        .join("\n\n");
    }

    if (process.env.TAVILY_API_KEY) {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          query: `facts about ${query}`,
          search_depth: "advanced",
          include_domains: [
            "wikipedia.org",
            "britannica.com",
            "nationalgeographic.com",
          ],
        }),
      });
      const data = await response.json();
      return data.results
        .map(
          (result: any) =>
            `${result.title}: ${result.content.substring(0, 200)}...`
        )
        .join("\n\n");
    }

    if (process.env.PERPLEXITY_API_KEY) {
      const response = await fetch("https://api.perplexity.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          query: `Provide factual information about ${query}`,
          max_tokens: 300,
        }),
      });
      const data = await response.json();
      return data.text;
    }

    // No search APIs available
    return null;
  } catch (error) {
    console.error("Search API error:", error);
    return null;
  }
}

// Initialize Perplexity client
const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

// Store seen facts in memory (will be cleared on server restart, but that's okay)
const seenFacts = new Set<string>();

function isDuplicateFact(fact: string): boolean {
  // Normalize the fact by removing extra whitespace, converting to lowercase,
  // and removing common variations
  const normalizedFact = fact
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?]/g, "")
    .replace(/^the\s+/i, "")
    .replace(/^a\s+/i, "")
    .replace(/^an\s+/i, "");
  return seenFacts.has(normalizedFact);
}

function addSeenFact(fact: string) {
  const normalizedFact = fact
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?]/g, "")
    .replace(/^the\s+/i, "")
    .replace(/^a\s+/i, "")
    .replace(/^an\s+/i, "");
  seenFacts.add(normalizedFact);
}

export async function getCards(
  topic: string,
  page: number = 1,
  parentCardId?: string,
  followUpQuestion?: string,
  isDeepResearch: boolean = false
): Promise<InfoCardType[]> {
  console.log(
    "Perplexity API key status:",
    process.env.PERPLEXITY_API_KEY ? "Available" : "Missing"
  );

  let prompt = "";
  if (parentCardId && followUpQuestion) {
    prompt = `Based on the topic "${topic}", answer this follow-up question: "${followUpQuestion}". Provide a detailed, factual response.`;
  } else if (isDeepResearch) {
    prompt = `Perform a deep research analysis on "${topic}". Include:
    1. Comprehensive historical context
    2. Current state and developments
    3. Expert opinions and research findings
    4. Controversies or debates in the field
    5. Future implications and trends
    
    Format the response as a detailed, well-structured analysis with multiple sections.`;
  } else if (page === 1) {
    prompt = `Provide a comprehensive overview of "${topic}". Include key facts, historical context, and important details.`;
  } else {
    prompt = `Provide additional interesting facts about "${topic}" that haven't been mentioned before. Focus on lesser-known aspects and recent developments.`;
  }

  try {
    const response = await client.chat.completions.create({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that provides factual, well-researched information. 
          ${
            isDeepResearch
              ? "Format your response as a detailed analysis with multiple sections, each with a 'headline' and 'detail' field. Focus on depth and comprehensive coverage."
              : "Format your response as a JSON array of objects with 'headline' and 'detail' fields. Each object should represent a distinct fact or piece of information."
          }
          Make sure each fact is unique and not a variation of previously mentioned facts.
          Focus on providing new, interesting information that hasn't been covered before.
          IMPORTANT: Only return valid JSON, no additional text or explanations.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: isDeepResearch ? 0.3 : 0.7,
      max_tokens: isDeepResearch ? 2000 : 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response");
    }

    // Parse the response and filter out duplicates
    let facts;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedContent = content
        .trim()
        .replace(/^```json\n?/, "")
        .replace(/\n?```$/, "");
      facts = JSON.parse(cleanedContent);
      // Ensure we have an array
      if (!Array.isArray(facts)) {
        facts = [facts];
      }
    } catch (error) {
      console.error("Failed to parse response as JSON:", error);
      console.log("Raw response:", content);
      // Fallback to a simple extraction if JSON parsing fails
      const lines = content.split("\n").filter((line) => line.trim());
      facts = lines.map((line) => ({
        headline: line.split(":")[0]?.trim() || "Interesting fact",
        detail: line.split(":")[1]?.trim() || line.trim(),
      }));
    }

    // Filter out duplicates and add new facts to seen facts
    const uniqueFacts = facts.filter((fact: any) => {
      const factText = `${fact.headline} ${fact.detail}`;
      if (isDuplicateFact(factText)) {
        return false;
      }
      addSeenFact(factText);
      return true;
    });

    // If all facts were duplicates, try one more time with a different prompt
    if (uniqueFacts.length === 0) {
      const retryResponse = await client.chat.completions.create({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "Provide completely different facts about the topic, focusing on new aspects that haven't been covered. Return only valid JSON.",
          },
          {
            role: "user",
            content: `Give me different facts about "${topic}" that haven't been mentioned before.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const retryContent = retryResponse.choices[0]?.message?.content;
      if (retryContent) {
        try {
          const cleanedContent = retryContent
            .trim()
            .replace(/^```json\n?/, "")
            .replace(/\n?```$/, "");
          const retryFacts = JSON.parse(cleanedContent);
          const finalFacts = Array.isArray(retryFacts)
            ? retryFacts
            : [retryFacts];
          return finalFacts.map((fact: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            topic,
            headline: fact.headline,
            detail: fact.detail,
            parentCardId,
            followUpQuestion,
            isDeepResearch,
          }));
        } catch (error) {
          console.error("Failed to parse retry response:", error);
          console.log("Raw retry response:", retryContent);
        }
      }
    }

    return uniqueFacts.map((fact: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      topic,
      headline: fact.headline,
      detail: fact.detail,
      parentCardId,
      followUpQuestion,
      isDeepResearch,
    }));
  } catch (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
}
