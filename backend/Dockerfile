# Stage 1: Build the application
FROM gradle:8.5-jdk17 AS build
WORKDIR /app
# Copy all files from the backend directory into the container
COPY . .
# Make gradlew executable and build the JAR
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the built JAR from the build stage
COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar
# Expose the default Spring Boot port
EXPOSE 8080
# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]