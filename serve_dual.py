import http.server
import ssl
import threading
import sys
import os
import json
import imaplib
import email
from email.header import decode_header
import urllib.parse

DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web-pwa")
ENV_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
GMAIL_USER = "jayaneshdhanakkotti@gmail.com"

def get_app_password():
    pwd = os.environ.get("GMAIL_APP_PASSWORD")
    if pwd:
        return pwd.strip().replace(" ", "")
    
    if os.path.exists(ENV_FILE):
        try:
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GMAIL_APP_PASSWORD="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        return val.replace(" ", "")
        except Exception:
            pass
    return None

def save_app_password(pwd):
    clean_pwd = pwd.strip().replace(" ", "")
    os.environ["GMAIL_APP_PASSWORD"] = clean_pwd
    lines = []
    found = False
    if os.path.exists(ENV_FILE):
        try:
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except Exception:
            lines = []
            
    with open(ENV_FILE, "w", encoding="utf-8") as f:
        for line in lines:
            if line.startswith("GMAIL_APP_PASSWORD="):
                f.write(f"GMAIL_APP_PASSWORD={clean_pwd}\n")
                found = True
            else:
                f.write(line)
        if not found:
            f.write(f"\nGMAIL_APP_PASSWORD={clean_pwd}\n")

def clean_decode_header(header_val):
    if not header_val:
        return ""
    try:
        parts = decode_header(header_val)
        out = []
        for part, enc in parts:
            if isinstance(part, bytes):
                out.append(part.decode(enc or "utf-8", errors="replace"))
            else:
                out.append(str(part))
        return "".join(out).strip()
    except Exception:
        return str(header_val).strip()

def fetch_gmail_important(app_password, max_results=8):
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993, timeout=8)
        mail.login(GMAIL_USER, app_password)
        mail.select("INBOX", readonly=True)

        status, data = mail.search(None, '(X-GM-RAW "is:important")')
        if status != "OK" or not data[0]:
            status, data = mail.search(None, "UNSEEN")
        if status != "OK" or not data[0]:
            status, data = mail.search(None, "ALL")

        if status != "OK" or not data[0]:
            mail.logout()
            return []

        msg_ids = data[0].split()
        latest_ids = msg_ids[-max_results:]
        latest_ids.reverse()

        messages = []
        for mid in latest_ids:
            try:
                res, msg_data = mail.fetch(mid, "(BODY.PEEK[HEADER.FIELDS (SUBJECT FROM DATE)])")
                if res != "OK":
                    continue
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)

                subject = clean_decode_header(msg.get("Subject", "No Subject"))
                sender = clean_decode_header(msg.get("From", "Unknown Sender"))
                date_str = msg.get("Date", "")
                
                messages.append({
                    "id": f"gmail_{mid.decode('ascii', errors='ignore')}",
                    "source": "gmail",
                    "sender": sender,
                    "subject": subject,
                    "preview": f"Subject: {subject}",
                    "time": date_str[:22] if date_str else "Recent",
                    "link": "https://mail.google.com/mail/u/0/#inbox"
                })
            except Exception as e:
                print("Error parsing email message:", e)
                continue

        mail.logout()
        return messages
    except Exception as e:
        print("IMAP Fetch Error:", e)
        raise e

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/gmail/status":
            pwd = get_app_password()
            resp = {
                "email": GMAIL_USER,
                "connected": bool(pwd),
                "hasPassword": bool(pwd)
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        if parsed.path == "/api/spotify/config":
            client_id = "5a925f0b5243435388a491d4b127c13b"
            if os.path.exists(ENV_FILE):
                try:
                    with open(ENV_FILE, "r", encoding="utf-8") as f:
                        for line in f:
                            if line.startswith("SPOTIFY_CLIENT_ID="):
                                client_id = line.split("=", 1)[1].strip()
                except Exception:
                    pass
            resp = {
                "clientId": client_id,
                "configured": bool(client_id)
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        if parsed.path == "/api/gmail/important":
            pwd = get_app_password()
            if not pwd:
                resp = {
                    "status": "needs_auth",
                    "email": GMAIL_USER,
                    "message": "Google App Password required to sync live IMAP emails directly.",
                    "helpUrl": "https://myaccount.google.com/apppasswords",
                    "messages": []
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

            try:
                emails = fetch_gmail_important(pwd)
                resp = {
                    "status": "connected",
                    "email": GMAIL_USER,
                    "count": len(emails),
                    "messages": emails
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return
            except Exception as e:
                resp = {
                    "status": "error",
                    "email": GMAIL_USER,
                    "error": str(e),
                    "message": "Failed to connect to imap.gmail.com with stored App Password.",
                    "messages": []
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/gmail/connect":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode("utf-8"))
                app_pwd = data.get("appPassword", "").strip().replace(" ", "")
                if not app_pwd:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Empty App Password provided."}).encode("utf-8"))
                    return

                # Test IMAP connection
                test_mail = imaplib.IMAP4_SSL("imap.gmail.com", 993, timeout=8)
                test_mail.login(GMAIL_USER, app_pwd)
                test_mail.logout()

                # Connection successful! Save password
                save_app_password(app_pwd)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": f"Successfully authenticated with Gmail ({GMAIL_USER})! Live IMAP sync enabled."
                }).encode("utf-8"))
                return
            except imaplib.IMAP4.error as e:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "Authentication failed. Ensure you are using a 16-character Google App Password from https://myaccount.google.com/apppasswords."
                }).encode("utf-8"))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
                return

        self.send_error(404, "Endpoint Not Found")

def run_http(port=8080):
    server = http.server.ThreadingHTTPServer(('0.0.0.0', port), Handler)
    print(f"JARVIS HTTP Server running at http://0.0.0.0:{port}")
    server.serve_forever()

def run_https(port=8443, certfile="cert.pem", keyfile="key.pem"):
    server = http.server.ThreadingHTTPServer(('0.0.0.0', port), Handler)
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile=certfile, keyfile=keyfile)
    server.socket = context.wrap_socket(server.socket, server_side=True)
    print(f"JARVIS HTTPS Server running at https://0.0.0.0:{port} (Secure Context for Microphone & STT)")
    server.serve_forever()

if __name__ == "__main__":
    t_http = threading.Thread(target=run_http, args=(8080,), daemon=True)
    t_http.start()
    
    t_https = threading.Thread(target=run_https, args=(8443,), daemon=True)
    t_https.start()

    print("JARVIS Dual Server Online with Live Gmail API:")
    print("  HTTP:  http://192.168.1.10:8080")
    print("  HTTPS: https://192.168.1.10:8443 (Recommended for Mobile Microphone)")
    
    t_http.join()
