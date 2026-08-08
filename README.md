# Heal-Bit

A full-stack healthcare web application built using **Spring Boot**, **React**, and **MySQL**.

Heal-Bit connects **patients**, **doctors**, **hospitals** and **administrators** on one platform —
patients find hospitals and book real 30-minute appointment slots, doctors manage their own
schedules and appointments, hospitals onboard doctors and track activity, and administrators
approve hospitals and oversee the whole network.

### Features

- **Slot-based booking** — doctors publish working days, hours and breaks; patients book only genuinely free 30-minute slots (enforced at the database level, so a slot can never be double-booked)
- **Four roles** — patient, doctor, hospital and admin, each with its own dashboard
- **Payments** — pay online via Razorpay or in cash at the clinic, with automatic refunds on cancellation
- **Health documents** — patients upload reports and prescriptions (stored on Cloudinary); their doctors can view them
- **Email notifications** — patients are emailed when an appointment is received, confirmed, declined, moved, cancelled or completed
- **Ratings** — only patients who completed a visit can rate the doctor and hospital
- **Security** — JWT authentication, BCrypt passwords, and Google reCAPTCHA on every login and sign-up

---

## 1. Requirements

| Tool | Notes |
|---|---|
| **Java 17+** | Required by Spring Boot |
| **Node.js 18+** | For the React frontend |
| **MySQL 8** | Not needed if you use Docker |
| **Docker Desktop** | Only for the one-command setup |

---

## 2. Clone the repository

```bash
git clone https://github.com/KartikBawake/Heal-bit.git
cd Heal-bit
```

---

## 3. Configure your credentials

The repository ships **without** third-party credentials, so you need to add your own.

Open:

```text
backend/src/main/resources/application.properties
```

> **Only MySQL is mandatory.** Every other integration degrades gracefully — leave it blank and
> that feature simply switches off while the rest of the app keeps working.

### 3.1 MySQL (required)

```properties
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

The `healbit_db` database is created automatically on first run.

### 3.2 Razorpay — online payments (optional)

Sign up at [razorpay.com](https://razorpay.com), stay in **Test Mode**, then open
**Settings → API Keys → Generate Test Key**.

```properties
razorpay.key-id=rzp_test_xxxxxxxxxxxx
razorpay.key-secret=your_key_secret
```

The frontend needs the **key id** too (it's public). Create a file `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> **Testing a payment:** choose **Netbanking → Success** in the Razorpay popup. In test mode the
> UPI QR can't be scanned and international test cards are rejected by default.
> Leave the keys blank and online payment won't complete — cash bookings still work.

### 3.3 Google reCAPTCHA v2 — bot protection (optional)

Register a site at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin), choose
**reCAPTCHA v2 → "I'm not a robot" checkbox**, and add **`localhost`** to the allowed domains.

```properties
google.recaptcha.secret=your_secret_key
```

And in `frontend/.env`:

```env
VITE_RECAPTCHA_SITE_KEY=your_site_key
```

> To switch the captcha off while developing, set `google.recaptcha.enabled=false`.

### 3.4 Cloudinary — file storage (optional)

Sign up at [cloudinary.com](https://cloudinary.com). On the **Dashboard**, copy the **Cloud name**,
**API Key** and **API Secret** (use the key named **Root**).

```properties
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

> **One setting to change in Cloudinary:** go to **Settings → Security** and enable
> **"Allow delivery of PDF and ZIP files"**, otherwise PDF documents won't open.
>
> No folders need creating — `healbit/patient-documents` and `healbit/hospitals` are created
> automatically. Leave these blank and uploads fall back to local disk (`backend/uploads/`).

### 3.5 Email notifications via Gmail (optional)

Gmail no longer accepts your normal password, so you need an **App Password**:

1. Enable **2-Step Verification** on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create one named `Heal-Bit` and copy the 16-character password
4. Paste it **without spaces**

```properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your16charapppassword
```

> Emails are sent in the background — if mail fails, the booking still succeeds.
> Set `healbit.mail.enabled=false` to turn notifications off.

---

## 4. Run with Docker

The fastest way to run everything — frontend, backend and MySQL together.

```bash
docker compose up --build
```

Open the application at:

```text
http://localhost:5173
```

Credentials live in `application.properties`, so edit that file **before** building. If you change
it later, rebuild with `docker compose up --build`.

### Stop the application

Press `Ctrl + C`, then:

```bash
docker compose down
```

MySQL data is stored in a Docker volume and survives restarts. Do **not** run
`docker compose down -v` unless you want to delete the saved database data.

---

## 5. Run locally without Docker

### 5.1 Start the backend

```bash
cd backend
./mvnw clean spring-boot:run
```

On Windows use `mvnw.cmd clean spring-boot:run`.

Tables are created automatically on first run and the specialization list is seeded.

> Always include `clean` after pulling changes — a stale build is the most common reason a new
> change doesn't show up.

### 5.2 Start the frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

### 5.3 Open the application

```text
http://localhost:5173
```

---

## 6. Default admin credentials

An administrator account is created automatically on first startup:

- **Email:** `admin@healbit.com`
- **Password:** `Admin@123`

---

## 7. How the roles fit together

1. A **hospital** registers → receives an auto-generated registration number → waits for approval
2. The **admin** approves it → the hospital becomes visible to patients
3. The **hospital** adds **doctors** and issues each of them a login
4. A **doctor** signs in and publishes working days, hours and break times
5. A **patient** registers, finds a hospital, picks an open slot, and pays online or chooses cash
6. The **doctor** confirms, completes or declines it — the patient is emailed at each step

---

## 8. Tech stack

**Backend** — Spring Boot, Spring Security (JWT), Hibernate/JPA, MySQL, Razorpay, Cloudinary, Jakarta Mail

**Frontend** — React, Vite, React Router, Recharts, Axios
