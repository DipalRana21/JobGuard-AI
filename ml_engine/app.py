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
from ddgs import DDGS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from collections import Counter
import hashlib
import random
from datetime import datetime

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
    
# --- UPDATED OSINT ENGINE (Captures Evidence for Report) ---
def digital_footprint_scan(company_name):
    if not company_name or len(company_name) < 2:
        return {"score": 0, "status": "Not Analyzed", "sources": []}

    print(f"🔎 Scanning DuckDuckGo for: {company_name}...")
    
    query_zauba = f"site:zaubacorp.com {company_name}" 
    query_linkedin = f"site:linkedin.com {company_name}" 

    # We will store "Evidence" here to show in the Modal
    evidence = []
    found_zauba = False
    found_linkedin = False
    
    try:
        with DDGS() as ddgs:
            # Fetch Zauba Result
            r_zauba = list(ddgs.text(query_zauba, max_results=1))
            if r_zauba:
                found_zauba = True
                evidence.append({
                    "source": "Zauba Corp",
                    "title": r_zauba[0]['title'],
                    "url": r_zauba[0]['href'],
                    "icon": "building"
                })

            # Fetch LinkedIn Result
            r_linkedin = list(ddgs.text(query_linkedin, max_results=1))
            if r_linkedin:
                found_linkedin = True
                evidence.append({
                    "source": "LinkedIn",
                    "title": r_linkedin[0]['title'],
                    "url": r_linkedin[0]['href'],
                    "icon": "briefcase"
                })

    except Exception as e:
        print(f"⚠️ Search Error: {e}")
        return {"score": 50, "status": "Search Error", "sources": []}

    # --- SCORING ---
    trust_score = 50
    if found_zauba: trust_score += 30
    else: trust_score -= 10

    if found_linkedin: trust_score += 20
    else: trust_score -= 10

    # Verdict
    if trust_score >= 80: status = "Verified Entity"
    elif trust_score >= 60: status = "Likely Legitimate"
    elif trust_score >= 40: status = "Unverified Startup"
    else: status = "High Risk / Unknown"

    return {
        "score": trust_score,
        "status": status,
        "sources": evidence # <--- Sending the full evidence list now
    }


def extract_company_name(text):
    match = re.search(r"(?:at|to|join)\s+([A-Z][a-zA-Z0-9\s]{2,20})", text)
    if match:
        return match.group(1).strip()
    return None


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


# --- COMMUNITY SENTINEL ENGINE (FINAL: Title-Locked) ---
def analyze_community_sentiment(company_name):
    """
    Searches Reddit/Quora/Glassdoor.
    NUCLEAR OPTION: Only accepts results where Company Name is in the TITLE.
    This kills 100% of "Recruiter asked me..." type irrelevant threads.
    """
    if not company_name: return None
    
    analyzer = SentimentIntensityAnalyzer()
    print(f"🗣️  Scanning Community Sentiment for: {company_name}...")
    
    # Generate variations (e.g. "UrbanPiper" and "Urban Piper")
    target_clean = company_name.lower().strip()
    target_spaced = target_clean.replace(" ", "") # Handle "Urban Piper" -> "urbanpiper" logic if needed
    
    # 1. Targeted Queries
    search_queries = [
        f"site:reddit.com {company_name} review",
        f"site:reddit.com {company_name} scam",
        f"site:reddit.com {company_name} interview",
        f"site:glassdoor.co.in {company_name} reviews",
        f"site:ambitionbox.com {company_name} reviews"
    ]
    
    mentions = []
    compound_scores = []
    seen_titles = set()
    
    try:
        with DDGS() as ddgs:
            for query in search_queries:
                results = list(ddgs.text(query, max_results=2))
                
                for r in results:
                    title = r['title'].strip()
                    url = r['href']
                    title_lower = title.lower()
                    
                    # --- FILTER 1: TITLE LOCK (The Fix) ---
                    # The Company Name MUST be in the TITLE. No exceptions.
                    # We check both "UrbanPiper" and "Urban Piper" variations if necessary
                    if target_clean not in title_lower and target_spaced not in title_lower:
                        continue 
                    
                    # --- FILTER 2: De-Duplication ---
                    if title_lower in seen_titles:
                        continue
                    seen_titles.add(title_lower)

                    # Analyze Sentiment
                    text_content = title + " " + r['body']
                    score = analyzer.polarity_scores(text_content)
                    compound_score = score['compound']
                    compound_scores.append(compound_score)
                    
                    # Clean Source Label
                    if "reddit" in url: source = "Reddit"
                    elif "quora" in url: source = "Quora"
                    elif "glassdoor" in url: source = "Glassdoor"
                    elif "ambitionbox" in url: source = "AmbitionBox"
                    else: source = "Web"
                    
                    mentions.append({
                        "source": source,
                        "text": title,
                        "url": url,
                        "sentiment": "Negative" if compound_score < -0.05 else "Positive" if compound_score > 0.05 else "Neutral"
                    })
                    
                    if len(mentions) >= 3: break
                if len(mentions) >= 3: break

    except Exception as e:
        print(f"Sentiment Error: {e}")
        return None

    # CASE A: Clean Record
    if not mentions:
        return {
            "average_score": 100, 
            "status": "Clean Public Record 🛡️", 
            "mentions": [] 
        }

    # CASE B: Discussions found
    avg_score = sum(compound_scores) / len(compound_scores)
    final_score = round(((avg_score + 1) / 2) * 100)
    
    if final_score < 40: sentiment_label = "Negative / Toxic 🚩"
    elif final_score < 70: sentiment_label = "Mixed / Neutral 😐"
    else: sentiment_label = "Positive / Reputable 🟢"

    return {
        "average_score": final_score,
        "status": sentiment_label,
        "mentions": mentions
    }

def generate_report_id(company_name):
    # Generates ID like "REP-URB-2025-A1B2"
    short_name = company_name[:3].upper()
    date_str = datetime.now().strftime("%Y%m%d")
    hash_part = hashlib.md5(company_name.encode()).hexdigest()[:4].upper()
    return f"REP-{short_name}-{date_str}-{hash_part}"


# --- NEW: THEMES EXTRACTOR ---
def extract_key_themes(mentions):
    """
    Analyzes all reviews to find common complaints/praises.
    """
    text_blob = " ".join([m['text'] for m in mentions]).lower()
    
    # meaningful keywords to track
    themes_db = {
        "salary": ["salary", "pay", "stipend", "compensation", "money"],
        "culture": ["culture", "environment", "toxic", "friendly", "politics"],
        "management": ["management", "manager", "hr", "leadership", "founder"],
        "work-life": ["work-life", "balance", "overtime", "weekend", "hours"],
        "learning": ["learning", "growth", "mentor", "training"],
        "interview": ["interview", "process", "round", "assignment"]
    }
    
    found_themes = []
    for theme, keywords in themes_db.items():
        count = sum(text_blob.count(k) for k in keywords)
        if count > 0:
            found_themes.append({"topic": theme.title(), "mentions": count})
            
    # Sort by frequency
    return sorted(found_themes, key=lambda x: x['mentions'], reverse=True)

def extract_tech_stack(text_blob):
    # Common tech keywords to look for
    tech_keywords = [
        "python", "react", "node", "aws", "java", "django", "flask", 
        "docker", "kubernetes", "sql", "mongodb", "firebase", "next.js",
        "typescript", "c++", "machine learning", "ai", "blockchain"
    ]
    found_stack = set()
    for tech in tech_keywords:
        if tech in text_blob.lower():
            found_stack.add(tech.title()) # Capitalize (e.g., "React")
    return list(found_stack)

# company sentiment analysis
def deep_dive_analysis(company_name):
    print(f"🕵️‍♂️ Deep Dive Investigation for: {company_name}...")
    
    # 1. SEARCH QUERIES
    search_queries = [
        f"site:reddit.com {company_name} review",
        f"site:glassdoor.co.in {company_name} reviews",
        f"site:linkedin.com {company_name} about",
        f"site:ambitionbox.com {company_name} reviews"
    ]
    
    mentions = []
    seen_titles = set()
    analyzer = SentimentIntensityAnalyzer()
    
    # Big text blob for extraction
    full_text_blob = "" 

    try:
        with DDGS() as ddgs:
            for query in search_queries:
                results = list(ddgs.text(query, max_results=4)) 
                
                for r in results:
                    title = r['title'].strip()
                    if company_name.lower().replace(" ", "") not in title.lower().replace(" ", ""):
                        continue
                        
                    if title.lower() in seen_titles: continue
                    seen_titles.add(title.lower())
                    
                    full_text_blob += " " + r['body'] + " " + title
                    
                    score = analyzer.polarity_scores(title + " " + r['body'])
                    mentions.append({
                        "source": "Reddit" if "reddit" in r['href'] else "Glassdoor" if "glassdoor" in r['href'] else "LinkedIn" if "linkedin" in r['href'] else "Web",
                        "text": title,
                        "snippet": r['body'][:150] + "...",
                        "url": r['href'],
                        "sentiment": "Negative" if score['compound'] < -0.05 else "Positive" if score['compound'] > 0.05 else "Neutral"
                    })
                    if len(mentions) >= 12: break
                if len(mentions) >= 12: break
                
    except Exception as e:
        print(f"Error: {e}")

    # 2. EXTRACT INSIGHTS
    themes = extract_key_themes(mentions) # Use existing function
    tech_stack = extract_tech_stack(full_text_blob)
    leadership = find_leadership(company_name)
    
    # 3. INTERVIEW DIFFICULTY (Simple Keyword Math)
    difficulty_keywords = ["hard", "difficult", "leetcode", "dsa", "complex", "tough"]
    easy_keywords = ["easy", "basic", "simple", "behavioral"]
    
    hard_count = sum(full_text_blob.lower().count(k) for k in difficulty_keywords)
    easy_count = sum(full_text_blob.lower().count(k) for k in easy_keywords)
    
    # Avoid division by zero
    total_diff = hard_count + easy_count
    difficulty_score = int((hard_count / total_diff * 100)) if total_diff > 0 else 50 # Default to Medium
    
    # 4. FINAL SCORE
    if not mentions: return {"status": "No Data", "score": 50}
    avg_score = sum(m['sentiment'] == 'Positive' for m in mentions) / len(mentions) * 100
    
    return {
        "report_id": generate_report_id(company_name), # <--- NEW DYNAMIC ID
        "company_name": company_name,
        "trust_score": int(avg_score),
        "total_reviews": len(mentions),
        "themes": themes,
        "tech_stack": tech_stack, # <--- NEW
        "leadership": leadership, # <--- NEW
        "interview_difficulty": difficulty_score, # <--- NEW
        "feed": mentions
    }

# --- HELPER: LEADERSHIP FINDER ---
def find_leadership(company_name):
    # Tries to find the CEO/Founder via Search
    try:
        query = f"{company_name} CEO founder linkedin"
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=1))
            if results:
                # Naive extraction: Just return the title and snippet
                return {
                    "source_title": results[0]['title'], # e.g. "Saurabh Gupta - Founder - UrbanPiper"
                    "url": results[0]['href']
                }
    except:
        return None
    return None

# --- NEW ROUTE FOR THE SEPARATE PAGE ---
@app.route('/report', methods=['POST'])
def generate_full_report():
    data = request.json
    company_name = data.get('company_name')
    
    # Run the Deep Dive
    report_data = deep_dive_analysis(company_name)
    
    return jsonify(report_data)

# --- API ENDPOINT ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    job_text = data.get('text', '')
    job_url = data.get('url', '')

    # Optional: Allow user to send company_name explicitly from Frontend
    company_name_input = data.get('company_name', '')
    
    # If not provided, try to extract from text
    extracted_name = extract_company_name(job_text)
    final_company_name = company_name_input if company_name_input else extracted_name

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

    # . DIGITAL FOOTPRINT SCAN (The New Feature)
    company_report = {"status": "Skipped", "details": [], "score": 50}
    sentiment_report = None

    if final_company_name:
        company_report = digital_footprint_scan(final_company_name)

        sentiment_report = analyze_community_sentiment(final_company_name)
        if company_report['score'] >= 80: risk_score = max(0, risk_score - 30)
        elif company_report['score'] < 40: risk_score += 20

        if sentiment_report and sentiment_report['average_score'] < 30:
            risk_score += 20

       

    # C. BRAND MISMATCH (Kaggle vs kagg.com)
    if job_url and "example.com" not in job_url:
        domain_age = get_domain_age(job_url)
        
        # Check Brand Mismatch ONLY if we have a real URL
        brand_warning = check_brand_mismatch(job_text, job_url)
        if brand_warning:
            risk_score = 100
            domain_status = brand_warning
        elif isinstance(domain_age, int) and domain_age < 30:
            risk_score += 50
            domain_status = f"New Domain ({domain_age} days)"
        else:
            domain_status = "Safe Domain"

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
        "domain_age_days": domain_age,
        "company_analysis": company_report,
        "sentiment_analysis": sentiment_report
    }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)