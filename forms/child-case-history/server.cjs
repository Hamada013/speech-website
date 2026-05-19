var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var aiClient = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required for AI-powered generation.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const data = req.body;
      const lang = data.lang || "en";
      const client = getAiClient();
      const slpPrompt = `
You are an expert pediatric Speech-Language Pathologist (SLP) specializing in diagnostic evaluations, speech sound disorders, and early intervention.
Your task is to generate a comprehensive, highly professional, and structured clinical intake report for the child described below.

Ensure that the report integrates every detail of the case history context. Use a clinically precise, empathetic, objective, and analytical tone.
Output the full report in ${lang === "ar" ? "Modern Standard Arabic (\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0635\u062D\u0649)" : "English"}.

### Client Assessment & Intake Data:
${JSON.stringify(data, null, 2)}

### Guidelines for the Clinical Report Structure:
1. CLINICAL TITLE & EXECUTIVE OVERVIEW:
   - List the child's demographics dynamically (Name, Chronological Age based on birth year, Daycare/School, Grade, Language Profile, and Referral Source).
   - Write an SLP intake overview summarizing that this child's caretaker completed a comprehensive clinical history. Include the primary concern(s) explicitly.

2. PRENATAL, BIRTH, & DEVELOPMENTAL HISTORY:
   - pregnancy term, birth weight, and conditions at birth (NICU status, jaundice, infections, etc.).
   - Analyze the major developmental milestones (Sat, Crawled, Walked, Babbled, First Word, 2-word Combination, Toilet Training). Compare their actual ages explicitly with typical developmental norms (e.g., first word typically around 12 months, 2-word combinations around 18-24 months) and highlight any delays, variances, or "Unremarkable/Within Normal Limits" statuses.

3. MEDICAL & REHABILITATION HISTORY:
   - Detail any diagnostic and health factors, including prior diagnoses, allergies, chronic conditions, surgeries, hospitalizations, or current medications.
   - Incorporate the therapy history (ST, OT, PT, ABA) and state how this affects their developmental timeline.

4. CLINICAL ANALYSIS OF BEHAVIOR & SENSORY/MOTOR INTAKE:
   - Analyze social interaction styles (interaction), feeding concerns, and sensory/oral-motor elements if checked.
   - Boldly address any active "Clinical Red Flags" checked in the intake (e.g., loss of vocabulary, poor eye contact, inconsistent response to name, lack of pointing/gestures). Explain their clinical significance and specify if they warrant specialized screening (such as autism spectrum screening or pediatric neurology consultation).

5. SPEECH, LANGUAGE, & INTELIBILITY METRICS:
   - Provide a qualitative summary of Receptive Language (following instructions, vocabulary, identification), Expressive Language (vocabulary size, MLU/sentence length), and Articulation/Intelligibility.
   - Directly assess their Speech Intelligibility score (on a 1-10 Likert scale) and percentage. Interpret this clinically for their age (e.g., at 3 years, a child should be roughly 75% intelligible to unfamiliar listeners; at 4 years, 100%).

6. CLINICAL IMPRESSIONS & ACTIONABLE RECOMMENDATIONS:
   - Outline a clear clinical impression synthesizing whether the findings point to a potential delay/disorder (Receptive, Expressive, Mixed Language, or Speech Sound Disorder).
   - List detailed, professional recommendations for the SLP (e.g., Formal Standardized Testing like PLS-5 or CELF-P3, gold-standard speech sound assessment like GFTA-3, Audiological/Hearing evaluation, Parental Coaching strategies, or referrals to developmental pediatricians/OTs if Red Flags are marked).

Make ${lang === "ar" ? "the Arabic text natural, formal, and formatted beautifully for local therapy files" : "the layout beautiful and formal with clear sections, headers, and bullet points"}. Ensure the report looks ready for clinical inclusion.
`;
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: slpPrompt,
        config: {
          temperature: 0.2
          // Low temperature for high-fidelity clinical synthesis
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate report" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SLP intake portal online at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
