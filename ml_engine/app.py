from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import whois
from datetime import datetime
from urllib.parse import urlparse
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer



# Legit companies don't hire on these.
SUSPICIOUS_HOSTS = [
    "docs.google.com",
    "drive.google.com",
    "forms.gle",
    "bit.ly",
    "tinyurl.com",
    "t.me",             
    "wa.me",           
    "mediafire.com"
]

# --- ENGLISH CHECKER (To stop gibberish) ---
MIN_TEXT_LENGTH = 50 

# --- BRAND PROTECTION DATABASE ---
# Format: "brand name mentioned in text": "required domain"
PROTECTED_BRANDS = {
    "kaggle": "kaggle.com",
    "google": "google.com",
    "amazon": "amazon.com",
    "microsoft": "microsoft.com",
    "linkedin": "linkedin.com",
    "netflix": "netflix.com",
    "paypal": "paypal.com"
}

# --- FINANCIAL RED FLAGS ---
# If these appear, we boost the risk score significantly
MONEY_TRAPS = [
    "entry fee",
    "processing fee",
    "training fee",
    "buy equipment",
    "security deposit",
    "bank details",
    "western union",
    "telegram"
]

# --- HYPE & URGENCY KEYWORDS ---
HYPE_PHRASES = [
    "weekly income", "daily income", "easy money", 
    "unlimited income", "guaranteed income", "cash", 
    "start earning", "no interview"
]


# --- SETUP: Download NLTK Data (Runs once when server starts) ---
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    print("Downloading NLTK data...")
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')

# Initialize App & Tools
app = Flask(__name__)
CORS(app)
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))


# --- LOAD THE NEW BRAIN ---
print("Loading Advanced Model & Vectorizer...")
try:
    # We load the "Translator" (TF-IDF) and the "Brain" (Random Forest) separately
    model = joblib.load('models/jobguard_advanced_model.pkl')
    tfidf = joblib.load('models/tfidf_vectorizer.pkl')
    print("✅ System Ready: Model Loaded.")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load models. {e}")
    print("Did you run the Jupyter Notebook and save the .pkl files?")

# --- PREPROCESSING FUNCTION (Must match the Notebook exactly) ---
def clean_text_advanced(text):
    if not isinstance(text, str):
        return ""
    
    # 1. Lowercase
    text = text.lower()
    
    # 2. Remove URLs & Emails
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\S+@\S+', '', text)
    
    # 3. Remove symbols
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # 4. Lemmatize
    words = text.split()
    cleaned_words = [lemmatizer.lemmatize(word) for word in words if word not in stop_words]
    
    return " ".join(cleaned_words)

# --- DOMAIN CHECKER (Keep this as is) ---
def get_domain_age(url):
    try:
        if not url.startswith("http"):
            url = "http://" + url
        parsed_domain = urlparse(url).netloc
        if parsed_domain.startswith("www."):
            parsed_domain = parsed_domain[4:]
            
        domain_info = whois.whois(parsed_domain)
        creation_date = domain_info.creation_date
        
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        if not creation_date:
            return "Unknown"
        if creation_date.tzinfo is not None:
            creation_date = creation_date.replace(tzinfo=None)
            
        age_days = (datetime.now() - creation_date).days
        return age_days
    except:
        return "Error"
    
    
def check_brand_mismatch(text, url_domain):
    """
    Returns TRUE if text mentions a brand but URL doesn't match official domain.
    """
    text_lower = text.lower()
    
    # Extract domain from URL (e.g., 'http://kagg.com' -> 'kagg.com')
    if "http" not in url_domain:
        url_domain = "http://" + url_domain
    
    try:
        clean_domain = urlparse(url_domain).netloc.lower()
        if clean_domain.startswith("www."):
            clean_domain = clean_domain[4:]
    except:
        return False # If URL is broken, skip this check

    for brand, official_domain in PROTECTED_BRANDS.items():
        # Check if Brand is in text
        if brand in text_lower:
            # Check if URL matches the official domain
            # We use 'endswith' to allow subdomains like 'careers.google.com'
            if not clean_domain.endswith(official_domain):
                return f"Text mentions '{brand.title()}', but URL is '{clean_domain}' (Expected: {official_domain})"
    
    return None # No mismatch found


def check_money_traps(text):
    text_lower = text.lower()
    found_traps = []
    
    # 1. HARDCODED TRAPS (The Classics)
    exact_phrases = [
        "entry fee", "processing fee", "training fee", 
        "security deposit", "buy equipment", 
        "bank details", "western union", "telegram",
        "registration fee", "refundable amount"
    ]
    
    for phrase in exact_phrases:
        if phrase in text_lower:
            found_traps.append(phrase)
            
    # 2. THE "MONEY DEMAND" REGEX (The Nuclear Option)
    
    # Explanation of Regex:
    # (pay|give|send|deposit|transfer|fee|cost)  -> Any of these "danger verbs"
    # .{1,20}?                                   -> Any text in between (up to 20 chars)
    # (\d+|rs|rupees|\$|usd)                     -> Any money indicator
    
    money_pattern = r"(pay|give|send|deposit|transfer|fee|cost|charge).{1,20}?(\d+|rs|rupees|\$|usd)"
    
    if re.search(money_pattern, text_lower):
        found_traps.append("suspicious money request")
            
    return list(set(found_traps))


def check_suspicious_hosts(url):
    if not url: return None
    
    url_lower = url.lower()
    for host in SUSPICIOUS_HOSTS:
        if host in url_lower:
            return f"Suspicious Link Detected ({host})"
    return None

def check_hype_words(text):
    text_lower = text.lower()
    found_hype = []
    for phrase in HYPE_PHRASES:
        if phrase in text_lower:
            found_hype.append(phrase)
    return found_hype


# --- API ENDPOINT ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    job_text = data.get('text', '')
    job_url = data.get('url', '')

    # --- 1. GIBBERISH CHECK (New!) ---
    if len(job_text) < MIN_TEXT_LENGTH:
        return jsonify({
            "prediction": "Unknown",
            "risk_score": 0,
            "domain_status": "Error: Text too short to analyze. Please provide details.",
            "domain_age_days": "N/A"
        })

    # --- 2. CLEANING & ML PREDICTION ---
    cleaned_text = clean_text_advanced(job_text)
    vectorized_text = tfidf.transform([cleaned_text])
    probabilities = model.predict_proba(vectorized_text)[0]
    confidence_of_fake = probabilities[1]
    
    # --- 3. DOMAIN ANALYSIS ---
    domain_age = get_domain_age(job_url)
    domain_status = "Safe Domain"
    
    # --- 4. BASE RISK SCORE ---
    risk_score = int(confidence_of_fake * 100)
    prediction_label = "Real" # Default
    reasons = []

    # --- 5. THE "RULES ENGINE" (Applying all logic) ---

    # A. POISON PILL (Money Traps)
    money_traps = check_money_traps(job_text)
    if money_traps:
        risk_score += 50
        reasons.append(f"Money demands detected ({', '.join(money_traps)})")

    # B2. HYPE DETECTOR (Catching "Weekly Income" / "Easy Money")
    hype_warnings = check_hype_words(job_text)
    if hype_warnings:
        risk_score += 25  
        reasons.append(f"Suspicious Hype ({', '.join(hype_warnings)})")

    # B. HOSTILE HOSTING (Google Forms, Bit.ly) - NEW!
    host_warning = check_suspicious_hosts(job_url)
    if host_warning:
        # CHECK: Is the text written professionally?
        # If ML Model is very confident it's Real (Risk < 20%), we are lenient.
        if risk_score < 35:
            risk_score += 10  # Small penalty. 
            reasons.append(f"Note: Application uses public hosting ({host_warning.split('(')[1]})")
        else:
            risk_score += 30  # Heavy penalty.
            reasons.append(host_warning)

    # C. BRAND MISMATCH (Kaggle vs kagg.com)
    brand_warning = check_brand_mismatch(job_text, job_url)
    if brand_warning:
        risk_score = 100 # Instant Kill
        reasons.append(brand_warning)

    # D. NEW DOMAIN CHECK
    if isinstance(domain_age, int) and domain_age < 30:
        risk_score = 99
        reasons.append(f"New Domain ({domain_age} days old)")

    # --- 6. FINAL CLAMPING & TRAFFIC LIGHT ---
    if risk_score > 100: risk_score = 100

    # Traffic Light Logic
    if risk_score > 60:
        prediction_label = "Fake"
    elif risk_score > 40:
        prediction_label = "Suspicious"
    
    # If we have specific reasons (like Money/Brand), append them to status
    if reasons:
        domain_status = " | ".join(reasons)

    # --- 7. SEND RESPONSE ---
    result = {
        "prediction": prediction_label,
        "risk_score": risk_score,
        "domain_status": domain_status,
        "domain_age_days": domain_age
    }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)