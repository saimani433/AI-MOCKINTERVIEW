import os
import time
import cv2
import numpy as np
import threading
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class SeleniumVideoRecorder(threading.Thread):
    """
    A helper thread that captures screenshots of the browser window 
    using Selenium and writes them to an MP4 video file in real time.
    """
    def __init__(self, driver, output_path="selenium_test_record.mp4", fps=5, size=(1280, 800)):
        super().__init__()
        self.driver = driver
        self.output_path = output_path
        self.fps = fps
        self.size = size
        self.running = False
        
        # Initialize OpenCV VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.out = cv2.VideoWriter(self.output_path, fourcc, self.fps, self.size)

    def run(self):
        self.running = True
        interval = 1.0 / self.fps
        print(f"[Recorder] Video recording started: {self.output_path}")
        
        while self.running:
            start_time = time.time()
            try:
                # Capture screenshot as binary data
                png_data = self.driver.get_screenshot_as_png()
                
                # Decode PNG data using OpenCV
                nparr = np.frombuffer(png_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is not None:
                    # Resize to match VideoWriter configuration
                    resized_img = cv2.resize(img, self.size)
                    # Write frame to video
                    self.out.write(resized_img)
            except Exception as e:
                # Driver might be closed or transitioning
                pass
            
            # Control frame rate
            elapsed = time.time() - start_time
            sleep_time = max(0, interval - elapsed)
            time.sleep(sleep_time)
            
    def stop(self):
        self.running = False
        self.join()
        self.out.release()
        print(f"[Recorder] Video recording stopped and saved to: {self.output_path}")

import pytest

@pytest.fixture
def driver():
    # Chrome options setup
    chrome_options = Options()
    # You can enable headless mode for CI/CD environments
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1280,800")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    
    # Initialize the Chrome webdriver
    print("Initializing Chrome Webdriver...")
    driver = webdriver.Chrome(options=chrome_options)
    driver.set_window_size(1280, 800)
    yield driver
    driver.quit()
    print("WebDriver session finished.")

def test_voca_vision_web(driver):
    # Create and start the live video recorder
    output_video_path = os.path.abspath("selenium_test_record.mp4")
    recorder = SeleniumVideoRecorder(driver, output_path=output_video_path, fps=5, size=(1280, 800))
    
    # Navigate to local web app (Vite default or local host)
    target_url = "http://localhost:5188"
    print(f"Navigating to web app: {target_url}")
    driver.get(target_url)
    
    # Start recording after navigating to target URL
    recorder.start()
    
    # Allow page to load
    time.sleep(3)
    
    try:
        # --- UI Interaction Steps & Assertions ---
        print("Finding elements and interacting...")
        
        # Assert page title or verify main landing header
        body = WebDriverWait(driver, 10).until(
            EC.presence_of_element_id("root")
        )
        assert body is not None, "Failed to load the web application root element."
        print("Page root loaded successfully.")
        
        # Capture screenshot for instant visual check
        driver.save_screenshot("landing_page_screenshot.png")
        print("Saved screenshot to landing_page_screenshot.png")
        
        # Find buttons on landing page
        buttons = driver.find_elements(By.TAG_NAME, "button")
        assert len(buttons) > 0, "No buttons found on the landing page."
        
        print(f"Found {len(buttons)} buttons. Hovering/clicking first button: {buttons[0].text}")
        buttons[0].click()
        time.sleep(2)
            
        time.sleep(3) # Wait to capture final actions in video

    finally:
        # Stop recording
        recorder.stop()
        assert os.path.exists(output_video_path), "Failed to save the Selenium video record."

