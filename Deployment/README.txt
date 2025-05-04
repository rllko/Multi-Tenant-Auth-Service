Welcome to Authio

Thank you for downloading Authio — a multi-tenant SaaS platform for secure license and session management.

Deployment Instructions:

1. Build the ASP.NET Core project using your preferred IDE or command line.
2. Copy the build output folder (e.g., bin/Release/net10.0/publish) into this directory.
3. Place the 'website' folder (containing static files or UI components) into this directory as well.
4. (Optional) Configure NGINX with a Cloudflare SSL certificate.
   - If you're unsure how to do this, here's a helpful tutorial: https://www.youtube.com/watch?v=wPKmW34zUYU
5. Run the following command to start the service:

   docker compose up

6. Once running, visit the domain associated with your SSL certificate to access the Authio platform.

Note:
	- The environment variables are found on the docker compose file,please avoid using default credentials in production environments.
