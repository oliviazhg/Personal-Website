import re

# Read the file
with open('projects.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find project blocks
projects = {}
current_project = []
in_project = False
project_title = None

for i, line in enumerate(lines):
    if '<!-- Project' in line:
        if current_project:
            projects[project_title] = ''.join(current_project)
        current_project = [line]
        in_project = True
    elif in_project:
        current_project.append(line)
        if '<h3 class="project-title">' in line:
            match = re.search(r'<h3 class="project-title">(.*?)</h3>', line)
            if match:
                project_title = match.group(1).strip()
        if line.strip() == '</div>' and i + 1 < len(lines) and (lines[i+1].strip() == '' or '<!-- Project' in lines[i+1] or '</div>' in lines[i+1]):
            # End of project card
            current_project.append('\n')
            projects[project_title] = ''.join(current_project)
            current_project = []
            in_project = False
            project_title = None

# Define new order (without PDF portfolio)
order = [
    'somatic bloom',
    'supernumerary finger',
    'sonophoresis',
    'neurosurgery robot r&d',
    'single-print prosthetic finger',
    'prosthetic finger joint optimization',
    'llc resonant converter',
    'pill-e',
    'prism',
    'mind garden',
    'body armour'
]

# Find where gallery-grid starts and ends
gallery_start = None
gallery_end = None
for i, line in enumerate(lines):
    if '<div class="gallery-grid">' in line:
        gallery_start = i + 1  # Start after this line
    if gallery_start and '</div>\n' == line and '</div>\n' == lines[i+1] and '</section>' in lines[i+2]:
        gallery_end = i
        break

if not gallery_start or not gallery_end:
    print("Could not find gallery structure")
    exit(1)

# Rebuild the file
new_lines = lines[:gallery_start]
new_lines.append('\n')

# Add projects in new order
for idx, title in enumerate(order, 1):
    if title in projects:
        # Update project number in comment
        project_block = projects[title]
        project_block = re.sub(r'<!-- Project \d+.*?-->', f'        <!-- Project {idx} -->', project_block)
        new_lines.append(project_block)
    else:
        print(f"Warning: Could not find project '{title}'")

# Add closing tags
new_lines.extend(lines[gallery_end:])

# Write back
with open('projects.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Successfully reorganized {len(order)} projects!")
for i, title in enumerate(order, 1):
    print(f"  {i}. {title}")
