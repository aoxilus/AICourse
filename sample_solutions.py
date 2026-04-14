# Sample Solutions for Python Learning Platform
# Use these to test the platform functionality

# Level 1: Print Master
print("Hello, Python World!")

# Level 2: Number Detective
user_input = input("Enter a number: ")
try:
    number = int(user_input)
    if number > 10:
        print("bigger than 10")
    else:
        print("less than 10")
except ValueError:
    print("hey this is not a number")

# Level 3: Loop Explorer
for i in range(1, 11):
    print(i)

# Level 4: List Builder
foods = ["Apple", "Pizza", "Pasta", "Burger", "Ice Cream"]
for i, food in enumerate(foods, 1):
    print(f"{i}. {food}")

# Level 5: Function Creator
def calculate_area(width, height):
    return width * height

area = calculate_area(5, 3)
print(f"The area is: {area}")

# Level 6: Dictionary Master
students = {"Alice": 95, "Bob": 87, "Charlie": 92}
for name, grade in students.items():
    print(f"{name}: {grade}")

# Level 7: File Handler
with open("message.txt", "w") as file:
    file.write("Python is awesome!")
print("File created successfully!")

with open("message.txt", "r") as file:
    content = file.read()
print(f"File contents: {content}")

# Level 8: Error Guardian
try:
    num1 = float(input("Enter first number: "))
    num2 = float(input("Enter second number: "))
    result = num1 / num2
    print(f"Result: {result}")
except ZeroDivisionError:
    print("Error: Cannot divide by zero!")

# Level 9: Class Architect
class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model
    
    def start_engine(self):
        print(f"{self.brand} {self.model} engine started!")

my_car = Car("Toyota", "Camry")
print(f"Car created: {my_car.brand} {my_car.model}")
my_car.start_engine()

# Level 10: Data Analyzer
numbers = [23, 45, 12, 67, 34, 89, 56]
print(f"Numbers: {numbers}")
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers)/len(numbers):.2f}")
print(f"Max: {max(numbers)}")
print(f"Min: {min(numbers)}")

# Level 11: Module Master
from datetime import datetime
now = datetime.now()
formatted_time = now.strftime("%Y-%m-%d %H:%M:%S")
print(f"Today is: {formatted_time}")

# Level 12: Project Champion
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

# Simulate user interaction
add_contact("John", "123-456-7890")
view_contacts()
