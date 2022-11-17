from seleniumwire import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import time
import re
import json

web = 'https://es-la.facebook.com/login/?next=%2Fmarketplace%2F'
path = "/Users/dfval/Downloads/chromedriver"

chrome_options = Options()
chrome_options.add_argument("--disable-notifications")

driver = webdriver.Chrome(chrome_options=chrome_options)
driver.get(web)
driver.maximize_window()

# Login Username
time.sleep(2)
username = driver.find_element(By.XPATH, "//input[@autocomplete='username']")
username.send_keys("rponcefernanda@outlook.com")

# Login Password
time.sleep(3)
password = driver.find_element(By.XPATH, "//input[@autocomplete='current-password']")
password.send_keys("F3pR12345dABts")

# Login Click Button
login_button = driver.find_element(By.XPATH, "//button[@id='loginbutton']")
login_button.click()
time.sleep(10)


data_list = []

# Link de la categoria
with open('url (2).txt') as f:
    for line in f:
        fb_url = 'https://www.facebook.com/marketplace/category/'
        category = fb_url + str(line)
        print(category)
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[1])
        driver.get(category)
        html = driver.find_element(By.TAG_NAME, 'html')
        html.send_keys(Keys.ESCAPE)
        time.sleep(5)

        # Scrolling
        time.sleep(5)
        html = driver.find_element(By.TAG_NAME, 'html')
        html.send_keys(Keys.END)
        time.sleep(5)
        html = driver.find_element(By.TAG_NAME, 'html')
        html.send_keys(Keys.END)
        html = driver.find_element(By.TAG_NAME, 'html')
        html.send_keys(Keys.END)
        time.sleep(5)

        # Persistir esta data dividirlo por request (body, x-fb-lsd, referer, cookie)
        for request in driver.requests:
            if 'graphql/' in request.url and len(request.body) > 3000:
                body = re.findall("b'([^']*)'", str(request.body))
                cookie = re.findall('cookie: ([^\n]*)', str(request.headers))
                xfblsd = re.findall('x-fb-lsd: ([^\n]*)', str(request.headers))
                referer = re.findall('referer: ([^\n]*)', str(request.headers))
                print(xfblsd)
                data = {'body': body, 'cookie': cookie, 'xfblsd': xfblsd, 'referer': referer}
                data_list.append(data)
        print(data_list)

        with open('data.json', 'w') as fp:
            json.dump(data_list, fp)

        with open('data.json', 'r') as fp:
            data_list = json.load(fp)

    driver.quit()
