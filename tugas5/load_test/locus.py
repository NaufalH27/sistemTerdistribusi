from locust import User, task, between
import grpc
import time
import fileserverpb.fileserver_pb2 as pb
import fileserverpb.fileserver_pb2_grpc as pb_grpc


class GrpcUser(User):
    wait_time = between(0.1, 2)
    request_timeout = 10 

    def on_start(self):
        target = self.environment.host
        if not target:
            raise ValueError("Specify gRPC host using --host")

        if "443" in target or "https" in target:
            creds = grpc.ssl_channel_credentials()
            self.channel = grpc.secure_channel(target, creds, options=[
                ('grpc.max_receive_message_length', 20 * 1024 * 1024),
                ('grpc.max_send_message_length', 20 * 1024 * 1024),
            ])
        else:
            self.channel = grpc.insecure_channel(target, options=[
                ('grpc.max_receive_message_length', 20 * 1024 * 1024),
                ('grpc.max_send_message_length', 20 * 1024 * 1024),
            ])

        self.stub = pb_grpc.FileServiceStub(self.channel)


    def _do_request(self, name, filename):
        start_time = time.time()
        try:
            response = self.stub.GetFile(pb.FileRequest(filename=filename), timeout=self.request_timeout)
            total_time = int((time.time() - start_time) * 1000)
            self.environment.events.request.fire(
                request_type="gRPC",
                name=name,
                response_time=total_time,
                response_length=len(response.content),
                exception=None,
            )
        except Exception as e:
            total_time = int((time.time() - start_time) * 1000)
            self.environment.events.request.fire(
                request_type="gRPC",
                name=name,
                response_time=total_time,
                response_length=0,
                exception=e,
            )

    @task(5)
    def load_home(self):
        self._do_request("GetFile:home", "home")

    @task(5)
    def load_10kb(self):
        self._do_request("GetFile:10kb", "10kb")

    @task(5)
    def load_100kb(self):
        self._do_request("GetFile:100kb", "100kb")

    @task(5)
    def load_1mb(self):
        self._do_request("GetFile:1024kb", "1024kb")

    @task(5)
    def load_5mb(self):
        self._do_request("GetFile:5120kb", "5120kb")

    @task(5)
    def load_10mb(self):
        self._do_request("GetFile:10240kb", "10240kb")
