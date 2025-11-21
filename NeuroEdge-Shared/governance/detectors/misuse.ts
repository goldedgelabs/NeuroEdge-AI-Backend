export function detectMisuse(text: string) {
  const flags = [
    /jailbreak/i,
    /ignore all rules/i,
    /bypass/i,
    /exploit/i,
    /crash/i,
    /malware/i,
    /attack/i
  ];

  return flags.some(f => f.test(text));
}
