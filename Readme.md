# Full Stack AI Ticketing System and Chat Application 🎫🤖


A backend ticket management system with AI-POWERED ticket using Node.js, Express.js, MongoDB, and Inngest and Gemini AI.

--- 
## 🚀 Features

- User authentication (JWT based)
- Role-based access (User / Moderator / Admin)
- Ticket creation and management
- AI-powered ticket triage (priority, skills, notes)
- Automatic moderator assignment
- Email notifications
- Event-driven architecture using Inngest

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- Inngest (Event-driven workflows)
- Gemini AI (via Inngest Agent Kit)
- JWT Authentication
- Nodemailer


## 📦 Installation
1. Clone the repository:
``` bash
git clone https://github.com/your-username/your-repo-name.git
```
2. Navigate to the project folder:
``` bash
For backend
cd server-ai-assistant 
For frontend
cd ai-assistant-frontend
```

3. Install dependencies:
```bash  
npm install 
```

4. Set up environment variables:
```bash 
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key

For frontend
REACT_APP_API_URL=http://localhost:3000
```

5. Run the application:
```bash
For backend also needs to run inngest server
npm run inngest-dev          --- Running inngest server
npm run dev                  --- Running backend server

For frontend
npm run dev                  --- Running frontend server
```
# 🧠 AI Workflow

dont point Ticket created → ticket/created event

AI analyzes ticket (summary, priority, skills)

Moderator assigned automatically

Email notification sent


# 📁 Project Structure

# 🔮Future Improvements



