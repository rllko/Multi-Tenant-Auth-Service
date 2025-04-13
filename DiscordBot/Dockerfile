FROM mcr.microsoft.com/dotnet/aspnet:10.0.0-preview.3-noble-amd64 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Discord Template.csproj", "./"]
RUN dotnet restore "Discord Template.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "Discord Template.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Discord Template.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Discord Template.dll"]
