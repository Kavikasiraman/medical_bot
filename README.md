🩺 Medical Bot
A conversational medical assistant chatbot built with *React, TypeScript, TailwindCSS, and Vite, integrated with **Groq LLM API* and *LocationIQ API*.

This project helps users describe their symptoms, receive *AI-powered health suggestions, and get **Google Maps links to nearby hospitals* for relevant specializations.
 🚀 Features

 🤖 Conversational Chatbot – Ask medical-related questions in natural language.
 🏥 Specialization Detection – AI suggests the right doctor specialization based on symptoms.
 📍 Location Integration – Detects user’s city and provides nearby hospital links.
 🏡 Mild Symptom Advice – Non-prescription home remedies for common health issues.
 ⚠ Emergency Escalation – Detects severe symptoms and guides to urgent care.
 🎨 Modern UI – Built with TailwindCSS and React for a clean, responsive interface.

 🗂 Project Structure


medical_bot/
└── project/
    ├── package.json          # Dependencies & scripts
    ├── vite.config.ts        # Vite configuration
    ├── tsconfig.json         # TypeScript config
    ├── postcss.config.js     # PostCSS setup
    ├── eslint.config.js      # ESLint rules
    ├── tailwind.config.js    # Tailwind setup
    ├── index.html            # Entry point
    ├── src/
    │   ├── main.tsx          # React entry point
    │   ├── App.tsx           # Chatbot logic/UI
    │   ├── index.css         # Global styles
    │   └── vite-env.d.ts     # Vite type declarations
    └── .bolt/
        ├── config.json       # AI model configuration
        └── prompt            # Base chatbot instructions
 ⚡ Workflow

1. User enters their city → LocationIQ API fetches latitude & longitude.
2. User describes symptoms:

    If severe/long-lasting → AI suggests specialization + hospital link.
    If mild → AI suggests home remedies.
3. AI responses are shown in the chat interface in real-time.

 🛠 Installation & Setup

 1. Clone the Repository

bash
git clone https://github.com/yourusername/medical_bot.git
cd medical_bot/project


 2. Install Dependencies

bash
npm install


 3. Add Environment Variables

Create a .env file in the project/ folder:


GROQ_API_KEY=your_groq_api_key
LOCATIONIQ_API_KEY=your_locationiq_api_key


 4. Start Development Server

bash
npm run dev


Open your browser at [http://localhost:5173](http://localhost:5173).

 📡 Tech Stack
* Frontend: React, TypeScript, TailwindCSS, Vite
* AI/LLM: Groq API (LLaMA 3.3 model)
* Location Services: LocationIQ API
* Streaming: Real-time AI responses

 📌 Example Usage

* User: "I have been having a severe headache for 5 days."

* Bot: ⚠ "Your symptoms require medical attention. Suggested specialization: Neurology. [🔎 Nearby hospitals link]"

* User: "I have a sore throat since yesterday."

* Bot: 🏡 "Try warm saltwater gargling and stay hydrated. If it persists, consult a General Physician."

⚠ Disclaimer
This chatbot is for informational purposes only.
It is not a substitute for professional medical advice, diagnosis, or treatment.
Always seek the advice of a qualified healthcare provider with any questions regarding your health.

👩‍💻 Contributors
(Team Member)
* Harshini M 
* Devapriya R R
* Kamali M
* Kaviarasi K
* Jeliz Feeba D
