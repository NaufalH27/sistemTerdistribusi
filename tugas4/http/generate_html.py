import os

def generate_html(kb=0, mb=0, output_dir="./html"):
    total_kb = kb + (mb * 1024)
    target_size = total_kb * 1024  

    if target_size <= 0:
        raise ValueError("size cant be zero or negative")

    os.makedirs(output_dir, exist_ok=True)

    size_str = f"{total_kb}KB"
    content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HTML Size Test</title>
    <style>
        body {{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 2rem;
        }}
    </style>
</head>
<body>
    {size_str}
</body>
</html>
"""

    html_bytes = content.encode("utf-8")

    if len(html_bytes) < target_size:
        n = 100
        padding_size = target_size - len(html_bytes)
        x_count = padding_size - 10
        x_lines = "\n".join("X" * n for _ in range(x_count // n))
        if x_count % n:
            x_lines += "\n" + "X" * (x_count % n)
        padding = "<!--\n" + x_lines + "\n-->"

        content += padding

    filename = os.path.join(output_dir, f"{total_kb}kb.html")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

    actual_size = os.path.getsize(filename)
    print(f"Generated: bytes ≈ {actual_size/1024:.2f} KB)")

if __name__ == "__main__":
    generate_html(kb=10)
    generate_html(kb=100)
    generate_html(mb=1)
    generate_html(mb=5)
    generate_html(mb=10)
