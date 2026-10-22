#!/usr/bin/env python3
"""
Clan Bank Manager (CBM) - NVIDIA AI Inference Service
====================================================
Production-grade client for NVIDIA NIM REST APIs and NVCF Asynchronous
Status Polling workflows. Decoupled from internal storage, supporting
both direct synchronous completions and non-blocking asynchronous jobs.
"""

import os
import re
import time
import json
import uuid
import threading
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List, Tuple, Union


class NvidiaAIError(Exception):
    """Base exception for NVIDIA AI NIM errors."""
    def __init__(self, message: str, status_code: int = 500, error_details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status_code
        self.error_details = error_details or {}


def load_cbm_env(env_path: Optional[str] = None) -> None:
    """Zero-dependency loader for .env configuration values."""
    if env_path is None:
        env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip()
                    if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                        v = v[1:-1]
                    if k and k not in os.environ:
                        os.environ[k] = v
    except Exception:
        pass


# Automatic environment discovery
load_cbm_env()

DEFAULT_NVIDIA_MODEL = "nvidia/nemotron-3-ultra-550b-a55b"

MODEL_ALIASES: Dict[str, str] = {
    "nemotron-3-ultra-550b-a55b": "nvidia/nemotron-3-ultra-550b-a55b",
    "nemotron-3-ultra": "nvidia/nemotron-3-ultra-550b-a55b",
    "nvidia/nemotron-3-ultra": "nvidia/nemotron-3-ultra-550b-a55b",
    "nemotron": "nvidia/nemotron-3-ultra-550b-a55b",
    "nemotron-3.5-content-safety": "nvidia/nemotron-3.5-content-safety",
    "nvidia/nemotron-3.5-content-safety": "nvidia/nemotron-3.5-content-safety",
    "nemotron-safety": "nvidia/nemotron-3.5-content-safety",
    "content-safety": "nvidia/nemotron-3.5-content-safety",
    "nemotron-3-nano-omni-30b-a3b-reasoning": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    "nemotron-reasoning": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
    "kimi-k3": "moonshotai/kimi-k3",
    "kimi": "moonshotai/kimi-k3",
    "moonshotai/kimi-k3": "moonshotai/kimi-k3",
}


def parse_nemotron_safety_response(content_text: str) -> Tuple[bool, List[str]]:
    """
    Parses standardized Nemotron 3.5 response format:
      User Safety: safe -> (True, [])
      User Safety: unsafe -> (False, [categories])
      Safety Categories: Harassment, Violence, Self-Harm
    """
    if not content_text:
        return True, []

    text_lower = content_text.lower()
    is_unsafe = False
    if "user safety: unsafe" in text_lower:
        is_unsafe = True
    elif "user safety: safe" in text_lower:
        is_unsafe = False
    elif "unsafe" in text_lower and "safe" not in text_lower:
        is_unsafe = True

    categories: List[str] = []
    cat_match = re.search(r'(?:safety\s+categories|categories)\s*:\s*([^\r\n]+)', content_text, re.IGNORECASE)
    if cat_match:
        raw_cats = cat_match.group(1).strip()
        for cat in raw_cats.split(","):
            c = cat.strip()
            if c and c.lower() != "none":
                categories.append(c)

    if is_unsafe and not categories:
        categories = ["Content Safety Violation"]

    return (not is_unsafe), categories


class NvidiaKimiService:
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
        default_timeout: float = 45.0
    ):
        if api_key is not None:
            self.api_key = api_key.strip()
        else:
            self.api_key = os.environ.get("NVIDIA_API_KEY", "").strip()

        if model is not None:
            self.default_model = model.strip()
        else:
            self.default_model = os.environ.get("NVIDIA_MODEL", DEFAULT_NVIDIA_MODEL).strip()

        raw_base = base_url or os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1").strip()
        self.base_url = raw_base.rstrip("/")
        self.default_timeout = float(os.environ.get("NVIDIA_TIMEOUT", default_timeout))
        
        # In-memory registry for background async jobs
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._jobs_lock = threading.Lock()

    def resolve_model(self, model: Optional[str] = None) -> str:
        """Resolves model aliases to their authoritative NVIDIA NIM identifiers."""
        target = model.strip() if model and model.strip() else self.default_model
        return MODEL_ALIASES.get(target.lower(), target)

    def is_configured(self) -> bool:
        """Checks if the service has a valid API key configured."""
        return bool(self.api_key and len(self.api_key) > 8)

    def _get_headers(self, accept_stream: bool = False) -> Dict[str, str]:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream" if accept_stream else "application/json",
            "User-Agent": "CBM-Nvidia-NIM/2.0"
        }
        return headers

    def _clean_stale_jobs(self, ttl_seconds: float = 3600.0) -> None:
        """Removes jobs older than TTL to ensure low memory footprint."""
        now = time.time()
        with self._jobs_lock:
            stale_keys = [k for k, v in self._jobs.items() if now - v.get("created_at", now) > ttl_seconds]
            for k in stale_keys:
                self._jobs.pop(k, None)

    def format_messages(self, prompt_or_messages: Union[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        """Normalizes input string or message objects to standard ChatML structure."""
        if isinstance(prompt_or_messages, str):
            return [{"role": "user", "content": prompt_or_messages.strip()}]
        if isinstance(prompt_or_messages, list):
            formatted = []
            for m in prompt_or_messages:
                if isinstance(m, dict) and "role" in m and "content" in m:
                    formatted.append({
                        "role": str(m["role"]).strip().lower(),
                        "content": m["content"]
                    })
            if formatted:
                return formatted
        raise ValueError("Invalid messages format. Must be a non-empty string or list of {'role': ..., 'content': ...}")

    def chat_completion(
        self,
        messages: Union[str, List[Dict[str, Any]]],
        model: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        wait_for_completion: bool = True,
        max_poll_seconds: float = 45.0,
        poll_interval: float = 2.0,
        extra_payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes a chat completion against NVIDIA NIM.
        Handles both immediate HTTP 200 responses and HTTP 202 NVCF asynchronous polling.
        """
        if not self.is_configured():
            raise NvidiaAIError(
                "NVIDIA API Key is not configured. Set NVIDIA_API_KEY in environment.",
                status_code=503
            )

        norm_messages = self.format_messages(messages)
        target_model = self.resolve_model(model)

        payload: Dict[str, Any] = {
            "model": target_model,
            "messages": norm_messages,
            "max_tokens": max(1, min(max_tokens, 16384)),
            "temperature": max(0.0, min(temperature, 2.0))
        }
        if extra_payload and isinstance(extra_payload, dict):
            for k, v in extra_payload.items():
                if k not in payload and k not in (
                    "account_name", "pin", "api_key", "key", "async", "async_job", "wait_timeout", "timeout", "stream"
                ):
                    payload[k] = v

        endpoint = f"{self.base_url}/chat/completions"
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(endpoint, data=req_data, headers=self._get_headers())

        start_time = time.time()
        try:
            with urllib.request.urlopen(req, timeout=self.default_timeout) as resp:
                status_code = resp.status
                headers = dict(resp.headers)
                body_raw = resp.read()

                # Case 1: Immediate Fulfilled Response
                if status_code == 200:
                    try:
                        data = json.loads(body_raw.decode("utf-8"))
                        res_obj = {
                            "status": "completed",
                            "model": target_model,
                            "execution_time_seconds": round(time.time() - start_time, 3),
                            "data": data
                        }
                        if isinstance(data, dict):
                            for k, v in data.items():
                                if k not in res_obj:
                                    res_obj[k] = v
                        return res_obj
                    except Exception as parse_err:
                        raise NvidiaAIError(f"Failed to decode NVIDIA response JSON: {parse_err}", 502)

                # Case 2: Asynchronous NVCF 202 Accepted
                elif status_code == 202:
                    request_id = headers.get("NVCF-REQID") or headers.get("nvcf-reqid")
                    if not request_id:
                        try:
                            body_json = json.loads(body_raw.decode("utf-8"))
                            request_id = body_json.get("requestId") or body_json.get("id")
                        except Exception:
                            pass

                    if not request_id:
                        raise NvidiaAIError("Received 202 Accepted but missing NVCF-REQID header.", 502)

                    if not wait_for_completion:
                        return {
                            "status": "pending",
                            "request_id": request_id,
                            "model": target_model,
                            "message": "Inference request accepted and currently queued."
                        }

                    # Poll for completion
                    return self.poll_status_until_complete(
                        request_id=request_id,
                        max_wait_seconds=max_poll_seconds,
                        poll_interval=poll_interval,
                        start_time=start_time,
                        target_model=target_model
                    )

                else:
                    raise NvidiaAIError(f"Unexpected HTTP status {status_code} from NVIDIA NIM.", status_code)

        except urllib.error.HTTPError as http_err:
            headers = dict(http_err.headers)
            body_text = http_err.read().decode("utf-8", errors="replace")

            # Check if 202 Accepted returned via HTTPError exception in some Python versions
            if http_err.code == 202:
                request_id = headers.get("NVCF-REQID") or headers.get("nvcf-reqid")
                if not request_id:
                    try:
                        b = json.loads(body_text)
                        request_id = b.get("requestId") or b.get("id")
                    except Exception:
                        pass

                if request_id:
                    if not wait_for_completion:
                        return {
                            "status": "pending",
                            "request_id": request_id,
                            "model": target_model,
                            "message": "Inference request accepted and currently queued."
                        }
                    return self.poll_status_until_complete(
                        request_id=request_id,
                        max_wait_seconds=max_poll_seconds,
                        poll_interval=poll_interval,
                        start_time=start_time,
                        target_model=target_model
                    )

            # Parse error details
            err_dict = None
            try:
                err_dict = json.loads(body_text)
            except Exception:
                err_dict = {"raw_error": body_text}

            error_msg = f"NVIDIA API Error {http_err.code}"
            if isinstance(err_dict, dict) and "detail" in err_dict:
                error_msg = f"{error_msg}: {err_dict['detail']}"
            elif isinstance(err_dict, dict) and "message" in err_dict:
                error_msg = f"{error_msg}: {err_dict['message']}"

            raise NvidiaAIError(error_msg, status_code=http_err.code, error_details=err_dict)

        except (TimeoutError, urllib.error.URLError) as net_err:
            elapsed = round(time.time() - start_time, 2)
            raise NvidiaAIError(
                f"Upstream inference gateway timeout or connection failure after {elapsed}s: {net_err}",
                status_code=504
            )

    def stream_chat_completion(
        self,
        messages: Union[str, List[Dict[str, Any]]],
        model: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        extra_payload: Optional[Dict[str, Any]] = None
    ):
        """
        Executes a streaming chat completion against NVIDIA NIM.
        Yields Server-Sent Event lines ('data: {...}').
        """
        if not self.is_configured():
            raise NvidiaAIError(
                "NVIDIA API Key is not configured. Set NVIDIA_API_KEY in environment.",
                status_code=503
            )

        norm_messages = self.format_messages(messages)
        target_model = self.resolve_model(model)

        payload: Dict[str, Any] = {
            "model": target_model,
            "messages": norm_messages,
            "max_tokens": max(1, min(max_tokens, 16384)),
            "temperature": max(0.0, min(temperature, 2.0)),
            "stream": True
        }
        if extra_payload and isinstance(extra_payload, dict):
            for k, v in extra_payload.items():
                if k not in payload and k not in (
                    "account_name", "pin", "api_key", "key", "async", "async_job", "wait_timeout", "timeout", "stream"
                ):
                    payload[k] = v

        endpoint = f"{self.base_url}/chat/completions"
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(endpoint, data=req_data, headers=self._get_headers(accept_stream=True))

        start_time = time.time()
        try:
            resp = urllib.request.urlopen(req, timeout=self.default_timeout)
            try:
                for raw_line in resp:
                    line = raw_line.decode("utf-8", errors="replace").strip()
                    if line:
                        yield line
            finally:
                resp.close()
        except urllib.error.HTTPError as http_err:
            body_text = http_err.read().decode("utf-8", errors="replace")
            err_dict = None
            try:
                err_dict = json.loads(body_text)
            except Exception:
                err_dict = {"raw_error": body_text}
            raise NvidiaAIError(f"NVIDIA API Error {http_err.code}", status_code=http_err.code, error_details=err_dict)
        except (TimeoutError, urllib.error.URLError) as net_err:
            elapsed = round(time.time() - start_time, 2)
            raise NvidiaAIError(
                f"Upstream inference gateway timeout or connection failure after {elapsed}s: {net_err}",
                status_code=504
            )

    def check_status(self, request_id: str) -> Dict[str, Any]:
        """
        Polls the NVIDIA NIM status polling endpoint for a pending request ID.
        Returns the execution state (completed, pending, or error).
        """
        if not self.is_configured():
            raise NvidiaAIError("NVIDIA API Key is not configured.", 503)

        clean_id = request_id.strip()
        status_url = f"{self.base_url}/status/{clean_id}"
        req = urllib.request.Request(status_url, headers=self._get_headers())

        try:
            with urllib.request.urlopen(req, timeout=30.0) as resp:
                status_code = resp.status
                if status_code == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    return {
                        "status": "completed",
                        "request_id": clean_id,
                        "data": data
                    }
                elif status_code == 202:
                    return {
                        "status": "pending",
                        "request_id": clean_id,
                        "message": "Inference in progress."
                    }
                else:
                    return {
                        "status": "pending",
                        "request_id": clean_id,
                        "code": status_code
                    }
        except urllib.error.HTTPError as e:
            if e.code == 202:
                return {
                    "status": "pending",
                    "request_id": clean_id,
                    "message": "Inference in progress."
                }
            err_body = e.read().decode("utf-8", errors="replace")
            try:
                err_json = json.loads(err_body)
            except Exception:
                err_json = {"raw": err_body}
            return {
                "status": "error",
                "request_id": clean_id,
                "code": e.code,
                "error": err_json
            }
        except Exception as e:
            return {
                "status": "error",
                "request_id": clean_id,
                "code": 500,
                "error": str(e)
            }

    def poll_status_until_complete(
        self,
        request_id: str,
        max_wait_seconds: float = 90.0,
        poll_interval: float = 2.0,
        start_time: Optional[float] = None,
        target_model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Polls /v1/status/{request_id} until completion, error, or max_wait_seconds expiration.
        """
        t0 = start_time if start_time is not None else time.time()
        while (time.time() - t0) < max_wait_seconds:
            time.sleep(poll_interval)
            status_res = self.check_status(request_id)
            if status_res.get("status") == "completed":
                status_res["model"] = target_model or self.default_model
                status_res["execution_time_seconds"] = round(time.time() - t0, 3)
                return status_res
            elif status_res.get("status") == "error":
                raise NvidiaAIError(
                    f"Inference job failed: {status_res.get('error')}",
                    status_code=status_res.get("code", 500),
                    error_details=status_res.get("error") if isinstance(status_res.get("error"), dict) else None
                )

        # Still pending after timeout
        return {
            "status": "pending",
            "request_id": request_id,
            "model": target_model or self.default_model,
            "elapsed_seconds": round(time.time() - t0, 2),
            "message": f"Inference still pending after {int(time.time() - t0)}s. Client may continue polling via /api/v1/ai/status/{request_id}."
        }

    def create_background_job(
        self,
        messages: Union[str, List[Dict[str, Any]]],
        model: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        extra_payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Dispatches an inference task to a background worker thread.
        Returns a client job_id immediately so callers don't block.
        """
        self._clean_stale_jobs()
        job_id = f"ai_job_{uuid.uuid4().hex}"
        now = time.time()
        target_model = self.resolve_model(model)

        job_record = {
            "job_id": job_id,
            "status": "queued",
            "created_at": now,
            "model": target_model,
            "request_id": None,
            "result": None,
            "error": None
        }

        with self._jobs_lock:
            self._jobs[job_id] = job_record

        def _worker():
            try:
                with self._jobs_lock:
                    self._jobs[job_id]["status"] = "processing"
                res = self.chat_completion(
                    messages=messages,
                    model=target_model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    wait_for_completion=True,
                    max_poll_seconds=180.0,
                    extra_payload=extra_payload
                )
                with self._jobs_lock:
                    self._jobs[job_id]["status"] = res.get("status", "completed")
                    self._jobs[job_id]["result"] = res
                    self._jobs[job_id]["request_id"] = res.get("request_id")
                    self._jobs[job_id]["completed_at"] = time.time()
            except Exception as e:
                with self._jobs_lock:
                    self._jobs[job_id]["status"] = "failed"
                    self._jobs[job_id]["error"] = str(e)
                    self._jobs[job_id]["completed_at"] = time.time()

        th = threading.Thread(target=_worker, name=f"cbm-ai-{job_id[:8]}", daemon=True)
        th.start()

        return {
            "status": "queued",
            "job_id": job_id,
            "model": job_record["model"],
            "created_at": now
        }

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves current state of a background job."""
        with self._jobs_lock:
            job = self._jobs.get(job_id)
            return dict(job) if job else None

    def check_content_safety(
        self,
        text: str,
        image_b64: Optional[Union[str, bytes]] = None,
        timeout: float = 1.5
    ) -> Dict[str, Any]:
        """
        Evaluates text and optional images against nvidia/nemotron-3.5-content-safety.
        Returns structured moderation verdict:
          {
            "is_safe": bool,
            "categories": List[str],
            "raw_response": str,
            "message": str,
            "execution_time_seconds": float,
            "model": "nvidia/nemotron-3.5-content-safety",
            "fallback": bool
          }
        Applies a bounded timeout with graceful failover to local L1 heuristics.
        """
        start_time = time.time()
        if not self.is_configured():
            return {
                "is_safe": True,
                "categories": [],
                "raw_response": "",
                "message": "",
                "error": "NVIDIA API key not configured; failing over to local heuristic filter.",
                "fallback": True,
                "model": "nvidia/nemotron-3.5-content-safety"
            }

        # Build multimodal payload if image is supplied
        if image_b64:
            if isinstance(image_b64, bytes):
                import base64
                img_str = base64.b64encode(image_b64).decode("ascii")
                img_url = f"data:image/png;base64,{img_str}"
            else:
                img_str = str(image_b64).strip()
                img_url = img_str if img_str.startswith("data:") else f"data:image/png;base64,{img_str}"
            user_content: Any = [
                {"type": "text", "text": text.strip() if text else "Please analyze this image content for safety."},
                {"type": "image_url", "image_url": {"url": img_url}}
            ]
        else:
            user_content = text.strip() if text else ""

        payload = {
            "model": "nvidia/nemotron-3.5-content-safety",
            "messages": [{"role": "user", "content": user_content}],
            "max_tokens": 100,
            "temperature": 0.01,
            "top_p": 0.95,
            "chat_template_kwargs": {
                "request_categories": "/categories"
            }
        }

        endpoint = f"{self.base_url}/chat/completions"
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(endpoint, data=req_data, headers=self._get_headers())

        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body_raw = resp.read()
                data = json.loads(body_raw.decode("utf-8"))
                choices = data.get("choices", [])
                content_text = ""
                if choices and isinstance(choices[0], dict):
                    content_text = choices[0].get("message", {}).get("content", "")

                is_safe, categories = parse_nemotron_safety_response(content_text)
                elapsed = round(time.time() - start_time, 3)

                msg = ""
                if not is_safe:
                    cat_str = ", ".join(categories) if categories else "Policy Violation"
                    msg = f"Message blocked by automated AI safety policy: {cat_str}"

                return {
                    "is_safe": is_safe,
                    "categories": categories,
                    "raw_response": content_text,
                    "message": msg,
                    "execution_time_seconds": elapsed,
                    "model": "nvidia/nemotron-3.5-content-safety",
                    "fallback": False
                }
        except Exception as e:
            elapsed = round(time.time() - start_time, 3)
            # Circuit breaker failover to local L1 heuristics
            return {
                "is_safe": True,
                "categories": [],
                "raw_response": "",
                "message": "",
                "error": f"NIM safety evaluation error or timeout ({elapsed}s): {e}",
                "fallback": True,
                "model": "nvidia/nemotron-3.5-content-safety"
            }


# Global singleton instance
ai_service = NvidiaKimiService()


def check_content_safety(
    text: str,
    image_b64: Optional[Union[str, bytes]] = None,
    timeout: float = 1.5
) -> Dict[str, Any]:
    """Helper function to run Nemotron-3.5-Content-Safety check via global singleton."""
    return ai_service.check_content_safety(text=text, image_b64=image_b64, timeout=timeout)


def sanitize_warning_text(text: str, infraction_text: str = "") -> str:
    """
    Guarantees that the bot NEVER quotes, repeats, or echoes the user's offending words,
    phrases, or toxic text in verbal warnings or voice scripts.
    """
    if not text:
        return ""

    cleaned = text

    # 1. Strip any direct quotes that echo the user's message
    cleaned = re.sub(
        r'(?:for\s+saying|because\s+you\s+said|saying|said|stating|message\s+containing|containing|such\s+as)\s+["\'][^"\']+["\']',
        'for policy violations',
        cleaned,
        flags=re.IGNORECASE
    )
    cleaned = re.sub(
        r'["\']([^"\']{2,})["\']',
        lambda m: "violating content" if any(w.lower() in (infraction_text or "").lower() for w in m.group(1).split() if len(w) > 3) else m.group(0),
        cleaned
    )

    # 2. Redact any exact content words (>3 chars) from the user's infraction text
    if infraction_text:
        words = set(re.findall(r'\b[a-zA-Z0-9_\-]{4,}\b', infraction_text.lower()))
        whitelist = {
            "this", "that", "with", "from", "your", "have", "been", "were", "what", "when",
            "where", "will", "would", "could", "should", "there", "their", "about", "which",
            "server", "rules", "message", "policy", "warning", "action", "timeout", "channel",
            "please", "adhere", "community", "guidelines", "further", "notice", "discord",
            "respect", "members", "behavior", "conduct", "violating", "violation", "language"
        }
        leak_tokens = words - whitelist
        for token in leak_tokens:
            pattern = re.compile(rf'\b{re.escape(token)}\b', re.IGNORECASE)
            cleaned = pattern.sub("violating language", cleaned)

    # 3. Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def generate_automod_warning_and_notice(
    infraction_text: str,
    categories: List[str],
    server_rules: str = "",
    current_stage: str = "VERBAL_WARNING",
    offense_index: int = 1,
    timeout: float = 4.0,
    action_type: Optional[str] = None,
    offense_count: Optional[int] = None,
    user_tag: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Invokes Nemotron-3-Nano-Omni-30B-A3B-Reasoning in parallel to synthesize
    a context-aware verbal warning and formal punishment notice citing custom server rules.
    Falls back to deterministic local rules if NIM is unavailable.
    """
    if action_type is not None:
        current_stage = action_type
    if offense_count is not None:
        offense_index = offense_count

    cat_str = ", ".join(categories) if categories else "Community Guidelines"

    stage_desc_map = {
        "VERBAL_WARNING": f"Verbal Warning #{offense_index}/9 (No timeout)",
        "TIMEOUT_1H": f"1-Hour Timeout (Offense #{offense_index})",
        "TIMEOUT_24H": f"24-Hour Timeout (Offense #{offense_index})",
        "TIMEOUT_1W": f"1-Week Timeout (Offense #{offense_index})",
        "KICK": f"Server Kick (Offense #{offense_index})",
        "BAN": f"Server Ban (Offense #{offense_index})"
    }
    action_desc = stage_desc_map.get(current_stage, current_stage)

    # Deterministic fallback text
    fallback_warning = f"Your message was removed for violating {cat_str}."
    if server_rules:
        rule_snippet = server_rules.strip().split("\n")[0][:120]
        fallback_warning += f" Server Policy: {rule_snippet}"

    stage_notices = {
        "VERBAL_WARNING": f"Notice: This is Verbal Warning #{offense_index} of 9. Further infractions within the 7-day window will escalate to a 1-Hour Timeout.",
        "TIMEOUT_1H": f"Notice: You have been placed on a 1-Hour Timeout (Offense #{offense_index}). Repeated violations escalate to 24-Hour Timeout.",
        "TIMEOUT_24H": f"Notice: You have been placed on a 24-Hour Timeout (Offense #{offense_index}). Continued violations escalate to a 1-Week Timeout.",
        "TIMEOUT_1W": f"Notice: You have been placed on a 1-Week Timeout (Offense #{offense_index}). Further violations escalate to Kick.",
        "KICK": f"Notice: You are being kicked from the server (Offense #{offense_index}). Rejoining and violating again will result in an indefinite Ban.",
        "BAN": f"Notice: You are permanently banned from the server (Offense #{offense_index})."
    }
    fallback_notice = stage_notices.get(current_stage, f"Notice: Enforcement action applied ({action_desc}).")

    target_name = (user_tag or "user").split("#")[0]
    voice_fallback = f"Warning for {target_name}. {fallback_warning}. {fallback_notice}".strip()

    fallback_result = {
        "verbal_warning": fallback_warning,
        "punishment_notice": fallback_notice,
        "combined_text": f"{fallback_warning} {fallback_notice}",
        "voice_script": voice_fallback,
        "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        "fallback": True
    }

    if not ai_service.is_configured():
        return fallback_result

    prompt = (
        f"You are the server moderation reasoning AI. Analyze this infraction:\n"
        f"Detected Categories: {cat_str}\n"
        f"Server Rules: {server_rules or 'Standard community conduct: No toxicity, harassment, abuse, or slurs.'}\n"
        f"Enforcement Action: {action_desc}\n\n"
        f"CRITICAL PRIVACY & SAFETY CONSTRAINT:\n"
        f"- Absolutely DO NOT quote, cite, repeat, or echo the user's offending words, phrases, profanity, or toxic text under any circumstances.\n"
        f"- Reference ONLY the policy categories violated (e.g. {cat_str}) and relevant server guidelines.\n"
        f"- Maintain a professional, firm, and authoritative tone.\n\n"
        f"Generate two concise statements in valid JSON format:\n"
        f"1. \"verbal_warning\": Direct explanation of why the message was removed citing relevant rules (DO NOT repeat the user's words).\n"
        f"2. \"punishment_notice\": Formal notice of the action executed and next escalation tier.\n"
        f"JSON output only: {{\"verbal_warning\": \"...\", \"punishment_notice\": \"...\"}}"
    )

    try:
        res = ai_service.chat_completion(
            messages=prompt,
            model="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
            max_tokens=256,
            temperature=0.3
        )
        content = ""
        data = res.get("data", {})
        choices = data.get("choices", [])
        if choices and isinstance(choices[0], dict):
            content = choices[0].get("message", {}).get("content", "").strip()

        if "{" in content and "}" in content:
            json_str = content[content.find("{"):content.rfind("}") + 1]
            parsed = json.loads(json_str)
            vw = str(parsed.get("verbal_warning", "")).strip() or fallback_warning
            pn = str(parsed.get("punishment_notice", "")).strip() or fallback_notice

            # Sanitize both verbal warning and voice script against echoing user text
            vw = sanitize_warning_text(vw, infraction_text)
            voice_script = sanitize_warning_text(f"Warning for {target_name}. {vw}. {pn}".strip(), infraction_text)

            return {
                "verbal_warning": vw,
                "punishment_notice": pn,
                "combined_text": f"{vw} {pn}",
                "voice_script": voice_script,
                "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
                "fallback": False
            }
    except Exception:
        pass

    return fallback_result

