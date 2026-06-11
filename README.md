# Resume.io - Build Better Resumes Faster

A full-stack resume builder application with version control, PDF export, and timeline tracking. Built with React, Node.js, Express, and MongoDB.

## 🎯 Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:8080` to start using the application.

## 🚀 Features

### Core Functionality
- **Resume Builder**: Create and edit professional resumes with a live preview
- **Version Control**: Git-like version history for tracking resume changes
- **PDF Export**: Generate professional PDF resumes with proper formatting
- **Timeline View**: Visual timeline of all resume versions and changes
- **Auto-save**: Automatic saving of changes every 3 seconds
- **Duplicate Resumes**: Clone existing resumes with one click

### User Experience
- **Smooth Navigation**: React Router-based navigation with breadcrumbs
- **Professional Formatting**: Clean, ATS-friendly resume templates
- **Real-time Preview**: See changes instantly as you type
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd resume-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:8080
NODE_ENV=development
SHARE_LINK_EXPIRES_DAYS=30
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

The frontend is configured to proxy API requests to `http://localhost:4000` (see `vite.config.ts`).

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:8080`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
resume-app/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   └── resumeController.js # Resume CRUD operations
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/
│   │   ├── User.js            # User model
│   │   └── Resume.js          # Resume model with versioning
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── resumes.js         # Resume routes
│   │   └── share.js           # Share link routes
│   ├── utils/
│   │   └── pdf.js             # PDF generation with Puppeteer
│   └── server.js               # Express server setup
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BackButton.tsx        # Universal back button
│   │   │   ├── Breadcrumbs.tsx        # Navigation breadcrumbs
│   │   │   ├── ResumePreviewModal.tsx # Resume preview modal
│   │   │   └── ui/                    # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Main dashboard
│   │   │   ├── ResumeEditor.tsx       # Resume editor with live preview
│   │   │   ├── Timeline.tsx            # Version history timeline
│   │   │   ├── Login.tsx              # Login page
│   │   │   ├── Signup.tsx             # Signup page
│   │   │   └── Index.tsx              # Landing page
│   │   ├── services/
│   │   │   ├── auth.ts                # Auth API calls
│   │   │   └── resume.ts               # Resume API calls
│   │   ├── Context/
│   │   │   └── UserContext.tsx        # User state management
│   │   └── App.tsx                    # Main app component with routes
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Resumes
- `GET /api/resumes` - List all user resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get resume by ID
- `PUT /api/resumes/:id` - Update resume (autosave)
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/:id/duplicate` - Duplicate resume

### Versions
- `GET /api/resumes/:id/versions` - List all versions
- `GET /api/resumes/:id/versions/:versionId` - Get specific version
- `POST /api/resumes/:id/versions/compare` - Compare two versions

### Export & Share
- `GET /api/resumes/:id/export/pdf` - Export resume as PDF
- `POST /api/resumes/:id/share` - Create shareable link

## 🎨 Features in Detail

### Resume Editor
- **Two-column layout**: Edit form on left, live preview on right
- **Auto-save**: Changes saved automatically every 3 seconds
- **Manual save**: Save button for immediate save
- **Preview modal**: Full-screen preview with PDF export options
- **Version history**: Access timeline of all changes

### PDF Generation
- **Professional formatting**: Clean, ATS-friendly layout
- **Proper spacing**: Optimized margins and line heights
- **View & Download**: View PDF in browser or download
- **Valid PDFs**: Ensures PDFs are properly formatted and readable

### Timeline View
- **Version history**: See all saved versions chronologically
- **Version details**: View commit messages and timestamps
- **View versions**: Click to view any previous version
- **Visual timeline**: Git-like timeline interface

### Navigation
- **Breadcrumbs**: Clear navigation path on all pages
- **Back buttons**: Easy navigation back to dashboard
- **Smooth transitions**: React Router for seamless navigation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configured CORS for frontend
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet**: Security headers middleware
- **Input Validation**: Server-side validation for all inputs

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Puppeteer** - PDF generation
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Axios** - HTTP client
- **Vite** - Build tool

## 📝 Environment Variables

### Backend (.env)
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/resumevault
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:8080
NODE_ENV=development
SHARE_LINK_EXPIRES_DAYS=30
```

## 🐛 Troubleshooting

### PDF Export Issues
- Ensure Puppeteer is properly installed: `npm install puppeteer`
- Check that Chrome/Chromium is available for Puppeteer
- Verify PDF buffer validation in backend logs

### MongoDB Connection
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check network connectivity for Atlas connections
- Verify MONGO_URI in .env file

### CORS Issues
- Ensure CLIENT_URL in backend .env matches frontend URL
- Check that credentials are included in API requests

## 🚀 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform:
   - `PORT` - Server port (default: 4000)
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `CLIENT_URL` - Frontend URL
   - `NODE_ENV` - Set to "production"

2. Ensure Puppeteer dependencies are installed (Chrome/Chromium)

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Update `vite.config.ts` if needed for your deployment platform

3. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Environment Variables for Production

**Backend (.env):**
```env
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/resumevault
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
SHARE_LINK_EXPIRES_DAYS=30
```

**Frontend:** Update API base URL in `src/lib/api.ts` if needed for production.

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using React, Node.js, and MongoDB**
