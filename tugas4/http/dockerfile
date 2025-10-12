FROM golang:1.25 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o tugas2

FROM alpine:3.18
WORKDIR /root

COPY --from=builder /app/tugas2 .

COPY --from=builder /app/html ./html

EXPOSE 8080
CMD ["./tugas2"]
