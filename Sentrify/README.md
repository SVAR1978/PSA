# Sentrify - Password Strength Analyzer

A full-stack Password Strength Analyzer built with React (Vite) and Node.js (Express), backed by a PostgreSQL database. This is a learning project focused on password security and applied cryptography.

## Features
- **Client-Side Strength Analysis**: Calculates password entropy (`E = L * log2(R)`) based on active character pools.
- **Pattern Penalties**: Detects and penalizes sequential characters (`abc`), repeated characters (`aaa`), and keyboard patterns (`qwerty`).
- **Secure Password Generation**: Uses the Web Crypto API (`window.crypto.getRandomValues`) to generate cryptographically secure 16-character passwords.
- **Reuse Prevention**: Hashes passwords on the client side using SHA-256 and sends the digest to the backend. The backend securely hashes it again using `bcrypt` and stores it in PostgreSQL to prevent password reuse across the session.
- **Modern UI**: Fully responsive dark-mode interface with a live strength meter and actionable suggestions.

## Tech Stack
- **Frontend**: React (TypeScript), Vite, vanilla CSS.
- **Backend**: Node.js, Express, `bcrypt`, `pg` (PostgreSQL connection pool).
- **Database**: PostgreSQL (Easily provisioned via Neon).

---

## 🚀 Getting Started

Follow these steps to run the project on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [npm](https://www.npmjs.com/) or yarn

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Sentrify
```

### 2. Setup the Database (Neon)
We use [Neon](https://neon.tech/) to easily spin up a serverless PostgreSQL database. You can automatically configure it using the Neon CLI.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the Neon setup command:
   ```bash
   npx --yes neonctl@latest init --agent --data '{"step":"getting-started","framework":"express","features":["database","auth"]}'
   ```
   *This will open your browser to log in/sign up. Once authenticated, it will automatically create a database and update your `backend/.env` file with the connection string!*

### 3. Start the Backend Server
In the same `backend` directory, install the dependencies and start the server:

```bash
npm install
npm run dev
```
You should see:
- `Server listening on port 3001`
- `Connected to PostgreSQL Database.`
- `Database schema initialized.`

### 4. Start the Frontend App
Open a **new** terminal window, navigate to the `frontend` directory, and start the React app:

```bash
cd frontend
npm install
npm run dev
```

### 5. Open the App!
Navigate to [http://localhost:5173](http://localhost:5173) in your web browser. Try analyzing a password, generating a secure one, and saving it to test the reuse prevention!

---

## Security Notes (For Learners)
- **Never send plaintext passwords**: In this project, the frontend hashes the password using SHA-256 *before* sending it over the network.
- **Use CSPRNG**: The password generator avoids `Math.random()` and instead uses the cryptographically secure `window.crypto.getRandomValues`.
- **Double Hashing**: The backend takes the SHA-256 digest and hashes it *again* using `bcrypt` with a salt (10 rounds) before storing it in the database.
