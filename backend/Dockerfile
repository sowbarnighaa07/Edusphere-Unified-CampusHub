# Multi-stage Docker build for Spring Boot Backend on Render (512MB RAM free tier)
# Project requires Java 21 (as configured in pom.xml)
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
# Cache dependencies
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Minimal runtime image with Java 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN mkdir -p uploads

# JVM memory limit suited for 512MB container
ENV JAVA_OPTS="-Xms256m -Xmx384m -XX:+UseG1GC"
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --server.port=${PORT:-8080}"]
