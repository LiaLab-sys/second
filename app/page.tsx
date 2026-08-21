"use client";

import { FormEvent, useMemo, useState } from "react";

type Screen = "home" | "prep" | "live" | "wrap" | "memory" | "person";
type PersonId = "alex" | "sarah" | "daniel";

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

const liveQuestions = [
  "When you integrate Maximo with an ERP, where does most of the complexity usually come from — the technology itself or the client’s existing systems?",
  "At what point in a project do those security issues usually become visible?",
  "What have the best-prepared clients done differently before your team arrives?",
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
  const [openTerm, setOpenTerm] = useState(0);
  const [liveText, setLiveText] = useState("He said they integrate Maximo with the customer’s ERP but security vulnerabilities and APIs can make implementation difficult.");
  const [liveAnswered, setLiveAnswered] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showTermHelp, setShowTermHelp] = useState(false);
  const [insightSaved, setInsightSaved] = useState(false);
  const [wrapStructured, setWrapStructured] = useState(false);
  const [memorySaved, setMemorySaved] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonId>("alex");

  const activeArea = screen === "live" || screen === "wrap" ? "live" : screen === "memory" || screen === "person" ? "memory" : "prep";
  const selected = people[selectedPerson];

  const goHome = () => {
    setScreen("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const go = (next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPerson = (id: PersonId) => {
    setSelectedPerson(id);
    go("person");
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

      {screen === "home" && <HomeScreen goal={goal} setGoal={setGoal} onSubmit={() => go("prep")} />}
      {screen === "prep" && <PrepScreen openTerm={openTerm} setOpenTerm={setOpenTerm} onLive={() => go("live")} />}
      {screen === "live" && (
        <LiveScreen
          text={liveText}
          setText={setLiveText}
          answered={liveAnswered}
          onAnswer={() => setLiveAnswered(true)}
          question={liveQuestions[questionIndex]}
          onAnother={() => setQuestionIndex((current) => (current + 1) % liveQuestions.length)}
          showTermHelp={showTermHelp}
          setShowTermHelp={setShowTermHelp}
          insightSaved={insightSaved}
          setInsightSaved={setInsightSaved}
          onWrap={() => go("wrap")}
        />
      )}
      {screen === "wrap" && <WrapScreen structured={wrapStructured} onStructure={() => setWrapStructured(true)} onSave={() => { setMemorySaved(true); go("memory"); }} />}
      {screen === "memory" && <MemoryScreen saved={memorySaved} openPerson={openPerson} />}
      {screen === "person" && <PersonScreen person={selected} onBack={() => go("memory")} />}
    </main>
  );
}

function HomeScreen({ goal, setGoal, onSubmit }: { goal: string; setGoal: (goal: string) => void; onSubmit: () => void }) {
  return (
    <section className="intake page" id="top">
      <div className="eyebrow"><span>01</span> Before the conversation</div>
      <h1>Who are you<br />talking to?</h1>
      <p className="lede">A little context is enough. We’ll help you understand the room before you walk into it.</p>

      <form className="conversation-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <div className="field-grid">
          <label><span>Person name</span><input defaultValue="Alex Meyer" aria-label="Person name" /></label>
          <label><span>Company</span><input defaultValue="IBM" aria-label="Company" /></label>
          <label><span>Role / title</span><input defaultValue="IBM Maximo Partner" aria-label="Role or title" /></label>
          <label><span>Event</span><input defaultValue="Zürich AI & Enterprise Technology Meetup" aria-label="Event" /></label>
        </div>
        <label className="wide-field">
          <span>What do you already know?</span>
          <textarea defaultValue="He works with companies implementing IBM Maximo and mentioned that his team sometimes works directly inside client systems." aria-label="What you already know" />
          <button className="mic" type="button" aria-label="Use voice input"><i /></button>
        </label>
        <fieldset>
          <legend>What do you want from the conversation?</legend>
          <div className="goal-row">
            {goals.map((item) => <button className={goal === item ? "goal selected" : "goal"} key={item} onClick={() => setGoal(item)} type="button">{item}</button>)}
          </div>
        </fieldset>
        <label className="wide-field last"><span>Conversation goal</span><textarea defaultValue="Understand what he does, learn about enterprise AI opportunities and have an intelligent networking conversation without pretending to be deeply technical." aria-label="Conversation goal" /></label>
        <div className="form-footer"><p>Nothing leaves this prototype.</p><button className="primary" type="submit">Prep me <span>→</span></button></div>
      </form>
    </section>
  );
}

function PrepScreen({ openTerm, setOpenTerm, onLive }: { openTerm: number; setOpenTerm: (index: number) => void; onLive: () => void }) {
  const questions = [
    "You mentioned your team sometimes works directly inside the client’s systems — what does that typically look like in practice?",
    "Where are manufacturing clients seeing the clearest value from Maximo today?",
    "Are clients approaching predictive maintenance as an AI project or as an operations project?",
    "What tends to make ERP integrations difficult: the technology, the data or the organisation?",
    "What kinds of people are most valuable on a Maximo implementation team?",
  ];
  const insights = [
    ["His work is operational, not abstract", "Maximo projects touch real equipment, maintenance teams and day-to-day business systems."],
    ["Integration is likely the real story", "The difficult part is often connecting modern tools to a client’s existing ERP, data and security setup."],
    ["AI is useful when it predicts something concrete", "Predictive maintenance is about preventing downtime—not adding AI for its own sake."],
    ["You do not need to sound technical", "Good questions about clients, decisions and implementation trade-offs will be more useful than jargon."],
  ];

  return (
    <section className="prep-page page">
      <div className="prep-hero">
        <div>
          <div className="eyebrow"><span>02</span> Your briefing</div>
          <h1>Alex Meyer</h1>
          <p>IBM Maximo Partner · IBM</p>
        </div>
        <button className="live-launch" onClick={onLive} type="button"><span className="live-dot" /> Start Live Assist <b>→</b></button>
      </div>

      <div className="prep-layout">
        <aside className="prep-index" aria-label="Briefing sections">
          <a href="#person">The person</a><a href="#know">What to know</a><a href="#questions">Questions</a><a href="#terms">Terminology</a><a href="#intro">Introduction</a>
        </aside>
        <div className="prep-content">
          <section className="brief-section" id="person">
            <div className="section-number">01</div><div><h2>The short version</h2><p className="big-copy">Alex helps companies use IBM Maximo to manage and maintain expensive physical assets—usually by connecting it with the systems they already rely on.</p><p>Think factories, fleets and infrastructure. His work sits where software, operations and client-specific complexity meet.</p></div>
          </section>
          <section className="brief-section" id="know">
            <div className="section-number">02</div><div><h2>What to know</h2><div className="insight-list">{insights.map(([title, copy], index) => <article className="insight" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div>
          </section>
          <section className="brief-section" id="questions">
            <div className="section-number">03</div><div><h2>Questions worth asking</h2><div className="question-list">{questions.map((question, index) => <button key={question} type="button"><span>{index + 1}</span>{question}<i>↗</i></button>)}</div><div className="followups"><h3>Smart follow-ups</h3><p>“What surprised you once the project was live?”</p><p>“Who inside the client usually owns that decision?”</p><p>“Is that changing now that AI is part of the conversation?”</p></div></div>
          </section>
          <section className="brief-section terminology" id="terms">
            <div className="section-number">04</div><div><h2>Useful terminology</h2><p className="section-note">Enough to follow the conversation—not perform expertise.</p><div className="term-list">{terms.map((term, index) => <article className={`term ${openTerm === index ? "open" : ""}`} key={term.name}><button onClick={() => setOpenTerm(index)} type="button" aria-expanded={openTerm === index}><span>{term.name}</span><i>{openTerm === index ? "−" : "+"}</i></button>{openTerm === index && <div className="term-body"><dl><div><dt>Simple meaning</dt><dd>{term.meaning}</dd></div><div><dt>Why it matters here</dt><dd>{term.relevance}</dd></div><div><dt>A question you could ask</dt><dd>“{term.question}”</dd></div></dl></div>}</article>)}</div></div>
          </section>
          <section className="brief-section intro-section" id="intro">
            <div className="section-number">05</div><div><h2>A natural introduction</h2><blockquote>“Hi Alex, I’m interested in how AI actually gets used inside large companies—not just the demos. You mentioned your team works directly in client systems, and I’d love to understand what that looks like in practice.”</blockquote><p>Then stop. Let him take it from there.</p><button className="primary" onClick={onLive} type="button">I’m ready <span>Start Live Assist →</span></button></div>
          </section>
        </div>
      </div>
    </section>
  );
}

function LiveScreen({ text, setText, answered, onAnswer, question, onAnother, showTermHelp, setShowTermHelp, insightSaved, setInsightSaved, onWrap }: { text: string; setText: (text: string) => void; answered: boolean; onAnswer: () => void; question: string; onAnother: () => void; showTermHelp: boolean; setShowTermHelp: (show: boolean) => void; insightSaved: boolean; setInsightSaved: (saved: boolean) => void; onWrap: () => void }) {
  const submit = (event: FormEvent) => { event.preventDefault(); if (text.trim()) onAnswer(); };
  return (
    <section className="live-page page">
      <div className="live-meta"><span><i className="live-dot" /> Live with Alex Meyer</span><button onClick={onWrap} type="button">End conversation</button></div>
      <div className="live-core">
        <div className="eyebrow"><span>03</span> In the moment</div>
        {!answered ? <form className="live-form" onSubmit={submit}><h1>What did they<br />just say?</h1><div className="live-input"><textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="What they just said" autoFocus /><button className="voice-button" type="button" aria-label="Use voice input"><i /></button></div><button className="primary answer-button" type="submit">Help me respond <span>→</span></button><p className="live-hint">A rough sentence is enough.</p></form> : <div className="live-answer"><div className="meaning"><span>What that means</span><p>Maximo rarely works alone. It has to connect with the client’s core business software, and those connections can expose old technology, inconsistent data and security risks.</p></div><div className="ask-next"><span>Ask next</span><blockquote>“{question}”</blockquote></div>{showTermHelp && <div className="inline-term"><b>API</b><span>A standard way for two software systems to exchange data.</span><button onClick={() => setShowTermHelp(false)} type="button">Close</button></div>}<div className="live-actions"><button onClick={onAnother} type="button"><i>↻</i> Another question</button><button onClick={() => setShowTermHelp(!showTermHelp)} type="button"><i>?</i> Explain a term</button><button className={insightSaved ? "saved" : ""} onClick={() => setInsightSaved(!insightSaved)} type="button"><i>{insightSaved ? "✓" : "+"}</i> {insightSaved ? "Insight saved" : "Save this insight"}</button></div></div>}
      </div>
    </section>
  );
}

function WrapScreen({ structured, onStructure, onSave }: { structured: boolean; onStructure: () => void; onSave: () => void }) {
  return (
    <section className="wrap-page page">
      <div className="wrap-heading"><div className="eyebrow"><span>04</span> After the conversation</div><h1>What should you<br />remember?</h1><p>Write it as it comes. We’ll give it shape.</p></div>
      <div className="wrap-grid">
        <div><label className="dump-label"><span>Your notes</span><textarea defaultValue="Alex mainly works with manufacturing companies. Clients are starting to ask more about predictive maintenance and AI. He said integration with legacy ERP systems is often harder than the AI itself. Suggested I speak to Sarah from their Zürich team. Connect with him on LinkedIn." /></label><div className="dump-action"><button className="voice-text" type="button"><i /> Speak instead</button><button className="primary" onClick={onStructure} type="button">{structured ? "Summary ready" : "Structure my notes"}<span>{structured ? "✓" : "→"}</span></button></div></div>
        <div className={`structured ${structured ? "visible" : ""}`} aria-live="polite">{!structured ? <div className="empty-structure"><Mark compact /><p>Your structured memory will appear here.</p></div> : <><h2>Conversation summary</h2><dl><div><dt>Person</dt><dd>Alex Meyer · IBM</dd></div><div><dt>Where we met</dt><dd>Zürich AI & Enterprise Technology Meetup</dd></div><div><dt>Key topics</dt><dd><span>Predictive maintenance</span><span>ERP integration</span><span>Enterprise AI</span></dd></div><div><dt>Important insight</dt><dd>Legacy ERP integration is often more difficult than the AI component itself.</dd></div><div><dt>Potential opportunity</dt><dd>Learn more about practical AI projects for manufacturing clients.</dd></div><div><dt>People mentioned</dt><dd>Sarah · Zürich team</dd></div><div><dt>Follow-up</dt><dd>Connect with Alex on LinkedIn and ask for an introduction to Sarah.</dd></div><div><dt>Next time</dt><dd>Ask which predictive-maintenance projects have created measurable value.</dd></div></dl><button className="primary save-memory" onClick={onSave} type="button">Save to Memory <span>→</span></button></>}</div>
      </div>
    </section>
  );
}

function MemoryScreen({ saved, openPerson }: { saved: boolean; openPerson: (id: PersonId) => void }) {
  const list = useMemo(() => [people.alex, people.sarah, people.daniel], []);
  return (
    <section className="memory-page page">
      <div className="memory-heading"><div className="eyebrow"><span>05</span> Relationship memory</div><div><h1>People worth<br />remembering.</h1><p>Context for the conversations that matter—not a pipeline.</p></div></div>
      {saved && <div className="save-notice"><span>✓</span><p><b>Conversation saved.</b> Alex’s memory has been updated.</p><button onClick={() => openPerson("alex")} type="button">View memory →</button></div>}
      <div className="memory-tools"><span>3 people</span><label><span className="sr-only">Search memory</span><input placeholder="Search people, companies or topics" /><i>⌕</i></label></div>
      <div className="people-list">{list.map((person, index) => <button className="person-row" key={person.id} onClick={() => openPerson(person.id)} type="button"><span className="row-number">{String(index + 1).padStart(2, "0")}</span><span className="avatar">{person.initials}</span><span className="person-main"><b>{person.name}</b><small>{person.role} · {person.company}</small></span><span className="person-met"><small>Met at</small>{person.met}</span><span className="person-date"><small>Last spoke</small>{person.date}</span><span className="row-arrow">→</span></button>)}</div>
      <div className="topic-strip"><span>Across your recent conversations</span><div><b>Enterprise AI</b><b>Manufacturing</b><b>Security</b><b>Cloud</b></div></div>
    </section>
  );
}

function PersonScreen({ person, onBack }: { person: typeof people[PersonId]; onBack: () => void }) {
  return (
    <section className="person-page page">
      <button className="back-link" onClick={onBack} type="button">← All people</button>
      <div className="person-hero"><div className="large-avatar">{person.initials}</div><div><h1>{person.name}</h1><p>{person.role} · {person.company}</p></div><button className="outline-button" type="button">Start a new conversation →</button></div>
      <div className="person-context"><span>Met at <b>{person.met}</b></span><span>Last spoke <b>{person.date}</b></span><span>Status <b className="status-dot">{person.status}</b></span></div>
      <div className="relationship-grid"><article><span>01 / Last time</span><h2>What you discussed</h2><p>{person.discussed}</p><div className="tags">{person.topics.map((topic) => <b key={topic}>{topic}</b>)}</div></article><article><span>02 / What matters</span><h2>Useful context</h2><p>{person.matters}</p></article><article className="accent-article"><span>03 / Follow-up</span><h2>Keep your word</h2><p>{person.followup}</p><label><input type="checkbox" /> Mark as done</label></article><article><span>04 / Next time</span><h2>Pick up the thread</h2><blockquote>“{person.next}”</blockquote></article></div>
    </section>
  );
}
