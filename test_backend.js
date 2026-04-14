const q = `user_input = input("Enter a number: ")

try:
    value = float(user_input)

    if value > 10:
        print("bigger than 10")
    elif value < 10:
        print("less than 10")
    else:
        print("The value is exactly 10")

except ValueError:
    print("That is not a number.")`;

fetch('http://localhost:3000/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: q,
        level: 2,
        submit: true
    })
})
.then(r => r.json())
.then(c => console.log(JSON.stringify(c, null, 2)))
.catch(err => console.error(err));
