import requests
import json

# --- CONFIGURATION ---
URL = "http://127.0.0.1:5000/predict"

# ANSI Colors for Terminal Output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def run_test(test_name, text, url, expected_verdict):
    print(f"\n{Colors.BOLD}--- TEST: {test_name} ---{Colors.RESET}")
    payload = {"text": text, "url": url}
    
    try:
        response = requests.post(URL, json=payload)
        data = response.json()
        
        # Extract response data
        verdict = data['prediction']
        score = data['risk_score']
        status = data['domain_status']
        
        # Determine icon
        icon = "🟢"
        if verdict == "Suspicious": icon = "🟡"
        if verdict == "Fake": icon = "🔴"
        
        # Print Result
        print(f"Prediction: {icon} {verdict} (Risk: {score}%)")
        print(f"Reason:     {status}")
        
        # Check against expectation
        if verdict == expected_verdict:
            print(f"Status:     {Colors.GREEN}✔ PASSED (Matched Expectation){Colors.RESET}")
        elif expected_verdict == "Any":
             print(f"Status:     {Colors.YELLOW}ℹ INFO ONLY{Colors.RESET}")
        else:
            print(f"Status:     {Colors.RED}✘ FAILED (Expected {expected_verdict}){Colors.RESET}")
            
    except Exception as e:
        print(f"{Colors.RED}System Error: {e}{Colors.RESET}")

# ==========================================
# 1. THE "BRAND IMPERSONATION" TEST
# Logic: Text claims "Google", URL is "goog1e.com".
# Expectation: FAKE (Red) - Risk 100%
# ==========================================
text_1 = """
We are Google. We are hiring a Senior Developer. 
Great benefits and salary. Apply now.
"""
run_test("Brand Impersonation (Google vs goog1e.com)", text_1, "goog1e.com", "Fake")

# ==========================================
# 2. THE "MONEY TRAP" TEST (Regex Check)
# Logic: "give... 1000 rupees".
# Expectation: FAKE (Red) or SUSPICIOUS (Yellow) depending on ML score + 50 penalty.
# ==========================================
text_2 = """
Data Entry Job. Simple work.
To get your login credentials, you must give us 1000 rupees as a security deposit.
Refuntable after first month.
"""
run_test("Money Demand (Regex: 'give 1000 rupees')", text_2, "unknown-site.com", "Fake")

# ==========================================
# 3. THE "FAIRNESS" TEST (Good Startup using Google Forms)
# Logic: Google Forms (+30 risk) BUT High Quality Text (-15 Fairness Bonus).
# Expectation: REAL (Green) or low SUSPICIOUS. 
# ==========================================
text_3 = """
Software Engineering Intern (Summer 2025).
Requirements: Proficient in Python, C++, and React. 
Must have completed Data Structures & Algorithms course.
Responsibilities: Assist in backend API development and unit testing.
Stipend provided.
"""
run_test("Fairness Logic (Good Startup on Google Forms)", text_3, "docs.google.com/forms/xyz", "Real")

# ==========================================
# 4. THE "LAZY SCAMMER" TEST (Bad Scam using Google Forms)
# Logic: Google Forms (+30 risk) + Bad Text (High ML Risk).
# Expectation: FAKE (Red)
# ==========================================
text_4 = """
Easy money work from home. 
Fill this form to start. Earn $500 daily. 
No skills needed. Apply fast.
"""
run_test("Lazy Scammer (Bad Text on Google Forms)", text_4, "docs.google.com/forms/abc", "Fake")

# ==========================================
# 5. THE "GIBBERISH" TEST (Min Length)
# Logic: Text < 50 chars.
# Expectation: Unknown/Error
# ==========================================
text_5 = """
Hiring now apply.
"""
run_test("Gibberish Input (Too short)", text_5, "google.com", "Unknown")

# ==========================================
# 6. THE "SALARY" SAFETY CHECK (False Positive Test)
# Logic: Real jobs say "Salary $100,000". This MUST NOT trigger the 'Money Trap'.
# Expectation: REAL (Green). 
# If this fails, our Regex is too aggressive.
# ==========================================
text_6 = """
Senior Accountant. CPA required.
Salary range: $80,000 - $100,000 per year.
Standard corporate benefits apply.
"""
run_test("Salary Mention (Should NOT be a trap)", text_6, "deloitte.com", "Real")

# ==========================================
# 7. THE "PERFECT" JOB
# Logic: Perfect text + Perfect Domain.
# Expectation: REAL (Green) - Risk < 10%
# ==========================================
text_7 = """
Microsoft is looking for a Cloud Architect. 
Experience with Azure and AWS required. 
Submit your CV via our official portal.
"""
run_test("The Perfect Job", text_7, "careers.microsoft.com", "Real")

# ==========================================
# 8. THE "YELLOW TRAP" TEST (Safe Text + One Red Flag)
# Logic: Professional Text (Risk ~10%) + "Registration Fee" (+50 Risk) = ~60% Total.
# Expectation: SUSPICIOUS (Yellow). 
# Why? It's not 100% scammy looking, but asking for a fee makes it highly suspicious.
# ==========================================
text_8 = """
Senior Business Analyst needed for a top tier firm.
Requirements: MBA in Finance, 5+ years of experience in SQL and Tableau.
Role involves data modeling and stakeholder management.
Note: A refundable registration fee applies for the initial screening.
"""
run_test("The Yellow Trap (Pro Text + Fee)", text_8, "naukri.com", "Suspicious")

# ==========================================
# 9. THE "AMBIGUOUS" TEST (Naturally Vague)
# Logic: Uses words like "Urgent", "Part-time", "Students" which models often score around 45-55%.
# Expectation: SUSPICIOUS (Yellow).
# ==========================================
text_9 = """
Urgent hiring for part-time office assistant.
Work from home available. Flexible shifts. 
Good weekly income. Best for students and freshers.
Contact immediately to fix your slot.
"""
run_test("Naturally Ambiguous (Vague Job)", text_9, "unknown-job-board.xyz", "Suspicious")



# Role: Software Development Engineer - Intern (Backend)
# Location: Bangalore (On-site)
# Stipend: ₹35,000 per month

# Responsibilities:
# - Work on Python and Django to build scalable APIs.
# - Collaborate with the frontend team to integrate user-facing elements.
# - Optimize applications for maximum speed and scalability.
# - Participate in code reviews and team discussions.

# Requirements:
# - Strong knowledge of Data Structures and Algorithms.
# - Experience with Python or Java is a plus.
# - Final year students or fresh graduates (2025/2026 batch).
# - Ability to work in a fast-paced environment.

# Selection Process:
# 1. Online Coding Round.
# 2. Technical Interview.
# 3. HR Discussion.

# How to Apply:
# apply via our LinkedIn page.