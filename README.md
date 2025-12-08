# PoppinFlea - Table Booking System 🎟️

A modern, responsive table booking and reservation management system built for **PoppinFlea** events. This application allows users to book tables for specific dates and times, and provides admins with a dashboard to manage these bookings in real-time using Google Sheets as the backend database.

## 🚀 Features

### 🌟 User Features
*   **Event Information**: Home page displaying event dates, venue details (Cafe The Cartel), and past event highlights.
*   **Table Booking**: Easy-to-use form to book tables for Dec 24, 25, and 26.
*   **Real-time Availability**: Automatically limits bookings to 15 per day.
*   **Email Confirmation**: Users receive an instant confirmation email with a unique **Reference ID**.
*   **Open Mic Registration**: Direct link to register for Open Mic events.
*   **Responsive Design**: Optimized for mobile and desktop devices.

### 🛡️ Admin Features
*   **Dashboard**: Secure admin area to view all bookings in a tabular format.
*   **Status Management**: Mark bookings as **Arrived**, **Completed** (Empty Table), or **Cancelled**.
*   **On-Spot Registration**: Admin form to add walk-in guests directly.
*   **Optimistic UI**: Instant feedback on button clicks for a smooth experience.
*   **Cancellation**: Cancel bookings with one click (triggers an email notification to the user).

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (React)
*   **Styling**: CSS Modules (Vanilla CSS)
*   **Database**: Google Sheets (via Google Sheets API v4)
*   **Email Service**: Nodemailer (Gmail SMTP)
*   **Authentication**: Simple local storage check (Admin)

## ⚙️ Setup & Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd poppin
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add the following:
    ```env
    GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account-email
    GOOGLE_SHEETS_PRIVATE_KEY="your-private-key"
    GOOGLE_SHEET_ID=your-sheet-id
    EMAIL_USER=your-gmail-address
    EMAIL_PASS=your-gmail-app-password
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  **Open the app**:
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

*   `pages/`
    *   `index.js`: Home page with event and venue info.
    *   `book.js`: Booking form page.
    *   `admin/`: Admin dashboard and login.
    *   `api/`: Server-side API routes for booking and sheet management.
*   `styles/`: CSS modules for component-level styling.
*   `components/`: Reusable UI components (Navbar, etc.).

## 📝 Google Sheets Structure

The system expects a Google Sheet with the following columns (in order):
`Ref ID | Name | Phone | Email | Area | Date | Time | Adults | Children | Comments | Action | Status`

---
Built with ❤️ for PoppinFlea.
