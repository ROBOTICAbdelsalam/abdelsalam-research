export const featuredResearch = {
  slug: "hybrid-adaptive-bci",
  name: "HYBRID-ADAPTIVE-BCI",
  title:
    "Hybrid Adaptive Brain-Computer Interface Using Artificial Intelligence for Controlling Industrial Robots and Medical Assistive Devices",
  description:
    "M.Sc. thesis (JAMK University of Applied Sciences) engineering a hybrid adaptive Brain-Computer Interface that decodes real-time EEG with deep learning to control industrial robotic manipulators and medical assistive devices.",
  institution: "JAMK University of Applied Sciences, Jyväskylä, Finland",
  status: "M.Sc. Thesis · Completed 2026",
  architecture: [
    { label: "EEG Acquisition", description: "BrainFlow · hardware-agnostic streaming" },
    { label: "Signal Processing", description: "MNE-Python · filtering, artifact rejection" },
    { label: "Feature Extraction", description: "Spatial features from processed epochs" },
    { label: "Machine Learning", description: "CNN / LSTM decoding, CSP + LDA/SVM baseline" },
    { label: "Adaptive Learning", description: "Online recalibration across sessions" },
    { label: "ROS 2", description: "Node graph · velocity and pose commands" },
    { label: "Gazebo", description: "Simulation-first verification" },
    { label: "Robot Control", description: "Shared control, collision avoidance, safety" },
  ],
  technologies: [
    "Python",
    "PyTorch",
    "TensorFlow",
    "Scikit-learn",
    "BrainFlow",
    "MNE-Python",
    "ROS 2",
    "Gazebo",
    "NumPy / SciPy",
    "Linux",
    "Docker",
    "Git",
  ],
  links: {
    github: "",
    demo: "",
  },
};

export type ResearchDetailSection = {
  id: string;
  title: string;
  status: "available" | "in-progress";
  content: string;
};

// Sourced from the CV's thesis summary and Key Projects bullet points.
// Sections marked "available" describe the system's design, as documented
// on the CV. Sections marked "in-progress" are the parts the CV itself
// leaves as placeholders ([XX]%, [N] subjects) or doesn't yet specify —
// no numbers are invented here.
export const featuredResearchDetail: ResearchDetailSection[] = [
  {
    id: "research-problem",
    title: "Research Problem",
    status: "available",
    content:
      "Manual control is impractical in two very different contexts: for users with severe motor impairment, and in industrial settings where hands-free operation is needed. This project investigates whether a single hybrid, adaptive BCI architecture can address both — enabling hands-free, non-invasive EEG control of industrial robotic manipulators and medical assistive devices.",
  },
  {
    id: "research-question",
    title: "Research Question",
    status: "available",
    content:
      "Can a single hybrid, adaptive AI architecture reliably decode motor-imagery EEG in real time to control both industrial robotic manipulators and medical assistive devices, while adapting to inter- and intra-session EEG non-stationarity?",
  },
  {
    id: "system-architecture",
    title: "System Architecture",
    status: "available",
    content:
      "The system is architected as a modular ROS 2 node graph: real-time EEG acquisition and decoding feed a hybrid adaptive AI core, which translates decoded motor-imagery intent into validated velocity and pose commands for the robot, with simulation-first verification in Gazebo before hardware deployment.",
  },
  {
    id: "eeg-acquisition",
    title: "EEG Acquisition",
    status: "available",
    content:
      "Real-time EEG acquisition uses BrainFlow for hardware-agnostic streaming, feeding an end-to-end Python pipeline built for continuous, real-time signal capture.",
  },
  {
    id: "signal-processing",
    title: "Signal Processing",
    status: "available",
    content:
      "MNE-Python handles filtering, artifact rejection, epoching and spatial feature extraction ahead of classification.",
  },
  {
    id: "artifact-rejection",
    title: "Artifact Rejection",
    status: "available",
    content:
      "Artifacts are removed using Independent Component Analysis (ICA) within the MNE-Python preprocessing pipeline, ahead of epoching and feature extraction.",
  },
  {
    id: "feature-extraction",
    title: "Feature Extraction",
    status: "available",
    content:
      "Spatial features are extracted from preprocessed EEG epochs, feeding both the deep learning classifiers and the classical CSP-based baseline.",
  },
  {
    id: "machine-learning",
    title: "Machine Learning",
    status: "available",
    content:
      "Motor-imagery intent is decoded using deep learning classifiers trained and evaluated in PyTorch and TensorFlow, benchmarked against classical machine learning baselines built in Scikit-learn.",
  },
  {
    id: "cnn-lstm",
    title: "CNN / LSTM",
    status: "available",
    content:
      "CNN and LSTM architectures were designed, trained and evaluated in PyTorch/TensorFlow for motor-imagery intent decoding from EEG.",
  },
  {
    id: "csp-lda-svm",
    title: "CSP + LDA / SVM Baselines",
    status: "available",
    content:
      "Deep learning classifiers were benchmarked against classical CSP (Common Spatial Patterns) feature extraction combined with LDA and SVM classifiers in Scikit-learn, providing a non-deep-learning baseline for comparison.",
  },
  {
    id: "adaptive-learning",
    title: "Adaptive Learning",
    status: "available",
    content:
      "An online learning layer continuously recalibrates the decoder against inter- and intra-session EEG non-stationarity — the defining adaptive component of the system, designed to reduce per-session recalibration time without full retraining.",
  },
  {
    id: "ros2",
    title: "ROS 2",
    status: "available",
    content:
      "The robot-side control stack is a modular ROS 2 node graph that translates decoded neural intent into validated velocity and pose commands.",
  },
  {
    id: "gazebo",
    title: "Gazebo",
    status: "available",
    content:
      "All robot behavior is verified in Gazebo simulation before any hardware deployment — a simulation-first approach used to de-risk real-world testing.",
  },
  {
    id: "shared-control",
    title: "Shared Control",
    status: "available",
    content:
      "A shared-control arbitration layer blends decoded human intent with autonomous motion planning and collision avoidance, so low-confidence neural commands degrade safely rather than producing unintended motion.",
  },
  {
    id: "safety",
    title: "Safety",
    status: "available",
    content:
      "Human-robot interaction safety is enforced through workspace limits, velocity clamping, confidence thresholding, and a watchdog-driven emergency-stop path, keeping the system fail-safe under signal dropout or decoder uncertainty.",
  },
  {
    id: "experiments",
    title: "Experiments",
    status: "in-progress",
    content:
      "Classifiers were evaluated via cross-validation across multiple subjects, benchmarked against the classical CSP + LDA/SVM baselines above. The CV leaves the exact subject count and full experimental protocol as placeholders — add specifics here once finalized.",
  },
  {
    id: "results",
    title: "Results",
    status: "in-progress",
    content:
      "Cross-validated decoding accuracy and per-session recalibration improvements were measured during the thesis. Results under final validation — no numbers are reported here to avoid presenting unverified findings.",
  },
  {
    id: "future-work",
    title: "Future Work",
    status: "in-progress",
    content:
      "Planned next steps — broader validation, publication of finalized results, and possible extensions of the shared-control approach — will be added here.",
  },
  {
    id: "code-github",
    title: "Code / GitHub",
    status: "in-progress",
    content:
      "A link to the project's public repository will be added here once the codebase is ready to share.",
  },
  {
    id: "publications",
    title: "Publications",
    status: "in-progress",
    content:
      "The completed M.Sc. thesis is listed on the Publications page. Any further papers, preprints or technical reports will be added here and cross-linked from that page.",
  },
];
