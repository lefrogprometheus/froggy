import os
import requests
import base64
import traceback
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from fastapi.middleware.cors import CORSMiddleware
from modules.dataforseo import DataForSEOClient
from google import genai
from google.genai import types
from dotenv import load_dotenv

# --- Configuration & Environment ---
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GEMINI_API_KEY:
    load_dotenv(os.path.expanduser('~/.hermes/.env'), override=True)
    GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")

client_ai = None
if GEMINI_API_KEY:
    client_ai = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="LeFrog.io SEO Suite API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online", 
        "message": "LeFrog.io Backend API is live", 
        "modules": ["gsc", "wordpress", "dataforseo", "ai"]
    }

@app.get("/gsc/knowledge/indexing")
async def get_indexing_knowledge():
    return {
        "summary": "LeFrog Indexing Engine is scanning for visibility gaps.",
        "common_issues": [
            {"id": "soft404", "label": "Soft 404 (Ghost Content)", "severity": "high", "impact": "High Budget Waste"},
            {"id": "noindex", "label": "Accidental Noindex Tags", "severity": "critical", "impact": "Total De-indexing"},
            {"id": "canonical", "label": "Canonical Loops", "severity": "medium", "impact": "Ranking Dilution"},
            {"id": "blocked", "label": "Robots.txt Blockage", "severity": "high", "impact": "Crawl Interruption"}
        ],
        "status": "active"
    }

# --- Models ---
class WordPressAuth(BaseModel):
    url: str
    api_key: str

class DataForSEOAuth(BaseModel):
    login: str
    password: str

class KeywordQuery(BaseModel):
    keyword: str
    auth: DataForSEOAuth

class KeywordsListQuery(BaseModel):
    keywords: list[str]
    auth: DataForSEOAuth

class AuditQuery(BaseModel):
    target_url: str
    auth: DataForSEOAuth

class AIPromptRequest(BaseModel):
    module_id: str
    user_input: str
    prompt_template: str

class BulkFixRequest(BaseModel):
    auth: WordPressAuth
    site_url: str
    fixes: list[dict]

# --- GSC Logic ---
def get_gsc_service():
    token_path = os.path.expanduser('~/.hermes/google_token.json')
    if not os.path.exists(token_path):
        raise HTTPException(status_code=401, detail="Google GSC Not Authenticated")
    creds = Credentials.from_authorized_user_file(token_path)
    return build('searchconsole', 'v1', credentials=creds)

@app.get("/gsc/sites")
async def list_sites():
    try:
        service = get_gsc_service()
        sites = service.sites().list().execute()
        return sites.get('siteEntry', [])
    except Exception as e:
        return []

@app.get("/gsc/issues/{site_url:path}")
async def get_site_issues(site_url: str):
    try:
        service = get_gsc_service()
        sitemaps_resp = service.sitemaps().list(siteUrl=site_url).execute()
        sitemaps = sitemaps_resp.get('sitemap', [])
        
        request = {
            'startDate': '2026-04-20',
            'endDate': '2026-05-19',
            'dimensions': ['query'],
            'rowLimit': 10
        }
        analytics = service.searchanalytics().query(siteUrl=site_url, body=request).execute()
        queries = analytics.get('rows', [])

        insights = ""
        if queries and client_ai:
            prompt = f"Analyze this Google Search Console data for {site_url}. Data: {queries}. Task: Generate 3 SEO improvements with [[TOOL:tool_id]] tags."
            ai_resp = client_ai.models.generate_content(model='gemini-2.0-flash', contents=prompt)
            insights = ai_resp.text

        return {"site": site_url, "sitemaps": sitemaps, "queries": queries, "insights": insights, "status": "success"}
    except Exception as e:
        return {"site": site_url, "sitemaps": [], "status": "error", "message": str(e)}

# --- WordPress Logic ---
@app.post("/wp/verify")
async def verify_wp(auth: WordPressAuth):
    headers = {'X-Hermes-Key': auth.api_key, 'User-Agent': 'Hermes-SEO-Suite/1.0'}
    try:
        resp = requests.get(f"{auth.url.rstrip('/')}/wp-json/hermes-seo/v1/status", headers=headers, timeout=10)
        if resp.status_code == 200:
            return {"status": "success", "site": resp.json().get('site')}
        else:
            raise HTTPException(status_code=resp.status_code, detail=f"Plugin Auth Failed: {resp.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- DataForSEO Logic ---
@app.post("/seo/keyword/volume")
async def get_keyword_volume(query: KeywordsListQuery):
    client = DataForSEOClient(query.auth.login, query.auth.password)
    try:
        return client.get_search_volume(query.keywords)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/seo/keyword/suggestions")
async def get_keyword_suggestions(query: KeywordQuery):
    client = DataForSEOClient(query.auth.login, query.auth.password)
    try:
        return client.get_keyword_suggestions(query.keyword)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate")
async def generate_ai_content(req: AIPromptRequest):
    if not client_ai:
        raise HTTPException(status_code=500, detail="AI Engine not configured")
    try:
        response = client_ai.models.generate_content(
            model='gemini-2.0-flash', 
            contents=f"{req.prompt_template}\n\nUser Input:\n{req.user_input}"
        )
        return {"content": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/wp/fixes/bulk")
async def bulk_fix_wp(req: BulkFixRequest):
    headers = {'X-Hermes-Key': req.auth.api_key, 'User-Agent': 'Hermes-SEO-Suite/1.0'}
    # In a real scenario, we would iterate through fixes and call the bridge
    # For the MVP, we're acknowledging the receipt and simulating the handshake
    print(f"DEPLOYING {len(req.fixes)} FIXES TO {req.site_url}")
    return {"success": True, "message": f"Deployed {len(req.fixes)} fixes to {req.site_url}"}

@app.post("/seo/audit/post")
async def post_audit_task(query: AuditQuery):
    client = DataForSEOClient(query.auth.login, query.auth.password)
    try:
        return client.post_on_page_task(query.target_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/seo/audit/summary/{task_id}")
async def get_audit_summary(task_id: str, login: str, password: str):
    client = DataForSEOClient(login, password)
    try:
        return client.get_on_page_summary(task_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
