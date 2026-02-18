from fastapi import APIRouter, HTTPException, Body, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from ..services.github_scanner import GitHubScanner
from ..services.llm_service import LLMService

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

class PreviewRequest(BaseModel):
    repo: str

@router.post("/preview")
async def preview_readme(request: PreviewRequest, token: str = Depends(oauth2_scheme)):
    """
    Generates a preview of the README for the given repository.
    """
    try:
        # 1. Scan
        scanner = GitHubScanner(token, request.repo)
        context = await scanner.scan()
        
        # 2. Generate
        llm = LLMService()
        readme_content = llm.generate_readme(context)
        
        return {"content": readme_content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PublishRequest(BaseModel):
    repo: str
    content: str
    message: str = "docs: update README.md via README Generator"

@router.post("/publish")
async def publish_readme(request: PublishRequest, token: str = Depends(oauth2_scheme)):
    """
    Commits the README content to the repository.
    """
    import httpx
    import base64
    
    url = f"https://api.github.com/repos/{request.repo}/contents/README.md"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    async with httpx.AsyncClient() as client:
        # 1. Check if file exists (to get SHA for update)
        resp = await client.get(url, headers=headers)
        sha = None
        if resp.status_code == 200:
            sha = resp.json().get("sha")
            
        # 2. Prepare payload
        encoded_content = base64.b64encode(request.content.encode("utf-8")).decode("utf-8")
        data = {
            "message": request.message,
            "content": encoded_content,
        }
        if sha:
            data["sha"] = sha
            
        # 3. Commit
        put_resp = await client.put(url, headers=headers, json=data)
        
        if put_resp.status_code not in [200, 201]:
            print(f"GitHub Error: {put_resp.status_code} - {put_resp.text}")
            print(f"Token Scopes: {put_resp.headers.get('X-OAuth-Scopes')}")
            print(f"Accepted Scopes: {put_resp.headers.get('X-Accepted-OAuth-Scopes')}")
            raise HTTPException(status_code=put_resp.status_code, detail=f"Failed to commit: {put_resp.text}")
            
        return {"success": True, "commit": put_resp.json().get("commit", {}).get("html_url")}

@router.get("/repos")
async def list_repos(token: str = Depends(oauth2_scheme)):
    """
    Lists the user's repositories.
    """
    import httpx
    
    async with httpx.AsyncClient() as client:
        # Fetch user's repos (page 1, 100 items, sorted by updated)
        # In production we'd handle pagination
        resp = await client.get(
            "https://api.github.com/user/repos?sort=updated&per_page=100", 
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json",
            }
        )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Failed to fetch repositories")
            
        repos = resp.json()
        return [
            {
                "id": r["id"],
                "name": r["name"],
                "full_name": r["full_name"],
                "html_url": r["html_url"],
                "private": r["private"],
                "description": r["description"]
            }
            for r in repos
        ]
