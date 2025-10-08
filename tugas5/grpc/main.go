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

var filesCache = map[string][]byte{}

func init() {
    filesCache[""] = mustRead("./html/home.html")
    filesCache["sepuluhkb"] = mustRead("./html/10kb.html")
    filesCache["seratuskb"] = mustRead("./html/100kb.html")
    filesCache["satumb"] = mustRead("./html/1024kb.html")
    filesCache["limamb"] = mustRead("./html/5120kb.html")
    filesCache["sepuluhmb"] = mustRead("./html/10240kb.html")
}

func mustRead(path string) []byte {
    data, err := ioutil.ReadFile(path)
    if err != nil {
        log.Fatalf("Failed to read %s: %v", path, err)
    }
    return data
}

func (s *server) GetFile(ctx context.Context, req *pb.FileRequest) (*pb.FileResponse, error) {
    content, ok := filesCache[req.Filename]
    if !ok {
        return nil, grpc.Errorf(404, "File not found")
    }
    return &pb.FileResponse{Content: content}, nil
}

func main() {
    lis, err := net.Listen("tcp4", "127.0.0.1:50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }

    s := grpc.NewServer()

    pb.RegisterFileServiceServer(s, &server{})

    log.Println("running on 127.0.0.1:50051...")
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}
