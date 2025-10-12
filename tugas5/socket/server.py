import socket
import time

HOST = '127.0.0.1'
PORT = 8080
message = "Hello Client"


def server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((HOST, PORT))
    server_socket.listen()
    print(f"Server listening: {HOST}:{PORT}...")

    conn, _ = server_socket.accept()
    while True:
        data = conn.recv(1024)
        if not data:
            break
        time.sleep(1)
        print(f"Server recv: {data.decode()}")
        time.sleep(1)
        conn.sendall(message.encode())
        print(f"Server sent: {message}")
    conn.close()
    server_socket.close()

if __name__ == "__main__":
    server()
