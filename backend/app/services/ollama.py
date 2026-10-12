import os

import requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/generate"
)

MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "llama3.2:3b"
)


def generate_response(prompt: str) -> str:
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        return data["response"]

    except requests.exceptions.ConnectionError:
        raise RuntimeError("Unable to connect to Ollama")

    except requests.exceptions.Timeout:
        raise RuntimeError("Ollama request timed out")

    except requests.exceptions.RequestException as error:
        raise RuntimeError(f"Ollama request failed: {error}")