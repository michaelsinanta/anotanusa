# AnotaNusa

![AnotaNusa Logo](/public/anotanusa.png)

## Summary

AnotaNusa is a collaborative, crowdsourced web platform built to drive the creation of high-quality, culturally aware NLP datasets for all of Indonesia's languages. It directly addresses the critical data bottleneck that hinders the development of truly localised AI systems.

Our mission is to democratize AI development in Indonesia by empowering communities to contribute linguistic data that reflects the rich diversity of Indonesian languages and cultures. Through crowdsourced annotation and data collection, we're building the foundation for more inclusive and representative AI systems.

## Tech Stack

- **Frontend & Backend**: Next.js (Full-stack framework)
- **Database**: Firebase & Firestore (NoSQL database)
- **Authentication**: Firebase Authentication
- **Hosting**: Vercel
- **Styling**: Tailwind CSS 

### Honorable Mentions - AI Development Tools

Special thanks to the generative AI tools that accelerated our development process:

- **v0.dev** - AI-powered UI component generation and rapid prototyping
- **Cursor** - AI-assisted code editor for enhanced development productivity  
- **GPT, Claude, Gemini, and others** - For code generation, debugging, and development assistance

*This project embraces the power of AI-assisted development while building tools to make AI more inclusive for Indonesian languages.*

## Main Website

🌐 **Live Application**: [anotanusa.vercel.app](https://anotanusa.vercel.app)

## Setup Instructions

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Firebase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/michaelsinanta/anotanusa.git
   cd anotanusa
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory and add your Firebase configuration:
   
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication (configure your preferred sign-in methods)
   - Update Firebase security rules as needed

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application running locally.

### Build for Production

```bash
npm run build
npm start
```

## Contributing

We welcome contributions from the community! Please read our contributing guidelines and feel free to submit issues, feature requests, or pull requests.


## Contributors

For questions, support, or collaboration opportunities, please reach out to:

**Lyzander Marciano Andrylie**
- Email: [lyzanderandrylie@gmail.com]
- GitHub: [@LyzanderAndrylie]

**Michael Christlamber Sinanta**
- Email: [michaelchristlambert@gmail.com]
- GitHub: [@michaelsinanta]

**Muhammad Hafizha Dhiyaulhaq**
- Email: [hafizadhyaulhaq16@gmail.com]
- GitHub: [@hafizhdh]
---

**#BahasaUntukBangsa** - Preserving Indonesian Local Languages Through Data Annotation
```