# BlockLedger - Minecraft Financial Dashboard MVP

A playful, Minecraft-inspired financial dashboard that gamifies personal finance management. Transform your financial journey into an epic adventure with treasure chests, quest bottles, and adventure logs!

## 🎮 Features

### Core Functionality
- **Treasure Chests**: Manage bank accounts and savings as magical chests
- **Quest Bottles**: Track financial goals with animated progress bottles
- **Adventure Log**: View transaction history as an epic quest journal  
- **Investment Treasures**: Manage your investment portfolio
- **Oracle Insights**: Get predictive suggestions based on your activity
- **Auto-calculated Networth**: See your total kingdom value

### Design Highlights
- Minecraft-inspired pixel aesthetic with modern UI elements
- Responsive design for mobile and desktop
- Smooth animations with accessibility support (prefers-reduced-motion)
- Playful financial terminology ("quests" instead of "budgets")

## 🚀 Getting Started

### Running Locally
1. Download the `index.html` file
2. Open it in any modern web browser
3. No server or build process required!

### Demo Data
- Click "🎲 Seed Demo" to populate with sample data
- Click "🗑️ Reset" to clear all data and start fresh
- All data is stored in localStorage

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Pure HTML, CSS, and Vanilla JavaScript
- **Storage**: localStorage for demo purposes
- **Fonts**: Press Start 2P (pixel aesthetic) + Inter (modern UI)
- **Icons**: Emoji and inline SVG for simplicity

### File Structure
```
index.html          # Complete single-file application
README.md          # This documentation
```

## 🔌 Backend Integration

### Mock API Endpoints (Ready for Real Implementation)

The application is designed with a clear API contract for easy backend integration:

#### Authentication
```javascript
// POST /api/user
{
  "username": "string",
  "password": "string"
}
// Response: { "id": "string", "username": "string" }
```

#### Data Endpoints
```javascript
// GET /api/networth
// Response: { 
//   "networth": number, 
//   "breakdown": [{"type": "chest|investment", "name": "string", "amount": number}] 
// }

// GET/POST /api/goals
// Response: [{ "id": "string", "name": "string", "target": number, "current": number }]

// GET/POST /api/transactions  
// Response: [{ "id": "string", "title": "string", "amount": number, "type": "credit|debit", "source": "string", "timestamp": "string" }]

// POST /api/predict
// Response: { "insights": [{ "title": "string", "confidence": number, "actionable": boolean }] }
```

### Replacing Mock APIs

To connect to a real backend:

1. **Replace localStorage functions** in the `saveData()` and `loadData()` functions
2. **Update authentication** in the signup/login form handlers
3. **Replace state updates** with API calls in all CRUD operations
4. **Update the predictive insights** to call `/api/predict` endpoint

Example API call replacement:
```javascript
// Replace this localStorage save:
localStorage.setItem('blockledger_data', JSON.stringify(data));

// With this API call:
await fetch('/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## 🎨 Design System

### Colors
```css
--forest-dark: linear-gradient(135deg, #1a3b1a 0%, #0f2a0f 100%);
--grass-green: #4ade80;
--beige-muted: #e7d4b5;
--brown-wood: #8b4513;
--gold: #ffd700;
--diamond-blue: #0ea5e9;
```

### Typography
- **Headings**: Press Start 2P (pixel font)
- **UI Text**: Inter (modern, readable)
- **Data**: Mix of both for optimal hierarchy

### Spacing System
- Based on 8px grid: 4px, 8px, 16px, 24px, 32px, 48px

## 🚀 Next Steps

### Immediate Enhancements
1. **Real Authentication**: Replace localStorage with OAuth or JWT
2. **Three.js Animations**: Add 3D bottle filling animations
3. **API Integration**: Connect to real banking/investment APIs
4. **Push Notifications**: Goal achievements and insights
5. **Analytics**: Track user engagement and financial progress

### Advanced Features
- **Multi-currency Support**: Handle international finances
- **Category Management**: Organize transactions by adventure type
- **Sharing & Social**: Share achievements with friends
- **Mobile App**: React Native conversion
- **Advanced Predictions**: ML-powered financial insights

### Backend Requirements
- **User Management**: Registration, authentication, profiles
- **Data Persistence**: PostgreSQL or MongoDB
- **Security**: Encryption, secure sessions, data privacy
- **External APIs**: Banking integrations, market data
- **Analytics**: User behavior and financial tracking

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: CSS Grid, Flexbox, Local Storage, ES6+

## 🔒 Privacy & Security

### Current (MVP) Security
- All data stored locally in browser
- No network requests or data transmission
- No user tracking or analytics

### Production Security Recommendations
- HTTPS everywhere
- JWT tokens for authentication
- Encrypted data transmission
- Regular security audits
- GDPR compliance for EU users

## 🤝 Contributing

This is an MVP designed for demonstration. For production use:

1. Set up proper development environment
2. Add TypeScript for type safety  
3. Implement testing framework
4. Set up CI/CD pipeline
5. Add error handling and logging

## 📄 License

This project is provided as-is for educational and demonstration purposes. Feel free to adapt for your own use cases.

---

**Built with ❤️ and a love for making finance fun!**