# 🧪 Testing Guide

Complete testing checklist for the Python Learning Platform.

## 🚀 Pre-Testing Setup

### 1. Prerequisites Check
```bash
# Check Python
python3 --version  # Should be 3.x

# Check Node.js
node --version     # Should be 14+

# Check npm
npm --version
```

### 2. Install & Start
```bash
npm install
npm start
```

**Expected Output:**
```
🐍 Python Learning Platform running on http://localhost:3000
✅ OpenAI integration enabled!  (if API key configured)
🚀 Ready to teach Python!
```

## ✅ Core Functionality Tests

### Test 1: Basic Server
- [ ] Open http://localhost:3000
- [ ] See "🐍 Python Learning Platform" title
- [ ] See 12 level cards
- [ ] Level 1 unlocked, others locked

### Test 2: Level Selection
- [ ] Click Level 1 "🥉 Print Master"
- [ ] Instructions panel loads
- [ ] Code editor appears with starter code
- [ ] Terminal output visible
- [ ] Back button works

### Test 3: Code Execution
**Level 1 Test:**
```python
print("Hello, Python World!")
```
- [ ] Click "▶️ Run Code"
- [ ] Terminal shows: "Hello, Python World!"
- [ ] No errors

### Test 4: Code Validation
- [ ] Click "✅ Submit"
- [ ] Success modal appears
- [ ] Medal displayed (🥉)
- [ ] Level marked complete
- [ ] Level 2 unlocks

### Test 5: Progress Tracking
- [ ] Complete Level 1
- [ ] Close browser
- [ ] Reopen http://localhost:3000
- [ ] Level 1 still shows as completed
- [ ] Progress shows 1/12

## 🔒 Security Tests

### Test 6: Infinite Loop Protection
**Try this code:**
```python
while True:
    print("infinite")
```
- [ ] Code rejected or times out
- [ ] Error message appears
- [ ] Server doesn't hang

### Test 7: Dangerous Imports
**Try this code:**
```python
import os
os.system("ls")
```
- [ ] Code rejected
- [ ] Error: "forbidden operations"
- [ ] No system access

### Test 8: Network Access
**Try this code:**
```python
import socket
s = socket.socket()
```
- [ ] Code rejected
- [ ] Error message shown
- [ ] No network access

## 🤖 AI Features Tests (If Enabled)

### Test 9: AI Status Check
- [ ] Look for "🤖 AI Powered" badge in navbar
- [ ] "🤖 AI Review" button visible in editor
- [ ] Console shows "🤖 AI features enabled!"

### Test 10: AI Code Review
**Write some code in Level 1:**
```python
print("Hello")
```
- [ ] Click "🤖 AI Review"
- [ ] Modal appears with AI analysis
- [ ] Response is relevant and educational
- [ ] Analysis mentions the code specifically

### Test 11: Smart Hints
- [ ] Select any level
- [ ] Click "💡 Hint"
- [ ] With AI: Get contextual hint
- [ ] Without AI: Get static hint
- [ ] Hint is helpful and doesn't give answer

### Test 12: AI Debug Help
**Write broken code:**
```python
print(undefined_variable)
```
- [ ] Click "▶️ Run Code"
- [ ] Error occurs
- [ ] Terminal shows Python error
- [ ] With AI: Shows debug explanation
- [ ] Explanation is clear and helpful

### Test 13: AI Validation Feedback
- [ ] Complete a level correctly
- [ ] Click "✅ Submit"
- [ ] With AI: See AI feedback in terminal
- [ ] Feedback is encouraging
- [ ] Suggestions are constructive

## 📚 All Levels Test

### Level 1: Print Master 🥉
**Solution:**
```python
print("Hello, Python World!")
```
- [ ] Passes validation
- [ ] Bronze medal awarded

### Level 2: Number Detective 🥉
**Solution:**
```python
user_input = input("Enter a number: ")
try:
    number = int(user_input)
    if number > 10:
        print("bigger than 10")
    else:
        print("less than 10")
except ValueError:
    print("hey this is not a number")
```
- [ ] Passes validation
- [ ] Bronze medal awarded

### Level 3: Loop Explorer 🥉
**Solution:**
```python
for i in range(1, 11):
    print(i)
```
- [ ] Passes validation
- [ ] Bronze medal awarded

### Level 4: List Builder 🥈
**Solution:**
```python
foods = ["Apple", "Pizza", "Pasta", "Burger", "Ice Cream"]
for i, food in enumerate(foods, 1):
    print(f"{i}. {food}")
```
- [ ] Passes validation
- [ ] Silver medal awarded

### Level 5: Function Creator 🥈
**Solution:**
```python
def calculate_area(width, height):
    return width * height

area = calculate_area(5, 3)
print(f"The area is: {area}")
```
- [ ] Passes validation
- [ ] Silver medal awarded

### Level 6: Dictionary Master 🥈
**Solution:**
```python
students = {"Alice": 95, "Bob": 87, "Charlie": 92}
for name, grade in students.items():
    print(f"{name}: {grade}")
```
- [ ] Passes validation
- [ ] Silver medal awarded

### Level 7: File Handler 🥇
**Solution:**
```python
with open("message.txt", "w") as file:
    file.write("Python is awesome!")
print("File created successfully!")

with open("message.txt", "r") as file:
    content = file.read()
print(f"File contents: {content}")
```
- [ ] Passes validation
- [ ] Gold medal awarded

### Level 8: Error Guardian 🥇
**Solution:**
```python
try:
    num1 = float(input("Enter first number: "))
    num2 = float(input("Enter second number: "))
    result = num1 / num2
    print(f"Result: {result}")
except ZeroDivisionError:
    print("Error: Cannot divide by zero!")
```
- [ ] Passes validation
- [ ] Gold medal awarded

### Level 9: Class Architect 🥇
**Solution:**
```python
class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model
    
    def start_engine(self):
        print(f"{self.brand} {self.model} engine started!")

my_car = Car("Toyota", "Camry")
print(f"Car created: {my_car.brand} {my_car.model}")
my_car.start_engine()
```
- [ ] Passes validation
- [ ] Gold medal awarded

### Level 10: Data Analyzer 🏆
**Solution:**
```python
numbers = [23, 45, 12, 67, 34, 89, 56]
print(f"Numbers: {numbers}")
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers)/len(numbers):.2f}")
print(f"Max: {max(numbers)}")
print(f"Min: {min(numbers)}")
```
- [ ] Passes validation
- [ ] Trophy awarded

### Level 11: Module Master 🏆
**Solution:**
```python
from datetime import datetime
now = datetime.now()
formatted_time = now.strftime("%Y-%m-%d %H:%M:%S")
print(f"Today is: {formatted_time}")
```
- [ ] Passes validation
- [ ] Trophy awarded

### Level 12: Project Champion 🏆
**Solution:**
```python
contacts = []

def add_contact(name, phone):
    contacts.append({"name": name, "phone": phone})
    print("Contact added!")

def view_contacts():
    print("Contacts:")
    for i, contact in enumerate(contacts, 1):
        print(f"{i}. {contact['name']} - {contact['phone']}")

print("Contact Book")
print("1. Add Contact")
print("2. View Contacts")

add_contact("John", "123-456-7890")
view_contacts()
```
- [ ] Passes validation
- [ ] Trophy awarded
- [ ] All 12 levels complete!

## 🎨 UI/UX Tests

### Test 14: Responsive Design
- [ ] Test on desktop (1920px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] All elements readable
- [ ] No horizontal scroll

### Test 15: Visual Feedback
- [ ] Hover effects on level cards
- [ ] Completed levels have green border
- [ ] Locked levels are grayed out
- [ ] Progress ring updates correctly
- [ ] Medals display properly

### Test 16: Code Editor
- [ ] Syntax highlighting works (via Prism)
- [ ] Tab key works
- [ ] Line breaks preserved
- [ ] Can paste code
- [ ] Scrollable for long code

## 🌐 Browser Compatibility

### Test 17: Cross-Browser
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] All features work in each

## 💾 Data Persistence

### Test 18: LocalStorage
- [ ] Complete 3 levels
- [ ] Refresh page
- [ ] Progress retained
- [ ] Clear localStorage
- [ ] Progress resets

## 🔄 Server Tests

### Test 19: Multiple Executions
- [ ] Run code 10 times rapidly
- [ ] All execute successfully
- [ ] No crashes
- [ ] Temp files cleaned up

### Test 20: Error Handling
**Test with syntax error:**
```python
print("Hello
```
- [ ] Error message shown
- [ ] Server still running
- [ ] Can fix and retry

## 📊 Load Testing (Optional)

### Test 21: Concurrent Users
- [ ] Open 5 browser tabs
- [ ] Execute code in all simultaneously
- [ ] All complete successfully
- [ ] Server remains responsive

## ✅ Test Results Summary

**Date:** _______
**Tester:** _______
**Version:** _______

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Core Functionality | 5 | _ | _ | |
| Security | 3 | _ | _ | |
| AI Features | 5 | _ | _ | |
| All Levels | 12 | _ | _ | |
| UI/UX | 3 | _ | _ | |
| Browser Compat | 1 | _ | _ | |
| Data Persistence | 1 | _ | _ | |
| Server | 2 | _ | _ | |
| **TOTAL** | **32** | **_** | **_** | |

## 🐛 Bug Report Template

If you find issues:

**Bug Title:** _______

**Severity:** [ ] Critical [ ] High [ ] Medium [ ] Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:** _______

**Actual Result:** _______

**Environment:**
- OS: _______
- Browser: _______
- Node.js: _______
- Python: _______

**Screenshots/Logs:**
```
(paste here)
```

---

**Testing Complete!** 🎉

If all tests pass, the platform is production-ready!
