import os
import time
import base64
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy

import pytest

@pytest.fixture
def mobile_driver():
    # 1. Setup options and capabilities
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.device_name = "Android Emulator" # Replace with your physical device name or emulator ID
    options.automation_name = "UiAutomator2"
    
    # Target package of the Capacitor application (from capacitor.config.ts)
    options.app_package = "com.vocavision.ai"
    options.app_activity = "com.vocavision.ai.MainActivity" # Default main activity for Capacitor
    
    # Optional: Automatically grant permissions (like microphone/camera for mock interviews)
    options.auto_grant_permissions = True
    
    print("Connecting to Appium Server...")
    # 2. Connect to the local Appium server
    appium_server_url = "http://127.0.0.1:4723"
    driver = webdriver.Remote(command_executor=appium_server_url, options=options)
    yield driver
    driver.quit()
    print("Appium session finished.")

def test_voca_vision_mobile(mobile_driver):
    driver = mobile_driver
    # 3. Start native screen recording on the Android Emulator/Device
    print("Starting video screen recording on emulator...")
    driver.start_recording_screen(
        video_type="mp4",
        time_limit="180", # Limit recording to 3 minutes
        video_quality="medium"
    )
    
    # Give the app a moment to load fully
    time.sleep(5)
    
    try:
        # 4. Perform UI test interactions
        print("Running UI test actions...")
        
        # In a hybrid Capacitor app, we can either:
        # A) Interact via WebViews context
        contexts = driver.contexts
        print(f"Available contexts: {contexts}")
        assert len(contexts) > 0, "No active app context found."
        
        if len(contexts) > 1:
            # Switch to WebView context to interact with React code easily
            webview_context = [c for c in contexts if "WEBVIEW" in c]
            if webview_context:
                driver.switch_to.context(webview_context[0])
                print(f"Switched to WebView context: {webview_context[0]}")
        
        # Example UI interaction: Click a button or check logo
        # Let's take a screenshot during execution
        driver.save_screenshot("mobile_test_step.png")
        print("Saved mobile screenshot to mobile_test_step.png")
        
        # Switch back to NATIVE_APP if we need to do native interactions
        driver.switch_to.context("NATIVE_APP")
            
        time.sleep(5) # Let the recording capture the final state

    finally:
        # 5. Stop screen recording and decode video bytes
        print("Stopping screen recording and saving video...")
        try:
            video_raw = driver.stop_recording_screen()
            
            # The returned video raw data is base64 encoded string
            video_bytes = base64.b64decode(video_raw)
            output_file = os.path.abspath("appium_test_record.mp4")
            
            with open(output_file, "wb") as f:
                f.write(video_bytes)
                
            print(f"Successfully saved Appium test video to: {output_file}")
            assert os.path.exists(output_file), "Failed to save the MP4 video record."
        except Exception as e:
            print(f"Failed to retrieve/save video recording: {e}")
            raise e
