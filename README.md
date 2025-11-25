# NeuroEdge AI Core TypeScript Engine

NeuroEdge is a distributed, offline-first AI system containing:

- **42 Engines**
- **63 Agents**
- Edge → Shared DB replication
- Doctrine enforcement layer
- Event-driven architecture
- Self-healing
- Hot reload ready

---

## 📦 Project Structure
src/ agents/        → All 63 agents engines/       → All 42 engines core/ agentManager.ts engineManager.ts eventBus.ts db/ dbManager.ts replicationManager.ts wiring/ utils/         → helpers config/        → env + paths + system config index.ts       → bootstrap

---

## 🚀 Running development

npm install npm run dev

---

## 🏗️ Build

npm run build npm start

---

## 🔌 Features

- DB replication (edge → shared)
- Fault-tolerant engine execution
- Automatic agent method proxying
- Doctrine permission layer
- Self-protection & self-healing
- Lightning-fast modular engine pipeline

---

## 🛠️ Requirements

Node.js 18+  
TypeScript 5+

---

## 📜 License

MIT
