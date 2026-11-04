# Expense Tracker (Django + Vanilla JS)

A full-stack expense tracking application. Users can securely register, log in, and manage their personal expenses. The dashboard features a real-time visualization of spending by category using Chart.js.

## Architecture

This is a decoupled monorepo containing both the frontend and backend:
- **Backend:** Django REST Framework (Python) serving a secure Token-authenticated API.
- **Frontend:** Vanilla JavaScript (HTML/CSS) consuming the API and rendering the UI.
- **Database:** PostgreSQL (hosted on Neon) for production, SQLite for local development.
- **Hosting:** The backend is deployed as a Render Web Service, and the frontend is deployed as a Render Static Site.

## Features

- 🔐 **Token Authentication:** Secure user registration and login.
- 💸 **Expense CRUD:** Add, view, and delete personal expenses.
- 🛡️ **User-Scoped Data:** Users can only see and delete their own expenses.
- 📊 **Data Visualization:** A Chart.js doughnut chart that dynamically groups expenses by category.
- 📱 **Responsive Design:** Works seamlessly on desktop and mobile devices.
- ☁️ **Production Ready:** Configured for deployment with WhiteNoise, Gunicorn, and PostgreSQL.

## Project Structure

```text
expense-tracker-django/
├── backend/
│   ├── config/          # Django project settings
│   ├── expenses/        # Django app (models, views, serializers)
│   ├── requirements.txt # Python dependencies
│   └── manage.py
├── frontend/
│   ├── index.html       # UI layout
│   ├── style.css        # Styling
│   └── app.js           # API fetching and DOM manipulation
├── .gitignore
└── README.md

Run Locally
1. Backend Setup (Django)

cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file in the backend/ folder and add:
# SECRET_KEY=your_django_secret_key
# DEBUG=True

# Run database migrations
python manage.py migrate

# Create a superuser (optional, for admin access)
python manage.py createsuperuser

# Start the backend server
python manage.py runserver

The API will be running at http://127.0.0.1:8000/.

2. Frontend Setup (Vanilla JS)
Open a new terminal.

Navigate to the frontend folder.

If using VS Code, right-click index.html and select "Open with Live Server" (or simply open the file in your browser).

The frontend will run at http://127.0.0.1:5500 (or 5501).

(Note: Ensure CORS_ALLOWED_ORIGINS in backend/config/settings.py matches the exact port your frontend is running on).

Deployment Guide

Backend (Render + Neon)
Create a free PostgreSQL database on Neon and copy the Pooled Connection String.

On Render, create a New Web Service and connect this repository.

Set the Root Directory to backend.

Set the Build Command to: pip install -r requirements.txt && python manage.py migrate

Set the Start Command to: gunicorn config.wsgi:application

Add the following Environment Variables:

SECRET_KEY: Your Django secret key.

DEBUG: False

DATABASE_URL: Your Neon connection string.

Frontend (Render Static Site)
On Render, create a New Static Site and connect this repository.

Set the Root Directory to frontend.

Leave the Build Command blank.

Set the Publish Directory to . (a single dot).

Update the API_BASE constant in frontend/app.js to point to your new live Render backend URL, and push the changes.

Add your new live frontend URL to CORS_ALLOWED_ORIGINS in backend/config/settings.py and push the changes.

License
MIT