import { businessTerminology } from "./business-terminology";

export type TerminologyEntry = {
  term: string;
  category?: string;
  aliases?: string[];
  triggers?: string[];
  meaning: string;
  why: string;
  question: string;
  moreQuestions?: string[];
  source: "local" | "mock-fallback";
};

const technicalTerminology: TerminologyEntry[] = [
  {
    term: "API",
    meaning: "A defined way for two software systems to exchange information or ask each other to do something.",
    why: "They may be explaining how their product connects to systems the client already uses.",
    question: "So which system normally sends the data first?",
    source: "local",
  },
  {
    term: "ERP",
    meaning: "Software companies use to run major parts of the business, such as finance, operations, inventory and supply chains.",
    why: "Their product may need to exchange information with the company’s existing ERP system.",
    question: "So does your product sit alongside their ERP, or replace part of what they already use?",
    source: "local",
  },
  {
    term: "CVE",
    meaning: "A public reference number for a known software security vulnerability.",
    why: "They may be checking whether a system has a known security issue that needs to be fixed or managed.",
    question: "So does that usually hold up the project, or is it a quick fix?",
    source: "local",
  },
  {
    term: "RAG",
    aliases: ["retrieval-augmented generation", "retrieval augmented generation"],
    meaning: "A way for an AI system to look up relevant information before it answers, instead of relying only on what the model already knows.",
    why: "They may want AI answers grounded in the company’s own documents or data.",
    question: "So is it searching the company’s own information before it answers?",
    source: "local",
  },
  {
    term: "LLM",
    aliases: ["large language model"],
    meaning: "The type of AI model behind tools that can understand and generate natural language.",
    why: "They may be talking about the model powering a chatbot, assistant or document workflow.",
    question: "Are clients using their own model, or something off the shelf?",
    source: "local",
  },
  {
    term: "SaaS",
    aliases: ["software as a service"],
    meaning: "Software people access online, usually through a subscription, rather than installing and running it themselves.",
    why: "They may be describing how the product is delivered, paid for or maintained.",
    question: "So do clients just log in, or is there still a lot to set up?",
    source: "local",
  },
  {
    term: "CRM",
    aliases: ["customer relationship management"],
    meaning: "Software used to keep track of customers, contacts, sales conversations and follow-ups.",
    why: "They may be talking about where customer information lives or how a sales team works.",
    question: "Who actually keeps the CRM up to date?",
    source: "local",
  },
  {
    term: "SDK",
    aliases: ["software development kit"],
    meaning: "A collection of tools and examples that helps developers build with a product or platform.",
    why: "They may be explaining how other developers can extend or integrate their software.",
    question: "Does that make it easier for the client’s developers to build on top?",
    source: "local",
  },
  {
    term: "CLI",
    aliases: ["command-line interface", "command line interface"],
    meaning: "A way to control software by typing commands instead of clicking through a visual interface.",
    why: "Technical teams often use a CLI to set things up, automate work or diagnose problems quickly.",
    question: "Is that mainly for setup, or do people use it day to day?",
    source: "local",
  },
  {
    term: "Predictive maintenance",
    meaning: "Using equipment data to spot signs of a likely failure before it happens, so maintenance can be planned.",
    why: "They may be describing a practical use of data or AI that helps avoid downtime.",
    question: "Are clients actually acting on the predictions yet?",
    source: "local",
  },
  {
    term: "Enterprise software",
    meaning: "Software built for large organisations, where many teams, systems and rules need to work together.",
    why: "They may be explaining why a product takes longer to buy, configure or roll out inside a large company.",
    question: "Is every client setup quite different?",
    source: "local",
  },
  {
    term: "IBM Maximo",
    aliases: ["Maximo"],
    meaning: "IBM software used to manage physical assets such as factory equipment, buildings and fleets.",
    why: "They may be working on how a company tracks equipment, maintenance and operational data.",
    question: "What tends to be the messy part when a client first sets it up?",
    source: "local",
  },
];

export const terminologyGlossary: TerminologyEntry[] = [...technicalTerminology, ...businessTerminology];

const normalise = (value: string) => value.trim().toLocaleLowerCase();

export function findTerminologyEntry(value: string) {
  const query = normalise(value);
  return terminologyGlossary.find((entry) =>
    [entry.term, ...(entry.aliases ?? []), ...(entry.triggers ?? [])].some((alias) => normalise(alias) === query),
  );
}

export function findTermsInText(text: string) {
  const haystack = normalise(text);
  if (!haystack) return [];

  return terminologyGlossary.filter((entry) =>
    [entry.term, ...(entry.aliases ?? []), ...(entry.triggers ?? [])].some((alias) => {
      const escaped = normalise(alias).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(haystack);
    }),
  );
}

export function explainTerm(value: string, context: string): TerminologyEntry {
  const localEntry = findTerminologyEntry(value);
  if (localEntry) return localEntry;

  const term = value.trim() || "This term";
  return {
    term,
    category: "General",
    meaning: `In this prototype, “${term}” is treated as specialist language that may need a quick plain-English explanation.`,
    why: context
      ? "It appeared in what the person just said, so understanding it may help you follow the practical point they are making."
      : "It may describe a product, process or technical detail that matters to this conversation.",
    question: `So what does ${term} change in practice?`,
    moreQuestions: [`Who does ${term} affect most?`, `What would a good outcome for ${term} look like?`],
    source: "mock-fallback",
  };
}
