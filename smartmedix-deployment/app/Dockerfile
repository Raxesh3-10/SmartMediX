# FROM eclipse-temurin:21-jdk-jammy
# # Install curl for Docker healthchecks
# RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# WORKDIR /app
# COPY eHealth-0.0.1-SNAPSHOT.jar app.jar
# ENTRYPOINT ["java","-jar","app.jar"]


# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /build
COPY backend/eHealth /build
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY --from=builder /build/target/eHealth-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]