// src/agents/TranslationAgent.ts
import { engineManager } from "../core/engineManager";
import { logger } from "../utils/logger";

export class TranslationAgent {
  name = "TranslationAgent";

  constructor() {
    logger.log(`${this.name} initialized`);
  }

  /**
   * Translate text between languages
   * @param text Text to translate
   * @param sourceLang Source language code (e.g., 'en')
   * @param targetLang Target language code (e.g., 'fr')
   */
  async translate(text: string, sourceLang: string, targetLang: string) {
    const translationEngine = engineManager["TranslationEngine"];
    if (!translationEngine) {
      logger.warn(`[${this.name}] TranslationEngine not found`);
      return { error: "TranslationEngine not found" };
    }

    try {
      const result = await translationEngine.run({
        action: "translate",
        payload: { text, sourceLang, targetLang },
      });
      logger.info(`[${this.name}] Translation completed`);
      return result;
    } catch (err) {
      logger.error(`[${this.name}] Translation failed:`, err);
      return { error: "Translation failed", details: err };
    }
  }

  /**
   * Detect language of the text
   * @param text Text to detect language
   */
  async detectLanguage(text: string) {
    const translationEngine = engineManager["TranslationEngine"];
    if (!translationEngine) {
      logger.warn(`[${this.name}] TranslationEngine not found`);
      return { error: "TranslationEngine not found" };
    }

    try {
      const result = await translationEngine.run({
        action: "detectLanguage",
        payload: { text },
      });
      logger.info(`[${this.name}] Language detection completed`);
      return result;
    } catch (err) {
      logger.error(`[${this.name}] Language detection failed:`, err);
      return { error: "Language detection failed", details: err };
    }
  }
}
