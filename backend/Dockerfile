# ─── Stage 1: Build ───────────────────────────────────────
FROM public.ecr.aws/docker/library/maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Runtime ─────────────────────────────────────
FROM public.ecr.aws/docker/library/eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S maverickbank && adduser -S maverickbank -G maverickbank
COPY --from=builder /app/target/*.jar app.jar
RUN mkdir -p /var/log/maverick-bank && chown -R maverickbank:maverickbank /var/log/maverick-bank
USER maverickbank
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/actuator/health | grep '"status":"UP"' || exit 1
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
