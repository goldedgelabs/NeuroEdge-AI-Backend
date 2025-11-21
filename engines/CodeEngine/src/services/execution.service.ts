import { NodeVM } from "vm2";
import Logger from "../utils/logger";

class ExecutionService {
    async runCode(job: any) {
        const { code, language } = job;

        if (language !== "javascript") {
            return { error: "Only JavaScript sandbox is currently implemented." };
        }

        try {
            const vm = new NodeVM({
                timeout: 2000,
                sandbox: {},
                console: "redirect",
                eval: false,
                wasm: false,
            });

            let consoleOutput: string[] = [];

            vm.on("console.log", (msg: string) => {
                consoleOutput.push(msg);
            });

            const result = await vm.run(code);

            return {
                success: true,
                result,
                logs: consoleOutput,
            };

        } catch (err: any) {
            Logger.error("Sandbox Execution Error:", err);
            return { success: false, error: err.message };
        }
    }
}

export default new ExecutionService();
