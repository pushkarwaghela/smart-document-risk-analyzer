<div align="center">

# 📄 Smart Document Risk Analyzer

### NLP-Based Sensitive Data Detection

Detects and classifies sensitive information in documents using OCR and BERT.

🥉 **3rd Prize**, TE Mini Project Exhibition

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![BERT](https://img.shields.io/badge/BERT-NLP-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tesseract](https://img.shields.io/badge/Tesseract-OCR-4285F4?style=for-the-badge)

[🌐 Live Demo](YOUR_LIVE_LINK) · [🐞 Report Bug](../../issues)

</div>

---

## 📌 Overview

Documents often contain sensitive data (IDs, personal details, financial info) that can leak by accident. **Smart Document Risk Analyzer** reads scanned and digital documents, extracts text with OCR, and uses a BERT-based NLP pipeline to find and classify sensitive information, then reports the document's risk.

## ✨ Features

- 🖼️ **OCR extraction** from scanned documents and images (Tesseract)
- 🧠 **BERT-based NLP** to detect and classify sensitive entities
- 📚 Tested across **100+ documents**
- 🏷️ Entity annotation and output-evaluation loops, similar to professional data-labeling workflows
- 🖥️ React frontend to upload documents and view results

## 🏗️ Pipeline

```
Upload ─► OCR (Tesseract) ─► Text Cleaning ─► BERT Entity Detection ─► Classification ─► Risk Report
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend / NLP | Python, BERT |
| OCR | Tesseract |

## 🚀 Getting Started

```bash
git clone https://github.com/pushkarwaghela/smart-document-risk-analyzer.git
cd smart-document-risk-analyzer

# Install Tesseract OCR first: https://github.com/tesseract-ocr/tesseract
pip install -r requirements.txt
python app.py

# Frontend
cd frontend && npm install && npm start
```

> Adjust commands to match this repo.

## 🗺️ Roadmap

- [ ] Support more document types and languages
- [ ] Redaction of detected sensitive data
- [ ] Accuracy and evaluation metrics

## 👤 Author

**Pushkar Waghela** · [LinkedIn](https://linkedin.com/in/pushkar-waghela) · [Portfolio](https://pushkarwaghela.netlify.app)
