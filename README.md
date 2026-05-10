Autonomous Clinical Booking Agent 
An intelligent, production-ready AI Agent built with Mastra, Node.js, and TypeScript. This agent automates the medical appointment scheduling process by combining natural language processing with deterministic database operations.

The Architecture: Hybrid Orchestration
To solve the common issue of Tool Hallucination in Open Source LLMs (like LLaMA 3.3), this project utilizes a Hybrid Deterministic Architecture.

Instead of relying solely on the LLM to execute database writes—which can be unstable—the system uses a Deterministic Backend Layer to handle critical Supabase transactions first. The Mastra Generative Layer then takes over to handle conversational context, medical rule enforcement (like fasting requirements), and human-like confirmation.

Key Features
Autonomous Lead Processing: Extracts patient data, test types, and dates from unstructured natural language.

Mastra Framework Integration: Leverages Mastra for agent logic, system prompt management, and multi-step workflows.

Deterministic Persistence: Secure and reliable CRUD operations with Supabase REST API.

Environment Agnostic: Fully containerized logic ready for deployment on Render, Vercel, or AWS.

Real-time Webhook: Designed to be triggered by messaging platforms (WhatsApp/Twilio) or internal CRMs.

Tech Stack
Framework: Mastra

Runtime: Node.js (TypeScript)

LLM Orchestration: Groq (LLaMA 3.3 70B)

Database: Supabase (PostgreSQL)

Deployment: Render

Quick Start
Clone the repo:

Bash
git clone https://github.com/GuilleCSS/clinica-agent.git
Install dependencies:

Bash
npm install
Setup Environment Variables:
Create a .env file with:

Fragmento de código
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_secret_key
GROQ_API_KEY=your_groq_api_key
Run in development:

Bash
npx tsx src/server.ts