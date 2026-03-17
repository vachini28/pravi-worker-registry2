# app.py — ShramSetu Backend (Python Flask)
# Run with: python app.py
# Opens at: http://localhost:5000

from flask import Flask, request, jsonify, send_from_directory
import random
import time
import math
import os

app = Flask(__name__, static_folder='public')

# ════════════════════════════════════════
# IN-MEMORY DATABASE (replaces PostgreSQL)
# In production: use psycopg2 + PostgreSQL
# ════════════════════════════════════════

workers_db = [
    {"id":"SRT-10001","name":"Rajesh Kumar",    "sector":"Construction","district":"Vesu",     "origin":"Bihar",       "status":"Verified","risk":0.04},
    {"id":"SRT-10043","name":"Aman Singh",      "sector":"Factory",    "district":"Pandesara","origin":"UP",          "status":"Pending", "risk":0.41},
    {"id":"SRT-29814","name":"Raj Kumar",       "sector":"Factory",    "district":"Katargam", "origin":"Bihar",       "status":"Flagged", "risk":0.87},
    {"id":"SRT-11204","name":"Priya Mehta",     "sector":"Domestic",   "district":"Adajan",   "origin":"Rajasthan",   "status":"Pending", "risk":0.12},
    {"id":"SRT-14508","name":"Mohammed Hussain","sector":"Factory",    "district":"Pandesara","origin":"West Bengal", "status":"Verified","risk":0.07},
    {"id":"SRT-21003","name":"Laxmi Bai",       "sector":"Domestic",   "district":"Piplod",   "origin":"Rajasthan",   "status":"Flagged", "risk":0.64},
    {"id":"SRT-33901","name":"Deepak Yadav",    "sector":"Construction","district":"Udhna",   "origin":"Bihar",       "status":"Verified","risk":0.09},
    {"id":"SRT-44019","name":"Sunita Devi",     "sector":"Domestic",   "district":"Limbayat", "origin":"Odisha",      "status":"Flagged", "risk":0.91},
    {"id":"SRT-50201","name":"Abdul Rahman",    "sector":"Transport",  "district":"Athwa",    "origin":"West Bengal", "status":"Pending", "risk":0.22},
    {"id":"SRT-60111","name":"Geeta Sharma",    "sector":"Agriculture","district":"Choryasi", "origin":"MP",          "status":"Verified","risk":0.05},
]

# OTP storage: { phone: { otp, expires, attempts, fail_count } }
otp_store = {}

# Session storage: { token: { phone, role } }
session_store = {}

# Fraud alerts
fraud_alerts = [
    {"id":1,"type":"biometric_duplicate","severity":"critical",
     "title":"Biometric duplicate detected",
     "detail":"Workers SRT-29814 and SRT-10043 share 87% face similarity.",
     "resolved":False},
    {"id":2,"type":"geo_velocity","severity":"critical",
     "title":"Impossible travel — SRT-44019",
     "detail":"Registered Surat 10AM, GPS ping Ahmedabad 1PM. 280km in 3hrs.",
     "resolved":False},
    {"id":3,"type":"employer_fraud","severity":"medium",
     "title":"Employer license mismatch",
     "detail":"Shree Textiles license shows 2025 but database shows 2023.",
     "resolved":False},
    {"id":4,"type":"device_abuse","severity":"medium",
     "title":"Mass registration — one device",
     "detail":"47 workers registered from iPhone-A9F2C in 6 hours.",
     "resolved":False},
]


# ════════════════════════════════════════
# SERVE FRONTEND
# ════════════════════════════════════════

@app.route('/')
def index():
    """Serve the main HTML file"""
    return send_from_directory('public', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve CSS, JS and other static files"""
    return send_from_directory('.', filename)


# ════════════════════════════════════════
# AUTH ROUTES
# ════════════════════════════════════════

@app.route('/api/auth/send-otp', methods=['POST'])
def send_otp():
    data  = request.get_json()
    phone = data.get('phone', '').strip()
    lang  = data.get('language', 'English')

    if not phone:
        return jsonify({"error": "Phone number required"}), 400

    # Rate limit — max 3 OTPs per hour
    existing = otp_store.get(phone)
    if existing:
        if existing['attempts'] >= 3 and time.time() < existing['window_expires']:
            return jsonify({"error": "Too many OTP requests. Try again in 1 hour."}), 429

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Store with 5-min expiry
    otp_store[phone] = {
        'otp':            otp,
        'expires':        time.time() + 300,        # 5 minutes
        'window_expires': time.time() + 3600,       # 1 hour window
        'attempts':       (existing['attempts'] + 1) if existing else 1,
        'fail_count':     0
    }

    # Language-specific SMS (in production: send via MSG91 / Twilio)
    messages = {
        'Hindi':    f'ShramSetu: आपका OTP है {otp}। 5 मिनट में समाप्त।',
        'Gujarati': f'ShramSetu: તમારો OTP {otp} છે। 5 મિનિટ।',
        'Bengali':  f'ShramSetu: আপনার OTP {otp}। ৫ মিনিট।',
        'English':  f'ShramSetu: Your OTP is {otp}. Expires in 5 mins.',
    }
    sms_message = messages.get(lang, messages['English'])

    # Print to terminal so you can see it during demo
    print(f'\n📱 OTP for {phone} → {otp}')
    print(f'   SMS: {sms_message}\n')

    return jsonify({
        "success":  True,
        "message":  "OTP sent successfully",
        "demo_otp": otp   # Remove this line in real production!
    })


@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    data  = request.get_json()
    phone = data.get('phone', '')
    otp   = data.get('otp', '')

    stored = otp_store.get(phone)

    # No OTP found
    if not stored:
        return jsonify({"error": "No OTP sent to this number. Request a new one."}), 401

    # Brute force — max 5 wrong attempts
    if stored['fail_count'] >= 5:
        return jsonify({"error": "Account locked. Too many wrong attempts."}), 403

    # OTP expired
    if time.time() > stored['expires']:
        del otp_store[phone]
        return jsonify({"error": "OTP expired. Request a new one."}), 401

    # Wrong OTP
    if stored['otp'] != otp:
        stored['fail_count'] += 1
        return jsonify({
            "error":        "Wrong OTP.",
            "attemptsLeft": 5 - stored['fail_count']
        }), 401

    # ✅ Correct — delete OTP (one-time use)
    del otp_store[phone]

    # Create session token (in production: use PyJWT)
    token = f"tok_{random.randint(100000,999999)}_{int(time.time())}"
    session_store[token] = {
        'phone':     phone,
        'role':      'worker',
        'created':   time.time(),
        'expires':   time.time() + 1800,  # 30 minutes
        'mfa_done':  False
    }

    print(f'✅ OTP verified for {phone} | Token: {token}')

    return jsonify({
        "success":     True,
        "token":       token,
        "requiresMFA": True,
        "message":     "OTP verified. Proceed to MFA."
    })


@app.route('/api/auth/verify-mfa', methods=['POST'])
def verify_mfa():
    data   = request.get_json()
    token  = data.get('token', '')
    method = data.get('method', '')

    session = session_store.get(token)
    if not session:
        return jsonify({"error": "Invalid or expired session"}), 401

    # In production: verify face embedding / bcrypt PIN / Aadhaar UIDAI API
    # For demo: accept all methods
    session['mfa_done']   = True
    session['mfa_method'] = method

    print(f'🔐 MFA done via: {method} | Phone: {session["phone"]}')

    return jsonify({
        "success": True,
        "message": "Fully authenticated",
        "session": {
            "phone":     session['phone'],
            "role":      session['role'],
            "method":    method,
            "expiresIn": "30 minutes"
        }
    })


# ════════════════════════════════════════
# WORKER ROUTES
# ════════════════════════════════════════

@app.route('/api/workers', methods=['GET'])
def get_workers():
    results = workers_db.copy()

    # Search filter
    search = request.args.get('search', '').lower()
    if search:
        results = [w for w in results if
                   search in w['name'].lower() or
                   search in w['id'].lower()   or
                   search in w['sector'].lower()]

    # Status filter
    status = request.args.get('status', '')
    if status:
        results = [w for w in results if w['status'] == status]

    return jsonify({"success": True, "count": len(results), "workers": results})


@app.route('/api/workers/stats', methods=['GET'])
def get_stats():
    return jsonify({
        "success":            True,
        "totalWorkers":       184203,
        "verifiedEmployers":  8441,
        "fraudFlags":         37,
        "pendingKYC":         1209
    })


@app.route('/api/workers/<worker_id>', methods=['GET'])
def get_worker(worker_id):
    worker = next((w for w in workers_db if w['id'] == worker_id), None)
    if not worker:
        return jsonify({"error": "Worker not found"}), 404
    return jsonify({"success": True, "worker": worker})


@app.route('/api/workers/register', methods=['POST'])
def register_worker():
    data = request.get_json()
    name  = data.get('name', '')
    phone = data.get('phone', '')

    if not name or not phone:
        return jsonify({"error": "Name and phone are required"}), 400

    # Generate worker ID
    import datetime
    year      = datetime.datetime.now().year
    random_id = random.randint(10000, 99999)
    worker_id = f"SRT-{year}-{random_id}"

    # Simple risk score
    risk = 0.05
    if not data.get('docType'):    risk += 0.25
    if not data.get('faceCapture'): risk += 0.15

    new_worker = {
        "id":        worker_id,
        "name":      name,
        "phone":     phone,
        "sector":    data.get('sector', 'Unknown'),
        "district":  data.get('district', 'Surat'),
        "origin":    data.get('stateOfOrigin', 'Unknown'),
        "status":    "Pending",
        "risk":      round(min(risk, 1.0), 2)
    }

    workers_db.append(new_worker)
    print(f'✅ Worker registered: {worker_id} — {name}')

    return jsonify({
        "success":  True,
        "workerId": worker_id,
        "message":  "Registered! QR code sent via SMS.",
        "worker":   new_worker
    })


# ════════════════════════════════════════
# FRAUD ROUTES
# ════════════════════════════════════════

@app.route('/api/fraud/alerts', methods=['GET'])
def get_fraud_alerts():
    unresolved = [a for a in fraud_alerts if not a['resolved']]
    return jsonify({
        "success":  True,
        "count":    len(unresolved),
        "critical": sum(1 for a in unresolved if a['severity'] == 'critical'),
        "alerts":   unresolved
    })


@app.route('/api/fraud/check-velocity', methods=['POST'])
def check_velocity():
    """Haversine geo-velocity fraud check"""
    data = request.get_json()
    lat1, lon1 = data['lat1'], data['lon1']
    lat2, lon2 = data['lat2'], data['lon2']
    hours_gap  = data['hoursGap']

    # Haversine formula
    R    = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a    = (math.sin(dlat/2)**2 +
            math.cos(math.radians(lat1)) *
            math.cos(math.radians(lat2)) *
            math.sin(dlon/2)**2)
    dist_km  = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    speed    = dist_km / hours_gap
    is_fraud = speed > 150  # max 150 km/h

    print(f'🗺️  {dist_km:.0f} km in {hours_gap}h = {speed:.0f} km/h → {"🚨 FRAUD" if is_fraud else "✅ OK"}')

    return jsonify({
        "success":    True,
        "distanceKm": round(dist_km, 2),
        "speedKmh":   round(speed, 2),
        "isFraud":    is_fraud,
        "reason":     f"Speed {speed:.0f} km/h {'exceeds' if is_fraud else 'within'} 150 km/h limit"
    })


@app.route('/api/fraud/alerts/<int:alert_id>/resolve', methods=['PATCH'])
def resolve_alert(alert_id):
    alert = next((a for a in fraud_alerts if a['id'] == alert_id), None)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    alert['resolved'] = True
    print(f'✅ Alert {alert_id} resolved')
    return jsonify({"success": True, "alert": alert})

import urllib.request
import json as json_lib

@app.route('/api/ai/ask', methods=['POST'])
def ai_assistant():
    data     = request.get_json()
    question = data.get('question', '')
    context  = data.get('context', '')

    prompt = "You are a helpful assistant for the Pravi Worker Registry Portal. You help domestic and migrant workers understand their rights and registration in India. Keep answers short, clear, and simple. Worker context: " + context + " Worker question: " + question + " Answer helpfully in 2-3 sentences."

    payload = json_lib.dumps({
        "contents": [{"parts": [{"text": prompt}]}]
    }).encode('utf-8')

    api_key = 'not_uploaded_for_security_purpose'
    url     = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}'

    req = urllib.request.Request(
        url,
        data=payload,
        headers={'Content-Type': 'application/json'}
    )

    try:
        with urllib.request.urlopen(req) as response:
            result  = json_lib.loads(response.read().decode('utf-8'))
            answer  = result['candidates'][0]['content']['parts'][0]['text']
            print(f'\n🤖 AI asked: {question}')
            print(f'   Answer: {answer[:100]}...\n')
            return jsonify({"success": True, "answer": answer})
    except Exception as e:
        print(f'AI error: {e}')
        error_msg = str(e)
        if '429' in error_msg:
            answer = "I am receiving too many requests right now. Please wait 30 seconds and try again."
        elif '403' in error_msg:
            answer = "API key issue. Please check your Gemini API key in app.py."
        else:
            answer = "Sorry, AI assistant is unavailable right now. Error: " + error_msg
        return jsonify({"success": False, "answer": answer})
# ════════════════════════════════════════
# START SERVER
# ════════════════════════════════════════

if __name__ == '__main__':
    print()
    print('  ✅ ShramSetu backend running!')
    print('  🌐 Open this in Chrome:')
    print('     http://localhost:5000')
    print()
    app.run(debug=True, port=5000)