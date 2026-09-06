import os
import re

directory = r'C:\Users\User\.gemini\antigravity\scratch\medvigil-ai\server'
paths = [
    os.path.join(directory, 'controllers'),
    os.path.join(directory, 'services'),
]

for p in paths:
    for filename in os.listdir(p):
        if filename.endswith('.js'):
            filepath = os.path.join(p, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace import
            content = re.sub(
                r"const \{ getDb \} = require\(['\"](.*?)config/database['\"]\);",
                r"const { prepareAndGet, prepareAndAll, runQuery } = require('\1config/database');",
                content
            )
            
            # Remove const db = getDb();
            content = re.sub(r"const\s+db\s*=\s*getDb\(\);\s*", "", content)
            
            # Replace db.prepare(sql).get(params)
            # We need to handle optional parameters
            def replace_get(m):
                sql = m.group(1)
                params = m.group(2).strip()
                if params:
                    return f"prepareAndGet({sql}, [{params}])"
                else:
                    return f"prepareAndGet({sql})"
                    
            content = re.sub(r"db\.prepare\((.*?)\)\.get\((.*?)\)", replace_get, content)
            
            def replace_all(m):
                sql = m.group(1)
                params = m.group(2).strip()
                if params:
                    return f"prepareAndAll({sql}, [{params}])"
                else:
                    return f"prepareAndAll({sql})"
                    
            content = re.sub(r"db\.prepare\((.*?)\)\.all\((.*?)\)", replace_all, content)
            
            def replace_run(m):
                sql = m.group(1)
                params = m.group(2).strip()
                if params:
                    return f"runQuery({sql}, [{params}])"
                else:
                    return f"runQuery({sql})"
                    
            content = re.sub(r"db\.prepare\((.*?)\)\.run\((.*?)\)", replace_run, content)
            
            # Write back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Replacement done for controllers and services.")
