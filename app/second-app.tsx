"use client";

import { FormEvent, useMemo, useState } from "react";

type Screen = "home" | "prep" | "live" | "wrap" | "memory" | "person";

type ConversationProfile = {
  name: string;
  company: string;
  role: string;
  event: string;
  known: string;
  conversationGoal: string;
  goal: string;
};

type MemoryPerson = {
  id: string;
  initials: string;
  name: string;
  company: string;
  role: string;
  met: string;
  date: string;
  topics: string[];
  status: string;
  discussed: string;
  matters: string;
  followup: string;
  next: string;
};

const sampleProfile: ConversationProfile = {
  name: "Alex Meyer",
  company: "IBM",
  role: "IBM Maximo Partner",
  event: "Zürich AI & Enterprise Technology Meetup",
  known: "He works with companies implementing IBM Maximo and mentioned that his team sometimes works directly inside client systems.",
  conversationGoal: "Understand what he does, learn about enterprise AI opportunities and have an intelligent networking conversation without pretending to be deeply technical.",
  goal: "Network",
};

const goals = ["Learn", "Network", "Find opportunities", "Career", "Partnership", "Potential client"];

const terms = [
  {
    name: "IBM Maximo",
    meaning: "Software for managing physical assets such as factory equipment, buildings and fleets.",
    relevance: "It is the core platform Alex helps companies implement and improve.",
    question: "What usually makes a Maximo implementation successful beyond the software itself?",
  },
  {
    name: "ERP",
    meaning: "The central system a company uses to run operations such as finance, procurement and inventory.",
    relevance: "Maximo often needs to exchange asset, purchasing and inventory data with a client’s ERP.",
    question: "Which ERP systems do you most often connect Maximo to?",
  },
  {
    name: "API",
    meaning: "A controlled way for two software systems to exchange information and trigger actions.",
    relevance: "APIs are the bridges between Maximo and the rest of a client’s technology landscape.",
    question: "Do the difficult integrations usually involve missing APIs or inconsistent data?",
  },
  {
    name: "CVE",
    meaning: "A public reference number for a known software security vulnerability.",
    relevance: "Clients need to know whether the systems and integrations around Maximo expose known risks.",
    question: "How early do security teams normally get involved in an implementation?",
  },
  {
    name: "Predictive maintenance",
    meaning: "Using equipment data to predict a failure before it happens, so maintenance can be planned.",
    relevance: "It is one of the clearest practical uses of AI around asset management.",
    question: "Are clients already getting value from predictive maintenance, or are most still experimenting?",
  },
];

const liveQuestions = (profile: ConversationProfile) => [
  `Where does most of that complexity come from in your work at ${profile.company}?`,
  "At what point does that issue usually become visible?",
  "What have the best-prepared people or teams done differently?",
];

const people = {
  alex: {
    id: "alex" as const,
    initials: "AM",
    name: "Alex Meyer",
    company: "IBM",
    role: "IBM Maximo Partner",
    met: "Zürich AI & Enterprise Technology Meetup",
    date: "21 Aug 2026",
    topics: ["Enterprise AI", "Maximo", "ERP integration"],
    status: "Connect this week",
    discussed: "How manufacturing companies connect Maximo with older ERP systems, and why integration work is often harder than the AI layer itself.",
    matters: "Works mainly with manufacturing clients. Interested in practical predictive maintenance, but careful about security and data quality. His team sometimes works directly inside client systems.",
    followup: "Connect on LinkedIn and ask for an introduction to Sarah in the Zürich team.",
    next: "Ask what early predictive-maintenance projects have produced measurable value, and how IBM teams define a useful first deployment.",
  },
  sarah: {
    id: "sarah" as const,
    initials: "SK",
    name: "Sarah Keller",
    company: "Lattice Works",
    role: "Co-founder, applied AI",
    met: "Swiss AI Breakfast",
    date: "12 Aug 2026",
    topics: ["AI operations", "Hiring", "Zurich ecosystem"],
    status: "Follow up in September",
    discussed: "Moving from prototype demos to reliable AI workflows inside regulated companies.",
    matters: "Building a small applied AI team. Values people who can translate between operators and technical teams.",
    followup: "Send the article on evaluation design after her team’s product launch.",
    next: "Ask what changed after the first three customer deployments and where human review still matters most.",
  },
  daniel: {
    id: "daniel" as const,
    initials: "DR",
    name: "Daniel Rossi",
    company: "Microsoft",
    role: "Cloud Solution Architect",
    met: "Enterprise Tech Roundtable",
    date: "27 Jul 2026",
    topics: ["Cloud migration", "Security", "Manufacturing"],
    status: "No action needed",
    discussed: "Why cloud migration plans get stuck when ownership is fragmented across business units.",
    matters: "Works across Switzerland and Northern Italy. Focused on manufacturing and security governance.",
    followup: "Nothing promised. Keep him in mind for future cloud-governance questions.",
    next: "Ask whether AI projects are changing who owns cloud architecture decisions inside clients.",
  },
};

function Mark({ compact = false }: { compact?: boolean }) {
  return <span className={compact ? "mark compact" : "mark"} aria-hidden="true">S</span>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [goal, setGoal] = useState("Network");
  const [profile, setProfile] = useState<ConversationProfile>(sampleProfile);
  const [openTerm, setOpenTerm] = useState(0);
  const [liveText, setLiveText] = useState("He said they integrate Maximo with the customer’s ERP but security vulnerabilities and APIs can make implementation difficult.");
  const [liveAnswered, setLiveAnswered] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showTermHelp, setShowTermHelp] = useState(false);
  const [insightSaved, setInsightSaved] = useState(false);
  const [wrapStructured, setWrapStructured] = useState(false);
  const [wrapNotes, setWrapNotes] = useState("");
  const [memorySaved, setMemorySaved] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<MemoryPerson>(people.alex);

  const activeArea = screen === "live" || screen === "wrap" ? "live" : screen === "memory" || screen === "person" ? "memory" : "prep";
  const currentMemoryPerson = useMemo<MemoryPerson>(() => {
    const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
    return {
      id: "current",
      initials,
      name: profile.name,
      company: profile.company,
      role: profile.role,
      met: profile.event,
      date: "Today",
      topics: [profile.goal, profile.role, profile.company].filter(Boolean),
      status: "Follow up",
      discussed: wrapNotes || profile.conversationGoal || `A first conversation with ${profile.name}.`,
      matters: profile.known || `Keep building context about ${profile.name} and their work at ${profile.company}.`,
      followup: `Follow up with ${profile.name} while the conversation is still fresh.`,
      next: `Ask what has changed since you last spoke and continue the thread around ${profile.conversationGoal || "their current priorities"}.`,
    };
  }, [profile, wrapNotes]);

  const goHome = () => {
    setScreen("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPerson = (person: MemoryPerson) => {
    setSelectedPerson(person);
    go("person");
  };

  const startConversation = (nextProfile: ConversationProfile) => {
    setProfile(nextProfile);
    setLiveText("");
    setLiveAnswered(false);
    setQuestionIndex(0);
    setShowTermHelp(false);
    setInsightSaved(false);
    setWrapNotes("");
    setWrapStructured(false);
    setMemorySaved(false);
    go("prep");
  };

  return (
    <main className={`site-shell screen-${screen}`}>
      <header className="topbar">
        <button className="brand" onClick={goHome} type="button" aria-label="Second home"><Mark /> <span>Second</span></button>
        <nav aria-label="Primary navigation">
          <button className={`nav-link ${activeArea === "prep" ? "active" : ""}`} onClick={() => go(screen === "home" ? "home" : "prep")} type="button">Prep</button>
          <button className={`nav-link ${activeArea === "live" ? "active" : ""}`} onClick={() => go("live")} type="button">Live</button>
          <button className={`nav-link ${activeArea === "memory" ? "active" : ""}`} onClick={() => go("memory")} type="button">Memory</button>
        </nav>
        <button className="new-button" onClick={goHome} type="button"><span>+</span> New conversation</button>
      </header>

      {screen === "home" && <HomeScreen profile={profile} goal={goal} setGoal={setGoal} onSubmit={startConversation} />}
      {screen === "prep" && <PrepScreen profile={profile} openTerm={openTerm} setOpenTerm={setOpenTerm} onLive={() => go("live")} />}
      {screen === "live" && (
        <LiveScreen
          text={liveText}
          setText={setLiveText}
          answered={liveAnswered}
          onAnswer={() => setLiveAnswered(true)}
          question={liveQuestions(profile)[questionIndex]}
          onAnother={() => setQuestionIndex((current) => (current + 1) % liveQuestions(profile).length)}
          showTermHelp={showTermHelp}
          setShowTermHelp={setShowTermHelp}
          insightSaved={insightSaved}
          setInsightSaved={setInsightSaved}
          profile={profile}
          onWrap={() => go("wrap")}
        />
      )}
      {screen === "wrap" && <WrapScreen profile={profile} notes={wrapNotes} setNotes={setWrapNotes} structured={wrapStructured} onStructure={() => setWrapStructured(true)} onSave={() => { setMemorySaved(true); setSelectedPerson(currentMemoryPerson); go("memory"); }} />}
      {screen === "memory" && <MemoryScreen saved={memorySaved} currentPerson={currentMemoryPerson} openPerson={openPerson} />}
      {screen === "person" && <PersonScreen person={selectedPerson} onBack={() => go("memory")} />}
    </main>
  );
}

function HomeScreen({ profile, goal, setGoal, onSubmit }: { profile: ConversationProfile; goal: string; setGoal: (goal: string) => void; onSubmit: (profile: ConversationProfile) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      name: String(data.get("name") || "New contact"),
      company: String(data.get("company") || "Independent"),
      role: String(data.get("role") || "Role not specified"),
      event: String(data.get("event") || "Not specified"),
      known: String(data.get("known") || ""),
      conversationGoal: String(data.get("conversationGoal") || ""),
      goal,
    });
  };

  return (
    <section className="intake page" id="top">
      <div className="eyebrow"><span>01</span> Before the conversation</div>
      <h1>Who are you<br />talking to?</h1>
      <p className="lede">A little context is enough. We’ll help you understand the room before you walk into it.</p>

      <form className="conversation-form" onSubmit={submit}>
        <div className="field-grid">
          <label><span>Person name</span><input name="name" defaultValue={profile.name} aria-label="Person name" required /></label>
          <label><span>Company</span><input name="company" defaultValue={profile.company} aria-label="Company" /></label>
          <label><span>Role / title</span><input name="role" defaultValue={profile.role} aria-label="Role or title" /></label>
          <label><span>Event</span><input name="event" defaultValue={profile.event} aria-label="Event" /></label>
        </div>
        <label className="wide-field">
          <span>What do you already know?</span>
          <textarea name="known" defaultValue={profile.known} aria-label="What you already know" />
          <button className="mic" type="button" aria-label="Use voice input"><i /></button>
        </label>
        <fieldset>
          <legend>What do you want from the conversation?</legend>
          <div className="goal-row">
            {goals.map((item) => <button className={goal === item ? "goal selected" : "goal"} key={item} onClick={() => setGoal(item)} type="button">{item}</button>)}
          </div>
        </fieldset>
        <label className="wide-field last"><span>Conversation goal</span><textarea name="conversationGoal" defaultValue={profile.conversationGoal} aria-label="Conversation goal" /></label>
        <div className="form-footer"><p>Nothing leaves this prototype.</p><button className="primary" type="submit">Prep me <span>→</span></button></div>
      </form>
    </section>
  );
}

function PrepScreen({ profile, openTerm, setOpenTerm, onLive }: { profile: ConversationProfile; openTerm: number; setOpenTerm: (index: number) => void; onLive: () => void }) {
  const firstName = profile.name.split(" ")[0] || profile.name;
  const usefulTerms = profile.name === sampleProfile.name && profile.company === sampleProfile.company
    ? terms
    : [
        { name: profile.company, meaning: `The organisation where ${firstName} works.`, relevance: `Understanding its priorities will help you place ${firstName}’s role in context.`, question: `What is ${profile.company} most focused on right now?` },
        { name: profile.role, meaning: `The title or function ${firstName} holds at ${profile.company}.`, relevance: "The title is a starting point; the actual decisions and responsibilities are the useful part.", question: `What does being a ${profile.role} involve day to day?` },
        { name: "Stakeholder", meaning: "A person or group affected by a project or able to influence its outcome.", relevance: "Asking who is involved reveals how decisions really get made.", question: "Who are the most important stakeholders in that work?" },
        { name: "Implementation", meaning: "The practical work of turning an idea or plan into something people actually use.", relevance: "It moves the conversation from broad ideas to real constraints and outcomes.", question: "What tends to be hardest during implementation?" },
        { name: "Opportunity", meaning: "A problem, unmet need or useful next step that could lead to future work or learning.", relevance: `Your goal is to ${profile.goal.toLowerCase()}, so listen for areas where curiosity or a follow-up could be valuable.`, question: "Where do you see the most interesting opportunities emerging?" },
      ];
  const questions = [
    `What does your work as ${profile.role} look like in practice?`,
    `What is ${profile.company} most focused on right now?`,
    "What part of the work is more difficult than people outside the field usually assume?",
    "What has changed most in your industry over the past year?",
    `If you were exploring ${profile.conversationGoal || "this area"}, where would you start?`,
  ];
  const insights = [
    ["Start from the context you already have", profile.known || `${firstName} works as ${profile.role} at ${profile.company}.`],
    ["Understand the role in practice", `A title rarely explains the day-to-day work. Ask where ${firstName} spends time, makes decisions and creates value.`],
    ["Look for a concrete example", "A recent project or decision will reveal more than a broad description of the industry."],
    ["Stay curious, not performative", "Good questions about priorities, trade-offs and experience matter more than sounding like an expert."],
  ];

  return (
    <section className="prep-page page">
      <div className="prep-hero">
        <div>
          <div className="eyebrow"><span>02</span> Your briefing</div>
          <h1>{profile.name}</h1>
          <p>{profile.role} · {profile.company}</p>
        </div>
        <button className="live-launch" onClick={onLive} type="button"><span className="live-dot" /> Start Live Assist <b>→</b></button>
      </div>

      <div className="prep-layout">
        <aside className="prep-index" aria-label="Briefing sections">
          <a href="#person">The person</a><a href="#know">What to know</a><a href="#questions">Questions</a><a href="#terms">Terminology</a><a href="#intro">Introduction</a>
        </aside>
        <div className="prep-content">
          <section className="brief-section" id="person">
            <div className="section-number">01</div><div><h2>The short version</h2><p className="big-copy">{firstName} works as {profile.role} at {profile.company}. Your goal is to {profile.goal.toLowerCase()} and understand their work without forcing the conversation.</p><p>{profile.known || `You’re meeting at ${profile.event}. Begin with their role, then look for the priorities and real-world problems behind the title.`}</p></div>
          </section>
          <section className="brief-section" id="know">
            <div className="section-number">02</div><div><h2>What to know</h2><div className="insight-list">{insights.map(([title, copy], index) => <article className="insight" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div>
          </section>
          <section className="brief-section" id="questions">
            <div className="section-number">03</div><div><h2>Questions worth asking</h2><div className="question-list">{questions.map((question, index) => <button key={question} type="button"><span>{index + 1}</span>{question}<i>↗</i></button>)}</div><div className="followups"><h3>Smart follow-ups</h3><p>“What surprised you once the project was live?”</p><p>“Who inside the client usually owns that decision?”</p><p>“Is that changing now that AI is part of the conversation?”</p></div></div>
          </section>
          <section className="brief-section terminology" id="terms">
            <div className="section-number">04</div><div><h2>Useful terminology</h2><p className="section-note">Enough to follow the conversation—not perform expertise.</p><div className="term-list">{usefulTerms.map((term, index) => <article className={`term ${openTerm === index ? "open" : ""}`} key={term.name}><button onClick={() => setOpenTerm(index)} type="button" aria-expanded={openTerm === index}><span>{term.name}</span><i>{openTerm === index ? "−" : "+"}</i></button>{openTerm === index && <div className="term-body"><dl><div><dt>Simple meaning</dt><dd>{term.meaning}</dd></div><div><dt>Why it matters here</dt><dd>{term.relevance}</dd></div><div><dt>A question you could ask</dt><dd>“{term.question}”</dd></div></dl></div>}</article>)}</div></div>
          </section>
          <section className="brief-section intro-section" id="intro">
            <div className="section-number">05</div><div><h2>A natural introduction</h2><blockquote>“Hi {firstName}, I’m curious about what you’re working on at {profile.company}. {profile.conversationGoal ? `I’m especially interested in ${profile.conversationGoal.charAt(0).toLowerCase()}${profile.conversationGoal.slice(1)}` : "I’d love to understand what your work looks like in practice"}.”</blockquote><p>Then stop. Let {firstName} take it from there.</p><button className="primary" onClick={onLive} type="button">I’m ready <span>Start Live Assist →</span></button></div>
          </section>
        </div>
      </div>
    </section>
  );
}

function LiveScreen({ profile, text, setText, answered, onAnswer, question, onAnother, showTermHelp, setShowTermHelp, insightSaved, setInsightSaved, onWrap }: { profile: ConversationProfile; text: string; setText: (text: string) => void; answered: boolean; onAnswer: () => void; question: string; onAnother: () => void; showTermHelp: boolean; setShowTermHelp: (show: boolean) => void; insightSaved: boolean; setInsightSaved: (saved: boolean) => void; onWrap: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); if (text.trim()) onAnswer(); };
  return (
    <section className="live-page page">
      <div className="live-meta"><span><i className="live-dot" /> Live with {profile.name}</span><button onClick={onWrap} type="button">End conversation</button></div>
      <div className="live-core">
        <div className="eyebrow"><span>03</span> In the moment</div>
        {!answered ? <form className="live-form" onSubmit={submit}><h1>What did they<br />just say?</h1><div className="live-input"><textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="What they just said" placeholder={`Type what ${profile.name.split(" ")[0]} just said…`} autoFocus /><button className="voice-button" type="button" aria-label="Use voice input"><i /></button></div><button className="primary answer-button" type="submit">Help me respond <span>→</span></button><p className="live-hint">A rough sentence is enough.</p></form> : <div className="live-answer"><div className="meaning"><span>What that means</span><p>{profile.name.split(" ")[0]} is describing a practical constraint, not just a surface-level detail. The useful thread is to understand where the difficulty appears, who owns it and what a better outcome would look like.</p></div><div className="ask-next"><span>Ask next</span><blockquote>“{question}”</blockquote></div>{showTermHelp && <div className="inline-term"><b>Context</b><span>The background that makes a statement meaningful in this specific situation.</span><button onClick={() => setShowTermHelp(false)} type="button">Close</button></div>}<div className="live-actions"><button onClick={onAnother} type="button"><i>↻</i> Another question</button><button onClick={() => setShowTermHelp(!showTermHelp)} type="button"><i>?</i> Explain a term</button><button className={insightSaved ? "saved" : ""} onClick={() => setInsightSaved(!insightSaved)} type="button"><i>{insightSaved ? "✓" : "+"}</i> {insightSaved ? "Insight saved" : "Save this insight"}</button></div></div>}
      </div>
    </section>
  );
}

function WrapScreen({ profile, notes, setNotes, structured, onStructure, onSave }: { profile: ConversationProfile; notes: string; setNotes: (notes: string) => void; structured: boolean; onStructure: () => void; onSave: () => void }) {
  const firstName = profile.name.split(" ")[0] || profile.name;
  return (
    <section className="wrap-page page">
      <div className="wrap-heading"><div className="eyebrow"><span>04</span> After the conversation</div><h1>What should you<br />remember?</h1><p>Write it as it comes. We’ll give it shape.</p></div>
      <div className="wrap-grid">
        <div><label className="dump-label"><span>Your notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={`What happened in your conversation with ${profile.name}?`} /></label><div className="dump-action"><button className="voice-text" type="button"><i /> Speak instead</button><button className="primary" onClick={onStructure} type="button">{structured ? "Summary ready" : "Structure my notes"}<span>{structured ? "✓" : "→"}</span></button></div></div>
        <div className={`structured ${structured ? "visible" : ""}`} aria-live="polite">{!structured ? <div className="empty-structure"><Mark compact /><p>Your structured memory will appear here.</p></div> : <><h2>Conversation summary</h2><dl><div><dt>Person</dt><dd>{profile.name} · {profile.company}</dd></div><div><dt>Where we met</dt><dd>{profile.event}</dd></div><div><dt>Key topics</dt><dd><span>{profile.goal}</span><span>{profile.role}</span><span>{profile.company}</span></dd></div><div><dt>Important insight</dt><dd>{notes || `Add a note about the most important thing ${firstName} shared.`}</dd></div><div><dt>Potential opportunity</dt><dd>{profile.conversationGoal || `Continue learning about ${firstName}’s work.`}</dd></div><div><dt>People mentioned</dt><dd>None captured yet</dd></div><div><dt>Follow-up</dt><dd>Follow up with {firstName} while the conversation is still fresh.</dd></div><div><dt>Next time</dt><dd>Ask what has changed since you last spoke.</dd></div></dl><button className="primary save-memory" onClick={onSave} type="button">Save to Memory <span>→</span></button></>}</div>
      </div>
    </section>
  );
}

function MemoryScreen({ saved, currentPerson, openPerson }: { saved: boolean; currentPerson: MemoryPerson; openPerson: (person: MemoryPerson) => void }) {
  const list: MemoryPerson[] = saved
    ? currentPerson.name === people.alex.name
      ? [currentPerson, people.sarah, people.daniel]
      : [currentPerson, people.alex, people.sarah, people.daniel]
    : [people.alex, people.sarah, people.daniel];
  return (
    <section className="memory-page page">
      <div className="memory-heading"><div className="eyebrow"><span>05</span> Relationship memory</div><div><h1>People worth<br />remembering.</h1><p>Context for the conversations that matter—not a pipeline.</p></div></div>
      {saved && <div className="save-notice"><span>✓</span><p><b>Conversation saved.</b> {currentPerson.name} has been added to Memory.</p><button onClick={() => openPerson(currentPerson)} type="button">View memory →</button></div>}
      <div className="memory-tools"><span>{list.length} people</span><label><span className="sr-only">Search memory</span><input placeholder="Search people, companies or topics" /><i>⌕</i></label></div>
      <div className="people-list">{list.map((person, index) => <button className="person-row" key={`${person.id}-${person.name}`} onClick={() => openPerson(person)} type="button"><span className="row-number">{String(index + 1).padStart(2, "0")}</span><span className="avatar">{person.initials}</span><span className="person-main"><b>{person.name}</b><small>{person.role} · {person.company}</small></span><span className="person-met"><small>Met at</small>{person.met}</span><span className="person-date"><small>Last spoke</small>{person.date}</span><span className="row-arrow">→</span></button>)}</div>
      <div className="topic-strip"><span>Across your recent conversations</span><div><b>Enterprise AI</b><b>Manufacturing</b><b>Security</b><b>Cloud</b></div></div>
    </section>
  );
}

function PersonScreen({ person, onBack }: { person: MemoryPerson; onBack: () => void }) {
  return (
    <section className="person-page page">
      <button className="back-link" onClick={onBack} type="button">← All people</button>
      <div className="person-hero"><div className="large-avatar">{person.initials}</div><div><h1>{person.name}</h1><p>{person.role} · {person.company}</p></div><button className="outline-button" type="button">Start a new conversation →</button></div>
      <div className="person-context"><span>Met at <b>{person.met}</b></span><span>Last spoke <b>{person.date}</b></span><span>Status <b className="status-dot">{person.status}</b></span></div>
      <div className="relationship-grid"><article><span>01 / Last time</span><h2>What you discussed</h2><p>{person.discussed}</p><div className="tags">{person.topics.map((topic) => <b key={topic}>{topic}</b>)}</div></article><article><span>02 / What matters</span><h2>Useful context</h2><p>{person.matters}</p></article><article className="accent-article"><span>03 / Follow-up</span><h2>Keep your word</h2><p>{person.followup}</p><label><input type="checkbox" /> Mark as done</label></article><article><span>04 / Next time</span><h2>Pick up the thread</h2><blockquote>“{person.next}”</blockquote></article></div>
    </section>
  );
}
