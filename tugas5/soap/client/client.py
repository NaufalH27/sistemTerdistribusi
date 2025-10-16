from zeep import Client

wsdl = 'http://localhost:8080/ws/resent?wsdl'
client = Client(wsdl=wsdl)

response = client.service.resent("Halo!")
print("response from server: " + response)