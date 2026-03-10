# COSC Midterm

This repo contains two independent projects submitted for the midterm:

1. **Pawfect Match** — a full-stack pet adoption web app
2. **libmath** — a shared library in C implementing basic arithmetic

---

## Project 1: Pawfect Match

A full-stack pet adoption web app. Users can register, log in, submit adoption applications, and manage their account.

<img width="2765" height="1487" alt="image" src="https://github.com/user-attachments/assets/a8d9b4f8-d5de-4b81-9503-8ad0400b1b0e" />

### Tech Stack

- **Backend:** Node.js, Express 5
- **Database:** MySQL (via `mysql2`)
- **Auth:** `bcryptjs` for password hashing, `express-session` for session management
- **Frontend:** Vanilla HTML/CSS/JS, Quicksand font

### Features

- User registration and login
- Session-based authentication
- Change username, email, and password
- Submit and view pet adoption applications
- Persistent login via session cookie

### Setup

#### Prerequisites

- Node.js >= 18
- MySQL server running locally

#### Steps

1. **Install dependencies**

   ```bash
   cd website-example
   npm install
   ```

2. **Create the database**

   ```bash
   mysql -u root -p < schema.sql
   ```

3. **Create a `.env` file**

   ```env
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=capstone_auth
   SESSION_SECRET=your_secret_here
   PORT=3000
   ```

4. **Start the server**

   ```bash
   node server.js
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Project Structure

```
website-example/
├── public/
│   ├── index.html      # Single-page UI
│   ├── style.css
│   └── script.js
├── routes/
│   ├── auth.js         # Register, login, logout, account settings
│   └── adopt.js        # Submit and retrieve adoption applications
├── db.js               # MySQL connection pool
├── server.js           # Express app entry point
└── schema.sql          # Database schema
```

### Notes

- Passwords are hashed with bcrypt (12 salt rounds)
- Sessions expire after 24 hours

---

## Project 2: libmath (Shared Library in C)

A shared library (`libmath.so`) that exposes four basic arithmetic functions. Also includes a `main.c` driver to demonstrate usage.

### Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `add` | `double add(double a, double b)` | Returns `a + b` |
| `subtract` | `double subtract(double a, double b)` | Returns `a - b` |
| `multiply` | `double multiply(double a, double b)` | Returns `a * b` |
| `divide` | `double divide(double a, double b)` | Returns `a / b`, prints error on division by zero |

### Build & Run

#### Prerequisites

- GCC
- Make

#### Build the shared library

```bash
cd shared-library
make
```

This compiles `Mathlib.c` into `libmath.so` using `-fPIC` (position-independent code) and `-shared`.

#### Compile and run the demo

```bash
gcc -o demo main.c -L. -lmath -Wl,-rpath,.
./demo
```

The program prompts for two numbers and prints the result of all four operations.

#### Clean up

```bash
make clean
```

### Project Structure

```
shared-library/
├── Mathlib.h       # Function declarations
├── Mathlib.c       # Function implementations
├── main.c          # Demo driver
└── Makefile        # Build rules
```
