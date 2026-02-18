import httpx
from typing import List, Dict, Optional
import base64

class GitHubScanner:
    def __init__(self, token: str, repo_full_name: str):
        self.token = token
        self.repo_full_name = repo_full_name
        self.base_url = f"https://api.github.com/repos/{repo_full_name}"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
        }
        self.ignored_dirs = {'.git', 'node_modules', 'dist', 'build', 'coverage', '__pycache__'}
        self.interesting_extensions = {'.json', '.yaml', '.yml', '.toml', '.py', '.js', '.ts', '.go', '.md', '.txt', '.java', '.c', '.cpp', '.h', '.rs'}

    async def scan(self) -> str:
        """
        Scans the repository and returns a string representation of the file tree
        and interesting file contents.
        """
        # 1. Get the recursive file tree
        tree_url = f"{self.base_url}/git/trees/main?recursive=1" # Assumes main branch for now
        # TODO: Handle 'master' or default branch dynamic detection
        
        async with httpx.AsyncClient() as client:
            try:
                # First try main
                resp = await client.get(tree_url, headers=self.headers)
                if resp.status_code == 404:
                     # Try master
                     tree_url = f"{self.base_url}/git/trees/master?recursive=1"
                     resp = await client.get(tree_url, headers=self.headers)
                
                if resp.status_code != 200:
                    return f"Error scanning repo: {resp.status_code} {resp.text}"

                tree_data = resp.json()
                
                # 2. Process tree
                tree_output = ["Directory Structure:"]
                files_to_fetch = []
                
                for item in tree_data.get("tree", []):
                    path = item["path"]
                    type_ = item["type"]
                    
                    # Simple ignore check
                    parts = path.split('/')
                    if any(p in self.ignored_dirs for p in parts):
                        continue
                        
                    tree_output.append(f"- {path}")
                    
                    if type_ == "blob" and self._is_interesting_file(path):
                         files_to_fetch.append(path)

                # 3. Fetch content (Limit to top 10 files to avoid rate limits/context window for now)
                files_to_fetch = files_to_fetch[:10]
                file_contents = ["\nFile Contents:"]
                
                for file_path in files_to_fetch:
                    content = await self._fetch_file_content(client, file_path)
                    if content:
                        file_contents.append(f"\n--- {file_path} ---\n{content}")

                return "\n".join(tree_output) + "\n".join(file_contents)

            except Exception as e:
                return f"Error scanning repo: {str(e)}"

    def _is_interesting_file(self, filename: str) -> bool:
        ext = "." + filename.split('.')[-1] if '.' in filename else ""
        return ext in self.interesting_extensions or filename.split('/')[-1] in {'Dockerfile', 'Makefile', 'Gemfile'}

    async def _fetch_file_content(self, client: httpx.AsyncClient, path: str) -> Optional[str]:
        url = f"{self.base_url}/contents/{path}"
        try:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code == 200:
                data = resp.json()
                content = base64.b64decode(data["content"]).decode('utf-8', errors='ignore')
                return content
        except Exception:
            return None
        return None
