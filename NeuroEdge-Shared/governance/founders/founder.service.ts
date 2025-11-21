import crypto from "crypto";

const founderProfiles = [
  {
    id: "founder-001",
    name: "Joseph Were",
    voicePrintHash: process.env.FOUNDER_VOICE_HASH,
    passphrase: process.env.FOUNDER_PASSPHRASE,
    apiKey: process.env.FOUNDER_API_KEY
  }
];

export function isFounderRequest(req): boolean {
  const apiKey = req.headers["x-api-key"];
  const passphrase = req.headers["x-founder-passphrase"];
  const voicePrint = req.headers["x-voice-hash"];

  return founderProfiles.some(profile => {
    return (
      (apiKey && apiKey === profile.apiKey) ||
      (passphrase && passphrase === profile.passphrase) ||
      (voicePrint && secureMatch(voicePrint, profile.voicePrintHash))
    );
  });
}

function secureMatch(a: string, b: string) {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  } catch {
    return false;
  }
}
