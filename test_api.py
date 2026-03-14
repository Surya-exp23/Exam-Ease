import json
import urllib.request
import urllib.parse

url = 'http://localhost:5000/api/generate'

text = """Institute of Technology
Midterm Exam
Max Marks: 100

1. What is Python? (5 marks)
It is a language.
2) Explain duck typing. [10]
a) what is it?
b) why use it?

Q3. What is a decorator? 5 marks
"""

data = json.dumps({'text': text}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        result = response.read()
        print(json.dumps(json.loads(result), indent=2))
except Exception as e:
    print(e)
