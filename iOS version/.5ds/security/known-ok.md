# Accepted findings

The owner looked at each of these and decided it is fine. The safety check skips them. A line is added only on the owner's yes, by:
node .5ds/security/check.mjs accept <id> "why"

Each line is: rule | file | line fingerprint | why. When the line in the file changes, its fingerprint changes and the check looks at it again.

