import os
import sys
import subprocess
import time

def run_appium_suite():
    print("====================================================")
    print("    STARTING COMPREHENSIVE APPIUM E2E EXECUTION     ")
    print("====================================================")
    
    # Run test suite
    test_script = os.path.join(os.path.dirname(__file__), "appium_mobile_test.py")
    cmd = [sys.executable, "-m", "unittest", test_script]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    print(result.stderr)
    
    # Generate reports
    report_gen = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "generate_exact_reports.py"))
    if os.path.exists(report_gen):
        print("\nInvoking Report Generation Engine...")
        subprocess.run([sys.executable, report_gen])
        
    print("\nAppium E2E Execution & Report Generation Completed.")

if __name__ == "__main__":
    run_appium_suite()
