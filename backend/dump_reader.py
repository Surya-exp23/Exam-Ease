with open('dump.txt', 'r', encoding='utf-16le') as f:
    text = f.read()
with open('dump_out.txt', 'w', encoding='utf-8') as f:
    f.write(text)
