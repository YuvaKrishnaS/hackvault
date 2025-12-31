# Security Policy for HackVault

## Overview

HackVault is a zero-knowledge password manager built as part of the Hack Club YSWS (Youths Studying Web Security) initiative. While we are a student-led project, we take security seriously and implement real, battle-tested cryptographic standards used by enterprises and security professionals worldwide.

This document outlines our security practices, how to report vulnerabilities, and the technical foundations that protect user data.

---

## Our Commitment

HackVault is designed with the principle that **your passwords are your business, not ours**. We achieve this through client-side encryption that ensures we cannot access your vault even if we wanted to. Your master password never leaves your device, and your encrypted credentials are stored locally using modern web standards.

We are transparent about what we are: a student-built open-source project. We are not a funded startup with a security team, but we use the same cryptographic primitives that protect banking systems, government communications, and military infrastructure. The difference is not in the strength of our encryption—it's in the scope of our operations and the transparency of our code.

---

## Vulnerability Reporting

We believe in coordinated, responsible disclosure. How you report a vulnerability depends on its severity and impact.

### Non-Critical Issues

For bugs that don't pose an immediate security threat (such as UI flaws, minor bugs, or questions about implementation), please open a **public GitHub Issue** on our repository at [github.com/yuvakrishnas/hackvault](https://github.com/yuvakrishnas/hackvault/issues). Examples include:

- Unexpected behavior in the password generator
- Documentation inconsistencies
- Minor edge cases in the autofill logic
- Performance issues
- Accessibility improvements

Public issues help us improve transparently and allow the community to understand our development process.

### Critical Security Vulnerabilities

If you discover a vulnerability that could directly compromise user data or encryption—such as a cryptographic implementation flaw, key derivation weakness, or critical Web Crypto API misuse—**please do not open a public issue**. Instead, email us at **security@hackvault.app** with the following information:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Proof of concept code (if applicable)
- The potential impact on users
- Your name and affiliation (optional, but appreciated)

We will respond within **48 hours** of receipt and work with you to understand, verify, and patch the issue. We ask that you give us **30 days** to release a fix before publicly disclosing the vulnerability, unless there is evidence of active exploitation.

### Our Response Process

Upon receiving a critical report, we will:

1. Acknowledge receipt and assign a severity rating
2. Investigate the vulnerability in a private branch
3. Develop and test a fix
4. Release a patched version with a security advisory
5. Credit the researcher publicly (with permission)

We take all reports seriously, regardless of the reporter's experience level. If you're unsure whether something is critical, err on the side of caution and email us directly—we'd rather receive extra reports than miss a real issue.

---

## Technical Security Specifications

Understanding how HackVault protects your data requires understanding the cryptographic building blocks we use. Below is a breakdown of the core specifications.

### Master Password Key Derivation

When you set up HackVault, you create a master password. This password is **never stored** on your device or our servers. Instead, we derive a strong cryptographic key from it using PBKDF2 (Password-Based Key Derivation Function 2).

**Specifications:**
- **Algorithm**: PBKDF2-SHA256
- **Iterations**: 100,000 (slows down brute-force attacks by 100,000x)
- **Salt**: Cryptographically random 16 bytes, generated using `crypto.getRandomValues()`
- **Output length**: 256 bits (32 bytes)
- **Formula**: `key = PBKDF2(password, salt, 100000 iterations, SHA256) → 256-bit key`

This means an attacker would need to run 100,000 SHA-256 computations for every password guess. At 1 billion guesses per second (an unrealistic speed), cracking a weak 6-character password would take approximately 27 minutes, and a strong 12-character passphrase would take longer than the universe has existed.

### Encryption: AES-256-GCM

Every credential, note, and secret stored in your vault is encrypted using **AES (Advanced Encryption Standard) in GCM (Galois/Counter Mode)** with a 256-bit key.

**Why AES-256-GCM?**
AES-256 is the standard used by the U.S. government for protecting classified information up to TOP SECRET level. GCM mode provides two critical guarantees: confidentiality (no one can read your data without the key) and authenticity (no one can tamper with your data without detection).

**Specifications:**
- **Algorithm**: AES-256-GCM
- **Key size**: 256 bits (derived from master password via PBKDF2)
- **Nonce (IV)**: 96-bit random value, generated fresh for every encryption using `crypto.getRandomValues()`
- **Authentication tag**: 128 bits (16 bytes), automatically generated and verified
- **Implementation**: Web Crypto API (`SubtleCrypto.encrypt()` and `SubtleCrypto.decrypt()`)

**The GCM Advantage:**
In GCM mode, a random nonce is combined with your key to create a unique encryption stream for each credential. This means:
- Even if two passwords are identical, they encrypt to completely different ciphertexts
- If an attacker modifies even a single bit of encrypted data, the authentication check fails and decryption is rejected
- The browser's Web Crypto API handles all the low-level operations in secure, audited code (not in JavaScript)

### Encryption in Practice

When you store a password, here's what happens:

```
Plaintext credential (e.g., "MySecurePassword123!") 
    + Master key (256-bit, derived from PBKDF2)
    + Random nonce (96-bit, new for every encryption)
         ↓
    AES-256-GCM encryption
         ↓
Ciphertext + Authentication tag (stored in IndexedDB)
```

When you retrieve it:

```
Ciphertext + Authentication tag
    + Master key (kept in memory during session)
    + Original nonce (stored alongside ciphertext)
         ↓
    AES-256-GCM decryption
    (authentication tag verified)
         ↓
Plaintext credential (briefly in memory, then cleared)
```

### Random Number Generation

Cryptography depends absolutely on unpredictable randomness. We use the Web Crypto API's `crypto.getRandomValues()` for all nonce and salt generation, which is cryptographically secure.

**Specifications:**
- **Source**: `window.crypto.getRandomValues()`
- **Entropy source**: Operating system entropy pool (managed by the browser)
- **Size for salts**: 16 bytes (128 bits)
- **Size for nonces**: 12 bytes (96 bits)

The security of AES-256-GCM depends critically on never reusing the same nonce with the same key. Our implementation generates a fresh random nonce for every encryption, making this attack vector impossible.

### Memory Management

A critical part of security is preventing sensitive data from lingering in memory where it could be extracted by malware or memory dumps.

**Our practices:**
- Master password is never stored to disk or persistent storage
- Decrypted credentials are held in memory only during active use (form autofill, copy-to-clipboard)
- After operations complete, we zero-out sensitive variables where possible
- Web Crypto API operations happen in browser-protected memory (C++/WebAssembly implementation), not in JavaScript

**Limitation:** JavaScript does not provide perfect memory clearing (garbage collection is non-deterministic), so we acknowledge that a determined attacker with access to a memory dump *could* potentially recover recently-decrypted credentials. For protection against this, use full-disk encryption on your device and keep your OS updated.

---

## What We Protect

HackVault's security model protects against the following threats:

**Server Compromise**: If our servers were hacked and all data stolen, attackers would find only encrypted blobs. Without your master password, these are mathematically impossible to decrypt.

**Network Eavesdropping**: All data transmission uses HTTPS. Even if someone intercepts your connection, they receive only ciphertext.

**Unauthorized Access**: Only your device can decrypt your vault. We provide no "forgot password" recovery because recovery means weakening security—we chose security instead.

**Brute-Force Attacks**: The 100,000 iterations of PBKDF2 make each password guess computationally expensive, protecting weak passwords to a reasonable degree.

---

## What We Don't Protect Against

Some threats are outside the scope of HackVault's design:

**Malware on Your Device**: If malware is running on your computer, it can read your screen, intercept your keyboard, or memory-dump your decrypted vault. HackVault cannot defend against a compromised operating system.

**Phishing Attacks**: If you enter your master password into a fake website, HackVault cannot help. Always verify you're on the correct domain before authenticating.

**Weak Master Passwords**: If your master password is "password123", no amount of encryption will save you. Use passphrases with entropy.

**Browser Extension Vulnerabilities**: A malicious or compromised browser extension can read and modify page content, including what HackVault displays. Keep your extensions trusted and minimal.

**Side-Channel Attacks**: Sophisticated attackers might exploit timing differences or power consumption to extract keys. This requires specialized hardware and physical access, which is outside our threat model.

---

## Audit and Transparency

HackVault is open-source. Every line of code is available for inspection at [github.com/yuvakrishnas/hackvault](https://github.com/yuvakrishnas/hackvault). This is our strongest security feature: the ability for anyone to audit our implementation.

We have not undergone a professional security audit by a third-party firm. We are students, not a funded company. However, we welcome security researchers to review our code and report issues through the process outlined above.

If you are a professional security firm interested in auditing HackVault for educational purposes, please reach out to security@hackvault.app.

---

## Responsible Disclosure Timeline

If you report a vulnerability, here's what to expect:

- **Day 1**: We acknowledge receipt of your report
- **Days 2-7**: We investigate, reproduce, and assess severity
- **Days 8-28**: We develop, test, and prepare a patch
- **Day 30**: Public disclosure and patch release (unless active exploitation is detected, in which case we may expedite)
- **Day 30+**: We credit you publicly in release notes and this document

If you need a longer embargo period due to complex circumstances, we're happy to discuss.

---

## Dependency Security

HackVault minimizes dependencies to reduce attack surface. Our core encryption uses only Web Crypto API (browser-native, no npm packages). Our UI depends on well-maintained libraries (Next.js, React) that we keep updated.

We use npm audit regularly and keep dependencies patched. Critical updates are prioritized.

---

## Feedback and Questions

If you have questions about our security practices, design decisions, or anything in this policy, please:

- **General questions**: Open a GitHub Discussion at [github.com/yuvakrishnas/hackvault/discussions](https://github.com/yuvakrishnas/hackvault/discussions)
- **Security-specific questions**: Email krishnathecodernaveen@gmail.com

We believe security through obscurity is weak security. We're happy to explain our choices in detail.

---

## Version History

- **v1.0** (Initial Release): Established initial security policy, PBKDF2 key derivation, AES-256-GCM encryption

---

**Last updated**: December 2024

For the latest version of this policy, visit [github.com/yuvakrishnas/hackvault](https://github.com/yuvakrishnas/hackvault/blob/main/SECURITY.md)