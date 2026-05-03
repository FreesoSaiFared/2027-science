# Provider Scout

Provider Scout models a small provider-router pattern in TypeScript-native form. Candidates: OpenRouter, NVIDIA NIM, Cloudflare Workers AI, LM Studio, llama.cpp, Ollama, and mock.

## Safety contract

- Remote smoke tests require explicit consent.
- API keys and tokens stay server-side; they are never exposed in client bundles.
- Environment inspection is presence-only: `present`/`missing`, not values.
- The mock provider is the default offline proof path.
- Hosted providers return `remote_smoke_requires_explicit_consent` until a server-side task has consent and credentials.

## Local endpoints

- LM Studio: `http://localhost:1234/v1/models`
- llama.cpp OpenAI-compatible server: `http://localhost:8080/v1/models`
- Ollama: `http://localhost:11434/api/tags`

## Public route

`/provider-scout` renders the registry and policy. It does not run hosted smoke tests or read secrets.
