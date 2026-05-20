import os
import requests
import base64
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from fastapi.middleware.cors import CORSMiddleware
from modules.dataforseo import DataForSEOClient
import google.generativeai as genai

# Configure Gemini
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

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
        return {"site": site_url, "sitemaps": sitemaps, "status": "success"}
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

# --- AI Generator Logic ---
@app.post("/ai/generate")
async def generate_ai_content(req: AIPromptRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="AI Engine not configured (missing API Key)")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        full_prompt = f"{req.prompt_template}\n\nUser Input:\n{req.user_input}"
        response = model.generate_content(full_prompt)
        return {"content": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
