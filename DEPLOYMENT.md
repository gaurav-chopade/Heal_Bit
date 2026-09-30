# Deploying Heal-Bit to a server

This guide deploys Heal-Bit on **AWS** with one Ubuntu server (EC2) and a managed MySQL database (RDS).

```text
Browser --> Nginx (80/443) --+--> /          static React build  (/var/www/healbit)
                             +--> /api/*     Spring Boot on :8080 (prefix stripped)
                                                  |
                                              RDS MySQL
```

The browser only ever talks to Nginx, so there is no cross-origin traffic in production.
Running locally or with Docker is covered in the main [README](README.md) and is unchanged.

| File | Goes to |
|---|---|
| `deploy/healbit.env.example` | `/etc/healbit.env` (fill in your secrets) |
| `deploy/healbit.service` | `/etc/systemd/system/healbit.service` |
| `deploy/nginx-healbit.conf` | `/etc/nginx/sites-available/healbit` |
| `backend/src/main/resources/application-prod.properties` | packaged inside the jar, used when `SPRING_PROFILES_ACTIVE=prod` |
| `frontend/.env.production` | used automatically by `npm run build` |

---

## 1. Build on your own machine

**Backend** (needs Java 17):

```bash
cd backend
./mvnw clean package -DskipTests      # Windows: mvnw.cmd clean package -DskipTests
# result: backend/target/healbit.jar
```

**Frontend** (needs Node 18+):

```bash
cd frontend
npm ci
npm run build
# result: frontend/dist
```

The two public keys below are baked into the bundle at build time. To use your own production keys,
set them just for that build.

```bash
# macOS / Linux / Git Bash
VITE_RECAPTCHA_SITE_KEY=<site-key> VITE_RAZORPAY_KEY_ID=<key-id> npm run build
```

```powershell
# Windows PowerShell
$env:VITE_RECAPTCHA_SITE_KEY="<site-key>"; $env:VITE_RAZORPAY_KEY_ID="<key-id>"; npm run build
```

---

## 2. Create the database (RDS)

1. Create an **RDS MySQL 8** instance (the free tier is enough for a demo).
2. Create the database, using backticks because the name has a hyphen:
   ```sql
   CREATE DATABASE `heal-bit`;
   ```
   (Optional: the `createDatabaseIfNotExist=true` flag in the JDBC URL also does this if the user may create databases.)
3. In the RDS security group, allow inbound **3306 only from the EC2 server's security group**, never from the whole internet.

## 3. Prepare the server (EC2)

1. Launch an **Ubuntu** instance. Open inbound ports **22, 80 and 443** in its security group.
2. Install the software:
   ```bash
   sudo apt update
   sudo apt install -y openjdk-17-jre-headless nginx
   ```
3. Create the folders the app uses:
   ```bash
   sudo mkdir -p /var/www/healbit
   mkdir -p /home/ubuntu/uploads/patient-documents
   ```

## 4. Upload the files

From your machine, in the project root:

```bash
scp -i your-key.pem backend/target/healbit.jar ubuntu@<SERVER_IP>:/home/ubuntu/healbit.jar
scp -i your-key.pem -r frontend/dist ubuntu@<SERVER_IP>:/tmp/healbit-dist
scp -i your-key.pem deploy/healbit.service deploy/nginx-healbit.conf deploy/healbit.env.example ubuntu@<SERVER_IP>:/tmp/
```

## 5. Configure and start the backend

On the server:

```bash
sudo cp /tmp/healbit.env.example /etc/healbit.env
sudo chmod 600 /etc/healbit.env
sudo nano /etc/healbit.env            # replace every <placeholder> with a real value

sudo cp /tmp/healbit.service /etc/systemd/system/healbit.service
sudo systemctl daemon-reload
sudo systemctl enable --now healbit
sudo systemctl status healbit         # should say "active (running)"
```

If it fails to start, read the log: `journalctl -u healbit -n 100 --no-pager`.
A missing required variable is named in the error message.

## 6. Serve the frontend with Nginx

```bash
sudo cp -r /tmp/healbit-dist/* /var/www/healbit/

sudo cp /tmp/nginx-healbit.conf /etc/nginx/sites-available/healbit
sudo nano /etc/nginx/sites-available/healbit      # set server_name to your domain
sudo ln -s /etc/nginx/sites-available/healbit /etc/nginx/sites-enabled/healbit
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 7. Turn on HTTPS

Point your domain's **A record** to the server's IP, then:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 8. Check that it works

```bash
curl -i http://localhost:8080/specializations      # backend directly: 200 and a JSON list
curl -i http://localhost/api/specializations       # through Nginx: the same answer
```

Then in a browser: open the site, register a patient, log in, refresh on an inner page (it should
not 404), and upload a small document.

---

## Updating a running deployment

```bash
# backend: upload the new jar, then
sudo systemctl restart healbit

# frontend: rebuild, upload dist, then
sudo cp -r /tmp/healbit-dist/* /var/www/healbit/
```

---

## Things to know before going live

- **reCAPTCHA keys are tied to domains.** The keys in this repository are real keys, not Google's
  always-pass test keys, and they only work on the domains registered for them. On your own domain,
  create a key pair at <https://www.google.com/recaptcha/admin> (type **v2 checkbox**), build the
  frontend with `VITE_RECAPTCHA_SITE_KEY` and put the secret in `RECAPTCHA_SECRET`. Otherwise every
  login and sign-up fails on the live site.
- **Rotate anything that was ever committed.** The JWT secret, the Razorpay test key secret, the
  reCAPTCHA secret and the default admin password are in the Git history. If the repository is
  public, treat them as exposed and use new values in `/etc/healbit.env`.
- **The admin account is created once.** `ADMIN_PASSWORD` only applies on the first start, while the
  admin table is empty. On that first start the backend also prints the admin password to its log,
  so keep the log private.
- **Uploads.** With Cloudinary disabled, documents live in `/home/ubuntu/uploads` on the server and
  disappear if the instance is replaced. Use Cloudinary or back that folder up.
- **Schema.** `ddl-auto=update` is convenient for the first deploy. Once the tables exist, change it
  to `validate` in `application-prod.properties`.
- **CORS.** `CORS_ALLOWED_ORIGINS` must match the address in the browser exactly
  (`https://yourdomain.com`, no trailing slash). It only matters if something other than Nginx calls the API.
