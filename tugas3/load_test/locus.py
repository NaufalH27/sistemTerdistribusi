from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(0.1, 2)

    def on_start(self):
        self.request_timeout = 10 

    @task(5)
    def load_home(self):
        self.client.get("/", timeout=self.request_timeout)

    @task(5)
    def load_10kb(self):
        self.client.get("/sepuluhkb", timeout=self.request_timeout)

    @task(5)
    def load_100kb(self):
        self.client.get("/seratuskb", timeout=self.request_timeout)

    @task(5)
    def load_1mb(self):
        self.client.get("/satumb", timeout=self.request_timeout)

    @task(5)
    def load_5mb(self):
        self.client.get("/limamb", timeout=self.request_timeout)

    @task(5)
    def load_10mb(self):
        self.client.get("/sepuluhmb", timeout=self.request_timeout)
