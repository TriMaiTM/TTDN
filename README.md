# TTDN-3 Store - News Management System

A complete news management system built with Angular 18+ and Firebase Firestore.

## Features

### Admin Panel
- ✅ Full CRUD operations for news management
- ✅ Category management system
- ✅ Rich text content editor
- ✅ Image upload and management
- ✅ News status management (draft/published)
- ✅ Real-time data synchronization

### Public Pages
- ✅ News listing with category filtering
- ✅ News detail pages with rich content display
- ✅ Responsive design
- ✅ Breadcrumb navigation
- ✅ Search and pagination
- ✅ Share functionality

### Technical Features
- ✅ Angular 18+ with standalone components
- ✅ Firebase Firestore integration
- ✅ Angular Material UI components
- ✅ TypeScript with strict typing
- ✅ Reactive forms with validation
- ✅ Dark theme support
- ✅ Mobile-responsive design

## Tech Stack

- **Frontend**: Angular 18+, Angular Material, TypeScript
- **Backend**: Firebase Firestore
- **Styling**: SCSS with CSS variables
- **Build Tool**: Angular CLI
- **Package Manager**: npm

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── admin/
│   │   │   └── news-admin/          # Admin panel for news management
│   │   ├── news/                    # Public news listing
│   │   └── news-detail/             # Individual news article pages
│   ├── services/
│   │   ├── admin-news.service.ts    # News management service
│   │   └── firebase-data.service.ts # Firebase integration
│   ├── pipes/
│   │   └── nl2br.pipe.ts           # Text formatting pipe
│   └── components/                  # Reusable UI components
├── environments/
│   └── firebase.config.example.ts   # Firebase configuration template
└── assets/
    ├── data/                        # Mock data files
    └── images/                      # Static images
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm
- Angular CLI (`npm install -g @angular/cli`)
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TTDN_3.git
   cd TTDN_3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Copy `src/environments/firebase.config.example.ts` to `src/environments/firebase.config.ts`
   - Fill in your Firebase project configuration
   - Create Firestore collections: `news` and `news_categories`

4. **Run the development server**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`

5. **Access Admin Panel**
   - Go to `/admin/news-admin` to manage news articles
   - Use the "Initialize Sample Data" button to create test data

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run lint` - Run linting
