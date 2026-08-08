FROM eclipse-temurin:17-jdk

WORKDIR /app
COPY . .

RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw package -DskipTests

EXPOSE 8080
CMD ["java", "-jar", "target/healbit-0.0.1-SNAPSHOT.jar"]
