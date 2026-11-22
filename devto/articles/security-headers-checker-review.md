---
title: "Security Headers Checker: A Quick First Look at HTTP Security Headers"
legacy_title: "Security Headers Checker: una prima verifica rapida degli header HTTP"
published: false
description: "How to use an HTTP header scanner to improve a website's security posture without confusing a baseline check with a complete security assessment."
tags: cybersecurity, webdev, security, opensource
cover_image: ""
canonical_url: ""
---

# Security Headers Checker

[Security Headers Checker](https://github.com/lfazioli/security-headers-checker) is a small Python tool that checks several relevant HTTP security headers. It is useful for an initial review of websites you own or are authorized to assess and can be incorporated into manual or CI workflows.

## What it checks

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Cross-Origin-Embedder-Policy`

The scanner reports missing headers and weak configurations. It provides a baseline, not a complete application security test or professional assessment.

## Installation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On Windows:

```powershell
.venv\Scripts\Activate.ps1
```

## Usage

Check one site:

```bash
python3 security_headers_checker.py https://www.example.com
```

Get JSON output:

```bash
python3 security_headers_checker.py https://www.example.com --json
```

Replace `example.com` with a domain you own or are authorized to assess.

## Interpret the result

A missing header can indicate real risk, but every policy must fit the application:

- HSTS should be enabled only after HTTPS and subdomain support are verified.
- CSP must match scripts, workers, frames, and fonts used by the application.
- CORP and COEP can change cross-origin resource behavior.
- COOP can affect popups and OAuth flows.

Read the result together with authentication, routing, cookies, caching, and the application's Content Security Policy.

## Operational approach

1. Define a baseline for each environment.
2. Test in staging.
3. Make checks repeatable.
4. Begin with non-blocking warnings.
5. Document exceptions.
6. Add deeper application tests.

## Limitations

This tool observes HTTP responses. It does not find server-side vulnerabilities, application bugs, exposed secrets, or misconfigured authentication. It is not proof of compliance.

A correct header is a useful improvement—not a guarantee of security. Combine header checks with code review, application testing, and dependency management.
