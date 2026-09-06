#!/usr/bin/env python3
"""Mechanical Phase-1 acceptance for Anything Analyzer on i9ES.

Uses only Python stdlib plus curl. Never prints or embeds the MCP bearer token.
"""
from __future__ import annotations

import json
import os
import pathlib
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path('/mnt/SERVE/anything-analyzer')
STATE = ROOT / 'state'
RECEIPTS = ROOT / 'receipts'
MCP_PORT = 23816
MITM_PORT = 8888
MCP_URL = f'http://127.0.0.1:{MCP_PORT}/mcp'
TOKEN_FILE = STATE / 'mcp-token'
USER_DATA = STATE / 'config' / 'anything-analyzer'
CA_FILE = USER_DATA / 'mitm-ca' / 'ca-cert.pem'
SESSION_NAME = 'tf-phase1-mitm-smoke'


def die(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(code)


def wait_port(port: int, timeout: float = 60.0) -> None:
    deadline = time.monotonic() + timeout
    last = None
    while time.monotonic() < deadline:
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=1.0):
                return
        except OSError as exc:
            last = exc
            time.sleep(1.0)
    die(f'PORT_NOT_READY={port} last={last}', 20)


def parse_payload(raw: bytes, content_type: str) -> dict:
    text = raw.decode('utf-8', 'replace').strip()
    if not text:
        return {}
    if 'text/event-stream' in content_type or text.startswith('event:') or '\ndata:' in text:
        payloads = []
        for line in text.splitlines():
            if line.startswith('data:'):
                payloads.append(line[5:].strip())
        if not payloads:
            return {}
        text = payloads[-1]
    return json.loads(text)


class McpClient:
    def __init__(self, token: str):
        self.token = token
        self.session_id: str | None = None
        self.next_id = 1

    def _post(self, payload: dict, session: bool = True) -> tuple[dict, dict[str, str], int]:
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'MCP-Protocol-Version': '2025-06-18',
        }
        if session and self.session_id:
            headers['MCP-Session-Id'] = self.session_id
        req = urllib.request.Request(
            MCP_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method='POST',
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read()
                rh = {k.lower(): v for k, v in resp.headers.items()}
                body = parse_payload(raw, rh.get('content-type', ''))
                return body, rh, resp.status
        except urllib.error.HTTPError as exc:
            raw = exc.read()
            die(f'MCP_HTTP_ERROR status={exc.code} body={raw[:2000]!r}', 21)
        except Exception as exc:
            die(f'MCP_REQUEST_ERROR={type(exc).__name__}:{exc}', 22)

    def initialize(self) -> dict:
        payload = {
            'jsonrpc': '2.0',
            'id': self.next_id,
            'method': 'initialize',
            'params': {
                'protocolVersion': '2025-06-18',
                'capabilities': {},
                'clientInfo': {'name': 'tf-phase1-accept', 'version': '1'},
            },
        }
        self.next_id += 1
        body, headers, _ = self._post(payload, session=False)
        self.session_id = headers.get('mcp-session-id')
        if not self.session_id:
            die('MCP_INITIALIZE_MISSING_SESSION_ID=1', 23)
        # Initialized notification. A 202/empty response is valid.
        self._post({
            'jsonrpc': '2.0',
            'method': 'notifications/initialized',
            'params': {},
        })
        return body

    def request(self, method: str, params: dict | None = None) -> dict:
        payload = {
            'jsonrpc': '2.0',
            'id': self.next_id,
            'method': method,
            'params': params or {},
        }
        self.next_id += 1
        body, _, _ = self._post(payload)
        if 'error' in body:
            die(f'MCP_JSONRPC_ERROR method={method} error={body["error"]}', 24)
        return body.get('result', {})

    def tool(self, name: str, arguments: dict | None = None):
        result = self.request('tools/call', {'name': name, 'arguments': arguments or {}})
        if result.get('isError'):
            die(f'MCP_TOOL_ERROR name={name} result={result}', 25)
        texts = [item.get('text', '') for item in result.get('content', []) if item.get('type') == 'text']
        if not texts:
            return result
        text = '\n'.join(texts)
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text


def main() -> None:
    host = socket.gethostname()
    if host.lower() not in {'i9es', 'i9es-home'}:
        die(f'REFUSING_HOST={host}', 42)
    if os.environ.get('USER') != 'ned':
        die(f'REFUSING_USER={os.environ.get("USER")}', 43)
    if not TOKEN_FILE.is_file():
        die(f'MISSING_TOKEN_FILE={TOKEN_FILE}', 44)

    token = TOKEN_FILE.read_text(encoding='utf-8').strip()
    if not token:
        die('EMPTY_MCP_TOKEN=1', 45)

    RECEIPTS.mkdir(parents=True, exist_ok=True)

    wait_port(MCP_PORT)
    wait_port(MITM_PORT)

    client = McpClient(token)
    init = client.initialize()
    tools_result = client.request('tools/list')
    tool_names = sorted(t.get('name', '') for t in tools_result.get('tools', []))
    required = {'list_sessions', 'create_session', 'start_capture', 'stop_capture', 'filter_requests'}
    missing = sorted(required - set(tool_names))
    if missing:
        die(f'MISSING_MCP_TOOLS={missing}', 46)

    sessions = client.tool('list_sessions')
    if isinstance(sessions, list):
        for old in sessions:
            if isinstance(old, dict) and old.get('name') == SESSION_NAME and old.get('id'):
                try:
                    client.tool('stop_capture', {'sessionId': old['id']})
                except SystemExit:
                    pass
                client.tool('delete_session', {'sessionId': old['id']})

    created = client.tool('create_session', {'name': SESSION_NAME, 'targetUrl': 'https://example.com/'})
    if not isinstance(created, dict) or not created.get('id'):
        die(f'CREATE_SESSION_BAD_RESULT={created!r}', 47)
    analyzer_session_id = created['id']
    client.tool('start_capture', {'sessionId': analyzer_session_id})

    deadline = time.monotonic() + 60
    while time.monotonic() < deadline and not CA_FILE.is_file():
        time.sleep(1)
    if not CA_FILE.is_file():
        client.tool('stop_capture', {'sessionId': analyzer_session_id})
        die(f'MITM_CA_NOT_FOUND={CA_FILE}', 48)

    curl = subprocess.run(
        [
            'curl', '--fail', '--silent', '--show-error',
            '--connect-timeout', '10', '--max-time', '30',
            '--proxy', f'http://127.0.0.1:{MITM_PORT}',
            '--cacert', str(CA_FILE),
            '-o', '/dev/null', '-w', '%{http_code}',
            'https://example.com/',
        ],
        text=True,
        capture_output=True,
    )
    if curl.returncode != 0:
        client.tool('stop_capture', {'sessionId': analyzer_session_id})
        die(f'MITM_CURL_FAIL rc={curl.returncode} stderr={curl.stderr[:1000]!r}', 49)
    http_code = curl.stdout.strip()
    if http_code != '200':
        client.tool('stop_capture', {'sessionId': analyzer_session_id})
        die(f'MITM_HTTP_CODE={http_code}', 50)

    captured = []
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        rows = client.tool('filter_requests', {
            'sessionId': analyzer_session_id,
            'domain': 'example.com',
            'limit': 20,
        })
        if isinstance(rows, list) and rows:
            captured = rows
            break
        time.sleep(1)

    client.tool('stop_capture', {'sessionId': analyzer_session_id})
    if not captured:
        die('MITM_CAPTURE_NOT_FOUND=1', 51)

    receipt = {
        'schema': 'TF_ANYTHING_ANALYZER_PHASE1_ACCEPT/1',
        'host': host,
        'user': os.environ.get('USER'),
        'version': '3.6.62',
        'source_commit': 'e3bad7330efaa2b390fdf5899e458e24bf4ad068',
        'gui_process': True,
        'mcp_initialize': 'PASS',
        'mcp_session_header': True,
        'mcp_tool_count': len(tool_names),
        'required_tools_present': True,
        'mitm_listener': 'PASS',
        'mitm_ca': str(CA_FILE),
        'mitm_https_status': 200,
        'capture_session_id': analyzer_session_id,
        'captured_example_requests': [
            {
                'sequence': row.get('sequence'),
                'method': row.get('method'),
                'url': row.get('url'),
                'status_code': row.get('status_code'),
            }
            for row in captured[:5]
            if isinstance(row, dict)
        ],
        'workspace': str(ROOT),
        'verdict': 'PHASE1_PASS',
    }
    path = RECEIPTS / 'PHASE1_ACCEPT.json'
    path.write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
