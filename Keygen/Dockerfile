# Dockerfile.keygen
FROM alpine:latest

# Copy the key generation script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the entrypoint and command
ENTRYPOINT ["/entrypoint.sh"]
