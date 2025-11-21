import Logger from "../utils/logger";
import axios from "axios";

class RefactorService {
    async refactorCode(payload: any) {
        const { code, language } = payload;

        Logger.info(`🔧 Refactoring ${language} code...`);

        const llmResponse = await axios.post(
            process.env.LLM_GATEWAY_URL + "/v1/refactor",
            { code, language }
        );

        return {
            id: payload.id,
            input: code,
            output: llmResponse.data.refactored,
            diagnostics: llmResponse.data.diagnostics
        };
    }
}

export default new RefactorService();
