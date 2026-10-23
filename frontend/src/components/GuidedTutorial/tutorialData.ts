import { TutorialLesson } from '../../types';

export const TUTORIAL_LESSONS: TutorialLesson[] = [
  // -------------------------------------------------------------
  // MODULE 1: FOUNDATIONS
  // -------------------------------------------------------------
  {
    id: 1,
    title: 'Lesson 1: Anatomy of Classical State-Space Search & Formal Problem Formulation',
    module: 'Foundations',
    moduleLabel: 'Module 1: Foundations',
    badge: 'Foundations & Math',
    estMinutes: 6,
    complexity: {
      time: 'Domain-dependent O(b^d)',
      space: 'Domain-dependent O(b^d)',
      completeness: 'System-dependent',
      optimality: 'System-dependent',
    },
    formalDefinition: {
      math: 'P = \\langle S_0, \\text{Actions}(s), \\text{Result}(s,a), \\text{GoalTest}(s), c(s,a,s\') \\rangle',
      description:
        'A formal search problem is defined by a 5-tuple: Initial state S_0, action space Actions(s), transition model Result(s,a), goal test GoalTest(s), and path cost function c(s,a,s\').',
    },
    concept:
      'In classical artificial intelligence, intelligent agency is formulated as problem-solving through state-space search. A state is an environmental snapshot, while a search node is a computational bookkeeping construct carrying path history.',
    inDepthExplanation: [
      'The State Space represents the set of all valid configurations an agent can occupy. In grid mazes, a state is simply a coordinate (row, col). In real-world robotics, a state comprises joint angles and velocities.',
      'A Search Node is fundamentally distinct from a State: a node contains the state, a pointer to its Parent node, the Action taken to reach it, the cumulative path cost g(n), and depth d(n).',
      'The State Space Graph is fixed by the problem definition, whereas the Search Tree is generated dynamically during exploration. If loops exist in the state space, a finite graph produces an infinitely deep search tree unless cycle prevention is enforced.',
      'The Solution is an action sequence that transitions the agent from the initial state S_0 to a state satisfying GoalTest(s). The optimal solution achieves this with minimum total cost sum(c(s_i, a_i, s_{i+1})).',
    ],
    keyTeachingPoints: [
      'State vs Node Dichotomy: A state is the physical configuration of the world; a search node is an in-memory computational node carrying path history (parent, action, cost g, depth d). Two distinct nodes can hold identical states.',
      'Explicit Graph vs Implicit Search Tree: The environment defines an implicit state graph G=(V,E). The search algorithm dynamically instantiates a search tree T rooted at S_0, where paths represent candidate action sequences.',
      'Branching Factor (b) & Search Horizon (d): The maximum number of valid successor actions from any state is the branching factor b. Search spaces grow exponentially as b^d.',
      'Solution Path Extraction: When GoalTest succeeds, the agent traces parent pointers backward from Goal to S_0 and reverses the list to form the plan.',
    ],
    mathematicalDerivation: {
      title: 'Formal Problem Formulation & State-Space Expansion Bound',
      steps: [
        'Let |S| be the total number of valid environmental configurations.',
        'At depth 0, the root node S_0 is generated (1 node).',
        'At depth 1, at most b child nodes are generated.',
        'At depth d, at most b^d nodes are generated.',
        'Total search tree nodes up to depth d: N = sum_{i=0}^{d} b^i = (b^{d+1} - 1) / (b - 1) = O(b^d).',
      ],
      conclusion: 'Without heuristic pruning or cycle detection, search complexity scales strictly exponentially O(b^d).',
    },
    industrialApplications: [
      'Autonomous Driving (Waymo / Tesla): State space represents vehicle pose (x, y, theta, velocity, steering angle).',
      'Robotics Manipulation: Inverse kinematics planning where states represent arm joint angles and obstacles represent workspace collisions.',
      'Electronic Design Automation (EDA / VLSI): Microchip wire layout routing across silicon layers formulated as state-space grid search.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: The professor will ask: "If a maze has only 50 cells, why does a naive search algorithm sometimes take millions of steps or crash with out-of-memory?" Answer: Because in a cyclic graph, Tree Search produces an infinite search tree without closed-set cycle checking.',
    traceExample: {
      description: 'Initial expansion of start node (1,1) in a grid maze with unit step costs:',
      steps: [
        {
          step: 0,
          node: '(1,1)',
          action: 'Start',
          g: 0,
          h: 12,
          f: 12,
          frontier: '[(1,1)]',
          explored: '{}',
          comment: 'Initial state wrapped in node. g=0, h estimated to goal.',
        },
        {
          step: 1,
          node: '(1,1)',
          action: 'Expand',
          g: 0,
          h: 12,
          f: 12,
          frontier: '[(1,2), (2,1)]',
          explored: '{(1,1)}',
          comment: 'Node (1,1) expanded into valid unblocked neighbors (East, South).',
        },
        {
          step: 2,
          node: '(1,2)',
          action: 'Visit',
          g: 1,
          h: 11,
          f: 12,
          frontier: '[(2,1), (1,3)]',
          explored: '{(1,1), (1,2)}',
          comment: 'Popped next candidate. Parent pointer set to (1,1).',
        },
      ],
    },
    pitfalls: [
      {
        misconception: 'Confusing a "state" with a "search node".',
        correction:
          'A state is a physical configuration (e.g. coordinates); a search node is an in-memory data structure containing state, parent reference, action, path cost g, and depth.',
      },
      {
        misconception: 'Believing the search tree and state space graph are identical.',
        correction:
          'A state space graph with cycles can yield an infinite search tree unless explored states are tracked with a closed set.',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'bfs',
    actionText: 'Load Classic Labyrinth with BFS',
    vivaQuestions: [
      {
        question: "What is the precise architectural difference between a State and a Search Node?",
        answer: "A state represents a physical configuration in the world (e.g. coordinates (row,col)). A search node is a bookkeeping data structure instantiated by the search algorithm containing: state, parent pointer, incoming action, path cost g(n), and depth d(n). Two distinct nodes can contain the exact same state reached via different paths.",
        examinerTip: "Faculty frequently ask this in viva to test if students distinguish world domain models from in-memory algorithm bookkeeping.",
      },
      {
        question: "Why can a finite state space result in an infinite search tree?",
        answer: "If the state space has reversible actions or cycles (e.g., A -> B -> A), a Tree Search algorithm without cycle detection will continuously oscillate back and forth, generating infinite duplicate tree nodes across ever-increasing depths.",
        examinerTip: "Emphasize the role of the Closed / Explored set in Graph Search to enforce cycle prevention.",
      },
      {
        question: "Explain the formal 5-tuple required to mathematically formulate any classical search problem.",
        answer: "A classical search problem is formally defined as P = <S_0, Actions(s), Result(s,a), GoalTest(s), c(s,a,s')>, where S_0 is the initial state, Actions(s) is the set of legal moves from s, Result(s,a) is the state transition model, GoalTest(s) determines if state s is a goal, and c(s,a,s') is the step cost function.",
        examinerTip: "Write out the 5-tuple on paper or blackboard during viva; examiners award full marks for standard Russell & Norvig notation.",
      },
      {
        question: "What is the distinction between Branching Factor b and Effective Branching Factor b*?",
        answer: "Branching factor b is the maximum or average number of successors generated by any state. Effective branching factor b* is the branching factor a uniform tree of depth d would need to generate N total nodes: N + 1 = 1 + b* + (b*)^2 + ... + (b*)^d. A good heuristic brings b* close to 1.",
        examinerTip: "Mention that b* is an empirical measure of heuristic quality; if b* drops from 3.5 to 1.2, search is exponentially faster.",
      }
    ],
    quiz: {
      question: 'Which of the following elements is contained in a Search Node but NOT in a world State?',
      options: [
        'Agent coordinate position',
        'Parent pointer and cumulative path cost g(n)',
        'List of obstacles',
        'Goal condition definition',
      ],
      correctIndex: 1,
      explanation:
        'Correct! A Search Node is an algorithmic bookkeeping container storing the parent pointer, action history, and path cost g(n), whereas a State only encapsulates environmental parameters.',
    },
  },

  {
    id: 2,
    title: 'Lesson 2: Graph Search vs Tree Search & Cycle Prevention Mechanics',
    module: 'Foundations',
    moduleLabel: 'Module 1: Foundations',
    badge: 'Core Architecture',
    estMinutes: 6,
    complexity: {
      time: 'Graph: O(|V| + |E|), Tree: O(b^d)',
      space: 'Graph: O(|V|), Tree: O(bm) linear',
      completeness: 'Graph: Complete; Tree: Incomplete on cycles',
      optimality: 'Dependent on cost metric',
    },
    formalDefinition: {
      math: '\\text{Closed} = \\{s \\in S \\mid \\text{Expanded}(s) = \\text{true}\\}',
      description:
        'Graph search maintains an Explored Set (Closed List) of all states previously popped and expanded, ensuring no state is expanded more than once.',
    },
    concept:
      'Tree Search ignores visited history, risking infinite recursion in cyclical domains. Graph Search augments the frontier with an Explored Set (Closed List) to guarantee that every reachable state is expanded at most once.',
    inDepthExplanation: [
      'In a grid or graph with cycles, any move can be undone (e.g. Right followed by Left). Tree search creates a new child node for every transition, duplicating subtrees exponentially.',
      'Graph Search maintains two core collections: the Frontier (Open Set) holding discovered candidates, and the Explored Set (Closed List) holding states whose neighbors have already been generated.',
      'When expanding node n, each child is checked: if child.state is already in Explored or Frontier with a lower cost, it is discarded. This guarantees cycle-free traversal.',
      'The space trade-off: Graph Search must retain all explored states in RAM (space complexity O(|V|)), whereas Tree-Search variants like DFS can operate in linear space O(bm) if cycles do not occur.',
    ],
    keyTeachingPoints: [
      'Cycle Prevention Invariant: Every state s in the Closed Set is guaranteed to have already been expanded; no child with state s will ever be re-expanded (under consistent heuristics).',
      'The Memory vs Completeness Trade-Off: Tree search requires only O(b*m) memory because it discards visited paths, but risks infinite loops. Graph search guarantees cycle-free termination at the cost of O(|V|) RAM.',
      'Undirected Graphs Guarantee Cycles: In any 2D grid where an agent can move North and South, 2-step cycles exist between adjacent cells (N -> S -> N).',
    ],
    mathematicalDerivation: {
      title: 'Closed-Set Invariant & Upper Bound on Graph Search',
      steps: [
        'Let G=(V,E) be a finite state space graph.',
        'In Graph Search, a state s is inserted into Closed immediately upon being popped from Frontier.',
        'Successor generation checks: if child.state in Closed, prune child.',
        'Since |V| is finite, at most |V| nodes can ever be placed into Closed.',
        'At each node, at most deg(v) outgoing edges are evaluated.',
        'Total operations: sum_{v in V} deg(v) = 2|E|.',
      ],
      conclusion: 'Graph Search is guaranteed to terminate in O(|V| + |E|) steps on finite state spaces.',
    },
    industrialApplications: [
      'Internet Router Routing Tables (OSPF / BGP): Loop-free routing guarantees using Dijkstra graph search with closed lists.',
      'Game AI (Unreal Engine NavMesh): Avoiding navigation bots running in infinite circular loops between waypoints.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Can an algorithm with a closed list still loop infinitely?" Answer: Yes, if the state space has infinite states (e.g. continuous real numbers or unrounded floating-point coordinates).',
    pitfalls: [
      {
        misconception: 'Assuming cycle checking is only needed for directed graphs with explicit loops.',
        correction:
          'Any undirected graph or grid with bidirectional movement contains trivial 2-step cycles (Right, Left). Without cycle checking, Tree Search will immediately loop forever.',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'bfs',
    actionText: 'Observe Cycle-Free BFS Wavefront',
    vivaQuestions: [
      {
        question: "Under what circumstances would an engineer choose Tree Search over Graph Search?",
        answer: "When memory is strictly constrained and the state space is known to be a directed acyclic graph (DAG) or tree where cycles are physically impossible, Tree Search saves the memory required to store the Closed List (saving O(|V|) RAM).",
        examinerTip: "Mention games like Tic-Tac-Toe or chess where transposition tables act as partial closed lists.",
      },
      {
        question: "Why does Tree Search fail completely on an undirected 2D grid maze without cycle checking?",
        answer: "Because undirected grids allow bidirectional movement between adjacent cells (e.g., cell A moves right to B, and B moves left to A). Tree Search generates A -> B -> A -> B... in an infinite oscillation, resulting in stack or heap overflow.",
        examinerTip: "Point out that any reversible 2-step action forms a loop of length 2.",
      },
      {
        question: "What data structure must be used for the Closed Set to guarantee O(1) membership testing?",
        answer: "A Hash Set (or Hash Table / Bloom filter) with an efficient hashing function for state coordinates. Using an array or linked list degrades membership testing to O(|V|), increasing total algorithm complexity from O(|V| + |E|) to O(|V|^2).",
        examinerTip: "Examiners appreciate candidates who highlight the importance of immutable hashable state representations.",
      },
      {
        question: "Can an algorithm equipped with a Closed List still loop infinitely? Give a concrete example.",
        answer: "Yes! If the state space contains an infinite number of distinct states (e.g., continuous coordinates, real numbers without discretization, or unbounded integer counters), a closed list grows indefinitely without ever terminating or encountering duplicate states.",
        examinerTip: "Explain that the closed list only prevents revisiting the *same* discrete state, not traversing infinite new states.",
      }
    ],
    quiz: {
      question: 'What is the primary failure mode of Tree Search on an undirected cyclic graph?',
      options: [
        'It terminates immediately with null',
        'It gets stuck in an infinite cycle generating redundant nodes',
        'It always overestimates the heuristic',
        'It violates admissibility',
      ],
      correctIndex: 1,
      explanation:
        'Correct! Because undirected graphs have reversible edges, Tree Search repeatedly cycles between states (e.g., A -> B -> A), causing infinite loops and stack/heap exhaustion.',
    },
  },

  {
    id: 3,
    title: 'Lesson 3: Frontier Data Structures & Expansion vs Generation Invariant',
    module: 'Foundations',
    moduleLabel: 'Module 1: Foundations',
    badge: 'Data Structures',
    estMinutes: 5,
    complexity: {
      time: 'Queue/Stack: O(1); Heap: O(log N)',
      space: 'Max frontier size = Peak RAM',
      completeness: 'Complete with cycle check',
      optimality: 'Determined by queue ordering',
    },
    formalDefinition: {
      math: '\\text{Frontier} = \\{n \\in \\text{Nodes} \\mid \\text{Generated}(n) \\land \\neg\\text{Expanded}(n)\\}',
      description: 'The Frontier (Open Set) separates the explored interior of the state space from the unexplored wilderness.',
    },
    concept:
      'The difference between search algorithms reduces fundamentally to how the Frontier is ordered: FIFO yields BFS, LIFO yields DFS, Priority by g(n) yields UCS, Priority by h(n) yields Greedy, and Priority by g+h yields A*.',
    inDepthExplanation: [
      'Node Generation occurs when an unvisited neighbor is instantiated and placed into the Frontier. Node Expansion occurs when a node is removed from the Frontier to evaluate its successors.',
      'FIFO Queue (First-In, First-Out): Nodes expanded in exact order of discovery. Results in Breadth-First Search.',
      'LIFO Stack (Last-In, First-Out): Most recently discovered node expanded first. Results in Depth-First Search.',
      'Min-Priority Queue: Nodes ordered by an evaluation function f(n). UCS orders by f=g, Greedy by f=h, and A* by f=g+h.',
      'The peak memory footprint of any search algorithm is governed by the Maximum Frontier Size during its lifetime.',
    ],
    keyTeachingPoints: [
      'Expansion vs Generation: A node is generated the moment its parent creates it and puts it into the Frontier. It is expanded ONLY when it is popped from the Frontier and its own children are generated.',
      'Peak Memory Bottleneck: Time complexity is governed by total nodes expanded. Space complexity is governed by the peak size of the Frontier plus Closed Set.',
      'Priority Queue Complexity: Min-heaps provide O(log N) insertion and extraction. Using Fibonacci heaps improves decrease-key to amortized O(1).',
    ],
    mathematicalDerivation: {
      title: 'Frontier Surface Area Invariant in d-Dimensional Grids',
      steps: [
        'In a 2D Euclidean grid with radius r, the interior explored area grows as Area ~ pi * r^2.',
        'The Frontier represents the boundary perimeter of the wave: Perimeter ~ 2 * pi * r.',
        'In a tree with branching factor b, the leaf tier contains b^d nodes, while all prior tiers sum to (b^d - 1)/(b - 1).',
        'Thus, the Frontier contains approx (b - 1)/b = ~75% (for b=4) of ALL nodes ever generated in memory simultaneously.',
      ],
      conclusion: 'The Frontier holds the vast majority of all memory allocation during search execution.',
    },
    industrialApplications: [
      'Memory Profiling in Game Engines: Tuning heap allocators to prevent garbage-collection pauses during pathfinding in high-FPS games.',
      'Embedded Microcontrollers: Hard limits on heap memory dictate using iterative deepening or bounded priority queues.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "If an algorithm expanded 100 nodes, did it generate 100 nodes?" Answer: No! It generated many more (e.g. 300-400 in a grid). Generated nodes >= Expanded nodes always.',
    pitfalls: [
      {
        misconception: 'Equating "nodes generated" with "nodes expanded".',
        correction:
          'Generated nodes are all candidates pushed to the frontier; expanded nodes are only those pulled off the frontier whose children are generated. Generated >= Expanded always.',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'bfs',
    actionText: 'Inspect Frontier Growth in Labyrinth',
    vivaQuestions: [
      {
        question: "How does the maximum frontier size relate to the physical memory footprint of an algorithm?",
        answer: "The maximum frontier size represents the peak count of active candidate nodes stored in memory simultaneously. In BFS, this reaches O(b^d), which is why BFS exhausts RAM long before CPU time.",
        examinerTip: "Distinguish between time complexity (total expansions) and spatial complexity (peak frontier + closed list).",
      },
      {
        question: "Explain the critical algorithmic difference between \"generating\" a node versus \"expanding\" a node.",
        answer: "A node is GENERATED when its parent creates it and inserts it into the Frontier (Open List). A node is EXPANDED when it is popped from the Frontier and its own outgoing legal actions are evaluated to generate its successors. Total generated nodes is always >= expanded nodes.",
        examinerTip: "A classic viva trick question: If an algorithm expanded 100 nodes, did it generate 100 nodes? Always answer: No, it generated far more (approx b * 100).",
      },
      {
        question: "Why is Decrease-Key computationally expensive in binary heaps, and how does standard A* implement it?",
        answer: "Standard binary heaps do not maintain an inverted index from state to heap index, making Decrease-Key an O(N) linear scan. Production A* implementations use \"lazy deletion\": they push the new (lower-cost) node directly into the heap and ignore the older duplicate when popped later.",
        examinerTip: "Highlight that lazy duplicate insertion adds minor space overhead but preserves O(log N) operations.",
      },
      {
        question: "Why does the Frontier contain the vast majority of all memory allocation during search?",
        answer: "In a search tree with branching factor b, the leaf tier contains b^d nodes, while all prior tiers sum to (b^d - 1)/(b - 1). Therefore, approximately (b - 1)/b (e.g. ~75% for b=4, or ~90% for b=10) of all nodes generated reside on the frontier at peak depth.",
        examinerTip: "Write out the geometric series sum during viva to demonstrate mathematical precision.",
      }
    ],
    quiz: {
      question: 'Which frontier data structure transforms general best-first search into Breadth-First Search (BFS)?',
      options: ['Min-Priority Heap ordered by f(n)', 'LIFO Stack', 'FIFO Queue', 'Disjoint Set Union'],
      correctIndex: 2,
      explanation:
        'Correct! A First-In, First-Out (FIFO) queue guarantees that all nodes at depth d are expanded before any node at depth d+1, producing BFS.',
    },
  },

  // -------------------------------------------------------------
  // MODULE 2: UNINFORMED (BLIND) SEARCH
  // -------------------------------------------------------------
  {
    id: 4,
    title: 'Lesson 4: Breadth-First Search (BFS) — Uniform Hops & Exponential Memory Explosion',
    module: 'Uninformed',
    moduleLabel: 'Module 2: Blind Search',
    badge: 'Uninformed Classic',
    estMinutes: 7,
    complexity: {
      time: 'O(b^d) exponential',
      space: 'O(b^d) exponential RAM bottleneck',
      completeness: 'Complete on finite b',
      optimality: 'Optimal if and only if step costs are equal',
    },
    formalDefinition: {
      math: '\\text{Depth}(n) = \\text{Depth}(\\text{parent}) + 1, \\quad \\text{Frontier} = \\text{FIFO Queue}',
      description: 'Expands shallowest unexpanded nodes first, sweeping concentric wavefronts outward from the root.',
    },
    concept:
      'BFS explores all states at depth d before moving to depth d+1. It guarantees the minimum number of transitions to reach the goal, but its O(b^d) spatial complexity causes memory exhaustion on moderate problem depths.',
    inDepthExplanation: [
      'Mechanism: The root is inserted into a FIFO queue. In each cycle, the head is popped, checked against the goal, and its unvisited successors are enqueued.',
      'Goal Test Optimization: For unit-cost problems, the goal test can be performed at node generation time rather than expansion time, saving one full level of frontier expansion.',
      'Optimality Condition: BFS is strictly optimal for unit step costs (c=1). If costs vary (e.g. mud swamp with cost 4.5), BFS finds the path with fewest hops, NOT the path with lowest total cost.',
      'The Memory Crisis: At depth d=10 with branching factor b=4, BFS holds 4^10 approx 1,048,576 nodes in memory. Memory limits are invariably exceeded before computation time.',
    ],
    keyTeachingPoints: [
      'Hop Optimality vs Cost Optimality: BFS minimizes edge count (transitions), NOT cumulative cost. If edge weights are non-uniform, BFS is provably suboptimal.',
      'Wavefront Symmetry: BFS expands in spherical concentric circles. In an open grid, it inspects every cell in radius d, regardless of goal orientation.',
      'Early Goal Testing: Because all step costs are equal, the first time the goal is GENERATED, no ungenerated path can have fewer hops, so the goal test can be executed on generation.',
    ],
    mathematicalDerivation: {
      title: 'BFS Memory Explosion Proof & The 1-Level Generation Optimization',
      steps: [
        'Suppose goal is at depth d with branching factor b.',
        'With expansion goal-testing: all nodes up to depth d are expanded, and all children at depth d+1 are generated: Total = 1 + b + b^2 + ... + b^d + (b^{d+1} - b) = O(b^{d+1}).',
        'With generation goal-testing: as soon as the goal is generated at depth d, search halts: Total nodes generated = 1 + b + b^2 + ... + b^d = O(b^d).',
        'Saving factor: avoids generating b^{d+1} - b nodes at depth d+1, saving a factor of b in memory!',
      ],
      conclusion: 'Generation-time goal test saves an entire tier of exponential nodes O(b^{d+1}) -> O(b^d).',
    },
    industrialApplications: [
      'Social Network Friend Degree of Separation: Finding 1st, 2nd, and 3rd degree connections on LinkedIn or Facebook.',
      'Web Crawlers: Crawling websites tier by tier up to maximum domain depth.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Can we apply early goal-testing (on generation) to Dijkstra / UCS?" Answer: ABSOLUTELY NOT! Doing so breaks optimality because a node generated with fewer hops might have higher cumulative cost.',
    pitfalls: [
      {
        misconception: 'Assuming BFS is optimal for all shortest-path problems.',
        correction:
          'BFS is only optimal when all step costs are identical. If step costs vary, Uniform Cost Search (UCS) must be used.',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'bfs',
    actionText: 'Load Classic Labyrinth with BFS',
    vivaQuestions: [
      {
        question: "Why can BFS use an early goal-test (upon generation), while UCS cannot?",
        answer: "In BFS, edge costs are uniform (c=1), so the first time a goal node is generated at depth d, it is impossible for any future path to reach the goal in fewer than d steps. In UCS, edges have varying weights, so a goal generated via a 2-hop path of cost 100 might be beaten by a 10-hop path of cost 15.",
        examinerTip: "Emphasize that step count != cumulative cost.",
      },
      {
        question: "Under what specific condition is Breadth-First Search (BFS) guaranteed to be path-cost optimal?",
        answer: "BFS is guaranteed to be path-cost optimal if and only if all step transition costs are identical and non-negative (e.g., uniform cost c > 0). If edge weights vary, BFS finds the minimum-hop path, which may have a significantly higher total cost.",
        examinerTip: "Give a quick example: a 2-step path of cost 50+50=100 vs a 3-step path of cost 2+2+2=6.",
      },
      {
        question: "Derive the mathematical time and space complexity of BFS and explain why RAM is exhausted first.",
        answer: "Time complexity is O(b^d) because up to b^d nodes are expanded. Space complexity is O(b^d) because the FIFO queue holds all leaf nodes at depth d simultaneously. For b=10 and d=8, storing 10^8 nodes at 100 bytes each requires 10 GB RAM, causing out-of-memory crashes before CPU limits are reached.",
        examinerTip: "Mention that at 1 million nodes/sec, CPU takes 100 seconds, but 10 GB RAM crashes average laptops.",
      },
      {
        question: "If edge costs are small positive integers (e.g. 1, 2, 3), how can BFS be modified to find optimal paths without a heap?",
        answer: "Dial's Algorithm (1-to-K BFS): Replace the single FIFO queue with an array of K FIFO buckets where bucket i stores nodes at distance i. Advancing through buckets in non-decreasing index order maintains cost-optimality in O(|V| + K|E|) time without heap overhead.",
        examinerTip: "Dial's algorithm is an advanced viva point that faculty love to hear from competitive programming and AI students.",
      }
    ],
    quiz: {
      question: 'Under what specific condition is Breadth-First Search (BFS) guaranteed to be path-cost optimal?',
      options: [
        'Only on trees without cycles',
        'If and only if all step transition costs are identical and non-negative',
        'Whenever an admissible heuristic is provided',
        'Only when using a LIFO stack',
      ],
      correctIndex: 1,
      explanation:
        'Correct! BFS finds the path with the fewest action transitions. It is only cost-optimal when all action transitions incur the exact same cost.',
    },
  },

  {
    id: 5,
    title: 'Lesson 5: Depth-First Search (DFS) — Memory Conservation & Meandering Paths',
    module: 'Uninformed',
    moduleLabel: 'Module 2: Blind Search',
    badge: 'Uninformed Classic',
    estMinutes: 6,
    complexity: {
      time: 'O(b^m) where m is maximum depth',
      space: 'O(b * m) strictly linear memory',
      completeness: 'Complete in finite spaces with closed set',
      optimality: 'Non-optimal (meanders through first branch)',
    },
    formalDefinition: {
      math: '\\text{Frontier} = \\text{LIFO Stack}, \\quad \\text{Space} = O(b \\cdot m)',
      description: 'Plunges along a single branch to maximum depth before backtracking upon encountering dead ends.',
    },
    concept:
      'DFS trades solution quality for memory efficiency. By storing only the active path and sibling nodes, it reduces spatial complexity to O(bm), but risks committing deeply to suboptimal detours.',
    inDepthExplanation: [
      'Mechanism: The frontier operates as a LIFO stack. The algorithm immediately expands the newest unvisited child, diving deeper until reaching a dead end or depth limit.',
      'Linear Space: At any moment, DFS only stores the path from the root to the current node, plus unexpanded siblings. For depth 100 with branching factor 4, DFS uses only 400 nodes in memory!',
      'Suboptimality: DFS returns the FIRST path it finds that terminates at the goal. In a maze, this often means wandering through long, meandering cul-de-sacs even when a direct 2-step path exists.',
      'Incompleteness Risk: In infinite state spaces or graphs without closed-set cycle checking, DFS can dive down an infinite branch and never return, making it incomplete.',
    ],
    keyTeachingPoints: [
      'The Linear Memory Miracle: While BFS holds b^d nodes in RAM, DFS holds only b * m nodes. For b=10 and m=10, BFS takes 10 GB, while DFS takes 100 nodes (~few kilobytes).',
      'Extreme Suboptimality: DFS gives zero consideration to path length or cost. The solution returned is dictated purely by child expansion ordering (e.g. North, East, South, West).',
      'The Infinite Branch Trap: In graph search without cycle detection, DFS plunges down cyclic loops forever.',
    ],
    mathematicalDerivation: {
      title: 'Space Complexity Derivation for DFS',
      steps: [
        'Let m be the maximum tree depth, and b be the branching factor.',
        'At depth 0, the root generates b children. One is chosen, leaving b - 1 siblings on the stack.',
        'At depth 1, the chosen child generates b children. One is chosen, leaving b - 1 siblings.',
        'At depth m, the leaf generates 0 children.',
        'Total nodes residing on the stack: m * (b - 1) + 1 = O(b * m).',
      ],
      conclusion: 'DFS space complexity scales strictly linearly with maximum depth O(b * m).',
    },
    industrialApplications: [
      'Maze Generation (Recursive Backtracker): Creating mazes with long winding corridors.',
      'Topological Sort & Compiler Dependency Graphs: Resolving build artifact dependencies.',
      'Constraint Satisfaction (Sudoku / N-Queens): Backtracking search over variable assignments.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Can DFS be faster than BFS?" Answer: Yes! If by luck the goal happens to be located on the very first branch DFS explores, DFS finds it in O(d) time, whereas BFS still expands all nodes at depths 0..d-1.',
    pitfalls: [
      {
        misconception: 'Assuming DFS will find the shortest path if the goal is located at shallow depth.',
        correction:
          'If the first branch chosen does not contain the goal, DFS explores that branch to its deepest leaf before ever checking shallow neighbors on alternate branches.',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'dfs',
    actionText: 'Experience DFS Meandering Trajectory',
    vivaQuestions: [
      {
        question: "Why is DFS widely utilized in puzzle solvers and theorem provers despite being non-optimal?",
        answer: "Because its space complexity is O(b * m) linear in maximum tree depth m. When the search space has a depth of thousands or millions, BFS is impossible due to exponential RAM limits, but DFS requires only megabytes of RAM.",
        examinerTip: "Mention how Depth-Limited Search and Iterative Deepening address DFS suboptimality.",
      },
      {
        question: "What is the primary architectural advantage of Depth-First Search over Breadth-First Search?",
        answer: "Strictly linear memory consumption O(b * m). At any given moment, DFS only needs to store the path from the root node to the current node, along with unexpanded siblings on the recursion/LIFO stack.",
        examinerTip: "Contrast DFS memory (O(bm)) with BFS memory (O(b^d)).",
      },
      {
        question: "Under what circumstances is DFS complete in finite state spaces, and what failure occurs if cycles exist?",
        answer: "Graph-search DFS with a Closed List is complete in finite state spaces. However, naive tree-search DFS is incomplete in cyclic graphs because it can traverse an infinite cycle (e.g. North then South) and never explore remaining branches.",
        examinerTip: "Highlight the difference between finite state spaces vs infinite search trees.",
      },
      {
        question: "Can DFS ever find the goal faster than BFS? Explain why.",
        answer: "Yes! If by luck or heuristic tie-breaking the goal is located along the very first branch DFS explores, DFS discovers the goal in O(d) steps, whereas BFS must expand all (b^d - 1)/(b - 1) nodes across all preceding depths.",
        examinerTip: "Faculty often use this question to test if candidates understand best-case vs worst-case execution.",
      }
    ],
    quiz: {
      question: 'What is the primary architectural advantage of Depth-First Search over Breadth-First Search?',
      options: [
        'Guaranteed shortest path',
        'Strictly linear memory consumption O(b * m)',
        'Never explores dead ends',
        'Guaranteed faster execution time in all cases',
      ],
      correctIndex: 1,
      explanation:
        'Correct! DFS only stores nodes along the active search trajectory, giving it an O(b * m) linear memory footprint compared to BFS exponential O(b^d).',
    },
  },

  {
    id: 6,
    title: 'Lesson 6: Iterative Deepening Search (IDS / IDDFS) — The Best of Both Worlds',
    module: 'Uninformed',
    moduleLabel: 'Module 2: Blind Search',
    badge: 'Theoretical Wonder',
    estMinutes: 7,
    complexity: {
      time: 'O(b^d) identical order of magnitude to BFS',
      space: 'O(b * d) strictly linear memory',
      completeness: 'Complete on finite b',
      optimality: 'Optimal for unit step costs',
    },
    formalDefinition: {
      math: '\\text{IDDFS}(S_0) = \\bigcup_{limit=0}^{\\infty} \\text{DLS}(S_0, limit)',
      description: 'Repeatedly executes Depth-Limited Search with gradually increasing depth bounds limit = 0, 1, 2, ..., d.',
    },
    concept:
      'Iterative Deepening combines the completeness and optimality of BFS with the linear memory efficiency of DFS. While it regenerates shallow nodes, the geometric growth of tree nodes ensures the overhead is negligible.',
    inDepthExplanation: [
      'How it works: Run Depth-Limited DFS with limit=0. If goal not found, run with limit=1, then limit=2, until the goal is found at depth d.',
      'Why regeneration is cheap: In an exponential tree, the bottom level d contains the vast majority of all nodes (approx (b-1)/b of all nodes). Nodes at level 1 are regenerated d times, but 1*d is negligible compared to b^d.',
      'Total nodes generated in IDS: N(IDS) = (d)b^1 + (d-1)b^2 + ... + (1)b^d. For b=10 and d=5: BFS generates ~111,111 nodes; IDS generates ~123,456 nodes—only an 11% overhead!',
      'Memory: Because each iteration is depth-first, memory is bounded strictly by O(bd), solving the BFS memory bottleneck completely.',
    ],
    keyTeachingPoints: [
      'The Preferred Blind Search: For large search spaces with unknown solution depth and unit costs, IDS is the undisputed algorithm of choice.',
      'Negligible Overhead: Students intuitively assume re-running DFS from scratch is wasteful. But because the tree grows exponentially, the bottom tier dwarfs all prior tiers combined.',
      'Asymptotic Equivalence: Time complexity is O(b^d), asymptotically identical to BFS, while space collapses from O(b^d) to O(b*d).',
    ],
    mathematicalDerivation: {
      title: 'Formal Overhead Bound: IDS vs BFS Ratio',
      steps: [
        'BFS node count: N(BFS) = 1 + b + b^2 + ... + b^d = (b^{d+1} - 1) / (b - 1).',
        'IDS node count: N(IDS) = (d+1)(1) + d(b) + (d-1)b^2 + ... + 1(b^d).',
        'Factoring out: N(IDS) = b^d * sum_{i=0}^{d} (i + 1) * b^{-i}.',
        'As d -> infinity, the infinite series sum converges to (b / (b - 1))^2.',
        'Ratio N(IDS) / N(BFS) <= b / (b - 1). For b=2: ratio <= 2. For b=10: ratio <= 1.11.',
      ],
      conclusion: 'For typical branching factors b >= 4, Iterative Deepening adds less than 33% total overhead while saving gigabytes of RAM.',
    },
    industrialApplications: [
      'Chess and Game Engines (Stockfish / AlphaZero): Iterative deepening is used to manage fixed time clocks (e.g. 5 seconds per move).',
      'Automated Theorem Provers: Searching proof trees of unknown depth without RAM exhaustion.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "If re-expanding shallow nodes is so cheap in trees, is it also cheap in graphs with dense transpositions?" Answer: In dense graphs with transpositions, IDS can re-expand nodes exponentially unless transposition tables (partial closed lists) are used.',
    pitfalls: [
      {
        misconception: 'Believing re-expanding shallow nodes causes exponential time explosion.',
        correction:
          'Because node counts grow exponentially with depth, the earlier levels represent a tiny fraction of the total nodes. The overhead factor is bounded by b / (b - 1).',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'idastar',
    actionText: 'Observe Iterative Deepening Thresholds',
    vivaQuestions: [
      {
        question: "Prove mathematically why the overhead of re-expanding states in Iterative Deepening is small.",
        answer: "In IDS, nodes at depth 1 are expanded d times, depth 2 are expanded (d-1) times, and depth d are expanded 1 time. Total expansions N = sum_{i=1}^{d} (d - i + 1) * b^i = b^d * (b / (b-1))^2 = O(b^d). For b=10, the overhead compared to BFS is only ~11% (100/81 approx 1.23).",
        examinerTip: "Write out the geometric series sum during blackboard viva exams.",
      },
      {
        question: "What is the space complexity of Iterative Deepening Search to find a goal at depth d with branching factor b?",
        answer: "Space complexity is O(b * d) strictly linear memory. Each iteration runs Depth-Limited DFS, storing only the active path and sibling nodes. It completely avoids the exponential O(b^d) RAM bottleneck of BFS while retaining completeness and optimality.",
        examinerTip: "IDS is described as \"the preferred uninformed search method when state space is large and depth is unknown\".",
      },
      {
        question: "Under what conditions is Iterative Deepening strictly preferred over standard BFS?",
        answer: "Whenever search depth is unknown, step costs are uniform, and the branching factor b > 1. BFS would exhaust physical memory, whereas IDS achieves the exact same cost-optimal solution in O(bd) RAM with negligible runtime overhead.",
        examinerTip: "Mention that in games like Chess, IDS is combined with Alpha-Beta pruning to handle time-bound turns.",
      },
      {
        question: "What happens to IDS performance if the branching factor b is very small (e.g., b = 1)?",
        answer: "If b = 1 (a linear chain of states), the total operations scale quadratically: sum_{i=1}^{d} i = d(d+1)/2 = O(d^2), whereas BFS takes only O(d). Thus, IDS incurs significant overhead only on linear topologies with b close to 1.",
        examinerTip: "Crucial nuance: IDS relies on exponential growth (b >= 2) so that the bottom tier dominates all upper tiers.",
      }
    ],
    quiz: {
      question: 'What is the space complexity of Iterative Deepening Search to find a goal at depth d with branching factor b?',
      options: ['O(b^d)', 'O(b * d)', 'O(d!)', 'O(1)'],
      correctIndex: 1,
      explanation:
        'Correct! Because each iteration of IDS is a depth-limited DFS, it only maintains the active search stack, resulting in strictly linear O(b * d) space complexity.',
    },
  },

  {
    id: 7,
    title: 'Lesson 7: Uniform Cost Search (UCS / Dijkstra) — Cost-Optimality on Weighted Terrain',
    module: 'Uninformed',
    moduleLabel: 'Module 2: Blind Search',
    badge: 'Cost-Aware Search',
    estMinutes: 7,
    complexity: {
      time: 'O(b^(1 + floor(C* / eps)))',
      space: 'O(b^(1 + floor(C* / eps)))',
      completeness: 'Complete if step cost >= eps > 0',
      optimality: 'Strictly optimal for all non-negative edge costs',
    },
    formalDefinition: {
      math: 'f(n) = g(n) = \\sum_{i=0}^{k-1} c(s_i, a_i, s_{i+1}), \\quad \\text{Frontier} = \\text{Min-PriorityQueue}(g)',
      description:
        'Sorts the frontier strictly by cumulative path cost g(n) from the start state, expanding nodes along contours of equal cost.',
    },
    concept:
      'Uniform Cost Search adapts Dijkstra’s algorithm to goal-directed search. By always expanding the frontier node with lowest cumulative cost g(n), it guarantees cost optimality on non-uniform terrain.',
    inDepthExplanation: [
      'Mechanism: Frontier is a min-priority queue ordered by g(n). Node expansion spreads outward along elliptical contours of equal cumulative cost.',
      'The Golden Rule of UCS: The Goal Test MUST be applied when a node is SELECTED FOR EXPANSION (popped from priority queue), NEVER when it is generated (added to frontier). A cheaper path to the goal may still reside in the queue.',
      'Weighted Terrain Handling: In mud swamps (cost multiplier 4.5), UCS naturally circumvents high-cost cells, discovering longer physical detours that yield lower total energy cost.',
      'Completeness Condition: Requires that every action step cost c(s, a, s\') >= eps > 0. If zero or negative cost cycles exist, UCS can loop infinitely seeking lower costs.',
    ],
    keyTeachingPoints: [
      'The Goal-Test at Pop Rule: In UCS, a node is only guaranteed to have its true optimal cost g(n) when it is popped from the min-heap. Goal-testing at insertion violates optimality.',
      'Contours of Constant Cost: UCS expands outwards along contours of equal cumulative path cost g(n) <= C*, like ripples in a pond with varying water resistance.',
      'The Epsilon-Cost Requirement: To prevent infinite loops with zero-cost actions, every edge cost must be strictly bounded away from zero: c(e) >= eps > 0.',
    ],
    mathematicalDerivation: {
      title: 'Proof of Optimality for Uniform Cost Search',
      steps: [
        'Suppose UCS terminates returning a suboptimal goal node G_sub with path cost g(G_sub) > C*.',
        'Since an optimal path to an optimal goal G* exists, at least one node n on that optimal path must currently be sitting in the Frontier.',
        'Because all step costs are non-negative, g(n) <= g(G*) = C*.',
        'Combining inequalities: g(n) <= C* < g(G_sub).',
        'Because the Frontier is ordered as a min-priority queue by g, node n must have been popped BEFORE G_sub.',
        'This contradicts the supposition that G_sub was popped first!',
      ],
      conclusion: 'Therefore, UCS must always expand the optimal goal path before any suboptimal candidate.',
    },
    industrialApplications: [
      'Google Maps / Apple Maps Navigation: Base graph search routing across toll roads, highways, and residential streets.',
      'Subsea Cable Routing: Laying high-speed fiber cables around oceanic trenches and rocky underwater ridges.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "What happens if a graph contains negative edge costs in UCS?" Answer: UCS breaks completely. It can enter negative-cost cycles. The Bellman-Ford algorithm must be used instead.',
    traceExample: {
      description: 'UCS selecting detour around a mud tile (cost 5) vs road (cost 1):',
      steps: [
        {
          step: 1,
          node: 'A',
          action: 'Pop A (g=0)',
          g: 0,
          h: 0,
          f: 0,
          frontier: '[B(g=5 via mud), C(g=1 via road)]',
          explored: '{A}',
          comment: 'A expanded. Road branch C has g=1; Mud branch B has g=5.',
        },
        {
          step: 2,
          node: 'C',
          action: 'Pop C (g=1)',
          g: 1,
          h: 0,
          f: 1,
          frontier: '[D(g=2 via road), B(g=5)]',
          explored: '{A,C}',
          comment: 'C popped (g=1 < g=5). Expands D with total g=2.',
        },
        {
          step: 3,
          node: 'D',
          action: 'Pop D (g=2)',
          g: 2,
          h: 0,
          f: 2,
          frontier: '[Goal(g=3 via road), B(g=5)]',
          explored: '{A,C,D}',
          comment: 'Road path reaches Goal with cost 3 before Mud tile B (g=5) is ever expanded!',
        },
      ],
    },
    pitfalls: [
      {
        misconception: 'Goal-testing when generating nodes to save time.',
        correction:
          'Critical Bug! If UCS tests for goal on generation, it may declare success on a path with fewer hops but higher cumulative cost before the optimal path reaches the front of the queue.',
      },
    ],
    presetId: 'weighted_swamp',
    algId: 'ucs',
    actionText: 'Load Weighted Swamp with UCS',
    vivaQuestions: [
      {
        question: "Why MUST the goal test in Uniform Cost Search occur when popping from the priority queue rather than when generating the node?",
        answer: "Because a goal node can be generated via a high-cost path before a cheaper, multi-step path to the goal is discovered. Popping from the min-priority queue guarantees that no unexpanded path in the frontier has a cost less than g(current). Early testing destroys cost-optimality.",
        examinerTip: "This is the #1 most failed question in AI viva exams; emphasize that UCS orders by path cost g, not hop count.",
      },
      {
        question: "What condition on step costs c(s, a, s') is required for UCS to guarantee completeness and cost-optimality?",
        answer: "Every step cost must be strictly greater than zero (c >= epsilon > 0). If zero-cost or negative-cost cycles exist, UCS can enter an infinite loop expanding zero-cost cycles without ever making forward progress toward the goal.",
        examinerTip: "State the formal epsilon bound: c(s, a, s') >= eps > 0 to guarantee completeness.",
      },
      {
        question: "How does Uniform Cost Search differ from Dijkstra's algorithm in terms of termination condition?",
        answer: "Uniform Cost Search terminates immediately when the designated goal state is popped from the priority queue (single-pair shortest path). Standard Dijkstra's algorithm continues until all reachable vertices in the entire graph are expanded (single-source all-destinations shortest paths).",
        examinerTip: "UCS is essentially Dijkstra with an early goal termination check upon extraction.",
      },
      {
        question: "What is the worst-case space complexity of Uniform Cost Search in terms of optimal cost C* and min step cost eps?",
        answer: "Space complexity is O(b^(1 + floor(C* / eps))). In the worst case, UCS must explore all nodes whose cumulative path cost g(n) is less than or equal to C*, creating an expanding contour of cost C*.",
        examinerTip: "Compare C*/eps to tree depth d; when eps is very small, UCS expands an enormous number of tiny-step nodes.",
      }
    ],
    quiz: {
      question: 'What is the evaluation function f(n) used to order the priority queue in Uniform Cost Search?',
      options: ['f(n) = h(n)', 'f(n) = g(n)', 'f(n) = g(n) + h(n)', 'f(n) = depth(n)'],
      correctIndex: 1,
      explanation:
        'Correct! UCS orders nodes purely by cumulative path cost from the root g(n), making it equivalent to Dijkstra’s single-source shortest path algorithm.',
    },
  },

  // -------------------------------------------------------------
  // MODULE 3: INFORMED (HEURISTIC) SEARCH
  // -------------------------------------------------------------
  {
    id: 8,
    title: 'Lesson 8: Heuristic Estimation & Greedy Best-First Search Pitfalls',
    module: 'Heuristics',
    moduleLabel: 'Module 3: Informed Search',
    badge: 'Greedy Heuristic',
    estMinutes: 6,
    complexity: {
      time: 'O(b^m) worst-case; fast in open space',
      space: 'O(b^m) stores all frontier nodes',
      completeness: 'Incomplete in infinite spaces; complete with closed list',
      optimality: 'Non-optimal (ignores path cost g)',
    },
    formalDefinition: {
      math: 'f(n) = h(n) \\approx h^*(n), \\quad \\text{where } h(n) = \\text{estimated cost from } n \\text{ to Goal}',
      description:
        'Greedy Best-First orders the frontier strictly by estimated remaining distance h(n), ignoring historical cost g(n).',
    },
    concept:
      'Greedy Best-First aggressively rushes toward the goal in coordinate space. While lightning-fast in open fields, its complete disregard for accumulated cost g(n) makes it vulnerable to concave dead-end traps.',
    inDepthExplanation: [
      'Mechanism: The priority queue orders nodes purely by h(n). The node that appears closest to the goal is always expanded next.',
      'Strengths: In unobstructed terrain, Greedy heads straight like an arrow, expanding the bare minimum number of nodes along the line of sight.',
      'The Concave Trap: Facing a U-shaped wall, Greedy enters the cul-de-sac because points deep inside the pocket are physically closer to the goal than points around the perimeter. It must fill the entire concave trap before backtracking.',
      'Non-optimality: Greedy ignores how much effort was spent reaching n. A 100-mile detour with h=5 will be preferred over a 2-mile path with h=6.',
    ],
    keyTeachingPoints: [
      'Myopic Focus on the Future: Greedy asks only "How close does this node appear to the goal?", completely blind to how much path cost g(n) was expended getting there.',
      'Vulnerability to Obstacle Shadows: When a barrier sits directly between start and goal, Greedy charges straight into the obstacle wall, filling the entire obstacle pocket before escaping around the rim.',
      'Degeneration Mode of A*: Greedy Best-First is equivalent to A* where the g(n) weight is set to 0: f(n) = 0*g(n) + h(n).',
    ],
    mathematicalDerivation: {
      title: 'Formal Suboptimality of Greedy Best-First Search',
      steps: [
        'Let path 1 be: Start -> A -> Goal, with costs c(Start,A)=100, c(A,Goal)=1. True cost = 101.',
        'Let path 2 be: Start -> B -> Goal, with costs c(Start,B)=1, c(B,Goal)=2. True cost = 3.',
        'Suppose heuristic estimates: h(A) = 1, h(B) = 2.',
        'Greedy evaluates frontier: f(A) = h(A) = 1; f(B) = h(B) = 2.',
        'Greedy pops A first (1 < 2), expands A -> Goal, returning solution cost 101.',
        'Suboptimality ratio: 101 / 3 = ~33.6x worse than optimal!',
      ],
      conclusion: 'Greedy search can return arbitrarily suboptimal paths because it ignores historical cost g(n).',
    },
    industrialApplications: [
      'Fast Heuristic Triage: Used when computing ANY valid path in 1 millisecond is more important than finding the shortest path.',
      'Initial Solution Seeds: Generating initial candidate routes for Genetic Algorithms or Simulated Annealing optimizers.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "If we give Greedy Best-First Search an admissible heuristic, does it become optimal?" Answer: NO! Admissibility guarantees optimality ONLY for A*, never for Greedy Best-First.',
    pitfalls: [
      {
        misconception: 'Believing Greedy Best-First Search is optimal if the heuristic is admissible.',
        correction:
          'False! Admissibility guarantees optimality for A*, NOT for Greedy Best-First. Greedy is never guaranteed to find the shortest path.',
      },
    ],
    presetId: 'local_optimum_trap',
    algId: 'greedy',
    actionText: 'Load U-Trap to see Greedy Vulnerability',
    vivaQuestions: [
      {
        question: "Under what heuristic condition does A* search become identical to Greedy Best-First Search?",
        answer: "When the path cost weight is zero: f(n) = h(n). If path cost g(n) is ignored entirely, A* devolves into pure Greedy Best-First Search, prioritizing exclusively the estimated proximity to the goal.",
        examinerTip: "Explain that Greedy Best-First is a special case of Best-First Search using f(n) = h(n).",
      },
      {
        question: "Why does Greedy Best-First Search frequently take suboptimal paths and fall into local dead-ends?",
        answer: "Because it relies exclusively on h(n) and completely ignores g(n) (path cost incurred so far). In a concave obstacle (like a U-wall), Greedy rushes toward the goal as the crow flies, getting trapped deep inside the cul-de-sac before backtracking.",
        examinerTip: "Show how Greedy prioritizes local forward visual progress over cumulative path length.",
      },
      {
        question: "What is the worst-case time and space complexity of Greedy Best-First Search?",
        answer: "Worst-case time and space complexity is O(b^m), where m is the maximum search depth. Like DFS, a deceptive or misleading heuristic can lead Greedy down a false path to maximum depth, requiring it to store all generated frontier nodes in memory.",
        examinerTip: "Point out that Greedy Best-First Search is neither complete (in infinite spaces) nor optimal.",
      },
      {
        question: "Can Greedy Best-First Search be made complete in finite cyclic graphs?",
        answer: "Yes, if implemented as Graph Search with a Closed List to prevent expanding duplicate states. However, it still remains strictly non-optimal because it never backtracks to optimize path cost if any path reaches the goal.",
        examinerTip: "Examiners appreciate candidates who distinguish between completeness and optimality.",
      }
    ],
    quiz: {
      question: 'Why does Greedy Best-First Search frequently take suboptimal paths?',
      options: [
        'It cannot use the Manhattan heuristic',
        'It evaluates nodes solely by estimated future distance h(n) and completely ignores past path cost g(n)',
        'It uses a LIFO stack',
        'It fails on unit-cost grids',
      ],
      correctIndex: 1,
      explanation:
        'Correct! Because Greedy ignores g(n), it gladly takes a long, winding, or expensive route as long as the immediate state appears closer to the goal.',
    },
  },

  {
    id: 9,
    title: 'Lesson 9: A* Search Mechanics & The f(n) = g(n) + h(n) Fusion',
    module: 'Heuristics',
    moduleLabel: 'Module 3: Informed Search',
    badge: 'A* Architecture',
    estMinutes: 8,
    complexity: {
      time: 'O(b^d) worst-case; optimal efficiency among heuristics',
      space: 'O(b^d) memory bottleneck',
      completeness: 'Complete on finite state spaces',
      optimality: 'Optimally efficient for admissible/consistent heuristics',
    },
    formalDefinition: {
      math: 'f(n) = g(n) + h(n), \\quad g(n) = \\text{cost so far}, \\quad h(n) = \\text{estimated cost to goal}',
      description: 'A* evaluates nodes by estimated total solution cost through node n: f(n) = g(n) + h(n).',
    },
    concept:
      'A* combines the cost-awareness of Uniform Cost Search with the directional guidance of Greedy Best-First. It is provably optimally efficient: no other optimal algorithm expanding the same heuristic can expand fewer nodes.',
    inDepthExplanation: [
      'The Dual Evaluation: g(n) provides backward historical accuracy; h(n) provides forward heuristic prediction. Together, f(n) estimates the total cost of a path passing through n.',
      'Contour Expansion: UCS expands circular contours of radius g. A* stretches these contours into ellipsoids focused toward the goal, severely pruning sideways expansions.',
      'Boundary Dualism: If h(n)=0 for all n, f(n)=g(n), making A* identical to UCS. If g(n)=0, f(n)=h(n), making A* identical to Greedy Best-First.',
      'Pruning Power: Any node with f(n) > C* (optimal path cost) will NEVER be expanded if h is consistent. This eliminates massive portions of the search graph.',
    ],
    keyTeachingPoints: [
      'The Fundamental Equation: f(n) = g(n) + h(n) estimates the total cost of a complete solution path constrained to pass through node n.',
      'The Ellipsoidal Search Envelope: While UCS explores a sphere of radius C*, A* focuses exploration into an ellipse with foci at Start and Goal.',
      'Optimal Efficiency Theorem (Dechter & Pearl 1985): No optimal search algorithm using heuristic h can expand fewer nodes than A* (except nodes on the boundary f(n) = C*).',
    ],
    mathematicalDerivation: {
      title: 'Pruning Condition of A* Search',
      steps: [
        'Let C* be the true optimal solution cost from Start to Goal.',
        'Let h(n) be an admissible heuristic, so h(n) <= h*(n).',
        'For any node n on the optimal path: f(n) = g(n) + h(n) <= g(n) + h*(n) = C*.',
        'Therefore, the optimal goal path always has f-cost <= C*.',
        'Any suboptimal path candidate n_bad with f(n_bad) > C* will have a strictly higher f-value than the nodes leading to the optimal goal.',
        'Because the min-heap always pops minimum f-value first, the optimal goal is popped and terminates the search before n_bad is EVER expanded.',
      ],
      conclusion: 'A* provably prunes every state where f(n) > C*.',
    },
    industrialApplications: [
      'Video Game Pathfinding (Unity / Unreal / Valve): Real-time navigation for hundreds of NPC units across NavMesh polygons.',
      'Logistics & Fleet Optimization (FedEx / UPS): Multi-stop vehicle routing and warehouse automated guided vehicles (AGVs).',
      'Robotics (ROS Navigation Stack / MoveIt): Global planners using 2D/3D A* grids for obstacle avoidance.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "If A* is so optimally efficient, why do people use IDA* or RRT instead?" Answer: Because A* stores all generated nodes in RAM (space complexity O(b^d)). On huge 3D or high-degree graphs, A* runs out of memory in seconds.',
    traceExample: {
      description: 'A* evaluating candidate paths at a junction:',
      steps: [
        {
          step: 1,
          node: 'N1',
          action: 'Evaluate',
          g: 4,
          h: 5,
          f: 9,
          frontier: '[N1(f=9), N2(f=11)]',
          explored: '{Start}',
          comment: 'N1 has lower total estimated cost f=4+5=9.',
        },
        {
          step: 2,
          node: 'N1',
          action: 'Expand',
          g: 4,
          h: 5,
          f: 9,
          frontier: '[N1_child(f=8), N2(f=11)]',
          explored: '{Start,N1}',
          comment: 'N1 expanded. N1_child has f=8, remains at top of queue.',
        },
        {
          step: 3,
          node: 'N2',
          action: 'Pruned',
          g: 8,
          h: 3,
          f: 11,
          frontier: '[N1_child(f=8)]',
          explored: '{...}',
          comment: 'N2 never expanded before goal reached at cost C*=9!',
        },
      ],
    },
    pitfalls: [
      {
        misconception: 'Assuming A* uses less memory than BFS.',
        correction:
          'A* still stores all generated nodes in the frontier and closed list. While it expands fewer nodes, its worst-case memory footprint remains exponential O(b^d).',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'astar',
    actionText: 'Load A* with Manhattan Heuristic',
    vivaQuestions: [
      {
        question: "What is meant by the statement \"A* is optimally efficient\" for any given consistent heuristic?",
        answer: "It means no other optimal search algorithm that expands nodes based on f(n) can expand fewer nodes than A* (except for tie-breaking differences). Every node expanded by A* with a consistent heuristic has f(n) <= C*, meaning it MUST be expanded by any optimal algorithm.",
        examinerTip: "State the Dechter & Pearl (1985) theorem on optimal efficiency of A*.",
      },
      {
        question: "In A* search, what does the evaluation function f(n) = g(n) + h(n) represent intuitively, and what happens if h(n) = 0?",
        answer: "f(n) represents the estimated total cost of the cheapest path from start to goal passing through node n: g(n) is known cost from start to n, and h(n) is estimated cost from n to goal. If h(n) = 0 everywhere, A* becomes identical to Uniform Cost Search (Dijkstra).",
        examinerTip: "Highlight the dual nature of f(n): backward-looking reality g(n) + forward-looking projection h(n).",
      },
      {
        question: "Prove why A* with an admissible heuristic will never expand a node with f(n) > C* before the optimal goal.",
        answer: "Let G2 be a suboptimal goal with cost g(G2) > C*. Since G2 is a goal, h(G2) = 0, so f(G2) = g(G2) > C*. At any point before termination, there exists an open node n on the frontier along the true optimal path. Because h is admissible, f(n) <= C*. Therefore, f(n) <= C* < f(G2), so A* will always expand n before G2.",
        examinerTip: "Walk through this classic proof step-by-step; it is the cornerstone of artificial intelligence search exams.",
      },
      {
        question: "Why must A* use late goal testing (at extraction from Open List) rather than early goal testing (upon generation)?",
        answer: "Because a goal node G might be generated via a suboptimal path with f(G) = g(G) > C*. If A* halted upon generation, it would accept this suboptimal path. Waiting until G is extracted from the min-heap guarantees that no open node has f(n) < f(G), ensuring f(G) = C* is strictly optimal.",
        examinerTip: "Reiterate that late goal testing is required whenever edge costs or heuristic estimates vary.",
      }
    ],
    quiz: {
      question: 'In A* search, what does the evaluation function f(n) represent?',
      options: [
        'The step cost from the parent to node n',
        'The estimated total cost of the cheapest solution path passing through node n',
        'The depth of node n in the search tree',
        'The straight-line distance from Start to Goal',
      ],
      correctIndex: 1,
      explanation:
        'Correct! f(n) = g(n) + h(n) represents the estimated total cost of a complete solution path that starts at S_0, passes through n, and terminates at Goal.',
    },
  },

  {
    id: 10,
    title: 'Lesson 10: Heuristic Admissibility & Consistency (Monotonicity)',
    module: 'Heuristics',
    moduleLabel: 'Module 3: Informed Search',
    badge: 'Mathematical Proof',
    estMinutes: 8,
    complexity: {
      time: 'Prunes all f(n) > C*',
      space: 'Requires closed set for graph search',
      completeness: 'Complete',
      optimality: 'Tree Search: Admissibility; Graph Search: Consistency',
    },
    formalDefinition: {
      math: '0 \\le h(n) \\le h^*(n) \\; (\\text{Admissible}), \\quad h(n) \\le c(n, a, n\') + h(n\') \\; (\\text{Consistent})',
      description:
        'Admissibility guarantees h never overestimates true cost. Consistency enforces the triangle inequality across every step transition.',
    },
    concept:
      'Admissibility ensures A* will never overlook an optimal path because the goal path will never look worse than it truly is. Consistency goes further: it guarantees that f(n) never decreases along any path, eliminating the need to ever reopen closed nodes.',
    inDepthExplanation: [
      'Admissibility: h(n) <= h*(n) for all n. The estimated cost must be an optimistic lower bound. If h overestimates, A* may discard the true optimal path thinking it is too expensive.',
      'Consistency (Monotonicity): For every node n and successor n\' generated by action a: h(n) <= c(n, a, n\') + h(n\'). This is the triangle inequality in state space.',
      'The Monotonicity Property: When h is consistent, f(n\') = g(n\') + h(n\') = g(n) + c(n,a,n\') + h(n\') >= g(n) + h(n) = f(n). The f-values along any path are monotonically non-decreasing!',
      'Graph Search Consequence: With consistent heuristics, the first time A* expands any node n, the path to n is GUARANTEED to be optimal. No closed node ever needs to be reopened or re-expanded!',
    ],
    keyTeachingPoints: [
      'Admissibility is Optimism: An admissible heuristic is optimistic—it always assumes the road ahead is at least as cheap as it actually is, preventing premature abandonment of optimal candidates.',
      'Consistency Implies Admissibility: Every consistent heuristic is admissible (proof by induction along the path to the goal). The reverse is not always true.',
      'No Node Reopening: With consistency, when node n is popped for expansion, g(n) is optimal. A* can safely lock n into the Closed List forever.',
    ],
    mathematicalDerivation: {
      title: 'Proof that Consistency Implies Monotonically Non-Decreasing f(n)',
      steps: [
        'Let n\' be a successor of n via action a with cost c(n, a, n\').',
        'By definition of path cost: g(n\') = g(n) + c(n, a, n\').',
        'By definition of evaluation function: f(n\') = g(n\') + h(n\') = g(n) + c(n, a, n\') + h(n\').',
        'By the definition of Consistency (Triangle Inequality): c(n, a, n\') + h(n\') >= h(n).',
        'Substituting this inequality: f(n\') >= g(n) + h(n) = f(n).',
      ],
      conclusion: 'Therefore, f(n\') >= f(n). The f-values along any path never decrease! f-contours expand monotonically.',
    },
    industrialApplications: [
      'Aviation Flight Path Planning: Great-circle distance acts as a consistent heuristic for transcontinental flight path optimization.',
      'Microprocessor Synthesis: Timing closure algorithms routing critical logic paths under strict monotone delay bounds.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Can you give an example of a heuristic that is admissible but INCONSISTENT?" Answer: Yes! In a graph with Start -> A -> Goal, set true costs: c(S,A)=1, c(A,G)=3, c(S,G)=4. Let h(S)=3, h(A)=0, h(G)=0. h is admissible everywhere, but across step S->A: h(S)=3 > c(S,A) + h(A) = 1 + 0 = 1. Triangle inequality is violated!',
    pitfalls: [
      {
        misconception: 'Believing that an admissible heuristic is automatically consistent.',
        correction:
          'While almost all practical heuristics are both, an admissible heuristic can technically be inconsistent if h drops faster than step cost c across a transition.',
      },
    ],
    presetId: 'weighted_swamp',
    algId: 'astar',
    actionText: 'Load Consistent A* on Mud Swamp',
    vivaQuestions: [
      {
        question: "Prove why Consistency is required for Graph Search A*, while Admissibility suffices for Tree Search A*.",
        answer: "In Tree Search, paths never merge, so expanding a node along an optimal path is sufficient. In Graph Search, duplicate states are pruned via the Closed List. If h is inconsistent, A* can expand a node via a suboptimal path first and close it; when the cheaper path arrives later, it gets discarded unless nodes are reopened.",
        examinerTip: "Consistency guarantees that f(n) is monotonically non-decreasing along every path: f(n') >= f(n).",
      },
      {
        question: "What is the critical algorithmic benefit of a consistent heuristic in Graph Search A*?",
        answer: "When a node n is selected and popped from the priority queue, its path cost g(n) is guaranteed to be strictly optimal. Consequently, no closed node ever needs to be reopened or updated, maintaining strict O(1) closed-set operations and fast termination.",
        examinerTip: "Examiners look for the phrase \"no reopening of closed nodes required\".",
      },
      {
        question: "Prove mathematically that consistency implies admissibility.",
        answer: "Proof by induction on distance to goal: If h is consistent, h(n) <= c(n, a, n') + h(n'). For goal node G, h(G) = 0. For any node n k steps from goal along optimal path (n=n_0, n_1, ..., n_k=G): h(n) <= c(n_0, n_1) + h(n_1) <= ... <= sum_{i=0}^{k-1} c(n_i, n_{i+1}) + h(G) = h*(n). Thus, h(n) <= h*(n).",
        examinerTip: "Show that setting h(G) = 0 collapses the telescoping sum to the true optimal cost h*(n).",
      },
      {
        question: "Can a heuristic be admissible but inconsistent? Provide a concrete counterexample.",
        answer: "Yes! Consider Start S, intermediate A, and Goal G. Edges: S->A (cost 1), A->G (cost 4), S->G (cost 6). Optimal costs: h*(S)=5, h*(A)=4, h*(G)=0. Choose heuristic: h(S)=4, h(A)=1, h(G)=0. Both are <= h* so h is admissible. But for edge S->A: h(S) = 4 > c(S,A) + h(A) = 1 + 1 = 2! Triangle inequality is violated, so h is inconsistent.",
        examinerTip: "Sketch this 3-node triangle on paper during viva exams; examiners love concrete numerical examples.",
      }
    ],
    quiz: {
      question: 'What is the critical algorithmic benefit of a consistent heuristic in Graph Search A*?',
      options: [
        'It eliminates the need to compute g(n)',
        'It guarantees that the first time a node is expanded, the optimal path to it has been found, avoiding node reopening',
        'It reduces space complexity to O(1)',
        'It converts A* into Depth-First Search',
      ],
      correctIndex: 1,
      explanation:
        'Correct! Consistency ensures f(n) is monotonically non-decreasing, guaranteeing that when a node is popped for expansion, its g-cost is strictly optimal.',
    },
  },

  {
    id: 11,
    title: 'Lesson 11: Heuristic Metrics & Dominance Analysis (Manhattan vs Euclidean vs Octile)',
    module: 'Heuristics',
    moduleLabel: 'Module 3: Informed Search',
    badge: 'Metric Science',
    estMinutes: 7,
    complexity: {
      time: 'Expansions(h2) <= Expansions(h1) if h2 dominates h1',
      space: 'Reduced frontier size with tighter heuristic',
      completeness: 'Complete',
      optimality: 'Guaranteed optimal if admissible',
    },
    formalDefinition: {
      math: 'h_2 \\text{ dominates } h_1 \\iff \\forall n, \\; h_2(n) \\ge h_1(n) \\land h_2(n) \\le h^*(n)',
      description: 'A heuristic h2 dominates h1 if it is closer to the true cost h* everywhere without overestimating.',
    },
    concept:
      'Heuristic Dominance is the gold standard of heuristic design. A dominant heuristic prunes strictly more search space, shrinking the expanded set without sacrificing optimality.',
    inDepthExplanation: [
      'Manhattan Distance (L1 norm): |r1 - r2| + |c1 - c2|. Exact for 4-directional grid movement without obstacles. Strictly dominates Euclidean distance on 4-way grids.',
      'Euclidean Distance (L2 norm): sqrt(dr^2 + dc^2). Straight-line metric. Admissible for both 4-way and 8-way grids, but weaker on 4-way grids because it underestimates grid travel.',
      'Octile Distance: max(dr, dc) + (sqrt(2) - 1) * min(dr, dc). The exact admissible metric for 8-directional movement where diagonal moves cost sqrt(2) approx 1.414.',
      'The Dominance Theorem: If h2 dominates h1, every node expanded by A* with h2 (where f(n) < C*) is also expanded by A* with h1. Therefore, expansions(h2) <= expansions(h1) always!',
    ],
    keyTeachingPoints: [
      'Definition of Dominance: If h2(n) >= h1(n) for all states n, and both are admissible, then h2 dominates h1.',
      'Direct Pruning Power: A* with h2 will never expand more nodes with f(n) < C* than A* with h1. Higher admissible values pull nodes closer to C*, triggering earlier pruning.',
      'Metric Alignment with Action Space: 4-way movements match L1 (Manhattan). Diagonal movements match Octile. Free continuous motion matches L2 (Euclidean).',
    ],
    mathematicalDerivation: {
      title: 'Formal Proof of the Heuristic Dominance Theorem',
      steps: [
        'Recall that A* expands all nodes with f(n) < C*.',
        'For any node n, f_1(n) = g(n) + h_1(n) and f_2(n) = g(n) + h_2(n).',
        'Since h_2 dominates h_1, h_2(n) >= h_1(n), so f_2(n) >= f_1(n) for all n.',
        'Now consider any node expanded by A* using h_2: this implies f_2(n) < C*.',
        'Since f_1(n) <= f_2(n), it follows that f_1(n) < C* must also hold!',
        'Therefore, every node expanded under h_2 MUST also be expanded under h_1.',
      ],
      conclusion: 'Expansions(h_2) <= Expansions(h_1). Tighter heuristics guarantee strictly equal or fewer node expansions.',
    },
    industrialApplications: [
      'Industrial Pick-and-Place Gantry Robots: 2-axis orthogonal gantries use Manhattan distance to calculate exact actuator travel times.',
      'Drone 3D Waypoint Navigation: 3D Euclidean L2 norm used for obstacle avoidance in open airspace.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Can we use Manhattan distance on an 8-way grid with diagonal movement?" Answer: NO! A diagonal move costs sqrt(2) ~ 1.41, but Manhattan estimates cost 1+1=2. Manhattan overestimates and is INADMISSIBLE for 8-way grids.',
    pitfalls: [
      {
        misconception: 'Using Manhattan distance on an 8-directional (diagonal) grid.',
        correction:
          'Fatal Error! On 8-way grids, Manhattan distance overestimates the cost of diagonal shortcuts (giving cost 2 instead of sqrt(2) approx 1.414), violating admissibility!',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'astar',
    heuristic: 'manhattan',
    actionText: 'Compare Dominant Manhattan vs Euclidean',
    vivaQuestions: [
      {
        question: "Why does Manhattan distance dominate Euclidean distance on a 4-directional grid?",
        answer: "On a 4-connected grid, any move is strictly horizontal or vertical with cost 1. By the Pythagorean theorem, sqrt(dx^2 + dy^2) <= dx + dy. Thus, for all non-diagonal coordinates, h_Euclidean(n) <= h_Manhattan(n) <= h*(n). Because Manhattan is closer to the true cost without exceeding it, it dominates Euclidean.",
        examinerTip: "Higher admissible heuristic values guarantee fewer node expansions.",
      },
      {
        question: "If heuristic h2 dominates heuristic h1, what is guaranteed regarding A* search performance?",
        answer: "A* using h2 will expand a subset of the nodes expanded by A* using h1 (excluding tie-breaking differences). Every node expanded by A* with h2 will also be expanded by A* with h1, so h2 is guaranteed to be computationally more efficient.",
        examinerTip: "State the formal definition: For all n, h2(n) >= h1(n) and h2 is admissible.",
      },
      {
        question: "Why is Manhattan distance inadmissible on an 8-directional grid where diagonal motion costs sqrt(2)?",
        answer: "On an 8-directional grid, moving diagonally from (0,0) to (1,1) takes 1 step of cost 1.414 (sqrt(2)). However, Manhattan distance computes |1-0| + |1-0| = 2.0. Since 2.0 > 1.414, Manhattan overestimates the true lowest cost, violating admissibility and breaking A* optimality.",
        examinerTip: "Always check if diagonal motion is enabled before recommending Manhattan distance.",
      },
      {
        question: "What is the Octile distance, and why is it both admissible and consistent for 8-connected grid navigation?",
        answer: "Octile distance allows moving diagonally for min(dx, dy) steps at cost sqrt(2) and orthogonally for |dx - dy| steps at cost 1: h(n) = (sqrt(2) - 1) * min(dx, dy) + max(dx, dy). It represents the exact shortest path on an obstacle-free 8-connected grid, guaranteeing both admissibility and consistency.",
        examinerTip: "Write out the Octile formula: h(n) = (1.414 - 1)*min + max.",
      }
    ],
    quiz: {
      question: 'If heuristic h2 dominates heuristic h1, what is guaranteed regarding A* search performance?',
      options: [
        'A* with h2 will expand at most the same number of nodes as A* with h1 (with f < C*)',
        'A* with h2 will use less memory than DFS',
        'A* with h2 will find a cheaper path than A* with h1',
        'A* with h2 has a higher time complexity',
      ],
      correctIndex: 0,
      explanation:
        'Correct! By the Heuristic Dominance Theorem, A* using the dominating heuristic will never expand more non-goal nodes than A* using the weaker heuristic.',
    },
  },

  // -------------------------------------------------------------
  // MODULE 4: MEMORY-BOUNDED & LOCAL SEARCH
  // -------------------------------------------------------------
  {
    id: 12,
    title: 'Lesson 12: Overcoming RAM Exhaustion with Iterative Deepening A* (IDA*)',
    module: 'LocalSearch',
    moduleLabel: 'Module 4: Memory & Local',
    badge: 'Memory-Bounded',
    estMinutes: 7,
    complexity: {
      time: 'O(b^d) tree-search overhead',
      space: 'O(b * d) strictly linear memory',
      completeness: 'Complete on finite state spaces',
      optimality: 'Optimal for admissible heuristics',
    },
    formalDefinition: {
      math: '\\text{Threshold}_{k+1} = \\min \\{ f(n) \\mid n \\text{ generated with } f(n) > \\text{Threshold}_k \\}',
      description:
        'IDA* performs DFS bounded by an f-cost threshold. The next threshold is set to the smallest f-cost that exceeded the previous bound.',
    },
    concept:
      'Standard A* exhausts RAM rapidly on large problems (e.g. 15-puzzle, Rubik’s cube). IDA* solves this by executing depth-first iterations bounded by f(n), operating in strictly linear memory O(bd) while preserving cost optimality.',
    inDepthExplanation: [
      'The Memory Crisis: A* must store every generated node in RAM. For complex problems, open lists balloon to tens of gigabytes within seconds.',
      'IDA* Mechanics: Iteration 0 sets threshold = h(start). A DFS traversal is launched; any branch exceeding the threshold is pruned, and the minimum exceeded f-value is tracked.',
      'Threshold Escalation: When the iteration completes without finding the goal, the threshold is updated to the minimum exceeded f-value, and a new DFS traversal begins.',
      'Optimal Guarantee: Because thresholds increase monotonically and pruning only discards paths known to exceed the current bound, the first goal reached is guaranteed to be optimal if h is admissible.',
    ],
    keyTeachingPoints: [
      'The Memory Wall Breaker: IDA* requires only O(b*d) memory. For the 15-puzzle (10^13 states), A* crashes due to memory in seconds; IDA* solves it using only kilobytes of RAM.',
      'f-Cost Contour Slicing: Each iteration of IDA* explores a contour of states where f(n) <= Threshold. When the contour yields no goal, the threshold expands to the smallest f-value that spilled outside.',
      'No Closed List Required: Because each pass is depth-first, memory does not scale with total explored states.',
    ],
    mathematicalDerivation: {
      title: 'Threshold Update Invariant in IDA*',
      steps: [
        'Let T_k be the current f-cost cutoff threshold.',
        'During depth-first traversal, if f(n) > T_k, prune branch and record min_exceeded = min(min_exceeded, f(n)).',
        'Set next threshold: T_{k+1} = min_exceeded.',
        'By definition, no state in the entire state space has an f-value strictly between T_k and T_{k+1}.',
        'Therefore, the next iteration is guaranteed to explore at least one new state without skipping any possible optimal candidate.',
      ],
      conclusion: 'IDA* expands strictly concentric f-contours and guarantees cost optimality when h is admissible.',
    },
    industrialApplications: [
      'Combinatorial Puzzle Solvers: World-record solvers for 15-puzzle, 24-puzzle, and Rubik’s Cube (Korf’s algorithm).',
      'Automated Planning (PDDL Planners): Solving logistics scheduling tasks with thousands of state variables.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "What is the primary weakness of IDA* on continuous-cost graphs?" Answer: If every path has a unique real-valued cost (e.g. 10.001, 10.002), each iteration might only expand ONE new node, causing O(N^2) time explosion.',
    pitfalls: [
      {
        misconception: 'Believing IDA* is slow because it re-explores shallow nodes.',
        correction:
          'In domains with geometric branching (e.g. 15-puzzle), the final iteration accounts for over 90% of total computation, making earlier iterations a minor overhead.',
      },
    ],
    presetId: 'classic_labyrinth',
    algId: 'idastar',
    actionText: 'Observe IDA* Threshold Iterations',
    vivaQuestions: [
      {
        question: "Why is IDA* the algorithm of choice for solving the 15-puzzle and Rubik's Cube rather than standard A*?",
        answer: "Because the state space for the 15-puzzle (approx 10^13 states) and Rubik's Cube (4.3 * 10^19 states) requires gigabytes to terabytes of RAM to store the open and closed lists in A*. IDA* reduces space complexity to O(b * d) linear memory, fitting in kilobytes of RAM while guaranteeing optimality.",
        examinerTip: "Cite Korf (1985), who solved the 15-puzzle optimally for the first time using IDA*.",
      },
      {
        question: "How is the next f-cost threshold determined in Iterative Deepening A* (IDA*)?",
        answer: "At each iteration, DFS explores all branches where f(n) <= threshold. Whenever a branch is pruned because f(n) > threshold, the algorithm records this exceeded value. The threshold for the next iteration is set to the minimum f-cost among all pruned nodes.",
        examinerTip: "Never say the threshold increases by 1! It increases to the minimum f-cost that exceeded the previous threshold.",
      },
      {
        question: "What is the spatial complexity of IDA*, and why does it overcome the memory bottleneck of standard A*?",
        answer: "Space complexity is O(d) or O(b * d) linear in search depth d. IDA* uses depth-first recursion, only keeping the current search path and sibling nodes in memory. Unlike A*, it does not maintain an exponential Open List or Closed List.",
        examinerTip: "Emphasize that IDA* trades CPU time (re-expanding shallow iterations) to eliminate memory exhaustion.",
      },
      {
        question: "What is the primary pathological failure case of IDA* in domains with continuous or real-valued edge costs?",
        answer: "If every path has a unique real-valued f-cost (e.g. Euclidean distances with floating-point numbers), each iteration increases the threshold by an infinitesimal epsilon and only expands one additional node. The algorithm devolves into O(N^2) iterations, becoming unacceptably slow.",
        examinerTip: "Mention that SMA* (Simplified Memory-Bounded A*) or RBFS (Recursive Best-First Search) are alternatives for continuous domains.",
      }
    ],
    quiz: {
      question: 'How is the next f-cost threshold determined in Iterative Deepening A* (IDA*)?',
      options: [
        'Threshold is incremented by 1.0 each time',
        'Threshold is set to the minimum f-value among all nodes that exceeded the previous cutoff',
        'Threshold is doubled geometrically',
        'Threshold is set to h(goal)',
      ],
      correctIndex: 1,
      explanation:
        'Correct! IDA* sets the next iteration bound to the minimum f-cost among all pruned branches, ensuring no valid optimal candidate is skipped.',
    },
  },

  {
    id: 13,
    title: 'Lesson 13: Local Search — Hill Climbing & State-Space Landscape Pathology',
    module: 'LocalSearch',
    moduleLabel: 'Module 4: Memory & Local',
    badge: 'Local Search',
    estMinutes: 7,
    complexity: {
      time: 'O(k) where k is step count to peak',
      space: 'O(1) constant memory (stores only current state)',
      completeness: 'Incomplete (trapped in local optima)',
      optimality: 'Non-optimal',
    },
    formalDefinition: {
      math: 's_{next} = \\arg\\min_{s\' \\in \\text{Neighbors}(s)} h(s\'), \\quad \\text{halt if } h(s_{next}) \\ge h(s)',
      description:
        'Steepest descent hill climbing evaluates immediate neighbors and moves greedily to the neighbor with lowest heuristic distance.',
    },
    concept:
      'Unlike frontier-based pathfinding, Local Search only stores the single current state, using O(1) constant memory. However, without memory or backtracking, it is vulnerable to local minima, plateaus, and ridges.',
    inDepthExplanation: [
      'The Paradigm Shift: In local search, the path to the goal is irrelevant; only the final goal state matters (e.g. 8-Queens problem, VLSI circuit layout).',
      'Pathology 1 — Local Optima: A state whose neighbors all have worse (higher) heuristic values than itself, but which is NOT the global goal. Hill climbing halts immediately.',
      'Pathology 2 — Plateaus & Shoulders: A flat region where all neighbors have identical heuristic value. Steepest ascent has no gradient to guide direction.',
      'Pathology 3 — Ridges: A sequence of local maxima where the slope gently rises toward the peak, but navigation requires zigzagging because orthogonal steps descend.',
    ],
    keyTeachingPoints: [
      'Zero-Memory Search: Local search maintains NO search tree, NO frontier, and NO closed list—only the single current state configuration in O(1) space.',
      'The U-Trap Vulnerability: In a concave wall trap, moving out requires temporarily increasing heuristic distance h. Hill climbing strictly rejects any uphill move, locking itself permanently in the trap.',
      'Path Invariance: Local search is designed for state-optimization problems where the journey does not matter (e.g. optimal antenna shape), unlike pathfinding where the journey IS the solution.',
    ],
    mathematicalDerivation: {
      title: 'Local Optimum Trapping Condition in Gradient Landscapes',
      steps: [
        'Let s be the current state with evaluation h(s).',
        'Let N(s) be the set of all valid neighbor states reachable in one step.',
        'Definition of Local Minimum: for all s\' in N(s), h(s\') >= h(s).',
        'Definition of Global Minimum: s* such that h(s*) = 0 (or h(s*) <= h(x) for all x in S).',
        'If s is a local minimum and s != s*, the steepest descent rule argmin_{s\'} h(s\') finds no strictly better neighbor.',
        'The algorithm terminates and reports state s as the solution.',
      ],
      conclusion: 'Hill climbing is fundamentally incomplete without stochastic escape mechanisms.',
    },
    industrialApplications: [
      'Antenna & Aerodynamic Wing Optimization: Tuning continuous geometric parameters to maximize signal strength or lift.',
      'Deep Learning Gradient Descent: Neural network weight training using stochastic gradient descent (SGD).',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Can Hill Climbing ever be used for maze pathfinding?" Answer: Generally NO, because pathfinding requires finding the PATH, whereas local search throws away past transitions and only remembers where it currently stands.',
    pitfalls: [
      {
        misconception: 'Assuming Hill Climbing fails only when walls or obstacles physically block movement.',
        correction:
          'Hill Climbing fails whenever the heuristic landscape has a local minimum—even in completely open space with non-monotonic terrain costs!',
      },
    ],
    presetId: 'local_optimum_trap',
    algId: 'hill_climbing',
    actionText: 'Load U-Trap to see Hill Climbing Fail',
    vivaQuestions: [
      {
        question: "Why does steepest ascent Hill Climbing get trapped in a U-shaped concave wall even when a valid path exists?",
        answer: "Hill Climbing is a pure local search algorithm that only looks at immediate neighbors and picks the one with the best evaluation. Inside a U-shaped obstacle, moving toward the goal hits a wall, and moving around the wall temporarily worsens the heuristic. Since Hill Climbing refuses non-improving moves, it halts at a local optimum.",
        examinerTip: "Point out that Hill Climbing has no memory (no frontier or parent pointers) and cannot backtrack.",
      },
      {
        question: "What is the space complexity of standard Hill Climbing, and why is it classified as an \"anytime\" algorithm?",
        answer: "Space complexity is O(1) constant memory because it stores only the current state. It is an \"anytime\" algorithm because search can be interrupted at any millisecond and it will return the best state found so far.",
        examinerTip: "Highlight the contrast between systematic search (A*, BFS) and local search (Hill Climbing).",
      },
      {
        question: "Distinguish between a local maximum, a ridge, and a plateau (shoulder) in state-space landscape topology.",
        answer: "A local maximum is a state higher than all its neighbors. A plateau is a flat region where all neighbors have the same heuristic value (a shoulder is a plateau with an uphill exit). A ridge is a sequence of local maxima where the slope gently climbs in a direction not aligned with single coordinate actions.",
        examinerTip: "Draw a ridge on a whiteboard: moving North, South, East, or West falls off the ridge, even though the ridge itself ascends northeast.",
      },
      {
        question: "What is the algorithmic difference between Steepest-Ascent Hill Climbing, Stochastic Hill Climbing, and First-Choice Hill Climbing?",
        answer: "Steepest-Ascent evaluates all successors and picks the single best one. Stochastic Hill Climbing chooses at random from among uphill moves with probability proportional to the improvement steepness. First-Choice generates successors randomly one by one until finding one that is better than the current state.",
        examinerTip: "First-Choice is especially effective when states have thousands of successors.",
      }
    ],
    quiz: {
      question: 'What is the space complexity of standard Hill Climbing?',
      options: ['O(b^d)', 'O(b * m)', 'O(1) constant memory', 'O(|V| + |E|)'],
      correctIndex: 2,
      explanation:
        'Correct! Hill Climbing only maintains the current state in memory and its immediate evaluated neighbors, giving it O(1) constant space complexity.',
    },
  },

  {
    id: 14,
    title: 'Lesson 14: Escaping Local Traps — Sideways Moves, Random Restarts & Annealing',
    module: 'LocalSearch',
    moduleLabel: 'Module 4: Memory & Local',
    badge: 'Optimization Strategies',
    estMinutes: 7,
    complexity: {
      time: 'Probabilistically complete with restarts',
      space: 'O(1) constant memory',
      completeness: 'Complete with random restarts in finite space',
      optimality: 'Approaches optimum with cooling schedule',
    },
    formalDefinition: {
      math: 'P(\\text{accept worse state}) = e^{-\\Delta E / T}, \\quad \\Delta E = h(s\') - h(s), \\quad T = \\text{Temperature}',
      description:
        'Simulated Annealing allows probabilistic downhill moves governed by the Metropolis criterion to escape local minima.',
    },
    concept:
      'To overcome the fragility of simple hill climbing, advanced local search techniques introduce controlled stochasticity: sideways moves crawl across flat plateaus, random restarts re-seed exploration, and simulated annealing escapes valleys.',
    inDepthExplanation: [
      'Sideways Move Allowance: When all neighbors have delta_h = 0, allowing up to k consecutive equal-cost moves enables the agent to cross shoulders and flat plateaus. A loop-detection cap is required to prevent infinite wandering.',
      'Random-Restart Hill Climbing: If an iteration gets stuck, re-seed from a uniformly distributed random starting state. Theorem: If the probability of success from any start is p, expected restarts to find global goal is 1/p.',
      'Simulated Annealing (Kirkpatrick 1983): Inspired by metallurgy. If a neighbor is better (delta_E < 0), always accept it. If a neighbor is worse (delta_E > 0), accept it with probability P = exp(-delta_E / T).',
      'The Cooling Schedule: At high initial temperature T, the agent explores freely. As T gradually cools toward 0, the agent transitions smoothly into greedy hill climbing.',
    ],
    keyTeachingPoints: [
      'Sideways Moves for Plateaus: Allowing sideways moves (delta_h = 0) enables crossing flat ridges, but requires a strict threshold (e.g. max 25 steps) to prevent infinite oscillation.',
      'The Power of Random Restarts: Random-restart hill climbing is complete with probability 1 as the number of restarts approaches infinity in finite state spaces.',
      'The Metropolis Criterion: In Simulated Annealing, the probability of accepting an inferior move decreases exponentially with the magnitude of worsening (delta_E) and with cooling temperature T.',
    ],
    mathematicalDerivation: {
      title: 'Convergence Proof of Random-Restart Hill Climbing',
      steps: [
        'Let p > 0 be the probability that a single hill-climbing run from a random start reaches the global optimum.',
        'The probability that a single run fails to find the global optimum is 1 - p.',
        'The probability that k independent restarts all fail is (1 - p)^k.',
        'As k -> infinity: lim_{k -> infty} (1 - p)^k = 0 (since 0 < 1 - p < 1).',
        'Expected number of restarts to find the global optimum: E[restarts] = 1 / p.',
      ],
      conclusion: 'Random-restart hill climbing achieves guaranteed completeness with probability 1.0 on finite spaces.',
    },
    industrialApplications: [
      'FPGA Placement and Routing: Simulated annealing is the industry standard for placing millions of logic gates on silicon chips.',
      'Protein Folding Simulation: Searching astronomical conformational state spaces for minimum free-energy configurations.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "If Simulated Annealing cools temperature T instantly to 0, what does it become?" Answer: It collapses immediately into standard greedy Hill Climbing with zero chance of escaping local minima.',
    pitfalls: [
      {
        misconception: 'Allowing unlimited sideways moves without a step counter.',
        correction:
          'If two plateau states have identical heuristic values, unlimited sideways moves will cause the agent to bounce infinitely between them in an endless cycle.',
      },
    ],
    presetId: 'local_optimum_trap',
    algId: 'hill_climbing',
    actionText: 'Test Hill Climbing with Sideways Moves',
    vivaQuestions: [
      {
        question: "What is the Metropolis acceptance criterion in Simulated Annealing, and how does temperature T control search behavior?",
        answer: "When a downhill (worse) move with Delta E < 0 is evaluated, it is accepted with probability P = e^(Delta E / T). When temperature T is high, P approaches 1 (behaving like random walk to escape local traps). As T gradually cools toward zero, P approaches 0 (behaving like pure greedy hill climbing to converge).",
        examinerTip: "Write out P = e^(Delta E / T) and explain the Boltzmann factor analogy from metallurgy physics.",
      },
      {
        question: "Why does Random-Restart Hill Climbing guarantee completeness on finite state spaces as restarts approach infinity?",
        answer: "Let p be the probability of success from any single randomly chosen starting state (p > 0). The probability of failure after k independent restarts is (1 - p)^k. As k approaches infinity, (1 - p)^k approaches 0, guaranteeing that the global optimum is discovered with probability 1.",
        examinerTip: "Mention the expected number of restarts required: 1 / p.",
      },
      {
        question: "In Simulated Annealing, what happens if the temperature cooling schedule T(t) decreases too rapidly (quenching)?",
        answer: "If the system cools too quickly (quenching), the algorithm freezes into the nearest local optimum before having adequate probability to escape concave basins or ridges, defeating the purpose of annealing.",
        examinerTip: "Refer to the Kirkpatrick annealing schedule where T decreases logarithmically or geometrically (T_{k+1} = alpha * T_k).",
      },
      {
        question: "What is the difference between Hill Climbing with sideways moves vs Tabu Search?",
        answer: "Hill Climbing with sideways moves allows moving to neighbors with equal heuristic value up to a capped limit (e.g. 100 moves) to cross plateaus, but risks infinite looping. Tabu Search maintains a short-term memory (Tabu list) of recently visited states, strictly forbidding revisiting them to force exploration of new territory.",
        examinerTip: "Tabu search is a favorite in operations research and combinatorial scheduling exams.",
      }
    ],
    quiz: {
      question: 'Why does Random-Restart Hill Climbing guarantee completeness on finite state spaces as restarts approach infinity?',
      options: [
        'Because the probability of failing approaches (1 - p)^k = 0 as k -> infinity',
        'Because it uses an admissible heuristic',
        'Because it converts into BFS',
        'Because it stores all explored states',
      ],
      correctIndex: 0,
      explanation:
        'Correct! If each random restart has a non-zero probability p of hitting a basin of attraction to the goal, the probability of failing k times in a row is (1 - p)^k, which converges to 0 as k increases.',
    },
  },

  // -------------------------------------------------------------
  // MODULE 5: REAL-WORLD BENCHMARKS & EXAM MASTERY
  // -------------------------------------------------------------
  {
    id: 15,
    title: 'Lesson 15: Graph Networks — The Romania Road Map (AIMA Benchmark)',
    module: 'AdvancedRealWorld',
    moduleLabel: 'Module 5: Real-World & Viva',
    badge: 'AIMA Benchmark',
    estMinutes: 8,
    complexity: {
      time: 'Graph-dependent O(|V| + |E|)',
      space: 'O(|V|) graph state space',
      completeness: 'Complete with cycle detection',
      optimality: 'UCS & A* optimal; Greedy suboptimal',
    },
    formalDefinition: {
      math: 'h_{SLD}(c) = \\text{Straight-Line Distance from city } c \\text{ to Bucharest}',
      description:
        'The canonical Russell & Norvig 20-city Romania network routing from Arad to Bucharest using straight-line Euclidean distance.',
    },
    concept:
      'The Romania road network is the world’s most famous AI textbook benchmark. It demonstrates how straight-line distance acts as a natural admissible heuristic, and why Greedy Best-First Search gets tricked into a suboptimal route.',
    inDepthExplanation: [
      'Problem Setup: 20 Romanian cities connected by roads with real highway distances. Start at Arad, destination Bucharest. Straight-line distance (SLD) to Bucharest is the heuristic.',
      'The Greedy Trapping Demonstration: At Sibiu, Greedy evaluates Fagaras (SLD=176) vs Rimnicu Vilcea (SLD=193). Fagaras appears closer straight-line! Greedy takes Fagaras -> Bucharest, yielding a 450 km path (140 + 99 + 211).',
      'The A* Optimal Path: A* evaluates f = g + h. At Sibiu, f(Fagaras) = 239 + 176 = 415 km, while f(RimnicuVilcea) = 220 + 193 = 413 km. A* chooses Rimnicu Vilcea -> Pitesti -> Bucharest, discovering the true optimal 418 km path!',
      'Heuristic Consistency: Because straight-line distance obeys Euclidean geometry, the straight-line distance between two cities is always <= the true winding road distance, guaranteeing admissibility and consistency.',
    ],
    keyTeachingPoints: [
      'The Canonical Benchmark: Created by Stuart Russell & Peter Norvig for "Artificial Intelligence: A Modern Approach" (AIMA).',
      'The 32 km Suboptimality Delta: Greedy chooses the Fagaras route (450 km) because Fagaras looks closer straight-line (176 km vs 193 km). A* evaluates f = g + h and correctly routes through Rimnicu Vilcea and Pitesti (418 km).',
      'Natural Admissibility Proof: In any physical road network, no road can be shorter than straight-line distance (the shortest distance between two points on Earth). Therefore, h_SLD is strictly admissible.',
    ],
    mathematicalDerivation: {
      title: 'Straight-Line Distance (SLD) Consistency Proof via Triangle Inequality',
      steps: [
        'Let c_1 and c_2 be two adjacent cities connected by a road segment of length road_cost(c_1, c_2).',
        'In Euclidean geometry, the straight-line distance between c_1 and c_2 is SLD(c_1, c_2) <= road_cost(c_1, c_2).',
        'Consider the triangle formed by c_1, c_2, and Bucharest.',
        'By the Euclidean Triangle Inequality: SLD(c_1, Bucharest) <= SLD(c_1, c_2) + SLD(c_2, Bucharest).',
        'Since SLD(c_1, c_2) <= road_cost(c_1, c_2): SLD(c_1, Bucharest) <= road_cost(c_1, c_2) + SLD(c_2, Bucharest).',
      ],
      conclusion: 'This exactly matches the Consistency condition h(n) <= c(n,a,n\') + h(n\'). Therefore, SLD is consistently admissible.',
    },
    industrialApplications: [
      'Commercial GPS Navigation (TomTom / Garmin / Google Maps): Routing algorithms using straight-line distance heuristics over million-node highway networks.',
      'Airline Flight Scheduling: Great-circle distance routing across global airport hubs.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Why does A* expand Rimnicu Vilcea before Fagaras even though Rimnicu Vilcea has a HIGHER heuristic value (193 km vs 176 km)?" Answer: Because A* evaluates f = g + h. g(Rimnicu) = 140+80=220 km, f=220+193=413 km; g(Fagaras) = 140+99=239 km, f=239+176=415 km. Since 413 < 415, A* correctly prioritizes Rimnicu Vilcea!',
    traceExample: {
      description: 'Routing Arad to Bucharest comparison:',
      steps: [
        {
          step: 1,
          node: 'Arad',
          action: 'Expand',
          g: 0,
          h: 366,
          f: 366,
          frontier: '[Zerind(374), Timisoara(329), Sibiu(253)]',
          explored: '{Arad}',
          comment: 'Sibiu has lowest f-cost 140+253=393.',
        },
        {
          step: 2,
          node: 'Sibiu',
          action: 'Expand',
          g: 140,
          h: 253,
          f: 393,
          frontier: '[Fagaras(f=415), RimnicuVilcea(f=413)]',
          explored: '{Arad,Sibiu}',
          comment: 'A* picks Rimnicu Vilcea (f=413) over Fagaras (f=415)!',
        },
        {
          step: 3,
          node: 'Pitesti',
          action: 'Expand',
          g: 317,
          h: 100,
          f: 417,
          frontier: '[Bucharest(f=418)]',
          explored: '{...}',
          comment: 'Optimal path Arad-Sibiu-Rimnicu-Pitesti-Bucharest = 418 km discovered!',
        },
      ],
    },
    pitfalls: [
      {
        misconception: 'Assuming Greedy search always takes the same route as A* on road maps.',
        correction:
          'On the Romania graph, Greedy takes Arad -> Sibiu -> Fagaras -> Bucharest (450 km), which is 32 km longer than the optimal route found by A* (418 km).',
      },
    ],
    presetId: 'romania',
    algId: 'astar',
    problemType: 'graph',
    actionText: 'Load Romania Road Map with A*',
    vivaQuestions: [
      {
        question: "Why does Greedy Best-First Search pick Fagaras over Rimnicu Vilcea in the Romania problem, and why is this decision suboptimal?",
        answer: "From Sibiu, Fagaras has straight-line distance h=178 km to Bucharest, while Rimnicu Vilcea has h=193 km. Greedy only looks at h, so it chooses Fagaras. However, the road from Sibiu to Fagaras is 99 km + 211 km = 310 km, whereas via Rimnicu Vilcea and Pitesti is 80 + 97 + 101 = 278 km (32 km shorter).",
        examinerTip: "This is the standard AIMA benchmark textbook example by Russell & Norvig; memorize the costs 310 km vs 278 km.",
      },
      {
        question: "What is the optimal path cost from Arad to Bucharest on the classic Romania road network?",
        answer: "The optimal path is Arad -> Sibiu -> Rimnicu Vilcea -> Pitesti -> Bucharest, with a total cost of 140 + 80 + 97 + 101 = 418 km.",
        examinerTip: "Examiners often test if candidates recall the optimal path sequence and total cost 418.",
      },
      {
        question: "Why is straight-line distance (SLD) guaranteed to be both admissible and consistent on 2D geographic road networks?",
        answer: "Because the shortest distance between any two points in Euclidean space is a straight line. Real roads must curve or navigate terrain, so road distance is always >= SLD, ensuring admissibility. By the triangle inequality, SLD(A, G) <= SLD(A, B) + SLD(B, G) <= Road(A, B) + SLD(B, G), ensuring consistency.",
        examinerTip: "Cite the triangle inequality on Euclidean coordinates.",
      },
      {
        question: "Trace why A* expands Rimnicu Vilcea (f=413) and Pitesti (f=417) before reaching Bucharest (f=418), while avoiding Fagaras (f=450).",
        answer: "At Sibiu, A* evaluates: via Fagaras g=239, h=178 -> f=417; via Rimnicu Vilcea g=220, h=193 -> f=413. Rimnicu Vilcea has lower f so it expands first, yielding Pitesti with g=317, h=100 -> f=417. Pitesti yields Bucharest with g=418, h=0 -> f=418. Fagaras yields Bucharest with g=450, h=0 -> f=450. A* pops Bucharest (418) before Fagaras-Bucharest (450).",
        examinerTip: "Walking through this numerical trace during viva demonstrates mastery of the A* priority queue.",
      }
    ],
    quiz: {
      question: 'What is the optimal path cost from Arad to Bucharest on the classic Romania road network?',
      options: [
        '450 km (via Fagaras)',
        '418 km (via Rimnicu Vilcea and Pitesti)',
        '366 km (straight line)',
        '502 km (via Craiova)',
      ],
      correctIndex: 1,
      explanation:
        'Correct! The optimal path found by UCS and A* is Arad -> Sibiu -> Rimnicu Vilcea -> Pitesti -> Bucharest with a total road cost of 418 km.',
    },
  },

  {
    id: 16,
    title: 'Lesson 16: Disconnected Goals, Completeness & Infinite Loop Traps',
    module: 'AdvancedRealWorld',
    moduleLabel: 'Module 5: Real-World & Viva',
    badge: 'Exam Mastery',
    estMinutes: 7,
    complexity: {
      time: 'Explores all |V_reachable| states',
      space: 'Requires O(|V|) memory to store closed set',
      completeness: 'Complete algorithms cleanly declare failure',
      optimality: 'N/A (no path exists)',
    },
    formalDefinition: {
      math: '\\text{Frontier} = \\emptyset \\implies \\text{Halt with failure (Goal Unreachable)}',
      description:
        'Completeness requires that when no path exists, the algorithm must exhaust all reachable states and cleanly terminate declaring failure.',
    },
    concept:
      'A robust search algorithm must not only find solutions when they exist, but also gracefully detect when a goal is completely disconnected. Without proper cycle prevention, algorithms spin in infinite loops rather than reporting failure.',
    inDepthExplanation: [
      'The Unreachable Fortress Test: The goal is enclosed within an impenetrable barrier. No valid path exists in the state space.',
      'Completeness Definition: An algorithm is complete if it is guaranteed to either: 1) find a solution if one exists, OR 2) correctly halt and report failure when no solution exists.',
      'The Frontier Empty Invariant: When the Frontier becomes empty and no goal has been popped, the search space has been mathematically exhausted. Complete algorithms cleanly declare failure.',
      'Failure Modes of Incomplete Algorithms: Tree Search without a closed list will cycle infinitely through reachable cells. Hill Climbing will terminate at the wall border without knowing if alternative paths exist elsewhere.',
    ],
    keyTeachingPoints: [
      'The Formal Meaning of Completeness: Completeness is a two-sided guarantee: 1) Find a solution if one exists, and 2) Terminate and return FAILURE if no solution exists.',
      'The Frontier Empty Invariant: When Frontier == empty, every reachable state in the connected component has been explored. Termination with failure is mathematically verified.',
      'Robust Fail-Safe Design: In real-world robotics, an algorithm that hangs or spins in an infinite loop crashes the autonomous vehicle; an algorithm that cleanly reports unreachable goal allows mission replanning.',
    ],
    mathematicalDerivation: {
      title: 'Formal Exhaustion Proof for Disconnected Goals',
      steps: [
        'Let S_reachable be the connected component of states reachable from S_0 via valid action transitions.',
        'Assume Goal is disconnected: Goal not in S_reachable.',
        'In Graph Search, every popped state is placed into Closed.',
        'Since S_reachable is finite with |S_reachable| <= |S|, at most |S_reachable| states can ever be popped.',
        'When all states in S_reachable have been placed into Closed, no new unexpanded children can be generated.',
        'The Frontier empties: Frontier = empty set.',
        'The while (!frontier.isEmpty()) loop terminates cleanly, returning Failure.',
      ],
      conclusion: 'Graph Search is guaranteed to halt and report failure on unreachable goals in at most |S_reachable| node expansions.',
    },
    industrialApplications: [
      'Autonomous Mars Rover (Curiosity / Perseverance): Detecting when a designated geological sample site is blocked by boulder fields and reporting unreachability to ground control.',
      'Warehouse AGV Collision Recovery: Detecting that all loading bays are blocked and triggering emergency dispatch rerouting.',
    ],
    vivaExaminerTrap:
      'Examiner Trap: "Does reporting FAILURE mean the search algorithm failed or crashed?" Answer: NO! Halting and reporting failure when no solution exists is the textbook definition of algorithm completeness. Crashing or looping infinitely is the failure!',
    pitfalls: [
      {
        misconception: 'Thinking that an algorithm reporting failure means the algorithm crashed or had a bug.',
        correction:
          'Halting with failure when no solution exists is the formal definition of algorithm completeness. Crashing or running forever is the true failure mode!',
      },
    ],
    presetId: 'unreachable_fortress',
    algId: 'bfs',
    actionText: 'Load Unreachable Fortress to Prove Completeness',
    vivaQuestions: [
      {
        question: "Under what precise formal condition does a graph-search algorithm prove that no solution exists?",
        answer: "When the Frontier (Open List) becomes completely empty while the Goal Test has never been satisfied. This formally proves that every reachable state in the connected component containing S_0 has been expanded and placed in the Closed List without reaching the goal.",
        examinerTip: "Frontier == empty is the mathematical proof of unreachability.",
      },
      {
        question: "What is the formal criterion that confirms a search problem has no valid solution?",
        answer: "The absence of any directed path in the state-space graph connecting the initial state S_0 to any state in the goal set {s in S | GoalTest(s) == true}. Graph search systematically certifies this by exhausting the connected component.",
        examinerTip: "Contrast finite graph completeness (frontier exhaustion) with infinite graph undecidability.",
      },
      {
        question: "What happens to the Open List (Frontier) and Closed List when searching for an unreachable goal in a finite grid?",
        answer: "Every reachable cell is popped from the Open List, has its neighbors checked, and is moved to the Closed List. Once all reachable cells are exhausted, the Open List reaches size 0, and the algorithm halts cleanly returning failure (null path).",
        examinerTip: "Mention that Closed Set size equals the size of the reachable connected component.",
      },
      {
        question: "Why does Tree-Search DFS fail to terminate on an unreachable goal in a cyclic graph, while Graph-Search BFS terminates successfully?",
        answer: "Tree-Search DFS has no closed list, so in an undirected or cyclic graph, it oscillates endlessly between reachable states across infinite branch depths without ever exhausting the tree. Graph-Search BFS records explored states in its closed list, exhausting all reachable states in O(|V|) time and cleanly reporting no path.",
        examinerTip: "Use this comparison to reinforce why closed-set cycle checking is mandatory in cyclic spaces.",
      }
    ],
    quiz: {
      question: 'What is the formal criterion that confirms a search problem has no valid solution?',
      options: [
        'The execution timer expires',
        'The Frontier becomes completely empty while no goal state has been expanded',
        'The heuristic value h(n) drops to zero',
        'The depth exceeds 100',
      ],
      correctIndex: 1,
      explanation:
        'Correct! An empty frontier proves that all states reachable from the initial state have been expanded and tested without discovering the goal.',
    },
  },
];
