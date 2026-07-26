import re

with open('test.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the SVG span and add wrapper divs
# Match from </style> to <div data-custom-class="body">
pattern = r'(</style>)\s*<span[^>]*(?:data:image[^"]*)?[^>]*></span>\s*(<div data-custom-class="body">)'
replacement = r'\1\n    <!-- Content -->\n    <main class="flex-grow mx-auto w-full px-4 py-12">\n        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">\n            \2'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('test.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully!')
