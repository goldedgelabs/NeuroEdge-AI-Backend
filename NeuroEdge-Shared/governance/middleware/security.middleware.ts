export function detectDoctrineViolation(text: string) {
  const patterns = [
    /reverse[\s-]?engineer/i,
    /replicate[\s-]?the[\s-]?engine/i,
    /reproduce[\s-]?architecture/i,
    /describe[\s-]?neuroedge[\s-]?internal/i,
    /extract[\s-]?source[\s-]?code/i,
    /show[\s-]?internal[\s-]?logic/i,
    /how[\s-]?the[\s-]?engine[\s-]?works/i,
    /copy[\s-]?openai/i
  ];

  return patterns.some(p => p.test(text));
}

export function doctrineWarning() {
  return {
    allowed: false,
    message:
      "⚠️ This request touches restricted NeuroEdge Doctrine. " +
      "For safety, intellectual property protection, and system integrity, " +
      "this level of detail cannot be exposed.",
    category: "doctrine-protection"
  };
}
