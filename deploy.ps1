# Deploy Script for Windows
Write-Host "🚀 Deploying Smart Document Risk Analyzer..." -ForegroundColor Green

# Backend
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend
Write-Host "🎨 Building frontend..." -ForegroundColor Yellow
cd ..\frontend
npm install
npm run build

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173"
Write-Host "🔧 Backend: http://localhost:8000"