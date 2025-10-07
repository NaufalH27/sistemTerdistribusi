package main

import (
    "context"
    "io/ioutil"
    "log"
    "net"

    pb "github.com/NaufalH27/tugas5/fileserverpb"

    "google.golang.org/grpc"
)

type server struct {
    pb.UnimplementedFileServiceServer
}

func (s *server) GetFile(ctx context.Context, req *pb.FileRequest) (*pb.FileResponse, error) {
    var filepath string

    switch req.Filename {
    case "home":
        filepath = "./html/home.html"
    case "10kb":
        filepath = "./html/10kb.html"
    case "100kb":
        filepath = "./html/100kb.html"
    case "1024kb":
        filepath = "./html/1024kb.html"
    case "5120kb":
        filepath = "./html/5120kb.html"
    case "10240kb":
        filepath = "./html/10240kb.html"
    default:
        return nil, grpc.Errorf(404, "File not found")
    }

    content, err := ioutil.ReadFile(filepath)
    if err != nil {
        return nil, grpc.Errorf(500, "Failed to read file: %v", err)
    }

    return &pb.FileResponse{Content: content}, nil
}

func main() {
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }

    s := grpc.NewServer()
    pb.RegisterFileServiceServer(s, &server{})

    log.Println("gRPC server running on port 50051...")
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}