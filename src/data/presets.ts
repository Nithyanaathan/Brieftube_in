import { VideoData, VideoSummaryResult } from '../types/index.ts';

export const PRESET_VIDEOS: VideoData[] = [
  {
    id: 'agentic-ai-andrew-ng',
    youtubeId: 'sal78ACtGTc',
    title: 'Building Agentic AI Workflows: Why Loops Outperform Single Prompts',
    channel: 'DeepLearning.AI · Andrew Ng',
    durationSeconds: 2880,
    durationFormatted: '48:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
    segments: [
      {
        id: 'seg-1',
        startTime: 0,
        endTime: 420,
        timestamp: '00:00',
        title: 'The Shift from Zero-Shot to Agentic Reasoning',
        description: 'Why asking an LLM to generate everything in one shot limits reasoning capability compared to an iterative loop.'
      },
      {
        id: 'seg-2',
        startTime: 420,
        endTime: 1140,
        timestamp: '07:00',
        title: 'Core Design Pattern 1: Reflection & Self-Correction',
        description: 'How giving an agent code execution feedback or self-critique loops dramatically raises task completion benchmarks.'
      },
      {
        id: 'seg-3',
        startTime: 1140,
        endTime: 1980,
        timestamp: '19:00',
        title: 'Core Design Pattern 2: Tool Use & Environment Grounding',
        description: 'Connecting LLMs to web search, SQL execution, and calculator APIs to overcome training cutoff dates and hallucinations.'
      },
      {
        id: 'seg-4',
        startTime: 1980,
        endTime: 2880,
        timestamp: '33:00',
        title: 'Core Design Pattern 3 & 4: Planning & Multi-Agent Collaboration',
        description: 'Autonomous decomposition of complex objectives and assigning specialized agent roles (Coder, Reviewer, Tester).'
      }
    ],
    transcript: `00:00 Welcome everyone. Today I want to share a major shift happening in artificial intelligence that will change how we build applications.
00:15 For the past two years, most people have used large language models in a zero-shot fashion: you type a prompt, hit enter, and the model attempts to generate an entire essay, code file, or analysis in a single pass.
00:42 Think about how human knowledge workers write. If I asked an author to sit down and write a complete research paper from start to finish without ever touching the backspace key, without re-reading the draft, and without doing revisions, the quality would be mediocre.
01:15 Yet, that is exactly what we have been forcing LLMs to do in zero-shot mode.
02:00 In an agentic workflow, instead of a single prompt-response cycle, we wrap the model in an iterative loop. The agent can draft an outline, inspect external data, critique its draft, run unit tests, and iteratively revise until quality criteria are met.
03:30 Recent research has demonstrated that an older, smaller model like GPT-3.5 running inside an agentic reflection loop can actually outperform a much larger model like GPT-4 evaluated in zero-shot mode on coding benchmarks like HumanEval.
07:00 Let us explore the first core design pattern: Reflection.
07:30 In Reflection, we prompt the model to generate an initial solution, for instance a Python function. Then, in the next turn of the loop, we feed that function back to the model or a second reviewer prompt, asking: 'Critique this code for edge cases, algorithmic time complexity, and syntax errors.'
08:45 The model responds with concrete critique notes: 'You forgot to check if the input array is empty, and division by zero could occur on line 14.'
09:50 The agent then updates the code using its own critique. This single extra loop frequently eliminates 40% to 60% of common bugs without human intervention.
11:40 The second core design pattern is Tool Use.
12:15 Language models are closed-world probabilistic systems. If you ask a model: 'What is the stock price of Apple right now?', or 'Calculate 4,892,112 divided by 3.14159', asking it to hallucinate the answer from token probabilities is an anti-pattern.
13:10 By giving the model access to structured tools—such as an HTTP client, a code interpreter, or a SQL connector—the model emits a structured function call: 'call_calculator(numerator, denominator)'.
14:40 The environment runs the tool and passes the ground truth result back to the LLM. Now the model reasons on verified facts rather than internal statistical guesswork.
19:00 Now let us examine Pattern 3: Planning.
19:45 When a user presents a high-level task such as: 'Analyze our top 5 competitors, extract their pricing models, and plot a chart comparing their feature sets', a single prompt fails because the scope is too broad.
20:30 An agent with planning capabilities breaks this goal down into a Directed Acyclic Graph (DAG) or sequence of subtasks: Step 1, identify competitors; Step 2, run web search queries for each; Step 3, parse the pricing tables; Step 4, synthesize and render chart.
22:10 If Step 2 fails because a webpage blocked the scraper, the planning module can dynamically reroute and try an alternate source rather than abandoning the mission.
33:00 Finally, Pattern 4: Multi-Agent Collaboration.
33:45 In multi-agent systems, we instantiate multiple instances of LLMs, each provided with distinct personas and system instructions: one as a Software Architect, one as a Python Engineer, and one as a QA Test Engineer.
35:10 They communicate through shared conversational state. The coder submits a pull request; the QA engineer writes test cases and runs them; if tests fail, feedback is provided to the coder.
37:20 This separation of concerns prevents prompt bloat and prevents the model from losing attention across competing objectives.
42:00 In summary, the future of AI engineering is moving from static prompting to architecting iterative agentic loops. As models get faster and token costs drop, multi-turn reasoning will become the standard architecture.`
  },
  {
    id: 'neural-networks-karpathy',
    youtubeId: 'VMj-t7g1l30',
    title: 'Neural Networks & Backpropagation: Mathematical Intuition from Scratch',
    channel: 'Andrej Karpathy · Deep Learning',
    durationSeconds: 3720,
    durationFormatted: '01:02:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60',
    segments: [
      {
        id: 'nn-seg-1',
        startTime: 0,
        endTime: 780,
        timestamp: '00:00',
        title: 'Building a Micro-Grad Engine: Computational Graphs',
        description: 'Tracking forward values and local derivative closures across scalar mathematical operations.'
      },
      {
        id: 'nn-seg-2',
        startTime: 780,
        endTime: 1680,
        timestamp: '13:00',
        title: 'The Chain Rule: Recursive Gradient Propagation',
        description: 'How calculus chain rule allows the loss gradient at the final output to flow backwards into every weight and bias.'
      },
      {
        id: 'nn-seg-3',
        startTime: 1680,
        endTime: 2700,
        timestamp: '28:00',
        title: 'Loss Functions and Gradient Descent Optimization',
        description: 'Navigating high-dimensional loss landscapes and updating weights via negative gradient steps.'
      },
      {
        id: 'nn-seg-4',
        startTime: 2700,
        endTime: 3720,
        timestamp: '45:00',
        title: 'Activation Non-Linearities & Vanishing Gradients',
        description: 'Why linear layers collapse without non-linear activations (ReLU, GeLU, Tanh) and how gradients can vanish.'
      }
    ],
    transcript: `00:00 In this deep dive, we are going to build a neural network training engine completely from scratch with zero third-party magic.
01:10 At its heart, a neural network is nothing more than a large mathematical expression with millions of adjustable parameters called weights.
02:30 To understand backpropagation, we first create a small class called Value that stores a scalar number and knows which other Values created it.
04:00 When we do a plus b equals c, c remembers its children: a and b. This builds a directed acyclic computational graph.
13:00 Now comes the core mechanism: Backpropagation.
14:15 The chain rule of calculus tells us: if variable z depends on y, and y depends on x, then the derivative dz/dx is simply (dz/dy) multiplied by (dy/dx).
16:00 When we compute a loss function—measuring how wrong our network's predictions are compared to real targets—we set the loss gradient to 1.0.
17:40 Then we traverse backwards through the graph in reverse topological order, calling each node's local backward derivative function.
28:00 Once every parameter has its calculated gradient, we perform Gradient Descent.
29:30 We simply nudge every weight in the opposite direction of the gradient: weight = weight - (learning_rate * weight.grad).
32:00 Imagine walking down a foggy mountain slope blindfolded. You feel the slope under your boots with your feet; that slope is the gradient. Stepping downhill reduces your altitude, which is your loss.
45:00 Why do we need activation functions like ReLU?
47:00 If you chain ten linear matrix multiplications in a row: W3 * (W2 * (W1 * x)), that entire chain collapses mathematically into a single linear transformation W_total * x.
49:30 Without non-linear activations like ReLU or Sigmoid, a deep 100-layer neural network has the exact same representational power as a simple 1-layer linear regression.
55:00 Activations give the network the ability to bend, fold, and carve out complex decision boundaries in high-dimensional space.`
  },
  {
    id: 'focus-protocols-huberman',
    youtubeId: 'LG53Vxum0as',
    title: 'Science-Based Protocols for Laser Focus & Sustained Mental Stamina',
    channel: 'Huberman Lab · Dr. Andrew Huberman',
    durationSeconds: 5100,
    durationFormatted: '01:25:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60',
    segments: [
      {
        id: 'hub-seg-1',
        startTime: 0,
        endTime: 1200,
        timestamp: '00:00',
        title: 'The Neurobiology of Focus: Acetylcholine, Epinephrine & Dopamine',
        description: 'How three distinct neuromodulators coordinate alertness, selective spotlight attention, and motivation.'
      },
      {
        id: 'hub-seg-2',
        startTime: 1200,
        endTime: 2700,
        timestamp: '20:00',
        title: 'The 90-Minute Ultradian Focus Bout Protocol',
        description: 'Aligning cognitive work sessions with natural biological oscillation cycles for peak retention.'
      },
      {
        id: 'hub-seg-3',
        startTime: 2700,
        endTime: 3900,
        timestamp: '45:00',
        title: 'Visual Focus as an Anchor for Cognitive Focus',
        description: 'Using the optic-foveal convergence reflex to trigger mental concentration within seconds.'
      },
      {
        id: 'hub-seg-4',
        startTime: 3900,
        endTime: 5100,
        timestamp: '01:05:00',
        title: 'The Non-Sleep Deep Rest (NSDR) Recovery Mechanism',
        description: 'Accelerating neuroplastic consolidation and dopamine recovery through 10-20 minute somatic resets.'
      }
    ],
    transcript: `00:00 Today we are discussing actionable, science-supported mechanisms to enhance focus, deepen concentration, and combat mental fatigue.
01:30 Focus is not a mysterious personality trait; it is a tripartite chemical state driven by Epinephrine, Acetylcholine, and Dopamine.
03:00 Epinephrine (adrenaline in the brain) provides energy and overall alertness. Acetylcholine acts like a high-intensity spotlight, highlighting the exact sensory neurons you need to pay attention to.
05:15 Dopamine maintains the motivation and momentum to keep that spotlight engaged over time.
20:00 Our brains and bodies operate on 90-minute ultradian cycles throughout both waking and sleep hours.
22:30 When sitting down to do deep work, the ideal focus bout is approximately 90 minutes.
24:00 Expect the first 5 to 10 minutes to feel like friction. Many people interpret this initial resistance as a sign they 'can't focus today'. In reality, that friction is the physiological buildup of epinephrine necessary to narrow the neural spotlight.
45:00 There is a direct biological coupling between where your eyes look and how your brain concentrates.
47:20 The fovea of the eye has high acuity. When you restrict your visual field—for example, by looking at a single crosshair or monitor area without moving your gaze for 60 seconds—your brainstem automatically increases acetylcholine release in visual cortex.
65:00 What you do *after* a bout of intense focus determines how much learning is actually retained.
67:30 During focus, you trigger neuroplastic markers, but the physical rewiring of neural synapses only happens in deep sleep and states of Non-Sleep Deep Rest (NSDR).
70:00 Taking a 10 to 20 minute NSDR or yoga nidra session right after a 90-minute work sprint restores striatal dopamine levels and speeds up cognitive consolidation by up to 50%.`
  }
];

export const INITIAL_PRESET_SUMMARY: VideoSummaryResult = {
  videoId: 'agentic-ai-andrew-ng',
  videoTitle: 'Building Agentic AI Workflows: Why Loops Outperform Single Prompts',
  readingTimeMinutes: 3,
  timeSavedMinutes: 45,
  comprehensionLevel: 'student',
  generatedAt: new Date().toISOString(),
  executiveSummary: [
    'Traditional LLM prompting relies on one-shot generation, which limits reasoning quality the same way forcing a human to write a final draft without re-reading or revising would.',
    'Agentic workflows replace single prompts with iterative loops, combining self-reflection, external tools, task planning, and specialized multi-agent roles.',
    'Benchmark tests show that older, smaller models inside an agentic reflection loop can outperform much larger frontier models operating in zero-shot mode.'
  ],
  keyConcepts: [
    {
      term: 'Agentic Workflow',
      definition: 'A system where an AI model executes multi-step iterative loops (drafting, evaluating, revising) rather than answering in a single pass.',
      simpleAnalogy: 'Like an author writing an outline, drafting chapters, getting peer edits, and revising before publication.'
    },
    {
      term: 'Reflection Pattern',
      definition: 'An architectural pattern where a model evaluates its own previous output for bugs or logical errors and rewrites it based on that critique.',
      simpleAnalogy: 'Like double-checking your math homework before handing it in to the teacher.'
    },
    {
      term: 'Grounding via Tool Use',
      definition: 'Equipping an LLM with APIs (search engines, calculators, database connectors) so it reasons over verifiable facts rather than guessing.',
      simpleAnalogy: 'Giving an accountant a calculator and ledger rather than asking them to guess numbers from memory.'
    }
  ],
  segmentSummaries: [
    {
      segmentId: 'seg-1',
      timestamp: '00:00',
      title: 'The Shift from Zero-Shot to Agentic Reasoning',
      bullets: [
        'Zero-shot prompting forces models to write flawless answers on the first try without revision.',
        'Human knowledge work relies inherently on drafts, feedback, and redrafts.',
        'Iterative agent loops enable smaller models (e.g. GPT-3.5) to beat larger models (GPT-4) on coding benchmarks like HumanEval.'
      ],
      plainEnglishExplanation: 'Instead of expecting genius on the first breath, give the AI a chance to think, review its work, and fix its mistakes.',
      keyTakeaway: 'Iterative revision loops beat bigger single-pass models on complex problem solving.'
    },
    {
      segmentId: 'seg-2',
      timestamp: '07:00',
      title: 'Core Design Pattern 1: Reflection & Self-Correction',
      bullets: [
        'Reflection loop: Generator creates initial code -> Evaluator checks for edge cases and errors -> Generator refines.',
        'Eliminates 40% to 60% of common software bugs autonomously.',
        'Can use the same model in different roles (Author vs Reviewer) or automated unit test runners.'
      ],
      plainEnglishExplanation: 'The AI acts as both writer and editor, spotting its own blind spots before showing you the result.',
      keyTakeaway: 'Always add a self-critique turn before outputting code or analytical summaries.'
    },
    {
      segmentId: 'seg-3',
      timestamp: '19:00',
      title: 'Core Design Pattern 2: Tool Use & Environment Grounding',
      bullets: [
        'LLMs are closed-world probabilistic systems prone to math errors and outdated facts.',
        'Tool use lets the model emit structured JSON to invoke APIs, web search, or Python shells.',
        'The model interprets real returned data rather than generating speculative predictions.'
      ],
      plainEnglishExplanation: 'Instead of letting the AI guess facts it cannot know, give it a web browser or calculator to check the answer.',
      keyTakeaway: 'Connect LLMs to real-time tools for math, search, and database queries.'
    },
    {
      segmentId: 'seg-4',
      timestamp: '33:00',
      title: 'Core Design Pattern 3 & 4: Planning & Multi-Agent Collaboration',
      bullets: [
        'Planning breaks complex prompts into a sequence of subtasks (Directed Acyclic Graphs).',
        'Dynamic error recovery allows agents to reroute when individual subtasks fail.',
        'Multi-agent separation of concerns divides tasks between Architect, Coder, and QA Tester.'
      ],
      plainEnglishExplanation: 'Big projects need a project plan and a specialized team rather than one overwhelmed generalist.',
      keyTakeaway: 'Deconstruct massive goals into discrete steps and assign clear persona boundaries.'
    }
  ],
  actionableChecklist: [
    'Audit current LLM prompts: identify where you are asking for complete answers in one shot.',
    'Implement a 2-step reflection loop (Generate -> Critique -> Revise) for high-stakes workflows.',
    'Equip models with deterministic tools for calculations and live web data retrieval.',
    'Split large multi-disciplinary tasks into distinct agent roles with clear interfaces.'
  ]
};
