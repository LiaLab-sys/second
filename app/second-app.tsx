"use client";

import { FormEvent, useMemo, useState } from "react";
import { explainTerm, findTermsInText, type TerminologyEntry } from "./terminology";

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

const emptyProfile: ConversationProfile = {
  name: "",
  company: "",
  role: "",
  event: "",
  known: "",
  conversationGoal: "",
  goal: "",
};

const sampleProfile: ConversationProfile = {
  name: "Alex Meyer",
  company: "IBM",
  role: "Maximo Partner",
  event: "AI networking event in Zürich",
  known: "He works with companies implementing IBM Maximo and said his team sometimes works directly inside client systems.",
  conversationGoal: "Network",
  goal: "Network",
};

const goals = ["Learn", "Network", "Find opportunities", "Career", "Partnership", "Potential client"];

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
    next: "Are clients getting measurable value from predictive maintenance yet?",
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
    next: "What changed once you had a few customer deployments running?",
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
    next: "Are AI projects changing who owns cloud decisions on the client side?",
  },
};

function getLiveResponse(text: string) {
  const lower = text.toLocaleLowerCase();

  if (/erp|api|integrat|client (system|environment)|connect/.test(lower)) {
    return {
      meaning: "They’re talking about the practical work of getting different client systems to share data reliably. The setup can vary a lot from one company to another.",
      topic: "How the client’s systems fit together",
      questions: [
        "So does every client setup end up being quite different?",
        "Who normally handles that on the client side?",
        "What tends to be the messy part once the systems are connected?",
      ],
    };
  }

  if (/cve|security|vulnerab|risk/.test(lower)) {
    return {
      meaning: "They’re pointing to a security issue that can affect whether the work is allowed to move forward, not just a technical detail.",
      topic: "Who owns security decisions on the client side",
      questions: [
        "So does that usually hold up the project?",
        "Who normally decides whether the risk is acceptable?",
        "Does that come up early, or only once you’re already building?",
      ],
    };
  }

  if (/rag|llm|\bai\b|model/.test(lower)) {
    return {
      meaning: "They’re describing how the AI part works in a real client setting. The useful detail is whether people are already using it and what information it relies on.",
      topic: "What people are actually using today",
      questions: [
        "Are clients actually using that yet?",
        "What are they using it for day to day?",
        "Where does it still need a person to check the answer?",
      ],
    };
  }

  if (/predictive maintenance|equipment|failure|downtime/.test(lower)) {
    return {
      meaning: "They’re talking about spotting equipment problems early enough to act before something breaks or causes downtime.",
      topic: "Whether predictions change what the maintenance team does",
      questions: [
        "Are clients actually acting on those predictions yet?",
        "How early can they usually spot the problem?",
        "Does it work better for some types of equipment than others?",
      ],
    };
  }

  return {
    meaning: "They’ve given you a practical detail worth unpacking. The easiest next step is to ask how it works in reality rather than trying to sound like an expert.",
    topic: "What this looks like in practice",
    questions: [
      "So how does that actually work?",
      "Does that happen often?",
      "What tends to be the messy part?",
    ],
  };
}

function Mark({ compact = false }: { compact?: boolean }) {
  return <span className={compact ? "mark compact" : "mark"} aria-hidden="true">S</span>;
}

function TermExplanation({ entry, onClose, dark = false }: { entry: TerminologyEntry; onClose?: () => void; dark?: boolean }) {
  return (
    <article className={`term-explanation ${dark ? "dark" : ""}`}>
      <header>
        <div><span>{entry.source === "local" ? "Local glossary" : "Prototype fallback"}</span><h3>{entry.term}</h3></div>
        {onClose && <button onClick={onClose} type="button" aria-label={`Close ${entry.term} explanation`}>Close</button>}
      </header>
      <dl>
        <div><dt>What it means</dt><dd>{entry.meaning}</dd></div>
        <div><dt>Why they might be mentioning it</dt><dd>{entry.why}</dd></div>
        <div><dt>What you could ask</dt><dd>“{entry.question}”</dd></div>
      </dl>
    </article>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [profile, setProfile] = useState<ConversationProfile>(emptyProfile);
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  const [liveText, setLiveText] = useState("");
  const [liveAnswered, setLiveAnswered] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [insightSaved, setInsightSaved] = useState(false);
  const [wrapStructured, setWrapStructured] = useState(false);
  const [wrapNotes, setWrapNotes] = useState("");
  const [memorySaved, setMemorySaved] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<MemoryPerson>(people.alex);

  const activeArea = screen === "live" || screen === "wrap" ? "live" : screen === "memory" || screen === "person" ? "memory" : "prep";
  const currentMemoryPerson = useMemo<MemoryPerson>(() => {
    const savedName = profile.name || "New contact";
    const initials = savedName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
    return {
      id: "current",
      initials,
      name: savedName,
      company: profile.company || "Company not noted",
      role: profile.role || "Role not noted",
      met: profile.event || "Situation not noted",
      date: "Today",
      topics: [profile.goal, profile.role, profile.company].filter(Boolean),
      status: "Follow up",
      discussed: wrapNotes || profile.known || "A first conversation worth remembering.",
      matters: profile.known || "Keep building context around their day-to-day work and current priorities.",
      followup: `Follow up with ${profile.name || "them"} while the conversation is still fresh.`,
      next: "Has much changed since we last spoke?",
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

  const startConversation = (nextProfile: ConversationProfile) => {
    setProfile(nextProfile);
    setOpenTerm(null);
    setLiveText("");
    setLiveAnswered(false);
    setQuestionIndex(0);
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

      {screen === "home" && <HomeScreen onSubmit={startConversation} />}
      {screen === "prep" && <PrepScreen profile={profile} openTerm={openTerm} setOpenTerm={setOpenTerm} onLive={() => go("live")} />}
      {screen === "live" && <LiveScreen text={liveText} setText={setLiveText} answered={liveAnswered} onAnswer={() => { setLiveAnswered(true); setQuestionIndex(0); }} questionIndex={questionIndex} onAnother={() => setQuestionIndex((current) => current + 1)} insightSaved={insightSaved} setInsightSaved={setInsightSaved} profile={profile} onWrap={() => go("wrap")} />}
      {screen === "wrap" && <WrapScreen profile={profile} notes={wrapNotes} setNotes={setWrapNotes} structured={wrapStructured} onStructure={() => setWrapStructured(true)} onSave={() => { setMemorySaved(true); setSelectedPerson(currentMemoryPerson); go("memory"); }} />}
      {screen === "memory" && <MemoryScreen saved={memorySaved} currentPerson={currentMemoryPerson} openPerson={(person) => { setSelectedPerson(person); go("person"); }} />}
      {screen === "person" && <PersonScreen person={selectedPerson} onBack={() => go("memory")} />}
    </main>
  );
}

function HomeScreen({ onSubmit }: { onSubmit: (profile: ConversationProfile) => void }) {
  const [draft, setDraft] = useState<ConversationProfile>(emptyProfile);
  const [error, setError] = useState("");
  const update = (field: keyof ConversationProfile, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const hasUsefulContext = [draft.name, draft.company, draft.role, draft.event, draft.known].some((value) => value.trim().length >= 2);
    if (!hasUsefulContext) {
      setError("Add at least one detail about the person, company, role, event or situation.");
      return;
    }
    onSubmit({ ...draft, conversationGoal: draft.goal });
  };

  return (
    <section className="intake page" id="top">
      <div className="eyebrow"><span>01</span> Before the conversation</div>
      <h1>Who are you<br />talking to?</h1>
      <p className="lede">Start with whatever you know. One useful detail can be enough to prepare.</p>
      <form className="conversation-form" onSubmit={submit} noValidate>
        <div className="form-intro-row"><span>Conversation context</span><button className="example-button" onClick={() => { setDraft(sampleProfile); setError(""); }} type="button">Try an example</button></div>
        <div className="field-grid">
          <label><span>Person’s name</span><input name="name" value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. John Smith" aria-label="Person’s name" autoComplete="name" /></label>
          <label><span>Company</span><input name="company" value={draft.company} onChange={(event) => update("company", event.target.value)} placeholder="e.g. Google" aria-label="Company" autoComplete="organization" /></label>
          <label><span>Role or title</span><input name="role" value={draft.role} onChange={(event) => update("role", event.target.value)} placeholder="e.g. Senior Product Manager" aria-label="Role or title" autoComplete="organization-title" /></label>
          <label><span>Event or situation</span><input name="event" value={draft.event} onChange={(event) => update("event", event.target.value)} placeholder="e.g. Tech Event in Zurich" aria-label="Event or situation" /></label>
        </div>
        <label className="wide-field knowledge-field"><span>What do you already know?</span><textarea name="known" value={draft.known} onChange={(event) => update("known", event.target.value)} aria-label="What do you already know?" placeholder="Anything you already know about the person, company, topic, or previous conversation…" /><button className="mic" type="button" aria-label="Use voice input"><i /></button></label>
        <fieldset><legend>What do you want from this conversation?</legend><div className="goal-row">{goals.map((item) => <button className={draft.goal === item ? "goal selected" : "goal"} aria-pressed={draft.goal === item} key={item} onClick={() => update("goal", draft.goal === item ? "" : item)} type="button">{item}</button>)}</div></fieldset>
        <div className="form-footer"><div><p>Only add what you know. Nothing leaves this prototype.</p>{error && <p className="form-error" role="alert">{error}</p>}</div><button className="primary" type="submit">Prep me <span>→</span></button></div>
      </form>
    </section>
  );
}

function PrepScreen({ profile, openTerm, setOpenTerm, onLive }: { profile: ConversationProfile; openTerm: string | null; setOpenTerm: (term: string | null) => void; onLive: () => void }) {
  const profileTitle = profile.name || profile.company || profile.role || profile.event || "New conversation";
  const firstName = profile.name.split(/\s+/).filter(Boolean)[0] || "them";
  const subtitle = [profile.role, profile.company].filter(Boolean).join(" · ") || profile.event || "Context-led briefing";
  const contextText = [profile.company, profile.role, profile.event, profile.known].filter(Boolean).join(" ");
  const defaultTermNames = /ibm|maximo/i.test(contextText) ? ["IBM Maximo", "ERP", "API", "CVE", "Predictive maintenance"] : ["Enterprise software", "API", "CRM", "SaaS", "LLM"];
  const usefulTerms = [...findTermsInText(contextText), ...defaultTermNames.map((term) => explainTerm(term, contextText))].filter((entry, index, entries) => entries.findIndex((candidate) => candidate.term === entry.term) === index).slice(0, 5);
  const questions = [
    profile.role ? `So what does being a ${profile.role} involve day to day?` : "So what are you working on at the moment?",
    profile.company ? `What are you working on at ${profile.company} right now?` : "What does the work look like in practice?",
    "What tends to be the messy part?",
    "Does that happen often?",
    "Has that changed much recently?",
  ];
  const summary = profile.name ? `${profile.name}${profile.role ? ` works as ${profile.role}` : ""}${profile.company ? ` at ${profile.company}` : ""}.` : profile.company ? `This conversation is connected to ${profile.company}${profile.role ? ` and a ${profile.role} role` : ""}.` : profile.role ? `You’re speaking with someone working as ${profile.role}.` : `You’re preparing for ${profile.event}.`;
  const insights = [
    ["Start with what you know", profile.known || summary],
    ["Get into the day-to-day", "A title only tells you so much. Ask what the work actually looks like."],
    ["Ask for one real example", "A recent project or problem will tell you more than a broad industry answer."],
    ["You do not need to impress them", "A short follow-up about something specific is enough to keep the conversation moving."],
  ];
  const introduction = profile.name && profile.company ? `Hi ${firstName}, what are you working on at ${profile.company} at the moment?` : profile.name ? `Hi ${firstName}, what are you working on at the moment?` : profile.company ? `Hi — I heard you’re with ${profile.company}. What are you working on there at the moment?` : profile.role ? `Hi — what does being a ${profile.role} actually involve day to day?` : `Hi — what brought you to ${profile.event}?`;

  return (
    <section className="prep-page page">
      <div className="prep-hero"><div><div className="eyebrow"><span>02</span> Your briefing</div><h1>{profileTitle}</h1><p>{subtitle}</p></div><button className="live-launch" onClick={onLive} type="button"><span className="live-dot" /> Start Live Assist <b>→</b></button></div>
      <div className="prep-layout">
        <aside className="prep-index" aria-label="Briefing sections"><a href="#person">The context</a><a href="#know">What to know</a><a href="#questions">Questions</a><a href="#terms">Terminology</a><a href="#intro">Introduction</a></aside>
        <div className="prep-content">
          <section className="brief-section" id="person"><div className="section-number">01</div><div><h2>The short version</h2><p className="big-copy">{summary} {profile.goal ? `You want to ${profile.goal.toLowerCase()}.` : "You want to understand the situation without forcing the conversation."}</p><p>{profile.known || (profile.event ? `You’re meeting in the context of ${profile.event}. Start there, then ask about what the work looks like in practice.` : "Begin with the detail you have, then listen for a concrete example you can ask about.")}</p></div></section>
          <section className="brief-section" id="know"><div className="section-number">02</div><div><h2>What to know</h2><div className="insight-list">{insights.map(([title, copy], index) => <article className="insight" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>
          <section className="brief-section" id="questions"><div className="section-number">03</div><div><h2>Questions worth asking</h2><div className="question-list">{questions.map((question, index) => <button key={question} type="button"><span>{index + 1}</span>{question}<i>↗</i></button>)}</div><div className="followups"><h3>Smart follow-ups</h3><p>“So how does that actually work?”</p><p>“Who normally handles that on the client side?”</p><p>“Is that something clients are asking for?”</p></div></div></section>
          <section className="brief-section terminology" id="terms"><div className="section-number">04</div><div><h2>Useful terminology</h2><p className="section-note">Tap a term for just enough context to keep following the conversation.</p><div className="term-list">{usefulTerms.map((entry) => <article className={`term ${openTerm === entry.term ? "open" : ""}`} key={entry.term}><button onClick={() => setOpenTerm(openTerm === entry.term ? null : entry.term)} type="button" aria-expanded={openTerm === entry.term}><span>{entry.term}</span><i>{openTerm === entry.term ? "−" : "+"}</i></button>{openTerm === entry.term && <TermExplanation entry={entry} />}</article>)}</div></div></section>
          <section className="brief-section intro-section" id="intro"><div className="section-number">05</div><div><h2>A natural introduction</h2><blockquote>“{introduction}”</blockquote><p>Then stop and let them answer.</p><button className="primary" onClick={onLive} type="button">I’m ready <span>Start Live Assist →</span></button></div></section>
        </div>
      </div>
    </section>
  );
}

function LiveScreen({ profile, text, setText, answered, onAnswer, questionIndex, onAnother, insightSaved, setInsightSaved, onWrap }: { profile: ConversationProfile; text: string; setText: (text: string) => void; answered: boolean; onAnswer: () => void; questionIndex: number; onAnother: () => void; insightSaved: boolean; setInsightSaved: (saved: boolean) => void; onWrap: () => void }) {
  const [showTermHelp, setShowTermHelp] = useState(false);
  const [termQuery, setTermQuery] = useState("");
  const [requestedTerm, setRequestedTerm] = useState("");
  const response = getLiveResponse(text);
  const question = response.questions[questionIndex % response.questions.length];
  const detectedTerms = findTermsInText(text);
  const activeTermName = requestedTerm || detectedTerms[0]?.term || "";
  const activeEntry = activeTermName ? explainTerm(activeTermName, text) : null;
  const personLabel = profile.name ? `Live with ${profile.name}` : "Live Assist";
  const submit = (event: FormEvent) => { event.preventDefault(); if (text.trim()) onAnswer(); };
  const submitTerm = (event: FormEvent) => { event.preventDefault(); if (termQuery.trim()) { setRequestedTerm(termQuery.trim()); setShowTermHelp(true); } };

  return (
    <section className="live-page page">
      <div className="live-meta"><span><i className="live-dot" /> {personLabel}</span><button onClick={onWrap} type="button">End conversation</button></div>
      <div className="live-core">
        <div className="eyebrow"><span>03</span> In the moment</div>
        {!answered ? <form className="live-form" onSubmit={submit}><h1>What did they<br />just say?</h1><div className="live-input"><textarea value={text} onChange={(event) => setText(event.target.value)} aria-label="What they just said" placeholder="Type a rough sentence…" autoFocus /><button className="voice-button" type="button" aria-label="Use voice input"><i /></button></div><button className="primary answer-button" type="submit">Help me respond <span>→</span></button><p className="live-hint">A rough sentence is enough.</p></form> : <div className="live-answer"><div className="meaning"><span>What that means</span><p>{response.meaning}</p></div>{detectedTerms.length > 0 && <div className="live-term-picks"><span>Terms mentioned</span><div>{detectedTerms.map((entry) => <button key={entry.term} onClick={() => { setRequestedTerm(entry.term); setShowTermHelp(true); }} type="button">{entry.term}</button>)}</div></div>}<div className="ask-next"><span>Ask next</span><blockquote>“{question}”</blockquote><div className="good-topic"><span>Good topic to explore</span><p>{response.topic}</p></div></div>{showTermHelp && <div className="live-term-panel"><form onSubmit={submitTerm}><label className="sr-only" htmlFor="term-query">Term to explain</label><input id="term-query" value={termQuery} onChange={(event) => setTermQuery(event.target.value)} placeholder="Type a term, e.g. ERP" /><button type="submit">Explain</button></form>{activeEntry ? <TermExplanation entry={activeEntry} dark onClose={() => setShowTermHelp(false)} /> : <p>Type a term for a quick explanation.</p>}</div>}<div className="live-actions"><button onClick={onAnother} type="button"><i>↻</i> Another question</button><button onClick={() => setShowTermHelp(!showTermHelp)} type="button"><i>?</i> Explain a term</button><button className={insightSaved ? "saved" : ""} onClick={() => setInsightSaved(!insightSaved)} type="button"><i>{insightSaved ? "✓" : "+"}</i> {insightSaved ? "Insight saved" : "Save this insight"}</button></div></div>}
      </div>
    </section>
  );
}

function WrapScreen({ profile, notes, setNotes, structured, onStructure, onSave }: { profile: ConversationProfile; notes: string; setNotes: (notes: string) => void; structured: boolean; onStructure: () => void; onSave: () => void }) {
  const person = profile.name || "this person";
  const summaryName = profile.name || "Name not captured";
  const topics = [profile.goal, profile.role, profile.company].filter(Boolean);
  return (
    <section className="wrap-page page">
      <div className="wrap-heading"><div className="eyebrow"><span>04</span> After the conversation</div><h1>What should you<br />remember?</h1><p>Write it as it comes. We’ll give it shape.</p></div>
      <div className="wrap-grid">
        <div><label className="dump-label"><span>Your notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={`What happened in your conversation with ${person}?`} /></label><div className="dump-action"><button className="voice-text" type="button"><i /> Speak instead</button><button className="primary" onClick={onStructure} type="button">{structured ? "Summary ready" : "Structure my notes"}<span>{structured ? "✓" : "→"}</span></button></div></div>
        <div className={`structured ${structured ? "visible" : ""}`} aria-live="polite">{!structured ? <div className="empty-structure"><Mark compact /><p>Your structured memory will appear here.</p></div> : <><h2>Conversation summary</h2><dl><div><dt>Person</dt><dd>{summaryName}{profile.company ? ` · ${profile.company}` : ""}</dd></div><div><dt>Where we met</dt><dd>{profile.event || "Not captured yet"}</dd></div><div><dt>Key topics</dt><dd>{(topics.length ? topics : ["General context"]).map((topic) => <span key={topic}>{topic}</span>)}</dd></div><div><dt>Important insight</dt><dd>{notes || "Add the most useful thing they shared."}</dd></div><div><dt>Potential opportunity</dt><dd>{profile.goal ? `Keep exploring the conversation around ${profile.goal.toLowerCase()}.` : "No opportunity captured yet."}</dd></div><div><dt>People mentioned</dt><dd>None captured yet</dd></div><div><dt>Follow-up</dt><dd>Follow up while the conversation is still fresh.</dd></div><div><dt>Next time</dt><dd>“Has much changed since we last spoke?”</dd></div></dl><button className="primary save-memory" onClick={onSave} type="button">Save to Memory <span>→</span></button></>}</div>
      </div>
    </section>
  );
}

function MemoryScreen({ saved, currentPerson, openPerson }: { saved: boolean; currentPerson: MemoryPerson; openPerson: (person: MemoryPerson) => void }) {
  const list: MemoryPerson[] = saved ? (currentPerson.name === people.alex.name ? [currentPerson, people.sarah, people.daniel] : [currentPerson, people.alex, people.sarah, people.daniel]) : [people.alex, people.sarah, people.daniel];
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
