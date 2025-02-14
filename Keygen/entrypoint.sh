#!/bin/sh
# Create a random token if it doesn't already exist
if [ ! -f /secrets/symmetricKey ]; then
  dd if=/dev/urandom bs=48 count=1 2>/dev/null | base64 > /secrets/symmetricKey
  echo "token generated and stored in /secrets/symmetricKey"
else
  echo "token already exists in /secrets/symmetricKey"
fi

if [ ! -f /secrets/Chacha20 ]; then
  dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 > /secrets/Chacha20
  echo "token generated and stored in /secrets/Chacha20"
else
  echo "token already exists in /secrets/Chacha20"
fi
 
