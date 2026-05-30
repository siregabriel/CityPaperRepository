#!/bin/bash

# Generate env-config.js with actual environment variables
cat > env-config.js << EOF
window.ENV = {
  FIREBASE_API_KEY: '${VITE_FIREBASE_API_KEY}',
  FIREBASE_AUTH_DOMAIN: '${VITE_FIREBASE_AUTH_DOMAIN}',
  FIREBASE_PROJECT_ID: '${VITE_FIREBASE_PROJECT_ID}',
  FIREBASE_STORAGE_BUCKET: '${VITE_FIREBASE_STORAGE_BUCKET}',
  FIREBASE_MESSAGING_SENDER_ID: '${VITE_FIREBASE_MESSAGING_SENDER_ID}',
  FIREBASE_APP_ID: '${VITE_FIREBASE_APP_ID}'
};
EOF

echo "Environment configuration generated successfully!"
