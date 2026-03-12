import os
from dotenv import load_dotenv
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
import redis
import json
import time
import requests
from google import genai

load_dotenv()

# Connect to the local Redis server
# decode_responses=True ensures we get normal strings back instead of byte-strings
cache = redis.Redis(host='localhost', port=6379, decode_responses=True)
CACHE_EXPIRATION_SECONDS = 86400  # Cache reports for 24 hours (60 * 60 * 24)

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
def check_domain(url, company_name):
    domain_to_check = None
    
    # 1. URL Parsing (Bulletproofed)
    if url:
        url = url.strip()
        # Force a scheme so urlparse doesn't get confused
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        parsed = urlparse(url)
        domain_to_check = parsed.netloc
        # Strip "www." because WHOIS hates subdomains
        if domain_to_check.startswith('www.'):
            domain_to_check = domain_to_check[4:]
            
    # 2. Guesser (Smarter Fallback)
    elif company_name:
        clean_name = company_name.lower()
        # Strip out corporate jargon to find the real domain
        for suffix in [' ltd', ' inc', ' llc', ' pvt', ' private', ' limited']:
            clean_name = clean_name.replace(suffix, '')
        domain_to_check = f"{clean_name.replace(' ', '')}.com"
        
    if not domain_to_check:
        return "No URL or Company provided for scan.", "N/A"

    # 3. WHOIS Lookup & Timezone Fix
    try:
        domain_info = whois.whois(domain_to_check)
        creation_date = domain_info.creation_date
        
        if not creation_date:
            return f"No WHOIS record found for {domain_to_check}.", "N/A"
        
        if type(creation_date) is list:
            creation_date = creation_date[0]
            
        # THE MAGIC FIX: Strip timezones before doing the math!
        if isinstance(creation_date, datetime):
            creation_date = creation_date.replace(tzinfo=None) # Forces it to be naive
            age_days = (datetime.now() - creation_date).days
            return f"Domain {domain_to_check} analyzed.", age_days
        else:
            return f"Domain {domain_to_check} analyzed (Unknown date format).", "N/A"
            
    except Exception as e:
        # This will now print the EXACT error in your terminal if it ever fails again
        print(f"🛑 WHOIS CRASH for {domain_to_check}: {e}")
        return f"Whois lookup failed for {domain_to_check}.", "N/A"
    
# --- UPDATED OSINT ENGINE (Captures Evidence for Report) ---
def digital_footprint_scan(company_name):
    if not company_name or len(company_name) < 2:
        return {"score": 50, "status": "Not Analyzed", "sources": []}

    print(f"🔎 Scanning Corporate Registries for: {company_name}...")
    evidence = []
    found_zauba = False
    found_linkedin = False
    
    # 1. INDEPENDENT ZAUBA SEARCH
    try:
        with DDGS() as ddgs:
            r_zauba = list(ddgs.text(f"site:zaubacorp.com {company_name}", max_results=1))
            if r_zauba:
                found_zauba = True
                evidence.append({
                    "source": "Zauba Corp",
                    "title": r_zauba[0]['title'],
                    "url": r_zauba[0]['href'],
                    "icon": "building"
                })
    except Exception as e:
        print(f"⚠️ Zauba Rate Limit / Error: {e}")

    # 2. INDEPENDENT LINKEDIN SEARCH
    try:
        with DDGS() as ddgs:
            r_linkedin = list(ddgs.text(f"site:linkedin.com {company_name}", max_results=1))
            if r_linkedin:
                found_linkedin = True
                evidence.append({
                    "source": "LinkedIn",
                    "title": r_linkedin[0]['title'],
                    "url": r_linkedin[0]['href'],
                    "icon": "briefcase"
                })
    except Exception as e:
        print(f"⚠️ LinkedIn Rate Limit / Error: {e}")

    # --- SCORING ---
    trust_score = 50
    if found_zauba: trust_score += 30
    else: trust_score -= 10

    if found_linkedin: trust_score += 20
    else: trust_score -= 10

    if trust_score >= 80: status = "Verified Entity"
    elif trust_score >= 60: status = "Likely Legitimate"
    elif trust_score >= 40: status = "Unverified Startup"
    else: status = "High Risk / Unknown"

    return {
        "score": trust_score,
        "status": status,
        "sources": evidence 
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
    
    # 1. UPGRADED SEARCH QUERIES (Targeted explicitly at career discussions)
    base_name = re.sub(r'\.(com|ai|cloud|io|net|co|org)$', '', company_name.lower()).strip()
    
    # 1. UPGRADED SEARCH QUERIES (Using base_name instead of full URL)
    search_queries = [
        f'"{base_name}" "working at" site:reddit.com',
        f'"{base_name}" interview site:reddit.com',
        f'"{base_name}" reviews site:glassdoor.com',
        f'"{base_name}" employee site:linkedin.com'
    ]
    
    mentions = []
    seen_titles = set()
    analyzer = SentimentIntensityAnalyzer()
    
    full_text_blob = "" 

    try:
        with DDGS() as ddgs:
            for query in search_queries:
                results = list(ddgs.text(query, max_results=5)) 
                
                for r in results:
                    title = r['title'].strip()
                    body = r.get('body', '')
                    title_snippet_lower = (title + " " + body).lower()

                    # Check 1: Must contain the BASE brand name (not the full .ai URL)
                    if base_name.replace(" ", "") not in title_snippet_lower.replace(" ", ""):
                        continue
                        
                    # 🚨 THE ULTIMATE CONTEXT FILTER 🚨
                    employment_keywords = ['interview', 'salary', 'culture', 'job', 'employee', 'offer', 'working', 'manager', 'wlb', 'pay', 'workplace', 'hire', 'layoff', 'toxic']
                    
                    is_job_related = any(kw in title_snippet_lower for kw in employment_keywords)
                    if not is_job_related:
                        continue 
                        
                    if title.lower() in seen_titles: continue
                    seen_titles.add(title.lower())
                    
                    full_text_blob += " " + body + " " + title
                    
                    score = analyzer.polarity_scores(title + " " + body)
                    mentions.append({
                        "source": "Reddit" if "reddit" in r['href'] else "Glassdoor" if "glassdoor" in r['href'] else "LinkedIn" if "linkedin" in r['href'] else "Web",
                        "text": title,
                        "snippet": body[:150] + "...",
                        "url": r['href'],
                        "sentiment": "Negative" if score['compound'] < -0.05 else "Positive" if score['compound'] > 0.05 else "Neutral"
                    })
                    if len(mentions) >= 12: break
                if len(mentions) >= 12: break
                
    except Exception as e:
        print(f"Error: {e}")

    # 2. EXTRACT INSIGHTS
    themes = extract_key_themes(mentions) 
    tech_stack = extract_tech_stack(full_text_blob)
    leadership = find_leadership(company_name)
    
    # 3. INTERVIEW DIFFICULTY 
    difficulty_keywords = ["hard", "difficult", "leetcode", "dsa", "complex", "tough"]
    easy_keywords = ["easy", "basic", "simple", "behavioral"]
    
    hard_count = sum(full_text_blob.lower().count(k) for k in difficulty_keywords)
    easy_count = sum(full_text_blob.lower().count(k) for k in easy_keywords)
    
    total_diff = hard_count + easy_count
    difficulty_score = int((hard_count / total_diff * 100)) if total_diff > 0 else 50 
    
    # 4. FINAL SCORE
    # 4. FINAL SCORE & DYNAMIC UI CALCULATIONS
    if not mentions: 
        print(f"⚠️ No employee reviews found for {company_name}. Generating Startup Profile.")
        return {
            "report_id": generate_report_id(company_name) if 'generate_report_id' in globals() else "REP-000", 
            "company_name": company_name,
            "trust_score": 50,
            "total_reviews": 0,
            "themes": [{"topic": "Insufficient Data", "mentions": 0}],
            "leadership": leadership,
            "feed": [],
            "sentiment": {"positive": 0, "neutral": 100, "negative": 0},
            "risk_breakdown": {"domain": 50, "leadership": 100 if leadership else 20, "sentiment": 50, "scam_signals": 100},
            "risk_flags": ["Early-Stage Entity: No public employee discussions found."]
        }

    # Calculate real sentiment percentages
    total_mentions = len(mentions)
    pos_count = sum(1 for m in mentions if m['sentiment'] == 'Positive')
    neu_count = sum(1 for m in mentions if m['sentiment'] == 'Neutral')
    neg_count = sum(1 for m in mentions if m['sentiment'] == 'Negative')

    sentiment_overview = {
        "positive": int((pos_count / total_mentions) * 100),
        "neutral": int((neu_count / total_mentions) * 100),
        "negative": int((neg_count / total_mentions) * 100)
    }
    
    avg_score = int(((pos_count + (neu_count * 0.5)) / total_mentions) * 100)
    
    # Calculate Scam Signals
    severe_keywords = ["scam", "fraud", "fake", "unpaid", "stolen", "lawsuit"]
    scam_hits = sum(full_text_blob.lower().count(k) for k in severe_keywords)
    scam_score = max(0, 100 - (scam_hits * 15))

    # Generate Dynamic Risk Flags
    risk_flags = []
    if not leadership:
        risk_flags.append("Leadership team is completely hidden or anonymous.")
    if sentiment_overview["negative"] >= 30:
        risk_flags.append(f"Elevated toxic community sentiment detected ({sentiment_overview['negative']}% Negative).")
    if scam_hits > 2:
        risk_flags.append(f"Warning: Detected {scam_hits} high-risk scam/fraud keywords in employee discussions.")

    # Calculate real Risk Breakdown bars
    risk_breakdown = {
        "domain": 85, # Default to 85, can be hooked to WhoIs API later
        "leadership": 100 if leadership else 20,
        "sentiment": sentiment_overview["positive"] + int(sentiment_overview["neutral"] * 0.5),
        "scam_signals": scam_score
    }

    return {
        "report_id": generate_report_id(company_name) if 'generate_report_id' in globals() else "REP-123", 
        "company_name": company_name,
        "trust_score": avg_score,
        "total_reviews": total_mentions,
        "themes": themes,
        "leadership": leadership, 
        "feed": mentions,
        
        # 👇 THESE ARE THE MISSING PIECES YOUR REACT UI IS BEGGING FOR 👇
        "sentiment": sentiment_overview,
        "risk_breakdown": risk_breakdown,
        "risk_flags": risk_flags
    }

# --- HELPER: LEADERSHIP FINDER ---
# def find_leadership(company_name):
#     # Tries to find the CEO/Founder via Search
#     try:
#         query = f"{company_name} CEO founder linkedin"
#         with DDGS() as ddgs:
#             results = list(ddgs.text(query, max_results=1))
#             if results:
#                 # Naive extraction: Just return the title and snippet
#                 return {
#                     "source_title": results[0]['title'], # e.g. "Saurabh Gupta - Founder - UrbanPiper"
#                     "url": results[0]['href']
#                 }
#     except:
#         return None
#     return None

# def find_leadership(company_name):
#     # Tries to find the CEO/Founder via Search
#     try:
#         query = f"{company_name} CEO founder linkedin"
#         with DDGS() as ddgs:
#             # Grab top 3 results instead of just 1
#             results = list(ddgs.text(query, max_results=3))
            
#             if results:
#                 for r in results:
#                     title = r['title']
#                     url = r['href']
                    
#                     # UPGRADE: Ensure it is a human LinkedIn profile (ignores news articles)
#                     if "linkedin.com/in" in url.lower():
#                         # Clean the text: "Saurabh Gupta - Founder..." -> "Saurabh Gupta"
#                         clean_name = title.split('-')[0].split('|')[0].strip()
                        
#                         # Make sure it didn't just grab the company name
#                         if company_name.lower() not in clean_name.lower() and len(clean_name) < 35:
#                             return {
#                                 "source_title": clean_name,
#                                 "url": url
#                             }
                            
#                 # FALLBACK: If the strict loop fails, use your exact original naive extraction
#                 return {
#                     "source_title": results[0]['title'],
#                     "url": results[0]['href']
#                 }
#     except Exception as e:
#         print(f"Leadership error: {e}")
#         return None
        
#     return None

def find_leadership(company_name):
    print(f"🕵️‍♂️ Searching Leadership for: {company_name}...")
    if not company_name:
        return None
        
    try:
        # 🚨 THE FIX: NO MORE DOMAIN STRIPPING!
        # Searching EXACTLY "intuitive.ai" forces the engine to ignore "Intuitive Surgical"
        query = f'"{company_name}" (CEO OR Founder) site:linkedin.com/in'
        
        with DDGS() as ddgs:
            # Grab top 5 results to ensure we have backups
            results = list(ddgs.text(query, max_results=5))
            
            if results:
                for r in results:
                    title = r.get('title', '')
                    url = r.get('href', '')
                    title_lower = title.lower()
                    
                    # 1. STRICT URL CHECK: Must be a user profile
                    if "linkedin.com/in" in url.lower():
                        
                        # 🚨 THE MINIMAL VP ASSASSIN (Fixes Twilio only)
                        if " vice president " in title_lower or " vp " in title_lower or title_lower.startswith("vp "):
                            continue
                        
                        # 2. SLICE THE GARBAGE: "Jay Modh - CEO - Intuitive Cloud | LinkedIn" -> "Jay Modh"
                        raw_name = re.split(r'[-|–|\||,]', title)[0].strip()
                        
                        # Strip out weird symbols/emojis
                        clean_name = re.sub(r'[^\w\s\.]', '', raw_name).strip()
                        
                        # 3. THE TITANIUM FILTER
                        word_count = len(clean_name.split())
                        
                        # Real names are usually 2-3 words (First Last). 
                        if 1 < word_count <= 4:
                            
                            # Dynamically ban the company name so it doesn't return "Intuitive" as a person
                            company_first_word = company_name.lower().split('.')[0]
                            forbidden = ['introducing', 'about', 'ceo', 'founder', 'news', 'profile', 'appoints', 'welcome', 'top', 'post', company_first_word]
                            
                            if not any(f in clean_name.lower() for f in forbidden):
                                if len(clean_name) < 30:
                                    print(f"   -> ✅ Verified Human Leader: {clean_name}")
                                    return {
                                        "source_title": clean_name,
                                        "url": url
                                    }
                                    
            # 🚨 KILLED THE FALLBACK 🚨
            print("   -> ⚠️ No verified human profile found. Defaulting to hidden.")
            return None
            
    except Exception as e:
        print(f"⚠️ Leadership search error: {e}")
        return None
        
    return None


# --- 🧠 AI LOAD BALANCER SETUP ---
# Grabs all 3 keys from your .env file
raw_keys = [
    os.getenv("GOOGLE_GEMINI_API_1"),
    os.getenv("GOOGLE_GEMINI_API_2"),
    os.getenv("GOOGLE_GEMINI_API_3")
]

# --- 🧠 BULLETPROOF API LOAD BALANCER ---
raw_keys = [
    os.getenv("GOOGLE_GEMINI_API_1"),
    os.getenv("GOOGLE_GEMINI_API_2"),
    os.getenv("GOOGLE_GEMINI_API_3")
]
# Only keep keys that actually exist and aren't empty strings
valid_keys = [k for k in raw_keys if k and len(k) > 10]

def generate_executive_summary(report_data, max_retries=3):
    """Feeds raw OSINT data to Gemini using a pure REST API for true load balancing."""
    
    company = report_data.get("company_name", "Unknown Entity")
    score = report_data.get("trust_score", 50)
    leader_info = report_data.get("leadership")
    leader_name = leader_info.get("source_title", "Unknown/Private") if leader_info else "Unknown/Private"
    themes = ", ".join([t.get("topic", "") for t in report_data.get("themes", [])][:3])
    
    prompt = f"""
    You are an elite Corporate OSINT & Employment Fraud Analyst.
    Analyze this automated background check data for the company '{company}':
    - Trust/Legitimacy Score: {score}/100
    - Identified Leadership: {leader_name}
    - Discussion Vectors: {themes}

    Generate a cold, highly analytical 3-sentence "Executive Threat Briefing". 
    Sentence 1: State the definitive risk assessment and corporate legitimacy of the entity based on the trust score.
    Sentence 2: Analyze the leadership transparency and employee sentiment footprint.
    Sentence 3: Provide a clear, actionable "Candidate Directive" regarding employment risk (e.g., "Entity verified; safe to proceed with interview process.").
    
    CRITICAL: Do not use IT-networking jargon. Focus strictly on corporate legitimacy and job-seeker risk. Output EXACTLY 3 sentences.
    """

    if not valid_keys:
        print("⚠️ CRITICAL: No Gemini API keys found in .env!")
    else:
        # 🛡️ THE PURE REST API LOOP
        for attempt in range(max_retries):
            # Pick a random key from the valid list
            active_key = random.choice(valid_keys)
            
            # Use the direct Google REST endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={active_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            
            try:
                response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'})
                
                if response.status_code == 200:
                    data = response.json()
                    return data['candidates'][0]['content']['parts'][0]['text'].strip()
                elif response.status_code == 429:
                    print(f"⚠️ Key Throttled (429). Swapping to backup key... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(1) # Wait 1 second before firing the next key
                else:
                    print(f"⚠️ Bad Key or API Error ({response.status_code}). Swapping keys...")
            except Exception as e:
                print(f"⚠️ Request Failed: {e}")

    # 🛡️ THE SILENT FALLBACK (Only triggers if all keys fail)
    print("🛑 All AI Keys Exhausted/Failed. Deploying Silent Fallback.")
    fallback_s1 = f"Entity '{company}' has been assigned a baseline trust score of {score}/100 based on available digital footprints."
    fallback_s2 = "Automated threat vectors and leadership cross-references are currently stable but require manual verification."
    directive = "Proceed with standard engagement protocols." if score >= 40 else "Immediate disengagement recommended due to elevated risk markers."
        
    return f"{fallback_s1} {fallback_s2} {directive}"

# --- NEW ROUTE FOR THE SEPARATE PAGE ---
# @app.route('/report', methods=['POST'])
# def generate_full_report():
#     data = request.json
#     company_name = data.get('company_name')
    
#     # Run the Deep Dive
#     report_data = deep_dive_analysis(company_name)
    
#     return jsonify(report_data)

@app.route('/report', methods=['POST'])
def generate_full_report():
    data = request.json
    company_name = data.get('company_name')

    if not company_name:
        return jsonify({"error": "Company name is required"}), 400

    # Create the cache key
    cache_key = f"report:{company_name.lower().replace(' ', '')}"

    # 1. REDIS CACHE HIT: Try to load from memory first
    try:
        cached_data = cache.get(cache_key)
        if cached_data:
            print(f"⚡ CACHE HIT: Returning instant report for {company_name}")
            return jsonify(json.loads(cached_data))
    except Exception as e:
        print(f"⚠️ Redis Read Error: {e}")

    # 2. CACHE MISS: Run your exact original deep dive
    print(f"🐢 CACHE MISS: Generating fresh report for {company_name}...")
    report_data = deep_dive_analysis(company_name)

    print("🧠 Generating AI Executive Briefing...")
    # This adds a new 'ai_summary' field to your dictionary
    report_data['ai_summary'] = generate_executive_summary(report_data)

    # 3. Save the result to Redis (expires in 24 hours)
    try:
        cache.setex(cache_key, 86400, json.dumps(report_data))
        print(f"💾 Saved {company_name} to Redis cache!")
    except Exception as e:
        print(f"⚠️ Redis Write Error: {e}")

    return jsonify(report_data)

# --- API ENDPOINT ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    job_text = data.get('text', '')
    job_url = data.get('url', '').strip()

    # 1. IDENTIFY THE COMPANY
    company_name_input = data.get('company_name', '').strip()
    extracted_name = extract_company_name(job_text)
    final_company_name = company_name_input if company_name_input else extracted_name

    # 2. GIBBERISH CHECK
    if len(job_text) < MIN_TEXT_LENGTH:
        return jsonify({
            "prediction": "Unknown",
            "risk_score": 0,
            "domain_status": "⚠️ Error: Text too short to analyze. Please provide details.",
            "domain_age_days": "N/A"
        })

    # 3. DOMAIN CHECK (Clean & Direct)
    domain_status_msg, domain_age = check_domain(job_url, final_company_name)

    # 4. ML PREDICTION (Base Score)
    cleaned_text = clean_text_advanced(job_text)
    vectorized_text = tfidf.transform([cleaned_text])
    probabilities = model.predict_proba(vectorized_text)[0]
    risk_score = int(probabilities[1] * 100)
    
    reasons = [] # This will populate your UI Safety Log

    # 5. THE RULES ENGINE (Heuristics & Penalties)
    
    # A. Money Traps (Telegram, WhatsApp, Checks)
    money_traps = check_money_traps(job_text)
    if money_traps:
        risk_score += 40
        reasons.append(f"🚩 High-Risk Demands: {', '.join(money_traps)}")

    # B. Hype Words
    hype_warnings = check_hype_words(job_text)
    if hype_warnings:
        risk_score += 20  
        reasons.append(f"🚩 Suspicious Hype: {', '.join(hype_warnings)}")

    # C. Hostile Hosting (Google Forms, Bit.ly)
    if job_url:
        host_warning = check_suspicious_hosts(job_url)
        if host_warning:
            risk_score += 25
            reasons.append(f"🚩 {host_warning}")

    # D. New Domain Penalty
    if isinstance(domain_age, int) and domain_age < 30:
        risk_score += 30
        reasons.append(f"🚩 Extremely New Domain ({domain_age} days old)")

    # 6. DIGITAL FOOTPRINT SCAN (OSINT)
    company_report = {"status": "Not Analyzed", "details": [], "score": 50}
    sentiment_report = None

    if final_company_name:
        company_report = digital_footprint_scan(final_company_name)
        sentiment_report = analyze_community_sentiment(final_company_name)
        
        # Only reward the score if the domain is also old/trusted (prevents scammers from using real company names)
        if company_report.get('score', 0) >= 80 and (isinstance(domain_age, int) and domain_age > 365):
            risk_score = max(0, risk_score - 20)
            reasons.append("🛡️ Verified established corporate entity.")
        elif company_report.get('score', 0) < 40:
            risk_score += 15
            reasons.append("🚩 Poor digital footprint detected.")

        if sentiment_report and sentiment_report.get('average_score', 100) < 40:
            risk_score += 15
            reasons.append("🚩 Toxic community sentiment found.")

    # 7. FINAL CLAMPING & TRAFFIC LIGHT
    if risk_score > 99: 
        risk_score = 99

    if risk_score > 60:
        prediction_label = "Fake"
    elif risk_score > 40:
        prediction_label = "Suspicious"
    else:
        prediction_label = "Real"
    
    # Format the final safety log for the UI
    final_domain_status = " | ".join(reasons) if reasons else "✅ Safe Domain. No immediate red flags detected."

    return jsonify({
        "prediction": prediction_label,
        "risk_score": risk_score,
        "domain_status": final_domain_status,
        "domain_age_days": domain_age,
        "company_analysis": company_report,
        "sentiment_analysis": sentiment_report
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)