PROJECT CONTEXT — AGRISAARTHI 360
=================================

IMPORTANT:
This is a PROJECT CONTEXT / BACKGROUND prompt.

Do NOT start implementing the application yet.

Do NOT generate the complete codebase yet.

Do NOT invent additional features.

First understand the project, its purpose, constraints, MVP scope, technical direction, and development strategy.

After reading this context:

1. Confirm that you understand the project.
2. Summarize the problem.
3. Summarize the proposed solution.
4. Summarize the USP.
5. List the P0/MVP features.
6. Explain the intended user journey.
7. Explain the technical constraints.
8. Identify any critical ambiguity or risk.
9. Then WAIT for the next implementation instruction.

==================================================
1. PROJECT IDENTITY
==================================================

Project Name:

AgriSaarthi 360

Project Type:

AI-assisted integrated agriculture decision-support web application.

Team:

DesignXTeam

Team members:

- Tony — Team Lead, Architecture, Integration, Deployment, Final Demo
- Rishita — UI/Frontend, Dashboard, Responsive Design
- Deepanshu — AI/ML, Crop Recommendation, Crop Health
- Ram Kumar — Backend/Data, Weather, Machinery Data, Testing

==================================================
2. HACKATHON CONTEXT
==================================================

This is a college hackathon project.

The project is agriculture-focused.

The development deadline is extremely close.

The application must be:

- Working
- Deployable
- Demonstrable
- Stable enough for a live judge demo
- Understandable by the complete team

After development, the team must also:

- Test the complete application
- Practice the demo
- Understand the architecture
- Prepare viva questions and answers
- Explain AI usage
- Explain data sources
- Explain limitations
- Explain which data is real, model-generated, rules-based, or simulated

AI-assisted development is permitted by the hackathon.

Therefore AI coding/design tools may be used to accelerate development.

However, the final team must understand the implementation.

==================================================
3. CORE PROBLEM
==================================================

Farmers can access many agricultural services and information sources.

However, information and services can be fragmented across:

- Agriculture applications
- Government portals
- Advisory systems
- Weather services
- Market platforms
- Machinery/service providers
- Separate AI tools

A farmer may separately need help with:

- Choosing a suitable crop
- Understanding soil information
- Monitoring crop health
- Understanding weather
- Finding farm machinery
- Managing crop residue
- Understanding market information
- Planning farm activities
- Asking agriculture-related questions

IMPORTANT:

We are NOT claiming that these services do not already exist.

We are NOT claiming that we invented:

- Crop recommendation
- Disease detection
- Weather information
- Agricultural marketplaces
- Soil advisory

The central problem is:

FRAGMENTATION.

The project explores whether one connected farm profile can make multiple farming decisions simpler by keeping the farmer's context connected across different actions.

==================================================
4. CORE PRODUCT IDEA
==================================================

AgriSaarthi 360 connects multiple farming decisions through one farmer/farm context.

The core product principle is:

FARM → DECISION → ACTION

The application should NOT feel like a collection of unrelated AI demos.

Instead:

Farmer creates a farm profile
        ↓
Provides farm information
        ↓
Receives crop recommendations
        ↓
Selects a crop
        ↓
Gets crop-specific context
        ↓
Checks weather and receives an action
        ↓
Checks crop health
        ↓
Requests a farm operation/machine
        ↓
Uses contextual agriculture assistant
        ↓
Receives a simple action-oriented view

==================================================
5. EXISTING PROJECT BENCHMARK
==================================================

AgriSync is an important benchmark for this project.

Reference:

GitHub:
https://github.com/bunnysunny24/AgriSync

Live demo:
https://agri-sync.vercel.app/

AgriSync already contains agriculture-related capabilities such as:

- Plant disease detection
- Price prediction
- Weather
- Soil
- Marketplace
- Blockchain/traceability

Other agriculture platforms also provide broad combinations of:

- Advisory
- Weather
- Soil
- Crop health
- Market information
- Farmer services

Therefore:

DO NOT claim individual common agriculture features as completely novel.

DO NOT copy AgriSync.

DO NOT reproduce its implementation.

DO NOT make "AI" itself the USP.

Our differentiation should come from:

CONNECTED FARM CONTEXT
+
ACTION-ORIENTED WORKFLOW

==================================================
6. PROJECT USP
==================================================

Primary USP:

"AgriSaarthi 360 turns one farmer's farm profile into a context-aware action plan by connecting crop selection, crop health, weather, and one next farm operation in a single guided workflow."

Short version:

"From Farm → Decision → Action in one connected workflow."

Do NOT use claims such as:

- "We solve all agriculture problems."
- "Our AI gives perfect crop recommendations."
- "Our disease detection is 100% accurate."
- "Our machinery is guaranteed to be available."
- "Our market prices are always live."
- "We replace agricultural experts."
- "Our project is innovative simply because it uses AI."

==================================================
7. FINAL MVP STRATEGY
==================================================

The original concept contains many possible agriculture modules.

Because the project has a very short development deadline, the team is deliberately building a focused vertical slice.

The project is NOT a production-grade nine-module agriculture platform.

The P0 MVP consists of:

1. Farm Profile
2. Smart Crop Recommendation
3. Crop Health/Image Check
4. Weather → Action
5. One Farm Operation — Machinery Workflow
6. Controlled Agriculture Assistant
7. Unified Farm Dashboard

All P0 features should be connected.

==================================================
8. P0 — FARM PROFILE
==================================================

The farmer/demo farmer can provide:

- Name/demo identity
- Location or selected district
- Farm size
- Irrigation availability
- Soil information
- Season
- Optional land/field photograph

Use fictional/demo farmer information.

Do not collect sensitive identity documents.

The farm profile becomes the shared context for the rest of the application.

==================================================
9. P0 — SMART CROP RECOMMENDATION
==================================================

Inputs may include:

- Location
- Season
- Soil type or structured soil information
- Irrigation availability
- Farm size
- Optional land/field photograph

Output:

Recommend approximately 2–3 potentially suitable crops.

For each recommendation display:

- Crop name
- Suitability level
- Why it was recommended
- Water requirement
- Approximate duration
- Important caveat

IMPORTANT:

A land photograph alone must NOT be treated as sufficient scientific evidence for determining the correct crop.

The photograph is only one contextual input.

For the MVP, prefer:

- Transparent rules
- Explicit logic
- Curated/demo dataset

over training a new ML model from scratch.

Recommendations must be explainable.

==================================================
10. P0 — CROP HEALTH / IMAGE CHECK
==================================================

The farmer can upload a crop/leaf image.

The system returns:

- Possible condition
- Confidence/likelihood
- Short explanation
- Suggested next step
- Expert-confirmation warning where appropriate

Possible implementation:

- Existing image model
- Existing computer-vision API
- Existing AI model
- Carefully prepared demo result

IMPORTANT:

Never claim certainty.

The result is decision support, not a guaranteed diagnosis.

There must be a deterministic fallback if the model/API fails.

==================================================
11. P0 — WEATHER → ACTION
==================================================

Display weather information for the selected farm location.

Possible information:

- Temperature
- Rain probability
- Rain forecast
- Humidity
- Wind

But do NOT build a separate large weather application.

The important concept is:

WEATHER → FARMING ACTION

Example:

Weather:
Rain expected tomorrow.

Action:
"Review irrigation before watering today."

Use a real API when reliable and easy.

If the API fails, use clearly labelled mock/demo data.

The application must remain demonstrable even if an external API fails.

==================================================
12. P0 — MACHINERY WORKFLOW
==================================================

This is the primary deep operational workflow.

Flow:

Farm operation
      ↓
Suitable machine/provider
      ↓
Request
      ↓
Provider response
      ↓
Fallback
      ↓
Status/completion

Example:

Crop:
Wheat

Operation:
Harvesting

Farm size:
5 acres

Required date:
Selected date

The system displays suitable machines/providers.

Example:

Harvester A
Suitable for:
4–8 acres

Provider:
Demo Provider 01

User:
Request Machine

Possible response:

Accepted

OR

Unavailable

Then:

Fallback Provider

IMPORTANT:

Unless a verified live integration exists, all machinery information must be labelled:

DEMO / SAMPLE DATA

Never claim real-time availability.

The objective is to demonstrate the operational workflow.

==================================================
13. P0 — CONTROLLED AGRICULTURE ASSISTANT
==================================================

The application includes an agriculture assistant.

It should receive relevant farm context such as:

- Location
- Selected crop
- Farm size
- Irrigation
- Season
- Relevant weather context

Example:

User:
"Should I irrigate today?"

The assistant responds using available context.

Other example questions:

- "What should I check before harvesting?"
- "What does this crop-health result mean?"
- "What should I consider for my selected crop?"

IMPORTANT:

The assistant must NOT behave as an unrestricted expert authority.

Use a constrained prompt.

Prepare at least three tested questions and fallback responses.

If the AI/LLM API fails, the application must still provide safe predefined fallback responses.

==================================================
14. P0 — UNIFIED DASHBOARD
==================================================

The dashboard connects the entire farmer journey.

Recommended sequence:

FARM CONTEXT
      ↓
CROP RECOMMENDATION
      ↓
SELECTED CROP
      ↓
WEATHER → ACTION
      ↓
CROP HEALTH
      ↓
MACHINERY ACTION
      ↓
AI ASSISTANT
      ↓
FINAL ACTION CHECKLIST

Do not fill the dashboard with unrelated widgets.

Everything should relate to the selected farm/crop context.

==================================================
15. GOLDEN DEMO
==================================================

The judge should see one consistent farmer scenario.

Demo sequence:

1. Open AgriSaarthi 360.
2. Create a fictional/demo farmer.
3. Enter farm location.
4. Enter farm size.
5. Select irrigation availability.
6. Enter basic soil information.
7. Upload/select a land image.
8. Generate 2–3 crop recommendations.
9. Explain why one crop was selected.
10. Select the crop.
11. Open crop-specific dashboard.
12. Show weather.
13. Show weather → farming action.
14. Upload leaf/crop image.
15. Show cautious crop-health result.
16. Open machinery workflow.
17. Select farming operation.
18. Show suitable machine/provider.
19. Send request.
20. Show provider response/fallback.
21. Ask the agriculture assistant a pre-tested question.
22. Show final action checklist.

Target demonstration time:

3–4 minutes.

==================================================
16. DATA TRANSPARENCY
==================================================

The application should distinguish between:

LIVE API DATA

MODEL RESULT

RULES-BASED RECOMMENDATION

DEMO/SAMPLE DATA

ILLUSTRATIVE ONLY

Never make simulated information appear to be live production information.

==================================================
17. TECHNICAL DIRECTION
==================================================

Use the simplest stable architecture possible.

Preferred options:

Frontend:
- React or Next.js
- Tailwind CSS

Backend:
- One lightweight API layer if required.

Database:
- Firebase
OR
- Supabase
OR
- Local JSON/mock data where appropriate.

Crop recommendation:
- Transparent deterministic rules.

Crop health:
- Existing model/API where reliable.

Weather:
- One weather API + fallback.

AI assistant:
- One LLM/API integration + constrained prompt + fallback.

Machinery:
- Local JSON or seeded database containing demo providers.

Deployment:
- Use the simplest stable deployment platform already familiar to the team.

Do not introduce technology merely to make the architecture look complex.

==================================================
18. DO NOT BUILD
==================================================

Do not add these unless explicitly requested later:

- Blockchain
- Cryptocurrency
- Payment gateway
- Government-system integration
- Production-grade marketplace
- Live machinery guarantees
- Custom ML training pipeline
- Large-scale satellite processing
- IoT sensors
- Complex identity verification
- Multi-state rollout
- Microservices
- Kubernetes
- Multiple unnecessary databases
- Complex authentication
- Real-time sockets
- Unnecessary infrastructure

Principle:

WORKING > COMPLEX

RELIABLE > IMPRESSIVE-LOOKING

UNDERSTANDABLE > OVERENGINEERED

==================================================
19. UI / UX DIRECTION
==================================================

The product should look like a modern agriculture technology startup.

Design requirements:

- Professional
- Modern
- Clean
- Responsive
- Farmer-friendly
- Strong visual hierarchy
- Clear navigation
- Excellent dashboard
- Clear cards
- Clear actions
- Good typography
- Desktop responsive
- Mobile responsive
- Accessible interface

Avoid:

- childish agricultural graphics
- excessive animations
- excessive gradients
- clutter
- unnecessary screens
- decorative components without purpose

The product should look like a polished hackathon prototype, not a basic CRUD college project.

==================================================
20. SAFETY AND TRUST
==================================================

AgriSaarthi 360 is a decision-support prototype.

It does NOT replace:

- Agronomists
- Agriculture officers
- Qualified experts
- Official government services

For uncertain recommendations:

- Show uncertainty.
- Avoid guarantees.
- Recommend expert confirmation when appropriate.

Crop recommendation:
Decision support, not scientific certainty.

Disease detection:
Possible condition, not guaranteed diagnosis.

Machinery:
Demo data unless verified live integration exists.

Market:
Do not claim live data without verified live source.

==================================================
21. EXPECTED JUDGE QUESTIONS
==================================================

The team must eventually be prepared to answer:

1. What problem are you solving?
2. Why do farmers need this?
3. What is innovative?
4. Why not AgriSync?
5. How are you different from existing agriculture applications?
6. Where does your data come from?
7. Is crop recommendation accurate?
8. Can a land photograph really determine a crop?
9. Is disease detection accurate?
10. Is machinery data real?
11. How is AI being used?
12. Why use rules instead of AI for crop recommendation?
13. What happens if AI gives a wrong answer?
14. How will the system scale?
15. What are the limitations?
16. What would you build next?
17. Which parts are real?
18. Which parts are simulated?

These will be addressed later during viva preparation.

==================================================
22. TEAM RESPONSIBILITIES
==================================================

Tony:
- Architecture
- Integration
- Deployment
- Final demo
- Overall coordination

Rishita:
- UI
- Dashboard
- Onboarding
- Responsive design

Deepanshu:
- Crop recommendation
- Crop health/image analysis
- AI assistant/API integration

Ram Kumar:
- Weather
- Machinery data
- Data model
- Testing
- Deployment/debugging support

Every P0 feature must have a clear owner.

==================================================
23. DEVELOPMENT STRATEGY
==================================================

Development must happen incrementally.

Do NOT generate the entire project in one step.

Recommended sequence:

STEP 1
Project initialization and technology setup.

STEP 2
Application shell and navigation.

STEP 3
Landing/onboarding UI.

STEP 4
Farm profile.

STEP 5
Crop recommendation.

STEP 6
Unified farm dashboard.

STEP 7
Weather → action.

STEP 8
Crop health/image analysis.

STEP 9
Machinery workflow.

STEP 10
Controlled AI assistant.

STEP 11
Integration and error handling.

STEP 12
Responsive polish.

STEP 13
Deployment.

STEP 14
Complete testing.

STEP 15
Viva and demo preparation.

After each major step:

- Run the application.
- Test the feature.
- Fix errors.
- Only then continue.

==================================================
24. DEVELOPMENT RULES FOR THE AI CODING AGENT
==================================================

You are assisting with development.

Follow these rules:

1. Do not rewrite working code unnecessarily.
2. Do not change the technology stack without asking.
3. Do not add dependencies unless needed.
4. Do not create unnecessary files.
5. Keep components modular.
6. Keep logic understandable.
7. Use meaningful names.
8. Handle loading states.
9. Handle errors.
10. Provide fallbacks for external APIs.
11. Never expose API keys in frontend code.
12. Use environment variables for secrets.
13. Do not fabricate live API responses.
14. Clearly mark demo data.
15. Keep the application deployable.
16. Prefer simple solutions over sophisticated architecture.
17. Preserve existing functionality when adding features.
18. Test each feature before moving to the next.
19. Do not add P1/P2 features automatically.
20. Do not change the product concept without explicit instruction.

==================================================
25. SUCCESS CRITERIA
==================================================

The project is successful for the hackathon if:

- The application runs.
- The application can be deployed.
- The primary farmer journey works.
- Crop recommendation works.
- Crop-health flow works or has a reliable fallback.
- Weather works or has a fallback.
- Machinery workflow works with clearly labelled demo data.
- Assistant works or has a fallback.
- Dashboard connects the features.
- The team can explain the architecture.
- The team can explain AI usage.
- The team can explain limitations.
- The team can answer likely viva questions.
- The live demo can be completed in approximately 3–4 minutes.

==================================================
26. FINAL PRODUCT STATEMENT
==================================================

AgriSaarthi 360 is:

"An integrated agriculture decision-support platform that connects a farmer's farm context to the next decision and action."

Core principle:

FARM → DECISION → ACTION

The goal is not to build the largest agriculture application.

The goal is to build a coherent, polished, reliable and understandable hackathon prototype.

==================================================
27. CURRENT INSTRUCTION
==================================================

DO NOT CODE YET.

DO NOT CREATE THE COMPLETE APPLICATION YET.

First confirm that you understand:

1. Project identity
2. Problem
3. Solution
4. USP
5. AgriSync benchmark
6. P0 scope
7. Machinery workflow
8. Golden demo
9. Technical constraints
10. Data/safety limitations
11. Development sequence
12. Success criteria

Then WAIT for the next instruction.

The next prompt will tell you exactly what to build first.