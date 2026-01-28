#!/bin/bash
# Script to add credentials to all fetch calls in dashboard pages

# Find all TypeScript/TSX files with fetch calls
find app/dashboard app/\(dashboard\)/dashboard -name "*.tsx" -type f | while read file; do
  # Skip if file doesn't contain fetch calls
  if ! grep -q "fetch(" "$file"; then
    continue
  fi
  
  # Create a temporary file
  temp=$(mktemp)
  
  # Process the file line by line
  awk '
  BEGIN { in_fetch = 0; fetch_line = ""; brace_count = 0 }
  
  /fetch\([`'"'"'"]\/api/ {
    # Start of a fetch call
    in_fetch = 1
    fetch_line = $0
    brace_count = gsub(/{/, "", $0) - gsub(/}/, "", $0)
    
    # Check if it's a single-line fetch
    if (match($0, /fetch\([`'"'"'"]\/api[^`'"'"'"]*[`'"'"'"]\)/)) {
      # Single line fetch - need to check if credentials already exist
      if (!match($0, /credentials/)) {
        # Replace the closing paren with options
        gsub(/\)$/, ", { credentials: '\''include'\'', headers: { '\''Content-Type'\'': '\''application/json'\'' } })", $0)
      }
      print $0
      in_fetch = 0
    } else {
      # Multi-line fetch
      print $0
    }
    next
  }
  
  in_fetch {
    fetch_line = fetch_line "\n" $0
    brace_count += gsub(/{/, "", $0) - gsub(/}/, "", $0)
    
    # Check if we've closed all braces (end of fetch options)
    if (brace_count <= 0 && match($0, /\)/)) {
      # Check if credentials already exists
      if (!match(fetch_line, /credentials/)) {
        # Find the last closing brace and add credentials before it
        if (match($0, /^[^}]*}/)) {
          # Has closing brace on this line
          before_brace = substr($0, 1, RSTART + RLENGTH - 1)
          after_brace = substr($0, RSTART + RLENGTH)
          print before_brace
          print "        credentials: '\''include'\'',"
          print "        headers: {"
          print "          '\''Content-Type'\'': '\''application/json'\'',"
          print "        },"
          print "      }" after_brace
        } else {
          print $0
        }
      } else {
        print $0
      }
      in_fetch = 0
      fetch_line = ""
      brace_count = 0
    } else {
      print $0
    }
    next
  }
  
  { print }
  ' "$file" > "$temp"
  
  # Only replace if file changed
  if ! cmp -s "$file" "$temp"; then
    mv "$temp" "$file"
    echo "Updated: $file"
  else
    rm "$temp"
  fi
done

echo "Done!"
