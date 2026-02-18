from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import httpx
from ..core.config import settings

router = APIRouter()

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token"

@router.get("/login")
def login():
    """
    Redirects the user to GitHub's OAuth login page.
    """
    import urllib.parse
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "scope": "repo user",  # We need repo scope to read/write private repos
        "redirect_uri": "http://localhost:8000/auth/callback"
    }
    query = urllib.parse.urlencode(params)
    return RedirectResponse(f"{GITHUB_AUTHORIZE_URL}?{query}")

@router.get("/callback")
async def callback(code: str):
    """
    Handles the callback from GitHub, exchanges code for access token.
    """
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        headers = {"Accept": "application/json"}
        data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        }
        
        response = await client.post(GITHUB_ACCESS_TOKEN_URL, headers=headers, json=data)
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve access token")
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to retrieve access token from response")

        # Redirect back to the frontend with the token
        return RedirectResponse(f"http://localhost:5173/callback?token={access_token}")
