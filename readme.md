# Portfolio Management System

This is a web application built with Node.js and Express.js for managing portfolios. It allows users to register, login, and manage their items in a portfolio. Additionally, administrators have access to an admin panel for managing all items in the system.

## Features

- **User Registration and Authentication:** Users can register for an account with a unique username and password. Authentication is handled securely using bcrypt for password hashing.
- **Session Management:** Sessions are managed using express-session to keep users logged in across requests.
- **Item Management:** Users can add, edit, and delete items in their portfolio, including uploading images.
- **Admin Panel:** Administrators have access to an admin panel where they can view and manage all items in the system.
- **MongoDB Integration:** Data is stored in MongoDB, and Mongoose is used as the ODM (Object Data Modeling) library for Node.js.
- **Email Notification:** Users receive a welcome email upon successful registration. Nodemailer is used to send emails via SMTP.
- **Static File Serving:** Static files (e.g., CSS, JavaScript) are served using Express.js to enhance the user interface.

## Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:

    ```bash
    cd final-web-
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:

    ```env
    PORT=3000
    MONGODB_URL=
    EMAIL_USER=
    EMAIL_PASS=
    ```

   Replace `MONGODB_URI`, `EMAIL_USER`, and `EMAIL_PASS` with your MongoDB connection URI and email credentials.

5. Start the server:

   

6. Access the application:

   Open your web browser and visit `http://localhost:3000`.


## Usage

- Visit `http://localhost:3000/register` to register for a new account.
- After registration, login at `http://localhost:3000/login`.
- Add, edit, or delete items in the portfolio at `http://localhost:3000/dashboard`.
- Administrators can access the admin panel at `http://localhost:3000/admin` to manage all items.

## Dependencies

- [Express.js](https://expressjs.com/): Web application framework for Node.js
- [Mongoose](https://mongoosejs.com/): MongoDB object modeling for Node.js
- [bcrypt](https://www.npmjs.com/package/bcrypt): Library for password hashing and salting
- [express-session](https://www.npmjs.com/package/express-session): Session middleware for Express.js
- [Nodemailer](https://nodemailer.com/): Library for sending emails from Node.js
- [dotenv](https://www.npmjs.com/package/dotenv): Loads environment variables from a .env file into process.env

