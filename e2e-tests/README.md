# VocaVision AI - Appium Android E2E Testing & GitHub Pages Report Hosting

Automated End-to-End (E2E) testing framework for VocaVision AI Native Android Application built with Appium, Pytest, Python, and OpenPyXL. Includes automatic HTML/Excel report generation and GitHub Pages hosting.

## Folder Structure

```
e2e-tests/
├── appium-tests/
│   ├── appium_mobile_test.py          # Pytest Appium test cases
│   └── run_appium_comprehensive.py     # Orchestrator runner script
├── generate_exact_reports.py          # Report engine (Excel, HTML, Logs, Screenshots)
├── requirements.txt                   # Python dependencies
└── Test Results/                      # Locally generated test outputs
    ├── Excel/
    │   └── Automation_Test_Report.xlsx
    ├── HTML/
    │   └── execution-report.html
    ├── Logs/
    │   └── execution.log
    ├── Screenshots/
    └── Summary/
        └── summary.md
```

## GitHub Pages Live Report URL

When pushed to GitHub, the Actions pipeline automatically deploys the HTML reports to GitHub Pages:

- **Live HTML Report**: [https://saimani433.github.io/AI-MOCKINTERVIEW/reports/latest/execution-report.html](https://saimani433.github.io/AI-MOCKINTERVIEW/reports/latest/execution-report.html)

## Local Setup & Execution

### 1. Install Dependencies
```bash
pip install -r e2e-tests/requirements.txt
npm install -g appium
```

### 2. Generate Reports Locally
```bash
python e2e-tests/generate_exact_reports.py
```
