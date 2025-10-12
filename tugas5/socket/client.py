import socket
import time

HOST = '127.0.0.1'
PORT = 8080
message = "Hello Server"

def client():
    time.sleep(2)
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((HOST, PORT))
    print(f"client connected to {HOST}:{PORT}")
    time.sleep(1)
    client_socket.sendall(message.encode())
    print(f"client sent: {message}")
    data = client_socket.recv(1024)
    time.sleep(1)
    print(f"client recv: {data.decode()}")
    client_socket.close()

if __name__ == "__main__":
    client()