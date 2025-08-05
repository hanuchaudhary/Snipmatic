# Snipmatic

A modern code snippet management platform built with TypeScript, Python, and Go.

## 🚀 Live Demo

Visit [Snipmatic](https://snipmatic.vercel.app) to see the application in action.

## 📋 Overview

Snipmatic is a comprehensive code snippet management solution that allows developers to store, organize, and share code snippets efficiently. The platform combines a robust TypeScript frontend with Python and Go backend services to deliver a seamless experience for developers.

## 🛠️ Tech Stack

- **Frontend**: TypeScript (60.6%)
- **Backend Services**: Python (29.1%), Go (6.3%)
- **Styling**: CSS (1.7%)
- **Containerization**: Docker (1.0%)
- **Scripts**: PowerShell (0.6%)
- **Other**: Various configuration files (0.7%)

## ✨ Features

- 📝 Create and manage code snippets
- 🏷️ Organize snippets with tags and categories
- 🔍 Advanced search functionality
- 🌐 Share snippets with the community
- 💾 Export/import snippet collections
- 🎨 Syntax highlighting for multiple languages
- 📱 Responsive design for all devices

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- Go (v1.19 or higher)
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hanuchaudhary/Snipmatic.git
cd Snipmatic
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Install Go dependencies
go mod tidy
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development servers:
```bash
# Start frontend
npm run dev

# Start Python backend
python app.py

# Start Go services
go run main.go
```

## 🐳 Docker Deployment

Build and run with Docker:

```bash
docker build -t snipmatic .
docker run -p 3000:3000 snipmatic
```

## 📁 Project Structure

```
Snipmatic/
├── src/                 # TypeScript frontend source
├── backend/             # Python backend services
├── services/            # Go microservices
├── public/              # Static assets
├── docs/                # Documentation
└── docker/              # Docker configuration
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Hanu Chaudhary** - [@hanuchaudhary](https://github.com/hanuchaudhary)
- **Kushagra** - [@kushagra21-afk](https://github.com/kushagra21-afk)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Snipmatic
- Special thanks to the open-source community for inspiration and tools
- Built with ❤️ for developers, by developers

---

⭐ Don't forget to star this repository if you found it helpful!