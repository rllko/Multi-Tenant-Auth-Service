FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY ./publish .

ENTRYPOINT ["dotnet", "./publish/Server.dll"]
