import os
from openai import OpenAI
from typing import Optional
from ..core.config import settings

class LLMService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=settings.GROQ_API_KEY
        )
        self.model = settings.GROQ_MODEL

    def generate_readme(self, project_context: str) -> str:
        """
        Generates a README.md content based on the provided project context.
        """
        system_prompt = """You are an expert developer and technical writer. 
        Your task is to generate a comprehensive, production-quality README.md for a software project.
        
        The user will provide a file tree and the contents of key files.
        
        You must:
        1. Infer the project type (e.g., Python CLI, React App, Express API).
        2. Write a clear Title and Description.
        3. Document Prerequisites and Installation steps.
        4. Explain Usage with examples.
        5. If applicable, add sections for API Documentation, Testing, and Deployment.
        6. Use Markdown formatting best practices.
        7. Be concise but thorough.
        
        RETURN ONLY THE MARKDOWN CONTENT FOR THE README. Do not include introductory text like "Here is the README...".
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Here is the project structure and content:\n\n{project_context}"}
            ],
            temperature=0,  # Deterministic output
        )
        
        return response.choices[0].message.content.strip()
